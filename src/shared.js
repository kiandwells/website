/* ============================================================
   SHARED JS – navbar, music, modal, footer year
   ============================================================ */

// ── Footer year ──────────────────────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Active nav link ──────────────────────────────────────────
(function markActiveLink() {
  const links = document.querySelectorAll('.g-navbar__links a');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === path || (path === '' && href === 'index.html'))) {
      a.classList.add('active');
    }
  });
})();

// ── Hamburger ────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on nav link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}

// ── Navbar scroll style ──────────────────────────────────────
const navbar = document.querySelector('.g-navbar');
if (navbar) {
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Map modal ────────────────────────────────────────────────
const mapModal   = document.getElementById('mapModal');
const openMapBtn = document.getElementById('openMapBtn');
const closeMapBtn = document.getElementById('closeMapBtn');

function openModal(modal) {
  if (!modal) return;
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  // Focus trap – focus close button
  setTimeout(() => {
    const close = modal.querySelector('.modal-close');
    if (close) close.focus();
  }, 60);
}

function closeModal(modal) {
  if (!modal) return;
  modal.setAttribute('hidden', '');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (openMapBtn) {
  openMapBtn.addEventListener('click', e => {
    e.preventDefault();
    openModal(mapModal);
  });
}

if (closeMapBtn) {
  closeMapBtn.addEventListener('click', () => closeModal(mapModal));
}

if (mapModal) {
  mapModal.addEventListener('click', e => {
    if (e.target === mapModal) closeModal(mapModal);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal(mapModal);
  });
}

// ── Music toggle ─────────────────────────────────────────────
const musicToggle = document.getElementById('music-toggle');
const bgMusic     = document.getElementById('bg-music');

if (musicToggle && bgMusic) {
  let isPlaying = false;

  musicToggle.addEventListener('click', () => {
    if (!bgMusic.src || bgMusic.src === window.location.href) {
      // No source configured yet – show a brief tooltip
      musicToggle.title = 'Music coming soon!';
      musicToggle.classList.add('playing');
      setTimeout(() => {
        musicToggle.classList.remove('playing');
        musicToggle.title = 'Toggle music';
      }, 1500);
      return;
    }

    if (isPlaying) {
      bgMusic.pause();
      isPlaying = false;
      musicToggle.classList.remove('playing');
      musicToggle.setAttribute('aria-label', 'Play background music');
    } else {
      bgMusic.play().catch(() => {});
      isPlaying = true;
      musicToggle.classList.add('playing');
      musicToggle.setAttribute('aria-label', 'Pause background music');
    }
  });
}
