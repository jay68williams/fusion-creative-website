import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';

// ── Colour constants ──
const CORAL = '#E8553C';
const BG = '#0c0a09';
const SURFACE = '#1c1917';
const BORDER = '#2a2a2a';
const FNT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter',system-ui,sans-serif";
const C = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

// ── Spring helper with safety clamping ──
const spr = (f, fps, cfg = {}) =>
  Math.min(1, Math.max(0, spring({
    frame: Math.max(0, f),
    fps,
    config: { stiffness: 200, damping: 15, mass: 1, ...cfg },
  })));

// ── Grid background ──
function GridBG() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
    }} />
  );
}

// ── Breathing ambient glow ──
function AmbientGlow({ frame }) {
  const cx = 50 + Math.sin(frame * 0.003) * 10;
  const cy = 50 + Math.cos(frame * 0.002) * 8;
  const a = 0.06 + Math.sin(frame * 0.006) * 0.02;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse at ${cx}% ${cy}%, rgba(232,85,60,${a}) 0%, transparent 60%)`,
    }} />
  );
}

// ── Text block with spring entry + breathing ──
function TextBlock({ children, inF, outF, frame, fps, style: s }) {
  if (frame < inF - 5 || frame > outF + 5) return null;
  const enter = spr(frame - inF, fps, { stiffness: 180, damping: 14 });
  const exit = interpolate(frame, [outF - 18, outF], [1, 0], C);
  const o = Math.min(enter, exit);
  const y = interpolate(enter, [0, 1], [20, 0], C);
  const breathe = frame > inF + 20 && frame < outF - 18
    ? Math.sin(frame * 0.04) * 1.5 : 0;
  return (
    <div style={{ opacity: o, transform: `translateY(${y + breathe}px)`, fontFamily: FNT, ...s }}>
      {children}
    </div>
  );
}

// ── macOS traffic lights ──
function TrafficLights() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[['#FF5F57', '#E0443E'], ['#FFBD2E', '#DEA123'], ['#28C840', '#1AAB29']].map(([bg, bd], i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: bg, border: `1px solid ${bd}` }} />
      ))}
    </div>
  );
}

// ── Glassmorphism card ──
function GlassCard({ children, style }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Stat card with counter ──
function StatCard({ label, value, suffix, frame, startFrame, index, fps }) {
  const local = frame - startFrame;
  const enter = spr(local - index * 4, fps, { stiffness: 180 + index * 15, damping: 13 });
  const countProg = interpolate(local, [index * 4 + 10, index * 4 + 60], [0, 1], C);
  const eased = 1 - Math.pow(1 - countProg, 4);
  const n = Math.round(eased * value);
  let display;
  if (suffix === 'M') display = (n / 1e6).toFixed(1) + 'M';
  else if (suffix === 'K') display = (n / 1e3).toFixed(1) + 'K';
  else display = String(n);
  const pulse = countProg >= 0.95 ? 0.9 + Math.sin(frame * 0.07) * 0.1 : 1;

  return (
    <GlassCard style={{
      padding: '18px 22px', flex: 1,
      transform: `translateY(${interpolate(enter, [0, 1], [30, 0], C)}px) scale(${0.95 + enter * 0.05})`,
      opacity: enter,
    }}>
      <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: 2.5, marginBottom: 10, fontFamily: FNT }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', fontFamily: FNT, opacity: pulse }}>{display}</div>
    </GlassCard>
  );
}

// ── Chart with draw-on + cursor sweep ──
function Chart({ color, data, label, sub, frame, startF, fps, area }) {
  const local = frame - startF;
  const popIn = spr(local, fps, { stiffness: 160, damping: 12 });
  const drawProg = interpolate(local, [10, 70], [0, 1], C);
  const eased = 1 - Math.pow(1 - drawProg, 2);

  // Cursor sweep
  const cursorT = interpolate(local, [75, 200], [0, 1], C);
  const sweep = cursorT < 0.5 ? cursorT * 2 : 2 - cursorT * 2;
  const cursorVisible = local >= 70 && local < 210;

  // 3D tilt
  const rY = interpolate(local, [0, 220], [-12, 2], C) + (local > 80 ? Math.sin(local * 0.012) * 2.5 : 0);
  const rX = interpolate(local, [0, 220], [4, 0], C);

  const W = 540, H = 170, mx = Math.max(...data);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - (v / mx) * H * 0.88 - 8 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const ad = d + ` L${W},${H} L0,${H} Z`;
  const id = label.replace(/\W/g, '');
  const len = W * 2.5;
  const glowOp = eased > 0.5 ? 0.2 + Math.sin(frame * 0.06) * 0.12 : eased * 0.2;

  // Cursor position on chart line
  const cIdx = sweep * (data.length - 1);
  const cFloor = Math.floor(cIdx);
  const cCeil = Math.min(data.length - 1, cFloor + 1);
  const cFrac = cIdx - cFloor;
  const cPtX = pts[cFloor].x + (pts[cCeil].x - pts[cFloor].x) * cFrac;
  const cPtY = pts[cFloor].y + (pts[cCeil].y - pts[cFloor].y) * cFrac;
  const cVal = Math.round(data[cFloor] + (data[cCeil] - data[cFloor]) * cFrac);
  const cValK = cVal >= 1000 ? (cVal / 1000).toFixed(0) + 'K' : String(cVal);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200 }}>
      <GlassCard style={{
        transform: `scale(${0.5 + popIn * 0.5}) rotateX(${rX}deg) rotateY(${rY}deg)`,
        opacity: popIn, width: 620, padding: '28px 36px',
        boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 20px rgba(232,85,60,${0.03 + Math.sin(frame * 0.04) * 0.015})`,
        transformStyle: 'preserve-3d',
        background: SURFACE,
        border: `1px solid ${BORDER}`,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 4, fontFamily: FNT }}>{label}</div>
        <div style={{ fontSize: 11, color: '#555', marginBottom: 16, fontFamily: FNT }}>{sub}</div>
        <div style={{ position: 'relative' }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
            <defs><filter id={`g${id}`}><feGaussianBlur stdDeviation="6" /></filter></defs>
            {[0.25, 0.5, 0.75].map(r => <line key={r} x1={0} y1={H * r} x2={W} y2={H * r} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />)}
            <clipPath id={`c${id}`}><rect x={0} y={0} width={W * eased} height={H} /></clipPath>
            {area && <path d={ad} fill={color} fillOpacity={0.1} clipPath={`url(#c${id})`} />}
            <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - eased)} />
            {cursorVisible && eased > 0.95 && <>
              <line x1={cPtX} y1={0} x2={cPtX} y2={H} stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={cPtX} cy={cPtY} r={5} fill={color} opacity={0.9} />
              <circle cx={cPtX} cy={cPtY} r={10} fill={color} opacity={0.12} filter={`url(#g${id})`} />
              <rect x={cPtX - 34} y={cPtY - 34} width={68} height={22} rx={8} fill={SURFACE} stroke={BORDER} strokeWidth="0.5" />
              <text x={cPtX} y={cPtY - 19} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600" fontFamily={FNT}>{cValK} views</text>
            </>}
            {glowOp > 0 && (() => { const pi = data.indexOf(mx); const pp = pts[pi]; return pp ? <>
              <circle cx={pp.x} cy={pp.y} r={12} fill={color} opacity={glowOp * 0.3} filter={`url(#g${id})`} />
              <circle cx={pp.x} cy={pp.y} r={3.5} fill={color} opacity={glowOp} />
            </> : null; })()}
          </svg>
          {cursorVisible && eased > 0.95 && (
            <div style={{ position: 'absolute', left: `${(cPtX / W) * 100}%`, top: `${(cPtY / H) * 100}%`, transform: 'translate(4px, 4px)', pointerEvents: 'none' }}>
              <svg width="18" height="22" viewBox="0 0 24 30" fill="none">
                <path d="M2.5 0.5L2.5 23L7.5 17.5L12.5 27L15.5 25.5L10.5 15.5L17.5 15.5L2.5 0.5Z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Full dashboard window ──
function DashboardWindow({ opacity, frame, fps, scale, rotY }) {
  const igD = [80, 120, 160, 140, 220, 260, 200, 290, 341, 310, 280, 320, 300, 340, 310, 290, 260, 280, 250, 240];
  const tkD = [60, 100, 140, 250, 200, 350, 380, 300, 500, 650, 550, 800, 700, 1300, 900, 750, 600, 550, 500, 480];
  const cp = (s) => interpolate(frame, [s, s + 60], [0, 1], C);

  return (
    <div style={{ perspective: 1400, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        transform: `scale(${scale}) rotateY(${rotY || 0}deg)`,
        opacity, width: 1440, borderRadius: 16, overflow: 'hidden',
        boxShadow: `0 50px 150px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)`,
        transformStyle: 'preserve-3d',
      }}>
        {/* Title bar */}
        <div style={{ background: SURFACE, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: `1px solid ${BORDER}` }}>
          <TrafficLights />
          <div style={{ fontSize: 13, color: '#777', fontWeight: 500, flex: 1, textAlign: 'center', marginRight: 72, fontFamily: FNT }}>
            Fusion Creative — New Greek Dashboard
          </div>
        </div>
        {/* Content */}
        <div style={{ background: BG, padding: 36, minHeight: 520 }}>
          {/* Client header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <div style={{ width: 46, height: 46, borderRadius: '50%', background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: FNT }}>N</div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: FNT }}>New Greek</div>
              <div style={{ fontSize: 12, color: '#555', fontFamily: FNT }}>Growth reporting and analytics</div>
            </div>
          </div>
          {/* Stat row */}
          <div style={{ display: 'flex', gap: 14, marginBottom: 24 }}>
            {[['Total Reach', 2300000, 'M'], ['Impressions', 3100000, 'M'], ['Engagements', 55300, 'K'], ['Profile Visits', 10900, 'K']].map(([l, v, s], idx) => {
              const t = cp(200 + idx * 4); const e = 1 - Math.pow(1 - t, 4); const n = Math.round(e * v);
              let d; if (s === 'M') d = (n / 1e6).toFixed(1) + 'M'; else d = (n / 1e3).toFixed(1) + 'K';
              const pulse = t >= 0.95 ? 0.9 + Math.sin(frame * 0.07) * 0.1 : 1;
              return (
                <GlassCard key={l} style={{ padding: '16px 20px', flex: 1 }}>
                  <div style={{ fontSize: 9, color: '#666', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, fontFamily: FNT }}>{l}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', fontFamily: FNT, opacity: pulse }}>{d}</div>
                </GlassCard>
              );
            })}
          </div>
          {/* Charts */}
          <div style={{ display: 'flex', gap: 14 }}>
            {[['#fff', igD, 'Instagram Views', '30-day rolling window'], [CORAL, tkD, 'TikTok Views', '30-day rolling']].map(([col, data, lbl, sub]) => {
              const W = 480, H = 120, mx = Math.max(...data);
              const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - (v / mx) * H * 0.88 - 8 }));
              const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
              return (
                <GlassCard key={lbl} style={{ flex: 1, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 2, fontFamily: FNT }}>{lbl}</div>
                  <div style={{ fontSize: 10, color: '#555', marginBottom: 12, fontFamily: FNT }}>{sub}</div>
                  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
                    {[0.25, 0.5, 0.75].map(r => <line key={r} x1={0} y1={H * r} x2={W} y2={H * r} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />)}
                    <path d={path} fill="none" stroke={col} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN COMPOSITION — 1650 frames, 30fps, 55s
   Premium rebuild using Remotion Animation Skill
   ══════════════════════════════════════════════ */
export function DashboardAd() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const igData = [80, 120, 160, 140, 220, 260, 200, 290, 341, 310, 280, 320, 300, 340, 310, 290, 260, 280, 250, 240];

  // Cold open fade from black
  const coldOpen = interpolate(frame, [0, 12], [0, 1], C);

  // Scene visibility helpers
  const vis = (inF, outF) => {
    const o = interpolate(frame, [inF, inF + 15, outF - 15, outF], [0, 1, 1, 0], C);
    return o > 0.01 ? o : 0;
  };

  // ── Scene 1: Stat cards cold open (0-180) ──
  const s1 = vis(0, 180);

  // ── Scene 2: Problem statement (180-360) ──
  const s2 = vis(180, 360);

  // ── Scene 3: Solution (360-560) ──
  const s3 = vis(360, 560);

  // ── Scene 4: Interactive chart (560-800) ──
  const s4 = vis(560, 800);

  // ── Scene 5: Full dashboard (800-1050) ──
  const s5 = vis(800, 1050);
  const s5scale = interpolate(frame, [810, 870], [0.3, 1], C);
  const s5tilt = interpolate(frame, [860, 1040], [-10, 10], C);

  // ── Scene 6: Value prop (1050-1250) ──
  const s6 = vis(1050, 1250);

  // ── Scene 7: Brand close (1250-1650) ──
  const s7op = interpolate(frame, [1250, 1285], [0, 1], C);
  const endFade = interpolate(frame, [1620, 1650], [1, 0], C);
  const brandEnter = spr(frame - 1280, fps, { stiffness: 150, damping: 16 });
  const tagEnter = spr(frame - 1320, fps, { stiffness: 140, damping: 15 });
  const urlEnter = spr(frame - 1360, fps, { stiffness: 130, damping: 14 });
  const glowPulse = 0.25 + 0.12 * Math.sin(frame * 0.04);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, fontFamily: FNT, overflow: 'hidden' }}>
      <div style={{ opacity: coldOpen, position: 'absolute', inset: 0 }}>
        <GridBG />
        <AmbientGlow frame={frame} />

        {/* S1: Cold open with staggered stat cards */}
        {s1 > 0 && (
          <div style={{ position: 'absolute', inset: 0, opacity: s1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 20, padding: '0 120px' }}>
              {[
                ['Total Reach', 2300000, 'M'],
                ['Impressions', 3100000, 'M'],
                ['Engagements', 55300, 'K'],
                ['Profile Visits', 10900, 'K'],
              ].map(([label, value, suffix], i) => (
                <StatCard key={label} label={label} value={value} suffix={suffix}
                  frame={frame} startFrame={8} index={i} fps={fps} />
              ))}
            </div>
          </div>
        )}

        {/* S2: Problem */}
        {s2 > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s2 }}>
            <div style={{ textAlign: 'center', maxWidth: 900 }}>
              <TextBlock inF={195} outF={350} frame={frame} fps={fps}
                style={{ fontSize: 40, fontWeight: 600, color: '#fff', letterSpacing: -0.5, lineHeight: 1.3 }}>
                Our clients actually get more than a monthly PDF report.
              </TextBlock>
            </div>
          </div>
        )}

        {/* S3: Solution */}
        {s3 > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s3 }}>
            <div style={{ textAlign: 'center' }}>
              <TextBlock inF={375} outF={548} frame={frame} fps={fps}
                style={{ fontSize: 44, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>
                Every client gets their own personal dashboard.
              </TextBlock>
              <TextBlock inF={390} outF={548} frame={frame} fps={fps}
                style={{ fontSize: 24, fontWeight: 500, color: CORAL, marginTop: 20 }}>
                Live data. Real numbers. Zero guesswork.
              </TextBlock>
              <TextBlock inF={405} outF={548} frame={frame} fps={fps}
                style={{ fontSize: 17, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>
                Included with every Fusion Creative retainer.
              </TextBlock>
            </div>
          </div>
        )}

        {/* S4: Interactive chart */}
        {s4 > 0 && (
          <div style={{ position: 'absolute', inset: 0, opacity: s4 }}>
            <Chart color="#fff" data={igData} label="Instagram Views" sub="30-day rolling window"
              frame={frame} startF={575} fps={fps} area />
            <TextBlock inF={640} outF={750} frame={frame} fps={fps}
              style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', fontSize: 22, fontWeight: 600, color: '#fff' }}>
              Instagram Views
            </TextBlock>
            <TextBlock inF={655} outF={760} frame={frame} fps={fps}
              style={{ position: 'absolute', bottom: 50, left: 0, right: 0, textAlign: 'center', fontSize: 17, fontWeight: 500, color: CORAL }}>
              Peak: 341,000 views
            </TextBlock>
          </div>
        )}

        {/* S5: Full dashboard with tilt */}
        {s5 > 0 && (
          <div style={{ position: 'absolute', inset: 0, opacity: s5 }}>
            <DashboardWindow scale={s5scale} opacity={1} frame={frame} fps={fps} rotY={s5tilt} />
            <TextBlock inF={890} outF={1020} frame={frame} fps={fps}
              style={{ position: 'absolute', bottom: 55, left: 0, right: 0, textAlign: 'center', fontSize: 19, color: 'rgba(255,255,255,0.5)' }}>
              Everything your client needs. One place.
            </TextBlock>
            <TextBlock inF={930} outF={1040} frame={frame} fps={fps}
              style={{ position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center', fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>
              Instagram. TikTok. Reports. Idea Bank. All live.
            </TextBlock>
          </div>
        )}

        {/* S6: Value prop */}
        {s6 > 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s6 }}>
            <div style={{ textAlign: 'center' }}>
              <TextBlock inF={1065} outF={1240} frame={frame} fps={fps}
                style={{ fontSize: 44, fontWeight: 700, color: '#fff' }}>
                Included with every retainer.
              </TextBlock>
              <TextBlock inF={1080} outF={1240} frame={frame} fps={fps}
                style={{ fontSize: 22, color: 'rgba(255,255,255,0.55)', marginTop: 20 }}>
                Your own dashboard. Your own login. Your own data.
              </TextBlock>
              <TextBlock inF={1095} outF={1240} frame={frame} fps={fps}
                style={{ fontSize: 22, fontWeight: 500, color: CORAL, marginTop: 16 }}>
                No extra cost. No setup fee. Just results.
              </TextBlock>
            </div>
          </div>
        )}

        {/* S7: Brand close */}
        {frame >= 1250 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s7op * endFade }}>
            {/* Coral glow */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 600, height: 350, borderRadius: '50%',
              background: `radial-gradient(circle, rgba(232,85,60,${glowPulse}) 0%, transparent 70%)`,
              filter: 'blur(60px)',
            }} />
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div style={{
                fontSize: 80, fontWeight: 700, letterSpacing: -2, fontFamily: FNT,
                opacity: brandEnter,
                transform: `translateY(${interpolate(brandEnter, [0, 1], [15, 0], C)}px) scale(${0.96 + brandEnter * 0.04})`,
              }}>
                <span style={{ color: '#fff' }}>Fusion </span>
                <span style={{ color: CORAL }}>Creative</span>
              </div>
              <div style={{
                fontSize: 24, color: 'rgba(255,255,255,0.5)', marginTop: 20, fontFamily: FNT,
                opacity: tagEnter,
                transform: `translateY(${interpolate(tagEnter, [0, 1], [12, 0], C)}px)`,
              }}>
                Your growth, visualised.
              </div>
              <div style={{
                fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 14, fontFamily: FNT,
                opacity: urlEnter,
                transform: `translateY(${interpolate(urlEnter, [0, 1], [10, 0], C)}px)`,
              }}>
                fusioncreative.uk
              </div>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
