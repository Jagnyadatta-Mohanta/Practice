import { Storage } from './utils.js';
import { Header, Footer } from './layout.js';

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

  renderConfirmation({ movie, theater, seats, time, total, date, bookingId, format });
  animateCheckmark();
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

function animateCheckmark() {
  const path = document.querySelector('.confirm-check-path');
  if (path) {
    path.style.strokeDashoffset = '100';
    setTimeout(() => { path.style.transition = 'stroke-dashoffset 0.6s ease 0.4s'; path.style.strokeDashoffset = '0'; }, 50);
  }
}

document.addEventListener('DOMContentLoaded', init);
