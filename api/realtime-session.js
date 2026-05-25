// Required env var: OPENAI_API_KEY
// Add to Vercel dashboard under Settings > Environment Variables
// Scope: Production + Preview
// This key must never be prefixed with VITE_ — server only

import { intakePrompt } from './_lib/intakePrompt.js'
import supabase from './_lib/supabase.js'
import { verifyAuthUser } from './_lib/auth.js'
import { applyCors } from './_lib/allowedOrigins.js'
import { jsonError, validateJsonBody } from './_lib/security.js'
import { z } from 'zod'

const VALID_SESSION_TYPES = ['career_advice', 'interview_prep', 'resume_review', 'networking']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const REALTIME_FEATURE = 'realtime_session'
const REALTIME_FEATURE_APPLICATION = 'realtime_mentor_application'
const REALTIME_MODEL = 'gpt-realtime-1.5'

function buildGaSessionPayload({ instructions, tools }) {
  return {
    expires_after: { anchor: 'created_at', seconds: 600 },
    session: {
      type: 'realtime',
      model: REALTIME_MODEL,
      instructions,
      audio: {
        input: {
          transcription: { model: 'gpt-4o-mini-transcribe' },
          turn_detection: { type: 'semantic_vad', eagerness: 'auto' },
        },
        output: { voice: 'ballad' },
      },
      tools,
      tool_choice: 'auto',
    },
  }
}

async function createGaRealtimeSession(apiKey, config) {
  const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildGaSessionPayload(config)),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('[realtime-session] OpenAI error', response.status, errText)
    return null
  }

  const data = await response.json()
  return {
    client_secret: {
      value: data.value,
      expires_at: data.expires_at,
    },
    session: data.session,
  }
}

const intakeSchema = z.object({
  sessionType: z.enum(VALID_SESSION_TYPES),
  sessionId: z.string().regex(UUID_RE),
})

const mentorApplicationSchema = z.object({
  type: z.literal('mentor_application'),
  full_name: z.string().min(2).max(120),
  current_role: z.string().min(2).max(100),
  location: z.string().min(2).max(120),
  linkedin_url: z.string().url().optional().or(z.literal('')).transform((v) => v || null),
})

const REALTIME_SCHEMA = z.union([mentorApplicationSchema, intakeSchema])

function minuteStartIso() {
  const date = new Date()
  date.setSeconds(0, 0)
  return date.toISOString()
}

function dayStartIso() {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

async function getUsageCount(userId, feature, sinceIso) {
  const { count, error } = await supabase
    .from('ai_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('feature', feature)
    .gte('created_at', sinceIso)

  if (error) throw error
  return count ?? 0
}

async function hasRealtimeCapacity(userId, feature = REALTIME_FEATURE) {
  const [usedThisMinute, usedToday] = await Promise.all([
    getUsageCount(userId, feature, minuteStartIso()),
    getUsageCount(userId, feature, dayStartIso()),
  ])

  return usedThisMinute < 1 && usedToday < 5
}

async function recordRealtimeUsage(userId, feature = REALTIME_FEATURE) {
  const { error } = await supabase
    .from('ai_usage')
    .insert({ user_id: userId, feature })

  if (error) throw error
}

function mentorApplicationPrompt({ full_name, current_role, location }) {
  return `You are a warm, curious interviewer for Bridge — a mentorship platform that connects people with mentors across all areas of life: career, relationships, faith, parenting, immigration, health, finances, and more.

You are speaking with ${full_name}, who works as ${current_role} and is based in ${location}.

Your job is to have a natural 4-5 minute conversation to understand who they are, what they've been through, and whether they genuinely want to help others. You are NOT screening for credentials or impressive job titles. You ARE looking for real experience and a real desire to help.

Ask 4-5 questions, conversationally. Do not read them as a list. Let the conversation flow naturally. Cover:
1. What can they help people with — specifically. Push for specifics, not generalities.
2. What life experiences outside their job have shaped them.
3. Why they want to mentor — what's their actual motivation.
4. What kind of person they'd most want to help.
5. One thing they wish someone had told them earlier.

Important rules:
- Be warm and human. This should feel like a good conversation, not an interview.
- Never ask about years of experience, educational credentials, or company names.
- If they mention something interesting, follow up on it naturally.
- When the conversation feels complete (around 4-5 minutes), wrap up warmly and let them know what happens next: "That's really helpful, thank you. Our team will review your application and you'll hear back within a few days."
- Do not end abruptly. Close the conversation the way a real person would.
- When you are ready to end, call the complete_application tool.`
}

export default async function handler(req, res) {
  applyCors(req, res, 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return jsonError(res, 405, 'Method not allowed')

  const { user, error: authError } = await verifyAuthUser(req)
  if (!user) return jsonError(res, 401, authError || 'Unauthorized')

  const body = validateJsonBody(req, REALTIME_SCHEMA)
  if (body.error) return jsonError(res, 400, body.error)
  const payload = body.data
  const isMentorApplication = payload.type === 'mentor_application'

  if (!isMentorApplication) {
    const { sessionType, sessionId } = payload

    const { data: bridgeSession, error: sessionError } = await supabase
      .from('sessions')
      .select('id, mentee_id')
      .eq('id', sessionId)
      .maybeSingle()

    if (sessionError || !bridgeSession) {
      return jsonError(res, 404, 'Session not found')
    }
    if (bridgeSession.mentee_id !== user.id) {
      return jsonError(res, 403, 'You do not own this session')
    }

    try {
      const allowed = await hasRealtimeCapacity(user.id, REALTIME_FEATURE)
      if (!allowed) return jsonError(res, 429, 'Realtime session limit reached')
    } catch (err) {
      console.error('[realtime-session] rate limit error:', err)
      return jsonError(res, 500, 'Could not create realtime session')
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return jsonError(res, 500, 'Realtime service is not configured')

    try {
      const instructions =
        intakePrompt +
        '\n\nThe session type for this interview is: ' +
        sessionType +
        '. Ask only the questions for this session type.'

      const data = await createGaRealtimeSession(apiKey, {
        instructions,
        tools: [
          {
            type: 'function',
            name: 'complete_intake',
            description: 'Called when the intake interview is fully complete',
            parameters: {
              type: 'object',
              properties: {
                session_type: { type: 'string' },
                status: { type: 'string' },
              },
              required: ['session_type', 'status'],
            },
          },
        ],
      })

      if (!data) return jsonError(res, 502, 'Could not create realtime session')

      await recordRealtimeUsage(user.id, REALTIME_FEATURE)
      return res.json(data)
    } catch (err) {
      console.error('[realtime-session] error:', err)
      return jsonError(res, 500, 'Failed to create realtime session')
    }
  }

  // ─── mentor_application ───────────────────────────────────────────────────
  const { full_name, current_role, location } = payload

  const { data: existingProfile } = await supabase
    .from('mentor_profiles')
    .select('mentor_status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (['active', 'under_review'].includes(existingProfile?.mentor_status)) {
    return jsonError(res, 409, 'Application already submitted or approved')
  }

  try {
    const allowed = await hasRealtimeCapacity(user.id, REALTIME_FEATURE_APPLICATION)
    if (!allowed) return jsonError(res, 429, 'Realtime session limit reached')
  } catch (err) {
    console.error('[realtime-session] rate limit error:', err)
    return jsonError(res, 500, 'Could not create realtime session')
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return jsonError(res, 500, 'Realtime service is not configured')

  try {
    const instructions = mentorApplicationPrompt({ full_name, current_role, location })

    const data = await createGaRealtimeSession(apiKey, {
      instructions,
      tools: [
        {
          type: 'function',
          name: 'complete_application',
          description: 'Called when the mentor application conversation is fully complete',
          parameters: {
            type: 'object',
            properties: { status: { type: 'string' } },
            required: ['status'],
          },
        },
      ],
    })

    if (!data) return jsonError(res, 502, 'Could not create realtime session')

    await recordRealtimeUsage(user.id, REALTIME_FEATURE_APPLICATION)
    return res.json(data)
  } catch (err) {
    console.error('[realtime-session] error:', err)
    return jsonError(res, 500, 'Failed to create realtime session')
  }
}
