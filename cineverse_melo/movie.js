import { Storage, Auth } from './utils.js';
import { Header, Footer, buildScrollSection } from './layout.js';

async function init() {
  await Header.init();
  Footer.init();

  const params = new URLSearchParams(window.location.search);
  const id     = parseInt(params.get('id')) || 1;

  let movies = [];
  try {
    const res = await fetch('data/movies.json');
    movies    = await res.json();
  } catch { return; }

  const movie = movies.find(m => m.id === id) || movies[0];
  if (!movie) return;

  Storage.setMovie(movie);
  renderMovie(movie);
  buildRecommendations(movie, movies); // Part 8
  bindStickyBehavior(movie);
  scrollReveal();
}

// ── Render movie detail ────────────────────────────────────────
function renderMovie(m) {
  const q  = s => document.querySelector(s);
  const sa = (s, v) => { const el = q(s); if (el) el.textContent = v; };

  // Banner
  const blur = q('.movie-banner-blur');
  if (blur) blur.style.backgroundImage = `url('${m.banner}')`;

  const poster = q('.movie-detail-poster img');
  if (poster) { poster.src = m.poster; poster.alt = m.title; }

  sa('.movie-detail-title',   m.title);
  sa('.movie-detail-tagline', m.tagline);
  sa('.hero-stat-rating',     `★ ${m.rating}`);
  sa('.hero-stat-duration',   m.duration);
  sa('.hero-stat-cert',       m.certificate);
  sa('.movie-synopsis',       m.description);

  // Genre badges
  const badgesEl = q('.movie-detail-badges');
  if (badgesEl) {
    badgesEl.innerHTML =
      m.genre.map(g => `<span class="badge badge-gold">${g}</span>`).join('') +
      `<span class="badge badge-cert">${m.certificate}</span>`;
  }

  // Stats
  const langEl = q('.hero-stat-lang');
  if (langEl) langEl.textContent = m.language.slice(0, 2).join(' / ');

  // Cast
  const castTrack = q('.cast-scroll');
  if (castTrack && m.cast?.length) {
    castTrack.innerHTML = m.cast.map(c => `
      <div class="cast-card" role="listitem">
        <div class="cast-avatar"><img src="${c.img}" alt="${c.name}" loading="lazy"></div>
        <div class="cast-name">${c.name.split(' ')[0]}<br>${c.name.split(' ').slice(1).join(' ')}</div>
        <div class="cast-role">${c.role}</div>
      </div>`).join('');
  }

  // Director
  const dirEl = q('.movie-director-val');
  if (dirEl) dirEl.textContent = m.director || '—';

  // Info panel
  sa('.movie-info-price-val', `₹${m.price.standard}`);

  const infoRows = q('.movie-info-rows');
  if (infoRows) {
    infoRows.innerHTML = [
      ['Director',    m.director || '—'],
      ['Duration',    m.duration],
      ['Language',    m.language.join(', ')],
      ['Certificate', m.certificate],
      ['Release',     new Date(m.releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })],
      ['Format',      m.price.imax ? 'IMAX / Premium / Standard' : 'Premium / Standard'],
    ].map(([k, v]) => `
      <div class="movie-info-row">
        <span class="movie-info-key">${k}</span>
        <span class="movie-info-val">${v}</span>
      </div>`).join('');
  }

  // Book Now buttons
  document.querySelectorAll('.book-now-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      Storage.setMovie(m);
      window.location.href = `booking.html?movie=${m.id}`;
    });
  });

  // Sticky CTA
  sa('.movie-sticky-cta-name',  m.title);
  sa('.movie-sticky-cta-price', `From ₹${m.price.standard}`);

  document.title = `${m.title} — CINEVERSE`;
}

// ──  Recommendations ────────────────────────────────────
function buildRecommendations(currentMovie, allMovies) {
  const wrap = document.querySelector('.movie-recommendations');
  if (!wrap) return;

  const scored = allMovies
    .filter(m => m.id !== currentMovie.id && !m.comingSoon)
    .map(m => ({
      movie:   m,
      overlap: m.genre.filter(g => currentMovie.genre.includes(g)).length,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.movie.rating - a.movie.rating)
    .slice(0, 8)
    .map(({ movie }) => movie);

  if (!scored.length) { wrap.hidden = true; return; }

  const primaryGenre = currentMovie.genre[0] || 'Similar';
  const section = buildScrollSection({
    id:       'recommendations',
    title:    'You May Also Like',
    subtitle: `More ${primaryGenre} films`,
    movies:   scored,
  });

  wrap.appendChild(section);
}

// ── Sticky CTA bar ─────────────────────────────────────────────
function bindStickyBehavior(movie) {
  const cta = document.querySelector('.movie-sticky-cta');
  if (!cta) return;

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 350;
    cta.style.opacity       = show ? '1' : '0';
    cta.style.transform     = show ? 'translateY(0)' : 'translateY(16px)';
    cta.style.pointerEvents = show ? 'auto' : 'none';
  }, { passive: true });

  cta.querySelector('.book-now-btn')?.addEventListener('click', () => {
    Storage.setMovie(movie);
    window.location.href = `booking.html?movie=${movie.id}`;
  });
}

// ── Scroll reveal ──────────────────────────────────────────────
function scrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.anim-fade-up').forEach(el => obs.observe(el));
}

document.addEventListener('DOMContentLoaded', init);
