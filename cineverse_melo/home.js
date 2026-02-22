import { Storage } from './utils.js';
import { Header, Footer, buildScrollSection } from './layout.js';

let allMovies        = [];
let filteredMovies   = [];
let currentHeroIndex = 0;
let heroTimer        = null;
let isTransitioning  = false;

const activeFilters = { category: 'All', genre: 'All', language: 'All' };

async function init() {
  await Header.init();
  Footer.init();
  await loadMovies();
  buildHero();
  startHeroAutoplay();
  buildFilterBar();
  buildSections(allMovies);
  bindScrollReveal();
  bindNavScrollLinks();
}

async function loadMovies() {
  try {
    const res = await fetch('./data/movies.json');
    allMovies = await res.json();
  } catch {
    allMovies = getFallbackMovies();
  }
  filteredMovies = [...allMovies];
}

function buildHero() {
  const heroMovies = allMovies.filter(m => !m.comingSoon).slice(0, 5);
  if (!heroMovies.length) return;
  const bgWrap  = document.querySelector('.hero-bg');
  const dotWrap = document.querySelector('.hero-nav');
  if (!bgWrap || !dotWrap) return;
  bgWrap.innerHTML  = '';
  dotWrap.innerHTML = '';
  heroMovies.forEach((m, i) => {
    const bg = document.createElement('div');
    bg.className = `hero-bg-img ${i === 0 ? 'visible' : 'entering'}`;
    bg.dataset.index = i;
    bg.style.backgroundImage = `url('${m.banner}')`;
    bgWrap.appendChild(bg);
    const dot = document.createElement('button');
    dot.className = `hero-dot${i === 0 ? ' active' : ''}`;
    dot.setAttribute('aria-label', `Go to ${m.title}`);
    dot.innerHTML = `<span class="hero-dot-label">${m.title.split(':')[0]}</span><div class="hero-dot-line"></div>`;
    dot.addEventListener('click', () => goToHero(i, heroMovies));
    dotWrap.appendChild(dot);
  });
  updateHeroContent(0, heroMovies);
}

function updateHeroContent(idx, heroMovies) {
  const m = heroMovies[idx];
  if (!m) return;
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val; };
  set('.hero-genre-badge',   m.genre[0]);
  set('.hero-cert',          m.certificate);
  set('.hero-title',         m.title);
  set('.hero-tagline',       m.tagline);
  set('.hero-stat-rating',   `★ ${m.rating}`);
  set('.hero-stat-duration', m.duration);
  const bookBtn = document.querySelector('.hero-book-btn');
  if (bookBtn) {
    bookBtn.onclick = () => { Storage.setMovie(m); window.location.href = `movie.html?id=${m.id}`; };
  }
  document.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
}

function goToHero(idx, heroMovies) {
  if (isTransitioning || idx === currentHeroIndex) return;
  isTransitioning = true;
  const imgs    = document.querySelectorAll('.hero-bg-img');
  const current = imgs[currentHeroIndex];
  const next    = imgs[idx];
  current?.classList.replace('visible', 'leaving');
  next?.classList.replace('entering', 'visible');
  setTimeout(() => { current?.classList.replace('leaving', 'entering'); isTransitioning = false; }, 1200);
  currentHeroIndex = idx;
  updateHeroContent(idx, heroMovies);
  resetHeroTimer(heroMovies);
}

function startHeroAutoplay() {
  const heroMovies = allMovies.filter(m => !m.comingSoon).slice(0, 5);
  heroTimer = setInterval(() => goToHero((currentHeroIndex + 1) % heroMovies.length, heroMovies), 6000);
}

function resetHeroTimer(heroMovies) {
  clearInterval(heroTimer);
  heroTimer = setInterval(() => goToHero((currentHeroIndex + 1) % heroMovies.length, heroMovies), 6000);
}

function buildFilterBar() {
  const container = document.querySelector('.filter-bar-placeholder');
  if (!container) return;
  const genres    = ['All', ...new Set(allMovies.flatMap(m => m.genre))].sort();
  const languages = ['All', ...new Set(allMovies.flatMap(m => m.language))].sort();
  container.innerHTML = `
    <div class="filter-bar" role="search" aria-label="Filter films">
      <div class="filter-bar-inner">
        <div class="filter-group" role="group" aria-label="Category">
          ${['All', 'Hollywood', 'Bollywood', 'South'].map(c => `
            <button class="filter-chip ${c === 'All' ? 'active' : ''}" data-filter="category" data-value="${c}">${c}</button>
          `).join('')}
        </div>
        <div class="filter-divider" aria-hidden="true"></div>
        <div class="filter-select-wrap">
          <label class="filter-select-label" for="filter-genre">Genre</label>
          <select class="filter-select" id="filter-genre" aria-label="Filter by genre">
            ${genres.map(g => `<option value="${g}">${g}</option>`).join('')}
          </select>
        </div>
        <div class="filter-select-wrap">
          <label class="filter-select-label" for="filter-lang">Language</label>
          <select class="filter-select" id="filter-lang" aria-label="Filter by language">
            ${languages.map(l => `<option value="${l}">${l}</option>`).join('')}
          </select>
        </div>
        <button class="filter-reset-btn" aria-label="Reset all filters">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.51"/>
          </svg>
          Reset
        </button>
        <span class="filter-count" aria-live="polite"></span>
      </div>
    </div>`;
  container.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('[data-filter="category"]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilters.category = btn.dataset.value;
      applyFilters();
    });
  });
  container.querySelector('#filter-genre').addEventListener('change', e => { activeFilters.genre = e.target.value; applyFilters(); });
  container.querySelector('#filter-lang').addEventListener('change',  e => { activeFilters.language = e.target.value; applyFilters(); });
  container.querySelector('.filter-reset-btn').addEventListener('click', () => {
    activeFilters.category = activeFilters.genre = activeFilters.language = 'All';
    container.querySelectorAll('.filter-chip').forEach(b => b.classList.toggle('active', b.dataset.value === 'All'));
    container.querySelector('#filter-genre').value = 'All';
    container.querySelector('#filter-lang').value  = 'All';
    applyFilters();
  });
  applyFilters();
}

function applyFilters() {
  const { category, genre, language } = activeFilters;
  filteredMovies = allMovies.filter(m => {
    const catOk   = category === 'All' || m.category === category;
    const genreOk = genre    === 'All' || m.genre.includes(genre);
    const langOk  = language === 'All' || m.language.includes(language);
    return catOk && genreOk && langOk;
  });
  const countEl = document.querySelector('.filter-count');
  if (countEl) {
    const n = filteredMovies.filter(m => !m.comingSoon).length;
    countEl.textContent = `${n} film${n !== 1 ? 's' : ''}`;
  }
  buildSections(filteredMovies);
}

function buildSections(movies) {
  const wrap = document.querySelector('.movie-sections-wrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const nowShowing = movies.filter(m => !m.comingSoon);
  const coming     = movies.filter(m => m.comingSoon);
  const sections = [
    { id: 'hollywood',   title: 'Hollywood',      subtitle: 'International Hits',    movies: nowShowing.filter(m => m.category === 'Hollywood') },
    { id: 'bollywood',   title: 'Bollywood',      subtitle: 'Desi Blockbusters',     movies: nowShowing.filter(m => m.category === 'Bollywood') },
    { id: 'south',       title: 'South',          subtitle: 'Regional Powerhouses',  movies: nowShowing.filter(m => m.category === 'South') },
    { id: 'trending',    title: 'Trending Now',   subtitle: 'Most Popular',          movies: nowShowing.filter(m => m.trending) },
    { id: 'latest',      title: 'Latest Releases',subtitle: 'Just Arrived',          movies: [...nowShowing].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)).slice(0, 8) },
    { id: 'coming-soon', title: 'Coming Soon',    subtitle: 'Reserve Your Seats',    movies: coming, variant: 'coming-soon' },
  ];
  let hasContent = false;
  sections.forEach(cfg => {
    if (!cfg.movies.length) return;
    hasContent = true;
    wrap.appendChild(buildScrollSection(cfg));
  });
  if (!hasContent) {
    wrap.innerHTML = `
      <div class="filter-empty" role="status">
        <div class="filter-empty-icon">🎬</div>
        <p class="filter-empty-msg">No films match your filters.</p>
        <button class="btn btn-secondary" onclick="document.querySelector('.filter-reset-btn')?.click()">Clear Filters</button>
      </div>`;
  }
}

function bindScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.anim-fade-up').forEach(el => obs.observe(el));
}

function bindNavScrollLinks() {
  document.querySelectorAll('.nav-scroll-link').forEach(link => {
    link.addEventListener('click', e => {
      const hash = link.getAttribute('href');
      if (!hash.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(`[data-section-id="${hash.slice(1)}"]`);
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 140, behavior: 'smooth' });
    });
  });
}

function getFallbackMovies() {
  return [{
    id: 1, title: "Dune: Messiah", tagline: "The prophecy was never meant to be fulfilled.",
    category: "Hollywood", genre: ["Sci-Fi", "Epic"], trending: true, comingSoon: false,
    rating: 9.1, duration: "2h 42m", certificate: "UA", language: ["English", "Hindi"],
    description: "Paul Atreides struggles against destiny.",
    price: { standard: 380, premium: 480, imax: 620 },
    poster: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=500&q=90",
    banner: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1600&q=95",
    cast: [], director: "Denis Villeneuve", releaseDate: "2025-03-14"
  }];
}

document.addEventListener('DOMContentLoaded', init);
