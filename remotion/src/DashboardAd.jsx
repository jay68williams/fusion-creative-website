import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

const CORAL = '#E8553C';
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif";
const sp = (frame, fps, cfg = {}) =>
  spring({ frame: Math.max(0, frame), fps, config: { damping: 12, mass: 0.8, stiffness: 100, ...cfg } });
const cl = (v) => ({ extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

/* ═══════════════════════════════════
   SVG COMPONENTS
   ═══════════════════════════════════ */

function Cursor({ style }) {
  return (
    <svg width="24" height="30" viewBox="0 0 24 30" fill="none" style={{ filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.5))', ...style }}>
      <path d="M2.5 0.5L2.5 23L7.5 17.5L12.5 27L15.5 25.5L10.5 15.5L17.5 15.5L2.5 0.5Z"
        fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width="13" height="16" viewBox="0 0 14 17" fill="#ccc" style={{ marginTop: -1 }}>
      <path d="M11.8 9c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3.1-1.7-1.3-.1-2.6.8-3.2.8-.7 0-1.7-.8-2.8-.7C3.1 4.3 1.8 5.1 1.1 6.4c-1.5 2.6-.4 6.5 1.1 8.6.7 1 1.6 2.2 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.8.7c1.2 0 1.9-1 2.6-2.1.8-1.2 1.2-2.3 1.2-2.4 0 0-2.3-.9-2.5-3.7zM9.5 3.1c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.6.6-1 1.6-.9 2.6.9.1 1.9-.5 2.5-1.2z"/>
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg width="14" height="12" viewBox="0 0 16 12" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
      <path d="M1 4c3.9-3.5 10.1-3.5 14 0"/><path d="M3.5 7c2.5-2.2 6.5-2.2 9 0"/><circle cx="8" cy="10.5" r="1" fill="#ccc" stroke="none"/>
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="22" height="11" viewBox="0 0 24 12" fill="none">
      <rect x="0.5" y="1" width="20" height="10" rx="2" stroke="#ccc" strokeWidth="1"/>
      <rect x="2" y="2.5" width="14" height="7" rx="1" fill="#ccc"/>
      <rect x="21" y="4" width="2.5" height="4" rx="1" fill="#ccc"/>
    </svg>
  );
}

function SpotlightIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#ccc" strokeWidth="1.3">
      <circle cx="7" cy="7" r="5.5"/><line x1="11" y1="11" x2="14.5" y2="14.5"/>
    </svg>
  );
}

function ControlCentreIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round">
      <line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/>
      <circle cx="10" cy="4" r="1.5" fill="#ccc" stroke="none"/><circle cx="5" cy="8" r="1.5" fill="#ccc" stroke="none"/><circle cx="11" cy="12" r="1.5" fill="#ccc" stroke="none"/>
    </svg>
  );
}

/* ── Desktop App Icons ── */
function AppIcon({ bg, children, label, x, y, size = 56, glow }) {
  return (
    <div style={{ position: 'absolute', left: x, top: y, textAlign: 'center' }}>
      {glow && <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: size * 1.8, height: size * 1.8, borderRadius: '50%', background: `radial-gradient(circle,rgba(232,85,60,0.25)0%,transparent 70%)`, filter: 'blur(12px)' }}/>}
      <div style={{ width: size, height: size, borderRadius: size * 0.22, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
        {children}
      </div>
      {label && <div style={{ fontSize: 11, color: '#fff', marginTop: 6, textShadow: '0 1px 4px rgba(0,0,0,0.8)', fontFamily: FONT }}>{label}</div>}
    </div>
  );
}

function SafariLogo() { return <svg width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" fill="none" stroke="#fff" strokeWidth="1"/><polygon points="14,3 18,18 14,14 10,18" fill="#E44" opacity="0.9"/><polygon points="14,25 10,10 14,14 18,10" fill="#fff" opacity="0.9"/></svg>; }
function MailLogo() { return <svg width="24" height="18" viewBox="0 0 24 18"><rect width="24" height="18" rx="2" fill="none" stroke="#fff" strokeWidth="1.2"/><polyline points="1,1 12,10 23,1" fill="none" stroke="#fff" strokeWidth="1.2"/></svg>; }
function CalendarLogo() { return <><div style={{ fontSize: 8, fontWeight: 700, color: '#fff', lineHeight: 1, fontFamily: FONT }}>MAR</div><div style={{ fontSize: 18, fontWeight: 700, color: '#fff', lineHeight: 1, marginTop: 2, fontFamily: FONT }}>29</div></>; }
function PhotosLogo() { return <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="#FF6B9D"/><circle cx="7" cy="14" r="4" fill="#5AC8FA"/><circle cx="17" cy="14" r="4" fill="#FFCC02"/><circle cx="12" cy="18" r="4" fill="#4CD964"/></svg>; }
function FinderLogo() { return <svg width="22" height="26" viewBox="0 0 22 26"><rect x="1" y="1" width="20" height="24" rx="4" fill="#438AF5" stroke="#fff" strokeWidth="0.5"/><circle cx="8" cy="11" r="1.5" fill="#fff"/><circle cx="14" cy="11" r="1.5" fill="#fff"/><path d="M7 17c2 2 6 2 8 0" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round"/></svg>; }
function NotesLogo() { return <><div style={{ width: '100%', height: '40%', background: '#F5C518', borderRadius: '12px 12px 0 0', position: 'absolute', top: 0, left: 0 }}/><div style={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>{[0,1,2].map(i => <div key={i} style={{ height: 1.5, background: 'rgba(0,0,0,0.15)', marginBottom: 4, borderRadius: 1 }}/>)}</div></>; }

/* ── Traffic Lights ── */
function Dots() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[['#FF5F57','#E0443E'],['#FFBD2E','#DEA123'],['#28C840','#1AAB29']].map(([bg,bd],i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: bg, border: `1px solid ${bd}` }}/>
      ))}
    </div>
  );
}

/* ── Stat Card ── */
function Stat({ label, value, suffix, frame, delay, highlight }) {
  const pop = sp(frame - delay, 30, { damping: 14, mass: 1, stiffness: 90 });
  const t = interpolate(frame, [delay + 15, delay + 105], [0, 1], cl());
  const eased = 1 - Math.pow(1 - t, 4);
  const n = Math.round(eased * value);
  let display;
  if (suffix === 'M') display = (n / 1e6).toFixed(1) + 'M';
  else if (suffix === 'K') display = (n / 1e3).toFixed(1) + 'K';
  else display = n.toLocaleString();
  return (
    <div style={{
      background: '#161616', borderRadius: 14, padding: '18px 22px', flex: 1,
      border: highlight ? `1.5px solid ${CORAL}` : '1px solid #2a2a2a',
      transform: `scale(${pop})`, opacity: pop,
      boxShadow: highlight ? `0 0 20px rgba(232,85,60,0.15)` : 'none',
      transition: 'border 0.3s, box-shadow 0.3s',
    }}>
      <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10, fontFamily: FONT }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums', fontFamily: FONT }}>{display}</div>
    </div>
  );
}

/* ── Line / Area Chart ── */
function Chart({ color, drawStart, frame, data, label, sub, fill }) {
  const t = interpolate(frame, [drawStart, drawStart + 90], [0, 1], cl());
  const eased = 1 - Math.pow(1 - t, 2);
  const W = 480, H = 130;
  const mx = Math.max(...data);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - (v / mx) * H * 0.88 - 8 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = d + ` L${W},${H} L0,${H} Z`;
  const id = label.replace(/\s/g, '');
  const len = W * 2.5;
  const peakIdx = data.indexOf(mx);
  const peakPt = pts[peakIdx];
  const glowOp = eased > 0.85 ? interpolate(eased, [0.85, 1], [0, 0.7], cl()) : 0;
  return (
    <div style={{ flex: 1, background: '#161616', borderRadius: 14, padding: '18px 22px', border: '1px solid #2a2a2a' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2, fontFamily: FONT }}>{label}</div>
      <div style={{ fontSize: 10, color: '#555', marginBottom: 14, fontFamily: FONT }}>{sub}</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
        <defs><filter id={`gl-${id}`}><feGaussianBlur stdDeviation="5"/></filter></defs>
        {[0.25, 0.5, 0.75].map(r => <line key={r} x1={0} y1={H * r} x2={W} y2={H * r} stroke="#1f1f1f" strokeWidth="0.5"/>)}
        <clipPath id={`cp-${id}`}><rect x={0} y={0} width={W * eased} height={H}/></clipPath>
        {fill && <path d={areaD} fill={color} fillOpacity={0.12} clipPath={`url(#cp-${id})`}/>}
        <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={len} strokeDashoffset={len * (1 - eased)}/>
        {peakPt && glowOp > 0 && <>
          <circle cx={peakPt.x} cy={peakPt.y} r={10} fill={color} opacity={glowOp * 0.4} filter={`url(#gl-${id})`}/>
          <circle cx={peakPt.x} cy={peakPt.y} r={3.5} fill={color} opacity={glowOp}/>
        </>}
      </svg>
    </div>
  );
}

/* ── Text helpers ── */
function FadeUp({ text, inF, outF, frame, style: s }) {
  const o = interpolate(frame, [inF, inF + 20, outF - 20, outF], [0, 1, 1, 0], cl());
  const y = sp(frame - inF, 30, { damping: 14, stiffness: 80 });
  const ty = interpolate(y, [0, 1], [20, 0]);
  return <div style={{ opacity: o, transform: `translateY(${ty}px)`, fontFamily: FONT, ...s }}>{text}</div>;
}

/* ══════════════════════════════════════════
   MAIN COMPOSITION — 1650 frames / 55 sec
   ══════════════════════════════════════════ */

export function DashboardAd() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Chart data
  const igData = [80, 120, 160, 140, 220, 260, 200, 290, 341, 310, 280, 320, 300, 340, 310, 290, 260, 280, 250, 240];
  const tkData = [60, 100, 140, 250, 200, 350, 380, 300, 500, 650, 550, 800, 700, 1300, 900, 750, 600, 550, 500, 480];

  /* ─── SCENE 1: macOS Desktop (0-180) ─── */
  const desktopOp = interpolate(frame, [0, 10, 170, 185], [0, 1, 1, 0], cl());
  const cursorOp1 = interpolate(frame, [60, 75], [0, 1], cl());
  const cursorProg = interpolate(frame, [60, 140], [0, 1], cl());
  const cx1 = interpolate(cursorProg, [0, 1], [1400, 960], cl());
  const cy1 = interpolate(cursorProg, [0, 1], [400, 560], cl());
  // slow approach
  const cxFinal = 960 + (cx1 - 960) * Math.pow(1 - cursorProg, 0.3) / Math.pow(1, 0.3);
  const click1a = interpolate(frame, [150, 154, 158], [1, 0.82, 1], cl());
  const click1b = interpolate(frame, [160, 164, 168], [1, 0.82, 1], cl());
  const iconBounce = sp(frame - 155, fps, { damping: 8, stiffness: 200 });
  const iconScale1 = interpolate(iconBounce, [0, 0.5, 0.8, 1], [1, 1.12, 0.95, 1]);

  /* ─── SCENE 2: Window opens (180-300) ─── */
  const winSpr = sp(frame - 190, fps, { damping: 14, mass: 1, stiffness: 90 });
  const winScale = interpolate(winSpr, [0, 1], [0.06, 1]);
  const winOp = interpolate(frame, [190, 210], [0, 1], cl());
  const dashFade = interpolate(frame, [215, 245], [0, 1], cl());
  const desktopBlur = interpolate(frame, [190, 220], [0, 12], cl());

  /* ─── SCENE 3: What you get (300-450) ─── */
  const s3fade = interpolate(frame, [290, 310], [0, 1], cl());
  const s3out = interpolate(frame, [430, 450], [1, 0], cl());

  /* ─── SCENE 4: IG 3D close-up (450-660) ─── */
  const camPushIG = interpolate(frame, [460, 530], [0, 1], cl());
  const camPullIG = interpolate(frame, [620, 655], [0, 1], cl());
  const camIG = camPushIG - camPullIG;

  /* ─── SCENE 5: TikTok spike (660-900) ─── */
  const camPushTK = interpolate(frame, [670, 740], [0, 1], cl());
  const camPullTK = interpolate(frame, [860, 895], [0, 1], cl());
  const camTK = camPushTK - camPullTK;

  // Combined 3D camera
  const rotY = camIG * -22 + camTK * 18;
  const rotX = camIG * 8 + camTK * -6;
  const tZ = (camIG + camTK) * 280;
  const tX = camIG * -220 + camTK * 220;
  const tY = camIG * 80 + camTK * 80;

  /* ─── SCENE 6: Metrics explained (900-1110) ─── */
  const highlightIdx = Math.floor(interpolate(frame, [910, 1090], [0, 4], cl()));

  /* ─── SCENE 7: The offer (1110-1290) ─── */
  /* ─── SCENE 8: Brand close (1290-1650) ─── */
  const brandOp = interpolate(frame, [1310, 1345], [0, 1], cl());
  const tagOp = interpolate(frame, [1345, 1375], [0, 1], cl());
  const urlOp = interpolate(frame, [1370, 1395], [0, 1], cl());
  const finalFade = interpolate(frame, [1620, 1650], [1, 0], cl());
  const glowPulse = 0.3 + 0.15 * Math.sin((frame - 1310) * 0.05);

  // Dashboard visible ranges
  const showDesktop = frame < 195;
  const showDashWin = frame >= 185 && frame < 300;
  const showDash3D = frame >= 450 && frame < 1110;
  const dashWinOp2 = showDash3D ? interpolate(frame, [450, 470], [0, 1], cl()) : 0;
  const dashWinOut = showDash3D ? interpolate(frame, [1080, 1110], [1, 0], cl()) : 1;

  const metricLabels = [
    'Total Reach — unique accounts that saw your content',
    'Impressions — total times your content was displayed',
    'Engagements — likes, comments, shares and saves',
    'Engagement Rate — 1.8% — above industry average',
  ];

  return (
    <div style={{ width: 1920, height: 1080, background: '#080808', position: 'relative', overflow: 'hidden', fontFamily: FONT }}>

      {/* ═══ SCENE 1: macOS Desktop ═══ */}
      {showDesktop && (
        <div style={{ position: 'absolute', inset: 0, opacity: desktopOp, filter: showDashWin ? `blur(${desktopBlur}px)` : 'none' }}>
          {/* Wallpaper */}
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 60%, #1a2a4a 0%, #0d1117 60%, #080808 100%)' }}/>

          {/* Menu bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 28,
            background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', padding: '0 12px', zIndex: 10,
            fontSize: 13, color: '#ccc', fontFamily: FONT, gap: 18,
          }}>
            <AppleLogo/>
            <span style={{ fontWeight: 600 }}>Finder</span>
            {['File','Edit','View','Go','Window','Help'].map(m => <span key={m} style={{ fontWeight: 400, color: '#aaa' }}>{m}</span>)}
            <div style={{ flex: 1 }}/>
            <WifiIcon/><BatteryIcon/>
            <span style={{ fontSize: 12, color: '#ccc', fontWeight: 500 }}>09:41</span>
            <SpotlightIcon/><ControlCentreIcon/>
          </div>

          {/* Desktop icons */}
          <AppIcon bg="linear-gradient(180deg,#1A8EF5,#0066CC)" x={1760} y={60} label="Safari"><SafariLogo/></AppIcon>
          <AppIcon bg="linear-gradient(180deg,#2196F3,#1565C0)" x={1760} y={160} label="Mail"><MailLogo/></AppIcon>
          <AppIcon bg="linear-gradient(180deg,#FF3B30,#CC2D25)" x={1760} y={260} label="Calendar"><CalendarLogo/></AppIcon>
          <AppIcon bg="linear-gradient(180deg,#FF6B9D,#FF2D55)" x={1760} y={360} label="Photos"><PhotosLogo/></AppIcon>
          <AppIcon bg="linear-gradient(180deg,#5AC8FA,#34AADC)" x={1760} y={460} label="Finder"><FinderLogo/></AppIcon>
          <AppIcon bg="linear-gradient(180deg,#FFF9C4,#FFE082)" x={1760} y={560} label="Notes"><NotesLogo/></AppIcon>

          {/* Centre FC icon */}
          <div style={{ position: 'absolute', left: '50%', top: '52%', transform: `translate(-50%,-50%) scale(${frame >= 150 ? iconScale1 : 1})` }}>
            <AppIcon bg="linear-gradient(145deg,#1c1c1c,#111)" x={-40} y={-40} size={80} label="Fusion Creative" glow>
              <span style={{ fontSize: 32, fontWeight: 700, color: CORAL, letterSpacing: -1, fontFamily: FONT }}>FC</span>
            </AppIcon>
          </div>

          {/* Dock */}
          <div style={{
            position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 6, padding: '6px 12px',
            background: 'rgba(255,255,255,0.1)', borderRadius: 16,
            backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {[
              ['linear-gradient(180deg,#1A8EF5,#0066CC)', <SafariLogo key="s"/>],
              ['linear-gradient(180deg,#2196F3,#1565C0)', <MailLogo key="m"/>],
              ['linear-gradient(180deg,#FF3B30,#CC2D25)', <CalendarLogo key="c"/>],
              ['linear-gradient(180deg,#161616,#111)', <span key="fc" style={{ fontSize: 16, fontWeight: 700, color: CORAL, fontFamily: FONT }}>FC</span>],
              ['linear-gradient(180deg,#5AC8FA,#34AADC)', <FinderLogo key="f"/>],
              ['linear-gradient(180deg,#FFF9C4,#FFE082)', <NotesLogo key="n"/>],
            ].map(([bg, icon], i) => (
              <div key={i} style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', border: i === 3 ? `1px solid rgba(232,85,60,0.3)` : '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                {icon}
              </div>
            ))}
          </div>

          {/* Cursor */}
          <div style={{ position: 'absolute', left: cx1, top: cy1, opacity: cursorOp1, transform: `scale(${click1a * click1b})`, transformOrigin: 'top left', zIndex: 20 }}>
            <Cursor/>
          </div>
        </div>
      )}

      {/* ═══ SCENE 2: Window opens ═══ */}
      {showDashWin && (
        <div style={{ perspective: 1400, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
          <div style={{
            transform: `scale(${winScale})`, opacity: winOp,
            width: 1440, borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 50px 150px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
          }}>
            <div style={{ background: '#1a1a1a', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #2a2a2a' }}>
              <Dots/>
              <div style={{ fontSize: 13, color: '#777', fontWeight: 500, flex: 1, textAlign: 'center', marginRight: 72, fontFamily: FONT }}>Fusion Creative — New Greek Dashboard</div>
            </div>
            <div style={{ background: '#0d0d0d', padding: 36, opacity: dashFade, minHeight: 520 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: FONT }}>N</div>
                <div><div style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: FONT }}>New Greek</div><div style={{ fontSize: 12, color: '#555', fontFamily: FONT }}>Growth reporting and analytics</div></div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                <Stat label="Total Reach" value={2300000} suffix="M" frame={frame} delay={240}/>
                <Stat label="Impressions" value={3100000} suffix="M" frame={frame} delay={245}/>
                <Stat label="Engagements" value={55300} suffix="K" frame={frame} delay={250}/>
                <Stat label="Profile Visits" value={10900} suffix="K" frame={frame} delay={255}/>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <Chart color="#fff" drawStart={9999} frame={frame} data={igData} label="Instagram Views" sub="30-day rolling window"/>
                <Chart color={CORAL} drawStart={9999} frame={frame} data={tkData} label="TikTok Views" sub="30-day rolling" fill/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scene 2 text overlay */}
      {frame >= 260 && frame < 300 && (
        <FadeUp text="Your clients deserve better than a monthly PDF report." inF={260} outF={298} frame={frame}
          style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', fontSize: 20, color: 'rgba(255,255,255,0.65)' }}/>
      )}

      {/* ═══ SCENE 3: What you get ═══ */}
      {frame >= 295 && frame < 455 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s3fade * s3out }}>
          <div style={{ textAlign: 'center' }}>
            <FadeUp text="Every client gets their own personal dashboard." inF={310} outF={445} frame={frame}
              style={{ fontSize: 44, fontWeight: 600, color: '#fff', letterSpacing: -0.5 }}/>
            <FadeUp text="Live data. Real numbers. Zero guesswork." inF={318} outF={445} frame={frame}
              style={{ fontSize: 26, fontWeight: 500, color: CORAL, marginTop: 20 }}/>
            <FadeUp text="Included with every Fusion Creative retainer." inF={326} outF={445} frame={frame}
              style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)', marginTop: 16 }}/>
          </div>
        </div>
      )}

      {/* ═══ SCENES 4-6: Dashboard 3D ═══ */}
      {showDash3D && (
        <div style={{ perspective: 1200, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            transform: `rotateY(${rotY}deg) rotateX(${rotX}deg) translateZ(${tZ}px) translateX(${tX}px) translateY(${tY}px)`,
            opacity: dashWinOp2 * dashWinOut,
            width: 1440, borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 50px 150px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
            transformStyle: 'preserve-3d',
          }}>
            <div style={{ background: '#1a1a1a', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16, borderBottom: '1px solid #2a2a2a' }}>
              <Dots/>
              <div style={{ fontSize: 13, color: '#777', fontWeight: 500, flex: 1, textAlign: 'center', marginRight: 72, fontFamily: FONT }}>Fusion Creative — New Greek Dashboard</div>
            </div>
            <div style={{ background: '#0d0d0d', padding: 36, minHeight: 520 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', fontFamily: FONT }}>N</div>
                <div><div style={{ fontSize: 24, fontWeight: 700, color: '#fff', fontFamily: FONT }}>New Greek</div><div style={{ fontSize: 12, color: '#555', fontFamily: FONT }}>Growth reporting and analytics</div></div>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                <Stat label="Total Reach" value={2300000} suffix="M" frame={Math.max(frame, 460)} delay={460} highlight={frame >= 910 && highlightIdx === 0}/>
                <Stat label="Impressions" value={3100000} suffix="M" frame={Math.max(frame, 465)} delay={465} highlight={frame >= 910 && highlightIdx === 1}/>
                <Stat label="Engagements" value={55300} suffix="K" frame={Math.max(frame, 470)} delay={470} highlight={frame >= 910 && highlightIdx === 2}/>
                <Stat label="Profile Visits" value={10900} suffix="K" frame={Math.max(frame, 475)} delay={475} highlight={frame >= 910 && highlightIdx === 3}/>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <Chart color="#fff" drawStart={490} frame={frame} data={igData} label="Instagram Views" sub="30-day rolling window"/>
                <Chart color={CORAL} drawStart={680} frame={frame} data={tkData} label="TikTok Views" sub="30-day rolling" fill/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scene 4 text overlays */}
      {frame >= 510 && frame < 600 && <FadeUp text="Instagram Views" inF={510} outF={598} frame={frame} style={{ position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center', fontSize: 28, fontWeight: 600, color: '#fff' }}/>}
      {frame >= 520 && frame < 600 && <FadeUp text="30-day rolling window" inF={520} outF={598} frame={frame} style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontSize: 16, color: '#666' }}/>}
      {frame >= 550 && frame < 610 && <FadeUp text="Peak: 341,000 views" inF={550} outF={608} frame={frame} style={{ position: 'absolute', bottom: 42, left: 0, right: 0, textAlign: 'center', fontSize: 18, fontWeight: 700, color: CORAL }}/>}
      {frame >= 600 && frame < 655 && <FadeUp text="See exactly when your content is winning." inF={600} outF={653} frame={frame} style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontSize: 20, color: 'rgba(255,255,255,0.6)' }}/>}

      {/* Scene 5 text overlays */}
      {frame >= 710 && frame < 800 && <FadeUp text="TikTok Views" inF={710} outF={798} frame={frame} style={{ position: 'absolute', bottom: 100, left: 0, right: 0, textAlign: 'center', fontSize: 28, fontWeight: 600, color: '#fff' }}/>}
      {frame >= 720 && frame < 810 && <FadeUp text="1.3 million views in a single week." inF={720} outF={808} frame={frame} style={{ position: 'absolute', bottom: 65, left: 0, right: 0, textAlign: 'center', fontSize: 22, fontWeight: 700, color: CORAL }}/>}
      {frame >= 800 && frame < 895 && <FadeUp text="You will see moments like this the moment they happen." inF={800} outF={893} frame={frame} style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontSize: 20, color: 'rgba(255,255,255,0.6)' }}/>}

      {/* Scene 6 metric labels */}
      {frame >= 910 && frame < 1110 && (() => {
        const labelIdx = Math.floor(interpolate(frame, [910, 1090], [0, 4], cl()));
        const segStart = 910 + labelIdx * 45;
        const lOp = interpolate(frame, [segStart, segStart + 12, segStart + 33, segStart + 45], [0, 1, 1, 0], cl());
        return (
          <div style={{ position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center', opacity: lOp, fontSize: 18, color: 'rgba(255,255,255,0.6)', fontFamily: FONT }}>
            {metricLabels[Math.min(labelIdx, 3)]}
          </div>
        );
      })()}
      {frame >= 1060 && frame < 1110 && <FadeUp text="Everything you need to understand your growth." inF={1060} outF={1108} frame={frame} style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center', fontSize: 16, color: 'rgba(255,255,255,0.4)' }}/>}

      {/* ═══ SCENE 7: The offer ═══ */}
      {frame >= 1110 && frame < 1300 && (() => {
        const s7op = interpolate(frame, [1260, 1290], [1, 0], cl());
        return (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: s7op }}>
            <div style={{ textAlign: 'center' }}>
              <FadeUp text="Included with every retainer." inF={1120} outF={1285} frame={frame}
                style={{ fontSize: 44, fontWeight: 600, color: '#fff', letterSpacing: -0.5 }}/>
              <FadeUp text="Your own dashboard. Your own login. Your own data." inF={1129} outF={1285} frame={frame}
                style={{ fontSize: 24, fontWeight: 400, color: 'rgba(255,255,255,0.6)', marginTop: 20 }}/>
              <FadeUp text="No extra cost. No setup fee. Just results." inF={1138} outF={1285} frame={frame}
                style={{ fontSize: 24, fontWeight: 500, color: CORAL, marginTop: 16 }}/>
            </div>
          </div>
        );
      })()}

      {/* ═══ SCENE 8: Brand close ═══ */}
      {frame >= 1290 && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: finalFade }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 550, height: 300, borderRadius: '50%', background: `radial-gradient(circle, rgba(232,85,60,${glowPulse}) 0%, transparent 70%)`, filter: 'blur(60px)' }}/>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2, opacity: brandOp, fontFamily: FONT }}>
              <span style={{ color: '#fff' }}>Fusion </span><span style={{ color: CORAL }}>Creative</span>
            </div>
            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.55)', marginTop: 18, fontWeight: 400, opacity: tagOp, fontFamily: FONT }}>Your growth, visualised.</div>
            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 12, fontWeight: 400, opacity: urlOp, fontFamily: FONT }}>fusioncreative.uk</div>
          </div>
        </div>
      )}
    </div>
  );
}
