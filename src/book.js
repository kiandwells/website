/* ============================================================
   BOOK NOW PAGE JS – form validation + WhatsApp
============================================================ */
import './shared.css';
import './book.css';
import './shared.js';

const form = document.getElementById('bookForm');
if (!form) throw new Error('bookForm not found');

// Pre-select property from URL ?property=fortune etc.
const preselect = new URLSearchParams(window.location.search).get('property');
if (preselect) {
  const sel = document.getElementById('interest');
  if (sel) {
    const opt = [...sel.options].find(o => o.value === preselect);
    if (opt) sel.value = opt.value;
  }
}

// ── Date helpers ──────────────────────────────────────────────
function toISO(ddmmyyyy) {
  // dd/mm/yyyy → yyyy-mm-dd
  const [d, m, y] = ddmmyyyy.split('/');
  return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
}

function formatDMY(dateStr) {
  // yyyy-mm-dd → dd/mm/yyyy
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const today = new Date().toISOString().split('T')[0];

// ── Wire up date inputs with min constraints ──────────────────
const checkinInput = document.getElementById('checkin');
const checkoutInput = document.getElementById('checkout');

if (checkinInput) {
  checkinInput.min = today;
  checkinInput.addEventListener('change', () => {
    if (checkoutInput) {
      // Checkout must be at least the day after check-in
      const cin = new Date(checkinInput.value);
      cin.setDate(cin.getDate() + 1);
      checkoutInput.min = cin.toISOString().split('T')[0];

      // Clear checkout if it's now invalid
      if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = '';
      }
    }
    clearError(checkinInput);
  });
}

if (checkoutInput) {
  checkoutInput.addEventListener('change', () => clearError(checkoutInput));
}

// ── Validation ────────────────────────────────────────────────
function showError(input, msg) {
  input.classList.add('error');
  const errEl = input.closest('.form-group')?.querySelector('.form-error');
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.add('visible');
  }
}

// Clear errors on input
function clearError(input) {
  input.classList.remove('error');
  const errEl = input.closest('.form-group')?.querySelector('.form-error');
  if (errEl) errEl.classList.remove('visible');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+\$/.test(email);
}

function validatePhone(phone) {
  return /^[0-9\s\-\+]{7,15}\$/.test(phone.trim());
}

form.querySelectorAll('input, select').forEach(el => {
  el.addEventListener('input', () => clearError(el));
});

// ── Form submit ───────────────────────────────────────────────
form.addEventListener('submit', e => {
  e.preventDefault();

  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const dialCode = document.getElementById('dialCode');
  const phone = document.getElementById('phone');
  const interest = document.getElementById('interest');
  const checkin = document.getElementById('checkin');
  const checkout = document.getElementById('checkout');

  let valid = true;

  // Name
  if (!name.value.trim()) {
    showError(name, 'Please enter your name.');
    valid = false;
  }

  // Email
  if (!email.value.trim()) {
    showError(email, 'Please enter your email.');
    valid = false;
  } else if (!validateEmail(email.value.trim())) {
    showError(email, 'Please enter a valid email address.');
    valid = false;
  }

  // Phone
  if (!phone.value.trim()) {
    showError(phone, 'Please enter your contact number.');
    valid = false;
  } else if (!validatePhone(phone.value)) {
    showError(phone, 'Please enter a valid phone number.');
    valid = false;
  }

  // Interested in
  if (!interest.value) {
    showError(interest, 'Please select a property.');
    valid = false;
  }

  // Check-in
  if (!checkin.value) {
    showError(checkin, 'Please select a check-in date.');
    valid = false;
  } else if (checkin.value < today) {
    showError(checkin, 'Check-in date must be today or later.');
    valid = false;
  }

  // Check-out
  if (!checkout.value) {
    showError(checkout, 'Please select a check-out date.');
    valid = false;
  } else if (checkin.value && checkout.value <= checkin.value) {
    showError(checkout, 'Check-out must be after check-in.');
    valid = false;
  }

  if (!valid) return;

  // ── Calculate Stay Duration ───────────────────────────────
  const date1 = new Date(checkin.value);
  const date2 = new Date(checkout.value);
  const timeDiff = date2.getTime() - date1.getTime();
  const totalNights = Math.round(timeDiff / (1000 * 3600 * 24));

  // ── Build WhatsApp message ────────────────────────────────
  const fullPhone = `${dialCode.value}${phone.value.trim().replace(/^0+/, '')}`;
  const cinFmt = formatDMY(checkin.value);
  const coutFmt = formatDMY(checkout.value);

  const msg = [
    `*New Booking Enquiry*`,
    `Name: ${name.value.trim()}`,
    `Email: ${email.value.trim()}`,
    `Phone: ${fullPhone}`,
    `Interested In: ${interest.options[interest.selectedIndex].text}`,
    `Check-in: ${cinFmt}`,
    `Check-out: ${coutFmt}`,
    `Duration: ${totalNights} night${totalNights > 1 ? 's' : ''}`
  ].join('\n');

  const waNumber = '918660544699'; // +91 866 054 4699
  const waURL = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  window.open(waURL, '_blank', 'noopener,noreferrer');
});
