import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePerfTier } from './landingHooks';

const BRIDGE_LETTERS = ['B', 'R', 'I', 'D', 'G', 'E'];

const MOLTEN = 'linear-gradient(135deg,#ffffff 0%,color-mix(in srgb, var(--color-accent) 60%, #ffffff) 14%,var(--color-accent) 28%,color-mix(in srgb, var(--color-primary) 60%, var(--color-accent)) 44%,var(--color-primary) 60%,var(--color-primary-hover) 78%,color-mix(in srgb, var(--color-secondary) 70%, var(--color-primary-hover)) 92%,var(--color-secondary) 100%)';

const LETTER_VECTORS = [
  { lx: '-340px', ly: '-160px', rx: '70deg',  ry: '-90deg' },
  { lx: '300px',  ly: '-200px', rx: '-60deg', ry: '80deg'  },
  { lx: '-80px',  ly: '260px',  rx: '90deg',  ry: '-40deg' },
  { lx: '260px',  ly: '180px',  rx: '-80deg', ry: '-110deg'},
  { lx: '-360px', ly: '100px',  rx: '50deg',  ry: '120deg' },
  { lx: '320px',  ly: '-260px', rx: '-100deg',ry: '-60deg' },
];

const PARTICLES = Array.from({ length: 28 }, (_, i) => {
  const angle = (i / 28) * Math.PI * 2 + Math.random() * 0.4;
  return {
    angle,
    radius: 60 + Math.random() * 100,
    speed: 0.6 + Math.random() * 0.7,
    size: 1.5 + Math.random() * 2.5,
    delay: Math.random() * 0.4,
  };
});

// Suspension bridge geometry — quadratic bezier from tower1(300,180) → mid(800,520) → tower2(1300,220)
const BRIDGE_HANGERS = Array.from({ length: 26 }, (_, i) => {
  const t = 0.03 + i * (0.94 / 25);
  const omt = 1 - t;
  const x = omt * omt * 300 + 2 * t * omt * 800 + t * t * 1300;
  const y = omt * omt * 180 + 2 * t * omt * 520 + t * t * 220;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
});

// Far (background) bridge — smaller, farther suspension cables for depth
const BRIDGE_HANGERS_FAR = Array.from({ length: 18 }, (_, i) => {
  const t = 0.04 + i * (0.92 / 17);
  const omt = 1 - t;
  const x = omt * omt * 540 + 2 * t * omt * 850 + t * t * 1160;
  const y = omt * omt * 340 + 2 * t * omt * 470 + t * t * 360;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
});

// Deterministic stars (no random — SSR-stable)
const BRIDGE_STARS = Array.from({ length: 56 }, (_, i) => {
  const x = (i * 137 + 23) % 1600;
  const y = (i * 47 + 11) % 360;
  const r = 0.35 + ((i * 7) % 11) / 11;
  const delay = ((i * 13) % 50) / 10;
  const dur = 2 + ((i * 5) % 30) / 10;
  return { x, y, r, delay, dur };
});

// Deck lights along the bridge — small twinkling lights
const BRIDGE_DECK_LIGHTS = Array.from({ length: 22 }, (_, i) => {
  const x = 80 + i * 70;
  const delay = ((i * 11) % 40) / 10;
  return { x, delay };
});

const INTRO_CSS = `
  @keyframes brBlobIn{0%{opacity:0;transform:scale(0.05) rotate(-160deg);filter:blur(48px) brightness(2);}55%{opacity:1;filter:blur(6px) brightness(1.4);}100%{opacity:1;transform:scale(1) rotate(0deg);filter:blur(0) brightness(1.05);}}
  @keyframes brBlobMorph{0%{opacity:1;transform:scale(1) rotate(0);filter:blur(0) brightness(1);}40%{opacity:1;transform:scale(1.25) rotate(8deg);filter:blur(3px) brightness(1.6);}100%{opacity:0;transform:scale(2.4) rotate(20deg);filter:blur(28px) brightness(0.9);}}
  @keyframes brBlobBreathe{0%,100%{transform:scale(1) rotate(0deg);}50%{transform:scale(1.04) rotate(2deg);}}
  @keyframes brLiquidShape{0%,100%{d:path("M100,30 C145,32 175,68 175,108 C175,154 145,180 100,180 C58,182 25,150 28,108 C25,68 58,28 100,30 Z");}33%{d:path("M100,38 C152,30 178,78 168,118 C172,162 132,184 95,178 C52,176 22,142 36,100 C30,68 60,40 100,38 Z");}66%{d:path("M100,32 C140,42 184,72 170,116 C180,156 138,186 100,178 C56,180 30,160 32,112 C20,72 56,30 100,32 Z");}}
  @keyframes brLetterIn{0%{opacity:0;transform:translate3d(var(--lx),var(--ly),-1200px) rotateX(var(--rx)) rotateY(var(--ry)) scale(0.18);filter:blur(40px) brightness(2.4);}25%{opacity:1;filter:blur(14px) brightness(1.8);}55%{filter:blur(2px) brightness(1.3);}78%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) scale(1.08);filter:blur(0) brightness(1.15);}90%{transform:translate3d(0,0,0) rotateX(0) rotateY(0) scale(0.98);}100%{opacity:1;transform:translate3d(0,0,0) rotateX(0) rotateY(0) scale(1);filter:blur(0) brightness(1);}}
  @keyframes brWipeOut{0%{clip-path:inset(0 0 0 0);-webkit-clip-path:inset(0 0 0 0);}100%{clip-path:inset(50% 0 50% 0);-webkit-clip-path:inset(50% 0 50% 0);opacity:0;}}
  @keyframes brStageOut{0%{opacity:1;transform:scale(1);filter:blur(0);}100%{opacity:0;transform:scale(1.18);filter:blur(20px);}}
  @keyframes brShimmer{0%{background-position:-200% 50%;}100%{background-position:200% 50%;}}
  @keyframes brAura{0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.45;}50%{transform:translate(-50%,-50%) scale(1.25);opacity:0.8;}}
  @keyframes brAccent{0%{transform:scaleX(0);opacity:0;}100%{transform:scaleX(1);opacity:1;}}
  @keyframes brTagIn{0%{opacity:0;transform:translateY(20px) scale(0.9);filter:blur(8px);}100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}
  @keyframes brOrbDrift{0%{transform:translate(-50%,-50%) translate(0,0);}33%{transform:translate(-50%,-50%) translate(3vmin,-2vmin);}66%{transform:translate(-50%,-50%) translate(-2vmin,3vmin);}100%{transform:translate(-50%,-50%) translate(0,0);}}
  @keyframes brOrbIn{0%{opacity:0;transform:translate(-50%,-50%) scale(0);}100%{opacity:1;transform:translate(-50%,-50%) scale(1);}}
  @keyframes brParticle{0%{opacity:0;transform:translate(-50%,-50%) scale(0);}25%{opacity:1;transform:translate(calc(var(--px)*0.6),calc(var(--py)*0.6)) scale(1);}100%{opacity:0;transform:translate(calc(var(--px)*1.8),calc(var(--py)*1.8)) scale(0.2);}}
  @keyframes brShockwave{0%{opacity:0;transform:scale(0.2);border-width:2px;}25%{opacity:1;}100%{opacity:0;transform:scale(3.2);border-width:0;}}
  @keyframes brFlash{0%,100%{opacity:0;}30%{opacity:0.55;}}
  @keyframes brGoldShift{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
  @keyframes brBridgeIn{0%{opacity:0;transform:scale(1.18) translateY(40px);filter:blur(22px) brightness(0.6);}30%{opacity:0.85;filter:blur(4px) brightness(0.85);}100%{opacity:1;transform:scale(1.06) translateY(-1%);filter:blur(0) brightness(1);}}
  @keyframes brStarTwinkle{0%,100%{opacity:0.25;}50%{opacity:1;}}
  @keyframes brCableSway{0%,100%{transform:translateY(0);}50%{transform:translateY(1px);}}
  @keyframes brBeacon{0%,100%{opacity:0.4;transform:scale(1);}50%{opacity:1;transform:scale(1.4);}}
  @keyframes brDeckLight{0%,100%{opacity:0.5;}50%{opacity:1;}}
  @keyframes brFogDrift{0%{transform:translateX(0);}100%{transform:translateX(-30px);}}
  @keyframes brHorizonGlow{0%,100%{opacity:0.55;}50%{opacity:0.85;}}
  @media (prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;animation-iteration-count:1!important;}}
`;

const TOTAL_MS = 3600;

export default function IntroLoader() {
  const tier = usePerfTier();
  const isLow = tier === 'low';
  const isMid = tier === 'mid';
  const lite = isLow || isMid;
  const totalMs = isLow ? 1800 : isMid ? 2800 : 3600;
  const wipeStart = isLow ? 1.0 : isMid ? 1.85 : 2.65;
  const stageOut = isLow ? 0.85 : isMid ? 1.65 : 2.45;
  const flashAt = wipeStart;
  const [done, setDone] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (sessionStorage.getItem('bridge_intro_seen') === '1') setDone(true);
    } catch {
      setDone(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted || done) return;
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    const finish = () => {
      try { sessionStorage.setItem('bridge_intro_seen', '1'); } catch {}
      setDone(true);
    };
    const timer = setTimeout(finish, totalMs);
    const skip = () => { clearTimeout(timer); finish(); };
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', skip);
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
    };
  }, [mounted, done]);

  if (done) return null;

  const dismiss = () => {
    try { sessionStorage.setItem('bridge_intro_seen', '1'); } catch {}
    setDone(true);
  };

  return createPortal(
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[10000] cursor-pointer select-none overflow-hidden"
      style={{
        animation: `brWipeOut ${isLow ? 0.6 : 0.95}s cubic-bezier(0.76,0,0.24,1) ${wipeStart}s forwards`,
        willChange: 'clip-path,opacity',
      }}
    >
      <style>{INTRO_CSS}</style>

      {/* SVG defs for liquid shape */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <linearGradient id="brMolten" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="18%" stopColor="var(--color-accent)" />
            <stop offset="38%" stopColor="var(--color-primary)" />
            <stop offset="60%" stopColor="var(--color-primary)" />
            <stop offset="80%" stopColor="var(--color-primary-hover)" />
            <stop offset="100%" stopColor="var(--color-secondary)" />
          </linearGradient>
          <radialGradient id="brHighlight" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor="color-mix(in srgb, var(--color-on-primary) 95%, transparent)" />
            <stop offset="40%" stopColor="color-mix(in srgb, var(--color-accent) 40%, transparent)" />
            <stop offset="100%" stopColor="rgba(124,45,18,0)" />
          </radialGradient>
        </defs>
      </svg>

      {/* BASE BACKGROUND */}
      <div aria-hidden className="absolute inset-0 z-[1]" style={{
        background: 'radial-gradient(ellipse 120% 90% at 50% 50%,#1c0e07 0%,#0c0604 45%,#000 100%)',
      }} />

      {/* 3D SUSPENSION BRIDGE SCENE — skipped on low-tier */}
      {!isLow && <div aria-hidden className="absolute inset-0 z-[2] pointer-events-none overflow-hidden" style={{
        opacity: 0,
        animation: `brBridgeIn ${isMid ? 1.6 : 3.4}s cubic-bezier(0.22,1,0.36,1) 0.05s forwards`,
        willChange: 'transform,opacity',
        contain: 'strict',
      }}>
        <svg
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMax slice"
          width="100%"
          height="100%"
          style={{ display: 'block', shapeRendering: 'geometricPrecision' }}
        >
          <defs>
            <linearGradient id="brSkyBg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0a0503" />
              <stop offset="55%" stopColor="#1a0a04" />
              <stop offset="100%" stopColor="#2a1208" />
            </linearGradient>
            <radialGradient id="brHorizonAura" cx="50%" cy="100%" r="65%">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--color-accent) 55%, transparent)" />
              <stop offset="35%" stopColor="color-mix(in srgb, var(--color-primary) 30%, transparent)" />
              <stop offset="70%" stopColor="rgba(124,45,18,0.10)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <linearGradient id="brTowerMetal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a0a04" />
              <stop offset="50%" stopColor="#0d0502" />
              <stop offset="100%" stopColor="#050201" />
            </linearGradient>
            <linearGradient id="brTowerRim" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--color-accent) 85%, transparent)" />
              <stop offset="35%" stopColor="color-mix(in srgb, var(--color-primary) 45%, transparent)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="brCableMain" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="color-mix(in srgb, var(--color-accent) 85%, transparent)" />
              <stop offset="50%" stopColor="color-mix(in srgb, var(--color-on-primary) 95%, transparent)" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--color-primary) 70%, transparent)" />
            </linearGradient>
            <linearGradient id="brDeckGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2a1208" />
              <stop offset="40%" stopColor="#1a0a04" />
              <stop offset="100%" stopColor="#000" />
            </linearGradient>
            <linearGradient id="brWaterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(124,45,18,0.5)" />
              <stop offset="50%" stopColor="rgba(20,8,4,0.8)" />
              <stop offset="100%" stopColor="#000" />
            </linearGradient>
            <linearGradient id="brFogGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="60%" stopColor="color-mix(in srgb, var(--color-primary) 10%, transparent)" />
              <stop offset="100%" stopColor="color-mix(in srgb, var(--color-primary) 22%, transparent)" />
            </linearGradient>
            <radialGradient id="brBeaconGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="40%" stopColor="color-mix(in srgb, var(--color-primary) 60%, transparent)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="brBloom" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sky */}
          <rect width="1600" height="900" fill="url(#brSkyBg)" />

          {/* Stars — fewer + no twinkle on mid */}
          <g>
            {BRIDGE_STARS.slice(0, isMid ? 24 : BRIDGE_STARS.length).map((s, i) => (
              <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" style={{
                animation: isMid ? 'none' : `brStarTwinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
                opacity: isMid ? 0.55 : 0.4,
              }} />
            ))}
          </g>

          {/* Horizon aura — orange glow on the horizon matching brand */}
          <ellipse cx="800" cy="560" rx="900" ry="240" fill="url(#brHorizonAura)" style={{
            animation: 'brHorizonGlow 6s ease-in-out infinite',
          }} />

          {/* Distant mountains/cityscape silhouette */}
          <path
            d="M0,540 L60,520 L120,530 L180,505 L240,520 L300,498 L360,512 L420,490 L480,505 L540,495 L600,510 L660,488 L720,500 L780,495 L840,485 L900,500 L960,490 L1020,510 L1080,495 L1140,505 L1200,488 L1260,500 L1320,495 L1380,510 L1440,498 L1500,508 L1560,500 L1600,510 L1600,560 L0,560 Z"
            fill="rgba(15,7,3,0.92)"
          />

          {/* Far bridge — smaller suspension in deep background for depth */}
          <g opacity="0.45">
            {/* far cable */}
            <path
              d="M540,340 Q850,470 1160,360"
              stroke="color-mix(in srgb, var(--color-accent) 50%, transparent)"
              strokeWidth="1"
              fill="none"
            />
            {/* far hangers */}
            {BRIDGE_HANGERS_FAR.map((h, i) => (
              <line key={i} x1={h.x} y1={h.y} x2={h.x} y2="490" stroke="color-mix(in srgb, var(--color-primary) 18%, transparent)" strokeWidth="0.6" />
            ))}
            {/* far towers */}
            <rect x="535" y="340" width="10" height="150" fill="#0a0402" />
            <rect x="1155" y="360" width="9" height="130" fill="#0a0402" />
            <rect x="540" y="340" width="2" height="150" fill="color-mix(in srgb, var(--color-accent) 35%, transparent)" />
            <rect x="1158" y="360" width="2" height="130" fill="color-mix(in srgb, var(--color-accent) 30%, transparent)" />
            {/* far deck */}
            <rect x="500" y="488" width="700" height="3" fill="#0a0402" />
          </g>

          {/* Water/reflection */}
          <rect y="540" width="1600" height="360" fill="url(#brWaterGrad)" />

          {/* Water highlights — horizontal streaks */}
          <g opacity="0.4">
            <line x1="0" y1="600" x2="1600" y2="600" stroke="color-mix(in srgb, var(--color-accent) 18%, transparent)" strokeWidth="0.8" strokeDasharray="40 60" />
            <line x1="0" y1="640" x2="1600" y2="640" stroke="color-mix(in srgb, var(--color-primary) 15%, transparent)" strokeWidth="0.6" strokeDasharray="30 80" />
            <line x1="0" y1="700" x2="1600" y2="700" stroke="color-mix(in srgb, var(--color-primary) 10%, transparent)" strokeWidth="0.5" strokeDasharray="60 40" />
            <line x1="0" y1="780" x2="1600" y2="780" stroke="color-mix(in srgb, var(--color-accent) 8%, transparent)" strokeWidth="0.4" strokeDasharray="20 70" />
          </g>

          {/* MAIN BRIDGE — primary suspension cables (no sway on mid) */}
          <g style={isMid ? undefined : { animation: 'brCableSway 6s ease-in-out infinite', transformOrigin: '800px 540px' }}>
            {/* Main parabolic cable (front) */}
            <path
              d="M300,180 Q800,520 1300,220"
              stroke="url(#brCableMain)"
              strokeWidth="2.2"
              fill="none"
              filter={isMid ? undefined : 'url(#brBloom)'}
            />
            {/* Secondary cable (slightly offset for thickness/depth) */}
            <path
              d="M300,184 Q800,524 1300,224"
              stroke="color-mix(in srgb, var(--color-primary) 50%, transparent)"
              strokeWidth="1.2"
              fill="none"
            />
            {/* Vertical hangers */}
            {BRIDGE_HANGERS.map((h, i) => (
              <line
                key={i}
                x1={h.x}
                y1={h.y}
                x2={h.x}
                y2="540"
                stroke="color-mix(in srgb, var(--color-primary) 55%, transparent)"
                strokeWidth="0.8"
              />
            ))}
          </g>

          {/* Tower 1 — closer (left) */}
          <g>
            {/* Tower base shadow */}
            <ellipse cx="300" cy="545" rx="40" ry="6" fill="rgba(0,0,0,0.6)" />
            {/* Main tower body */}
            <rect x="285" y="180" width="30" height="362" fill="url(#brTowerMetal)" />
            {/* Inner column lines for detail */}
            <line x1="296" y1="180" x2="296" y2="540" stroke="rgba(0,0,0,0.5)" strokeWidth="0.5" />
            <line x1="304" y1="180" x2="304" y2="540" stroke="rgba(0,0,0,0.5)" strokeWidth="0.5" />
            {/* Tower top crown */}
            <rect x="278" y="170" width="44" height="14" fill="url(#brTowerMetal)" />
            <rect x="282" y="160" width="36" height="12" fill="url(#brTowerMetal)" />
            {/* Cross beams */}
            <rect x="280" y="280" width="40" height="8" fill="url(#brTowerMetal)" />
            <rect x="280" y="380" width="40" height="8" fill="url(#brTowerMetal)" />
            <rect x="282" y="450" width="36" height="6" fill="url(#brTowerMetal)" />
            {/* Rim light on right edge (catches the orange glow) */}
            <rect x="313" y="170" width="2.5" height="372" fill="url(#brTowerRim)" opacity="0.85" />
            {/* Top warning beacon */}
            <circle cx="300" cy="158" r="14" fill="url(#brBeaconGlow)" style={{
              animation: 'brBeacon 2.4s ease-in-out infinite',
              transformOrigin: '300px 158px',
            }} />
            <circle cx="300" cy="158" r="2.5" fill="#ffffff" />
          </g>

          {/* Tower 2 — farther (right) */}
          <g>
            <ellipse cx="1300" cy="545" rx="32" ry="5" fill="rgba(0,0,0,0.55)" />
            <rect x="1289" y="220" width="22" height="322" fill="url(#brTowerMetal)" />
            <line x1="1297" y1="220" x2="1297" y2="540" stroke="rgba(0,0,0,0.5)" strokeWidth="0.5" />
            <line x1="1303" y1="220" x2="1303" y2="540" stroke="rgba(0,0,0,0.5)" strokeWidth="0.5" />
            <rect x="1283" y="212" width="34" height="11" fill="url(#brTowerMetal)" />
            <rect x="1287" y="204" width="26" height="9" fill="url(#brTowerMetal)" />
            <rect x="1289" y="310" width="22" height="6" fill="url(#brTowerMetal)" />
            <rect x="1289" y="400" width="22" height="6" fill="url(#brTowerMetal)" />
            <rect x="1289" y="475" width="22" height="5" fill="url(#brTowerMetal)" />
            <rect x="1309" y="212" width="2" height="330" fill="url(#brTowerRim)" opacity="0.7" />
            <circle cx="1300" cy="202" r="11" fill="url(#brBeaconGlow)" style={{
              animation: 'brBeacon 2.8s ease-in-out 0.6s infinite',
              transformOrigin: '1300px 202px',
            }} />
            <circle cx="1300" cy="202" r="2" fill="#ffffff" />
          </g>

          {/* BRIDGE DECK — silhouette stretching across */}
          <rect x="0" y="538" width="1600" height="22" fill="url(#brDeckGrad)" />
          {/* Deck top edge — bright rim */}
          <rect x="0" y="537" width="1600" height="1.5" fill="color-mix(in srgb, var(--color-accent) 70%, transparent)" filter={isMid ? undefined : 'url(#brBloom)'} />
          {/* Deck bottom truss shadow */}
          <rect x="0" y="556" width="1600" height="6" fill="rgba(0,0,0,0.7)" />

          {/* Truss diagonals beneath deck */}
          <g opacity="0.4">
            {Array.from({ length: 32 }).map((_, i) => {
              const x = i * 50;
              return (
                <g key={i}>
                  <line x1={x} y1="556" x2={x + 25} y2="568" stroke="rgba(124,45,18,0.6)" strokeWidth="0.6" />
                  <line x1={x + 25} y1="568" x2={x + 50} y2="556" stroke="rgba(124,45,18,0.6)" strokeWidth="0.6" />
                </g>
              );
            })}
          </g>

          {/* Twinkling deck lights — fewer + no infinite anim on mid */}
          {BRIDGE_DECK_LIGHTS.slice(0, isMid ? 10 : BRIDGE_DECK_LIGHTS.length).map((l, i) => (
            <g key={i}>
              <circle cx={l.x} cy="535" r="3" fill="url(#brBeaconGlow)" style={{
                animation: isMid ? 'none' : `brDeckLight ${2.5 + (i % 3) * 0.3}s ease-in-out ${l.delay}s infinite`,
                opacity: isMid ? 0.85 : 1,
              }} />
              <circle cx={l.x} cy="535" r="0.8" fill="#ffffff" />
              {!isMid && <ellipse cx={l.x} cy="572" rx="2.5" ry="14" fill="color-mix(in srgb, var(--color-accent) 20%, transparent)" style={{
                animation: `brDeckLight ${3 + (i % 3) * 0.3}s ease-in-out ${l.delay}s infinite`,
              }} />}
            </g>
          ))}

          {/* Atmospheric fog over water — static on mid */}
          <g style={isMid ? undefined : { animation: 'brFogDrift 18s linear infinite' }}>
            <ellipse cx="200" cy="600" rx="380" ry="40" fill="color-mix(in srgb, var(--color-primary) 10%, transparent)" />
            <ellipse cx="800" cy="610" rx="500" ry="50" fill="color-mix(in srgb, var(--color-accent) 8%, transparent)" />
            <ellipse cx="1400" cy="600" rx="380" ry="38" fill="color-mix(in srgb, var(--color-primary) 10%, transparent)" />
          </g>

          {/* Bottom fog gradient overlay */}
          <rect y="540" width="1600" height="360" fill="url(#brFogGrad)" />

          {/* Final foreground vignette darkness on edges */}
          <radialGradient id="brSceneVignette" cx="50%" cy="60%" r="65%">
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </radialGradient>
          <rect width="1600" height="900" fill="url(#brSceneVignette)" />
        </svg>
      </div>}

      {/* Wipe seam glow — thin gold line at center revealed during wipe */}
      <div className="absolute left-0 right-0 z-[6] pointer-events-none" style={{
        top: '50%',
        height: '2px',
        transform: 'translateY(-1px)',
        background: 'linear-gradient(90deg,transparent,color-mix(in srgb, var(--color-accent) 95%, transparent) 30%,var(--color-on-primary) 50%,color-mix(in srgb, var(--color-accent) 95%, transparent) 70%,transparent)',
        boxShadow: '0 0 30px color-mix(in srgb, var(--color-primary) 90%, transparent),0 0 60px color-mix(in srgb, var(--color-accent) 70%, transparent)',
        opacity: 0,
        animation: `brFlash 0.9s cubic-bezier(0.22,1,0.36,1) ${flashAt}s forwards`,
      }} />

      {/* Atmosphere orbs — fewer + no infinite drift on lite */}
      {(isLow ? [
        { x: '50%', y: '50%', c: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', s: '60vmin', d: '14s', delay: 0.0 },
      ] : isMid ? [
        { x: '30%', y: '38%', c: 'color-mix(in srgb, var(--color-primary) 28%, transparent)', s: '54vmin', d: '14s', delay: 0.0 },
        { x: '70%', y: '62%', c: 'color-mix(in srgb, var(--color-primary) 22%, transparent)', s: '58vmin', d: '18s', delay: 0.1 },
      ] : [
        { x: '28%', y: '32%', c: 'color-mix(in srgb, var(--color-primary) 30%, transparent)', s: '50vmin', d: '14s', delay: 0.0 },
        { x: '72%', y: '68%', c: 'color-mix(in srgb, var(--color-primary) 24%, transparent)', s: '56vmin', d: '18s', delay: 0.1 },
        { x: '50%', y: '50%', c: 'color-mix(in srgb, var(--color-accent) 18%, transparent)', s: '64vmin', d: '22s', delay: 0.2 },
      ]).map((o, i) => (
        <div key={i} aria-hidden className="absolute z-[2] rounded-full pointer-events-none" style={{
          left: o.x, top: o.y, width: o.s, height: o.s,
          background: `radial-gradient(circle,${o.c} 0%,transparent 65%)`,
          filter: lite ? 'blur(28px)' : 'blur(50px)',
          opacity: 0,
          animation: lite
            ? `brOrbIn 0.9s cubic-bezier(0.22,1,0.36,1) ${0.05 + o.delay}s forwards`
            : `brOrbIn 0.9s cubic-bezier(0.22,1,0.36,1) ${0.05 + o.delay}s forwards, brOrbDrift ${o.d} ease-in-out ${1 + o.delay}s infinite`,
        }} />
      ))}

      {/* Vignette */}
      <div aria-hidden className="absolute inset-0 z-[2] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 100% 75% at 50% 50%,transparent 35%,rgba(0,0,0,0.92) 100%)',
      }} />

      {/* Soft scanlines — skipped on lite (small repaint cost compounds on weak GPUs) */}
      {!lite && <div aria-hidden className="absolute inset-0 z-[2] pointer-events-none" style={{
        backgroundImage: 'repeating-linear-gradient(0deg,transparent 0px,transparent 2px,rgba(255,255,255,0.012) 3px)',
        opacity: 0.5,
      }} />}

      {/* CENTER STAGE — exits before wipe */}
      <div
        className="absolute inset-0 z-[3] flex flex-col items-center justify-center"
        style={{
          animation: `brStageOut 0.55s cubic-bezier(0.65,0,0.35,1) ${stageOut}s forwards`,
          willChange: 'transform,opacity,filter',
          perspective: '1400px',
        }}
      >
        {/* Aura behind logo */}
        <div aria-hidden className="absolute pointer-events-none" style={{
          left: '50%', top: '50%',
          width: '70vmin', height: '70vmin',
          background: 'radial-gradient(circle,color-mix(in srgb, var(--color-primary) 45%, transparent) 0%,color-mix(in srgb, var(--color-primary) 22%, transparent) 32%,transparent 65%)',
          filter: lite ? 'blur(36px)' : 'blur(70px)',
          animation: lite ? 'none' : 'brAura 2.6s ease-in-out infinite',
          transform: 'translate(-50%,-50%)',
        }} />

        {/* Particles bursting out at morph moment — fewer / none on lite */}
        {!isLow && PARTICLES.slice(0, isMid ? 12 : PARTICLES.length).map((p, i) => (
          <div key={i} aria-hidden className="absolute rounded-full pointer-events-none" style={{
            left: '50%', top: '50%',
            width: `${p.size}px`, height: `${p.size}px`,
            background: i % 3 === 0 ? '#ffffff' : i % 3 === 1 ? 'var(--color-accent)' : 'var(--color-primary)',
            boxShadow: isMid ? 'none' : `0 0 ${p.size * 3}px ${i % 3 === 0 ? 'color-mix(in srgb, var(--color-on-primary) 95%, transparent)' : i % 3 === 1 ? 'color-mix(in srgb, var(--color-accent) 85%, transparent)' : 'color-mix(in srgb, var(--color-primary) 85%, transparent)'}`,
            opacity: 0,
            '--px': `${Math.cos(p.angle) * p.radius}px`,
            '--py': `${Math.sin(p.angle) * p.radius}px`,
            animation: `brParticle ${1.0 + p.speed}s cubic-bezier(0.22,1,0.36,1) ${1.18 + p.delay}s forwards`,
          }} />
        ))}

        {/* Shockwave rings at morph — single ring on lite */}
        {(lite ? [0] : [0, 0.08, 0.16]).map((delay, i) => (
          <div key={i} aria-hidden className="absolute rounded-full pointer-events-none" style={{
            width: '20vmin', height: '20vmin',
            border: `${3 - i}px solid ${i === 0 ? 'color-mix(in srgb, var(--color-accent) 85%, transparent)' : i === 1 ? 'color-mix(in srgb, var(--color-primary) 65%, transparent)' : 'color-mix(in srgb, var(--color-primary) 50%, transparent)'}`,
            boxShadow: lite ? 'none' : `0 0 ${36 - i * 8}px color-mix(in srgb, var(--color-primary) 55%, transparent)`,
            opacity: 0,
            animation: `brShockwave ${1.0 + i * 0.12}s cubic-bezier(0.22,1,0.36,1) ${1.2 + delay}s forwards`,
          }} />
        ))}

        {/* PHASE 1 — Liquid molten "B" shape (0.05s → 1.6s morph out) */}
        <div className="absolute flex items-center justify-center" style={{
          width: 'clamp(220px,32vw,360px)',
          height: 'clamp(220px,32vw,360px)',
          opacity: 0,
          animation: 'brBlobIn 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.05s forwards, brBlobMorph 0.5s cubic-bezier(0.65,0,0.35,1) 1.18s forwards',
          willChange: 'transform,opacity,filter',
        }}>
          {/* Liquid shape backdrop */}
          <svg viewBox="0 0 200 200" width="100%" height="100%" style={{
            position: 'absolute',
            inset: 0,
            overflow: 'visible',
            animation: lite ? 'none' : 'brBlobBreathe 2.4s ease-in-out infinite',
            filter: lite ? 'drop-shadow(0 0 26px color-mix(in srgb, var(--color-primary) 65%, transparent))' : 'drop-shadow(0 0 50px color-mix(in srgb, var(--color-primary) 70%, transparent)) drop-shadow(0 0 90px color-mix(in srgb, var(--color-accent) 45%, transparent))',
          }}>
            <path
              d="M100,30 C145,32 175,68 175,108 C175,154 145,180 100,180 C58,182 25,150 28,108 C25,68 58,28 100,30 Z"
              fill="url(#brMolten)"
              style={lite ? undefined : { animation: 'brLiquidShape 2.4s ease-in-out infinite' }}
            />
            {/* Highlight overlay for liquid feel */}
            <ellipse cx="78" cy="72" rx="42" ry="28" fill="url(#brHighlight)" opacity="0.85" style={{ mixBlendMode: 'screen' }} />
          </svg>

          {/* Embossed "B" inside the liquid shape */}
          <span className="relative font-display font-black leading-none" style={{
            fontSize: 'clamp(7rem,15vw,11rem)',
            background: 'linear-gradient(160deg,color-mix(in srgb, var(--color-on-primary) 95%, transparent) 0%,color-mix(in srgb, var(--color-accent) 40%, transparent) 50%,rgba(124,45,18,0.85) 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            textShadow: '0 2px 0 rgba(124,45,18,0.5)',
            animation: 'brGoldShift 3s ease-in-out infinite',
            mixBlendMode: 'overlay',
          }}>B</span>
        </div>

        {/* PHASE 2 — BRIDGE wordmark (letters at 1.3s + 0.05s stagger) */}
        <div className="relative flex items-baseline font-display font-black" style={{
          fontSize: 'clamp(3.6rem,9vw,7rem)',
          letterSpacing: '-0.045em',
          perspective: '1600px',
          perspectiveOrigin: '50% 50%',
        }}>
          {BRIDGE_LETTERS.map((ch, i) => {
            const v = LETTER_VECTORS[i];
            return (
              <span key={i} style={{
                background: MOLTEN,
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                opacity: 0,
                display: 'inline-block',
                filter: 'drop-shadow(0 0 24px color-mix(in srgb, var(--color-primary) 50%, transparent)) drop-shadow(0 2px 0 rgba(124,45,18,0.4))',
                '--lx': v.lx,
                '--ly': v.ly,
                '--rx': v.rx,
                '--ry': v.ry,
                animation: `brLetterIn 0.95s cubic-bezier(0.22,1,0.36,1) ${1.30 + i * 0.05}s forwards, brGoldShift 3.2s ease-in-out ${1.85}s infinite`,
                willChange: 'transform,opacity,filter',
              }}>{ch}</span>
            );
          })}
        </div>

        {/* Underline accent */}
        <div className="mt-7 overflow-hidden" style={{
          height: '1.5px',
          width: 'clamp(140px,20vw,220px)',
          background: 'rgba(255,255,255,0.04)',
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg,transparent,color-mix(in srgb, var(--color-primary) 95%, transparent) 25%,var(--color-on-primary) 50%,var(--color-accent) 75%,transparent)',
            transformOrigin: 'left',
            transform: 'scaleX(0)',
            opacity: 0,
            animation: 'brAccent 0.7s cubic-bezier(0.22,1,0.36,1) 1.78s forwards',
          }} />
        </div>

        {/* Tagline */}
        <div className="mt-5 px-5 py-2 rounded-full" style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid color-mix(in srgb, var(--color-on-primary) 10%, transparent)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          opacity: 0,
          animation: 'brTagIn 0.6s cubic-bezier(0.22,1,0.36,1) 1.92s forwards',
        }}>
          <p className="text-center font-display font-semibold uppercase" style={{
            fontSize: 'clamp(0.55rem,0.95vw,0.7rem)',
            letterSpacing: '0.42em',
            color: 'color-mix(in srgb, var(--color-on-primary) 78%, transparent)',
          }}>
            Mentorship · Networking · Outcomes
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
