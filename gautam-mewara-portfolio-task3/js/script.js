/* ============================================================
   script.js — Gautam Mewara Portfolio
   Created by Gautam Mewara
   ApexPlanet Task 2 — JavaScript Interactive Components
   ============================================================ */

/* ── Small helpers ──────────────────────────────────────────── */
function debounce(fn, wait) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── A. Mobile Nav: hamburger, animated open/close, auto-close ─ */
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

function closeMobileNav() {
  if (!navToggle || !navLinks) return;
  navToggle.classList.remove('open');
  navLinks.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
}

if (navToggle && navLinks) {
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-controls', 'primary-navigation');
  navLinks.id = navLinks.id || 'primary-navigation';

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Auto-close after a menu item is selected
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!navLinks.classList.contains('open')) return;
    if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
    closeMobileNav();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMobileNav();
      navToggle.focus();
    }
  });
}

/* ── B. Dark / Light Mode Toggle (persisted in localStorage) ── */
(function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }
  function applyTheme(theme) {
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('theme', theme); } catch (err) { /* storage unavailable */ }
    toggle.setAttribute('aria-pressed', String(theme === 'light'));
    toggle.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
  }

  // Reflect whatever the inline <head> script already applied (no flash)
  toggle.setAttribute('aria-pressed', String(currentTheme() === 'light'));

  toggle.addEventListener('click', () => {
    applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
  });
})();

/* ── Active Nav Link (existing behaviour, preserved) ──────────── */
(function setActiveLink() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── Intersection Observer for Fade-in (existing, preserved) ──── */
const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

/* ── Skill / Progress Bar Observer (existing, preserved) ───────── */
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.progress-fill').forEach(bar => {
        bar.style.width = (bar.getAttribute('data-pct') || '0') + '%';
      });
      entry.target.querySelectorAll('.skill-level-fill').forEach(bar => {
        bar.style.width = (bar.getAttribute('data-pct') || '0') + '%';
      });
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.hero-card-progress, .skills-grid, .skills-table-section').forEach(el => {
  barObserver.observe(el);
});

/* ── FAQ Accordion (existing, preserved) ───────────────────────── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(openItem => openItem.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── D. Back To Top Button ─────────────────────────────────────── */
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
}

/* ── E. Services Carousel (built from the real Services content) ─ */
(function initServicesCarousel() {
  const root = document.getElementById('services-carousel');
  const track = document.getElementById('services-track');
  if (!root || !track) return;

  const slides = Array.from(track.children);
  const prevBtn = root.querySelector('.carousel-prev');
  const nextBtn = root.querySelector('.carousel-next');
  const dotsWrap = document.getElementById('services-dots');
  let index = 0;
  let autoplayTimer = null;

  function perView() {
    const w = window.innerWidth;
    if (w <= 768) return 1;
    if (w <= 1024) return 2;
    return 3;
  }
  function maxIndex() { return Math.max(0, slides.length - perView()); }

  function render() {
    index = Math.min(index, maxIndex());
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = 24;
    track.style.transform = `translateX(-${index * (slideWidth + gap)}px)`;
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === maxIndex();
    buildDots();
  }

  function buildDots() {
    if (!dotsWrap) return;
    const total = maxIndex() + 1;
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot' + (i === index ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1} of ${total}`);
      dot.addEventListener('click', () => { index = i; render(); restartAutoplay(); });
      dotsWrap.appendChild(dot);
    }
  }

  function goNext() { index = index >= maxIndex() ? 0 : index + 1; render(); }
  function goPrev() { index = index <= 0 ? maxIndex() : index - 1; render(); }

  if (prevBtn) prevBtn.addEventListener('click', () => { goPrev(); restartAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goNext(); restartAutoplay(); });

  function startAutoplay() {
    if (prefersReducedMotion) return;
    stopAutoplay();
    autoplayTimer = setInterval(goNext, 5000);
  }
  function stopAutoplay() { clearInterval(autoplayTimer); }
  function restartAutoplay() { startAutoplay(); }

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);
  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopAutoplay() : startAutoplay();
  });

  // Basic swipe support
  let touchStartX = null;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 40) { delta < 0 ? goNext() : goPrev(); restartAutoplay(); }
    touchStartX = null;
  }, { passive: true });

  window.addEventListener('resize', debounce(render, 150));

  // Make each slide keyboard- and click-accessible, wired to the modal
  slides.forEach(card => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-haspopup', 'dialog');
    if (!card.querySelector('.service-card-cta')) {
      const cta = document.createElement('span');
      cta.className = 'service-card-cta';
      cta.textContent = 'View Details →';
      card.appendChild(cta);
    }
    card.addEventListener('click', () => openServiceModal(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openServiceModal(card); }
    });
  });

  root.classList.add('js-carousel');
  render();
  startAutoplay();
})();

/* ── F. Modal Popup — full service details ─────────────────────
   Extra description/feature copy below is taken verbatim from the
   longer write-ups already authored on services.html — nothing here
   is invented. Cards without a longer version just reuse their
   existing short description. */
const SERVICE_DETAILS = {
  'static-website': {
    full: 'Fast, lightweight static websites that load in milliseconds and run on any hosting platform — from GitHub Pages to shared hosting. No database, no server-side language, no unnecessary complexity.',
    features: ['Multi-page or single-page layout', 'Semantic, accessible HTML5 markup', 'Optimised for speed and SEO basics', 'Deployable to any static host']
  },
  'responsive-design': {
    full: 'Every website I build is fully responsive by design, not as an afterthought. Using CSS Grid and Flexbox with carefully crafted media queries for mobile, tablet, laptop, and desktop breakpoints.',
    features: ['Mobile-first methodology', 'Tested across multiple screen sizes', 'CSS Grid + Flexbox layouts', 'Touch-friendly navigation']
  },
  'portfolio-websites': {
    full: "Personal portfolio sites designed to make a strong first impression on recruiters and clients. I know what a portfolio needs because I'm building mine — showcase sections, project cards, contact forms, and a consistent identity.",
    features: ['Projects section with hover effects', 'Skills and timeline display', 'Downloadable resume integration', 'Contact form with validation']
  },
  'landing-pages': {
    full: "Single-page designs built around one clear goal — getting visitors to act. Whether it's signing up, contacting, or buying, every element of the page is arranged to lead the user toward that action.",
    features: ['Hero section with strong headline', 'Features / benefits sections', 'Call-to-action buttons throughout', 'Testimonials or social proof block']
  },
  'frontend-development': {
    full: 'Adding interactivity to existing designs using Vanilla JavaScript. Dropdowns, mobile menus, modals, image carousels, form validation, scroll animations — all without pulling in a framework.',
    features: ['Responsive hamburger navigation', 'Image sliders and galleries', 'Form validation with user feedback', 'Smooth scroll and reveal animations']
  },
  'website-maintenance': {
    full: 'Content updates, bug fixes, and minor feature additions to keep your existing website fresh and functional.',
    features: []
  }
};

let lastFocusedElement = null;
const serviceModal = document.getElementById('service-modal');

function openServiceModal(card) {
  if (!serviceModal) return;
  const id = card.dataset.serviceId;
  const details = SERVICE_DETAILS[id] || {};
  const icon = card.querySelector('.service-icon');
  const title = card.querySelector('h3');
  const desc = card.querySelector('p');

  const modalIcon = document.getElementById('service-modal-icon');
  const modalTitle = document.getElementById('service-modal-title');
  const modalDesc = document.getElementById('service-modal-desc');
  const modalFeatures = document.getElementById('service-modal-features');

  if (modalIcon) modalIcon.textContent = icon ? icon.textContent.trim() : '';
  if (modalTitle) modalTitle.textContent = title ? title.textContent.trim() : '';
  if (modalDesc) modalDesc.textContent = details.full || (desc ? desc.textContent.trim() : '');
  if (modalFeatures) {
    modalFeatures.innerHTML = '';
    (details.features || []).forEach(f => {
      const li = document.createElement('li');
      li.className = 'modal-feature';
      li.textContent = f;
      modalFeatures.appendChild(li);
    });
  }

  lastFocusedElement = document.activeElement;
  serviceModal.hidden = false;
  // allow the browser to paint hidden=false before adding the transition class
  requestAnimationFrame(() => serviceModal.classList.add('is-open'));
  document.body.classList.add('modal-open');
  document.addEventListener('keydown', onModalKeydown);
  const closeBtn = document.getElementById('service-modal-close');
  if (closeBtn) closeBtn.focus();
}

function closeServiceModal() {
  if (!serviceModal) return;
  serviceModal.classList.remove('is-open');
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', onModalKeydown);
  setTimeout(() => { serviceModal.hidden = true; }, 250);
  if (lastFocusedElement) lastFocusedElement.focus();
}

function onModalKeydown(e) {
  if (e.key === 'Escape') closeServiceModal();
}

if (serviceModal) {
  const closeBtn = document.getElementById('service-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeServiceModal);
  // Outside-click support: only close if the backdrop itself was clicked
  serviceModal.addEventListener('click', (e) => {
    if (e.target === serviceModal) closeServiceModal();
  });
}

/* ── H. Animated Counter Section ───────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.counter-number[data-target]');
  if (!counters.length) return;

  function animate(el) {
    const target = parseInt(el.dataset.target, 10) || 0;
    if (prefersReducedMotion) { el.textContent = String(target); return; }
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = String(target);
    }
    requestAnimationFrame(step);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

/* ── C. Smooth Scroll + Active Section Highlighting ─────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  });
});

(function initSectionSpy() {
  const dots = document.querySelectorAll('.section-nav-dot');
  if (!dots.length) return;
  const sections = Array.from(dots)
    .map(dot => document.getElementById(dot.dataset.section))
    .filter(Boolean);
  if (!sections.length) return;

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const dot = document.querySelector(`.section-nav-dot[data-section="${entry.target.id}"]`);
      if (!dot) return;
      if (entry.isIntersecting) {
        dots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => spy.observe(sec));
})();

/* ── Unified scroll handler: navbar shadow + back-to-top visibility ─ */
(function initScrollEffects() {
  const navbar = document.querySelector('.navbar');
  let ticking = false;

  function update() {
    if (navbar) {
      navbar.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,.4)' : '';
    }
    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 480);
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  });
  update();
})();

/* ── G. Contact Form: real-time validation ─────────────────────── */
(function initContactFormValidation() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const validators = {
    'full-name': (v) => {
      v = v.trim();
      if (!v) return 'Please enter your name.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      if (!/^[A-Za-z\s'.-]+$/.test(v)) return 'Name can only contain letters, spaces, apostrophes and hyphens.';
      return '';
    },
    'email': (v) => {
      v = v.trim();
      if (!v) return 'Please enter your email address.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email address.';
      return '';
    },
    'subject': (v) => {
      if (!v) return 'Please select a subject.';
      return '';
    },
    'message': (v) => {
      v = v.trim();
      if (!v) return 'Please enter a message.';
      if (v.length < 10) return 'Message should be at least 10 characters.';
      return '';
    }
  };

  function fieldGroup(field) { return field.closest('.form-group'); }

  function showResult(field, errorText) {
    const group = fieldGroup(field);
    if (!group) return errorText === '';
    const errorEl = group.querySelector('.form-error-msg');
    if (errorText) {
      group.classList.add('has-error');
      group.classList.remove('is-valid');
      if (errorEl) errorEl.textContent = errorText;
      field.setAttribute('aria-invalid', 'true');
    } else {
      group.classList.remove('has-error');
      if (field.value.trim()) group.classList.add('is-valid');
      field.removeAttribute('aria-invalid');
    }
    return errorText === '';
  }

  function validateField(field) {
    const validator = validators[field.name];
    if (!validator) return true;
    const errorText = validator(field.value);
    return showResult(field, errorText);
  }

  Object.keys(validators).forEach(name => {
    const field = form.elements[name];
    if (!field) return;
    field.addEventListener('blur', () => {
      field.dataset.touched = 'true';
      validateField(field);
    });
    field.addEventListener('input', () => {
      if (field.dataset.touched === 'true') validateField(field);
    });
    field.addEventListener('change', () => {
      field.dataset.touched = 'true';
      validateField(field);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let allValid = true;
    let firstInvalid = null;
    Object.keys(validators).forEach(name => {
      const field = form.elements[name];
      if (!field) return;
      field.dataset.touched = 'true';
      const ok = validateField(field);
      if (!ok) {
        allValid = false;
        if (!firstInvalid) firstInvalid = field;
      }
    });

    const agree = form.elements['agree'];
    if (agree && !agree.checked) {
      allValid = false;
      const group = fieldGroup(agree);
      if (group) {
        const errorEl = group.querySelector('.form-error-msg');
        if (errorEl) { errorEl.textContent = 'Please confirm before sending.'; group.classList.add('has-error'); }
      }
      if (!firstInvalid) firstInvalid = agree;
    }

    if (!allValid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const btn = form.querySelector('.btn-primary');
    if (!btn) { form.reset(); return; }
    const original = btn.textContent;

    btn.textContent = '✓ Message Sent!';
    btn.style.background = 'linear-gradient(135deg,#22c55e,#4ade80)';
    btn.disabled = true;

    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
      btn.disabled = false;
      form.reset();
      form.querySelectorAll('.form-group').forEach(g => g.classList.remove('is-valid', 'has-error'));
    }, 3000);
  });
})();

/* ── Skill bar init on full load (existing, preserved) ─────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.skill-level-fill').forEach(bar => {
      const pct = bar.getAttribute('data-pct') || '0';
      bar.style.transition = 'width 1.2s ease';
      bar.style.width = pct + '%';
    });
    document.querySelectorAll('.progress-fill').forEach(bar => {
      const pct = bar.getAttribute('data-pct') || '0';
      bar.style.transition = 'width 1.4s ease';
      bar.style.width = pct + '%';
    });
  }, 400);
});
