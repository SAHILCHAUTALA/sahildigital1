'use strict';

// ─── ROUTING ──────────────────────────────────────────
const PAGES = ['home', 'about', 'services', 'contact'];

function getPage() {
  const hash = location.hash.replace('#', '').trim();
  return PAGES.includes(hash) ? hash : 'home';
}

function navigate(page, pushState = true) {
  if (!PAGES.includes(page)) page = 'home';

  // Show/hide pages
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.classList.toggle('active', p === page);
  });

  // Update nav links
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });

  // Hash
  if (pushState) history.pushState(null, '', '#' + page);

  // Scroll to top
  window.scrollTo(0, 0);

  // Re-trigger scroll animations for the new page
  setTimeout(runScrollAnimations, 50);

  // Close mobile menu
  setMobileMenuOpen(false);
}

// Handle clicks on nav links / buttons
document.addEventListener('click', e => {
  const trigger = e.target.closest('[data-page]');
  if (trigger) {
    e.preventDefault();
    const page = trigger.dataset.page;
    navigate(page);
  }
});

window.addEventListener('popstate', () => navigate(getPage(), false));

// Init on load
navigate(getPage(), false);

// ─── NAVBAR SCROLL ────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ─── MOBILE MENU ──────────────────────────────────────
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const iconMenu   = menuToggle.querySelector('.icon-menu');
const iconX      = menuToggle.querySelector('.icon-x');
let menuOpen = false;

function setMobileMenuOpen(open) {
  menuOpen = open;
  mobileMenu.classList.toggle('hidden', !open);
  iconMenu.classList.toggle('hidden', open);
  iconX.classList.toggle('hidden', !open);
}

menuToggle.addEventListener('click', () => setMobileMenuOpen(!menuOpen));

// ─── SCROLL ANIMATIONS ────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
    }
  });
}, { threshold: 0.12 });

function runScrollAnimations() {
  document.querySelectorAll('.fade-up:not(.in)').forEach(el => observer.observe(el));
}

// Also observe any newly shown elements
runScrollAnimations();

// ─── CONTACT FORM ─────────────────────────────────────
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm()) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerHTML = '<span>Sending…</span>';

    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = svgSend + ' Send Message';
      form.reset();
      clearErrors();
      showToast('Message Sent Successfully!', 'Thank you for contacting Digital Chauk. We will get back to you shortly.');
    }, 1500);
  });
}

function validateForm() {
  clearErrors();
  let valid = true;
  const f = form;

  const name = f.querySelector('#f-name');
  if (!name.value.trim() || name.value.trim().length < 2) {
    showError(name, 'Name must be at least 2 characters'); valid = false;
  }

  const phone = f.querySelector('#f-phone');
  if (!phone.value.trim() || phone.value.replace(/\D/g,'').length < 10) {
    showError(phone, 'Enter a valid phone number (min 10 digits)'); valid = false;
  }

  const email = f.querySelector('#f-email');
  if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    showError(email, 'Enter a valid email address'); valid = false;
  }

  const service = f.querySelector('#f-service');
  if (!service.value) {
    showError(service, 'Please select a service'); valid = false;
  }

  const msg = f.querySelector('#f-message');
  if (!msg.value.trim() || msg.value.trim().length < 10) {
    showError(msg, 'Message must be at least 10 characters'); valid = false;
  }

  return valid;
}

function showError(input, msg) {
  input.classList.add('error');
  const err = document.createElement('p');
  err.className = 'form-error';
  err.textContent = msg;
  input.parentNode.appendChild(err);
}

function clearErrors() {
  form.querySelectorAll('.form-error').forEach(e => e.remove());
  form.querySelectorAll('.error').forEach(e => e.classList.remove('error'));
}

// ─── TOAST ────────────────────────────────────────────
const toast     = document.getElementById('toast');
const toastTitle = document.getElementById('toast-title');
const toastMsg   = document.getElementById('toast-msg');
const toastClose = document.getElementById('toast-close');
let toastTimer;

function showToast(title, msg) {
  toastTitle.textContent = title;
  toastMsg.textContent   = msg;
  toast.classList.remove('hidden', 'fade-out');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, 5000);
}

function hideToast() {
  toast.classList.add('fade-out');
  toast.addEventListener('animationend', () => toast.classList.add('hidden'), { once: true });
}

toastClose.addEventListener('click', hideToast);

// ─── SERVICES: INQUIRE LINK ────────────────────────────
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-inquire]');
  if (btn) {
    e.preventDefault();
    navigate('contact');
    setTimeout(() => {
      const sel = document.getElementById('f-service');
      if (sel) sel.value = btn.dataset.inquire;
    }, 80);
  }
});

// ─── ICON REF (used in submit button restore) ─────────
const svgSend = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>`;
