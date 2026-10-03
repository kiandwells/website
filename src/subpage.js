/* Subpage shared entry (shared styles + navbar behavior) */
import './shared.css';
import './subpage.css';
import './shared.js';

// ── BHK filters (Properties page) ─────────────────────────────
const filterBar = document.querySelector('.prop-filters');

if (filterBar) {
  const filterBtns = filterBar.querySelectorAll('.prop-filter');
  const cards = document.querySelectorAll('.properties-grid .prop-card');

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.prop-filter');
    if (!btn) return;

    const filter = btn.dataset.filter;

    filterBtns.forEach(b => {
      const active = b === btn;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', String(active));
    });

    cards.forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.bhk !== filter;
    });
  });
}
