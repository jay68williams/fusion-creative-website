import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

const CORAL = '#E8553C';
const BG = '#0a0a0a';
const SPR = { damping: 12, mass: 0.8, stiffness: 100 };

/* ── SVG Cursor ── */
function Cursor({ style }) {
  return (
    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" style={style}>
      <path d="M3 1L3 27L9 21L16 33L20 31L13 19L21 19L3 1Z" fill="#fff" stroke="#111" strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

/* ── Traffic Lights ── */
function Dots() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[['#FF5F57','#E0443E'],['#FEBC2E','#DEA123'],['#28C840','#1AAB29']].map(([bg,bd],i) => (
        <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: bg, border: `1px solid ${bd}` }}/>
      ))}
    </div>
  );
}

/* ── Stat Card ── */
function Stat({ label, value, suffix, frame, delay }) {
  const pop = spring({ frame: Math.max(0, frame - delay), fps: 30, config: SPR });
  const countStart = delay + 15;
  const t = interpolate(frame, [countStart, countStart + 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const eased = 1 - Math.pow(1 - t, 4);
  const n = Math.round(eased * value);
  let display;
  if (suffix === 'M') display = (n / 1e6).toFixed(1) + 'M';
  else if (suffix === 'K') display = (n / 1e3).toFixed(1) + 'K';
  else display = n.toLocaleString();
  return (
    <div style={{
      background: '#161616', borderRadius: 14, padding: '18px 22px', flex: 1,
      border: '1px solid #2a2a2a', transform: `scale(${pop})`, opacity: pop,
    }}>
      <div style={{ fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{display}</div>
    </div>
  );
}

/* ── Line Chart (SVG) ── */
function Chart({ color, drawStart, frame, data, label, subtitle, fill }) {
  const t = interpolate(frame, [drawStart, drawStart + 75], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const eased = 1 - Math.pow(1 - t, 2);
  const W = 480, H = 120;
  const mx = Math.max(...data);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * W, y: H - (v / mx) * H * 0.88 - 6 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = d + ` L${W},${H} L0,${H} Z`;
  const id = label.replace(/\s/g, '');
  const totalLen = W * 2.5;
  return (
    <div style={{ flex: 1, background: '#161616', borderRadius: 14, padding: '18px 22px', border: '1px solid #2a2a2a' }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 10, color: '#555', marginBottom: 14 }}>{subtitle}</div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', width: '100%', height: 'auto' }}>
        {[0.25, 0.5, 0.75].map(r => <line key={r} x1={0} y1={H * r} x2={W} y2={H * r} stroke="#222" strokeWidth="0.5"/>)}
        <clipPath id={`c-${id}`}><rect x={0} y={0} width={W * eased} height={H}/></clipPath>
        {fill && <path d={areaD} fill={color} fillOpacity={0.1} clipPath={`url(#c-${id})`}/>}
        <path d={d} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={totalLen} strokeDashoffset={totalLen * (1 - eased)}/>
        {/* Peak glow */}
        {eased > 0.85 && (() => {
          const peakIdx = data.indexOf(mx);
          const px = pts[peakIdx];
          if (!px) return null;
          const glowOp = interpolate(eased, [0.85, 1], [0, 0.6], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return <circle cx={px.x} cy={px.y} r={6} fill={color} opacity={glowOp} filter="url(#blur)"/>;
        })()}
        <defs><filter id="blur"><feGaussianBlur stdDeviation="4"/></filter></defs>
      </svg>
    </div>
  );
}

/* ── Fade-Up Text ── */
function FadeText({ text, inF, outF, frame, style: extraStyle }) {
  const op = interpolate(frame, [inF, inF + 20, outF - 20, outF], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const y = interpolate(frame, [inF, inF + 20], [18, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, textAlign: 'center',
      opacity: op, transform: `translateY(${y}px)`,
      fontSize: 20, fontWeight: 500, color: 'rgba(255,255,255,0.72)', letterSpacing: 0.3,
      ...extraStyle,
    }}>{text}</div>
  );
}

function SmallText({ text, inF, outF, frame, style: extraStyle }) {
  const op = interpolate(frame, [inF, inF + 15, outF - 15, outF], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, textAlign: 'center',
      opacity: op, fontSize: 14, color: 'rgba(255,255,255,0.45)',
      ...extraStyle,
    }}>{text}</div>
  );
}

/* ══════ MAIN COMPOSITION ══════ */
export function DashboardReveal() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sp = (f, cfg) => spring({ frame: Math.max(0, f), fps, config: { ...SPR, ...cfg } });

  // ── Scene 1: Hook text (0-120) ──
  const hookOp = interpolate(frame, [10, 35, 90, 115], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const hookY = interpolate(frame, [10, 35], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dotPulse = Math.sin((frame - 100) * 0.12) * 0.4 + 0.6;
  const dotOp = interpolate(frame, [105, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Scene 2: Icon + Window (120-240) ──
  const iconSpr = sp(frame - 125);
  const cursorProgress = interpolate(frame, [145, 185], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const cursorX = 550 * Math.pow(1 - cursorProgress, 2.5);
  const cursorOp = interpolate(frame, [145, 155], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const click1 = interpolate(frame, [188, 192, 196], [1, 0.82, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const click2 = interpolate(frame, [199, 203, 207], [1, 0.82, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const winSpr = sp(frame - 210);
  const winScale = interpolate(winSpr, [0, 1], [0.08, 1]);
  const winOp = interpolate(frame, [210, 225], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dashFade = interpolate(frame, [228, 250], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Scene 4: 3D camera push into IG chart (420-540) ──
  const camPushIG = interpolate(frame, [420, 480], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const camPullIG = interpolate(frame, [540, 580], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const camIG = camPushIG - camPullIG;
  const igRotY = camIG * 12;
  const igZ = camIG * 200;
  const igX = camIG * -180;
  const igY = camIG * 60;

  // ── Scene 5: 3D camera push into TikTok chart (600-720) ──
  const camPushTK = interpolate(frame, [600, 660], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const camPullTK = interpolate(frame, [720, 745], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const camTK = camPushTK - camPullTK;
  const tkRotY = camTK * -12;
  const tkZ = camTK * 200;
  const tkX = camTK * 180;
  const tkY = camTK * 60;

  // Combined camera
  const rotY = igRotY + tkRotY;
  const transZ = igZ + tkZ;
  const transX = igX + tkX;
  const transY = igY + tkY;

  // ── Scene 6: Close (750-900) ──
  const closeScale = interpolate(frame, [750, 800], [1, 0.88], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const closeFade = interpolate(frame, [750, 810], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const brandOp = interpolate(frame, [800, 830], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tagOp = interpolate(frame, [830, 855], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subOp = interpolate(frame, [845, 865], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const finalFade = interpolate(frame, [885, 900], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const glowPulse = 0.35 + 0.15 * Math.sin((frame - 800) * 0.06);

  const showIcon = frame >= 120 && frame < 220;
  const showWindow = frame >= 208 && frame < 810;
  const showBrand = frame >= 790;

  const igData = [80, 120, 160, 140, 220, 260, 200, 290, 341, 310, 280, 320, 300, 340, 310, 290, 260, 280, 250, 240];
  const tkData = [60, 100, 140, 250, 200, 350, 380, 300, 500, 650, 550, 800, 700, 1300, 900, 750, 600, 550, 500, 480];

  return (
    <div style={{
      width: 1920, height: 1080, background: BG, position: 'relative', overflow: 'hidden',
      fontFamily: "'Space Grotesk', -apple-system, system-ui, sans-serif",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: 900, height: 900,
        transform: 'translate(-50%,-50%)',
        background: `radial-gradient(circle, rgba(232,85,60,0.03) 0%, transparent 70%)`, borderRadius: '50%',
      }}/>

      {/* ═══ SCENE 1: Hook ═══ */}
      {frame < 125 && (
        <>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(-50%,-50%) translateY(${hookY}px)`,
            opacity: hookOp, fontSize: 42, fontWeight: 600, color: '#fff',
            textAlign: 'center', lineHeight: 1.3, letterSpacing: -0.5, whiteSpace: 'nowrap',
          }}>
            Your clients deserve better than a screenshot.
          </div>
          {/* Coral dot */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            width: 10, height: 10, borderRadius: '50%', background: CORAL,
            opacity: dotOp * dotPulse,
            boxShadow: `0 0 20px ${CORAL}`,
          }}/>
        </>
      )}

      {/* ═══ SCENE 2: Icon ═══ */}
      {showIcon && (
        <>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(-50%,-50%) scale(${iconSpr})`,
            width: 140, height: 140, borderRadius: 32,
            background: 'linear-gradient(145deg, #1c1c1c 0%, #111 100%)',
            border: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: CORAL, letterSpacing: -2 }}>FC</span>
          </div>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(${cursorX + 14}px, 14px) scale(${click1 * click2})`,
            transformOrigin: 'top left', opacity: cursorOp,
          }}>
            <Cursor/>
          </div>
        </>
      )}

      {/* ═══ SCENES 2-5: Window ═══ */}
      {showWindow && (
        <div style={{ perspective: 1800, position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            transform: `scale(${winScale * closeScale}) rotateY(${rotY}deg) translateZ(${transZ}px) translateX(${transX}px) translateY(${transY}px)`,
            opacity: winOp * closeFade,
            width: 1440, borderRadius: 12, overflow: 'hidden',
            boxShadow: '0 50px 150px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04)',
            transformStyle: 'preserve-3d',
          }}>
            {/* Title bar */}
            <div style={{
              background: '#1c1c1c', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 16,
              borderBottom: '1px solid #2a2a2a',
            }}>
              <Dots/>
              <div style={{ fontSize: 13, color: '#777', fontWeight: 500, flex: 1, textAlign: 'center', marginRight: 72 }}>
                Fusion Creative — New Greek Dashboard
              </div>
            </div>

            {/* Dashboard */}
            <div style={{ background: '#0d0d0d', padding: 36, opacity: dashFade, minHeight: 540 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', background: CORAL,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 700, color: '#fff',
                }}>N</div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#fff' }}>New Greek</div>
                  <div style={{ fontSize: 12, color: '#555' }}>Growth reporting and analytics</div>
                </div>
              </div>

              {/* Stat Cards */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
                <Stat label="Total Reach" value={2300000} suffix="M" frame={frame} delay={260}/>
                <Stat label="Impressions" value={3100000} suffix="M" frame={frame} delay={265}/>
                <Stat label="Engagements" value={55300} suffix="K" frame={frame} delay={270}/>
                <Stat label="Profile Visits" value={10900} suffix="K" frame={frame} delay={275}/>
              </div>

              {/* Charts */}
              <div style={{ display: 'flex', gap: 16 }}>
                <Chart color="#fff" drawStart={440} frame={frame} data={igData} label="Instagram Views" subtitle="30-day rolling window" fill={false}/>
                <Chart color={CORAL} drawStart={620} frame={frame} data={tkData} label="TikTok Views" subtitle="30-day rolling" fill={true}/>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Text Overlays ═══ */}
      {/* Scene 3 */}
      <FadeText text="Live performance data. Always up to date." inF={310} outF={410} frame={frame} style={{ bottom: 80 }}/>
      {/* Scene 4 */}
      <FadeText text="Instagram Views. 30-day rolling window." inF={460} outF={530} frame={frame} style={{ bottom: 80 }}/>
      <FadeText text="See exactly what is working and when." inF={535} outF={595} frame={frame} style={{ bottom: 80 }}/>
      {/* Scene 5 */}
      <FadeText text="When content goes viral, you will know instantly." inF={640} outF={720} frame={frame} style={{ bottom: 80 }}/>
      <SmallText text="1.3M views in a single week." inF={660} outF={720} frame={frame} style={{ bottom: 52 }}/>

      {/* ═══ SCENE 6: Brand Close ═══ */}
      {showBrand && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: finalFade,
        }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            width: 500, height: 260, borderRadius: '50%',
            background: `radial-gradient(circle, rgba(232,85,60,${glowPulse}) 0%, transparent 70%)`,
            filter: 'blur(50px)',
          }}/>
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{
              fontSize: 72, fontWeight: 700, letterSpacing: -1.5, opacity: brandOp,
            }}>
              <span style={{ color: '#fff' }}>Fusion </span>
              <span style={{ color: CORAL }}>Creative</span>
            </div>
            <div style={{
              fontSize: 22, color: 'rgba(255,255,255,0.6)', marginTop: 16, fontWeight: 400, opacity: tagOp,
            }}>
              Your growth, visualised.
            </div>
            <div style={{
              fontSize: 15, color: 'rgba(255,255,255,0.35)', marginTop: 12, fontWeight: 400, opacity: subOp,
            }}>
              Dashboard access included with every retainer.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
