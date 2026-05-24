import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useSpring } from 'motion/react';
import { MessageCircle, CalendarCheck, Mic, Video, PhoneOff } from 'lucide-react';
import { MATCH_GOALS, findMentor } from './landingData';
import { EASE, usePerfTier } from './landingHooks';

const T_IDLE     = 1900;
const T_CHIPS    = 2600;
const T_SELECTED = 2600;
const T_BOOKED   = 3600;

const CARD_BODY_MIN_H = 124;
const STAGE_EXT_MIN_H = 248;

const TONE_GRAD = {
  amber:'linear-gradient(135deg,#4F46E5,#818CF8)', emerald:'linear-gradient(135deg,#059669,#10b981)',
  sky:'linear-gradient(135deg,#0EA5E9,#38BDF8)',   rose:'linear-gradient(135deg,#6D28D9,#A78BFA)',
  violet:'linear-gradient(135deg,#5B21B6,#A78BFA)',teal:'linear-gradient(135deg,#0D9488,#14B8A6)',
  orange:'linear-gradient(135deg,#4F46E5,#6366F1)',pink:'linear-gradient(135deg,#312E81,#818CF8)',
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
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--bridge-border)', boxShadow: '0 8px 24px -8px rgba(0,0,0,0.14)' }}>
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

function CardBodyLayer({ active, children }) {
  return (
    <motion.div
      aria-hidden={!active}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.22, ease: EASE }}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: active ? 'auto' : 'none',
        visibility: active ? 'visible' : 'hidden',
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

  const containerRef = useRef(null);
  const cardRef      = useRef(null);
  const inputRef     = useRef(null);
  const chipRef      = useRef(null);
  const circleRef    = useRef(null);
  const calCheckRef  = useRef(null);
  const bootedRef    = useRef(false);

  const rawX    = useMotionValue(0);
  const rawY    = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 280, damping: 26, mass: 0.55 });
  const springY = useSpring(rawY, { stiffness: 280, damping: 26, mass: 0.55 });
  const [cursorVis, setCursorVis] = useState(false);
  const [clicking, setClicking]   = useState(false);

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
    if (!p) return;
    if (immediate) {
      rawX.jump(p.x);
      rawY.jump(p.y);
    } else {
      rawX.set(p.x);
      rawY.set(p.y);
    }
  }, [getPos, rawX, rawY]);

  useEffect(() => {
    if (status !== 'booked') {
      setShowVideo(false);
      return;
    }
    if (flat) setShowVideo(true);
  }, [status, flat]);

  useEffect(() => {
    if (flat) return;
    const t1 = setTimeout(() => moveCursor(inputRef, true), 80);
    const t2 = setTimeout(() => setCursorVis(true), 420);
    const t3 = setTimeout(doClick, 1050);
    const t4 = setTimeout(() => { bootedRef.current = true; }, 300);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [flat, moveCursor, doClick]);

  useLayoutEffect(() => {
    if (flat || !cursorVis || !bootedRef.current) return;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      if (status === 'idle') moveCursor(inputRef);
      else if (status === 'chips') moveCursor(chipRef);
      else if (status === 'selected') moveCursor(circleRef);
      else if (status === 'booked') moveCursor(calCheckRef);
    };

    requestAnimationFrame(() => requestAnimationFrame(run));
    return () => { cancelled = true; };
  }, [status, flat, cursorVis, moveCursor]);

  useEffect(() => {
    if (flat || !cursorVis || !bootedRef.current) return;

    if (status === 'idle') {
      const t = setTimeout(doClick, 680);
      return () => clearTimeout(t);
    }
    if (status === 'chips') {
      const t = setTimeout(doClick, 1480);
      return () => clearTimeout(t);
    }
    if (status === 'selected') {
      const t = setTimeout(doClick, 1680);
      return () => clearTimeout(t);
    }
    if (status === 'booked') {
      const t1 = setTimeout(() => {
        doClick();
        setShowVideo(true);
      }, 980);
      const t2 = setTimeout(() => setCursorVis(false), 1280);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
    return undefined;
  }, [status, flat, cursorVis, doClick]);

  useEffect(() => {
    if (flat) return undefined;
    let timer = null;
    let loopReset = null;

    const durations = { idle: T_IDLE, chips: T_CHIPS, selected: T_SELECTED, booked: T_BOOKED };

    const onHidden = () => {
      if (document.hidden && timer) {
        clearTimeout(timer);
        timer = null;
      } else if (!document.hidden && !timer) {
        timer = setTimeout(advance, durations[status] ?? T_IDLE);
      }
    };

    const advance = () => {
      if (document.hidden) return;
      if (status === 'idle') {
        setCursorVis(true);
        setStatus('chips');
      } else if (status === 'chips') {
        setStatus('selected');
      } else if (status === 'selected') {
        setStatus('booked');
      } else if (status === 'booked') {
        loopReset = setTimeout(() => {
          setCursorVis(false);
          setStatus('idle');
          requestAnimationFrame(() => {
            moveCursor(inputRef, true);
            setCursorVis(true);
          });
        }, 80);
      }
    };

    timer = setTimeout(advance, durations[status] ?? T_IDLE);
    document.addEventListener('visibilitychange', onHidden);

    return () => {
      if (timer) clearTimeout(timer);
      if (loopReset) clearTimeout(loopReset);
      document.removeEventListener('visibilitychange', onHidden);
    };
  }, [status, flat, moveCursor]);

  const goal      = MATCH_GOALS[0];
  const mentors   = goal.mentorIds.map(findMentor).filter(Boolean);
  const topMentor = mentors[0];
  const isBooked  = status === 'booked';

  return (
    <div
      ref={containerRef}
      className="relative w-full flex flex-col items-center select-none"
      style={flat ? undefined : { minHeight: 548 }}
    >
      <style>{`
        @keyframes vc-ring { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(1.7);opacity:0} }
        @keyframes vc-dot  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes mtr-pop { 0%{transform:scale(0.5);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
      `}</style>

      {!flat && <Cursor x={springX} y={springY} visible={cursorVis} clicking={clicking} />}

      <div style={{ width:60,height:60,borderRadius:'50%',background:TONE_GRAD[topMentor?.tone]||'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:900,color:'white',letterSpacing:'-0.04em',border:'3px solid var(--bridge-surface)',boxShadow:'0 4px 16px -4px rgba(0,0,0,0.15)',flexShrink:0 }} aria-hidden>
        {ini(topMentor?.name??'')}
      </div>

      <div aria-hidden style={{ width:1,height:28,background:'var(--bridge-border)',flexShrink:0 }} />

      <div
        ref={cardRef}
        style={{
          width:'100%', maxWidth:400, flexShrink:0,
          backgroundColor:'var(--bridge-surface)',
          border:'1px solid var(--bridge-border)',
          borderRadius:20,
          boxShadow:'0 8px 32px -12px rgba(0,0,0,0.12),0 2px 8px -4px rgba(0,0,0,0.06)',
        }}
      >
        <div style={{ minHeight: 58, padding:'16px 18px 12px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative' }}>
          <motion.div
            initial={false}
            animate={{ opacity: isBooked ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            style={{ position: isBooked ? 'absolute' : 'relative', inset: isBooked ? '16px 18px 12px 18px' : undefined, display:'flex', alignItems:'center', justifyContent:'space-between', pointerEvents: isBooked ? 'none' : 'auto' }}
          >
            <p style={{ fontSize:17,fontWeight:800,letterSpacing:'-0.02em',color:'var(--bridge-text)' }}>Find a mentor</p>
            <div style={{ width:34,height:34,borderRadius:'50%',background:'var(--bridge-canvas)',border:'1px solid var(--bridge-border)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <MessageCircle size={15} style={{ color:'var(--bridge-text-muted)' }} aria-hidden />
            </div>
          </motion.div>
          <motion.div
            initial={false}
            animate={{ opacity: isBooked ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: isBooked ? 'relative' : 'absolute', inset: isBooked ? undefined : '16px 18px 12px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', width: isBooked ? '100%' : undefined, pointerEvents: isBooked ? 'auto' : 'none' }}
          >
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:36,height:36,borderRadius:'50%',background:TONE_GRAD[topMentor?.tone]||'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:'white',letterSpacing:'-0.04em',flexShrink:0 }} aria-hidden>{ini(topMentor?.name??'')}</div>
              <p style={{ fontSize:17,fontWeight:800,letterSpacing:'-0.02em',color:'var(--bridge-text)' }}>Session Booked</p>
            </div>
            <div style={{ width:34,height:34,borderRadius:'50%',background:'var(--bridge-canvas)',border:'1px solid var(--bridge-border)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
              <MessageCircle size={15} style={{ color:'var(--bridge-text-muted)' }} aria-hidden />
            </div>
          </motion.div>
        </div>

        <div style={{ position:'relative', minHeight: CARD_BODY_MIN_H, margin:'0 12px 16px' }}>
          <CardBodyLayer active={status === 'idle'}>
            <div ref={inputRef} style={{ padding:'11px 16px',borderRadius:12,background:'var(--bridge-canvas)',border:'1px solid var(--bridge-border)',display:'flex',alignItems:'center',gap:10 }}>
              <span style={{ fontSize:14,color:'var(--color-primary)' }}>✏</span>
              <span style={{ fontSize:13.5,color:'var(--bridge-text-muted)' }}>What do you want to figure out?</span>
            </div>
          </CardBodyLayer>

          <CardBodyLayer active={status === 'chips'}>
            <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
              {MATCH_GOALS.map((g,i) => {
                const active = i === 0;
                return (
                  <button key={g.chip} ref={active ? chipRef : null} type="button"
                    style={{ display:'flex',alignItems:'center',gap:6,padding:'9px 14px',borderRadius:11,background:active?'color-mix(in srgb,var(--color-primary) 9%,var(--bridge-canvas))':'var(--bridge-canvas)',border:`1px solid ${active?'color-mix(in srgb,var(--color-primary) 30%,transparent)':'var(--bridge-border)'}`,fontSize:13,fontWeight:500,color:active?'var(--color-primary)':'var(--bridge-text-secondary)',cursor:'default',userSelect:'none' }}>
                    <span style={{ color:'var(--bridge-text-faint)',fontWeight:400 }}>#</span>
                    {g.chip}
                  </button>
                );
              })}
            </div>
          </CardBodyLayer>

          <CardBodyLayer active={status === 'selected'}>
            <div style={{ display:'inline-flex',alignItems:'center',gap:6,padding:'9px 14px',borderRadius:11,background:'color-mix(in srgb,var(--color-primary) 9%,var(--bridge-canvas))',border:'1px solid color-mix(in srgb,var(--color-primary) 30%,transparent)',fontSize:13,fontWeight:500,color:'var(--color-primary)' }}>
              <span style={{ color:'var(--bridge-text-faint)',fontWeight:400 }}>#</span>
              {goal.chip}
            </div>
          </CardBodyLayer>

          <CardBodyLayer active={status === 'booked'}>
            <div>
              <div style={{ marginBottom:10,display:'inline-flex',alignItems:'center',gap:6,padding:'7px 13px',borderRadius:10,background:'var(--bridge-canvas)',border:'1px solid var(--bridge-border)',fontSize:12.5,color:'var(--bridge-text-secondary)' }}>
                <span style={{ color:'var(--bridge-text-faint)' }}>#</span>
                {goal.chip}
              </div>
              <div style={{ padding:'11px 14px',borderRadius:12,background:'var(--bridge-canvas)',display:'flex',alignItems:'center',gap:12 }}>
                <div style={{ width:38,height:38,borderRadius:'50%',background:TONE_GRAD[topMentor?.tone]||'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:900,color:'white',letterSpacing:'-0.04em',flexShrink:0 }} aria-hidden>{ini(topMentor?.name??'')}</div>
                <div style={{ flex:1,minWidth:0 }}>
                  <p style={{ fontSize:13.5,fontWeight:700,color:'var(--bridge-text)',letterSpacing:'-0.01em',lineHeight:1.2 }}>{topMentor?.name}</p>
                  <p style={{ fontSize:11,color:'var(--bridge-text-muted)',marginTop:2 }}>{topMentor?.title}</p>
                </div>
                <div ref={calCheckRef} style={{ width:38,height:38,borderRadius:'50%',background:'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 4px 12px -4px color-mix(in srgb,var(--color-primary) 60%,transparent)' }}>
                  <CalendarCheck size={17} style={{ color:'white' }} aria-hidden />
                </div>
              </div>
            </div>
          </CardBodyLayer>
        </div>
      </div>

      <div
        style={{
          width:'100%', maxWidth:400, minHeight: STAGE_EXT_MIN_H, flexShrink:0,
          position:'relative', display:'flex', flexDirection:'column', alignItems:'center',
        }}
      >
        <AnimatePresence initial={false} mode="sync">
          {status === 'selected' && (
            <motion.div
              key="circles"
              initial={flat ? false : { opacity:0 }}
              animate={{ opacity:1 }}
              exit={{ opacity:0 }}
              transition={{ duration:0.28, ease:EASE }}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'100%' }}
            >
              <div aria-hidden style={{ width:1,height:28,background:'var(--bridge-border)',flexShrink:0 }} />
              <div style={{ display:'flex',alignItems:'center',gap:14,paddingTop:4 }}>
                {mentors.slice(0,3).map((m,i)=>{
                  const isMiddle = i === 1;
                  const size = isMiddle ? 66 : 52;
                  return (
                    <div key={m.id} ref={isMiddle ? circleRef : null}
                      style={{ width:size,height:size,borderRadius:'50%',background:TONE_GRAD[m.tone]||'var(--color-primary)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:Math.round(size*0.27),fontWeight:900,color:'white',letterSpacing:'-0.04em',border:'3px solid var(--bridge-surface)',boxShadow:isMiddle?'0 6px 20px -6px rgba(0,0,0,0.2)':'0 4px 12px -4px rgba(0,0,0,0.14)',flexShrink:0,animation:flat?undefined:`mtr-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i*120}ms both` }} aria-hidden>
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
              initial={flat ? false : { opacity:0, y:8 }}
              animate={{ opacity:1, y:0 }}
              exit={{ opacity:0 }}
              transition={{ duration:0.32, ease:EASE }}
              style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center' }}
            >
              <div aria-hidden style={{ width:1,height:24,background:'var(--bridge-border)',flexShrink:0 }} />
              <VideoCallPanel mentor={topMentor} flat={flat} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
