import { Storage, Auth } from './utils.js';
import { Header, Footer } from './layout.js';

const ROWS          = ['A','B','C','D','E','F','G'];
const SEATS_PER_ROW = 12;
const MAX_SEATS     = 6;
const BOOKED = new Set([
  'A2','A3','A9','A10','B5','B6','B11','C1','C2','C7','C12',
  'D4','D5','D6','E3','E8','E9','F6','F7','G2','G10','G11'
]);

let selectedSeats = new Set();
let movie   = null;
let theater = null;
let format  = 'Standard';

function init() {
  Header.init();
  Footer.init();
  movie   = Storage.getMovie();
  theater = Storage.getTheater();
  format  = Storage.getFormat() || 'Standard';
  populateSummaryHeader();
  renderContextBar();
  buildSeatGrid();
  renderSummary();
  bindFormatSelector();
  bindProceedBtn();
}

function populateSummaryHeader() {
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val || '—'; };
  set('.summary-movie-name',   movie?.title);
  set('.summary-theater-name', theater?.name);
  set('.summary-showtime',     Storage.getShowtime());
}

function renderContextBar() {
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val || '—'; };
  set('.ctx-movie',   movie?.title);
  set('.ctx-theater', theater?.name);
  set('.ctx-time',    Storage.getShowtime());
  set('.ctx-format',  format);
}

function bindFormatSelector() {
  document.querySelectorAll('.format-select-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.format === format);
    btn.addEventListener('click', () => {
      document.querySelectorAll('.format-select-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      format = btn.dataset.format;
      Storage.setFormat(format);
      const ctxFormat = document.querySelector('.ctx-format');
      if (ctxFormat) ctxFormat.textContent = format;
      renderSummary();
    });
  });
}

function buildSeatGrid() {
  const grid = document.querySelector('.seat-grid');
  if (!grid) return;
  grid.innerHTML = '';
  ROWS.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'seat-row';
    const label = document.createElement('span');
    label.className = 'seat-row-label';
    label.textContent = row;
    rowEl.appendChild(label);
    for (let s = 1; s <= SEATS_PER_ROW; s++) {
      if (s === 7) {
        const aisle = document.createElement('div');
        aisle.className = 'seat-aisle';
        rowEl.appendChild(aisle);
      }
      const id   = `${row}${s}`;
      const seat = document.createElement('div');
      const isBooked = BOOKED.has(id);
      seat.className = `seat ${isBooked ? 'booked' : 'available'}`;
      seat.dataset.id = id;
      seat.setAttribute('role', 'button');
      seat.setAttribute('aria-label', `Seat ${id}${isBooked ? ' (booked)' : ''}`);
      seat.setAttribute('aria-pressed', 'false');
      if (!isBooked) {
        seat.setAttribute('tabindex', '0');
        seat.addEventListener('click', () => toggleSeat(id, seat));
        seat.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSeat(id, seat); }
        });
      } else {
        seat.setAttribute('aria-disabled', 'true');
        seat.innerHTML = `
          <svg width="10" height="10" viewBox="0 0 10 10">
            <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>`;
      }
      rowEl.appendChild(seat);
    }
    grid.appendChild(rowEl);
  });
}

function toggleSeat(id, el) {
  if (BOOKED.has(id)) return;
  if (selectedSeats.has(id)) {
    selectedSeats.delete(id);
    el.classList.replace('selected', 'available');
    el.innerHTML = '';
    el.setAttribute('aria-pressed', 'false');
  } else {
    if (selectedSeats.size >= MAX_SEATS) { shakeElement(el); flashLimitNote(); return; }
    selectedSeats.add(id);
    el.classList.replace('available', 'selected');
    el.setAttribute('aria-pressed', 'true');
    el.innerHTML = `
      <svg width="10" height="10" viewBox="0 0 10 10">
        <polyline points="2,6 5,9 9,2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;
  }
  renderSummary();
}

function renderSummary() {
  const seatsArr = [...selectedSeats].sort();
  Storage.setSeats(seatsArr);
  const count   = seatsArr.length;
  const pricing = Storage.calculatePricing(movie, format, count);

  const chipsEl = document.querySelector('.summary-seats-display');
  if (chipsEl) {
    chipsEl.innerHTML = count
      ? seatsArr.map(s => `<span class="summary-seat-chip">${s}</span>`).join('')
      : `<span class="summary-empty">Select your seats</span>`;
  }

  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  set('.summary-ticket-label',  count ? `${count} × ₹${pricing.basePerSeat}` : '0 × ₹0');
  set('.summary-base-price',    count ? `₹${pricing.base}` : '—');
  set('.summary-conv-fee',      count ? `₹${pricing.convenience}` : '—');
  set('.summary-total-amount',  `₹${pricing.total}`);

  const btn = document.querySelector('.summary-proceed-btn');
  if (!btn) return;
  if (count > 0) {
    btn.textContent = `Proceed to Pay  ₹${pricing.total}`;
    btn.classList.remove('btn-disabled');
    btn.disabled = false;
  } else {
    btn.textContent = 'Select Seats First';
    btn.classList.add('btn-disabled');
    btn.disabled = true;
  }
}

function bindProceedBtn() {
  document.querySelector('.summary-proceed-btn')?.addEventListener('click', () => {
    if (selectedSeats.size === 0) return;
    const user = Auth.getCurrentUser();
    if (!user) {
      window.dispatchEvent(new CustomEvent('cv:openauth', { detail: { tab: 'login' } }));
      return;
    }
    window.location.href = 'payment.html';
  });
}

function shakeElement(el) {
  el.style.animation = 'none';
  void el.offsetHeight;
  el.style.animation = 'shake 0.35s ease';
  setTimeout(() => (el.style.animation = ''), 350);
}

function flashLimitNote() {
  const note = document.querySelector('.seat-limit-note');
  if (!note) return;
  note.style.color = 'var(--seat-booked)';
  note.style.fontWeight = '600';
  setTimeout(() => { note.style.color = ''; note.style.fontWeight = ''; }, 1200);
}

document.addEventListener('DOMContentLoaded', init);
