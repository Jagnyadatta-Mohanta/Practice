import { Storage } from './utils.js';
import { Header, Footer } from './layout.js';

let _bookingData = {};

function init() {
  Header.init();
  Footer.init();

  const history   = Storage.getHistory();
  const latest    = history[0] || {};
  const booking   = Storage.getBooking();

  const movie     = latest.movie    || Storage.getMovie();
  const theater   = latest.theater  || Storage.getTheater();
  const seats     = latest.seats    || Storage.getSeats();
  const time      = latest.time     || Storage.getShowtime();
  const total     = latest.total    || 0;
  const date      = latest.date     || Storage.getDate();
  const bookingId = latest.id       || booking.bookingId || Storage.generateBookingId();
  const format    = latest.format   || Storage.getFormat() || 'Standard';

  _bookingData = { movie, theater, seats, time, total, date, bookingId, format };

  renderConfirmation(_bookingData);
  animateCheckmark();
  bindDownloadBtn();
  setTimeout(() => Storage.clearBooking(), 300);
}

function renderConfirmation({ movie, theater, seats, time, total, date, bookingId, format }) {
  const set = (sel, val, fallback = '—') => {
    const el = document.querySelector(sel);
    if (el) el.textContent = val || fallback;
  };
  set('.confirm-booking-id',   bookingId);
  set('.confirm-movie-val',    movie?.title);
  set('.confirm-theater-val',  theater?.name);
  set('.confirm-location-val', theater?.location);
  set('.confirm-time-val',     time ? `${time} · ${format}` : null);
  set('.confirm-seats-val',    seats?.length ? seats.join(', ') : null);
  set('.confirm-total-val',    total ? `₹${total}` : null);

  const displayDate = date
    ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  set('.confirm-date-val', displayDate);

  const seatCountEl = document.querySelector('.confirm-seat-count');
  if (seatCountEl && seats?.length) {
    seatCountEl.textContent = `${seats.length} seat${seats.length !== 1 ? 's' : ''}`;
  }
}

function bindDownloadBtn() {
  document.getElementById('download-ticket-btn')?.addEventListener('click', () => openTicketModal(_bookingData));
  document.getElementById('close-ticket-modal-btn')?.addEventListener('click', closeTicketModal);
  document.getElementById('print-ticket-btn')?.addEventListener('click', () => {
    closeTicketModal();
    showToast('🎟 Ticket downloaded successfully!');
  });
  document.getElementById('ticket-modal')?.addEventListener('click', e => {
    if (e.target === document.getElementById('ticket-modal')) closeTicketModal();
  });
}

function openTicketModal({ movie, theater, seats, time, total, date, bookingId, format }) {
  const modal = document.getElementById('ticket-modal');
  if (!modal) return;

  const set = (sel, val) => { const el = modal.querySelector(sel); if (el) el.textContent = val || '—'; };
  set('.confirm-booking-id-print', bookingId);
  set('.ticket-modal-movie',       movie?.title);
  set('.ticket-theater',           theater?.name);
  set('.ticket-time',              time ? `${time} · ${format}` : null);
  set('.ticket-seats',             seats?.length ? seats.join(', ') : null);
  set('.ticket-total',             total ? `₹${total}` : null);

  const displayDate = date
    ? new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  set('.ticket-date', displayDate);

  const poster = modal.querySelector('.ticket-modal-poster');
  if (poster && movie?.poster) { poster.src = movie.poster; poster.alt = movie.title || ''; }

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeTicketModal() {
  const modal = document.getElementById('ticket-modal');
  if (modal) modal.hidden = true;
  document.body.style.overflow = '';
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = `
    position:fixed;bottom:32px;left:50%;transform:translateX(-50%) translateY(20px);
    background:var(--surface);border:1px solid var(--gold);color:var(--text-primary);
    padding:14px 24px;border-radius:40px;font-size:14px;font-weight:500;
    box-shadow:0 8px 32px rgba(0,0,0,0.4),0 0 0 1px rgba(201,168,76,0.2);
    z-index:99999;opacity:0;transition:all 0.3s var(--ease-out);white-space:nowrap;
  `;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    t.style.opacity = '0'; t.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

function animateCheckmark() {
  const path = document.querySelector('.confirm-check-path');
  if (path) {
    path.style.strokeDashoffset = '100';
    setTimeout(() => { path.style.transition = 'stroke-dashoffset 0.6s ease 0.4s'; path.style.strokeDashoffset = '0'; }, 50);
  }
}

document.addEventListener('DOMContentLoaded', init);
