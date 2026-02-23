import { Storage, Auth } from './utils.js';
import { Header, Footer } from './layout.js';

function init() {
  Header.init();
  Footer.init();
  populateProfileHeader();
  setupTabs();
  renderHistory();
  setupAccountTab();
  setupEditProfileTab();

  const tabParam = new URLSearchParams(window.location.search).get('tab');
  if (tabParam) switchToTab(tabParam);

  window.addEventListener('cv:authchange', () => {
    populateProfileHeader();
    setupAccountTab();
    setupEditProfileTab();
  });
}

function populateProfileHeader() {
  const user = Auth.getCurrentUser();
  const set = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = val ?? '—'; };

  if (user) {
    set('.profile-avatar-large', Auth.getInitials(user.name));
    set('.profile-name',         user.name);
    set('.profile-email',        [user.email, user.city].filter(Boolean).join(' · '));
  } else {
    set('.profile-avatar-large', '?');
    set('.profile-name',         'Guest');
    set('.profile-email',        'Not logged in');
  }

  const history    = Storage.getHistory();
  const totalSpent = history.reduce((sum, b) => sum + (b.total || 0), 0);
  set('.stat-bookings', history.length);
  set('.stat-spent',    `₹${totalSpent}`);
  set('.stat-films',    new Set(history.map(b => b.movie?.id).filter(Boolean)).size);
}

function setupTabs() {
  document.querySelector('.profile-logout-btn')?.addEventListener('click', () => {
    Auth.logout();
    window.location.href = 'index.html';
  });
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => switchToTab(tab.dataset.panel));
  });
  document.querySelector('.js-goto-edit')?.addEventListener('click', () => switchToTab('edit'));
}

function switchToTab(name) {
  document.querySelectorAll('.profile-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.panel === name);
    t.setAttribute('aria-selected', t.dataset.panel === name);
  });
  document.querySelectorAll('.profile-panel').forEach(p => { p.hidden = p.dataset.panel !== name; });
}

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

  container.innerHTML = history.map((b, i) => `
    <div class="booking-history-card">
      <div class="booking-history-poster">
        <img src="${b.movie?.poster || ''}" alt="${b.movie?.title || ''}" loading="lazy">
      </div>
      <div class="booking-history-info">
        <div class="booking-history-movie">
          <div class="booking-history-title">${b.movie?.title || '—'}</div>
          <div class="booking-history-detail">${b.theater?.name || '—'} · ${b.time || '—'}</div>
          <div class="booking-history-detail" style="margin-top:4px;font-size:11px;color:var(--text-faint)">Booking ID: ${b.id}</div>
        </div>
        <div class="booking-history-seats">
          ${(b.seats || []).map(s => `<span class="badge badge-gold" style="font-size:11px">${s}</span>`).join('')}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:var(--space-3);flex-shrink:0">
          <div class="booking-history-price">₹${b.total || 0}</div>
          <button class="btn btn-ghost btn-sm view-ticket-btn" data-index="${i}" style="font-size:11px;padding:6px 12px;white-space:nowrap">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View Ticket
          </button>
        </div>
      </div>
    </div>`).join('');

  container.querySelectorAll('.view-ticket-btn').forEach(btn => {
    btn.addEventListener('click', () => openTicketModal(history[+btn.dataset.index]));
  });

  bindTicketModal();
}

function openTicketModal(b) {
  const modal = document.getElementById('ticket-modal');
  if (!modal) return;

  const set = (field, val) => {
    const el = modal.querySelector(`[data-field="${field}"]`);
    if (el) el.textContent = val || '—';
  };

  modal.querySelector('.ticket-modal-id-val').textContent   = b.id || '—';
  modal.querySelector('.ticket-modal-movie').textContent    = b.movie?.title || '—';
  set('theater', b.theater?.name);
  set('time',    b.time ? `${b.time}${b.format ? ' · ' + b.format : ''}` : null);
  set('seats',   b.seats?.length ? b.seats.join(', ') : null);
  set('total',   b.total ? `₹${b.total}` : null);

  const displayDate = b.date
    ? new Date(b.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
  set('date', displayDate);

  const poster = modal.querySelector('.ticket-modal-poster');
  if (poster) { poster.src = b.movie?.poster || ''; poster.alt = b.movie?.title || ''; }

  modal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function bindTicketModal() {
  document.getElementById('close-ticket-modal')?.addEventListener('click', closeTicketModal);
  document.getElementById('print-ticket-btn')?.addEventListener('click', () => {
    closeTicketModal();
    showToast('🎟 Ticket downloaded successfully!');
  });
  document.getElementById('ticket-modal')?.addEventListener('click', e => {
    if (e.target.id === 'ticket-modal') closeTicketModal();
  });
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
    { label: 'Full Name', val: user.name  || '—', icon: '👤' },
    { label: 'Email',     val: user.email || '—', icon: '✉️' },
    { label: 'Phone',     val: user.phone || '—', icon: '📱' },
    { label: 'City',      val: user.city  || '—', icon: '📍' },
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

function setupEditProfileTab() {
  const user = Auth.getCurrentUser();
  const fill = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  fill('ep-name',  user?.name);
  fill('ep-email', user?.email);
  fill('ep-phone', user?.phone);
  fill('ep-city',  user?.city);
  ['ep-cur-pass', 'ep-new-pass', 'ep-con-pass'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
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

  const val     = id => (document.getElementById(id)?.value || '');
  const name    = val('ep-name').trim();
  const email   = val('ep-email').trim();
  const phone   = val('ep-phone').trim();
  const city    = val('ep-city').trim();
  const curPass = val('ep-cur-pass');
  const newPass = val('ep-new-pass');
  const conPass = val('ep-con-pass');

  if (!name)  { show('error', 'Name is required.'); return; }
  if (!email) { show('error', 'Email is required.'); return; }
  if ((curPass || newPass || conPass) && newPass !== conPass) { show('error', 'New passwords do not match.'); return; }

  const result = Auth.updateUser({
    name, email, phone, city,
    ...(newPass ? { currentPassword: curPass, newPassword: newPass } : {}),
  });

  if (!result.ok) { show('error', result.error); return; }
  show('success', '✓ Profile updated successfully!');
  ['ep-cur-pass', 'ep-new-pass', 'ep-con-pass'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
}

document.addEventListener('DOMContentLoaded', init);
