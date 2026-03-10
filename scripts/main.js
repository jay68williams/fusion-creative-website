/* ===================================
   FUSION CREATIVE — JAVASCRIPT
   Premium Glassmorphism Interactions
   =================================== */

'use strict';

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;
let navbarScrolled = false;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  // Hide/show navbar on scroll direction
  if (currentScroll > lastScroll && currentScroll > 150) {
    navbar.classList.add('hidden');
  } else {
    navbar.classList.remove('hidden');
  }

  // Add glass backdrop when scrolled
  if (currentScroll > 20 && !navbarScrolled) {
    navbar.classList.add('scrolled');
    navbarScrolled = true;
  } else if (currentScroll <= 20 && navbarScrolled) {
    navbar.classList.remove('scrolled');
    navbarScrolled = false;
  }

  lastScroll = currentScroll;
}, { passive: true });

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    document.querySelector('.nav-links').classList.toggle('mobile-open');
  });
}

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 100;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      document.querySelector('.nav-links')?.classList.remove('mobile-open');
    }
  });
});

// ===== INTERSECTION OBSERVER — PREMIUM SCROLL REVEAL =====
const revealOptions = { threshold: 0.1, rootMargin: '0px 0px -60px 0px' };

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => {
        el.classList.add('in-view');
      }, delay);
      revealObserver.unobserve(el);
    }
  });
}, revealOptions);

// Observe elements
document.querySelectorAll('.service-card, .testimonial-card, .attention-card, .case-study-card').forEach(el => revealObserver.observe(el));

// ===== 3D HOVER TILT EFFECT (SERVICE CARDS) =====
const cards = document.querySelectorAll('.service-card, .testimonial-card');

cards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.
    
    // Calculate rotation (max 10 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });

  card.addEventListener('mouseleave', () => {
    // Reset via class transition
    card.style.transform = '';
  });
});

// ===== ANIMATED STAT COUNTERS =====
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2500;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Custom cubic bezier easing for premium feel
    const eased = 1 - Math.pow(1 - progress, 4); 
    const current = target * eased;

    if (isDecimal) {
      el.textContent = prefix + current.toFixed(1) + suffix;
    } else {
      el.textContent = prefix + Math.round(current) + suffix;
    }

    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObserver.observe(el));

// Count-up for small case-study numbers
function animateSmallCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 2000;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    const current = Math.round(target * eased);
    
    if (current >= 1000) {
      el.textContent = (current / 1000).toFixed(1) + 'K';
    } else {
      el.textContent = current;
    }
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const smallCounterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateSmallCounter(entry.target);
      smallCounterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.count-up').forEach(el => smallCounterObserver.observe(el));

// ===== ATTENTION CARDS STAGGERED REVEAL =====
const attentionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.attention-card').forEach((card, i) => {
        const delay = parseInt(card.dataset.delay || 0);
        setTimeout(() => card.classList.add('in-view'), delay);
      });
      attentionObserver.disconnect();
    }
  });
}, { threshold: 0.2 });

const attentionSection = document.querySelector('.attention-visual');
if (attentionSection) attentionObserver.observe(attentionSection);

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Button push animation
    submitBtn.style.transform = 'scale(0.96)';
    setTimeout(() => submitBtn.style.transform = '', 150);

    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;

    setTimeout(() => {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
      contactForm.reset();
      
      formSuccess.style.opacity = '0';
      formSuccess.style.display = 'block';
      setTimeout(() => formSuccess.style.opacity = '1', 50);

      setTimeout(() => {
        formSuccess.style.opacity = '0';
        setTimeout(() => formSuccess.style.display = 'none', 300);
      }, 5000);
    }, 1500);
  });
}

// ===== MOBILE NAV STYLES =====
const mobileNavStyle = document.createElement('style');
mobileNavStyle.textContent = `
  @media (max-width: 768px) {
    .nav-links.mobile-open {
      display: flex !important;
      position: fixed;
      top: 80px;
      left: 0;
      right: 0;
      background: rgba(255,255,255,0.92);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      flex-direction: column;
      padding: 24px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 16px 48px rgba(15,23,42,0.1);
      gap: 8px;
      z-index: 999;
    }
    .nav-links.mobile-open a { padding: 16px; font-size: 16px; border-radius: 16px; font-weight: 600; }
  }
`;
document.head.appendChild(mobileNavStyle);

// ===== SPLINE / HERO PARALLAX =====
const splineWrapper = document.getElementById('splineWrapper');
const heroContent = document.querySelector('.hero-content');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroHeight = window.innerHeight;
  
  if (scrollY < heroHeight) {
    const progress = scrollY / heroHeight;
    // Pushes the Spline model down slightly slower than the scroll creating massive depth
    if (splineWrapper) {
      splineWrapper.style.transform = `scale(1.4) translate(5%, ${progress * -80}px)`;
      splineWrapper.style.opacity = 1 - progress * 0.5;
    }
    // Fade out text faster
    if (heroContent) {
      heroContent.style.opacity = 1 - progress * 1.5;
      heroContent.style.transform = `translateY(${progress * 60}px)`;
    }
  }
}, { passive: true });

console.log('%c Fusion Creative 🚀 (Premium V2)', 'color: #6366f1; font-size: 18px; font-weight: 800;');
