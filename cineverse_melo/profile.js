import { Storage, Auth } from './utils.js';
import { Header, Footer } from './layout.js';

// ── Init ───────────────────────────────────────────────────────
function init() {
  Header.init();
  Footer.init();

  populateProfileHeader();
  setupTabs();
  renderHistory();
  setupAccountTab();
  setupEditProfileTab();

  // Deep-link via ?tab=account or ?tab=edit
  const tabParam = new URLSearchParams(window.location.search).get('tab');
  if (tabParam) switchToTab(tabParam);

  window.addEventListener('cv:authchange', () => {
    populateProfileHeader();
    setupAccountTab();
    setupEditProfileTab();
  });
}

// ── Profile header ─────────────────────────────────────────────
function populateProfileHeader() {
  const user = Auth.getCurrentUser();

  const set = (sel, val) => {
    const el = document.querySelector(sel);
    if (el) el.textContent = val ?? '—';
  };

  if (user) {
    set('.profile-avatar-large', Auth.getInitials(user.name));
    set('.profile-name',         user.name);
    set('.profile-email',        [user.email, user.city].filter(Boolean).join(' · '));
  } else {
    set('.profile-avatar-large', '?');
    set('.profile-name',         'Guest');
    set('.profile-email',        'Not logged in');
  }

  // Booking stats
  const history    = Storage.getHistory();
  const totalSpent = history.reduce((sum, b) => sum + (b.total || 0), 0);
  set('.stat-bookings', history.length);
  set('.stat-spent',    `₹${totalSpent}`);
  set('.stat-films',    new Set(history.map(b => b.movie?.id).filter(Boolean)).size);
}

// ── Logout ─────────────────────────────────────────────────────
function bindLogout() {
  document.querySelector('.profile-logout-btn')?.addEventListener('click', () => {
    Auth.logout();
    window.location.href = 'index.html';
  });
}

// ── Tabs ───────────────────────────────────────────────────────
function setupTabs() {
  bindLogout();

  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => switchToTab(tab.dataset.panel));
  });

  // "Go to Edit Profile" inline link inside Account tab
  document.querySelector('.js-goto-edit')?.addEventListener('click', () => switchToTab('edit'));
}

function switchToTab(name) {
  document.querySelectorAll('.profile-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.panel === name);
    t.setAttribute('aria-selected', t.dataset.panel === name);
  });
  document.querySelectorAll('.profile-panel').forEach(p => {
    p.hidden = p.dataset.panel !== name;
  });
}

// ── Booking history ────────────────────────────────────────────
function renderHistory() {
  const history   = Storage.getHistory();
  const container = document.querySelector('.booking-history-list');
  if (!container) return;

  if (!history.length) {
    container.innerHTML = `
      <div class="profile-empty-state">
        <div class="profile-empty-icon" aria-hidden="true">🎬</div>
        <p class="profile-empty-title">No bookings yet</p>
        <p class="profile-empty-sub">Your cinema adventures will appear here.</p>
        <a href="index.html" class="btn btn-secondary" style="margin-top:var(--space-5)">Explore Films</a>
      </div>`;
    return;
  }

  container.innerHTML = history.map(b => `
    <div class="booking-history-card">
      <div class="booking-history-poster">
        <img src="${b.movie?.poster || ''}" alt="${b.movie?.title || ''}" loading="lazy">
      </div>
      <div class="booking-history-info">
        <div class="booking-history-movie">
          <div class="booking-history-title">${b.movie?.title || '—'}</div>
          <div class="booking-history-detail">${b.theater?.name || '—'} · ${b.time || '—'}</div>
          <div class="booking-history-detail" style="margin-top:4px;font-size:11px;color:var(--text-faint)">
            Booking ID: ${b.id}
          </div>
        </div>
        <div class="booking-history-seats">
          ${(b.seats || []).map(s => `<span class="badge badge-gold" style="font-size:11px">${s}</span>`).join('')}
        </div>
        <div class="booking-history-price">₹${b.total || 0}</div>
      </div>
    </div>`).join('');
}

// ── Account tab — read-only display (Part 9) ──────────────────
function setupAccountTab() {
  const user = Auth.getCurrentUser();
  const wrap = document.querySelector('.account-display-rows');
  if (!wrap) return;

  if (!user) {
    wrap.innerHTML = `
      <p class="t-muted" style="padding:var(--space-5) 0">
        Please <button class="btn-inline js-open-login">log in</button> to view your account details.
      </p>`;
    wrap.querySelector('.js-open-login')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('cv:openauth', { detail: { tab: 'login' } }));
    });
    return;
  }

  const rows = [
    { label: 'Full Name',     val: user.name  || '—', icon: '👤' },
    { label: 'Email',         val: user.email || '—', icon: '✉️' },
    { label: 'Phone',         val: user.phone || '—', icon: '📱' },
    { label: 'City',          val: user.city  || '—', icon: '📍' },
  ];

  wrap.innerHTML = rows.map(r => `
    <div class="account-row">
      <span class="account-row-icon" aria-hidden="true">${r.icon}</span>
      <div>
        <div class="account-row-label">${r.label}</div>
        <div class="account-row-val">${r.val}</div>
      </div>
    </div>`).join('');
}

// ── Edit Profile tab (Part 9) ──────────────────────────────────
function setupEditProfileTab() {
  const user = Auth.getCurrentUser();

  // Pre-fill fields with current values
  const fill = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  fill('ep-name',  user?.name);
  fill('ep-email', user?.email);
  fill('ep-phone', user?.phone);
  fill('ep-city',  user?.city);

  // Clear password fields on every setup call
  ['ep-cur-pass', 'ep-new-pass', 'ep-con-pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  // Bind save button (remove old listener first by cloning)
  const saveBtn = document.querySelector('.ep-save-btn');
  if (!saveBtn) return;
  const newBtn = saveBtn.cloneNode(true);
  saveBtn.replaceWith(newBtn);
  newBtn.addEventListener('click', handleEditProfileSave);
}

function handleEditProfileSave() {
  const msgEl = document.querySelector('.ep-msg');
  const show  = (type, text) => {
    if (!msgEl) return;
    msgEl.textContent = text;
    msgEl.className   = `ep-msg ep-msg--${type}`;
    if (type === 'success') setTimeout(() => { msgEl.textContent = ''; msgEl.className = 'ep-msg'; }, 4000);
  };

  if (!Auth.getCurrentUser()) { show('error', 'You must be logged in to edit your profile.'); return; }

  const val = id => (document.getElementById(id)?.value || '');
  const name    = val('ep-name').trim();
  const email   = val('ep-email').trim();
  const phone   = val('ep-phone').trim();
  const city    = val('ep-city').trim();
  const curPass = val('ep-cur-pass');
  const newPass = val('ep-new-pass');
  const conPass = val('ep-con-pass');

  if (!name)  { show('error', 'Name is required.'); return; }
  if (!email) { show('error', 'Email is required.'); return; }

  // Password section — only validate if any password field is touched
  if (curPass || newPass || conPass) {
    if (newPass !== conPass) { show('error', 'New passwords do not match.'); return; }
  }

  const result = Auth.updateUser({
    name, email, phone, city,
    ...(newPass ? { currentPassword: curPass, newPassword: newPass } : {}),
  });

  if (!result.ok) { show('error', result.error); return; }

  show('success', '✓ Profile updated successfully!');
  // Clear password fields
  ['ep-cur-pass', 'ep-new-pass', 'ep-con-pass'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
}

document.addEventListener('DOMContentLoaded', init);
