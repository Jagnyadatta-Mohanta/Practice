const Storage = (() => {
  const BOOKING_KEY = 'cv_booking';
  const HISTORY_KEY = 'cv_history';
  const PREFS_KEY   = 'cv_prefs';

  function getBooking() {
    try { return JSON.parse(sessionStorage.getItem(BOOKING_KEY)) || {}; }
    catch { return {}; }
  }
  function setBooking(data) {
    sessionStorage.setItem(BOOKING_KEY, JSON.stringify({ ...getBooking(), ...data }));
  }
  function clearBooking() { sessionStorage.removeItem(BOOKING_KEY); }

  function setMovie(movie)     { setBooking({ movie }); }
  function getMovie()          { return getBooking().movie || null; }
  function setTheater(theater) { setBooking({ theater }); }
  function getTheater()        { return getBooking().theater || null; }
  function setShowtime(st)     { setBooking({ showtime: st }); }
  function getShowtime()       { return getBooking().showtime || null; }
  function setDate(date)       { setBooking({ date }); }
  function getDate()           { return getBooking().date || null; }
  function setLanguage(lang)   { setBooking({ language: lang }); }
  function getLanguage()       { return getBooking().language || 'English'; }
  function setSeats(seats)     { setBooking({ seats }); }
  function getSeats()          { return getBooking().seats || []; }
  function setFormat(format)   { setBooking({ format }); }
  function getFormat()         { return getBooking().format || 'Standard'; }

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch { return []; }
  }
  function saveToHistory(booking) {
    const h = getHistory();
    h.unshift(booking);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 20)));
  }

  function getPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; }
    catch { return {}; }
  }
  function setPref(key, value) {
    const p = getPrefs(); p[key] = value;
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  }
  function getPref(key, defaultVal = null) { return getPrefs()[key] ?? defaultVal; }

  function generateBookingId() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = 'CVX';
    for (let i = 0; i < 7; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  }

  function calculatePricing(movie, format, seatCount) {
    if (!movie || !seatCount) return { base: 0, convenience: 0, total: 0 };
    const formatKey = format === 'IMAX' ? 'imax' : format === 'Premium' ? 'premium' : 'standard';
    const basePerSeat = (movie.price || {})[formatKey] || (movie.price || {}).standard || 400;
    const base = basePerSeat * seatCount;
    const convenience = Math.round(base * 0.04);
    return { basePerSeat, base, convenience, total: base + convenience };
  }

  return {
    getBooking, setBooking, clearBooking,
    setMovie, getMovie, setTheater, getTheater,
    setShowtime, getShowtime, setDate, getDate,
    setLanguage, getLanguage, setSeats, getSeats,
    setFormat, getFormat, getHistory, saveToHistory,
    getPrefs, setPref, getPref, generateBookingId, calculatePricing,
  };
})();

const Auth = (() => {
  const USERS_KEY   = 'cv_users';
  const SESSION_KEY = 'cv_session';

  function _getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  }
  function _saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function _setSession(user) {
    const { passwordHash: _pw, ...safe } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent('cv:authchange', { detail: { user: safe } }));
  }
  function _clearSession() {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('cv:authchange', { detail: { user: null } }));
  }
  function _hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = Math.imul(31, h) + str.charCodeAt(i) | 0;
    return h.toString(36);
  }
  function _uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  }

  function signup(name, email, password) {
    name  = (name  || '').trim();
    email = (email || '').trim().toLowerCase();
    if (!name)    return { ok: false, error: 'Name is required.' };
    if (!email)   return { ok: false, error: 'Email is required.' };
    const emailRegex = /^[a-z0-9](?!.*\.\.)[a-z0-9._]*[a-z0-9]@(?=[a-z0-9-]*[a-z])[a-z0-9-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(email)) return { ok: false, error: 'Invalid email format.' };
    if (!password)           return { ok: false, error: 'Password is required.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
    const users = _getUsers();
    if (users.some(u => u.email === email)) return { ok: false, error: 'An account with this email already exists.' };
    const newUser = { id: _uid(), name, email, phone: '', city: '', passwordHash: _hash(password) };
    users.push(newUser);
    _saveUsers(users);
    _setSession(newUser);
    return { ok: true };
  }

  function login(email, password) {
    email = (email || '').trim().toLowerCase();
    if (!email || !password) return { ok: false, error: 'Please fill in all fields.' };
    const user = _getUsers().find(u => u.email === email && u.passwordHash === _hash(password));
    if (!user) return { ok: false, error: 'Incorrect email or password.' };
    _setSession(user);
    return { ok: true };
  }

  function logout() { _clearSession(); }

  function updateUser(updates) {
    const session = getCurrentUser();
    if (!session) return { ok: false, error: 'You must be logged in.' };
    const users = _getUsers();
    const idx   = users.findIndex(u => u.id === session.id);
    if (idx === -1) return { ok: false, error: 'Account not found.' };
    const user = users[idx];
    if (updates.newPassword) {
      if (!updates.currentPassword) return { ok: false, error: 'Enter your current password to set a new one.' };
      if (user.passwordHash !== _hash(updates.currentPassword)) return { ok: false, error: 'Current password is incorrect.' };
      if (updates.newPassword.length < 6) return { ok: false, error: 'New password must be at least 6 characters.' };
      user.passwordHash = _hash(updates.newPassword);
    }
    const newEmail = (updates.email || '').trim().toLowerCase();
    if (newEmail && newEmail !== user.email) {
      if (users.some((u, i) => i !== idx && u.email === newEmail)) return { ok: false, error: 'That email is already used by another account.' };
      user.email = newEmail;
    }
    if (updates.name?.trim())        user.name  = updates.name.trim();
    if (updates.phone !== undefined) user.phone = (updates.phone || '').trim();
    if (updates.city  !== undefined) user.city  = (updates.city  || '').trim();
    _saveUsers(users);
    _setSession(user);
    return { ok: true };
  }

  function getInitials(name = '') {
    return name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2) || '?';
  }

  return { signup, login, logout, getCurrentUser, updateUser, getInitials };
})();

export { Storage, Auth };
