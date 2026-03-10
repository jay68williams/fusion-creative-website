/* ===================================
   FUSION CREATIVE — JAVASCRIPT
   Scroll animations, counters, navbar,
   form handling, attention cards
   =================================== */

'use strict';

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
let lastScroll = 0;
let navbarScrolled = false;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;

  // Hide/show navbar on scroll direction
  if (currentScroll > lastScroll && currentScroll > 100) {
    navbar.classList.add('hidden');
  } else {
    navbar.classList.remove('hidden');
  }

  // Add shadow when scrolled
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
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      // Close mobile nav if open
      document.querySelector('.nav-links')?.classList.remove('mobile-open');
    }
  });
});

// ===== INTERSECTION OBSERVER — SCROLL REVEAL =====
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
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

// Observe all animated elements
document.querySelectorAll(
  '.service-card, .testimonial-card, .attention-card, .case-study-card, .guarantee-card'
).forEach(el => revealObserver.observe(el));

// ===== ANIMATED STAT COUNTERS =====
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 2000;
  const start = performance.now();
  const isDecimal = target % 1 !== 0;

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out expo
    const eased = 1 - Math.pow(2, -10 * progress);
    const current = target * eased;

    if (isDecimal) {
      el.textContent = prefix + current.toFixed(1) + suffix;
    } else if (target >= 1000) {
      // Format with K notation
      if (target >= 1000000) {
        el.textContent = prefix + (current / 1000000).toFixed(1) + suffix;
      } else if (target >= 1000) {
        el.textContent = prefix + Math.round(current / 1000) + suffix;
      } else {
        el.textContent = prefix + Math.round(current) + suffix;
      }
    } else {
      el.textContent = prefix + Math.round(current) + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    }
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

// ===== COUNT-UP FOR CASE STUDY (smaller numbers) =====
function animateSmallCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(2, -10 * progress);
    const current = Math.round(target * eased);
    // Format
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
const attentionCards = document.querySelectorAll('.attention-card');
const attentionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      attentionCards.forEach((card, i) => {
        const delay = parseInt(card.dataset.delay || 0);
        setTimeout(() => card.classList.add('in-view'), delay);
      });
      attentionObserver.disconnect();
    }
  });
}, { threshold: 0.1 });

const attentionSection = document.querySelector('.attention-visual');
if (attentionSection) attentionObserver.observe(attentionSection);

// ===== SERVICE CARDS STAGGER =====
document.querySelectorAll('.service-card').forEach((card, i) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => card.classList.add('in-view'), i * 100);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(card);
});

// ===== TESTIMONIAL CARDS STAGGER =====
document.querySelectorAll('.testimonial-card').forEach((card, i) => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => card.classList.add('in-view'), i * 150);
        observer.unobserve(card);
      }
    });
  }, { threshold: 0.1 });
  observer.observe(card);
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formSuccess = document.getElementById('formSuccess');

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';
    submitBtn.disabled = true;

    // Simulate form submission (replace with real endpoint)
    setTimeout(() => {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
      contactForm.reset();
      formSuccess.style.display = 'block';

      // Hide success after 5 seconds
      setTimeout(() => {
        formSuccess.style.display = 'none';
      }, 5000);
    }, 1500);
  });
}

// ===== MOBILE NAV STYLES (injected) =====
const mobileNavStyle = document.createElement('style');
mobileNavStyle.textContent = `
  @media (max-width: 768px) {
    .nav-links.mobile-open {
      display: flex !important;
      position: fixed;
      top: 72px;
      left: 0;
      right: 0;
      background: rgba(255,255,255,0.97);
      backdrop-filter: blur(20px);
      flex-direction: column;
      padding: 16px 24px 24px;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      gap: 4px;
      z-index: 999;
    }
    .nav-links.mobile-open a {
      padding: 14px 16px;
      font-size: 16px;
      border-radius: 12px;
    }
  }
`;
document.head.appendChild(mobileNavStyle);

// ===== SPLINE SCROLL PARALLAX =====
// Subtle parallax on the spline wrapper as user scrolls in hero
const splineWrapper = document.getElementById('splineWrapper');
if (splineWrapper) {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroHeight = document.getElementById('hero')?.offsetHeight || window.innerHeight;
    if (scrollY < heroHeight) {
      const progress = scrollY / heroHeight;
      // Subtle float up effect as user scrolls
      splineWrapper.style.transform = `translateY(${progress * -40}px)`;
      splineWrapper.style.opacity = 1 - progress * 0.3;
    }
  }, { passive: true });
}

// ===== SUBTLE MOUSE PARALLAX ON HERO =====
const heroContent = document.querySelector('.hero-content');
const heroBg = document.querySelector('.hero-bg-gradient');

if (heroContent && heroBg) {
  document.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX / innerWidth - 0.5) * 20;
    const y = (e.clientY / innerHeight - 0.5) * 12;

    heroContent.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    heroBg.style.backgroundPosition = `${50 + x * 0.15}% ${50 + y * 0.15}%`;
  });
}

// ===== LOG =====
console.log('%c Fusion Creative 🚀', 'color: #6366f1; font-size: 18px; font-weight: 800;');
console.log('%c fusioncreative.uk', 'color: #8b5cf6; font-size: 12px;');
