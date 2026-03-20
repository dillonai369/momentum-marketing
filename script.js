/* ============================================================
   MOMENTUM — Shared JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ── Custom Cursor ────────────────────────────────────────── */
  const cursorDot  = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  const LERP = 0.10;

  if (cursorDot && cursorRing) {
    document.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top  = mouseY + 'px';
    });

    document.addEventListener('mousedown', function () {
      document.body.classList.add('cursor-click');
    });

    document.addEventListener('mouseup', function () {
      document.body.classList.remove('cursor-click');
    });

    // Hoverable elements
    const hoverTargets = 'a, button, .work-card, .sidebar-item, .menu-link-item, .cta-btn, .work-item, .result-item, .form-field input, .form-field select, .form-field textarea, [data-hover]';

    function addHoverListeners() {
      document.querySelectorAll(hoverTargets).forEach(function (el) {
        el.addEventListener('mouseenter', function () {
          document.body.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', function () {
          document.body.classList.remove('cursor-hover');
        });
      });
    }

    addHoverListeners();

    // Animate ring with lerp
    function animateRing() {
      ringX += (mouseX - ringX) * LERP;
      ringY += (mouseY - ringY) * LERP;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
      requestAnimationFrame(animateRing);
    }

    animateRing();
  }

  /* ── Page Transitions ─────────────────────────────────────── */
  const transition = document.querySelector('.page-transition');

  // Reveal on load
  if (transition) {
    transition.classList.add('reveal');

    // Remove after animation
    setTimeout(function () {
      transition.style.display = 'none';
    }, 700);
  }

  // Cover on navigation
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip external, anchor, mailto, tel links
    if (
      href.startsWith('http') ||
      href.startsWith('#') ||
      href.startsWith('mailto') ||
      href.startsWith('tel') ||
      link.target === '_blank'
    ) return;

    e.preventDefault();

    if (!transition) {
      window.location.href = href;
      return;
    }

    transition.style.display = 'block';
    transition.classList.remove('reveal');
    transition.classList.add('cover');

    setTimeout(function () {
      window.location.href = href;
    }, 580);
  });

  /* ── Nav Clock ────────────────────────────────────────────── */
  const airports = [
    { code: 'NYC', offset: -5 },
    { code: 'LAX', offset: -8 },
    { code: 'LDN', offset:  0 },
    { code: 'SFO', offset: -8 },
    { code: 'CDG', offset:  1 },
    { code: 'YYZ', offset: -5 },
  ];

  const chosen  = airports[Math.floor(Math.random() * airports.length)];
  const locEl   = document.querySelector('.nav-location');
  const timeEl  = document.querySelector('.nav-time');

  if (locEl) locEl.textContent = chosen.code;

  function updateClock() {
    if (!timeEl) return;
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utc + chosen.offset * 3600000);
    const h = local.getHours().toString().padStart(2, '0');
    const m = local.getMinutes().toString().padStart(2, '0');
    const s = local.getSeconds().toString().padStart(2, '0');
    timeEl.textContent = h + ':' + m + ':' + s;
  }

  updateClock();
  setInterval(updateClock, 1000);

  /* ── Menu Open / Close ────────────────────────────────────── */
  const menuBtn     = document.getElementById('menuBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  const menuClose   = document.getElementById('menuClose');

  function openMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.add('open');
    document.body.classList.add('menu-open');
  }

  function closeMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  if (menuBtn)   menuBtn.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);

  // Close on ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });

  /* ── Marquee Builder ──────────────────────────────────────── */
  window.buildMarquee = function (trackId, items) {
    const track = document.getElementById(trackId);
    if (!track) return;

    // Build doubled array for seamless loop
    const doubled = [...items, ...items];
    track.innerHTML = '';

    doubled.forEach(function (item) {
      const span = document.createElement('span');
      span.className = 'marquee-item';
      span.textContent = item;
      track.appendChild(span);

      const dot = document.createElement('span');
      dot.className = 'marquee-dot';
      track.appendChild(dot);
    });
  };

  /* ── Scroll Reveal ────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ── Counter Animation ────────────────────────────────────── */
  function animateCounter(el) {
    const target   = parseFloat(el.getAttribute('data-count'))  || 0;
    const prefix   = el.getAttribute('data-prefix')  || '';
    const suffix   = el.getAttribute('data-suffix')  || '';
    const decimals = parseInt(el.getAttribute('data-decimal')) || 0;
    const duration = 2000;
    const start    = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOut(progress);
      const value    = eased * target;

      el.textContent = prefix + value.toFixed(decimals) + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + target.toFixed(decimals) + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(function (el) {
    counterObserver.observe(el);
  });

  /* ── Form Submit (demo) ───────────────────────────────────── */
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const btn = form.querySelector('.form-submit-btn');
      if (btn) {
        const spanEl = btn.querySelector('span');
        if (spanEl) spanEl.textContent = 'Message Sent';
        else btn.textContent = 'Message Sent';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.6';
      }
    });
  }

})();

