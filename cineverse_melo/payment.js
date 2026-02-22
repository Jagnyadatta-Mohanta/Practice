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
}

function renderSummary(movie, theater, seats, time, pricing) {
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  set('.pay-movie-name',   movie?.title || '—');
  set('.pay-theater-info', theater?.name || '—');
  set('.pay-show-info',    `${time || '—'} · ${Storage.getFormat() || 'Standard'}`);
  const seatsEl = document.querySelector('.pay-seats-row');
  if (seatsEl) seatsEl.innerHTML = seats.map(s => `<span class="pay-seat-chip">${s}</span>`).join('');
  set('.pay-row-tickets',      `₹${pricing.base}`);
  set('.pay-row-conv',         `₹${pricing.convenience}`);
  set('.pay-row-total-amount', `₹${pricing.total}`);
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
    Object.entries(panels).forEach(([key, el]) => { if (el) el.style.display = key === method ? 'block' : 'none'; });
  }

  tabs.forEach(tab => tab.addEventListener('click', () => switchMethod(tab.dataset.method)));
  switchMethod('card');

  const numInput  = document.querySelector('#card-number');
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

function bindPayButton(pricing, seats) {
  const btn      = document.querySelector('.pay-now-btn');
  const progress = document.querySelector('.pay-progress');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    if (activeMethod === 'card') {
      const num  = document.querySelector('#card-number')?.value?.replace(/\s/g,'');
      const name = document.querySelector('#card-name')?.value?.trim();
      const exp  = document.querySelector('#card-exp')?.value?.trim();
      const cvv  = document.querySelector('#card-cvv')?.value?.trim();
      if (!num || num.length < 16)   { flashError('Please enter a valid 16-digit card number'); return; }
      if (!name)                      { flashError('Please enter the cardholder name'); return; }
      if (!exp || exp.length < 5)     { flashError('Please enter a valid expiry date (MM/YY)'); return; }
      if (!cvv || cvv.length < 3)     { flashError('Please enter your CVV'); return; }
      const [mm, yy] = exp.split('/').map(Number);
      const now = new Date();
      if (new Date(2000 + yy, mm - 1) < new Date(now.getFullYear(), now.getMonth())) {
        flashError('Your card has expired'); return;
      }
    }
    if (activeMethod === 'upi') {
      const upi = document.querySelector('#upi-id')?.value?.trim();
      if (!upi || !upi.includes('@')) { flashError('Please enter a valid UPI ID (e.g. name@bank)'); return; }
    }
    if (activeMethod === 'netbanking') {
      const bank = document.querySelector('#bank-select')?.value;
      if (!bank) { flashError('Please select your bank'); return; }
    }

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Processing payment...`;
    if (progress) { progress.style.width = '0%'; setTimeout(() => progress.style.width = '100%', 50); }

    const bookingId = Storage.generateBookingId();
    Storage.saveToHistory({
      id: bookingId, movie: Storage.getMovie(), theater: Storage.getTheater(),
      seats, time: Storage.getShowtime(), format: Storage.getFormat(),
      total: pricing.total, date: Storage.getDate(), bookedAt: new Date().toISOString(),
    });
    Storage.setBooking({ bookingId });

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

document.addEventListener('DOMContentLoaded', init);
