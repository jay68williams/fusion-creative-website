import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  interpolate, spring, staticFile, Video,
} from 'remotion';

const CORAL = '#E8553C';
const BG = '#f5f6fa';
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

// Soft glow
function Glow({ frame }) {
  const a = 0.06 + Math.sin(frame * 0.05) * 0.02;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `radial-gradient(ellipse at 50% 40%, rgba(232,85,60,${a}) 0%, transparent 65%)`,
    }} />
  );
}

// Phone frame with screen recording inside
function PhoneWithVideo({ frame, fps, startFrame, videoSrc }) {
  const enter = spr(frame - startFrame, fps, { stiffness: 120, damping: 18 });
  const bob = Math.sin(frame * 0.03) * 3;
  const phoneW = 320;
  const phoneH = 650;
  return (
    <div style={{
      opacity: enter,
      transform: `translateY(${interpolate(enter, [0, 1], [60, 0], C) + bob}px) scale(${interpolate(enter, [0, 1], [0.9, 1], C)})`,
    }}>
      <div style={{
        width: phoneW, height: phoneH,
        background: '#0A0A0A', borderRadius: 40, padding: 8,
        boxShadow: '0 30px 80px rgba(0,0,0,0.15), 0 0 0 1.5px #ccc',
        position: 'relative',
      }}>
        <div style={{
          width: '100%', height: '100%',
          background: '#fff', borderRadius: 32,
          overflow: 'hidden', position: 'relative',
        }}>
          {/* Dynamic island */}
          <div style={{
            position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
            width: 100, height: 28, background: '#000', borderRadius: 20, zIndex: 10,
          }} />
          {/* Video */}
          <Video
            src={staticFile(videoSrc)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            startFrom={0}
            volume={0}
          />
        </div>
      </div>
    </div>
  );
}

// Scene helper
function Scene({ frame, fps, inF, outF, children, style }) {
  if (frame < inF - 5 || frame > outF + 5) return null;
  const enter = spr(frame - inF, fps, { stiffness: 160, damping: 14 });
  const exit = interpolate(frame, [outF - 15, outF], [1, 0], C);
  const o = Math.min(enter, exit);
  const y = interpolate(enter, [0, 1], [30, 0], C);
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: 50, opacity: o, transform: `translateY(${y}px)`, ...style }}>
      {children}
    </AbsoluteFill>
  );
}

/*
  Timeline (30fps, ~25 seconds = 750 frames):
  0-150:    Phone slides up from bottom + hook text appears over it
  150-280:  Phone stays, text transitions to "See the dish before you order"
  280-410:  "What is AR Menu?" explanation
  410-530:  How it works (3 steps)
  530-650:  Benefits
  650-750:  CTA - pricing + contact
*/

export function ARMenuAd() {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FNT }}>
      <Grid />
      <Glow frame={frame} />

      {/* ── SCENE 1: Phone slides up + hook text (0-150) ── */}
      {frame < 160 && (() => {
        // Phone slides up from below the screen
        const phoneEnter = spr(frame - 0, fps, { stiffness: 80, damping: 16, mass: 1.2 });
        const phoneY = interpolate(phoneEnter, [0, 1], [height + 100, height * 0.22], C);
        const phoneO = interpolate(frame, [0, 15], [0, 1], C);
        const exit = interpolate(frame, [135, 150], [1, 0], C);

        // Text appears after phone is halfway up
        const textEnter = spr(frame - 25, fps, { stiffness: 140, damping: 14 });
        const textY = interpolate(textEnter, [0, 1], [40, 0], C);

        return (
          <AbsoluteFill style={{ opacity: exit }}>
            {/* Phone behind */}
            <div style={{
              position: 'absolute', left: '50%', top: phoneY,
              transform: 'translateX(-50%)',
              opacity: phoneO,
            }}>
              <PhoneWithVideo frame={frame} fps={fps} startFrame={0} videoSrc="ar-hero.mp4" />
            </div>

            {/* Text overlay on top */}
            <div style={{
              position: 'absolute', top: 80, left: 0, right: 0,
              textAlign: 'center', padding: '0 50px',
              opacity: textEnter, transform: `translateY(${textY}px)`,
            }}>
              <div style={{
                fontSize: 24, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
                color: CORAL, marginBottom: 20,
              }}>
                Restaurant Owners
              </div>
              <div style={{
                fontSize: 44, fontWeight: 800, color: TEXT, lineHeight: 1.15, letterSpacing: -1,
              }}>
                What if your{'\n'}customers could{'\n'}
                <span style={{ color: CORAL }}>see the food</span>{'\n'}
                before they order?
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ── SCENE 2: Phone centered + "Introducing AR Menus" (150-280) ── */}
      {frame >= 145 && frame < 285 && (() => {
        const enter = spr(frame - 150, fps, { stiffness: 160, damping: 14 });
        const exit = interpolate(frame, [265, 280], [1, 0], C);
        const o = Math.min(enter, exit);
        const bob = Math.sin(frame * 0.03) * 3;
        return (
          <AbsoluteFill style={{
            justifyContent: 'center', alignItems: 'center',
            opacity: o, flexDirection: 'column', gap: 20,
          }}>
            <div style={{
              fontSize: 16, fontWeight: 600, color: CORAL,
              letterSpacing: 2, textTransform: 'uppercase',
              opacity: spr(frame - 160, fps),
            }}>
              Live AR Demo
            </div>
            <div style={{ transform: `translateY(${bob}px)` }}>
              <PhoneWithVideo frame={frame} fps={fps} startFrame={150} videoSrc="ar-hero.mp4" />
            </div>
            <div style={{
              fontSize: 14, color: TEXT_MUTED, marginTop: 8,
              opacity: spr(frame - 175, fps),
            }}>
              Point your phone. See the dish. Order with confidence.
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ── SCENE 3: What is it (280-410) ── */}
      <Scene frame={frame} fps={fps} inF={280} outF={410}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 18, fontWeight: 600, color: CORAL,
            letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20,
          }}>
            What Is It
          </div>
          <div style={{
            fontSize: 38, fontWeight: 800, color: TEXT, lineHeight: 1.25, marginBottom: 28,
          }}>
            A 3D menu that{'\n'}sits on the table
          </div>
          <div style={{
            fontSize: 17, color: TEXT_SEC, lineHeight: 1.7, maxWidth: 500,
          }}>
            Customers scan a QR code on your menu and see photorealistic 3D models of your dishes right on their table. No app download needed. Works on any phone.
          </div>
        </div>
      </Scene>

      {/* ── SCENE 4: How it works (410-530) ── */}
      {frame >= 405 && frame < 535 && (() => {
        const enter = spr(frame - 410, fps, { stiffness: 160, damping: 14 });
        const exit = interpolate(frame, [515, 530], [1, 0], C);
        const o = Math.min(enter, exit);
        const steps = [
          { num: '01', title: 'We photograph your dishes', desc: 'Professional multi-angle shots of your menu items' },
          { num: '02', title: 'We build the 3D models', desc: 'Photorealistic models generated from real photos' },
          { num: '03', title: 'Customers scan and see', desc: 'QR code on the menu opens AR on any phone' },
        ];
        return (
          <AbsoluteFill style={{
            justifyContent: 'center', alignItems: 'center', padding: 50,
            opacity: o, transform: `translateY(${interpolate(enter, [0, 1], [30, 0], C)}px)`,
          }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                fontSize: 16, fontWeight: 600, color: CORAL,
                letterSpacing: 2, textTransform: 'uppercase', marginBottom: 30,
              }}>
                How It Works
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {steps.map((step, i) => {
                  const cardEnter = spr(frame - (425 + i * 18), fps, { stiffness: 140, damping: 16 });
                  return (
                    <div key={i} style={{
                      background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)',
                      borderRadius: 16, padding: '20px 24px', textAlign: 'left',
                      opacity: cardEnter,
                      transform: `translateX(${interpolate(cardEnter, [0, 1], [-30, 0], C)}px)`,
                      display: 'flex', gap: 16, alignItems: 'center',
                    }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, background: CORAL,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0,
                      }}>{step.num}</div>
                      <div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: TEXT, marginBottom: 2 }}>{step.title}</div>
                        <div style={{ fontSize: 13, color: TEXT_MUTED }}>{step.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ── SCENE 5: Benefits (530-650) ── */}
      {frame >= 525 && frame < 655 && (() => {
        const enter = spr(frame - 530, fps, { stiffness: 160, damping: 14 });
        const exit = interpolate(frame, [635, 650], [1, 0], C);
        const o = Math.min(enter, exit);
        const benefits = [
          { icon: '&#x2B06;', text: 'Increase average order value by 15-30%' },
          { icon: '&#x1F4F1;', text: 'No app download required' },
          { icon: '&#x2728;', text: 'Wow factor that gets shared on social' },
          { icon: '&#x1F4B0;', text: 'Reduce food waste from wrong orders' },
        ];
        return (
          <AbsoluteFill style={{
            justifyContent: 'center', alignItems: 'center', padding: 50,
            opacity: o, transform: `translateY(${interpolate(enter, [0, 1], [30, 0], C)}px)`,
          }}>
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{
                fontSize: 16, fontWeight: 600, color: CORAL,
                letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16,
              }}>
                Why It Works
              </div>
              <div style={{
                fontSize: 32, fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: 28,
              }}>
                The future of{'\n'}restaurant menus
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {benefits.map((b, i) => {
                  const bEnter = spr(frame - (545 + i * 12), fps, { stiffness: 140, damping: 16 });
                  return (
                    <div key={i} style={{
                      background: 'rgba(232,85,60,0.06)', border: '1px solid rgba(232,85,60,0.12)',
                      borderRadius: 14, padding: '16px 22px',
                      opacity: bEnter, transform: `translateY(${interpolate(bEnter, [0, 1], [15, 0], C)}px)`,
                      display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                    }}>
                      <div style={{ fontSize: 24 }} dangerouslySetInnerHTML={{ __html: b.icon }} />
                      <div style={{ fontSize: 17, fontWeight: 600, color: TEXT }}>{b.text}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AbsoluteFill>
        );
      })()}

      {/* ── SCENE 6: CTA (650-750) ── */}
      {frame >= 645 && (() => {
        const enter = spr(frame - 650, fps, { stiffness: 160, damping: 14 });
        const pulse = Math.sin(frame * 0.08) * 0.15 + 1;
        return (
          <AbsoluteFill style={{
            justifyContent: 'center', alignItems: 'center', padding: 50,
            opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [30, 0], C)}px)`,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 18, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
                color: CORAL, marginBottom: 20,
              }}>
                Fusion Creative
              </div>
              <div style={{
                fontSize: 38, fontWeight: 800, color: TEXT, lineHeight: 1.2, marginBottom: 16,
              }}>
                Be the first{'\n'}restaurant in your{'\n'}city with AR menus
              </div>
              <div style={{
                fontSize: 16, color: TEXT_SEC, marginBottom: 32, lineHeight: 1.5,
              }}>
                Setup from just 10 dishes.{'\n'}Works on any phone. No app needed.
              </div>
              <div style={{
                background: CORAL, borderRadius: 999,
                padding: '18px 44px', display: 'inline-block',
                transform: `scale(${pulse})`,
              }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>
                  Get Started
                </div>
              </div>
              <div style={{ fontSize: 15, color: TEXT_MUTED, marginTop: 16 }}>
                fusioncreative.uk/ar-menu
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
