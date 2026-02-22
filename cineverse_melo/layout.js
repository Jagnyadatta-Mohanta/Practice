import { Auth } from './utils.js';

let allMovies = [];

const Header = {

  async init() {
    this._bindScroll();
    this._bindHamburger();
    this._renderAuthArea();
    await this._loadMovies();
    this._buildSearch();

    window.addEventListener('cv:authchange', () => this._renderAuthArea());
    window.addEventListener('cv:openauth',   (e) => this._openAuthModal(e.detail?.tab || 'login'));
  },

  async _loadMovies() {
    try {
      const res = await fetch('data/movies.json');
      allMovies = await res.json();
    } catch { allMovies = []; }
  },

  _buildSearch() {
    const placeholder = document.querySelector('.header-search-placeholder');
    if (!placeholder) return;

    placeholder.innerHTML = `
      <div class="header-search-wrap" role="search">
        <svg class="header-search-icon" width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input type="search" class="header-search-input"
          placeholder="Search films..." autocomplete="off"
          aria-label="Search films" aria-expanded="false" aria-haspopup="listbox">
        <div class="header-search-dropdown" role="listbox" aria-label="Search suggestions" hidden></div>
      </div>
    `;

    const input    = placeholder.querySelector('.header-search-input');
    const dropdown = placeholder.querySelector('.header-search-dropdown');

    input.addEventListener('input',   () => this._onSearchInput(input, dropdown));
    input.addEventListener('focus',   () => { if (input.value.trim()) this._onSearchInput(input, dropdown); });
    input.addEventListener('keydown', e  => this._onSearchKey(e, dropdown));
    document.addEventListener('click', e => {
      if (!placeholder.contains(e.target)) this._closeDropdown(input, dropdown);
    });
  },

  _onSearchInput(input, dropdown) {
    const q = input.value.trim().toLowerCase();
    if (!q) { this._closeDropdown(input, dropdown); return; }

    const matches = allMovies
      .filter(m => m.title.toLowerCase().includes(q) || m.genre.some(g => g.toLowerCase().includes(q)))
      .slice(0, 6);

    if (!matches.length) {
      dropdown.innerHTML = `<div class="search-no-result">No films found</div>`;
      this._openDropdown(input, dropdown);
      return;
    }

    dropdown.innerHTML = matches.map(m => `
      <a class="search-suggestion" href="movie.html?id=${m.id}" role="option"
         data-id="${m.id}" tabindex="-1">
        <div class="search-sug-poster">
          <img src="${m.poster}" alt="" loading="lazy">
        </div>
        <div class="search-sug-info">
          <div class="search-sug-title">${this._highlight(m.title, q)}</div>
          <div class="search-sug-meta">${m.genre[0]} &nbsp;·&nbsp; ${m.duration}</div>
        </div>
        <div class="search-sug-rating">★ ${m.rating}</div>
      </a>
    `).join('');

    this._openDropdown(input, dropdown);
  },

  _onSearchKey(e, dropdown) {
    const items   = [...dropdown.querySelectorAll('.search-suggestion')];
    const current = dropdown.querySelector('.search-suggestion.focused');
    let idx = items.indexOf(current);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      idx = (idx + 1) % items.length;
      items.forEach(i => i.classList.remove('focused'));
      items[idx]?.classList.add('focused');
      items[idx]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      idx = (idx - 1 + items.length) % items.length;
      items.forEach(i => i.classList.remove('focused'));
      items[idx]?.classList.add('focused');
      items[idx]?.focus();
    } else if (e.key === 'Escape') {
      this._closeDropdown(e.target, dropdown);
    }
  },

  _openDropdown(input, dropdown)  { dropdown.hidden = false; input.setAttribute('aria-expanded', 'true');  },
  _closeDropdown(input, dropdown) { dropdown.hidden = true;  input.setAttribute('aria-expanded', 'false'); },

  _highlight(text, q) {
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(re, '<mark>$1</mark>');
  },

  _renderAuthArea() {
    const area = document.querySelector('.header-auth-placeholder');
    if (!area) return;

    const user = Auth.getCurrentUser();

    if (!user) {
      area.innerHTML = `
        <button class="btn btn-primary btn-sm header-login-btn" aria-label="Login or sign up">
          Login / Sign Up
        </button>`;
      area.querySelector('.header-login-btn').addEventListener('click', () => this._openAuthModal('login'));
      return;
    }

    const initials = Auth.getInitials(user.name);
    area.innerHTML = `
      <div class="header-user-wrap">
        <button class="header-avatar header-avatar-btn" aria-label="User menu" aria-expanded="false">
          ${initials}
        </button>
        <div class="header-user-dropdown" hidden>
          <div class="hud-name">${user.name}</div>
          <div class="hud-email">${user.email || ''}</div>
          <div class="hud-divider"></div>
          <a href="profile.html" class="hud-item">My Bookings</a>
          <a href="profile.html?tab=account" class="hud-item">Account</a>
          <div class="hud-divider"></div>
          <button class="hud-item hud-logout">Logout</button>
        </div>
      </div>`;

    const avatarBtn  = area.querySelector('.header-avatar-btn');
    const userDropdown = area.querySelector('.header-user-dropdown');

    avatarBtn.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = !userDropdown.hidden;
      userDropdown.hidden = isOpen;
      avatarBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    area.querySelector('.hud-logout').addEventListener('click', () => {
      Auth.logout();
    });

    document.addEventListener('click', e => {
      if (!area.contains(e.target)) userDropdown.hidden = true;
    }, { passive: true });
  },

  _openAuthModal(defaultTab = 'login') {
    if (document.getElementById('cv-auth-modal')) return;

    const modal = document.createElement('div');
    modal.id        = 'cv-auth-modal';
    modal.className = 'auth-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Login or Sign Up');

    modal.innerHTML = `
      <div class="auth-modal-card">
        <button class="auth-modal-close" aria-label="Close">&times;</button>

        <div class="auth-modal-logo">
          <div class="logo-mark" aria-hidden="true"></div>
          <span class="logo-text">CINEVERSE</span>
        </div>

        <div class="auth-tabs">
          <button class="auth-tab" data-tab="login">Login</button>
          <button class="auth-tab" data-tab="signup">Sign Up</button>
        </div>

        <div class="auth-panel" data-panel="login">
          <div class="input-group">
            <label class="input-label" for="auth-login-email">Email</label>
            <input type="email" id="auth-login-email" class="input-field" placeholder="you@email.com" autocomplete="email">
          </div>
          <div class="input-group" style="margin-top:16px">
            <label class="input-label" for="auth-login-pass">Password</label>
            <input type="password" id="auth-login-pass" class="input-field" placeholder="••••••••" autocomplete="current-password">
          </div>
          <p class="auth-error" id="auth-login-err" aria-live="polite"></p>
          <button class="btn btn-primary btn-full auth-submit-btn" style="margin-top:24px" data-action="login">Login</button>
        </div>

        <div class="auth-panel" data-panel="signup" hidden>
          <div class="input-group">
            <label class="input-label" for="auth-signup-name">Full Name</label>
            <input type="text" id="auth-signup-name" class="input-field" placeholder="Arjun Mehta" autocomplete="name">
          </div>
          <div class="input-group" style="margin-top:16px">
            <label class="input-label" for="auth-signup-email">Email</label>
            <input type="email" id="auth-signup-email" class="input-field" placeholder="you@email.com" autocomplete="email">
          </div>
          <div class="input-group" style="margin-top:16px">
            <label class="input-label" for="auth-signup-pass">Password</label>
            <input type="password" id="auth-signup-pass" class="input-field" placeholder="Min 6 characters" autocomplete="new-password">
          </div>
          <p class="auth-error" id="auth-signup-err" aria-live="polite"></p>
          <button class="btn btn-primary btn-full auth-submit-btn" style="margin-top:24px" data-action="signup">Create Account</button>
        </div>
      </div>`;

    document.body.appendChild(modal);

    const tabs   = modal.querySelectorAll('.auth-tab');
    const panels = modal.querySelectorAll('.auth-panel');
    const switchTab = (name) => {
      tabs.forEach(t   => t.classList.toggle('active', t.dataset.tab   === name));
      panels.forEach(p => p.hidden = p.dataset.panel !== name);
    };
    tabs.forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
    switchTab(defaultTab);

    modal.querySelectorAll('.auth-submit-btn').forEach(btn => {
      btn.addEventListener('click', () => this._handleAuthSubmit(btn.dataset.action, modal));
    });

    modal.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const active = modal.querySelector('.auth-panel:not([hidden])');
        active?.querySelector('.auth-submit-btn')?.click();
      }
    });

    const close = () => modal.remove();
    modal.querySelector('.auth-modal-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); }, { once: true });
  },

  _handleAuthSubmit(action, modal) {
    if (action === 'login') {
      const email = modal.querySelector('#auth-login-email').value;
      const pass  = modal.querySelector('#auth-login-pass').value;
      const err   = modal.querySelector('#auth-login-err');

      const result = Auth.login(email, pass);
      if (!result.ok) { err.textContent = result.error; return; }
      modal.remove();
    }

    if (action === 'signup') {
      const name  = modal.querySelector('#auth-signup-name').value;
      const email = modal.querySelector('#auth-signup-email').value;
      const pass  = modal.querySelector('#auth-signup-pass').value;
      const err   = modal.querySelector('#auth-signup-err');

      const result = Auth.signup(name, email, pass);
      if (!result.ok) { err.textContent = result.error; return; }
      modal.remove();
    }
  },

  _bindScroll() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const update = () => header.classList.toggle('scrolled', window.scrollY > 60);
    update();
    window.addEventListener('scroll', update, { passive: true });
  },

  _bindHamburger() {
    const btn = document.querySelector('.hamburger');
    const nav = document.querySelector('.header-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', !open);
      nav.classList.toggle('mobile-open', !open);
    });
  },
};

const Footer = {
  init() {
    const root = document.getElementById('site-footer-root');
    if (!root) return;

    root.innerHTML = `
<footer class="site-footer" role="contentinfo">
  <div class="footer-inner">

    <div class="footer-body">

      <!-- ── Main columns grid ── -->
      <div class="footer-grid">

        <!-- Brand column -->
        <div class="footer-brand">
          <a href="index.html" class="footer-logo" aria-label="Cineverse home">
            <div class="footer-logo-mark" aria-hidden="true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--void)" aria-hidden="true">
                <polygon points="5,3 19,12 5,21"/>
              </svg>
            </div>
            <span class="footer-logo-text">CINEVERSE</span>
          </a>
          <p class="footer-tagline">"Where every seat is the best seat in the house."</p>
          <div class="footer-social" aria-label="Social media links">
            <a href="#" class="footer-social-link" aria-label="Instagram">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
            </a>
            <a href="#" class="footer-social-link" aria-label="Facebook">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="#" class="footer-social-link" aria-label="X (Twitter)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" class="footer-social-link" aria-label="YouTube">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75,15.02 15.5,12 9.75,8.98" fill="currentColor" stroke="none"/></svg>
            </a>
          </div>
        </div>

        <!-- Explore column -->
        <div>
          <div class="footer-col-title">EXPLORE</div>
          <nav class="footer-links" aria-label="Explore links">
            <a href="index.html#now-showing" class="footer-link">Now Showing</a>
            <a href="index.html#coming-soon" class="footer-link">Coming Soon</a>
            <a href="index.html#trending"    class="footer-link">Trending</a>
            <a href="index.html#hollywood"   class="footer-link">Hollywood</a>
            <a href="index.html#bollywood"   class="footer-link">Bollywood</a>
            <a href="index.html#south"       class="footer-link">South Indian</a>
            <a href="booking.html"           class="footer-link">Find Cinemas</a>
          </nav>
        </div>

        <!-- Account column -->
        <div>
          <div class="footer-col-title">ACCOUNT</div>
          <nav class="footer-links" aria-label="Account links">
            <a href="profile.html"             class="footer-link">My Bookings</a>
            <a href="profile.html?tab=account" class="footer-link">Account Details</a>
            <a href="profile.html?tab=edit"    class="footer-link">Edit Profile</a>
            <button class="footer-link footer-link-btn" onclick="window.dispatchEvent(new CustomEvent('cv:openauth',{detail:{tab:'login'}}))">Login</button>
            <button class="footer-link footer-link-btn" onclick="window.dispatchEvent(new CustomEvent('cv:openauth',{detail:{tab:'signup'}}))">Sign Up Free</button>
          </nav>
        </div>

        <!-- Contact column -->
        <div>
          <div class="footer-col-title">CONTACT</div>
          <address class="footer-contact" aria-label="Contact information">
            <div class="footer-contact-row">
              <svg class="footer-contact-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>IGIT, Sarang,<br>Dhenkanal, Odisha 759146</span>
            </div>
            <div class="footer-contact-row">
              <svg class="footer-contact-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.93a16 16 0 006.16 6.16l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              <a href="tel:+918001234567" class="footer-contact-link">+91 800 123 4567</a>
            </div>
            <div class="footer-contact-row">
              <svg class="footer-contact-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <a href="mailto:support@cineverse.in" class="footer-contact-link">support@cineverse.in</a>
            </div>
          </address>
        </div>

      </div><!-- /footer-grid -->

      <!-- ── Feedback panel — right side ── -->
      <div class="footer-feedback">
        <div class="footer-feedback-inner">
          <div class="footer-col-title">FEEDBACK</div>
          <p class="footer-feedback-prompt">Tell us how we can improve your cinema experience.</p>
          <textarea
            class="footer-feedback-textarea"
            placeholder="Share your thoughts..."
            aria-label="Feedback message"
            rows="3"
          ></textarea>
          <button class="footer-feedback-btn" aria-label="Send feedback">
            SEND
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>

    </div><!-- /footer-body -->

    <!-- ── Bottom bar ── -->
    <div class="footer-bottom">
      <div class="footer-copyright">&copy; 2026 CINEVERSE. All rights reserved.</div>
      <nav class="footer-legal" aria-label="Legal links">
        <a href="#" class="footer-legal-link">Privacy Policy</a>
        <a href="#" class="footer-legal-link">Terms of Service</a>
        <a href="#" class="footer-legal-link">Cookies</a>
      </nav>
    </div>

  </div>
</footer>`;

    // Feedback send button handler
    const fbBtn = root.querySelector('.footer-feedback-btn');
    const fbArea = root.querySelector('.footer-feedback-textarea');
    if (fbBtn && fbArea) {
      fbBtn.addEventListener('click', () => {
        const msg = fbArea.value.trim();
        if (!msg) { fbArea.focus(); return; }
        fbArea.value = '';
        fbBtn.textContent = 'Sent!';
        setTimeout(() => {
          fbBtn.innerHTML = 'SEND <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
        }, 2000);
      });
    }
  }
};

import { Storage } from './utils.js';

function createMovieCard(movie) {
  const card = document.createElement('div');
  card.className = 'movie-card';
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', movie.title);

  card.innerHTML = `
    <div class="movie-card-poster">
      <img src="${movie.poster}" alt="${movie.title} poster" loading="lazy">
      <div class="movie-card-overlay" aria-hidden="true"></div>
      <div class="movie-card-rating" aria-label="Rating ${movie.rating} out of 10">
        ★ ${movie.rating}
      </div>
      <div class="movie-card-cert">${movie.certificate}</div>
      <div class="movie-card-actions">
        <button class="movie-card-book-btn">Book Now</button>
      </div>
    </div>
    <div class="movie-card-info">
      <div class="movie-card-genre">${movie.genre[0].toUpperCase()}</div>
      <h3 class="movie-card-title">${movie.title}</h3>
      <div class="movie-card-meta">
        <span>${movie.duration}</span>
        <span class="movie-card-meta-sep" aria-hidden="true">·</span>
        <span>${movie.certificate}</span>
      </div>
    </div>
  `;

  card.addEventListener('click', (e) => {
    if (e.target.classList.contains('movie-card-book-btn')) {
      e.stopPropagation();
      Storage.setMovie(movie);
      window.location.href = `booking.html?movie=${movie.id}`;
    } else {
      Storage.setMovie(movie);
      window.location.href = `movie.html?id=${movie.id}`;
    }
  });

  return card;
}

function buildScrollSection(cfg, moviesArg, link = null) {
  // Accept either buildScrollSection(cfg_object) or buildScrollSection(title, movies, link)
  let title, subtitle, movies, id, variant;
  if (cfg && typeof cfg === 'object' && !Array.isArray(cfg) && cfg.movies) {
    title    = cfg.title;
    subtitle = cfg.subtitle || '';
    movies   = cfg.movies;
    id       = cfg.id || '';
    variant  = cfg.variant || '';
  } else {
    title    = cfg;
    movies   = moviesArg;
    subtitle = '';
    id       = '';
    variant  = '';
  }

  if (!movies || !movies.length) return document.createDocumentFragment();

  const section = document.createElement('section');
  section.className = `scroll-section${variant ? ' scroll-section--' + variant : ''}`;
  section.setAttribute('role', 'region');
  section.setAttribute('aria-label', title);
  if (id) section.dataset.sectionId = id;

  const header = document.createElement('div');
  header.className = 'scroll-header';
  header.innerHTML = `
    <div class="scroll-title-wrap">
      <h2 class="scroll-title">${title}</h2>
      ${subtitle ? `<span class="scroll-subtitle">${subtitle}</span>` : ''}
    </div>
    <div class="scroll-controls" role="group" aria-label="Scroll controls">
      <button class="scroll-arrow scroll-left" aria-label="Scroll left" disabled>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button class="scroll-arrow scroll-right" aria-label="Scroll right">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  `;
  section.appendChild(header);

  const container = document.createElement('div');
  container.className = 'scroll-container';

  const track = document.createElement('div');
  track.className = 'scroll-track';
  track.setAttribute('role', 'list');

  movies.forEach(movie => {
    track.appendChild(createMovieCard(movie));
  });

  container.appendChild(track);
  section.appendChild(container);

  const leftBtn  = section.querySelector('.scroll-left');
  const rightBtn = section.querySelector('.scroll-right');

  const updateButtons = () => {
    leftBtn.disabled  = track.scrollLeft <= 0;
    rightBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 5;
  };

  leftBtn.addEventListener('click', () => {
    track.scrollBy({ left: -400, behavior: 'smooth' });
    setTimeout(updateButtons, 300);
  });

  rightBtn.addEventListener('click', () => {
    track.scrollBy({ left: 400, behavior: 'smooth' });
    setTimeout(updateButtons, 300);
  });

  track.addEventListener('scroll', updateButtons, { passive: true });
  updateButtons();

  return section;
}

export { Header, Footer, buildScrollSection };
