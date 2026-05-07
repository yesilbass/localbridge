export const LANDING_CSS = `
  /* ── First-paint perf: skip layout/paint of deep-below-fold sections
       (StatsBento → FinalCta) until they scroll near. Hero / BrandStrip /
       MentorMarquee are left alone because they're often partially visible
       on tall screens and their layout feeds into ScrollTrigger refs. */
  .landing-root > section:nth-of-type(n+4){
    content-visibility: auto;
    contain-intrinsic-size: auto 800px;
  }

  /* ── Hero fade-up animation (used in HeroSection) ────────── */
  @keyframes fadeInUp{from{opacity:0;transform:translate3d(0,20px,0)}to{opacity:1;transform:translate3d(0,0,0)}}
  .animate-fade-in-up{animation:fadeInUp 0.8s ease-out forwards}
  .delay-300{animation-delay:300ms}
  .delay-500{animation-delay:500ms}
  .delay-700{animation-delay:700ms}
  .fill-mode-forwards{animation-fill-mode:forwards}

  /* ── Primary CTA button (landing-specific) ───────────────── */
  .lp-cta:hover{background-color:var(--color-primary-hover)!important;box-shadow:0 22px 50px -12px color-mix(in srgb, var(--color-primary) 75%, transparent)!important}
  .lp-cta:active{transform:translateY(0)!important;box-shadow:0 10px 28px -12px color-mix(in srgb, var(--color-primary) 55%, transparent)!important}

  /* ── Marquee tickers (used by BrandStrip + MentorMarquee) ──
       translate3d() forces a GPU layer so the animation runs off the
       compositor thread instead of repainting on the main thread. */
  @keyframes bTicker{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}
  @keyframes bTickerRev{from{transform:translate3d(-50%,0,0)}to{transform:translate3d(0,0,0)}}
  .b-ticker{animation:bTicker 44s linear infinite;will-change:transform;backface-visibility:hidden}
  .b-ticker-r{animation:bTickerRev 50s linear infinite;will-change:transform;backface-visibility:hidden}
  .b-marq:hover .b-ticker,.b-marq:hover .b-ticker-r{animation-play-state:paused}
  .b-mask-x{-webkit-mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%);mask-image:linear-gradient(90deg,transparent 0%,#000 8%,#000 92%,transparent 100%)}

  @media (prefers-reduced-motion: reduce){
    .b-ticker,.b-ticker-r{animation:none!important}
  }
`;
