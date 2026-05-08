// Required env var: OPENAI_API_KEY
// Add to Vercel dashboard under Settings > Environment Variables
// Scope: Production + Preview
// This key must never be prefixed with VITE_ — server only

import { intakePrompt } from './prompts/intakePrompt.js'
import supabase from './_lib/supabase.js'
import { verifyAuthUser } from './_lib/auth.js'

const VALID_SESSION_TYPES = ['career_advice', 'interview_prep', 'resume_review', 'networking']
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { user, error: authError } = await verifyAuthUser(req)
  if (!user) return res.status(401).json({ error: authError || 'Unauthorized' })

  const { sessionType, sessionId } = req.body ?? {}

  if (!sessionType || !VALID_SESSION_TYPES.includes(sessionType)) {
    return res.status(400).json({ error: 'Invalid or missing sessionType' })
  }

  if (!sessionId || !UUID_RE.test(String(sessionId))) {
    return res.status(400).json({ error: 'Invalid or missing sessionId' })
  }

  // Confirm the caller actually owns the session they're running intake for —
  // prevents authenticated-but-unrelated users from burning quota on someone else's session.
  const { data: bridgeSession, error: sessionError } = await supabase
    .from('sessions')
    .select('id, mentee_id')
    .eq('id', sessionId)
    .maybeSingle()

  if (sessionError || !bridgeSession) {
    return res.status(404).json({ error: 'Session not found' })
  }
  if (bridgeSession.mentee_id !== user.id) {
    return res.status(403).json({ error: 'You do not own this session' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'OPENAI_API_KEY is not configured' })

  try {
    const instructions =
      intakePrompt +
      '\n\nThe session type for this interview is: ' +
      sessionType +
      '. Ask only the questions for this session type.'

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-realtime-1.5',
        voice: 'ballad',
        instructions,
        input_audio_transcription: { model: 'gpt-4o-mini-transcribe' },
        turn_detection: {
          type: 'semantic_vad',
          eagerness: 'auto',
        },
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
        tool_choice: 'auto',
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[realtime-session] OpenAI error', response.status, errText)
      return res.status(502).json({ error: 'Could not create realtime session' })
    }

    const data = await response.json()
    return res.json(data)
  } catch (err) {
    console.error('[realtime-session] error:', err)
    return res.status(500).json({ error: 'Failed to create realtime session' })
  }
}
