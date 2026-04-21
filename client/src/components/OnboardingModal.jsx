import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { SESSION_TYPES } from '../constants/sessionTypes';

const MENTEE_GOALS = [
  { key: 'job',       emoji: '💼', label: 'Land my first job',  sub: 'Get guidance on job hunting and applications' },
  { key: 'switch',    emoji: '🔄', label: 'Switch careers',     sub: 'Navigate an industry or role change' },
  { key: 'interview', emoji: '🎯', label: 'Ace my interviews',  sub: 'Practice and prepare with an expert' },
];

const MENTOR_GOALS = SESSION_TYPES.slice(0, 4);

function getFirstName(user) {
  const full = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  if (full.trim()) return full.trim().split(/\s+/)[0];
  return user?.email?.split('@')[0] ?? 'there';
}

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2';

export default function OnboardingModal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMentor = user?.user_metadata?.role === 'mentor';

  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('bridge_onboarded')) {
      setVisible(true);
      requestAnimationFrame(() => setMounted(true));
    }
  }, []);

  function dismiss() {
    localStorage.setItem('bridge_onboarded', '1');
    setMounted(false);
    setTimeout(() => setVisible(false), 200);
  }

  function handleFinish() {
    localStorage.setItem('bridge_onboarded', '1');
    setMounted(false);
    setTimeout(() => {
      setVisible(false);
      navigate(isMentor ? '/dashboard' : '/mentors');
    }, 200);
  }

  if (!visible) return null;

  const firstName = getFirstName(user);
  const goals = isMentor ? MENTOR_GOALS : MENTEE_GOALS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) dismiss(); }}
    >
      <div
        className={`relative w-full max-w-lg rounded-3xl bg-white shadow-2xl transition-all duration-200 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* X button */}
        <button
          onClick={dismiss}
          className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 ${focusRing}`}
          aria-label="Skip onboarding"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pb-8 pt-8">
          {/* ── Step 1 — Welcome ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col items-center text-center">
              <span className="text-5xl" role="img" aria-label="celebration">🎉</span>
              <h2 className="font-display mt-5 text-2xl font-bold text-stone-900">
                Welcome to Bridge, {firstName}!
              </h2>
              <p className="mt-3 text-sm text-stone-500 max-w-sm">
                You're one step away from connecting with mentors who've been exactly where you are.
              </p>
              <button
                onClick={() => setStep(2)}
                className={`mt-8 rounded-full bg-stone-900 px-6 py-3 font-semibold text-white transition hover:bg-stone-800 ${focusRing}`}
              >
                Get Started →
              </button>
            </div>
          )}

          {/* ── Step 2 — Goals ───────────────────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="font-display text-2xl font-bold text-stone-900">
                {isMentor ? 'What do you want to help with?' : 'What are you looking for?'}
              </h2>
              <div className="mt-5 space-y-3">
                {goals.map((g) => {
                  const key = g.key;
                  const isSelected = selectedGoal === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedGoal(key)}
                      className={`w-full flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-500/20'
                          : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      } ${focusRing}`}
                    >
                      <span className="text-2xl shrink-0" role="img" aria-hidden>
                        {g.emoji ?? g.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900">{g.label ?? g.name}</p>
                        <p className="mt-0.5 text-xs text-stone-500">{g.sub ?? g.tagline}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => selectedGoal && setStep(3)}
                disabled={!selectedGoal}
                className={`mt-6 w-full rounded-full px-6 py-3 font-semibold transition ${
                  selectedGoal
                    ? `bg-stone-900 text-white hover:bg-stone-800 ${focusRing}`
                    : 'cursor-not-allowed bg-stone-100 text-stone-400'
                }`}
              >
                Continue →
              </button>
            </div>
          )}

          {/* ── Step 3 — All set ─────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="font-display mt-5 text-2xl font-bold text-stone-900">
                You're all set!
              </h2>
              <p className="mt-3 text-sm text-stone-500 max-w-sm">
                {isMentor
                  ? "Your mentor profile is ready. Let's get you in front of mentees."
                  : "Your Bridge account is ready. Let's find you the right mentor."}
              </p>
              <button
                onClick={handleFinish}
                className={`mt-8 rounded-full bg-stone-900 px-6 py-3 font-semibold text-white transition hover:bg-stone-800 ${focusRing}`}
              >
                {isMentor ? 'Go to Dashboard →' : 'Browse Mentors →'}
              </button>
            </div>
          )}
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pb-6">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-200 ${
                s === step ? 'w-6 bg-orange-500' : 'w-2 bg-stone-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
