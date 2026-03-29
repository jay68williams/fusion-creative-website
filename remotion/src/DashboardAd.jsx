import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

const CORAL = '#E8553C';
const FNT = "-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif";
const C = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };
const spr = (f, fps, cfg) => Math.min(1, Math.max(0, spring({ frame: Math.max(0, f), fps, config: { damping: 12, mass: 0.8, stiffness: 100, ...cfg } })));

// ─── Breathing background ───
function BG({ frame }) {
  const cx = 50 + Math.sin(frame * 0.004) * 8;
  const cy = 50 + Math.cos(frame * 0.003) * 6;
  const intensity = 0.04 + Math.sin(frame * 0.008) * 0.015;
  return (
    <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at ${cx}% ${cy}%, rgba(232,85,60,${intensity}) 0%, transparent 65%)` }}/>
  );
}

// ─── Floating text (always breathing) ───
function Txt({ children, inF, outF, frame, style: s }) {
  if (frame < inF - 5 || frame > outF + 5) return null;
  const o = interpolate(frame, [inF, inF + 15, outF - 15, outF], [0, 1, 1, 0], C);
  const enterY = interpolate(frame, [inF, inF + 20], [16, 0], C);
  const breathe = Math.sin(frame * 0.05) * 2.5;
  const y = enterY + (frame > inF + 20 && frame < outF - 15 ? breathe : 0);
  return <div style={{ opacity: o, transform: `translateY(${y}px)`, fontFamily: FNT, ...s }}>{children}</div>;
}

// ─── SVG Cursor ───
function Cursor({ x, y, opacity, scale }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, opacity, transform: `scale(${scale})`, transformOrigin: 'top left', zIndex: 20 }}>
      <svg width="24" height="30" viewBox="0 0 24 30" fill="none" style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.5))' }}>
        <path d="M2.5 0.5L2.5 23L7.5 17.5L12.5 27L15.5 25.5L10.5 15.5L17.5 15.5L2.5 0.5Z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

// ─── Traffic Lights ───
function Dots() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[['#FF5F57','#E0443E'],['#FFBD2E','#DEA123'],['#28C840','#1AAB29']].map(([bg,bd],i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: bg, border: `1px solid ${bd}` }}/>
      ))}
    </div>
  );
}

// ─── Stat Card (standalone close-up) ───
function StatCardCloseup({ label, finalValue, suffix, frame, startF, endF }) {
  const dur = endF - startF;
  const local = frame - startF;
  const prog = interpolate(frame, [startF, startF + dur * 0.7], [0, 1], C);
  const eased = 1 - Math.pow(1 - prog, 4);
  const n = Math.round(eased * finalValue);
  let disp;
  if (suffix === 'M') disp = (n / 1e6).toFixed(1) + 'M';
  else if (suffix === 'K') disp = (n / 1e3).toFixed(1) + 'K';
  else disp = n.toFixed(1) + '%';

  // Camera drift: starts top-left, drifts down-right
  const driftX = interpolate(local, [0, dur], [-15, 10], C);
  const driftY = interpolate(local, [0, dur], [-10, 8], C);
  // 3D tilt easing to flat
  const tiltRX = interpolate(local, [0, dur], [8, 0], C);
  const tiltRY = interpolate(local, [0, dur], [-12, 0], C);
  // Scale: zoom in then pull back
  const sc = interpolate(local, [0, dur * 0.6, dur], [1.6, 1.5, 1.1], C);
  // Number pulse after counting done
  const numOp = prog >= 0.95 ? 0.88 + Math.sin(frame * 0.08) * 0.12 : 1;
  // Card glow
  const glowOp = 0.1 + Math.sin(frame * 0.06) * 0.06;

  return (
    <div style={{
      perspective: 1000, width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        transform: `translateX(${driftX}px) translateY(${driftY}px) scale(${sc}) rotateX(${tiltRX}deg) rotateY(${tiltRY}deg)`,
        transformStyle: 'preserve-3d', width: 420, padding: '36px 44px',
        background: '#161616', borderRadius: 20, border: '1px solid #2a2a2a',
        boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 30px rgba(232,85,60,${glowOp})`,
      }}>
        <div style={{ fontSize: 12, color: '#666', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 16, fontFamily: FNT }}>{label}</div>
        <div style={{ fontSize: 64, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', fontFamily: FNT, opacity: numOp }}>{disp}</div>
      </div>
    </div>
  );
}

// ─── Chart Card close-up ───
function ChartCardCloseup({ color, data, label, sub, frame, startF, drawDur, area }) {
  const local = frame - startF;
  const totalDur = drawDur + 120; // drawing + orbit after
  const drawProg = interpolate(frame, [startF, startF + drawDur], [0, 1], C);
  const eased = 1 - Math.pow(1 - drawProg, 2);

  // Continuous rotation: starts tilted, eases toward flat, then orbits
  const baseRY = interpolate(local, [0, totalDur], [-18, -2], C);
  const orbitRY = drawProg >= 0.95 ? Math.sin((frame - startF - drawDur) * 0.017) * 5 : 0;
  const rY = baseRY + orbitRY;
  const rX = interpolate(local, [0, totalDur], [6, 1], C);
  // Camera drift
  const dX = interpolate(local, [0, totalDur], [-12, 8], C);
  const dY = interpolate(local, [0, totalDur], [-6, 4], C);
  const sc = interpolate(local, [0, totalDur * 0.7, totalDur], [1.5, 1.45, 1.15], C);

  const W = 520, H = 160, mx = Math.max(...data);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - (v / mx) * H * 0.88 - 8 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const ad = d + ` L${W},${H} L0,${H} Z`;
  const id = label.replace(/\W/g, '');
  const len = W * 2.5;
  const pi = data.indexOf(mx); const pp = pts[pi];
  // Continuous glow pulse after draw
  const glowOp = eased > 0.5 ? 0.3 + Math.sin(frame * 0.07) * 0.25 : eased * 0.3;

  return (
    <div style={{ perspective: 1000, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        transform: `translateX(${dX}px) translateY(${dY}px) scale(${sc}) rotateX(${rX}deg) rotateY(${rY}deg)`,
        transformStyle: 'preserve-3d', width: 580, padding: '28px 36px',
        background: '#161616', borderRadius: 20, border: '1px solid #2a2a2a',
        boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 25px rgba(232,85,60,${0.05 + Math.sin(frame * 0.05) * 0.03})`,
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 3, fontFamily: FNT }}>{label}</div>
        <div style={{ fontSize: 11, color: '#555', marginBottom: 18, fontFamily: FNT }}>{sub}</div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
          <defs><filter id={`g${id}`}><feGaussianBlur stdDeviation="6"/></filter></defs>
          {[0.25, 0.5, 0.75].map(r => <line key={r} x1={0} y1={H * r} x2={W} y2={H * r} stroke="#1f1f1f" strokeWidth="0.5"/>)}
          <clipPath id={`c${id}`}><rect x={0} y={0} width={W * eased} height={H}/></clipPath>
          {area && <path d={ad} fill={color} fillOpacity={0.12} clipPath={`url(#c${id})`}/>}
          <path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - eased)}/>
          {pp && glowOp > 0 && <>
            <circle cx={pp.x} cy={pp.y} r={14} fill={color} opacity={glowOp * 0.35} filter={`url(#g${id})`}/>
            <circle cx={pp.x} cy={pp.y} r={4} fill={color} opacity={glowOp}/>
          </>}
        </svg>
      </div>
    </div>
  );
}

// ─── Dashboard Window (for scene 2) ───
function DashWin({ scale, opacity, frame }) {
  const igData = [80,120,160,140,220,260,200,290,341,310,280,320,300,340,310,290,260,280,250,240];
  const tkData = [60,100,140,250,200,350,380,300,500,650,550,800,700,1300,900,750,600,550,500,480];
  const cp = (s) => interpolate(frame, [s, s + 80], [0, 1], C);
  return (
    <div style={{ perspective: 1400, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ transform: `scale(${scale})`, opacity, width: 1440, borderRadius: 12, overflow: 'hidden', boxShadow: '0 50px 150px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)' }}>
        <div style={{ background: '#1a1a1a', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #2a2a2a' }}>
          <Dots/><div style={{ fontSize: 13, color: '#777', fontWeight: 500, flex: 1, textAlign: 'center', marginRight: 72, fontFamily: FNT }}>Fusion Creative — New Greek Dashboard</div>
        </div>
        <div style={{ background: '#0d0d0d', padding: 36, minHeight: 520 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: FNT }}>N</div>
            <div><div style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: FNT }}>New Greek</div><div style={{ fontSize: 12, color: '#555', fontFamily: FNT }}>Growth reporting and analytics</div></div>
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            {[['Total Reach',2300000,'M',240],['Impressions',3100000,'M',245],['Engagements',55300,'K',250],['Profile Visits',10900,'K',255]].map(([l,v,s,d]) => {
              const t = cp(d); const e = 1 - Math.pow(1 - t, 4); const n = Math.round(e * v);
              let disp; if (s === 'M') disp = (n/1e6).toFixed(1)+'M'; else disp = (n/1e3).toFixed(1)+'K';
              const pulse = t >= 0.95 ? 0.88 + Math.sin(frame * 0.08) * 0.12 : 1;
              return (
                <div key={l} style={{ background: '#161616', borderRadius: 14, padding: '18px 22px', flex: 1, border: '1px solid #2a2a2a' }}>
                  <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontFamily: FNT }}>{l}</div>
                  <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', fontFamily: FNT, opacity: pulse }}>{disp}</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[['#fff', igData, 'Instagram Views', '30-day rolling window', false], [CORAL, tkData, 'TikTok Views', '30-day rolling', true]].map(([col, data, lbl, sub, area]) => {
              const W = 480, H = 130, mx = Math.max(...data);
              const pts = data.map((v, i) => ({ x: (i/(data.length-1))*W, y: H-(v/mx)*H*0.88-8 }));
              const path = pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
              return (
                <div key={lbl} style={{ flex: 1, background: '#161616', borderRadius: 14, padding: '18px 22px', border: '1px solid #2a2a2a' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2, fontFamily: FNT }}>{lbl}</div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 14, fontFamily: FNT }}>{sub}</div>
                  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
                    {[0.25,0.5,0.75].map(r => <line key={r} x1={0} y1={H*r} x2={W} y2={H*r} stroke="#1f1f1f" strokeWidth="0.5"/>)}
                    <path d={path} fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" opacity={0.3}/>
                  </svg>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   MAIN — 1650 frames, 30fps, 55s
   ══════════════════════════════════ */
export function DashboardAd() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const igData = [80,120,160,140,220,260,200,290,341,310,280,320,300,340,310,290,260,280,250,240];
  const tkData = [60,100,140,250,200,350,380,300,500,650,550,800,700,1300,900,750,600,550,500,480];

  // Cross-dissolve helper (15 frames = 0.5s)
  const xf = (inF, outF) => interpolate(frame, [inF, inF + 15, outF - 15, outF], [0, 1, 1, 0], C);

  // ── SCENE 1: Desktop (0-180) ──
  const s1 = xf(0, 180);
  const curOp = interpolate(frame, [60, 75], [0, 1], C);
  const curT = interpolate(frame, [60, 140], [0, 1], C);
  const curX = 1400 - curT * curT * 440;
  const curY = 400 + curT * 160;
  const clk1 = interpolate(frame, [150, 154, 158], [1, 0.82, 1], C);
  const clk2 = interpolate(frame, [160, 164, 168], [1, 0.82, 1], C);
  const iconS = 1 + spr(frame - 155, fps, { damping: 8, stiffness: 200 }) * 0.1;

  // ── SCENE 2: Window opens (165-315) ── (overlaps for cross-dissolve)
  const s2 = xf(165, 315);
  const wS = spr(frame - 180, fps, { damping: 14, mass: 1, stiffness: 90 });
  const wScale = 0.06 + wS * 0.94;
  const dBlur = interpolate(frame, [175, 210], [0, 12], C);

  // ── SCENE 3: "Every client" text (300-465) ──
  const s3 = xf(300, 465);

  // ── SCENE 4: Card close-ups (450-750) ── 4 cards, ~75 frames each
  const s4 = xf(450, 750);
  const cardDefs = [
    { label: 'Total Reach', val: 2300000, suf: 'M', start: 455 },
    { label: 'Impressions', val: 3100000, suf: 'M', start: 530 },
    { label: 'Engagements', val: 55300, suf: 'K', start: 605 },
    { label: 'Engagement Rate', val: 1.8, suf: '%', start: 680 },
  ];

  // ── SCENE 5: IG chart close-up (735-930) ──
  const s5 = xf(735, 930);

  // ── SCENE 6: TikTok chart close-up (915-1110) ──
  const s6 = xf(915, 1110);

  // ── SCENE 7: "Included" text (1095-1290) ──
  const s7 = xf(1095, 1290);

  // ── SCENE 8: Brand close (1275-1650) ──
  const s8op = interpolate(frame, [1275, 1305], [0, 1], C);
  const endFade = interpolate(frame, [1620, 1650], [1, 0], C);
  const brOp = interpolate(frame, [1300, 1340], [0, 1], C);
  const tgOp = interpolate(frame, [1340, 1375], [0, 1], C);
  const urlOp = interpolate(frame, [1370, 1400], [0, 1], C);
  const glow = 0.3 + 0.15 * Math.sin(frame * 0.05);

  return (
    <div style={{ width: 1920, height: 1080, background: '#080808', position: 'relative', overflow: 'hidden', fontFamily: FNT }}>
      {/* Breathing background — always active */}
      <BG frame={frame}/>

      {/* ═══ SCENE 1: Desktop ═══ */}
      {s1 > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s1, filter: frame >= 175 ? `blur(${dBlur}px)` : 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 60%,#1a2a4a 0%,#0d1117 60%,#080808 100%)' }}/>
          {/* Menu bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 28, background: 'rgba(20,20,20,0.85)', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 13, color: '#ccc', fontFamily: FNT, gap: 20, zIndex: 10 }}>
            <svg width="13" height="16" viewBox="0 0 14 17" fill="#ccc"><path d="M11.8 9c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3.1-1.7-1.3-.1-2.6.8-3.2.8-.7 0-1.7-.8-2.8-.7C3.1 4.3 1.8 5.1 1.1 6.4c-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.3 1.2-2.4 0 0-2.3-.9-2.5-3.7zM9.5 3.1c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6.9.1 1.9-.5 2.5-1.2z"/></svg>
            <span style={{ fontWeight: 600 }}>Finder</span>
            {['File','Edit','View','Go','Window','Help'].map(m => <span key={m} style={{ color: '#aaa' }}>{m}</span>)}
            <div style={{ flex: 1 }}/><span style={{ fontSize: 12, fontWeight: 500 }}>09:41</span>
          </div>
          {/* Desktop icons */}
          {[['#1A8EF5','S'],['#2196F3','M'],['#FF3B30','C'],['#5AC8FA','F'],['#FFF176','N']].map(([bg,l],i) => (
            <div key={i} style={{ position: 'absolute', right: 40, top: 60 + i * 100, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: FNT }}>{l}</span>
              </div>
            </div>
          ))}
          {/* FC icon */}
          <div style={{ position: 'absolute', left: '50%', top: '52%', transform: `translate(-50%,-50%) scale(${iconS})`, textAlign: 'center' }}>
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 140, height: 140, borderRadius: '50%', background: `radial-gradient(circle,rgba(232,85,60,${0.15 + Math.sin(frame * 0.06) * 0.05})0%,transparent 70%)`, filter: 'blur(12px)' }}/>
            <div style={{ width: 76, height: 76, borderRadius: 18, background: 'linear-gradient(145deg,#1c1c1c,#111)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid #333', position: 'relative' }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: CORAL, fontFamily: FNT }}>FC</span>
            </div>
            <div style={{ fontSize: 11, color: '#fff', marginTop: 6, textShadow: '0 1px 4px rgba(0,0,0,0.8)', fontFamily: FNT }}>Fusion Creative</div>
          </div>
          {/* Dock */}
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, padding: '5px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
            {['#1A8EF5','#2196F3','#FF3B30','#161616','#5AC8FA','#FFF176'].map((bg,i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: i === 3 ? '1px solid rgba(232,85,60,0.3)' : '1px solid rgba(255,255,255,0.04)' }}>
                {i === 3 && <span style={{ fontSize: 14, fontWeight: 700, color: CORAL, fontFamily: FNT }}>FC</span>}
              </div>
            ))}
          </div>
          <Cursor x={curX} y={curY} opacity={curOp} scale={clk1 * clk2}/>
        </div>
      )}

      {/* ═══ SCENE 2: Window opens ═══ */}
      {s2 > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s2 }}>
          <DashWin scale={wScale} opacity={1} frame={frame}/>
        </div>
      )}
      <Txt inF={250} outF={310} frame={frame} style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>
        Your clients deserve better than a monthly PDF report.
      </Txt>

      {/* ═══ SCENE 3: Text ═══ */}
      {s3 > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s3 }}>
          <div style={{ textAlign: 'center' }}>
            <Txt inF={310} outF={458} frame={frame} style={{ fontSize: 44, fontWeight: 600, color: '#fff', letterSpacing: -0.5 }}>Every client gets their own personal dashboard.</Txt>
            <Txt inF={318} outF={458} frame={frame} style={{ fontSize: 26, fontWeight: 500, color: CORAL, marginTop: 20 }}>Live data. Real numbers. Zero guesswork.</Txt>
            <Txt inF={326} outF={458} frame={frame} style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>Included with every Fusion Creative retainer.</Txt>
          </div>
        </div>
      )}

      {/* ═══ SCENE 4: Card close-ups ═══ */}
      {s4 > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s4 }}>
          {cardDefs.map((cd, i) => {
            const cardOp = xf(cd.start, cd.start + 75);
            return cardOp > 0.01 ? (
              <div key={i} style={{ position: 'absolute', inset: 0, opacity: cardOp }}>
                <StatCardCloseup label={cd.label} finalValue={cd.val} suffix={cd.suf} frame={frame} startF={cd.start} endF={cd.start + 75}/>
              </div>
            ) : null;
          })}
        </div>
      )}
      <Txt inF={460} outF={535} frame={frame} style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>Live performance data. Always up to date.</Txt>
      <Txt inF={610} outF={685} frame={frame} style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>Every metric explained in plain English.</Txt>

      {/* ═══ SCENE 5: IG chart close-up ═══ */}
      {s5 > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s5 }}>
          <ChartCardCloseup color="#fff" data={igData} label="Instagram Views" sub="30-day rolling window" frame={frame} startF={745} drawDur={90}/>
        </div>
      )}
      <Txt inF={780} outF={860} frame={frame} style={{ position: 'absolute', bottom: 90, left: 0, right: 0, textAlign: 'center', fontSize: 26, fontWeight: 600, color: '#fff' }}>Instagram Views</Txt>
      <Txt inF={800} outF={870} frame={frame} style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontSize: 18, fontWeight: 700, color: CORAL }}>Peak: 341,000 views</Txt>
      <Txt inF={860} outF={925} frame={frame} style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>See exactly when your content is winning.</Txt>

      {/* ═══ SCENE 6: TikTok chart close-up ═══ */}
      {s6 > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, opacity: s6 }}>
          <ChartCardCloseup color={CORAL} data={tkData} label="TikTok Views" sub="30-day rolling" frame={frame} startF={925} drawDur={90} area/>
        </div>
      )}
      <Txt inF={960} outF={1040} frame={frame} style={{ position: 'absolute', bottom: 90, left: 0, right: 0, textAlign: 'center', fontSize: 26, fontWeight: 600, color: '#fff' }}>TikTok Views</Txt>
      <Txt inF={975} outF={1055} frame={frame} style={{ position: 'absolute', bottom: 55, left: 0, right: 0, textAlign: 'center', fontSize: 20, fontWeight: 700, color: CORAL }}>1.3 million views in a single week.</Txt>
      <Txt inF={1040} outF={1105} frame={frame} style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>You will see moments like this the moment they happen.</Txt>

      {/* ═══ SCENE 7: Offer ═══ */}
      {s7 > 0.01 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s7 }}>
          <div style={{ textAlign: 'center' }}>
            <Txt inF={1105} outF={1283} frame={frame} style={{ fontSize: 44, fontWeight: 600, color: '#fff' }}>Included with every retainer.</Txt>
            <Txt inF={1114} outF={1283} frame={frame} style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', marginTop: 20 }}>Your own dashboard. Your own login. Your own data.</Txt>
            <Txt inF={1123} outF={1283} frame={frame} style={{ fontSize: 24, fontWeight: 500, color: CORAL, marginTop: 16 }}>No extra cost. No setup fee. Just results.</Txt>
          </div>
        </div>
      )}

      {/* ═══ SCENE 8: Brand ═══ */}
      {frame >= 1275 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s8op * endFade }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 550, height: 300, borderRadius: '50%', background: `radial-gradient(circle,rgba(232,85,60,${glow})0%,transparent 70%)`, filter: 'blur(60px)' }}/>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, opacity: brOp, fontFamily: FNT }}>
              <span style={{ color: '#fff' }}>Fusion </span><span style={{ color: CORAL }}>Creative</span>
            </div>
            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.55)', marginTop: 18, opacity: tgOp, fontFamily: FNT }}>Your growth, visualised.</div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 12, opacity: urlOp, fontFamily: FNT }}>fusioncreative.uk</div>
          </div>
        </div>
      )}
    </div>
  );
}
