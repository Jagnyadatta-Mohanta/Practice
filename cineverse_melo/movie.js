import { Storage } from './utils.js';
import { Header, Footer, buildScrollSection } from './layout.js';

async function init() {
  await Header.init();
  Footer.init();

  const id = parseInt(new URLSearchParams(window.location.search).get('id')) || 1;
  let movies = [];
  try {
    const res = await fetch('data/movies.json');
    movies    = await res.json();
  } catch { return; }

  const movie = movies.find(m => m.id === id) || movies[0];
  if (!movie) return;

  Storage.setMovie(movie);
  renderMovie(movie);
  buildRecommendations(movie, movies);
  bindStickyBehavior(movie);
  scrollReveal();
}

function renderMovie(m) {
  const q  = s => document.querySelector(s);
  const sa = (s, v) => { const el = q(s); if (el) el.textContent = v; };

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

  const badgesEl = q('.movie-detail-badges');
  if (badgesEl) {
    badgesEl.innerHTML =
      m.genre.map(g => `<span class="badge badge-gold">${g}</span>`).join('') +
      `<span class="badge badge-cert">${m.certificate}</span>`;
  }

  const langEl = q('.hero-stat-lang');
  if (langEl) langEl.textContent = m.language.slice(0, 2).join(' / ');

  const castTrack = q('.cast-scroll');
  if (castTrack && m.cast?.length) {
    castTrack.innerHTML = m.cast.map(c => `
      <div class="cast-card" role="listitem">
        <div class="cast-avatar"><img src="${c.img}" alt="${c.name}" loading="lazy"></div>
        <div class="cast-name">${c.name.split(' ')[0]}<br>${c.name.split(' ').slice(1).join(' ')}</div>
        <div class="cast-role">${c.role}</div>
      </div>`).join('');
  }

  const dirEl = q('.movie-director-val');
  if (dirEl) dirEl.textContent = m.director || '—';

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

  document.querySelectorAll('.book-now-btn').forEach(btn => {
    btn.addEventListener('click', () => { Storage.setMovie(m); window.location.href = `booking.html?movie=${m.id}`; });
  });

  sa('.movie-sticky-cta-name',  m.title);
  sa('.movie-sticky-cta-price', `From ₹${m.price.standard}`);
  document.title = `${m.title} — CINEVERSE`;
}

function buildRecommendations(currentMovie, allMovies) {
  const wrap = document.querySelector('.movie-recommendations');
  if (!wrap) return;
  const scored = allMovies
    .filter(m => m.id !== currentMovie.id && !m.comingSoon)
    .map(m => ({ movie: m, overlap: m.genre.filter(g => currentMovie.genre.includes(g)).length }))
    .filter(({ overlap }) => overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.movie.rating - a.movie.rating)
    .slice(0, 8)
    .map(({ movie }) => movie);
  if (!scored.length) { wrap.hidden = true; return; }
  wrap.appendChild(buildScrollSection({
    id: 'recommendations', title: 'You May Also Like',
    subtitle: `More ${currentMovie.genre[0] || 'Similar'} films`, movies: scored,
  }));
}

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
