/**
 * HeroCanvas — Three.js interactive particle network + floating wireframe objects.
 * Particles drift through 3D space, connecting with glowing lines when close.
 * Cursor repels nearby particles. Camera follows mouse (parallax) and pulls
 * back slowly on scroll.
 */
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ── Glow sprite texture ─────────────────────────────────────── */
function makeGlowTex() {
  const sz = 64;
  const c = document.createElement('canvas');
  c.width = c.height = sz;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(sz / 2, sz / 2, 0, sz / 2, sz / 2, sz / 2);
  g.addColorStop(0,    'rgba(255,255,255,1)');
  g.addColorStop(0.28, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.65, 'rgba(255,255,255,0.2)');
  g.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, sz, sz);
  return new THREE.CanvasTexture(c);
}

export default function HeroCanvas({ isDark, isMid }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    /* ── Config ─────────────────────────────────────────────────── */
    const PC   = isMid ? 110 : 190;   // particle count
    const MDST = isMid ? 90  : 115;   // max connection distance
    const MDSQ = MDST * MDST;
    const ML   = PC * 10;             // max line segments
    const REPEL_R  = 120;
    const REPEL_F  = 0.7;

    /* ── Renderer ───────────────────────────────────────────────── */
    const W = el.clientWidth  || window.innerWidth;
    const H = el.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: !isMid, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMid ? 1.5 : 2));
    renderer.setClearColor(0, 0);
    Object.assign(renderer.domElement.style, {
      position: 'absolute', top: '0', left: '0',
      width: '100%', height: '100%', pointerEvents: 'none',
    });
    el.appendChild(renderer.domElement);

    /* ── Scene + Camera ─────────────────────────────────────────── */
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 2000);
    camera.position.set(0, 0, 370);

    /* ── Colors ─────────────────────────────────────────────────── */
    const cP = new THREE.Color(isDark ? 0x818cf8 : 0x4338ca); // primary  (indigo)
    const cA = new THREE.Color(isDark ? 0x22d3ee : 0x0891b2); // accent   (cyan)
    const cW = new THREE.Color(isDark ? 0xfbbf24 : 0xf59e0b); // warm     (amber)

    /* ── Particle geometry ──────────────────────────────────────── */
    const pos  = new Float32Array(PC * 3);
    const pcol = new Float32Array(PC * 3);
    const drift = [];           // base drift velocity [vx, vy, vz]
    const extra = new Float32Array(PC * 2); // XY repulsion velocity

    for (let i = 0; i < PC; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 740;
      pos[i*3+1] = (Math.random() - 0.5) * 480;
      pos[i*3+2] = (Math.random() - 0.5) * 260;
      drift.push([
        (Math.random() - 0.5) * 0.20,
        (Math.random() - 0.5) * 0.20,
        (Math.random() - 0.5) * 0.06,
      ]);
      const r   = Math.random();
      const col = r < 0.52 ? cP : r < 0.8 ? cA : cW;
      pcol[i*3] = col.r; pcol[i*3+1] = col.g; pcol[i*3+2] = col.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos,  3));
    pGeo.setAttribute('color',    new THREE.BufferAttribute(pcol, 3));

    const glowTex = makeGlowTex();
    const pMat = new THREE.PointsMaterial({
      size: isDark ? 6 : 5,
      map: glowTex,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.88 : 0.74,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    scene.add(new THREE.Points(pGeo, pMat));

    /* ── Line geometry (pre-allocated) ──────────────────────────── */
    const lPos = new Float32Array(ML * 6);
    const lCol = new Float32Array(ML * 6);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    lGeo.setAttribute('color',    new THREE.BufferAttribute(lCol, 3));
    lGeo.setDrawRange(0, 0);

    const lMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.32 : 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lineSegs = new THREE.LineSegments(lGeo, lMat);
    scene.add(lineSegs);

    /* ── Floating wireframe shapes ──────────────────────────────── */
    const shapeDefs = [
      { G: THREE.IcosahedronGeometry,   a: [52, 1], p: [-250, 125, -65],  rv: [0.007, 0.005, 0.003], c: cP },
      { G: THREE.IcosahedronGeometry,   a: [35, 1], p: [220, -115, 35],   rv: [-0.004, 0.008, 0.005], c: cA },
      { G: THREE.OctahedronGeometry,    a: [48],    p: [295,  80, -90],   rv: [0.006, -0.005, 0.008], c: cW },
      { G: THREE.OctahedronGeometry,    a: [33],    p: [-175,-160, 28],   rv: [-0.008, 0.004, -0.006], c: cP },
      ...(!isMid ? [
        { G: THREE.TorusKnotGeometry,   a: [26, 7, 80, 8], p: [75, 170, -115], rv: [0.004, 0.006, 0.003], c: cA },
        { G: THREE.DodecahedronGeometry, a: [38],  p: [-295,-80, -48],   rv: [0.003, 0.005, 0.004], c: cW },
      ] : []),
    ];

    const shapes = shapeDefs.map(({ G, a, p, rv, c }) => {
      const geo   = new G(...a);
      const edges = new THREE.EdgesGeometry(geo);
      geo.dispose();
      const mat = new THREE.LineBasicMaterial({
        color: c,
        transparent: true,
        opacity: isDark ? 0.55 : 0.38,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.LineSegments(edges, mat);
      mesh.position.set(...p);
      mesh.userData = { rv, baseY: p[1] };
      scene.add(mesh);
      return mesh;
    });

    /* ── Mouse / scroll state ───────────────────────────────────── */
    let mx = 0, my = 0, scrollY = 0;

    const onMove = e => {
      mx = (e.clientX / window.innerWidth  - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onTouch = e => {
      const t = e.touches[0];
      if (t) { mx = (t.clientX / window.innerWidth - 0.5) * 2; my = (t.clientY / window.innerHeight - 0.5) * 2; }
    };
    const onScroll = () => { scrollY = window.scrollY; };
    const onResize = () => {
      const nW = el.clientWidth, nH = el.clientHeight;
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
      renderer.setSize(nW, nH);
    };

    window.addEventListener('mousemove', onMove,   { passive: true });
    window.addEventListener('touchmove', onTouch,  { passive: true });
    window.addEventListener('scroll',   onScroll,  { passive: true });
    window.addEventListener('resize',   onResize);

    /* ── Animation loop ─────────────────────────────────────────── */
    let raf, t = 0, last = performance.now();

    const tick = now => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min((now - last) / 16.67, 3); // normalised delta, cap at 3× frame
      last = now;
      t += dt * 0.008;

      /* Camera parallax + scroll pullback */
      const tX = mx * 44, tY = -my * 28, tZ = 370 + scrollY * 0.10;
      camera.position.x += (tX - camera.position.x) * 0.04;
      camera.position.y += (tY - camera.position.y) * 0.04;
      camera.position.z += (tZ - camera.position.z) * 0.04;
      camera.lookAt(0, 0, 0);

      /* Cursor repulsion (world-space approximation) */
      const curX = mx * 320 + camera.position.x;
      const curY = -my * 215 + camera.position.y;

      const posAttr = pGeo.attributes.position;

      for (let i = 0; i < PC; i++) {
        const px = posAttr.array[i*3], py = posAttr.array[i*3+1];
        const dx = px - curX, dy = py - curY;
        const dSq = dx*dx + dy*dy;
        if (dSq < REPEL_R * REPEL_R && dSq > 0.01) {
          const d = Math.sqrt(dSq);
          const f = (1 - d / REPEL_R) * REPEL_F;
          extra[i*2]   += (dx / d) * f;
          extra[i*2+1] += (dy / d) * f;
        }
        /* Dampen + clamp repulsion */
        extra[i*2]   *= 0.91;
        extra[i*2+1] *= 0.91;
        const maxE = 3.5;
        extra[i*2]   = Math.max(-maxE, Math.min(maxE, extra[i*2]));
        extra[i*2+1] = Math.max(-maxE, Math.min(maxE, extra[i*2+1]));

        /* Apply drift + repulsion */
        posAttr.array[i*3]   += drift[i][0] + extra[i*2];
        posAttr.array[i*3+1] += drift[i][1] + extra[i*2+1];
        posAttr.array[i*3+2] += drift[i][2];

        /* Wrap bounds */
        if (posAttr.array[i*3]   >  380) posAttr.array[i*3]   = -380;
        if (posAttr.array[i*3]   < -380) posAttr.array[i*3]   =  380;
        if (posAttr.array[i*3+1] >  260) posAttr.array[i*3+1] = -260;
        if (posAttr.array[i*3+1] < -260) posAttr.array[i*3+1] =  260;
      }
      posAttr.needsUpdate = true;

      /* Connection lines */
      let lc = 0;
      for (let a = 0; a < PC && lc < ML; a++) {
        const ax = posAttr.array[a*3], ay = posAttr.array[a*3+1], az = posAttr.array[a*3+2];
        for (let b = a + 1; b < PC && lc < ML; b++) {
          const dx = ax - posAttr.array[b*3];
          const dy = ay - posAttr.array[b*3+1];
          const dz = az - posAttr.array[b*3+2];
          const dSq = dx*dx + dy*dy + dz*dz;
          if (dSq < MDSQ) {
            const alpha = 1 - Math.sqrt(dSq) / MDST;
            const j = lc * 6;
            lPos[j]   = ax;                    lPos[j+1] = ay;                    lPos[j+2] = az;
            lPos[j+3] = posAttr.array[b*3];    lPos[j+4] = posAttr.array[b*3+1]; lPos[j+5] = posAttr.array[b*3+2];
            lCol[j]   = cA.r * alpha; lCol[j+1] = cA.g * alpha; lCol[j+2] = cA.b * alpha;
            lCol[j+3] = cA.r * alpha; lCol[j+4] = cA.g * alpha; lCol[j+5] = cA.b * alpha;
            lc++;
          }
        }
      }
      lGeo.attributes.position.needsUpdate = true;
      lGeo.attributes.color.needsUpdate    = true;
      lGeo.setDrawRange(0, lc * 2);

      /* Rotate + float shapes */
      shapes.forEach((s, i) => {
        const { rv, baseY } = s.userData;
        s.rotation.x += rv[0];
        s.rotation.y += rv[1];
        s.rotation.z += rv[2];
        s.position.y  = baseY + Math.sin(t + i * 1.05) * 9;
      });

      renderer.render(scene, camera);
    };

    tick(performance.now());

    /* ── Cleanup ─────────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('scroll',   onScroll);
      window.removeEventListener('resize',   onResize);
      glowTex.dispose();
      pGeo.dispose(); pMat.dispose();
      lGeo.dispose(); lMat.dispose();
      shapes.forEach(s => { s.geometry.dispose(); s.material.dispose(); });
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [isDark, isMid]);

  return <div ref={ref} className="absolute inset-0" aria-hidden />;
}
