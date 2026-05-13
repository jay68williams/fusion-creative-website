import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from 'remotion';

const CORAL = '#E8553C';
const BG = '#f5f6fa';
const SURFACE = '#ffffff';
const TEXT = '#1a1d23';
const TEXT_SEC = '#4a4f5c';
const TEXT_MUTED = '#7c8090';
const FNT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter',system-ui,sans-serif";
const C = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

const spr = (f, fps, cfg = {}) =>
  Math.min(1, Math.max(0, spring({
    frame: Math.max(0, f),
    fps,
    config: { stiffness: 200, damping: 15, mass: 1, ...cfg },
  })));

// Animated counter
function Counter({ value, suffix = '', frame, startFrame, fps }) {
  const progress = spr(frame - startFrame, fps, { stiffness: 80, damping: 20 });
  const num = Math.round(value * progress);
  const formatted = num >= 1000000
    ? (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
    : num >= 1000
      ? (num / 1000).toFixed(num >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K'
      : num.toLocaleString();
  return <>{formatted}{suffix}</>;
}

// Breathing glow
function Glow({ frame }) {
  const a = 0.08 + Math.sin(frame * 0.05) * 0.03;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse at 50% 40%, rgba(232,85,60,${a}) 0%, transparent 65%)`,
    }} />
  );
}

// Subtle grid
function Grid() {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: `
        linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '30px 30px',
    }} />
  );
}

// Coral accent line
function AccentLine({ frame, startFrame, fps, y = 0 }) {
  const w = interpolate(spr(frame - startFrame, fps, { stiffness: 120, damping: 18 }), [0, 1], [0, 100], C);
  return (
    <div style={{
      position: 'absolute', left: '50%', top: y, transform: 'translateX(-50%)',
      width: `${w}px`, height: 3, background: CORAL, borderRadius: 2,
    }} />
  );
}

/*
  Timeline (30fps, ~20 seconds = 600 frames):
  0-90:    Hook - "Restaurant owners..."
  90-180:  "We made one restaurant go viral"
  180-300: Stats reveal (views, interactions, followers, reach)
  300-420: "Zero ad spend. Zero head start."
  420-510: "We do this for hospitality businesses"
  510-600: CTA - Fusion Creative + contact
*/

export function NewGreekCaseStudyAd() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Scene visibility helper
  const scene = (inF, outF) => {
    const enter = spr(frame - inF, fps, { stiffness: 160, damping: 14 });
    const exit = interpolate(frame, [outF - 15, outF], [1, 0], C);
    return { opacity: Math.min(enter, exit), y: interpolate(enter, [0, 1], [30, 0], C) };
  };

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FNT }}>
      <Grid />
      <Glow frame={frame} />

      {/* ── SCENE 1: Hook (0-90) ── */}
      {frame < 95 && (() => {
        const s = scene(0, 90);
        return (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60, opacity: s.opacity, transform: `translateY(${s.y}px)` }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 28, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
                color: CORAL, marginBottom: 30,
              }}>
                Restaurant Owners
              </div>
              <div style={{
                fontSize: 52, fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: -1,
              }}>
                Is your restaurant{'\n'}getting the attention{'\n'}it deserves?
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ── SCENE 2: Intro (90-180) ── */}
      {frame >= 85 && frame < 185 && (() => {
        const s = scene(90, 180);
        return (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60, opacity: s.opacity, transform: `translateY(${s.y}px)` }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 22, fontWeight: 500, color: TEXT_MUTED, marginBottom: 20, letterSpacing: 1,
              }}>
                CASE STUDY
              </div>
              <div style={{
                fontSize: 46, fontWeight: 800, color: TEXT, lineHeight: 1.2, letterSpacing: -0.5,
              }}>
                How we made{'\n'}New Greek the{'\n'}
                <span style={{ color: CORAL }}>most viral restaurant</span>{'\n'}
                in Newcastle
              </div>
              <AccentLine frame={frame} startFrame={105} fps={fps} y={height * 0.72} />
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ── SCENE 3: Stats (180-300) ── */}
      {frame >= 175 && frame < 305 && (() => {
        const s = scene(180, 300);
        const stats = [
          { label: 'Views in 30 Days', value: 56200000, suffix: '+', delay: 0, color: CORAL },
          { label: 'Interactions', value: 824600, suffix: '+', delay: 15, color: '#ff7a64' },
          { label: 'New Followers', value: 6200, suffix: '+', delay: 30, color: CORAL },
          { label: 'Accounts Reached', value: 32300000, suffix: '+', delay: 45, color: '#ff7a64' },
        ];
        return (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 50, opacity: s.opacity, transform: `translateY(${s.y}px)` }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: TEXT_MUTED, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 40 }}>
                The Results
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {stats.map((st, i) => {
                  const cardEnter = spr(frame - (190 + st.delay), fps, { stiffness: 140, damping: 16 });
                  return (
                    <div key={i} style={{
                      background: 'rgba(0,0,0,0.04)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 16, padding: '24px 32px',
                      opacity: cardEnter,
                      transform: `translateY(${interpolate(cardEnter, [0, 1], [20, 0], C)}px)`,
                    }}>
                      <div style={{ fontSize: 48, fontWeight: 800, color: st.color, letterSpacing: -1 }}>
                        <Counter value={st.value} suffix={st.suffix} frame={frame} startFrame={190 + st.delay} fps={fps} />
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 500, color: TEXT_MUTED, marginTop: 4, letterSpacing: 1 }}>
                        {st.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ── SCENE 4: Zero ad spend (300-420) ── */}
      {frame >= 295 && frame < 425 && (() => {
        const s = scene(300, 420);
        return (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60, opacity: s.opacity, transform: `translateY(${s.y}px)` }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 64, fontWeight: 800, color: CORAL, lineHeight: 1.1, letterSpacing: -2, marginBottom: 30,
              }}>
                62.8M views{'\n'}on a single reel
              </div>
              <div style={{
                fontSize: 28, fontWeight: 600, color: TEXT_SEC, lineHeight: 1.5,
              }}>
                Zero ad spend.{'\n'}Zero head start.{'\n'}Just great content.
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ── SCENE 5: What we do (420-510) ── */}
      {frame >= 415 && frame < 515 && (() => {
        const s = scene(420, 510);
        const items = ['Short-Form Video', 'Social Media Management', 'TikTok + Instagram Reels', 'Websites + Branding'];
        return (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60, opacity: s.opacity, transform: `translateY(${s.y}px)` }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: CORAL, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>
                What We Do
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, color: TEXT, lineHeight: 1.3, marginBottom: 40 }}>
                We make hospitality{'\n'}businesses go viral
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map((item, i) => {
                  const itemEnter = spr(frame - (435 + i * 10), fps, { stiffness: 160, damping: 16 });
                  return (
                    <div key={i} style={{
                      background: 'rgba(232,85,60,0.1)',
                      border: '1px solid rgba(232,85,60,0.2)',
                      borderRadius: 12, padding: '14px 24px',
                      fontSize: 20, fontWeight: 600, color: TEXT_SEC,
                      opacity: itemEnter,
                      transform: `translateX(${interpolate(itemEnter, [0, 1], [-30, 0], C)}px)`,
                    }}>
                      {item}
                    </div>
                  );
                })}
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ── SCENE 6: CTA (510-600) ── */}
      {frame >= 505 && (() => {
        const s = scene(510, 650);
        const pulse = Math.sin(frame * 0.08) * 0.15 + 1;
        return (
          <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 60, opacity: s.opacity, transform: `translateY(${s.y}px)` }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 20, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
                color: CORAL, marginBottom: 24,
              }}>
                Fusion Creative
              </div>
              <div style={{
                fontSize: 42, fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: 40,
              }}>
                Ready to become{'\n'}Newcastle's next{'\n'}viral restaurant?
              </div>
              <div style={{
                background: CORAL, borderRadius: 999,
                padding: '20px 48px', display: 'inline-block',
                transform: `scale(${pulse})`,
              }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff', letterSpacing: 0.5 }}>
                  Get Your Free Audit
                </div>
              </div>
              <div style={{
                fontSize: 16, fontWeight: 500, color: TEXT_MUTED,
                marginTop: 20,
              }}>
                fusioncreative.uk
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ── Persistent corner badge ── */}
      {frame > 30 && (
        <div style={{
          position: 'absolute', top: 40, left: 40,
          display: 'flex', alignItems: 'center', gap: 8,
          opacity: interpolate(frame, [30, 45], [0, 0.6], C),
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: CORAL }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Fusion Creative
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}
