import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

const CORAL = '#E8553C';
const F = "-apple-system,BlinkMacSystemFont,'SF Pro Display',system-ui,sans-serif";
const C = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

// Safe spring: always returns 0-1 clamped
function spr(frame, fps, cfg) {
  const v = spring({ frame: Math.max(0, frame), fps, config: { damping: 12, mass: 0.8, stiffness: 100, ...cfg } });
  return Math.min(1, Math.max(0, v));
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
      {[['#FF5F57','#E0443E'],['#FFBD2E','#DEA123'],['#28C840','#1AAB29']].map(([bg, bd], i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: bg, border: `1px solid ${bd}` }}/>
      ))}
    </div>
  );
}

// ─── Stat Card ───
function StatCard({ label, value, suffix, progress, glow }) {
  const t = Math.min(1, Math.max(0, progress));
  const eased = 1 - Math.pow(1 - t, 4);
  const n = Math.round(eased * value);
  let disp;
  if (suffix === 'M') disp = (n / 1e6).toFixed(1) + 'M';
  else if (suffix === 'K') disp = (n / 1e3).toFixed(1) + 'K';
  else disp = String(n);
  return (
    <div style={{
      background: '#161616', borderRadius: 14, padding: '18px 22px', flex: 1,
      border: glow ? `1.5px solid ${CORAL}` : '1px solid #2a2a2a',
      boxShadow: glow ? '0 0 20px rgba(232,85,60,0.15)' : 'none',
    }}>
      <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontFamily: F }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', fontFamily: F }}>{disp}</div>
    </div>
  );
}

// ─── Chart ───
function LineChart({ color, progress, data, label, sub, area }) {
  const t = Math.min(1, Math.max(0, progress));
  const eased = 1 - Math.pow(1 - t, 2);
  const W = 480, H = 130, mx = Math.max(...data);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - (v / mx) * H * 0.88 - 8 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const ad = d + ` L${W},${H} L0,${H} Z`;
  const id = label.replace(/\W/g, '');
  const len = W * 2.5;
  const pi = data.indexOf(mx);
  const pp = pts[pi];
  const glow = eased > 0.85 ? (eased - 0.85) / 0.15 * 0.7 : 0;
  return (
    <div style={{ flex: 1, background: '#161616', borderRadius: 14, padding: '18px 22px', border: '1px solid #2a2a2a' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2, fontFamily: F }}>{label}</div>
      <div style={{ fontSize: 10, color: '#555', marginBottom: 14, fontFamily: F }}>{sub}</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
        <defs><filter id={`g${id}`}><feGaussianBlur stdDeviation="5"/></filter></defs>
        {[0.25, 0.5, 0.75].map(r => <line key={r} x1={0} y1={H * r} x2={W} y2={H * r} stroke="#1f1f1f" strokeWidth="0.5"/>)}
        <clipPath id={`c${id}`}><rect x={0} y={0} width={W * eased} height={H}/></clipPath>
        {area && <path d={ad} fill={color} fillOpacity={0.12} clipPath={`url(#c${id})`}/>}
        <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - eased)}/>
        {pp && glow > 0 && <><circle cx={pp.x} cy={pp.y} r={10} fill={color} opacity={glow * 0.4} filter={`url(#g${id})`}/><circle cx={pp.x} cy={pp.y} r={3.5} fill={color} opacity={glow}/></>}
      </svg>
    </div>
  );
}

// ─── Fade-Up Text ───
function Txt({ children, inF, outF, frame, style: s }) {
  if (frame < inF - 5 || frame > outF + 5) return null;
  const o = interpolate(frame, [inF, inF + 20, Math.max(inF + 21, outF - 20), outF], [0, 1, 1, 0], C);
  const y = interpolate(frame, [inF, inF + 25], [18, 0], C);
  return <div style={{ opacity: o, transform: `translateY(${y}px)`, fontFamily: F, ...s }}>{children}</div>;
}

// ─── Dashboard Window ───
function DashWindow({ scale, opacity, frame, countStart, rotY, rotX, tZ, tX, tY, highlightIdx, igDraw, tkDraw, igData, tkData }) {
  const cProg = (start) => interpolate(frame, [start, start + 90], [0, 1], C);
  return (
    <div style={{ perspective: 1200, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        transform: `scale(${scale}) rotateY(${rotY}deg) rotateX(${rotX}deg) translateZ(${tZ}px) translateX(${tX}px) translateY(${tY}px)`,
        opacity, width: 1440, borderRadius: 12, overflow: 'hidden', transformStyle: 'preserve-3d',
        boxShadow: '0 50px 150px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        {/* Title bar */}
        <div style={{ background: '#1a1a1a', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #2a2a2a' }}>
          <Dots/>
          <div style={{ fontSize: 13, color: '#777', fontWeight: 500, flex: 1, textAlign: 'center', marginRight: 72, fontFamily: F }}>Fusion Creative — New Greek Dashboard</div>
        </div>
        {/* Content */}
        <div style={{ background: '#0d0d0d', padding: 36, minHeight: 520 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: F }}>N</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: F }}>New Greek</div>
              <div style={{ fontSize: 12, color: '#555', fontFamily: F }}>Growth reporting and analytics</div>
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Reach" value={2300000} suffix="M" progress={cProg(countStart)} glow={highlightIdx === 0}/>
            <StatCard label="Impressions" value={3100000} suffix="M" progress={cProg(countStart + 5)} glow={highlightIdx === 1}/>
            <StatCard label="Engagements" value={55300} suffix="K" progress={cProg(countStart + 10)} glow={highlightIdx === 2}/>
            <StatCard label="Profile Visits" value={10900} suffix="K" progress={cProg(countStart + 15)} glow={highlightIdx === 3}/>
          </div>
          {/* Charts */}
          <div style={{ display: 'flex', gap: 16 }}>
            <LineChart color="#fff" progress={igDraw} data={igData} label="Instagram Views" sub="30-day rolling window"/>
            <LineChart color={CORAL} progress={tkDraw} data={tkData} label="TikTok Views" sub="30-day rolling" area/>
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

  // ── SCENE 1: Desktop (0-180) ──
  const deskOp = interpolate(frame, [0, 10, 168, 185], [0, 1, 1, 0], C);
  const curOp = interpolate(frame, [60, 75], [0, 1], C);
  const curT = interpolate(frame, [60, 140], [0, 1], C);
  const curX = 1400 - curT * curT * 440; // ease-in
  const curY = 400 + curT * 160;
  const clk1 = interpolate(frame, [150, 154, 158], [1, 0.82, 1], C);
  const clk2 = interpolate(frame, [160, 164, 168], [1, 0.82, 1], C);
  const iconS = 1 + spr(frame - 155, fps, { damping: 8, stiffness: 200 }) * 0.1;

  // ── SCENE 2: Window (180-300) ──
  const wS = spr(frame - 192, fps, { damping: 14, mass: 1, stiffness: 90 });
  const wScale = 0.06 + wS * 0.94;
  const wOp = interpolate(frame, [192, 215], [0, 1], C);
  const dFade = interpolate(frame, [218, 248], [0, 1], C);
  const dBlur = interpolate(frame, [192, 220], [0, 12], C);

  // ── SCENE 3: Text (300-450) ──
  const s3 = interpolate(frame, [295, 312], [0, 1], C) * interpolate(frame, [430, 450], [1, 0], C);

  // ── SCENE 4: IG zoom (450-660) ──
  const igPush = interpolate(frame, [460, 530], [0, 1], C);
  const igPull = interpolate(frame, [620, 655], [0, 1], C);
  const igCam = igPush - igPull;

  // ── SCENE 5: TK zoom (660-900) ──
  const tkPush = interpolate(frame, [670, 740], [0, 1], C);
  const tkPull = interpolate(frame, [860, 895], [0, 1], C);
  const tkCam = tkPush - tkPull;

  // Combined 3D
  const rY = igCam * -22 + tkCam * 18;
  const rX = igCam * 8 + tkCam * -6;
  const tZ = (igCam + tkCam) * 280;
  const tX = igCam * -220 + tkCam * 220;
  const tY = (igCam + tkCam) * 80;

  // ── SCENE 6: Highlights (900-1110) ──
  const hlIdx = frame >= 910 && frame < 1090 ? Math.floor(interpolate(frame, [910, 1089], [0, 3.99], C)) : -1;

  // ── SCENE 8: Brand (1290-1650) ──
  const brOp = interpolate(frame, [1310, 1345], [0, 1], C);
  const tgOp = interpolate(frame, [1345, 1375], [0, 1], C);
  const urlOp = interpolate(frame, [1370, 1395], [0, 1], C);
  const endFade = interpolate(frame, [1620, 1650], [1, 0], C);
  const glow = 0.3 + 0.15 * Math.sin((frame - 1310) * 0.05);

  // Visibility
  const showDesk = frame < 195;
  const showWin2 = frame >= 185 && frame < 300;
  const showDash3D = frame >= 450 && frame < 1110;
  const d3Op = showDash3D ? interpolate(frame, [450, 470], [0, 1], C) * interpolate(frame, [1080, 1110], [1, 0], C) : 0;

  const metricLabels = [
    'Total Reach \u2014 unique accounts that saw your content',
    'Impressions \u2014 total times your content was displayed',
    'Engagements \u2014 likes, comments, shares and saves',
    'Engagement Rate \u2014 1.8% \u2014 above industry average',
  ];

  return (
    <div style={{ width: 1920, height: 1080, background: '#080808', position: 'relative', overflow: 'hidden', fontFamily: F }}>

      {/* ═══ SCENE 1: Desktop ═══ */}
      {showDesk && (
        <div style={{ position: 'absolute', inset: 0, opacity: deskOp, filter: frame >= 192 ? `blur(${dBlur}px)` : 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 60%,#1a2a4a 0%,#0d1117 60%,#080808 100%)' }}/>
          {/* Menu bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 28, background: 'rgba(20,20,20,0.85)', display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 13, color: '#ccc', fontFamily: F, gap: 20, zIndex: 10 }}>
            <svg width="13" height="16" viewBox="0 0 14 17" fill="#ccc"><path d="M11.8 9c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3.1-1.7-1.3-.1-2.6.8-3.2.8-.7 0-1.7-.8-2.8-.7C3.1 4.3 1.8 5.1 1.1 6.4c-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.3 1.2-2.4 0 0-2.3-.9-2.5-3.7zM9.5 3.1c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6.9.1 1.9-.5 2.5-1.2z"/></svg>
            <span style={{ fontWeight: 600 }}>Finder</span>
            {['File','Edit','View','Go','Window','Help'].map(m => <span key={m} style={{ color: '#aaa' }}>{m}</span>)}
            <div style={{ flex: 1 }}/>
            <span style={{ fontSize: 12, fontWeight: 500 }}>09:41</span>
          </div>
          {/* Desktop icons - right column */}
          {[['#1A8EF5','S'],['#2196F3','M'],['#FF3B30','C'],['#5AC8FA','F'],['#FFF176','N']].map(([bg, letter], i) => (
            <div key={i} style={{ position: 'absolute', right: 40, top: 60 + i * 100, textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: F }}>{letter}</span>
              </div>
            </div>
          ))}
          {/* FC icon centre */}
          <div style={{ position: 'absolute', left: '50%', top: '52%', transform: `translate(-50%,-50%) scale(${iconS})`, textAlign: 'center' }}>
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 140, height: 140, borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,85,60,0.2)0%,transparent 70%)', filter: 'blur(12px)' }}/>
            <div style={{ width: 76, height: 76, borderRadius: 18, background: 'linear-gradient(145deg,#1c1c1c,#111)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', border: '1px solid #333', position: 'relative' }}>
              <span style={{ fontSize: 30, fontWeight: 700, color: CORAL, fontFamily: F }}>FC</span>
            </div>
            <div style={{ fontSize: 11, color: '#fff', marginTop: 6, textShadow: '0 1px 4px rgba(0,0,0,0.8)', fontFamily: F }}>Fusion Creative</div>
          </div>
          {/* Dock */}
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, padding: '5px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
            {['#1A8EF5','#2196F3','#FF3B30','#161616','#5AC8FA','#FFF176'].map((bg, i) => (
              <div key={i} style={{ width: 40, height: 40, borderRadius: 9, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: i === 3 ? '1px solid rgba(232,85,60,0.3)' : '1px solid rgba(255,255,255,0.04)' }}>
                {i === 3 && <span style={{ fontSize: 14, fontWeight: 700, color: CORAL, fontFamily: F }}>FC</span>}
              </div>
            ))}
          </div>
          {/* Cursor */}
          <Cursor x={curX} y={curY} opacity={curOp} scale={clk1 * clk2}/>
        </div>
      )}

      {/* ═══ SCENE 2: Window opens ═══ */}
      {showWin2 && (
        <DashWindow scale={wScale} opacity={wOp * dFade} frame={frame} countStart={240} rotY={0} rotX={0} tZ={0} tX={0} tY={0} highlightIdx={-1} igDraw={0} tkDraw={0} igData={igData} tkData={tkData}/>
      )}
      {frame >= 260 && frame < 300 && (
        <Txt inF={262} outF={298} frame={frame} style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>
          Your clients deserve better than a monthly PDF report.
        </Txt>
      )}

      {/* ═══ SCENE 3: Text ═══ */}
      {frame >= 295 && frame < 455 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s3 }}>
          <div style={{ textAlign: 'center' }}>
            <Txt inF={310} outF={445} frame={frame} style={{ fontSize: 44, fontWeight: 600, color: '#fff', letterSpacing: -0.5 }}>Every client gets their own personal dashboard.</Txt>
            <Txt inF={318} outF={445} frame={frame} style={{ fontSize: 26, fontWeight: 500, color: CORAL, marginTop: 20 }}>Live data. Real numbers. Zero guesswork.</Txt>
            <Txt inF={326} outF={445} frame={frame} style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}>Included with every Fusion Creative retainer.</Txt>
          </div>
        </div>
      )}

      {/* ═══ SCENES 4-6: Dashboard 3D ═══ */}
      {showDash3D && (
        <DashWindow scale={1} opacity={d3Op} frame={frame} countStart={460} rotY={rY} rotX={rX} tZ={tZ} tX={tX} tY={tY} highlightIdx={hlIdx}
          igDraw={interpolate(frame, [490, 580], [0, 1], C)} tkDraw={interpolate(frame, [680, 770], [0, 1], C)} igData={igData} tkData={tkData}/>
      )}
      {/* Scene 4 text */}
      <Txt inF={510} outF={598} frame={frame} style={{ position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center', fontSize: 28, fontWeight: 600, color: '#fff' }}>Instagram Views</Txt>
      <Txt inF={520} outF={598} frame={frame} style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontSize: 16, color: '#666' }}>30-day rolling window</Txt>
      <Txt inF={550} outF={610} frame={frame} style={{ position: 'absolute', bottom: 42, left: 0, right: 0, textAlign: 'center', fontSize: 18, fontWeight: 700, color: CORAL }}>Peak: 341,000 views</Txt>
      <Txt inF={600} outF={655} frame={frame} style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>See exactly when your content is winning.</Txt>
      {/* Scene 5 text */}
      <Txt inF={710} outF={800} frame={frame} style={{ position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center', fontSize: 28, fontWeight: 600, color: '#fff' }}>TikTok Views</Txt>
      <Txt inF={720} outF={810} frame={frame} style={{ position: 'absolute', bottom: 65, left: 0, right: 0, textAlign: 'center', fontSize: 22, fontWeight: 700, color: CORAL }}>1.3 million views in a single week.</Txt>
      <Txt inF={800} outF={895} frame={frame} style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontSize: 20, color: 'rgba(255,255,255,0.6)' }}>You will see moments like this the moment they happen.</Txt>
      {/* Scene 6 labels */}
      {hlIdx >= 0 && hlIdx < 4 && (() => {
        const segS = 910 + hlIdx * 45;
        const lOp = interpolate(frame, [segS, segS + 12, segS + 33, segS + 45], [0, 1, 1, 0], C);
        return <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', opacity: lOp, fontSize: 18, color: 'rgba(255,255,255,0.6)', fontFamily: F }}>{metricLabels[hlIdx]}</div>;
      })()}
      <Txt inF={1060} outF={1108} frame={frame} style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 16, color: 'rgba(255,255,255,0.4)' }}>Everything you need to understand your growth.</Txt>

      {/* ═══ SCENE 7: Offer ═══ */}
      {frame >= 1110 && frame < 1300 && (() => {
        const op7 = interpolate(frame, [1260, 1290], [1, 0], C);
        return (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: op7 }}>
            <div style={{ textAlign: 'center' }}>
              <Txt inF={1120} outF={1285} frame={frame} style={{ fontSize: 44, fontWeight: 600, color: '#fff' }}>Included with every retainer.</Txt>
              <Txt inF={1129} outF={1285} frame={frame} style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', marginTop: 20 }}>Your own dashboard. Your own login. Your own data.</Txt>
              <Txt inF={1138} outF={1285} frame={frame} style={{ fontSize: 24, fontWeight: 500, color: CORAL, marginTop: 16 }}>No extra cost. No setup fee. Just results.</Txt>
            </div>
          </div>
        );
      })()}

      {/* ═══ SCENE 8: Brand ═══ */}
      {frame >= 1290 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: endFade }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 550, height: 300, borderRadius: '50%', background: `radial-gradient(circle,rgba(232,85,60,${glow})0%,transparent 70%)`, filter: 'blur(60px)' }}/>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, opacity: brOp, fontFamily: F }}>
              <span style={{ color: '#fff' }}>Fusion </span><span style={{ color: CORAL }}>Creative</span>
            </div>
            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.55)', marginTop: 18, opacity: tgOp, fontFamily: F }}>Your growth, visualised.</div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 12, opacity: urlOp, fontFamily: F }}>fusioncreative.uk</div>
          </div>
        </div>
      )}
    </div>
  );
}
