// Provider abstraction layer. In test mode every provider is a deterministic
// in-process stub; in live mode (BRIDGE_VERIFICATION_MODE=live) each function
// would dispatch to a real KYC/email/SMS provider. Swap is one switch per fn.
//
// LIVE-MODE INTEGRATION TARGETS (when you're ready):
//   - Identity / phone OTP   → Twilio Verify
//   - Government ID + selfie → Checkr (or Persona / Stripe Identity)
//   - Professional email     → ZeroBounce or Mailgun + DNS MX/SPF check
//   - References             → SendGrid / Resend transactional email
//   - LinkedIn               → ProxyCurl or Iframely
//   - All of the above       → swap each `if (isLive()) throw` for a real call;
//                              return-shape stays identical so the orchestrator
//                              and the wizard need ZERO changes.
//
// Providers return { status, score, evaluation, payload } where:
//   status: 'pending' | 'passed' | 'failed' | 'manual_review'
//   score:  integer in [0, weight]
//   evaluation: optional structured rationale (jsonb)
//   payload:    test-mode breadcrumbs (otp code, magic link, etc.)
//
// The wizard hides real PII in payload via the RLS read-policy chain.

import { COMPONENT_WEIGHTS } from './scoring.js';

export function verificationMode() {
  return (process.env.BRIDGE_VERIFICATION_MODE || 'test').toLowerCase();
}

export function isLive() { return verificationMode() === 'live'; }
export function isOff()  { return verificationMode() === 'off';  }

// ─── Identity (phone OTP + email confirm) ────────────────────────────────────

const TEST_PHONE_PASS    = '+15555550100';
const TEST_PHONE_FAIL    = '+15555550101';
const TEST_PHONE_REVIEW  = '+15555550102';

/**
 * Issues an OTP. In test mode we generate a deterministic 6-digit code
 * derived from the phone number so the same inputs always produce the same
 * OTP — exactly like Stripe's test card numbers.
 */
export async function startIdentity({ phone, email }) {
  if (isLive()) {
    // DECISION: live mode wired in a later PR. We never reach here in test.
    throw new Error('Live identity provider not configured');
  }

  const otp = deterministicOtp(phone);
  const payload = {
    test_mode: true,
    phone,
    email,
    otp_code: otp,
    test_link: `bridge://identity-confirm?otp=${otp}&phone=${encodeURIComponent(phone)}`,
    issued_at: new Date().toISOString(),
  };
  return { status: 'pending', score: 0, payload };
}

/** Verifies an OTP. Returns step status + score + redacted payload. */
export async function confirmIdentity({ phone, email, otp, expectedOtp }) {
  if (isLive()) throw new Error('Live identity provider not configured');

  const w = COMPONENT_WEIGHTS.identity;

  // Stripe-style sentinel numbers
  if (phone === TEST_PHONE_PASS) {
    return ok({ score: w, payload: { phone, email, otp: '******', sentinel: 'pass' } });
  }
  if (phone === TEST_PHONE_FAIL) {
    return fail({ score: 0, payload: { phone, email, otp: '******', sentinel: 'fail' }, evaluation: { reason: 'Sentinel test number forces failure' } });
  }
  if (phone === TEST_PHONE_REVIEW) {
    return review({ score: Math.round(w / 2), payload: { phone, email, otp: '******', sentinel: 'review' }, evaluation: { reason: 'Sentinel test number forces manual review' } });
  }

  // Real-shaped number: code must match deterministic OTP we issued.
  if (otp && expectedOtp && String(otp) === String(expectedOtp)) {
    return ok({ score: w, payload: { phone, email, otp: '******' } });
  }
  return fail({ score: 0, payload: { phone, email }, evaluation: { reason: 'OTP mismatch' } });
}

function deterministicOtp(input) {
  // Sum char codes mod 1_000_000, zero-pad. Stable + readable in test logs.
  const s = String(input || 'default');
  let acc = 0;
  for (let i = 0; i < s.length; i++) acc = (acc * 31 + s.charCodeAt(i)) % 1_000_000;
  return acc.toString().padStart(6, '0');
}

// ─── Government ID + selfie ──────────────────────────────────────────────────

/**
 * Deterministic scoring by filename suffix per the test contract:
 *   *_pass.{pdf,jpg}   → max score, passed
 *   *_fail.{pdf,jpg}   → 0 + failed
 *   *_review.{pdf,jpg} → mid score + manual_review
 *   anything else      → real evaluation (in test mode we just pass at 80%)
 */
export async function evaluateGovId({ idFilename, selfieFilename, parsed }) {
  if (isLive()) throw new Error('Live ID provider not configured');
  const w = COMPONENT_WEIGHTS.gov_id;
  const s = decideBySuffix([idFilename, selfieFilename]);
  const payload = {
    test_mode: true,
    id_filename: idFilename,
    selfie_filename: selfieFilename,
    parsed: parsed || null,
  };
  if (s === 'pass')   return ok({ score: w, payload });
  if (s === 'fail')   return fail({ score: 0, payload, evaluation: { reason: 'Filename forces failure' } });
  if (s === 'review') return review({ score: Math.round(w / 2), payload, evaluation: { reason: 'Filename forces manual review' } });
  // Default test-mode pass at 80% headroom (12/15)
  return ok({ score: Math.round(w * 0.8), payload, evaluation: { reason: 'Default test-mode pass' } });
}

// ─── Professional email (work-email magic link) ──────────────────────────────

const PROFESSIONAL_DOMAIN_WHITELIST = new Set([
  'stripe-test.com', 'bridge-test.com',
]);

const FREEMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'aol.com', 'proton.me', 'protonmail.com',
]);

export async function startProfessionalEmail({ email }) {
  if (isLive()) throw new Error('Live email provider not configured');
  const token = randomToken();
  const payload = {
    test_mode: true,
    email,
    confirm_token: token,
    test_link: `/api/verification/professional-email-confirm?token=${token}`,
    issued_at: new Date().toISOString(),
  };
  return { status: 'pending', score: 0, payload };
}

export function evaluateProfessionalEmailDomain(email) {
  const w = COMPONENT_WEIGHTS.professional_email;
  const domain = String(email || '').toLowerCase().split('@')[1] || '';
  if (!domain) return fail({ score: 0, payload: { email }, evaluation: { reason: 'No domain' } });
  if (PROFESSIONAL_DOMAIN_WHITELIST.has(domain)) {
    return ok({ score: w, payload: { email, domain }, evaluation: { reason: 'Whitelisted test domain' } });
  }
  if (FREEMAIL_DOMAINS.has(domain)) {
    // In test mode we don't hard-fail free-mail — that would block manual
    // mentor-signup testing with random gmail addresses. Live mode (real
    // domain checks) will still penalize them appropriately.
    if (!isLive()) {
      return ok({
        score: Math.round(w * 0.5),
        payload: { email, domain, test_mode: true },
        evaluation: { reason: 'Free-mail domain (test-mode partial credit)' },
      });
    }
    return fail({ score: 0, payload: { email, domain }, evaluation: { reason: 'Free-mail domain' } });
  }
  // Custom domain → partial credit until live mode runs MX/SPF checks
  return ok({ score: Math.round(w * 0.7), payload: { email, domain }, evaluation: { reason: 'Custom domain (test-mode partial credit)' } });
}

// ─── References (test-mode auto-fill) ────────────────────────────────────────

const REF_PASS_RE   = /\+ref-pass@bridge\.dev$/i;
const REF_FAIL_RE   = /\+ref-fail@bridge\.dev$/i;
const REF_REVIEW_RE = /\+ref-review@bridge\.dev$/i;

export function autoSubmitTestReference(refEmail) {
  if (isLive()) return null;
  if (REF_PASS_RE.test(refEmail)) {
    return {
      rating: 5,
      comments: 'Outstanding mentor. Deeply technical and patient. I\'d hire them tomorrow.',
      ai_authenticity_score: 9,
      decision: 'passed',
    };
  }
  if (REF_FAIL_RE.test(refEmail)) {
    return {
      rating: 1,
      comments: 'Did not work out. Communication issues.',
      ai_authenticity_score: 7,
      decision: 'failed',
    };
  }
  if (REF_REVIEW_RE.test(refEmail)) {
    return {
      rating: 3,
      comments: 'Mixed experience.',
      ai_authenticity_score: 4,
      decision: 'manual_review',
    };
  }
  return null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decideBySuffix(filenames) {
  const all = filenames.filter(Boolean).join(' ').toLowerCase();
  if (/_pass\.(pdf|jpg|jpeg|png)/.test(all))   return 'pass';
  if (/_fail\.(pdf|jpg|jpeg|png)/.test(all))   return 'fail';
  if (/_review\.(pdf|jpg|jpeg|png)/.test(all)) return 'review';
  return null;
}

function randomToken() {
  return [...crypto.getRandomValues(new Uint8Array(24))]
    .map((b) => b.toString(16).padStart(2, '0')).join('');
}

function ok(o)     { return { status: 'passed',         score: o.score, payload: o.payload, evaluation: o.evaluation || null }; }
function fail(o)   { return { status: 'failed',         score: o.score, payload: o.payload, evaluation: o.evaluation || null }; }
function review(o) { return { status: 'manual_review',  score: o.score, payload: o.payload, evaluation: o.evaluation || null }; }
