import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig,
  interpolate, spring, staticFile, Video, Img,
} from 'remotion';

const CORAL = '#E8553C';
const BG = '#f5f6fa';
const TEXT = '#1a1d23';
const TEXT_SEC = '#4a4f5c';
const TEXT_MUTED = '#7c8090';
const FNT = "-apple-system,BlinkMacSystemFont,'SF Pro Display','Inter',system-ui,sans-serif";

// Each slide is a separate composition rendered as a still at frame 30
// This component takes a `slide` prop (1-5) via inputProps

function PhoneFrame3D({ videoSrc, rotateY = -12, rotateX = 5, rotateZ = 2, scale = 1 }) {
  const phoneW = 380 * scale;
  const phoneH = 780 * scale;
  return (
    <div style={{
      transform: `perspective(1200px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg)`,
      transformStyle: 'preserve-3d',
    }}>
      <div style={{
        width: phoneW, height: phoneH,
        background: '#0A0A0A', borderRadius: 48 * scale, padding: 10 * scale,
        boxShadow: '0 40px 100px rgba(0,0,0,0.2), 0 0 0 1.5px #bbb',
        position: 'relative',
      }}>
        <div style={{
          width: '100%', height: '100%',
          background: '#fff', borderRadius: 38 * scale,
          overflow: 'hidden', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 12 * scale, left: '50%', transform: 'translateX(-50%)',
            width: 110 * scale, height: 30 * scale, background: '#000', borderRadius: 20 * scale, zIndex: 10,
          }} />
          <Video
            src={staticFile(videoSrc)}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            startFrom={60}
            volume={0}
          />
        </div>
      </div>
    </div>
  );
}

// ── SLIDE 1: Hook ──
function Slide1() {
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FNT, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      {/* Subtle coral glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 60%, rgba(232,85,60,0.08) 0%, transparent 60%)' }} />

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{
          fontSize: 28, fontWeight: 700, letterSpacing: 4, textTransform: 'uppercase',
          color: CORAL, marginBottom: 28,
        }}>
          Restaurant Owners
        </div>
        <div style={{
          fontSize: 72, fontWeight: 900, color: TEXT, lineHeight: 1.05, letterSpacing: -3,
        }}>
          What if your{'\n'}customers{'\n'}could <span style={{ color: CORAL }}>see{'\n'}the food</span>{'\n'}before they{'\n'}order?
        </div>
      </div>

      {/* Corner badge */}
      <div style={{
        position: 'absolute', bottom: 50, left: 0, right: 0, textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: CORAL }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT_MUTED, letterSpacing: 2, textTransform: 'uppercase' }}>
            Fusion Creative
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── SLIDE 2: Phone in 3D with AR demo ──
function Slide2() {
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FNT, justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, rgba(232,85,60,0.06) 0%, transparent 55%)' }} />

      {/* Title at top */}
      <div style={{
        position: 'absolute', top: 60, left: 0, right: 0, textAlign: 'center', padding: '0 40px',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: CORAL, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
          AR Menu
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: TEXT, lineHeight: 1.2 }}>
          3D food on{'\n'}their table
        </div>
      </div>

      {/* Phone in 3D space */}
      <div style={{ marginTop: 40 }}>
        <PhoneFrame3D videoSrc="ar-hero.mp4" rotateY={-15} rotateX={4} rotateZ={2} scale={0.95} />
      </div>

      {/* Bottom text */}
      <div style={{
        position: 'absolute', bottom: 60, left: 0, right: 0, textAlign: 'center',
      }}>
        <div style={{ fontSize: 15, color: TEXT_MUTED, fontWeight: 500 }}>
          No app download. Works on any phone.
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── SLIDE 3: How it works ──
function Slide3() {
  const steps = [
    { num: '01', title: 'We photograph your dishes', desc: 'Multi-angle professional shots' },
    { num: '02', title: 'We build 3D models', desc: 'Photorealistic, from real photos' },
    { num: '03', title: 'Customers scan and see', desc: 'QR code opens AR instantly' },
  ];
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FNT, justifyContent: 'center', padding: 50 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(232,85,60,0.06) 0%, transparent 55%)' }} />

      <div style={{ zIndex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: CORAL, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
          How It Works
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, color: TEXT, lineHeight: 1.15, marginBottom: 40 }}>
          Three steps.{'\n'}That is it.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: 20, padding: '24px 28px',
              display: 'flex', gap: 18, alignItems: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: CORAL,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>{step.num}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>{step.title}</div>
                <div style={{ fontSize: 14, color: TEXT_MUTED, marginTop: 2 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── SLIDE 4: Benefits ──
function Slide4() {
  const benefits = [
    { emoji: '\u2B06\uFE0F', text: 'Increase order value 15-30%' },
    { emoji: '\uD83D\uDCF1', text: 'No app download needed' },
    { emoji: '\u2728', text: 'Gets shared on social media' },
    { emoji: '\uD83C\uDF7D\uFE0F', text: 'Reduce wrong orders and waste' },
  ];
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FNT, justifyContent: 'center', padding: 50 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(232,85,60,0.06) 0%, transparent 55%)' }} />

      <div style={{ zIndex: 1 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: CORAL, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
          Why It Works
        </div>
        <div style={{ fontSize: 42, fontWeight: 800, color: TEXT, lineHeight: 1.15, marginBottom: 40 }}>
          The future of{'\n'}restaurant menus
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {benefits.map((b, i) => (
            <div key={i} style={{
              background: 'rgba(232,85,60,0.06)', border: '1px solid rgba(232,85,60,0.12)',
              borderRadius: 18, padding: '22px 26px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ fontSize: 28 }}>{b.emoji}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: TEXT }}>{b.text}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

// ── SLIDE 5: CTA ──
function Slide5() {
  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FNT, justifyContent: 'center', alignItems: 'center', padding: 50 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(232,85,60,0.1) 0%, transparent 55%)' }} />

      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{
          fontSize: 20, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase',
          color: CORAL, marginBottom: 24,
        }}>
          Fusion Creative
        </div>
        <div style={{
          fontSize: 52, fontWeight: 900, color: TEXT, lineHeight: 1.1, letterSpacing: -2, marginBottom: 24,
        }}>
          Be the first{'\n'}restaurant in{'\n'}your city with{'\n'}<span style={{ color: CORAL }}>AR menus</span>
        </div>
        <div style={{
          fontSize: 17, color: TEXT_SEC, marginBottom: 36, lineHeight: 1.5,
        }}>
          Setup from just 10 dishes.{'\n'}Works on any phone. No app needed.
        </div>
        <div style={{
          background: CORAL, borderRadius: 999,
          padding: '20px 52px', display: 'inline-block',
          boxShadow: '0 8px 30px rgba(232,85,60,0.3)',
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#ffffff' }}>
            Get Started
          </div>
        </div>
        <div style={{ fontSize: 15, color: TEXT_MUTED, marginTop: 18 }}>
          fusioncreative.uk/ar-menu
        </div>
      </div>
    </AbsoluteFill>
  );
}

// Main component - renders based on slide number
export function ARMenuCarousel() {
  // Default to slide 1, can be overridden via inputProps
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Use frame ranges to show different slides in preview
  // But for stills, we render each slide composition separately
  return <Slide1 />;
}

export function ARMenuCarouselSlide1() { return <Slide1 />; }
export function ARMenuCarouselSlide2() { return <Slide2 />; }
export function ARMenuCarouselSlide3() { return <Slide3 />; }
export function ARMenuCarouselSlide4() { return <Slide4 />; }
export function ARMenuCarouselSlide5() { return <Slide5 />; }
