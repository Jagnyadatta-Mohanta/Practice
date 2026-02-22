import { Storage, Auth } from './utils.js';
import { Header, Footer } from './layout.js';

let movies = [], theaters = [], cities = [];
let selectedDate = 0;
let selectedTime = null;

// ── INIT ──────────────────────────────────────────────────────
async function init() {
  await Header.init();
  Footer.init();
  await loadData();

  // Handle URL param (coming from movie.html "Book Now")
  const params  = new URLSearchParams(window.location.search);
  const movieId = parseInt(params.get('movie'));
  if (movieId) {
    const m = movies.find(x => x.id === movieId);
    if (m) Storage.setMovie(m);
  }

  const movie = Storage.getMovie();
  const lang  = Storage.getLanguage();

  renderMovieChip(movie);
  buildDateStrip();
  buildFilters(movie, lang);
  renderTheaters(theaters, movie);
  updateResultsBar(movie, lang, selectedDate);
}

// ── DATA ──────────────────────────────────────────────────────
async function loadData() {
  try {
    [movies, theaters, cities] = await Promise.all([
      fetch('./data/movies.json').then(r => r.json()),
      fetch('./data/theaters.json').then(r => r.json()),
      fetch('./data/cities.json').then(r => r.json()),
    ]);
  } catch {
    theaters = getFallbackTheaters();
    movies   = [];
  }
}

// ── MOVIE CHIP ────────────────────────────────────────────────
function renderMovieChip(movie) {
  const chip = document.querySelector('.booking-movie-chip-val');
  if (chip) chip.textContent = movie?.title || 'All Films';
}

// ── DATE STRIP ────────────────────────────────────────────────
function buildDateStrip() {
  const strip = document.querySelector('.booking-date-strip');
  if (!strip) return;

  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  }).forEach((d, i) => {
    const pill = document.createElement('button');
    pill.className = `date-pill${i === 0 ? ' active' : ''}`;
    pill.setAttribute('aria-label', `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`);
    pill.innerHTML = `
      <div class="date-pill-day">${days[d.getDay()]}</div>
      <div class="date-pill-num">${d.getDate()}</div>
      <div class="date-pill-mon">${months[d.getMonth()]}</div>
    `;
    pill.addEventListener('click', () => {
      document.querySelectorAll('.date-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      selectedDate = i;
      Storage.setDate(d.toISOString());
      updateResultsBar(Storage.getMovie(), Storage.getLanguage(), i);
    });
    strip.appendChild(pill);
  });
}

// ── FILTERS ───────────────────────────────────────────────────
function buildFilters(movie, lang) {
  // Language
  const langSel = document.querySelector('#lang-select');
  if (langSel && movie) {
    langSel.innerHTML = (movie.language || ['English']).map(l =>
      `<option value="${l}" ${l === lang ? 'selected' : ''}>${l}</option>`
    ).join('');
    langSel.addEventListener('change', e => {
      Storage.setLanguage(e.target.value);
      updateResultsBar(Storage.getMovie(), e.target.value, selectedDate);
    });
  }

  // City search — filter theaters by city
  const cityInput = document.querySelector('#city-input');
  if (cityInput) {
    cityInput.addEventListener('input', runFilter);
  }

  // Theater name search
  const theaterInput = document.querySelector('#theater-input');
  if (theaterInput) {
    theaterInput.addEventListener('input', runFilter);
  }
}

function runFilter() {
  const cityQ    = (document.querySelector('#city-input')?.value    || '').toLowerCase().trim();
  const theaterQ = (document.querySelector('#theater-input')?.value || '').toLowerCase().trim();

  const filtered = theaters.filter(t => {
    const cityMatch    = !cityQ    || t.city.toLowerCase().includes(cityQ);
    const theaterMatch = !theaterQ || t.name.toLowerCase().includes(theaterQ);
    return cityMatch && theaterMatch;
  });

  renderTheaters(filtered, Storage.getMovie());
}

// ── RESULTS BAR ───────────────────────────────────────────────
function updateResultsBar(movie, lang, dateIdx) {
  const el = document.querySelector('.booking-results-summary');
  if (!el) return;
  const d = new Date();
  d.setDate(d.getDate() + dateIdx);
  const dateStr = d.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });
  el.innerHTML = `Showing <strong>${theaters.length}</strong> cinema${theaters.length !== 1 ? 's' : ''} for <strong>${movie?.title || 'all films'}</strong> · <strong>${lang}</strong> · <strong>${dateStr}</strong>`;
}

// ── THEATER CARDS ─────────────────────────────────────────────
function renderTheaters(list, movie) {
  const container = document.querySelector('.theater-list');
  if (!container) return;
  container.innerHTML = '';

  if (!list.length) {
    container.innerHTML = `
      <div class="theater-empty">
        <p>No cinemas found. Try a different city or theater name.</p>
      </div>`;
    return;
  }

  list.forEach((t, i) => {
    const card = document.createElement('div');
    card.className = 'theater-card';
    card.style.animationDelay = `${i * 0.06}s`;
    card.dataset.theaterId = t.id;

    const availClass = t.availability || 'available';
    const availText  = {
      available: 'Available',
      filling:   'Filling Fast',
      almost:    'Almost Full'
    }[availClass] || 'Available';

    card.innerHTML = `
      <div class="theater-card-header">
        <div class="theater-card-left">
          <div class="theater-name">${t.name}</div>
          <div class="theater-location">📍 ${t.location}</div>
          <div class="format-pills">
            ${t.formats.map(f => `<span class="format-pill">${f}</span>`).join('')}
          </div>
        </div>
        <div class="theater-avail-badge ${availClass}">
          <span class="theater-avail-dot"></span>
          ${availText}
        </div>
      </div>

      <div class="theater-card-body">
        <div class="timing-chips-row" role="group" aria-label="Showtimes for ${t.name}">
          ${t.timings.map(time => `
            <button class="timing-chip" data-time="${time}" aria-label="Select ${time}">${time}</button>
          `).join('')}
        </div>

        <div class="theater-card-actions">
          <button class="theater-book-btn btn btn-primary btn-sm" data-theater-id="${t.id}">
            Choose Seats
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    // Timing chips — clicking one deselects all others within this card
    card.querySelectorAll('.timing-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        card.querySelectorAll('.timing-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        selectedTime = chip.dataset.time;
        Storage.setShowtime(selectedTime);
      });
    });

    // Choose Seats button
    card.querySelector('.theater-book-btn').addEventListener('click', () => {
      // Auto-select first showtime if none picked
      if (!card.querySelector('.timing-chip.selected')) {
        card.querySelector('.timing-chip')?.click();
      }
      Storage.setTheater(t);
      window.location.href = 'seats.html';
    });

    container.appendChild(card);
  });
}

// ── FALLBACK DATA ─────────────────────────────────────────────
function getFallbackTheaters() {
  return [
    { id: 1, name: 'IMAX PVR Prestige',   city: 'Delhi',     location: 'Connaught Place, New Delhi', formats: ['IMAX','Premium','Standard'], timings: ['10:30 AM','1:45 PM','5:00 PM','8:30 PM','11:45 PM'], availability: 'available' },
    { id: 2, name: 'Cinepolis Luxe',       city: 'Hyderabad', location: 'Banjara Hills, Hyderabad',   formats: ['Premium','Standard'],        timings: ['11:00 AM','2:30 PM','6:15 PM','9:45 PM'],           availability: 'filling'   },
    { id: 3, name: "PVR Director's Cut",   city: 'Mumbai',    location: 'Juhu, Mumbai',               formats: ['Premium','Standard'],        timings: ['10:00 AM','1:15 PM','4:30 PM','7:45 PM'],           availability: 'almost'    },
    { id: 4, name: 'Inox Insignia',        city: 'Bengaluru', location: 'Koramangala, Bengaluru',     formats: ['IMAX','Premium','Standard'], timings: ['12:00 PM','3:30 PM','7:00 PM','10:30 PM'],          availability: 'available' },
  ];
}

document.addEventListener('DOMContentLoaded', init);
