import { Storage } from './utils.js';
import { Header, Footer } from './layout.js';

let activeMethod = 'card';

function init() {
  Header.init();
  Footer.init();
  const movie   = Storage.getMovie();
  const theater = Storage.getTheater();
  const seats   = Storage.getSeats();
  const format  = Storage.getFormat() || 'Standard';
  const time    = Storage.getShowtime();
  const pricing = Storage.calculatePricing(movie, format, seats.length);

  renderSummary(movie, theater, seats, time, pricing);
  buildMethodTabs();
  bindPayButton(pricing, seats);
  updateCardPreview();
}

function renderSummary(movie, theater, seats, time, pricing) {
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  set('.pay-movie-name',   movie?.title || '—');
  set('.pay-theater-info', theater?.name || '—');
  set('.pay-show-info',    `${time || '—'} · ${Storage.getFormat() || 'Standard'}`);

  // Seats
  const seatsEl = document.querySelector('.pay-seats-row');
  if (seatsEl) {
    seatsEl.innerHTML = seats.map(s =>
      `<span class="pay-seat-chip">${s}</span>`
    ).join('');
  }

  // Pricing rows
  set('.pay-row-tickets', `₹${pricing.base}`);
  set('.pay-row-conv',    `₹${pricing.convenience}`);
  set('.pay-row-total-amount', `₹${pricing.total}`);

  // Label
  const ticketLabel = document.querySelector('.pay-ticket-label');
  if (ticketLabel) ticketLabel.textContent = `${seats.length} × ₹${pricing.basePerSeat}`;
}

function buildMethodTabs() {
  const tabs = document.querySelectorAll('.pay-method-tab');
  const panels = {
    card:       document.querySelector('.pay-panel-card'),
    upi:        document.querySelector('.pay-panel-upi'),
    netbanking: document.querySelector('.pay-panel-netbanking'),
  };

  function switchMethod(method) {
    activeMethod = method;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.method === method));
    Object.entries(panels).forEach(([key, el]) => {
      if (el) el.style.display = key === method ? 'block' : 'none';
    });
  }

  tabs.forEach(tab => tab.addEventListener('click', () => switchMethod(tab.dataset.method)));
  switchMethod('card');

  // Card preview live update
  const numInput = document.querySelector('#card-number');
  const nameInput = document.querySelector('#card-name');
  const expInput  = document.querySelector('#card-exp');

  numInput?.addEventListener('input', e => {
    let val = e.target.value.replace(/\D/g,'').slice(0,16);
    e.target.value = val.replace(/(.{4})/g,'$1 ').trim();
    const preview = document.querySelector('.card-preview-num');
    if (preview) {
      const padded = (val + '0000000000000000').slice(0,16);
      preview.textContent = padded.replace(/(.{4})/g,'$1 ').trim();
    }
  });

  nameInput?.addEventListener('input', e => {
    const el = document.querySelector('.card-preview-field-val.name');
    if (el) el.textContent = e.target.value.toUpperCase() || 'YOUR NAME';
  });

  expInput?.addEventListener('input', e => {
    let val = e.target.value.replace(/\D/g,'');
    if (val.length > 2) val = val.slice(0,2) + '/' + val.slice(2,4);
    e.target.value = val;
    const el = document.querySelector('.card-preview-field-val.exp');
    if (el) el.textContent = val || 'MM/YY';
  });
}

function updateCardPreview() {
  // default state
}

function bindPayButton(pricing, seats) {
  const btn = document.querySelector('.pay-now-btn');
  const progress = document.querySelector('.pay-progress');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    // Validate
    if (activeMethod === 'card') {
      const num = document.querySelector('#card-number')?.value?.replace(/\s/g,'');
      if (!num || num.length < 12) { flashError('Please enter a valid card number'); return; }
    }

    // Start loading
    btn.disabled = true;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<span class="spinner"></span> Processing payment...`;

    if (progress) {
      progress.style.width = '0%';
      setTimeout(() => progress.style.width = '100%', 50);
    }

    // Save booking
    const bookingId = Storage.generateBookingId();
    const booking = {
      id: bookingId,
      movie: Storage.getMovie(),
      theater: Storage.getTheater(),
      seats: seats,
      time: Storage.getShowtime(),
      format: Storage.getFormat(),
      total: pricing.total,
      date: Storage.getDate(),
      bookedAt: new Date().toISOString(),
    };
    Storage.saveToHistory(booking);
    Storage.setBooking({ bookingId });

    // Simulate processing
    await new Promise(r => setTimeout(r, 3000));
    window.location.href = 'confirmation.html';
  });
}

function flashError(msg) {
  let toast = document.querySelector('.error-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.style.cssText = 'position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:#e63946;color:#fff;font-size:13px;font-family:Outfit,sans-serif;padding:12px 24px;border-radius:8px;z-index:9999;font-weight:500;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => toast.style.opacity = '0', 2500);
}

function bindHeaderScroll() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', init);
