import { useCallback, useRef, useState } from 'react';

/**
 * Shared OpenAI Realtime WebRTC session for IntakeCall and MentorApplication.
 * @param {{ onAssistantTranscript?: (text: string) => void, onUserTranscript?: (text: string) => void, onToolComplete?: (name: string) => void, onEnded?: () => void }} opts
 */
export function useRealtimeCall({
  onAssistantTranscript,
  onUserTranscript,
  onToolComplete,
  onEnded,
} = {}) {
  const pcRef = useRef(null);
  const dcRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioElRef = useRef(null);

  const [phase, setPhase] = useState('idle');
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(null);

  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    dcRef.current = null;
    if (audioElRef.current) {
      audioElRef.current.remove();
      audioElRef.current = null;
    }
    document.querySelectorAll('audio[data-bridge-realtime]').forEach((el) => el.remove());
  }, []);

  const endCall = useCallback(() => {
    cleanup();
    setPhase('ended');
    onEnded?.();
  }, [cleanup, onEnded]);

  const handleEvent = useCallback((event) => {
    if (event.type === 'response.created' || event.type === 'response.audio.delta') {
      setPhase('ai_speaking');
    }
    if (event.type === 'input_audio_buffer.speech_started') {
      setPhase('user_speaking');
    }
    if (event.type === 'response.audio_transcript.done' && event.transcript) {
      onAssistantTranscript?.(event.transcript);
    }
    if (event.type === 'conversation.item.input_audio_transcription.completed' && event.transcript) {
      onUserTranscript?.(event.transcript);
    }
    if (event.type === 'response.function_call_arguments.done' && event.name) {
      onToolComplete?.(event.name);
    }
  }, [onAssistantTranscript, onUserTranscript, onToolComplete]);

  const startCall = useCallback(async (fetchToken) => {
    setError(null);
    setPhase('connecting');

    try {
      const ephemeralKey = await fetchToken();
      if (!ephemeralKey) throw new Error('No ephemeral key returned');

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          setError('Connection dropped. Please try again.');
          endCall();
        }
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'closed') {
          setPhase('ended');
          onEnded?.();
        }
      };

      const audioEl = document.createElement('audio');
      audioEl.autoplay = true;
      audioEl.setAttribute('playsinline', '');
      audioEl.dataset.bridgeRealtime = '1';
      document.body.appendChild(audioEl);
      audioElRef.current = audioEl;
      pc.ontrack = (e) => { audioEl.srcObject = e.streams[0]; };

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const dc = pc.createDataChannel('oai-events');
      dcRef.current = dc;
      dc.onmessage = (e) => {
        let event;
        try { event = JSON.parse(e.data); } catch { return; }
        handleEvent(event);
      };
      dc.addEventListener('open', () => {
        dc.send(JSON.stringify({ type: 'session.update', session: { instructions: null } }));
        dc.send(JSON.stringify({ type: 'response.create', response: { modalities: ['audio', 'text'] } }));
        setPhase('ai_speaking');
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch('https://api.openai.com/v1/realtime?model=gpt-realtime-1.5', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
        body: offer.sdp,
      });

      if (!sdpRes.ok) throw new Error('WebRTC SDP exchange failed');
      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
    } catch (err) {
      cleanup();
      setPhase('idle');
      setError(err?.message ?? 'Could not start voice session');
      throw err;
    }
  }, [cleanup, endCall, handleEvent, onEnded]);

  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMuted(!track.enabled);
  }, []);

  return {
    phase,
    muted,
    error,
    setError,
    startCall,
    endCall,
    toggleMute,
    cleanup,
  };
}
