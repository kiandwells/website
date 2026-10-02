/* ============================================================
   HOME PAGE JS – 3D card carousel
   ============================================================ */
import './shared.css';
import './home.css';
import './shared.js';

const CARDS_DATA = [
  { name: 'Fortune',     label: 'Fortune',     href: 'fortune.html',     color: '#d4b896' },
  { name: 'Elite',       label: 'Elite',        href: 'elite.html',       color: '#b0c4d8' },
  { name: 'Grandeur',    label: 'Grandeur',     href: 'grandeur.html',    color: '#c8d4b0' },
  { name: 'Golden Nest', label: 'Golden Nest',  href: 'goldennest.html',  color: '#e0c88c' },
  { name: 'Palace View', label: 'Palace View',  href: 'palaceview.html',  color: '#d0b8c8' },
];

// Google Drive folder base – user will provide actual image IDs
// Fallback gradient colors defined in CARDS_DATA above
const GDRIVE_IMAGES = [
  '', // fortune    – replace with actual direct link
  '', // elite      – replace with actual direct link
  '', // grandeur   – replace with actual direct link
  '', // goldennest – replace with actual direct link
  '', // palaceview – replace with actual direct link
];

const carousel   = document.getElementById('heroCarousel');
const floatLabel = document.getElementById('floatLabel');
const floatThumbImg = document.getElementById('floatThumbImg');
const prevBtn    = document.getElementById('prevBtn');
const nextBtn    = document.getElementById('nextBtn');
const cards      = Array.from(document.querySelectorAll('.hero-card'));

let current = 0;
const total = cards.length;

// ── Position helpers ──────────────────────────────────────────
function getRelPos(index, current, total) {
  let rel = index - current;
  if (rel > total / 2) rel -= total;
  if (rel < -total / 2) rel += total;
  return rel;
}

function applyPositions() {
  cards.forEach((card, i) => {
    const rel = getRelPos(i, current, total);
    card.className = 'hero-card';

    const w = carousel.offsetWidth || 560;
    const isSmall = window.innerWidth < 600;
    const gap     = isSmall ? w * 0.62 : w * 0.58;
    const yTilt   = isSmall ? 0 : -15;

    let x = rel * gap;
    let z = -Math.abs(rel) * 160;
    let scale = 1 - Math.abs(rel) * 0.18;
    let rotateY = rel * yTilt;

    if (rel === 0) {
      card.classList.add('active');
    } else if (rel === -1) {
      card.classList.add('prev');
    } else if (rel === 1) {
      card.classList.add('next');
    } else if (Math.abs(rel) === 2) {
      card.classList.add(rel < 0 ? 'far-prev' : 'far-next');
    } else {
      card.classList.add('hidden');
    }

    card.style.transform = `translate(-50%, -50%) translateX(${x}px) translateZ(${z}px) scale(${scale}) rotateY(${rotateY}deg)`;
  });

  updateFloatNav();
}

function updateFloatNav() {
  const d = CARDS_DATA[current];
  if (floatLabel) floatLabel.textContent = d.label.toUpperCase();
  if (floatThumbImg) {
    if (GDRIVE_IMAGES[current]) {
      floatThumbImg.style.backgroundImage = `url(${GDRIVE_IMAGES[current]})`;
    } else {
      floatThumbImg.style.backgroundImage = 'none';
      floatThumbImg.style.background = d.color;
    }
  }
}

function goTo(index) {
  current = ((index % total) + total) % total;
  applyPositions();
}

// ── Click on card → navigate or go-to ─────────────────────────
cards.forEach((card, i) => {
  card.addEventListener('click', () => {
    const rel = getRelPos(i, current, total);
    if (rel === 0) {
      // Active card → navigate to property page
      window.location.href = CARDS_DATA[i].href;
    } else {
      goTo(i);
    }
  });
});

// ── Prev / Next buttons ────────────────────────────────────────
if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

// ── Keyboard navigation ────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  goTo(current - 1);
  if (e.key === 'ArrowRight') goTo(current + 1);
  if (e.key === 'Enter' || e.key === ' ') {
    window.location.href = CARDS_DATA[current].href;
  }
});

// ── Touch / swipe ──────────────────────────────────────────────
let touchStartX = 0;
document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].clientX;
}, { passive: true });

document.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
}, { passive: true });

// ── Auto-advance (pauses on interaction) ──────────────────────
let autoTimer = setInterval(() => goTo(current + 1), 5000);

function resetAutoTimer() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => goTo(current + 1), 5000);
}

[prevBtn, nextBtn, ...cards].forEach(el => {
  if (el) el.addEventListener('click', resetAutoTimer);
});

// ── Init ──────────────────────────────────────────────────────
applyPositions();
window.addEventListener('resize', () => applyPositions());
