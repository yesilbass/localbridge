import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, MicOff, CheckCircle2, Loader2, Type } from 'lucide-react'
import supabase from '../api/supabase'
import { callAIProxy } from '../api/ai'
import { useAuth } from '../context/useAuth'
import { useContent } from '../content'

const QUESTIONS = {
  career_advice: [
    "Tell me about your current role or situation — where are you right now in your career?",
    "What's the main challenge or decision you're facing that made you book this session?",
    "What would a great outcome from today's session look like for you?",
  ],
  interview_prep: [
    "What role and company are you interviewing for, and how far along in the process are you?",
    "Which part of the interview are you most nervous about — technical questions, behavioural, or something else?",
    "What's your biggest weakness going into this interview right now?",
  ],
  resume_review: [
    "What kind of role are you targeting, and what's your current experience level?",
    "What do you feel is the weakest part of your resume right now?",
    "Are there any specific accomplishments or experiences you're not sure how to include?",
  ],
  networking: [
    "What's your goal with networking — are you trying to break into a new industry, find a job, or build relationships?",
    "Tell me about your current network — who do you know, and where are the gaps?",
    "What's held you back from networking more effectively so far?",
  ],
}


function isVoiceSupported() {
  return (
    typeof RTCPeerConnection !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getUserMedia === 'function'
  )
}

export default function IntakeCall() {
  const { s } = useContent()
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()

  const [pageState, setPageState] = useState('loading')
  const [sessionData, setSessionData] = useState(null)
  const [mentorName, setMentorName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [textFallback, setTextFallback] = useState(false)

  const [textStep, setTextStep] = useState(0)
  const [textAnswers, setTextAnswers] = useState([])
  const [currentAnswer, setCurrentAnswer] = useState('')

  const [flowState, setFlowState] = useState('idle')
  const pcRef = useRef(null)
  const dcRef = useRef(null)
  const localStreamRef = useRef(null)
  const transcriptRef = useRef([])
  const [isConnecting, setIsConnecting] = useState(false)
  const [transcriptItems, setTranscriptItems] = useState([])

  useEffect(() => {
    if (!isVoiceSupported()) {
      setTextFallback(true)
    }
  }, [])

  useEffect(() => {
    return () => {
      localStreamRef.current?.getTracks().forEach(t => t.stop())
      pcRef.current?.close()
      window.speechSynthesis?.cancel()
    }
  }, [])

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes orbPulse {
        from { transform: scale(0.95); opacity: 0.6; }
        to { transform: scale(1.15); opacity: 1; }
      }
      @keyframes orbBreath {
        from { transform: scale(0.92); }
        to { transform: scale(1.08); }
      }
    `
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/dashboard'); return }
    if (pageState === 'no_support') return

    async function load() {
      const { data, error } = await supabase
        .from('sessions')
        .select('id, session_type, mentor_id, intake_completed')
        .eq('id', sessionId)
        .eq('mentee_id', user.id)
        .single()

      if (error || !data) { navigate('/dashboard'); return }

      const { data: mentor } = await supabase
        .from('mentor_profiles')
        .select('name')
        .eq('id', data.mentor_id)
        .single()

      setMentorName(mentor?.name ?? 'your mentor')
      setSessionData(data)
      setPageState(data.intake_completed ? 'already_done' : 'ready')
    }

    load().catch(() => navigate('/dashboard'))
  }, [authLoading, user, sessionId, navigate, pageState])

  async function runSummaryProcessing() {
    setFlowState('processing')
    try {
      const transcript = transcriptRef.current
      const sessionType = sessionData.session_type

      const summary = await callAIProxy('intake_summary', { sessionType, transcript })

      await supabase
        .from('sessions')
        .update({ intake_summary: summary, intake_completed: true })
        .eq('id', sessionId)

      setFlowState('complete')
    } catch (err) {
      setErrorMessage(err?.message ?? 'Failed to save intake summary')
      setFlowState('error')
    }
  }

  async function startRealtimeSession() {
    setIsConnecting(true)
    setFlowState('speaking')

    try {
      const { data: { session: authSession } } = await supabase.auth.getSession()
      const token = authSession?.access_token
      const res = await fetch('/api/realtime-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          sessionType: sessionData.session_type,
          sessionId,
        }),
      })

      if (!res.ok) throw new Error('Failed to get realtime session token')
      const data = await res.json()
      const ephemeralKey = data.client_secret?.value
      if (!ephemeralKey) throw new Error('No ephemeral key returned')

      const pc = new RTCPeerConnection()
      pcRef.current = pc

      pc.oniceconnectionstatechange = () => {
        if (
          pc.iceConnectionState === 'disconnected' ||
          pc.iceConnectionState === 'failed'
        ) {
          setErrorMessage('Connection dropped. Please try again.')
          setFlowState('error')
        }
      }

      const audioEl = document.createElement('audio')
      audioEl.autoplay = true
      audioEl.setAttribute('playsinline', '')
      document.body.appendChild(audioEl)
      pc.ontrack = (e) => { audioEl.srcObject = e.streams[0] }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      localStreamRef.current = stream
      stream.getTracks().forEach(track => pc.addTrack(track, stream))

      const dc = pc.createDataChannel('oai-events')
      dcRef.current = dc

      dc.onmessage = (e) => {
        let event
        try { event = JSON.parse(e.data) } catch { return }
        handleRealtimeEvent(event)
      }

      dc.addEventListener('open', () => {
        dc.send(JSON.stringify({
          type: 'session.update',
          session: { instructions: null },
        }))
        dc.send(JSON.stringify({
          type: 'response.create',
          response: { modalities: ['audio', 'text'] },
        }))
      })

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      const sdpRes = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-realtime-1.5',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ephemeralKey}`,
            'Content-Type': 'application/sdp',
          },
          body: offer.sdp,
        }
      )

      if (!sdpRes.ok) throw new Error('WebRTC SDP exchange failed')
      const answerSdp = await sdpRes.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      setIsConnecting(false)
    } catch (err) {
      setErrorMessage(err?.message ?? 'Could not start voice session')
      setFlowState('error')
      setIsConnecting(false)
    }
  }

  function handleRealtimeEvent(event) {
    if (
      event.type === 'response.audio_transcript.done' &&
      event.transcript
    ) {
      transcriptRef.current.push({ role: 'assistant', text: event.transcript })
      setTranscriptItems(prev => [...prev, { role: 'assistant', text: event.transcript }])
    }

    if (
      event.type === 'conversation.item.input_audio_transcription.completed' &&
      event.transcript
    ) {
      transcriptRef.current.push({ role: 'user', text: event.transcript })
      setTranscriptItems(prev => [...prev, { role: 'user', text: event.transcript }])
    }

    if (
      event.type === 'response.function_call_arguments.done' &&
      event.name === 'complete_intake'
    ) {
      endSessionAndSummarise()
    }
  }

  async function endSessionAndSummarise() {
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    pcRef.current?.close()
    document.querySelectorAll('audio[playsinline]').forEach(el => el.remove())
    await runSummaryProcessing()
  }

  function handleTextNext() {
    if (!currentAnswer.trim()) return
    const questions = sessionData ? (QUESTIONS[sessionData.session_type] ?? QUESTIONS.career_advice) : []
    const updatedAnswers = [...textAnswers, currentAnswer.trim()]
    setTextAnswers(updatedAnswers)
    setCurrentAnswer('')

    if (textStep < questions.length - 1) {
      setTextStep(textStep + 1)
    } else {
      submitTextIntake(questions, updatedAnswers)
    }
  }

  async function submitTextIntake(questions, answers) {
    transcriptRef.current = []
    for (let i = 0; i < questions.length; i++) {
      transcriptRef.current.push({ role: 'assistant', text: questions[i] })
      if (answers[i]) {
        transcriptRef.current.push({ role: 'user', text: answers[i] })
      }
    }
    await runSummaryProcessing()
  }

  if (pageState === 'loading' || (authLoading && pageState === 'loading')) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bridge-canvas)' }}>
        <Loader2 className="animate-spin text-amber-400" size={36} />
      </div>
    )
  }

  if (pageState === 'no_support') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bridge-canvas)' }}>
        <div className="text-center max-w-sm">
          <MicOff size={48} className="mx-auto mb-4" style={{ color: 'var(--bridge-text-muted)' }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--bridge-text)' }}>
            {s.intakeCall.voiceNotSupportedHeading}
          </h2>
          <p className="text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
            {s.intakeCall.voiceNotSupportedBody}
          </p>
        </div>
      </div>
    )
  }

  if (pageState === 'already_done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bridge-canvas)' }}>
        <div
          className="rounded-2xl p-8 text-center max-w-sm shadow-xl"
          style={{ background: 'var(--bridge-surface)', border: '1px solid var(--bridge-border)' }}
        >
          <CheckCircle2 size={52} className="mx-auto mb-4 text-amber-400" />
          <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--bridge-text)' }}>
            {s.intakeCall.alreadyCompletedHeading}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--bridge-text-muted)' }}>
            {s.intakeCall.alreadyCompletedBody}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-500 hover:bg-amber-400 transition-colors"
          >
            {s.common.backToDashboard}
          </button>
        </div>
      </div>
    )
  }

  if (flowState === 'complete') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bridge-canvas)' }}>
        <div className="text-center max-w-sm">
          <CheckCircle2 size={64} className="mx-auto mb-6 text-emerald-400" />
          <h2 className="text-2xl font-semibold mb-2" style={{ color: 'var(--bridge-text)' }}>
            {s.intakeCall.allDone}
          </h2>
          <p className="text-base mb-8" style={{ color: 'var(--bridge-text-muted)' }}>
            {s.intakeCall.mentorPrepared}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-amber-500 hover:bg-amber-400 transition-colors"
          >
            {s.common.backToDashboard}
          </button>
        </div>
      </div>
    )
  }

  const allQuestions = sessionData ? (QUESTIONS[sessionData.session_type] ?? QUESTIONS.career_advice) : []

  if (textFallback && flowState !== 'processing') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bridge-canvas)' }}>
        <div className="bg-stone-950 border-b border-white/10 px-6 py-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
            {s.intakeCall.intakeBadge.replace('{type}', sessionData?.session_type?.replace('_', ' ') ?? 'Session')}
          </p>
          <h1 className="text-2xl font-bold text-white mb-2">
            {s.intakeCall.sessionWith.replace('{name}', mentorName)}
          </h1>
          <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
            {s.intakeCall.intakeIntroAlt}
          </p>
        </div>

        <div className="max-w-xl mx-auto px-4 py-10">
          <div
            className="rounded-2xl p-8 shadow-xl"
            style={{ background: 'var(--bridge-surface)', border: '1px solid var(--bridge-border)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--bridge-text-muted)' }}>
                {s.intakeCall.questionOf.replace('{current}', textStep + 1).replace('{total}', allQuestions.length)}
              </p>
              <div className="flex gap-1">
                {allQuestions.map((_, i) => (
                  <div
                    key={i}
                    className="h-1.5 w-6 rounded-full transition-colors"
                    style={{ background: i <= textStep ? 'var(--color-primary)' : 'var(--bridge-border)' }}
                  />
                ))}
              </div>
            </div>

            <p
              className="text-xl font-medium leading-snug mb-6"
              style={{ color: 'var(--bridge-text)' }}
            >
              {allQuestions[textStep]}
            </p>

            <div className="flex items-center gap-1.5 mb-4 text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
              <Type size={12} aria-hidden />
              <span>{s.intakeCall.typeYourAnswer}</span>
            </div>

            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleTextNext()
              }}
              rows={4}
              placeholder={s.intakeCall.answerPlaceholder}
              aria-label={`Answer for: ${allQuestions[textStep]}`}
              className="w-full resize-none rounded-xl border px-4 py-3 text-sm leading-relaxed outline-none transition"
              style={{
                background: 'var(--bridge-canvas)',
                border: '1px solid var(--bridge-border)',
                color: 'var(--bridge-text)',
              }}
            />

            <p className="text-xs mt-1 mb-4" style={{ color: 'var(--bridge-text-muted)' }}>
              {s.intakeCall.ctrlEnterHint}
            </p>

            {flowState === 'error' && (
              <p className="text-sm text-red-400 mb-4">{errorMessage}</p>
            )}

            <button
              onClick={handleTextNext}
              disabled={!currentAnswer.trim()}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
              style={{
                background: 'var(--color-primary)',
                color: 'var(--color-on-primary)',
              }}
            >
              {textStep < allQuestions.length - 1 ? s.intakeCall.nextQuestion : s.intakeCall.submitBriefing}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (flowState === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--bridge-canvas)' }}>
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-sm font-medium" style={{ color: 'var(--bridge-text)' }}>
            {s.intakeCall.generatingBriefing}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--bridge-text-muted)' }}>
            {s.intakeCall.justAMoment}
          </p>
        </div>
      </div>
    )
  }

  const questions = sessionData ? (QUESTIONS[sessionData.session_type] ?? QUESTIONS.career_advice) : []
  const totalQuestions = questions.length
  const isListening = flowState === 'listening'
  const isBusy = flowState === 'speaking' || flowState === 'processing'
  const isIdle = flowState === 'idle'
  const isLive = flowState === 'speaking' || flowState === 'listening'

  const stateLabel = isConnecting
    ? s.intakeCall.connecting
    : {
        idle: s.intakeCall.tapToSpeak,
        speaking: s.intakeCall.sessionLive,
        listening: s.intakeCall.listening,
        processing: s.intakeCall.processing,
        error: 'Error',
      }[flowState] ?? ''

  if (isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center"
        style={{ background: 'var(--bridge-canvas)' }}>
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute w-24 h-24 rounded-full border border-amber-400/20 animate-ping" />
          <div className="absolute w-16 h-16 rounded-full border border-amber-400/40 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
            <Mic size={20} className="text-amber-400" />
          </div>
        </div>
        <p className="text-sm font-semibold tracking-widest uppercase text-amber-400 mb-2">
          {s.intakeCall.connectingToBridgeAI}
        </p>
        <p className="text-xs" style={{ color: 'var(--bridge-text-muted)' }}>
          {s.intakeCall.settingUpVoice}
        </p>
      </div>
    )
  }

  if (isLive && !isConnecting) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--bridge-canvas)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--bridge-border)' }}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">
              {s.intakeCall.intakeBadge.replace('{type}', sessionData?.session_type?.replace('_', ' ') ?? 'Session')}
            </p>
            <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--bridge-text)' }}>
              {s.intakeCall.sessionWith.replace('{name}', mentorName)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
            <span className="text-xs font-medium text-emerald-400">{s.intakeCall.live}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 max-w-2xl mx-auto w-full">
          {transcriptItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm" style={{ color: 'var(--bridge-text-muted)' }}>
                {s.intakeCall.conversationWillAppear}
              </p>
            </div>
          ) : (
            transcriptItems.map((item, i) => (
              <div
                key={i}
                className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    item.role === 'user'
                      ? 'bg-amber-500 text-white rounded-br-sm'
                      : 'rounded-bl-sm'
                  }`}
                  style={item.role === 'assistant' ? {
                    background: 'var(--bridge-surface)',
                    border: '1px solid var(--bridge-border)',
                    color: 'var(--bridge-text)',
                  } : {}}
                >
                  {item.text}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t px-6 py-5" style={{ borderColor: 'var(--bridge-border)', background: 'var(--bridge-surface)' }}>
          <div className="flex justify-center mb-4">
            <div className="relative flex items-center justify-center">
              <div
                className="absolute rounded-full"
                style={{
                  width: '120px',
                  height: '120px',
                  background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 15%, transparent) 0%, transparent 70%)',
                  animation: flowState === 'speaking'
                    ? 'orbPulse 1.2s ease-in-out infinite alternate'
                    : 'orbPulse 2.5s ease-in-out infinite alternate',
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: '90px',
                  height: '90px',
                  background: 'radial-gradient(circle, color-mix(in srgb, var(--color-accent) 20%, transparent) 0%, transparent 70%)',
                  animation: flowState === 'speaking'
                    ? 'orbPulse 0.9s ease-in-out infinite alternate'
                    : 'orbPulse 2s ease-in-out infinite alternate',
                  animationDelay: '0.2s',
                }}
              />
              <div
                className="rounded-full"
                style={{
                  width: '64px',
                  height: '64px',
                  background: flowState === 'speaking'
                    ? 'radial-gradient(circle at 35% 35%, color-mix(in srgb, var(--color-accent) 40%, #ffffff), var(--color-primary), var(--color-primary-hover))'
                    : 'radial-gradient(circle at 35% 35%, #6ee7b7, var(--color-success), color-mix(in srgb, var(--color-success) 70%, var(--color-secondary)))',
                  animation: flowState === 'speaking'
                    ? 'orbBreath 1s ease-in-out infinite alternate'
                    : 'orbBreath 2.5s ease-in-out infinite alternate',
                  boxShadow: flowState === 'speaking'
                    ? '0 0 30px color-mix(in srgb, var(--color-primary) 60%, transparent), 0 0 60px color-mix(in srgb, var(--color-primary) 30%, transparent)'
                    : '0 0 30px color-mix(in srgb, var(--color-success) 60%, transparent), 0 0 60px color-mix(in srgb, var(--color-success) 30%, transparent)',
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium" style={{ color: 'var(--bridge-text-muted)' }}>
              {flowState === 'speaking' ? s.intakeCall.bridgeAISpeaking : s.intakeCall.listeningToYou}
            </p>
            <button
              onClick={endSessionAndSummarise}
              aria-label="End voice session"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-500/80 hover:bg-red-500 transition-colors"
            >
              <MicOff size={14} aria-hidden />
              {s.intakeCall.endSession}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bridge-canvas)' }}>
      <div className="bg-stone-950 border-b border-white/10 px-6 py-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 mb-2">
          {s.intakeCall.intakeBadge.replace('{type}', sessionData?.session_type?.replace('_', ' ') ?? 'Session')}
        </p>
        <h1 className="text-2xl font-bold text-white mb-2">
          {s.intakeCall.sessionWith.replace('{name}', mentorName)}
        </h1>
        <p className="text-sm text-stone-400 max-w-md mx-auto leading-relaxed">
          {s.intakeCall.intakeIntro}
        </p>
      </div>

      <div className="max-w-xl mx-auto px-4 py-10">
        <div
          className="rounded-2xl p-8 shadow-xl"
          style={{ background: 'var(--bridge-surface)', border: '1px solid var(--bridge-border)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--bridge-text-muted)' }}>
              {s.intakeCall.totalQuestions.replace('{total}', totalQuestions)}
            </p>
          </div>

          <p
            className="text-xl font-medium leading-snug text-center mb-10"
            style={{ color: 'var(--bridge-text)', minHeight: '4rem' }}
          >
            {s.intakeCall.readyMessage}
          </p>

          <div className="flex flex-col items-center gap-3 mb-6">
            {isConnecting ? (
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--bridge-border)' }}>
                <Loader2 size={32} className="text-amber-400 animate-spin" />
              </div>
            ) : isIdle ? (
              <button
                onClick={startRealtimeSession}
                aria-label="Start voice session"
                className="relative w-20 h-20 rounded-full flex items-center justify-center bg-amber-500 hover:bg-amber-400 shadow-lg transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-400"
              >
                <Mic size={32} className="text-white" aria-hidden />
              </button>
            ) : flowState === 'error' ? (
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, red 15%, transparent)' }}>
                <MicOff size={32} className="text-red-400" aria-hidden />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--bridge-border)' }}>
                <Loader2 size={32} className="text-amber-400 animate-spin" />
              </div>
            )}

            <p className="text-sm font-medium" style={{ color: 'var(--bridge-text-muted)' }}>
              {stateLabel}
            </p>
          </div>

          {flowState === 'error' && (
            <p className="text-sm text-red-400 text-center mt-4">{errorMessage}</p>
          )}

          <button
            onClick={() => setTextFallback(true)}
            className="mt-4 w-full py-2.5 rounded-xl text-sm font-medium transition border"
            style={{
              borderColor: 'var(--bridge-border)',
              color: 'var(--bridge-text-secondary)',
              background: 'transparent',
            }}
          >
            <Type size={14} className="inline mr-1.5" aria-hidden />
            {s.intakeCall.useTextInstead}
          </button>
        </div>
      </div>
    </div>
  )
}
