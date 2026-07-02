import { useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from 'remotion';

// ── Brand system — matches the established NewGreekBakeryMenu.jsx exactly ─────

const BLUE = '#0D47A1';
const BLUE_DARK = '#062A5E';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';
const OFF_WHITE = '#F5F2EB';
const WARM_BG = '#0B3A7A';

const ADDRESS = '8 Clayton Road, Jesmond, Newcastle upon Tyne, NE2 4RP';

const PRODUCTS = [
  { src: 'newgreek-bakery/01-feta-baguette.jpg', name: 'Feta & Herb Baguette' },
  { src: 'newgreek-bakery/02-caprese-tomato-bread.jpg', name: 'Caprese & Balsamic Bread' },
  { src: 'newgreek-bakery/08-round-pie.jpg', name: 'Golden Filo Pie' },
  { src: 'newgreek-bakery/04-swirl-pie.jpg', name: 'Filo Swirl Pie' },
  { src: 'newgreek-bakery/06-pistachio-croissant.jpg', name: 'Pistachio Croissant' },
];

// ── Timeline (900 frames @ 30fps = 30s) ─────────────────────────────────────────

const HOOK_START = 0;
const HOOK_END = 110;
const PRODUCT_DUR = 110; // slow, generous hold per food shot (~3.7s @ 30fps)
const SHOWCASE_START = HOOK_END;
const SHOWCASE_END = SHOWCASE_START + PRODUCT_DUR * PRODUCTS.length; // 660
const INFO_START = SHOWCASE_END; // 660
const TOTAL = INFO_START + 240; // 900 (30s) — long, generous hold on the info card
const CROSS = 16; // crossfade window between acts (Hook/Showcase/Info handoffs)
const PRODUCT_CROSS = 34; // slow, gentle crossfade between individual food photos

// ── Helpers ─────────────────────────────────────────────────────────────────

function squirclePath(w, h, r) {
  return `M ${r},0 H ${w - r} Q ${w},0 ${w},${r} V ${h - r} Q ${w},${h} ${w - r},${h} H ${r} Q 0,${h} 0,${h - r} V ${r} Q 0,0 ${r},0 Z`;
}

function OliveLeaf({ x, y, rotation = 0, delay = 0, scale = 1 }) {
  const frame = useCurrentFrame();
  const sway = Math.sin((frame + delay * 8) * 0.025) * 5;
  const opacity = interpolate(frame - delay, [0, 20], [0, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <svg
      width={60 * scale}
      height={90 * scale}
      viewBox="0 0 60 90"
      style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotation + sway}deg)`, opacity }}
    >
      <ellipse cx="30" cy="45" rx="18" ry="38" fill={GOLD} />
      <line x1="30" y1="10" x2="30" y2="80" stroke={OFF_WHITE} strokeWidth="1.5" opacity="0.4" />
    </svg>
  );
}

function PinIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
        fill={GOLD}
      />
    </svg>
  );
}

function ClockIcon({ size = 30 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke={GOLD} strokeWidth="1.5" fill="none" />
      <line x1="12" y1="12" x2="12" y2="7" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="12" x2="15.5" y2="13.5" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Background chrome (persistent across the whole video) ─────────────────────

function Backdrop({ width, height }) {
  const frame = useCurrentFrame();
  const bgShift = interpolate(frame, [0, TOTAL], [0, -20], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(160deg, ${BLUE_DARK} 0%, ${BLUE} 45%, ${WARM_BG} 100%)`,
          transform: `translateY(${bgShift}px)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.035,
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 40px, ${WHITE} 40px, ${WHITE} 41px)`,
        }}
      />
      <OliveLeaf x={-10} y={70} rotation={-20} delay={4} scale={1.3} />
      <OliveLeaf x={width - 70} y={height * 0.42} rotation={160} delay={8} />
      <OliveLeaf x={50} y={height - 160} rotation={30} delay={12} scale={0.9} />
      <OliveLeaf x={width - 110} y={height - 190} rotation={-140} delay={16} />
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 6,
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        }}
      />
      <div
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 6,
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        }}
      />
    </>
  );
}

// ── Act 1: Hook ─────────────────────────────────────────────────────────────

function Hook({ width, height }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(
    frame,
    [HOOK_START, HOOK_START + 10, HOOK_END - CROSS, HOOK_END],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const logoScale = spring({ frame: frame - 8, fps, from: 0, to: 1, config: { damping: 11, stiffness: 140, mass: 0.7 } });
  const logoRotate = interpolate(frame - 8, [0, 30], [-8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const kickerOpacity = interpolate(frame, [22, 34], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const kickerY = spring({ frame: frame - 22, fps, from: 16, to: 0, config: { damping: 14, stiffness: 110, mass: 0.6 } });

  const words = ['Have', 'you', 'met', 'the', 'Bakery?'];

  const subOpacity = interpolate(frame, [62, 78], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const subY = spring({ frame: frame - 62, fps, from: 18, to: 0, config: { damping: 14, stiffness: 100, mass: 0.6 } });

  return (
    <div style={{ position: 'absolute', inset: 0, opacity, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: 130, height: 130, marginBottom: 26, borderRadius: '50%', overflow: 'hidden',
          transform: `scale(${logoScale}) rotate(${logoRotate}deg)`,
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))',
        }}
      >
        <Img src={staticFile('newgreek-bakery/logo.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div
        style={{
          opacity: kickerOpacity,
          transform: `translateY(${kickerY}px)`,
          fontFamily: "'Georgia', serif",
          fontSize: 22,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: `${GOLD}CC`,
          marginBottom: 18,
        }}
      >
        You're at New Greek — a note from next door
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        {words.map((w, i) => {
          const wDelay = 34 + i * 3;
          const s = spring({ frame: frame - wDelay, fps, from: 0.7, to: 1, config: { damping: 12, stiffness: 170 + i * 8, mass: 0.7 } });
          const o = interpolate(frame - wDelay, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                fontFamily: "'Georgia', serif",
                fontSize: 76,
                fontWeight: 700,
                color: w === 'Bakery?' ? GOLD : WHITE,
                opacity: o,
                transform: `scale(${s})`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>

      <div
        style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          fontFamily: "'Georgia', serif",
          fontSize: 26,
          fontStyle: 'italic',
          color: `${OFF_WHITE}DD`,
          marginTop: 22,
          letterSpacing: '0.03em',
        }}
      >
        Fresh Greek pastries, pies &amp; coffee — baked daily
      </div>
    </div>
  );
}

// ── Act 2: Product showcase ─────────────────────────────────────────────────

function ProductShowcase({ width, height }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - SHOWCASE_START;

  // Fade in only — the last product already fades itself out at the tail,
  // so an act-level fade-out here would compound with it and crush to near-zero.
  const actOpacity = interpolate(
    frame,
    [SHOWCASE_START, SHOWCASE_START + CROSS],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (local < -CROSS || local > SHOWCASE_END - SHOWCASE_START + PRODUCT_CROSS) return null;

  const w = 860;
  const h = 560;
  const r = 40;
  const clip = squirclePath(w, h, r);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: actOpacity, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          fontFamily: "'Georgia', serif",
          fontSize: 20,
          letterSpacing: '0.26em',
          textTransform: 'uppercase',
          color: `${GOLD}CC`,
          marginBottom: 22,
        }}
      >
        From the bakery
      </div>

      <div style={{ position: 'relative', width: w, height: h }}>
        {PRODUCTS.map((p, i) => {
          const slotStart = i * PRODUCT_DUR;
          const slotLocal = local - slotStart;
          if (slotLocal < -PRODUCT_CROSS || slotLocal > PRODUCT_DUR + PRODUCT_CROSS) return null;

          const opacity = interpolate(
            slotLocal,
            [0, PRODUCT_CROSS, PRODUCT_DUR - PRODUCT_CROSS, PRODUCT_DUR],
            [0, 1, 1, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          const kenBurns = interpolate(slotLocal, [0, PRODUCT_DUR], [1, 1.09], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          const labelSpring = spring({ frame: slotLocal - 14, fps, from: 16, to: 0, config: { damping: 15, stiffness: 70, mass: 0.8 } });
          const labelOpacity = interpolate(slotLocal, [14, 34, PRODUCT_DUR - PRODUCT_CROSS, PRODUCT_DUR], [0, 1, 1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          return (
            <div key={i} style={{ position: 'absolute', inset: 0, opacity }}>
              <div
                style={{
                  width: '100%', height: '100%', borderRadius: r,
                  overflow: 'hidden',
                  border: `3px solid ${GOLD}`,
                  boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
                }}
              >
                <svg width={0} height={0} style={{ position: 'absolute' }}>
                  <clipPath id={`clip-${i}`}>
                    <path d={clip} />
                  </clipPath>
                </svg>
                <div style={{ width: '100%', height: '100%', clipPath: `path('${clip}')`, transform: `scale(${kenBurns})` }}>
                  <Img src={staticFile(p.src)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  bottom: -46,
                  transform: `translateX(-50%) translateY(${labelSpring}px)`,
                  opacity: labelOpacity,
                  background: `linear-gradient(135deg, ${GOLD}, #E0BE70)`,
                  color: BLUE_DARK,
                  padding: '10px 30px',
                  borderRadius: 999,
                  fontFamily: "'Georgia', serif",
                  fontSize: 24,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 10px 26px rgba(0,0,0,0.35)',
                }}
              >
                {p.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* progress dots */}
      <div style={{ position: 'absolute', bottom: 70, display: 'flex', gap: 12 }}>
        {PRODUCTS.map((_, i) => {
          const active = local >= i * PRODUCT_DUR && local < (i + 1) * PRODUCT_DUR;
          return (
            <div
              key={i}
              style={{
                width: active ? 26 : 9,
                height: 9,
                borderRadius: 5,
                background: active ? GOLD : `${WHITE}40`,
                transition: 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Act 3: Info card ─────────────────────────────────────────────────────────

function InfoCard({ width, height }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - INFO_START;

  const actOpacity = interpolate(
    frame,
    [INFO_START, INFO_START + CROSS, TOTAL - 18, TOTAL],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (local < -CROSS) return null;

  const logoScale = spring({ frame: local - 4, fps, from: 0.6, to: 1, config: { damping: 12, stiffness: 150, mass: 0.6 } });
  const kickerOpacity = interpolate(local, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const lineWidth = spring({ frame: local - 14, fps, from: 0, to: 140, config: { damping: 14, stiffness: 70, mass: 1 } });

  const colLeftX = spring({ frame: local - 24, fps, from: -40, to: 0, config: { damping: 14, stiffness: 100, mass: 0.6 } });
  const colLeftO = interpolate(local, [24, 38], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const colRightX = spring({ frame: local - 30, fps, from: 40, to: 0, config: { damping: 14, stiffness: 100, mass: 0.6 } });
  const colRightO = interpolate(local, [30, 44], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const footerOpacity = interpolate(local, [56, 70], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: actOpacity, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 84, height: 84, marginBottom: 14, borderRadius: '50%', overflow: 'hidden', transform: `scale(${logoScale})` }}>
        <Img src={staticFile('newgreek-bakery/logo.png')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div
        style={{
          opacity: kickerOpacity,
          fontFamily: "'Georgia', serif",
          fontSize: 22,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: `${GOLD}CC`,
        }}
      >
        Find us
      </div>
      <div style={{ width: lineWidth, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, margin: '14px 0 36px' }} />

      <div style={{ display: 'flex', gap: 90, alignItems: 'flex-start' }}>
        <div style={{ opacity: colLeftO, transform: `translateX(${colLeftX}px)`, display: 'flex', gap: 16, maxWidth: 480 }}>
          <div style={{ paddingTop: 4, flex: '0 0 auto' }}><PinIcon size={30} /></div>
          <div style={{ fontFamily: "'Georgia', serif", fontSize: 27, color: WHITE, lineHeight: 1.35 }}>
            {ADDRESS}
          </div>
        </div>

        <div style={{ opacity: colRightO, transform: `translateX(${colRightX}px)` }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
            <div style={{ paddingTop: 4, flex: '0 0 auto' }}><ClockIcon size={30} /></div>
            <div style={{ fontFamily: "'Georgia', serif", fontSize: 27, color: WHITE, lineHeight: 1.5 }}>
              <div>Mon&nbsp;–&nbsp;Sat&nbsp;&nbsp;7:00&nbsp;–&nbsp;18:00</div>
              <div>Sun&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;8:00&nbsp;–&nbsp;16:00</div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          opacity: footerOpacity,
          marginTop: 40,
          fontFamily: "'Georgia', serif",
          fontSize: 22,
          fontStyle: 'italic',
          color: `${GOLD}CC`,
          letterSpacing: '0.04em',
        }}
      >
        Proudly part of the New Greek family
      </div>
    </div>
  );
}

// ── Root composition ─────────────────────────────────────────────────────────

export function NewGreekBakeryPopupReminder() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const popIn = spring({ frame, fps, from: 0.86, to: 1, config: { damping: 13, stiffness: 160, mass: 0.8 } });
  const popInOpacity = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const popOutOpacity = interpolate(frame, [TOTAL - 16, TOTAL], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const containerOpacity = Math.min(popInOpacity, popOutOpacity);

  return (
    <div style={{ width, height, background: BLUE_DARK, overflow: 'hidden', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `scale(${popIn})`,
          opacity: containerOpacity,
        }}
      >
        <Backdrop width={width} height={height} />
        <Hook width={width} height={height} />
        <ProductShowcase width={width} height={height} />
        <InfoCard width={width} height={height} />
      </div>
    </div>
  );
}
