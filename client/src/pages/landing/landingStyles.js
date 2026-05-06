export const LANDING_CSS = `
  /* ── Hero fade-up animation (used in HeroSection) ────────── */
  @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .animate-fade-in-up{animation:fadeInUp 0.8s ease-out forwards}
  .delay-300{animation-delay:300ms}
  .delay-500{animation-delay:500ms}
  .delay-700{animation-delay:700ms}
  .fill-mode-forwards{animation-fill-mode:forwards}

  /* ── Primary CTA button (landing-specific) ───────────────── */
  .lp-cta:hover{background-color:var(--color-primary-hover)!important;box-shadow:0 22px 50px -12px color-mix(in srgb, var(--color-primary) 75%, transparent)!important}
  .lp-cta:active{transform:translateY(0)!important;box-shadow:0 10px 28px -12px color-mix(in srgb, var(--color-primary) 55%, transparent)!important}

  /* ── Glow border breathe ──────────────────────────────────── */
  @keyframes bGlowBorder{0%,100%{box-shadow:0 0 0 1px color-mix(in srgb,var(--color-primary) 22%,transparent),0 0 18px color-mix(in srgb,var(--color-primary) 14%,transparent)}50%{box-shadow:0 0 0 1px color-mix(in srgb,var(--color-primary) 55%,transparent),0 0 44px color-mix(in srgb,var(--color-primary) 28%,transparent),0 0 80px color-mix(in srgb,var(--color-accent) 16%,transparent)}}
  .b-glow-border{animation:bGlowBorder 3.5s ease-in-out infinite}

  /* ── Light flare sweep ────────────────────────────────────── */
  @keyframes bFlare{0%{transform:translateX(-200%) skewX(-18deg);opacity:0}15%{opacity:.7}85%{opacity:.5}100%{transform:translateX(300%) skewX(-18deg);opacity:0}}
  .b-flare{position:relative;overflow:hidden}
  .b-flare::after{content:"";position:absolute;inset:0;width:40%;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.18) 50%,transparent 100%);animation:bFlare 6s cubic-bezier(.45,.05,.55,.95) infinite;pointer-events:none}

  /* ── Neon text pulse ──────────────────────────────────────── */
  @keyframes bNeonText{0%,100%{text-shadow:0 0 8px color-mix(in srgb,var(--color-primary) 55%,transparent),0 0 24px color-mix(in srgb,var(--color-primary) 28%,transparent)}50%{text-shadow:0 0 18px color-mix(in srgb,var(--color-primary) 90%,transparent),0 0 56px color-mix(in srgb,var(--color-primary) 55%,transparent),0 0 100px color-mix(in srgb,var(--color-accent) 32%,transparent)}}
  .b-neon-text{animation:bNeonText 3s ease-in-out infinite}

  /* ── Floating ring (section accents) ──────────────────────── */
  @keyframes bRingOrbit{0%{transform:perspective(600px) rotateX(68deg) rotate(0deg)}100%{transform:perspective(600px) rotateX(68deg) rotate(360deg)}}
  .b-ring-orbit{animation:bRingOrbit 18s linear infinite}
  .b-ring-orbit-rev{animation:bRingOrbit 24s linear infinite reverse}

  /* ── Grid background drift (light-mode panels) ────────────── */
  @keyframes bGridDrift{0%{background-position:0 0}100%{background-position:32px 32px}}
  .b-grid-drift{animation:bGridDrift 28s linear infinite}

  /* ── Card shimmer on hover (accent highlight sweep) ──────── */
  @keyframes bCardShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  .b-card-shimmer{background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.09) 50%,transparent 60%);background-size:220% 100%;animation:bCardShimmer 3.8s ease-in-out infinite}

  /* ── 3D tilt on scroll ────────────────────────────────────── */
  @keyframes bTiltIn{0%{transform:perspective(800px) rotateX(-22deg) translateY(30px);opacity:0}100%{transform:perspective(800px) rotateX(0deg) translateY(0);opacity:1}}
  .b-tilt-in{animation:bTiltIn .9s cubic-bezier(0.16,1,0.3,1) both}

  @keyframes bTicker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  @keyframes bTickerRev{from{transform:translateX(-50%)}to{transform:translateX(0)}}
  @keyframes bFloat{0%,100%{transform:translateY(0) rotate(-.4deg)}50%{transform:translateY(-13px) rotate(.4deg)}}
  @keyframes bFloatB{0%,100%{transform:translateY(0) rotate(.3deg)}50%{transform:translateY(-8px) rotate(-.5deg)}}
  @keyframes bBlob{0%,100%{border-radius:42% 58% 36% 64%/54% 44% 56% 46%}50%{border-radius:58% 42% 64% 36%/44% 58% 46% 54%}}
  @keyframes bSpin{to{transform:rotate(360deg)}}
  @keyframes bAppear{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
  @keyframes bPulse{0%{box-shadow:0 0 0 0 color-mix(in srgb, var(--color-primary) 65%, transparent)}70%{box-shadow:0 0 0 16px transparent}100%{box-shadow:0 0 0 0 transparent}}
  @keyframes bScanLine{0%{transform:translateY(-100%);opacity:0}10%{opacity:1}90%{opacity:.8}100%{transform:translateY(110vh);opacity:0}}
  @keyframes bPortal{from{transform:rotateX(72deg) rotate(0)}to{transform:rotateX(72deg) rotate(360deg)}}
  .b-ticker{animation:bTicker 44s linear infinite;will-change:transform}
  .b-ticker-r{animation:bTickerRev 50s linear infinite;will-change:transform}
  .b-marq:hover .b-ticker,.b-marq:hover .b-ticker-r{animation-play-state:paused}
  .b-float{animation:bFloat 8s ease-in-out infinite}
  .b-float-b{animation:bFloatB 10.5s ease-in-out infinite}
  .b-blob{animation:bBlob 20s ease-in-out infinite}
  .b-pulse{animation:bPulse 2.2s ease-out infinite}
  .b-scan{animation:bScanLine 10s linear infinite;animation-delay:-4s}
  .b-mask-x{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%)}
  [data-w]{display:block;perspective:600px}
  @keyframes bShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes bPulseFlow{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}
  .b-pulse-flow{animation:bPulseFlow 3.5s cubic-bezier(.45,.05,.55,.95) infinite}
  .shimmer-text{background:linear-gradient(90deg,color-mix(in srgb, var(--color-primary) 50%, transparent) 0%,rgba(255,255,255,.95) 25%,color-mix(in srgb, var(--color-accent) 95%, transparent) 50%,rgba(255,255,255,.95) 75%,color-mix(in srgb, var(--color-primary) 50%, transparent) 100%);background-size:200% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:bShimmer 4.5s linear infinite}
  @media (prefers-reduced-motion: reduce){.b-ticker,.b-ticker-r,.b-float,.b-float-b,.b-blob,.b-pulse,.b-scan,.shimmer-text{animation:none!important}}
`;
