import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring } from 'motion/react';
import { MessageCircle, CalendarCheck, Mic, Video, PhoneOff } from 'lucide-react';
import { HERO_BROWSE_CHIPS, HERO_CAREER_DEMO, findMentor } from './landingData';
import { EASE, usePerfTier } from './landingHooks';

const STAGE_W = 520;
const STAGE_R = STAGE_W / 400;

const T_IDLE     = 2400;
const T_CHIPS    = 3100;
const T_SELECTED = 3100;
const T_BOOKED   = 5700;

const CARD_BODY_MIN_H = Math.round(118 * STAGE_R);

const WOOSH_SPRING = { type: 'spring', stiffness: 420, damping: 32, mass: 0.85 };
const CURSOR_SPRING = { stiffness: 118, damping: 28, mass: 1.08 };

const SECTION_MS = {
  idle: T_IDLE,
  chips: T_CHIPS,
  selected: T_SELECTED,
  booked: T_BOOKED,
};

const CURSOR_MOVE_DELAY_MS = {
  idle: 100,
  chips: 340,
  selected: 620,
  booked: 400,
};

const CLICK_MS = {
  idle: 1020,
  chips: 2280,
  selected: 2780,
  booked: 1780,
};

const TONE_GRAD = {
  amber:'linear-gradient(135deg,#4F46E5,#818CF8)', emerald:'linear-gradient(135deg,#059669,#10b981)',
  sky:'linear-gradient(135deg,#0EA5E9,#38BDF8)',   rose:'linear-gradient(135deg,#6D28D9,#A78BFA)',
  violet:'linear-gradient(135deg,#5B21B6,#A78BFA)',teal:'linear-gradient(135deg,#0D9488,#14B8A6)',
  orange:'linear-gradient(135deg,#4F46E5,#6366F1)',pink:'linear-gradient(135deg,#312E81,#818CF8)'
};

function ini(n) { return n.split(' ').filter(Boolean).map(p=>p[0]).slice(0,2).join('').toUpperCase(); }

function Cursor({ x, y, visible, clicking }) {
  return (
    <motion.div aria-hidden
      style={{ position:'absolute', left:0, top:0, x, y, translateX:'-28%', translateY:'-28%', pointerEvents:'none', zIndex:50 }}
      animate={{ opacity: visible ? 1 : 0, scale: clicking ? 0.78 : 1 }}
      transition={{ opacity:{duration:0.18}, scale:{duration:0.1,type:'spring',stiffness:520,damping:16} }}>
      <svg width="20" height="24" viewBox="0 0 20 24" fill="none" style={{ display:'block', filter:'drop-shadow(0 2px 6px rgba(0,0,0,0.28))' }}>
        <path d="M2 2L11 21L14 13.5L22 10.5L2 2Z" fill="white" stroke="#0f172a" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <AnimatePresence>
        {clicking && (
          <motion.span key="ripple" aria-hidden
            style={{ position:'absolute', inset:-10, borderRadius:'50%', border:'1.5px solid var(--color-primary)', pointerEvents:'none' }}
            initial={{ scale:0.3, opacity:0.9 }} animate={{ scale:2.8, opacity:0 }} exit={{ opacity:0 }}
            transition={{ duration:0.38, ease:'easeOut' }} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function VideoCallPanel({ mentor, flat }) {
  const [phase, setPhase] = useState('connecting');
  useEffect(() => {
    if (flat) { setPhase('connected'); return; }
    const t = setTimeout(() => setPhase('connected'), 900);
    return () => clearTimeout(t);
  }, [flat]);

  const grad = TONE_GRAD[mentor?.tone] || 'var(--color-primary)';

  return (
    <div style={{ width: '100%', borderRadius: Math.round(16 * STAGE_R), overflow: 'hidden', border: '1px solid var(--bridge-border)', boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--color-secondary) 18%, transparent)' }}>
      <AnimatePresence mode="wait">
        {phase === 'connecting' ? (
          <motion.div key="conn" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.25 }}
            style={{ background:'#0B0F19', padding:'28px 20px', textAlign:'center' }}>
            <div style={{ position:'relative', width:60, height:60, margin:'0 auto 14px' }}>
              {!flat && <div style={{ position:'absolute', inset:-12, borderRadius:'50%', border:'1.5px solid rgba(99,102,241,0.35)', animation:'vc-ring 1.5s ease-out infinite' }} />}
              <div style={{ width:60, height:60, borderRadius:'50%', background:grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:'white', letterSpacing:'-0.04em' }} aria-hidden>{ini(mentor?.name??'')}</div>
            </div>
            <p style={{ color:'rgba(255,255,255,0.75)', fontSize:13, fontWeight:600 }}>Connecting…</p>
            {!flat && <div style={{ display:'flex', justifyContent:'center', gap:5, marginTop:8 }}>
              {[0,1,2].map(i=><div key={i} aria-hidden style={{ width:4,height:4,borderRadius:'50%',background:'rgba(255,255,255,0.35)',animation:`vc-dot 1.1s ${i*0.18}s ease-in-out infinite` }} />)}
            </div>}
          </motion.div>
        ) : (
          <motion.div key="live" initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ duration:0.32 }}>
            <div style={{ background:'#0B0F19', display:'flex', alignItems:'center', gap:8, padding:'8px 14px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              {flat ? <div style={{ width:7,height:7,borderRadius:'50%',background:'#10b981' }} /> : <motion.div style={{ width:7,height:7,borderRadius:'50%',background:'#10b981',boxShadow:'0 0 6px #10b981' }} animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.7,repeat:Infinity }} />}
              <p style={{ fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.65)',flex:1 }}>Live session · {mentor?.name}</p>
              <span style={{ borderRadius:99,padding:'2px 7px',fontSize:9,fontWeight:900,background:'#ef4444',color:'white',letterSpacing:'0.1em',textTransform:'uppercase' }}>LIVE</span>
            </div>
            <div className="grid grid-cols-2" style={{ background:'#0B0F19' }}>
              <div className="flex items-center justify-center py-8 relative" style={{ background:`linear-gradient(135deg,rgba(79,70,229,0.2),#0B0F19)`, borderRight:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width:44,height:44,borderRadius:'50%',background:grad,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:900,color:'white' }} aria-hidden>{ini(mentor?.name??'')}</div>
                <span style={{ position:'absolute',bottom:7,left:9,fontSize:9,fontWeight:600,color:'rgba(255,255,255,0.45)' }}>{mentor?.name?.split(' ')[0]}</span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 py-8 relative" style={{ background:'#0E121C' }}>
                <Video className="h-4 w-4" style={{ color:'rgba(255,255,255,0.2)' }} aria-hidden />
                <p style={{ fontSize:9,color:'rgba(255,255,255,0.2)' }}>Camera off</p>
                <span style={{ position:'absolute',bottom:7,left:9,fontSize:9,fontWeight:600,color:'rgba(255,255,255,0.28)' }}>You</span>
              </div>
            </div>
            <div style={{ background:'#0B0F19',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'center',gap:10,padding:'10px' }}>
              {[{I:Mic,on:true},{I:Video,on:false},{I:PhoneOff,d:true}].map(({I,on,d},i)=>(
                <div key={i} style={{ width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:d?'#ef4444':on?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.05)' }}>
                  <I className="h-3.5 w-3.5" style={{ color:d?'white':on?'rgba(255,255,255,0.8)':'rgba(255,255,255,0.25)' }} aria-hidden />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CardBodyLayer({ active, children, inline = false }) {
  if (inline) {
    if (!active) return null;
    return (
      <motion.div
        initial={false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.22, ease: EASE }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      aria-hidden={!active}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.22, ease: EASE }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        pointerEvents: active ? 'auto' : 'none',
        visibility: active ? 'visible' : 'hidden'
      }}
    >
      {children}
    </motion.div>
  );
}

export default function HeroLiveMatch() {
  const reduced = useReducedMotion();
  const tier    = usePerfTier();
  const flat    = reduced || tier === 'low';

  const [status, setStatus] = useState('idle');
  const [showVideo, setShowVideo] = useState(false);
  const [ready, setReady] = useState(false);

  const containerRef = useRef(null);
  const cardRef      = useRef(null);
  const inputRef     = useRef(null);
  const chipRef      = useRef(null);
  const circleRef    = useRef(null);
  const calCheckRef  = useRef(null);

  const rawX    = useMotionValue(0);
  const rawY    = useMotionValue(0);
  const springX = useSpring(rawX, CURSOR_SPRING);
  const springY = useSpring(rawY, CURSOR_SPRING);
  const [cursorVis, setCursorVis] = useState(false);
  const [clicking, setClicking]   = useState(false);
  const genRef = useRef(0);
  const auxTimersRef = useRef([]);

  const getPos = useCallback((ref) => {
    const el = ref?.current || ref;
    const r  = containerRef.current;
    if (!el || !r) return null;
    const er = el.getBoundingClientRect();
    const rr = r.getBoundingClientRect();
    return { x: er.left - rr.left + er.width * 0.5, y: er.top - rr.top + er.height * 0.5 };
  }, []);

  const doClick = useCallback(() => {
    setClicking(true);
    setTimeout(() => setClicking(false), 190);
  }, []);

  const moveCursor = useCallback((ref, immediate = false) => {
    const p = getPos(ref);
    if (!p) return false;
    if (immediate) {
      rawX.jump(p.x);
      rawY.jump(p.y);
    } else {
      rawX.set(p.x);
      rawY.set(p.y);
    }
    return true;
  }, [getPos, rawX, rawY]);

  const moveCursorWhenReady = useCallback((ref, { immediate = false, delay = 0 } = {}) => {
    let cancelled = false;
    let retryTimer = null;

    const attempt = (tries = 0) => {
      if (cancelled) return;
      const moved = moveCursor(ref, immediate);
      if (!moved && tries < 12) {
        retryTimer = setTimeout(() => attempt(tries + 1), 48);
      }
    };

    const start = () => requestAnimationFrame(() => requestAnimationFrame(() => attempt()));

    if (delay > 0) {
      const t = setTimeout(start, delay);
      return () => {
        cancelled = true;
        clearTimeout(t);
        if (retryTimer) clearTimeout(retryTimer);
      };
    }

    start();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [moveCursor]);

  const schedule = useCallback((fn, ms) => {
    const gen = genRef.current;
    const id = setTimeout(() => {
      if (genRef.current === gen) fn();
    }, ms);
    return id;
  }, []);

  const clearAuxTimers = useCallback(() => {
    auxTimersRef.current.forEach(clearTimeout);
    auxTimersRef.current = [];
  }, []);

  useEffect(() => {
    if (flat) {
      setReady(true);
      return undefined;
    }
    const t1 = setTimeout(() => moveCursor(inputRef, true), 80);
    const t3 = setTimeout(() => setReady(true), 360);
    return () => { clearTimeout(t1); clearTimeout(t3); };
  }, [flat, moveCursor]);

  useEffect(() => {
    if (flat || !ready || status !== 'idle') return undefined;
    const t = setTimeout(() => setCursorVis(true), 140);
    return () => clearTimeout(t);
  }, [status, flat, ready]);

  useEffect(() => {
    if (flat) {
      setShowVideo(status === 'booked');
      return undefined;
    }
    if (status !== 'booked') setShowVideo(false);
    return undefined;
  }, [status, flat]);

  useEffect(() => {
    if (flat || !ready) return undefined;

    const targetRef = {
      idle: inputRef,
      chips: chipRef,
      selected: circleRef,
      booked: calCheckRef,
    }[status];

    return moveCursorWhenReady(targetRef, {
      immediate: status === 'idle',
      delay: CURSOR_MOVE_DELAY_MS[status] ?? 120,
    });
  }, [status, flat, ready, moveCursorWhenReady]);

  useEffect(() => {
    if (flat || !ready) return undefined;

    const timers = [];

    timers.push(schedule(() => {
      doClick();
      if (status === 'booked') setShowVideo(true);
    }, CLICK_MS[status] ?? 1000));

    if (status === 'booked') {
      timers.push(schedule(() => setCursorVis(false), CLICK_MS.booked + 560));
    }

    timers.push(schedule(() => {
      if (status === 'idle') {
        setStatus('chips');
      } else if (status === 'chips') {
        setStatus('selected');
      } else if (status === 'selected') {
        setStatus('booked');
      } else if (status === 'booked') {
        setShowVideo(false);
        setCursorVis(false);
        clearAuxTimers();
        auxTimersRef.current.push(schedule(() => {
          setStatus('idle');
          moveCursor(inputRef, true);
        }, 360));
      }
    }, SECTION_MS[status] ?? T_IDLE));

    return () => {
      timers.forEach(clearTimeout);
      clearAuxTimers();
      genRef.current += 1;
    };
  }, [status, flat, ready, doClick, moveCursor, schedule, clearAuxTimers]);

  useEffect(() => {
    if (flat || !showVideo || status !== 'booked') return undefined;
    let cancelMove = () => {};
    const t = setTimeout(() => {
      cancelMove = moveCursorWhenReady(calCheckRef, { delay: 40 }) ?? (() => {});
    }, 520);
    return () => { clearTimeout(t); cancelMove(); };
  }, [flat, showVideo, status, moveCursorWhenReady]);

  const goal      = HERO_CAREER_DEMO;
  const mentors   = goal.mentorIds.map(findMentor).filter(Boolean);
  const topMentor = mentors[0];
  const isBooked  = status === 'booked';

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col items-center select-none"
    >
      <style>{`
        @keyframes vc-ring { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.7);opacity:0} }
        @keyframes vc-dot  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes mtr-pop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
      `}</style>

      {!flat && <Cursor x={springX} y={springY} visible={cursorVis} clicking={clicking} />}

      <div className="relative w-full" style={{ maxWidth: STAGE_W }}>
        <motion.div
          className="relative flex w-full flex-col items-center"
          animate={{ y: showVideo && status === 'booked' ? Math.round(-14 * STAGE_R) : 0 }}
          transition={WOOSH_SPRING}
        >
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: Math.round(56 * STAGE_R),
            height: Math.round(56 * STAGE_R),
            marginBottom: Math.round(-20 * STAGE_R),
            borderRadius: '50%',
            background: TONE_GRAD[topMentor?.tone] || 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: Math.round(14 * STAGE_R),
            fontWeight: 900,
            color: 'var(--color-on-primary)',
            letterSpacing: '-0.04em',
            border: `${Math.round(3 * STAGE_R)}px solid var(--bridge-surface)`,
            boxShadow: '0 8px 24px -8px color-mix(in srgb, var(--color-primary) 45%, transparent)',
            flexShrink: 0
          }}
          aria-hidden
        >
          {ini(topMentor?.name ?? '')}
        </div>

        <div
          ref={cardRef}
          style={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            maxWidth: STAGE_W,
            flexShrink: 0,
            backgroundColor: 'var(--bridge-surface)',
            border: '1px solid var(--bridge-border)',
            borderRadius: Math.round(20 * STAGE_R),
            boxShadow:
              '0 0 0 1px var(--bridge-shadow-ring), 0 2px 4px var(--bridge-shadow-soft), 0 16px 40px -12px color-mix(in srgb, var(--color-primary) 20%, transparent), 0 36px 72px -24px color-mix(in srgb, var(--color-secondary) 12%, transparent)'
          }}
        >
        <div style={{ minHeight: Math.round(58 * STAGE_R), padding:`${Math.round(16 * STAGE_R)}px ${Math.round(18 * STAGE_R)}px ${Math.round(12 * STAGE_R)}px`, display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
          <motion.div
            initial={false}
            animate={{ opacity: isBooked ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            style={{ position: isBooked ? 'absolute' : 'relative', inset: isBooked ? '16px 18px 12px 18px' : undefined, display:'flex', alignItems:'center', justifyContent:'space-between', pointerEvents: isBooked ? 'none' : 'auto' }}
          >
            <p style={{ fontSize:Math.round(17 * STAGE_R),fontWeight:800,letterSpacing:'-0.02em',color:'var(--bridge-text)' }}>Find a mentor</p>
            <div style={{ width:Math.round(34 * STAGE_R),height:Math.round(34 * STAGE_R),borderRadius:'50%',background:'var(--bridge-canvas)',border:'1px solid var(--bridge-border)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <MessageCircle size={Math.round(15 * STAGE_R)} style={{ color:'var(--bridge-text-muted)' }} aria-hidden />
            </div>
          </motion.div>
          <motion.div
            initial={false}
            animate={{ opacity: isBooked ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: isBooked ? 'relative' : 'absolute', inset: isBooked ? undefined : '16px 18px 12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', width: isBooked ? '100%' : undefined, pointerEvents: isBooked ? 'auto' : 'none' }}
          >
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:Math.round(36 * STAGE_R),height:Math.round(36 * STAGE_R),borderRadius:'50%',background:TONE_GRAD[topMentor?.tone]||'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:Math.round(11 * STAGE_R),fontWeight:900,color:'white',letterSpacing:'-0.04em',flexShrink:0 }} aria-hidden>{ini(topMentor?.name??'')}</div>
              <p style={{ fontSize:Math.round(17 * STAGE_R),fontWeight:800,letterSpacing:'-0.02em',color:'var(--bridge-text)' }}>Session Booked</p>
            </div>
            <div style={{ width:Math.round(34 * STAGE_R),height:Math.round(34 * STAGE_R),borderRadius:'50%',background:'var(--bridge-canvas)',border:'1px solid var(--bridge-border)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <MessageCircle size={Math.round(15 * STAGE_R)} style={{ color:'var(--bridge-text-muted)' }} aria-hidden />
            </div>
          </motion.div>
        </div>

        <div style={{ position:'relative', minHeight: status === 'chips' ? CARD_BODY_MIN_H : undefined, margin:`0 ${Math.round(12 * STAGE_R)}px ${Math.round(16 * STAGE_R)}px` }}>
          <CardBodyLayer active={status === 'idle'} inline>
            <div ref={inputRef} style={{ width:'100%', padding:`${Math.round(11 * STAGE_R)}px ${Math.round(16 * STAGE_R)}px`,borderRadius:Math.round(12 * STAGE_R),background:'var(--bridge-canvas)',border:'1px solid var(--bridge-border)',display:'flex',alignItems:'center',gap:Math.round(10 * STAGE_R),boxSizing:'border-box' }}>
              <span style={{ fontSize:Math.round(14 * STAGE_R),color:'var(--color-primary)',flexShrink:0 }}>✏</span>
              <span style={{ flex:1,fontSize:Math.round(13.5 * STAGE_R),color:'var(--bridge-text-muted)' }}>What do you want to figure out?</span>
            </div>
          </CardBodyLayer>

          <CardBodyLayer active={status === 'chips'}>
            <div style={{ display:'flex', flexDirection:'column', gap:Math.round(8 * STAGE_R), width:'100%' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:Math.round(7 * STAGE_R) }}>
                {HERO_BROWSE_CHIPS.map((chip) => (
                  <div key={chip}
                    style={{ display:'flex',alignItems:'center',gap:Math.round(5 * STAGE_R),padding:`${Math.round(8 * STAGE_R)}px ${Math.round(11 * STAGE_R)}px`,borderRadius:Math.round(10 * STAGE_R),background:'var(--bridge-canvas)',border:'1px solid var(--bridge-border)',fontSize:Math.round(12 * STAGE_R),fontWeight:500,lineHeight:1.25,color:'var(--bridge-text-secondary)',userSelect:'none',textAlign:'left' }}>
                    <span style={{ color:'var(--bridge-text-faint)',fontWeight:400,flexShrink:0 }}>#</span>
                    <span>{chip}</span>
                  </div>
                ))}
              </div>
              <div ref={chipRef} style={{ width:'100%', padding:`${Math.round(10 * STAGE_R)}px ${Math.round(12 * STAGE_R)}px`,borderRadius:Math.round(11 * STAGE_R),background:'color-mix(in srgb,var(--color-primary) 9%,var(--bridge-canvas))',border:'1px solid color-mix(in srgb,var(--color-primary) 30%,transparent)',display:'flex',alignItems:'center',gap:Math.round(8 * STAGE_R),boxSizing:'border-box' }}>
                <span style={{ fontSize:Math.round(14 * STAGE_R),color:'var(--color-primary)' }}>✏</span>
                <span style={{ fontSize:Math.round(13 * STAGE_R),fontWeight:600,color:'var(--bridge-text)' }}>{HERO_CAREER_DEMO.chip}</span>
              </div>
            </div>
          </CardBodyLayer>

          <CardBodyLayer active={status === 'selected'} inline>
            <div style={{ width:'100%',display:'flex',alignItems:'center',gap:Math.round(6 * STAGE_R),padding:`${Math.round(9 * STAGE_R)}px ${Math.round(14 * STAGE_R)}px`,borderRadius:Math.round(11 * STAGE_R),background:'color-mix(in srgb,var(--color-primary) 9%,var(--bridge-canvas))',border:'1px solid color-mix(in srgb,var(--color-primary) 30%,transparent)',fontSize:Math.round(13 * STAGE_R),fontWeight:500,color:'var(--color-primary)',boxSizing:'border-box' }}>
              <span style={{ color:'var(--bridge-text-faint)',fontWeight:400,flexShrink:0 }}>#</span>
              <span>{goal.chip}</span>
            </div>
          </CardBodyLayer>

          <CardBodyLayer active={status === 'booked'} inline>
            <div>
              <div style={{ marginBottom:Math.round(10 * STAGE_R),display:'inline-flex',alignItems:'center',gap:Math.round(6 * STAGE_R),padding:`${Math.round(7 * STAGE_R)}px ${Math.round(13 * STAGE_R)}px`,borderRadius:Math.round(10 * STAGE_R),background:'var(--bridge-canvas)',border:'1px solid var(--bridge-border)',fontSize:Math.round(12.5 * STAGE_R),color:'var(--bridge-text-secondary)' }}>
                <span style={{ color:'var(--bridge-text-faint)' }}>#</span>
                {goal.chip}
              </div>
              <div style={{ padding:`${Math.round(11 * STAGE_R)}px ${Math.round(14 * STAGE_R)}px`,borderRadius:Math.round(12 * STAGE_R),background:'var(--bridge-canvas)',display:'flex',alignItems:'center',gap:Math.round(12 * STAGE_R) }}>
                <div style={{ width:Math.round(38 * STAGE_R),height:Math.round(38 * STAGE_R),borderRadius:'50%',background:TONE_GRAD[topMentor?.tone]||'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:Math.round(12 * STAGE_R),fontWeight:900,color:'white',letterSpacing:'-0.04em',flexShrink:0 }} aria-hidden>{ini(topMentor?.name??'')}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:Math.round(13.5 * STAGE_R),fontWeight:700,color:'var(--bridge-text)',letterSpacing:'-0.01em',lineHeight:1.2 }}>{topMentor?.name}</p>
                  <p style={{ fontSize:Math.round(11 * STAGE_R),color:'var(--bridge-text-muted)',marginTop:2 }}>{topMentor?.title}</p>
                </div>
                <div ref={calCheckRef} style={{ width:Math.round(38 * STAGE_R),height:Math.round(38 * STAGE_R),borderRadius:'50%',background:'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 4px 12px -4px color-mix(in srgb,var(--color-primary) 60%,transparent)' }}>
                  <CalendarCheck size={Math.round(17 * STAGE_R)} style={{ color:'white' }} aria-hidden />
                </div>
              </div>
            </div>
          </CardBodyLayer>
        </div>
        </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {status === 'selected' && (
            <motion.div
              key="circles"
              initial={flat ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
              transition={{ duration: 0.28, ease: EASE }}
              className="flex w-full flex-col items-center"
            >
              <div aria-hidden className="mx-auto h-7 w-px shrink-0" style={{ backgroundColor: 'var(--bridge-border)' }} />
              <div className="flex items-center gap-4 pt-1">
                {mentors.slice(0, 3).map((m, i) => {
                  const isMiddle = i === 1;
                  const size = isMiddle ? Math.round(66 * STAGE_R) : Math.round(52 * STAGE_R);
                  return (
                    <div
                      key={m.id}
                      ref={isMiddle ? circleRef : null}
                      style={{
                        width: size,
                        height: size,
                        borderRadius: '50%',
                        background: TONE_GRAD[m.tone] || 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: Math.round(size * 0.27),
                        fontWeight: 900,
                        color: 'var(--color-on-primary)',
                        letterSpacing: '-0.04em',
                        border: `${Math.round(3 * STAGE_R)}px solid var(--bridge-surface)`,
                        boxShadow: isMiddle
                          ? '0 6px 20px -6px color-mix(in srgb, var(--color-primary) 35%, transparent)'
                          : '0 4px 12px -4px color-mix(in srgb, var(--color-secondary) 20%, transparent)',
                        flexShrink: 0,
                        animation: flat ? undefined : `mtr-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 120}ms both`,
                      }}
                      aria-hidden
                    >
                      {ini(m.name)}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {status === 'booked' && showVideo && (
            <motion.div
              key="video"
              initial={flat ? false : { opacity: 0, y: 56, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.96 }}
              transition={WOOSH_SPRING}
              className="mt-2 w-full"
            >
              <div aria-hidden className="mx-auto mb-2 h-5 w-px" style={{ backgroundColor: 'var(--bridge-border)' }} />
              <VideoCallPanel mentor={topMentor} flat={flat} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
