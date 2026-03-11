/* ===================================
   FUSION CREATIVE — BRUTALIST SIGNAL
   GSAP Animations & Logic
   =================================== */

'use strict';

// Ensure GSAP and ScrollTrigger are loaded
gsap.registerPlugin(ScrollTrigger);

// ===== NAVBAR MORPHING =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// Mobile Nav Toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    // Basic toggle logic for mobile (will need CSS addition for mobile menu if needed, 
    // but sticking to prompt's simplicity for now)
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '100%';
    navLinks.style.left = '0';
    navLinks.style.width = '100%';
    navLinks.style.background = 'var(--paper)';
    navLinks.style.padding = '1rem';
    navLinks.style.borderBottom = '1px solid var(--border)';
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Create a GSAP context for the whole page
let ctx = gsap.context(() => {

  // ===== B. HERO ENTRANCE =====
  const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  
  heroTimeline
    .to(".eyebrow-stagger", { y: 0, opacity: 1, duration: 0.8 }, 0.3)
    .to(".hero-line1.stagger", { y: 0, opacity: 1, duration: 0.8 }, 0.45)
    .to(".hero-line2.stagger", { y: 0, opacity: 1, duration: 0.8 }, 0.6)
    .to(".hero-sub.stagger", { y: 0, opacity: 1, duration: 0.8 }, 0.85)
    .to(".hero-ctas.stagger", { y: 0, opacity: 1, duration: 0.8 }, 1.0);


  // ===== SECTION ENTRANCES (GLOBAL) =====
  // Applies to anything with .reveal-card, .pr-reveal, etc.
  
  // Cards / Grid items
  gsap.utils.toArray('.reveal-card').forEach(card => {
    gsap.fromTo(card, 
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 85%"
        }
      }
    );
  });

  // Protocol steps stagger
  gsap.utils.toArray('.proto-row').forEach((row, i) => {
    gsap.fromTo(row,
      { x: -30, opacity: 0 },
      {
        x: 0, opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".protocol-rows", // trigger on wrapper
          start: "top 75%",
        },
        delay: i * 0.12
      }
    );
  });

  // Philosophy text
  const philTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".philosophy-section",
      start: "top 60%"
    }
  });
  philTimeline
    .to(".phil-small.ph-reveal", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
    .to(".phil-big.ph-reveal", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "+=0.3");


  // Guarentee Bars
  const guaranteeTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".guarantee-section",
      start: "top 75%"
    }
  });
  
  // Set initial height to 0
  gsap.set(".bar-before", { height: 0 });
  gsap.set(".bar-after", { height: 0 });
  
  guaranteeTimeline
    .to(".bar-before", { height: 90, duration: 0.8, ease: "power3.out" })
    .to(".bar-after", { height: 170, duration: 0.8, ease: "power3.out" }, "-=0.6");


  // ===== CHART DRAW ANIMATION =====
  const chartPath = document.querySelector('.chart-line');
  const chartFill = document.querySelector('.chart-fill');
  
  if (chartPath && chartFill) {
    const pathLength = chartPath.getTotalLength();
    
    // Set initial stroke dash setup
    gsap.set(chartPath, { strokeDasharray: pathLength, strokeDashoffset: pathLength });
    gsap.set(chartFill, { opacity: 0 });
    
    const chartTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".chart-card",
        start: "top 80%"
      }
    });

    chartTimeline
      .to(chartPath, { strokeDashoffset: 0, duration: 1.5, ease: "power3.out" })
      .to(chartFill, { opacity: 1, duration: 1.5, ease: "power3.out" }, "<");
  }

  // ===== NUMBER COUNT-UPS =====
  function setupCountUp(selector, delay = 0) {
    gsap.utils.toArray(selector).forEach(el => {
      const targetStr = el.getAttribute('data-target');
      const targetVal = parseFloat(targetStr);
      const isDecimal = targetStr.includes('.');
      const suffix = el.getAttribute('data-suffix') || '';

      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.fromTo(el, 
            { innerHTML: 0 }, 
            {
              innerHTML: targetVal,
              duration: 1.2,
              delay: delay,
              ease: "power2.out",
              snap: { innerHTML: isDecimal ? 0.1 : 1 },
              onUpdate: function() {
                // Ensure proper formatting (e.g. 1.3 or 19)
                let currentVal = this.targets()[0].innerHTML;
                let formatted = isDecimal ? Number(currentVal).toFixed(1) : Math.round(currentVal);
                el.innerHTML = formatted + suffix;
              }
            }
          );
        }
      });
    });
  }

  setupCountUp('.stat-value');
  setupCountUp('.val'); // win card
  setupCountUp('.big-stat-val');

});


// ===== INTERACTIVE FEATURES =====

// 1. Diagnostic Shuffler (Card 1)
const shuffleCards = document.querySelectorAll('.shuffle-card');
let scIndex = 0;

function runShuffler() {
  if (!shuffleCards.length) return;
  
  // States:
  // Front: z: 3, opacity: 1, y: 0, scale: 1
  // Middle: z: 2, opacity: 0.6, y: 12, scale: 0.96
  // Back: z: 1, opacity: 0.3, y: 24, scale: 0.92
  
  const states = [
    { zIndex: 3, opacity: 1, y: 0, scale: 1 },
    { zIndex: 2, opacity: 0.6, y: 12, scale: 0.96 },
    { zIndex: 1, opacity: 0.3, y: 24, scale: 0.92 }
  ];

  // Map cards to current states based on scIndex
  shuffleCards.forEach((card, i) => {
    // Determine which state this card should be in
    const stateIndex = (i - scIndex + states.length) % states.length;
    const targetState = states[stateIndex];
    
    // Animate to new state
    gsap.to(card, {
      ...targetState,
      duration: 0.6,
      ease: "back.out(1.5)" // Gives a nice slight spring-bounce
    });
  });

  // Increment index for next tick
  scIndex = (scIndex + 1) % states.length;
}
// Init immediately, then every 3s
runShuffler();
setInterval(runShuffler, 3000);


// 2. Real-Time Telemetry Typewriter (Card 2)
const typewriterEl = document.getElementById('typewriterText');
const phrases = [
  'Video spike detected: +636K views in 48h.',
  'New followers from viral post: +1,240.',
  'Profile visit to DM conversion: 3.2%.',
  'Posting at 6pm drives 2x reach.',
  'Hook test A/B: "Watch this" +38% CTR.',
  'Greek restaurant account growth: +890%.'
];
let phIndex = 0;

async function typePhrase() {
  if (!typewriterEl) return;
  const curPhrase = phrases[phIndex];
  typewriterEl.textContent = '';
  
  // Type characters one by one
  for (let i = 0; i < curPhrase.length; i++) {
    typewriterEl.textContent += curPhrase.charAt(i);
    await new Promise(r => setTimeout(r, 40));
  }
  
  // Wait 2.2s
  await new Promise(r => setTimeout(r, 2200));
  
  // Clear immediately
  typewriterEl.textContent = '';
  
  // Next phrase
  phIndex = (phIndex + 1) % phrases.length;
  typePhrase();
}
// Start typing loop
setTimeout(typePhrase, 1000);


// 3. Posting Protocol Scheduler (Card 3)
const cursorEl = document.getElementById('schedCursor');
const dayM = document.getElementById('day-m');
const dayW = document.getElementById('day-w');
const dayF = document.getElementById('day-f');
const schedBtn = document.getElementById('schedBtn');

async function runScheduler() {
  if (!cursorEl || !dayM) return;
  
  const moveCursorTo = (targetEl) => {
    const targetRect = targetEl.getBoundingClientRect();
    const parentRect = targetEl.closest('.demo-scheduler').getBoundingClientRect();
    // Local coords to parent
    const x = targetRect.left - parentRect.left + (targetRect.width / 2);
    const y = targetRect.top - parentRect.top + (targetRect.height / 2);
    
    return gsap.to(cursorEl, { x: x, y: y, duration: 0.5, ease: "power2.inOut" });
  };
  
  const clickTarget = (targetEl) => {
    targetEl.classList.add('saved'); // Add active styling
    return gsap.fromTo(targetEl, { scale: 0.95 }, { scale: 1, duration: 0.2 }); // Quick click bounce
  };

  // Reset to initial state
  [dayM, dayW, dayF, schedBtn].forEach(el => el.classList.remove('saved'));
  schedBtn.textContent = "Save Schedule";
  gsap.set(cursorEl, { x: 0, y: 0 }); // Initial pos

  // Wait 1s
  await new Promise(r => setTimeout(r, 1000));

  // sequence
  await moveCursorTo(dayM);
  await clickTarget(dayM);
  await new Promise(r => setTimeout(r, 400));

  await moveCursorTo(dayW);
  await clickTarget(dayW);
  await new Promise(r => setTimeout(r, 400));

  await moveCursorTo(dayF);
  await clickTarget(dayF);
  await new Promise(r => setTimeout(r, 400));

  await moveCursorTo(schedBtn);
  schedBtn.classList.add('saved');
  schedBtn.textContent = "✓ Schedule Saved";
  gsap.fromTo(schedBtn, { scale: 0.95 }, { scale: 1, duration: 0.2 });
  
  // Move cursor out of the way slightly
  gsap.to(cursorEl, { x: "+=20", y: "+=20", duration: 0.5 });
  
  // Wait 2s, then loop
  setTimeout(runScheduler, 2500);
}

// Start Scheduler loop
if(cursorEl) {
    runScheduler();
}

// ===== 4. HERO WORD CYCLER =====
const cyclerWords = document.querySelectorAll('.cycler-word');
let cyclerIndex = 0;

if (cyclerWords.length > 1) {
  setInterval(() => {
    const currentWord = cyclerWords[cyclerIndex];
    currentWord.classList.remove('active');
    currentWord.classList.add('out');
    
    // Clean up 'out' class after transition completes
    setTimeout(() => {
      currentWord.classList.remove('out');
    }, 600);
    
    cyclerIndex = (cyclerIndex + 1) % cyclerWords.length;
    const nextWord = cyclerWords[cyclerIndex];
    nextWord.classList.add('active');
  }, 2500); // 1.9s display + 0.6s transition
}

console.log("Brutalist Signal - Initialized");
