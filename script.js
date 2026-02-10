/* ============================================================
   script.js — Mateus Marques Pinto Portfolio
   ============================================================ */

(() => {
  'use strict';

  /* ---- DOM references ---- */
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => [...p.querySelectorAll(s)];

  const themeToggle  = $('#themeToggle');
  const themeIcon    = $('#themeIcon');
  const langToggle   = $('#langToggle');
  const langLabel    = $('.lang-label');
  const menuToggle   = $('#menuToggle');
  const nav          = $('#nav');
  const header       = $('#header');
  const backToTop    = $('#backToTop');
  const contactForm  = $('#contactForm');
  const navLinks     = $$('.nav__link');
  const sections     = $$('section[id]');

  /* ============================================================
     1. THEME (DARK / LIGHT)
     ============================================================ */
  const THEME_KEY = 'mmp-theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }

  applyTheme(getPreferredTheme());

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  /* listen for system changes */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  /* ============================================================
     2. LANGUAGE SWITCH (PT / EN)
     ============================================================ */
  const LANG_KEY = 'mmp-lang';

  function getPreferredLang() {
    return localStorage.getItem(LANG_KEY) || 'pt';
  }

  function applyLang(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem(LANG_KEY, lang);

    /* Update toggle button label to show the OTHER language */
    langLabel.textContent = lang === 'pt' ? 'EN' : 'PT';

    /* Update page title */
    document.title = lang === 'pt'
      ? 'Mateus Marques Pinto — Engenheiro Eletricista'
      : 'Mateus Marques Pinto — Electrical Engineer';

    /* Swap all elements with data-pt / data-en attributes */
    $$('[data-pt][data-en]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        /* If element has childNodes that are elements (icons etc.), only update textContent of text nodes */
        if (el.children.length > 0) {
          /* Find direct text nodes */
          const textNodes = [...el.childNodes].filter(n => n.nodeType === Node.TEXT_NODE);
          if (textNodes.length > 0) {
            textNodes.forEach(n => n.textContent = text);
          } else {
            /* element only has child elements — set innerHTML preserving children would be complex,
               so fallback: set textContent (works for most simple cases like <span> wrapping) */
            el.textContent = text;
          }
        } else {
          el.textContent = text;
        }
      }
    });

    /* Update input placeholders if any */
    $$(`[data-${lang}-placeholder]`).forEach(el => {
      el.placeholder = el.getAttribute(`data-${lang}-placeholder`);
    });
  }

  applyLang(getPreferredLang());

  langToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-lang');
    applyLang(current === 'pt' ? 'en' : 'pt');
  });

  /* ============================================================
     3. MOBILE MENU
     ============================================================ */
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  /* Close mobile menu on link click */
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Close mobile menu on outside click */
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('open')) {
      nav.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  /* ============================================================
     4. ACTIVE NAV LINK ON SCROLL (Intersection Observer)
     ============================================================ */
  const observerNav = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, {
    rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) + 10}px 0px -60% 0px`,
    threshold: 0
  });

  sections.forEach(s => observerNav.observe(s));

  /* ============================================================
     5. SCROLL ANIMATIONS (Intersection Observer)
     ============================================================ */
  const observerAnim = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observerAnim.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15
  });

  $$('.animate-on-scroll').forEach(el => observerAnim.observe(el));

  /* ============================================================
     6. BACK TO TOP BUTTON
     ============================================================ */
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ============================================================
     7. CONTACT FORM → mailto:
     ============================================================ */
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = $('#name').value.trim();
    const email   = $('#email').value.trim();
    const message = $('#message').value.trim();

    if (!name || !email || !message) return;

    const lang = document.documentElement.getAttribute('data-lang');
    const subject = lang === 'pt'
      ? `Contato via Portfólio — ${name}`
      : `Portfolio Contact — ${name}`;

    const body = lang === 'pt'
      ? `Nome: ${name}\nE-mail: ${email}\n\nMensagem:\n${message}`
      : `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    const mailtoLink = `mailto:mateusmarquespinto@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
  });

  /* ============================================================
     8. SMOOTH SCROLL FOR ANCHOR LINKS (fallback)
     ============================================================ */
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = $(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

})();
