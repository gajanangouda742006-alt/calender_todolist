// frontend/app.js
import { renderCalendarPage } from './pages/calendar.js';
import { renderMoodPage } from './pages/mood.js';
import { renderTasksPage } from './pages/tasks.js';
import { renderHabitsPage } from './pages/habits.js';
import { renderGoalsPage } from './pages/goals.js';
import { renderAssistantPage } from './pages/assistant.js';
import { renderVaultPage } from './pages/notepad.js';
import { renderFinancePage } from './pages/finance.js';
import {
  initializeLocalDatabase,
  getCollection,
  saveRecord,
  deleteRecord,
  getLocalProfile,
  saveLocalProfile,
} from './scripts/local-database.js';
import { OfflineSync } from './scripts/offline-sync.js';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Geolocation } from '@capacitor/geolocation';



const EMPTY_DATA = {
  events: [],
  tasks: [],
  moods: [],
  habits: [],
  goals: [],
  reminders: [],
  notes: [],
  habitLogs: [],
  expenses: [],
  subscriptions: [],
  assets: [],
};

let notepadEventsBound = false;
let lastRenderedView = null;

function formatDateKey(date) {
  const normalized = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return normalized.toISOString().slice(0, 10);
}
function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
function escapeAttribute(value = '') {
  return escapeHtml(value);
}

function getRecordDateKey(value) {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '' : formatDateKey(parsed);
}

function normalizeTaskTitle(value = '') {
  return String(value)
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('en');
}

function isJunkTask(task) {
  const title = task?.title ?? task?.name ?? task?.text ?? '';
  // Remove only the explicitly identified test entries, not similarly named tasks.
  return normalizeTaskTitle(title) === 'tytyty';
}

function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}
function formatFriendlyDate(dateString) {
  if (!dateString) return 'This month';
  const date = new Date(`${String(dateString).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(dateString);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatActivityTime(value) {
  const time = new Date(value);
  if (Number.isNaN(time.getTime())) return 'This month';
  const elapsed = Date.now() - time.getTime();
  if (elapsed >= 0 && elapsed < 60 * 60 * 1000) return `${Math.max(1, Math.floor(elapsed / 60000))} min ago`;
  if (elapsed >= 0 && elapsed < 24 * 60 * 60 * 1000) return `${Math.floor(elapsed / 3600000)} hours ago`;
  return time.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
const notificationTargetDate = new URLSearchParams(window.location.search).get('date');
const hasNotificationTarget = /^\d{4}-\d{2}-\d{2}$/.test(notificationTargetDate || '');

const state = {
  view: hasNotificationTarget ? 'calendar' : 'home',
  currentMonth: new Date().getMonth(),
  currentYear: new Date().getFullYear(),
  selectedDate: hasNotificationTarget ? notificationTargetDate : formatDateKey(new Date()),
  authenticated: false,
  data: { ...EMPTY_DATA },
  user: JSON.parse(localStorage.getItem('sahraUser') || 'null') || { name: 'DaySync User' },
  theme: localStorage.getItem('theme') || 'dark',
  focusSeconds: 25 * 60,
  focusInitialSeconds: 25 * 60,
  focusRunning: false,
  focusStartedAt: null,
  focusEndsAt: null,
  focusAlarmActive: false,
  focusAlarmStartedAt: null,
  focusSessionId: null,
  focusLastCompletedId: null,
  focusSessions: JSON.parse(localStorage.getItem('sahraFocusSessions') || '[]'),
  focusLabel: 'Study session',
  menuOpen: false,
  profileEditing: false,
  profileDraft: null,
  moreMenuOpen: false,
  entryModalOpen: false,
  notepadSearchOpen: false,
noteSearchQuery: '',
  entryDraft: null,
  todoFilter: 'All',
  moodPickerOpen: false,
  navigationHistory: [],
  assistantMessages: [
    { role: 'assistant', text: "I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress." },
  ],
  assistantLoading: false,
  assistantGeneration: 0,
  assistantDraft: '',
  voiceListening: false,
  progressPickerOpen: false,
  progressData: null,
  progressLoading: false,
  showAllActivity: false,
  calendarCache: new Set(),
    financeView: 'dashboard',
  financeData: [],
  financeFilter: 'week',
  financeSearchQuery: '',
  financeTypeFilter: 'all',
  financeDetail: null,
  showFinanceResetConfirm: false,
  financeResetLoading: false,
  tempFinanceType: null,
  resetOptionsSelected: { tasks: false, notepad: false, expenses: false, calendar: false, progress: false, focus: false },
  resetConfirmOpen: false,
  resetOptionsBusy: false,
  settingsInfoPanel: '',
  weather: { status: 'idle', data: null, locationLabel: '', error: '', updatedAt: null, requestId: 0 },
};
let activeRecognition = null;
let speechSilenceTimer = null;
let notificationInterval = null;
const offlineSync = new OfflineSync({ getToken: getAuthToken, baseUrl: () => String(window.SAHRA_API_BASE_URL || '').replace(/\/+$/, '') });


function applyTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  state.theme = nextTheme;
  document.documentElement.setAttribute('data-theme', nextTheme);
  document.body.setAttribute('data-theme', nextTheme);
  document.body.classList.toggle('theme-light', nextTheme === 'light');
  document.body.classList.toggle('theme-dark', nextTheme === 'dark');
  localStorage.setItem('theme', nextTheme);
}

// ==========================================
// 📱 NATIVE APP UI UTILS (Replaces window.*)
// ==========================================
function showToast(message) {
  const existing = document.querySelector('.app-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'app-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 🚀 ADD THIS RIGHT BELOW IT: 
// This forces all default browser popups to use your custom banner instead!
window.alert = function(message) {
  showToast(message);
};

function showAppConfirm(message, onConfirm, confirmLabel = 'Delete') {
  const overlay = document.createElement('div');
  overlay.className = 'sahra-confirm-overlay';
  overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:9999; display:flex; align-items:center; justify-content:center; backdrop-filter: blur(4px);';
  
  const box = document.createElement('div');
  box.className = 'sahra-confirm-box';
  box.style.cssText = 'background:var(--panel-bg, #1a1a2e); padding:24px; border-radius:16px; width:80%; max-width:320px; text-align:center; border:1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 40px rgba(0,0,0,0.5);';
  
  const text = document.createElement('p');
  text.className = 'sahra-confirm-message';
  text.textContent = message;
  text.style.cssText = 'color:white; margin-bottom:24px; font-size:1.05rem; font-weight: 500;';
  
  const btnRow = document.createElement('div');
  btnRow.style.cssText = 'display:flex; gap:12px; justify-content:center;';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.type = 'button';
  cancelBtn.className = 'secondary-btn sahra-confirm-cancel';
  cancelBtn.style.flex = '1';
  
  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = confirmLabel;
  confirmBtn.className = 'primary-btn compact-btn';
  confirmBtn.classList.add('sahra-confirm-submit');
  confirmBtn.style.cssText = 'flex: 1; background: #ff4757; color: white; border: none; font-weight: bold;'; 
  
  let confirmed = false;

  cancelBtn.onclick = () => overlay.remove();

confirmBtn.onclick = async () => {
  if (confirmed) return;

  confirmed = true;
  confirmBtn.disabled = true;
  confirmBtn.textContent = `${confirmLabel}…`;
  confirmBtn.style.opacity = '0.6';
  confirmBtn.style.pointerEvents = 'none';

  overlay.remove();

  await onConfirm();
};
  
  btnRow.append(cancelBtn, confirmBtn);
  box.append(text, btnRow);
  overlay.append(box);
  document.body.appendChild(overlay);
}
// ==========================================

function getStoredTheme() {
  return localStorage.getItem('theme') || 'dark';
}

function getLoginPath() {
  return window.SAHRA_IS_NATIVE ? '/login.html' : '/login';
}

function getApiUrl(path) {
  const baseUrl = String(window.SAHRA_API_BASE_URL || '').replace(/\/+$/, '');
  return baseUrl ? `${baseUrl}/${String(path).replace(/^\/+/, '')}` : path;
}

async function getAuthToken() {
  if (window.SAHRA_IS_NATIVE) {
    if (!window.SAHRA_AUTH_STORAGE) {
      throw new Error('Secure native sign-in storage is unavailable.');
    }
    return await window.SAHRA_AUTH_STORAGE.get('sahraToken');
  }
  return localStorage.getItem('sahraToken');
}

async function removeAuthToken() {
  if (window.SAHRA_IS_NATIVE) {
    if (!window.SAHRA_AUTH_STORAGE) {
      throw new Error('Secure native sign-in storage is unavailable.');
    }
    await window.SAHRA_AUTH_STORAGE.remove('sahraToken');
    return;
  }
  localStorage.removeItem('sahraToken');
}

async function apiRequest(path, options = {}) {
  const token = await getAuthToken();
  const method = String(options.method || 'GET').toUpperCase();
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const idempotencyKey = isWrite ? (options.headers?.['Idempotency-Key'] || globalThis.crypto?.randomUUID?.() || `sahra-${Date.now()}-${Math.random().toString(36).slice(2)}`) : null;
  let response;
  try {
    response = await fetch(getApiUrl(path), {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  } catch (networkError) {
    if (token && method === 'GET' && cleanApiPath(path) === 'api/dashboard') {
      const cached = await offlineSync.dashboardFallback(token);
      if (cached.user || Object.values(cached.data || {}).some((rows) => rows.length)) {
        showOfflineBannerOnce();
        return cached;
      }
    }
    if (token && method === 'GET' && cleanApiPath(path) === 'api/transactions') {
      const cached = await offlineSync.transactionFallback(token);
      if (cached.length) { showOfflineBannerOnce(); return cached; }
    }
    if (token && isWrite) {
      try {
        const queued = await offlineSync.enqueueAndApply(token, path, { ...options, method, idempotencyKey });
        showOfflineBannerOnce();
        return queued;
      } catch (queueError) {
        console.warn('Offline save could not be queued:', queueError.message);
      }
    }
    throw networkError;
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    let message = typeof payload === 'string' ? payload : payload?.message || 'Request failed';
    if (typeof message === 'string' && /<\s*(?:!doctype|html|head|body|pre)\b/i.test(message)) {
      const routeMatch = message.match(/Cannot\s+(GET|POST|PUT|PATCH|DELETE)\s+([^<\s]+)/i);
      if (routeMatch && /reset-data/i.test(routeMatch[2])) {
        message = 'The DaySync reset API is not deployed on the server yet. Push backend/routes/dashboard.js from the project root and wait for the hosted API to redeploy, then try again.';
      } else {
        message = `The server returned an unexpected HTML error (HTTP ${response.status}). Check the API deployment and try again.`;
      }
    } else if (typeof message === 'string') {
      message = message.trim().slice(0, 600);
    }
    if ([502, 503, 504].includes(response.status) && token) {
      try {
        if (method === 'GET' && cleanApiPath(path) === 'api/dashboard') {
          const cached = await offlineSync.dashboardFallback(token);
          if (cached.user || Object.values(cached.data || {}).some((rows) => rows.length)) { showOfflineBannerOnce(); return cached; }
        }
        if (method === 'GET' && cleanApiPath(path) === 'api/transactions') {
          const cached = await offlineSync.transactionFallback(token);
          if (cached.length) { showOfflineBannerOnce(); return cached; }
        }
        if (isWrite) {
          const queued = await offlineSync.enqueueAndApply(token, path, { ...options, method, idempotencyKey });
          showOfflineBannerOnce();
          return queued;
        }
      } catch (offlineError) { console.warn('Offline fallback unavailable:', offlineError.message); }
    }
    const isExpiredSession = response.status === 401 || (
      response.status === 404 && message.toLowerCase().includes('user not found')
    );

    if (isExpiredSession) {
      await removeAuthToken();
      localStorage.removeItem('sahraUser');
      state.authenticated = false;

      if (!window.location.pathname.endsWith('/login') && !window.location.pathname.endsWith('/login.html')) {
        window.location.href = getLoginPath();
      }
    }

    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (token) {
    try {
      if (method === 'GET' && cleanApiPath(path) === 'api/dashboard') await offlineSync.cacheDashboard(token, payload);
      else if (method === 'GET' && cleanApiPath(path) === 'api/transactions') await offlineSync.cacheTransactions(token, Array.isArray(payload) ? payload : (payload.transactions || []));
      else if (isWrite) await offlineSync.cacheSuccessfulMutation(token, path, { ...options, method }, payload);
      if (globalThis.navigator?.onLine) void offlineSync.flush(token).catch((error) => console.warn('Offline sync retry failed:', error.message));
    } catch (cacheError) { console.warn('Local cache update failed:', cacheError.message); }
  }
  return payload;
}

function cleanApiPath(path) { return String(path || '').split('?')[0].replace(/^\/+/, ''); }
let offlineBannerShown = false;
function showOfflineBannerOnce() {
  // Keep connectivity handling silent; normal save confirmations remain visible.
}
window.addEventListener('online', async () => {
  offlineBannerShown = false;
  try { const token = await getAuthToken(); await offlineSync.flush(token); await loadDashboardData(); await fetchFinanceData(); }
  catch (error) { console.warn('Reconnect sync failed:', error.message); }
});

function renderMenuPage() {
  return `
    <section class="screen menu-screen" aria-label="Menu">
      <header class="menu-page-heading">
        <h1>Menu</h1>
        <p>Choose a feature</p>
      </header>
      <div class="more-menu-panel menu-page-options" role="navigation" aria-label="Menu options">
        <button class="menu-item" type="button" data-view="tasks">✅ To Do List</button>
        <button class="menu-item" type="button" data-view="vault">📝 Notepad (Vault)</button>
        <button class="menu-item" type="button" data-view="finance">💰 Expense Tracker</button>
        <button class="menu-item" type="button" data-view="focus">⏱️ Focus Timer</button>
        <button class="menu-item" type="button" data-view="progress">📈 Progress &amp; Stats</button>
        <button class="menu-item" type="button" data-view="settings">⚙️ Settings</button>
      </div>
    </section>
  `;
}

function renderSettingsPage() {
  const isLightTheme = state.theme === 'light';
  const notificationsEnabled = areDeviceNotificationsEnabled();
  const native = Boolean(window.SAHRA_NOTIFICATIONS?.isNative?.());
  const tasksCount = Array.isArray(state.data?.tasks) ? state.data.tasks.length : 0;
  const notesCount = (Array.isArray(state.data?.assets) && state.data.assets.length)
    ? state.data.assets.length : (Array.isArray(state.data?.notes) ? state.data.notes.length : 0);
  const eventsCount = (state.data?.events?.length || 0) + (state.data?.reminders?.length || 0);
  const expensesCount = (Array.isArray(state.financeData) && state.financeData.length)
    ? state.financeData.length : ((state.data?.expenses?.length || 0) + (state.data?.subscriptions?.length || 0));
  const progressCount = (state.data?.goals?.length || 0) + (state.data?.habits?.length || 0) + (state.data?.habitLogs?.length || 0) + (state.data?.moods?.length || 0);
  const focusCount = Array.isArray(state.focusSessions) ? state.focusSessions.length : 0;
  return `
    <section class="screen daysync-settings-screen" aria-label="DaySync settings">
      <header class="daysync-settings-header">
        <button class="daysync-settings-back daysync-page-back-button" type="button" data-action="settings-back" aria-label="Back">‹</button>
        <div class="daysync-settings-mark" aria-hidden="true">☷</div>
        <div class="daysync-settings-title"><h1>Settings</h1><p>Personalize your DaySync experience</p></div>
      </header>
      <section class="daysync-settings-group" aria-labelledby="settings-personalization-heading">
        <p class="daysync-settings-section-label" id="settings-personalization-heading">PERSONALIZATION</p>
        <div class="daysync-settings-list">
          <button class="daysync-setting-row" type="button" data-menu-action="toggle-theme">
            <span class="daysync-setting-icon">${isLightTheme ? '☀️' : '🌙'}</span><span class="daysync-setting-copy"><strong>Appearance</strong><small>${isLightTheme ? 'Light theme enabled' : 'Dark theme enabled'}</small></span><span class="daysync-setting-trail">›</span>
          </button>
          <button class="daysync-setting-row" type="button" data-menu-action="profile">
            <span class="daysync-setting-icon">♙</span><span class="daysync-setting-copy"><strong>Profile</strong><small>${escapeHtml(state.user?.name || 'Your personal information')}</small></span><span class="daysync-setting-trail">›</span>
          </button>
          <button class="daysync-setting-row" type="button" data-menu-action="notifications" role="switch" aria-checked="${notificationsEnabled}" aria-label="Notifications ${notificationsEnabled ? 'on' : 'off'}">
            <span class="daysync-setting-icon">♧</span><span class="daysync-setting-copy"><strong>Notifications</strong><small>${notificationsEnabled ? 'Device permission granted' : 'Manage task, event and focus reminders'}</small></span><span class="daysync-settings-switch ${notificationsEnabled ? 'is-on' : ''}" aria-hidden="true"><span></span></span>
          </button>
        </div>
      </section>
      <section class="daysync-settings-group" aria-labelledby="settings-data-heading">
        <p class="daysync-settings-section-label" id="settings-data-heading">APP &amp; DATA</p>
        <div class="daysync-settings-list">
          <button class="daysync-setting-row" type="button" data-menu-action="sync-now">
            <span class="daysync-setting-icon">⟳</span><span class="daysync-setting-copy"><strong>Data &amp; Sync</strong><small>${tasksCount} tasks · ${notesCount} notes · ${expensesCount} transactions · ${eventsCount} calendar items</small><small class="daysync-setting-subline">${progressCount} progress records · ${focusCount} focus sessions · Tap to sync now</small></span><span class="daysync-setting-trail">›</span>
          </button>
          <button class="daysync-setting-row" type="button" data-menu-action="privacy-security" aria-expanded="${state.settingsInfoPanel === 'privacy' ? 'true' : 'false'}">
            <span class="daysync-setting-icon">◇</span><span class="daysync-setting-copy"><strong>Privacy &amp; Security</strong><small>Account-scoped data and device permissions</small></span><span class="daysync-setting-trail">${state.settingsInfoPanel === 'privacy' ? '⌄' : '›'}</span>
          </button>
          ${state.settingsInfoPanel === 'privacy' ? `<div class="daysync-settings-detail-panel"><strong>Your account and device</strong><p>DaySync requests access only when a feature needs it. Location is used to find local weather. Your saved records are associated with your signed-in account; sign out on shared devices.</p><button type="button" data-action="open-location-permission-settings">Location permissions</button><button type="button" data-action="open-notification-permission-settings">Notification permissions</button></div>` : ''}
          ${native ? `<button class="daysync-setting-row" type="button" data-action="open-location-permission-settings"><span class="daysync-setting-icon">⌖</span><span class="daysync-setting-copy"><strong>Location access</strong><small>Manage location permission for local weather</small></span><span class="daysync-setting-trail">›</span></button><button class="daysync-setting-row" type="button" data-action="open-notification-permission-settings"><span class="daysync-setting-icon">♧</span><span class="daysync-setting-copy"><strong>Notification permissions</strong><small>Manage reminders on this device</small></span><span class="daysync-setting-trail">›</span></button><button class="daysync-setting-row" type="button" data-menu-action="exact-alarms"><span class="daysync-setting-icon">⏰</span><span class="daysync-setting-copy"><strong>Timer alarms</strong><small>Open Android's precise alarm setting where available</small></span><span class="daysync-setting-trail">›</span></button>` : ''}
          <button class="daysync-setting-row daysync-setting-row-danger" type="button" data-action="open-reset-options">
            <span class="daysync-setting-icon daysync-danger-icon">⚠</span><span class="daysync-setting-copy"><strong>Reset Options</strong><small>Review saved data by section and date before deleting</small></span><span class="daysync-setting-trail">›</span>
          </button>
        </div>
      </section>
      <p class="daysync-settings-section-label">ABOUT DAYSYNC</p>
      <section class="daysync-about-card"><div class="daysync-about-top"><span class="daysync-about-logo">DS</span><div><strong>DaySync</strong><p>Your personal planner for tasks, calendar, expenses, goals, and focus sessions.</p></div></div><span class="daysync-about-version">DaySync · Version 1.0 · AI assistant: Sahra</span></section>
      <button class="daysync-signout-row" type="button" data-menu-action="logout"><span>↪</span> Sign out</button>
    </section>`;
}

const RESET_CATEGORY_META = {
  tasks: { title: 'To Do List', icon: '✅', description: 'Saved tasks and their completion status', collections: ['tasks'] },
  notepad: { title: 'Notepad', icon: '📝', description: 'Saved notes and vault entries', collections: ['notes', 'assets'] },
  expenses: { title: 'Expense Tracker', icon: '💰', description: 'Income, expenses and transactions', collections: ['transactions', 'expenses', 'subscriptions'] },
  calendar: { title: 'Calendar Data', icon: '🗓️', description: 'Calendar events and reminders', collections: ['events', 'reminders'] },
  progress: { title: 'Progress Tracker', icon: '📈', description: 'Goals, habits, mood entries and habit logs', collections: ['goals', 'habits', 'habitLogs', 'moods'] },
  focus: { title: 'Focus Timer', icon: '⏱️', description: 'Saved focus sessions and timer history', collections: [] },
};

function getResetCategoryRecords(category) {
  const data = state.data || {};
  const tag = (rows, kind) => (Array.isArray(rows) ? rows : []).map((record) => ({ ...record, _resetKind: kind }));
  if (category === 'tasks') return tag(data.tasks, 'Task');
  if (category === 'notepad') {
    const rows = (data.assets?.length ? data.assets : data.notes) || [];
    return tag(rows, 'Note');
  }
  if (category === 'expenses') {
    const rows = state.financeData?.length ? state.financeData : [...(data.expenses || []), ...(data.subscriptions || [])];
    return tag(rows, 'Transaction');
  }
  if (category === 'calendar') return [...tag(data.events, 'Event'), ...tag(data.reminders, 'Reminder')];
  if (category === 'progress') return [
    ...tag(data.goals, 'Goal'), ...tag(data.habits, 'Habit'), ...tag(data.habitLogs, 'Habit log'), ...tag(data.moods, 'Mood entry'),
  ];
  if (category === 'focus') return tag(state.focusSessions, 'Focus session');
  return [];
}

function resetRecordDate(record) {
  const candidate = record?.date || record?.createdAt || record?.updatedAt || record?.startedAt || record?.completedAt || record?.endedAt || record?.timestamp || record?.startDate;
  if (!candidate) return 'Undated';
  const raw = String(candidate);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : new Date(candidate);
  return Number.isNaN(date.getTime()) ? 'Undated' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function resetRecordTitle(record) {
  const value = record?.title || record?.name || record?.label || record?.note || record?.content || record?.description || record?.category || record?._resetKind || 'Saved record';
  return String(value).replace(/\s+/g, ' ').trim().slice(0, 88) || 'Saved record';
}

function renderResetRecordGroups(category) {
  const records = getResetCategoryRecords(category);
  if (!records.length) return '<p class="daysync-reset-empty">No saved records found in this section.</p>';
  const groups = new Map();
  for (const record of records) {
    const date = resetRecordDate(record);
    if (!groups.has(date)) groups.set(date, []);
    groups.get(date).push(record);
  }
  return [...groups.entries()].sort((a, b) => {
    if (a[0] === 'Undated') return 1;
    if (b[0] === 'Undated') return -1;
    return new Date(b[0]) - new Date(a[0]);
  }).map(([date, rows]) => `<section class="daysync-reset-date-group"><header><strong>${escapeHtml(date)}</strong><span>${rows.length} ${rows.length === 1 ? 'item' : 'items'}</span></header><div>${rows.map((record) => `<article class="daysync-reset-record"><span>${escapeHtml(record._resetKind || 'Saved item')}</span><strong>${escapeHtml(resetRecordTitle(record))}</strong>${record.amount != null ? `<small>${escapeHtml(formatINR(record.amount))}</small>` : ''}</article>`).join('')}</div></section>`).join('');
}

function renderResetOptionsPage() {
  const selected = state.resetOptionsSelected || {};
  const selectedCategories = Object.keys(RESET_CATEGORY_META).filter((key) => selected[key]);
  const selectedCount = selectedCategories.reduce((sum, key) => sum + getResetCategoryRecords(key).length, 0);
  const summary = selectedCategories.map((key) => `<li>${escapeHtml(RESET_CATEGORY_META[key].title)} <strong>${getResetCategoryRecords(key).length}</strong></li>`).join('');
  return `
    <section class="screen daysync-reset-screen" aria-label="Reset options">
      <header class="daysync-reset-header"><div><p class="daysync-eyebrow">APP &amp; DATA</p><h1>Reset Options</h1><p>Choose which saved information to review and remove.</p></div></header>
      <div class="daysync-reset-warning"><span>⚠</span><div><strong>Permanent deletion</strong><p>Review each section and its saved dates. Reset only the categories you select. This action cannot be undone.</p></div></div>
      <div class="daysync-reset-category-list">
        ${Object.entries(RESET_CATEGORY_META).map(([key, meta]) => {
          const records = getResetCategoryRecords(key);
          const isSelected = Boolean(selected[key]);
          return `<button type="button" class="daysync-reset-category ${isSelected ? 'is-selected' : ''}" data-action="reset-toggle-category" data-category="${key}" aria-pressed="${isSelected}"><span class="daysync-reset-category-check">${isSelected ? '✓' : ''}</span><span class="daysync-reset-category-icon">${meta.icon}</span><span class="daysync-reset-category-copy"><strong>${meta.title}</strong><small>${meta.description}</small><small>${records.length} saved ${records.length === 1 ? 'item' : 'items'} · ${isSelected ? 'Included in reset' : 'Tap to select and preview'}</small></span><span class="daysync-setting-trail">${isSelected ? '⌄' : '›'}</span></button>${isSelected ? `<div class="daysync-reset-preview">${renderResetRecordGroups(key)}</div>` : ''}`;
        }).join('')}
      </div>
      <div class="daysync-reset-select-actions"><button type="button" data-action="reset-select-all">${selectedCategories.length === Object.keys(RESET_CATEGORY_META).length ? 'Deselect all sections' : 'Select all sections'}</button><span>${selectedCategories.length} sections · ${selectedCount} records selected</span></div>
      <div class="daysync-reset-review-bar"><button type="button" class="daysync-reset-cancel" data-action="reset-back-settings">Cancel</button><button type="button" class="daysync-reset-review-button" data-action="reset-review" ${!selectedCategories.length || state.resetOptionsBusy ? 'disabled' : ''}>Review reset <span>(${selectedCategories.length})</span></button></div>
      ${state.resetConfirmOpen ? `<div class="daysync-reset-modal-backdrop" role="presentation"><section class="daysync-reset-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="reset-confirm-title"><div class="daysync-reset-danger-symbol">⚠️</div><p class="daysync-eyebrow">FINAL REVIEW</p><h2 id="reset-confirm-title">Delete selected data?</h2><p class="daysync-reset-confirm-copy">This permanently deletes <strong>${selectedCount} saved records</strong> across the selected sections. Your account will not be deleted, but this data cannot be recovered.</p><ul class="daysync-reset-confirm-list">${summary}</ul><label class="daysync-reset-ack"><input type="checkbox" data-reset-acknowledge> <span>I understand this deletion is permanent.</span></label><label class="daysync-reset-phrase-label" for="reset-confirm-phrase">Type <strong>DELETE</strong> to confirm</label><input id="reset-confirm-phrase" class="daysync-reset-phrase" type="text" autocomplete="off" autocapitalize="characters" placeholder="Type DELETE" aria-label="Type DELETE to confirm"><div class="daysync-reset-modal-actions"><button type="button" class="daysync-reset-cancel" data-action="reset-cancel">Go back</button><button type="button" class="daysync-reset-confirm-button" data-action="reset-confirm" ${state.resetOptionsBusy ? 'disabled' : ''}>${state.resetOptionsBusy ? 'Deleting…' : 'Permanently delete'}</button></div></section></div>` : ''}
    </section>`;
}

function renderMoreMenu() {
  if (!state.moreMenuOpen) return '';
  
  return `
    <div class="more-menu-backdrop" data-action="close-more-menu" style="position: fixed; inset: 0; z-index: 1000;"></div>
    
    <!-- Added height: fit-content; and min-height: 0; to remove the empty space -->
    <div class="more-menu-panel" style="position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: var(--panel-bg); border: 1px solid var(--panel-border); border-radius: 16px; padding: 12px; display: flex; flex-direction: column; gap: 8px; z-index: 1001; width: 220px; box-shadow: 0 10px 30px rgba(0,0,0,0.6); height: fit-content; min-height: 0;">
      
      <button class="menu-item" type="button" data-view="tasks" style="text-align: left; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; display: flex; gap: 10px; font-size: 1rem;">
        ✅ To Do List
      </button>

      <button class="menu-item" type="button" data-view="vault" style="text-align: left; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; display: flex; gap: 10px; font-size: 1rem;">
        📝 Notepad (Vault)
      </button>
      
      <button class="menu-item" type="button" data-view="finance" style="text-align: left; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; display: flex; gap: 10px; font-size: 1rem;">
        💰 Expense Tracker
      </button>
      
      <button class="menu-item" type="button" data-view="focus" style="text-align: left; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; display: flex; gap: 10px; font-size: 1rem;">
        ⏱️ Focus Timer
      </button>
      <button class="menu-item" type="button" data-view="progress" style="text-align: left; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; display: flex; gap: 10px; font-size: 1rem;">
        📈 Progress &amp; Stats
      </button>
      <button class="menu-item" type="button" data-view="settings" style="text-align: left; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); color: white; border: none; cursor: pointer; display: flex; gap: 10px; font-size: 1rem;">
        ⚙️ Settings
      </button>
      
    </div>
  `;
}

async function updateThemeInDatabase(theme) {
  try {
    await apiRequest('/api/profile/theme', {
      method: 'PUT',
      body: JSON.stringify({ theme }),
    });
  } catch (error) {
    console.warn('Theme sync failed:', error.message);
  }
}

async function saveReminderSettings(settings) {
  const current = state.user?.preferences?.reminderSettings || {};
  const response = await apiRequest('/api/profile/preferences', {
    method: 'PUT',
    body: JSON.stringify({
      preferences: {
        reminderSettings: { ...current, ...settings },
      },
    }),
  });
  state.user = response.user || {
    ...state.user,
    preferences: {
      ...(state.user?.preferences || {}),
      reminderSettings: { ...current, ...settings },
    },
  };
  localStorage.setItem('sahraUser', JSON.stringify(state.user));
}

function areDeviceNotificationsEnabled() {
  if (state.user?.preferences?.reminderSettings?.enabled === false) return false;
  if (window.SAHRA_NOTIFICATIONS?.isNative?.()) {
    return window.SAHRA_NOTIFICATIONS.getCachedPermission?.() === 'granted';
  }
  return 'Notification' in window && Notification.permission === 'granted';
}

async function toggleDeviceNotifications() {
  const current = state.user?.preferences?.reminderSettings || {};
  const enabled = areDeviceNotificationsEnabled();
  if (enabled) {
    try {
      await saveReminderSettings({ enabled: false });
      if (window.SAHRA_NOTIFICATIONS?.isNative?.()) {
        await reconcileNativeNotifications();
      }
      showToast('Device notifications are off.');
    } catch (error) {
      showToast(error.message || 'Unable to turn notifications off.');
    }
    return;
  }

  try {
    if (window.SAHRA_NOTIFICATIONS?.isNative?.()) {
      const permission = await window.SAHRA_NOTIFICATIONS.reconcile([], { requestPermission: true });
      if (permission.permission !== 'granted') {
        showToast('Notification permission was not granted. Enable it in device settings to continue.');
        return;
      }
    } else {
      if (!('Notification' in window)) {
        showToast('Notifications are not supported in this browser.');
        return;
      }
      const permission = Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission();
      if (permission !== 'granted') {
        showToast('Notification permission was not granted.');
        return;
      }
    }

    await saveReminderSettings({ enabled: true });
    if (window.SAHRA_NOTIFICATIONS?.isNative?.()) {
      await reconcileNativeNotifications();
    } else {
      await checkDueNotifications();
    }
    showToast('Device notifications are on for task and event reminders.');
  } catch (error) {
    showToast(error.message || 'Unable to turn notifications on.');
  }
}

async function loadDashboardData() {
  const token = await getAuthToken();

  if (!token) {
    state.authenticated = false;
    window.location.href = getLoginPath();
    return;
  }
  state.authenticated = true;

  try {
    const payload = await apiRequest('/api/dashboard');

    state.data = {
      ...EMPTY_DATA,
      ...(payload.data || {}),
    };

    // Hide and remove the two explicitly identified test task names from all app views.
    const loadedTasks = Array.isArray(state.data.tasks) ? state.data.tasks : [];
    const junkTasks = loadedTasks.filter(isJunkTask);
    if (junkTasks.length) {
      state.data.tasks = loadedTasks.filter((task) => !isJunkTask(task));
      void Promise.all(junkTasks.map((task) => {
        const id = task?.id || task?._id;
        if (!id) return Promise.resolve();
        return apiRequest(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' })
          .catch((deleteError) => console.warn('Could not permanently remove a test task:', deleteError.message));
      }));
    }

    state.user = payload.user || state.user;

    localStorage.setItem(
      'sahraUser',
      JSON.stringify(state.user)
    );

    if (payload.user?.preferences?.theme) {
      applyTheme(payload.user.preferences.theme);
    } else {
      applyTheme(getStoredTheme());
    }

    await loadProgressData(false);
    checkDueNotifications();
    if (!notificationInterval) {
      notificationInterval = setInterval(checkDueNotifications, 30_000);
    }
    renderLayout();

 } catch (error) {
  console.error('Dashboard load failed:', error);

  /*
   * apiRequest() already handles HTTP 401
   * by clearing authentication and redirecting
   * to /login.
   *
   * Other server/network errors should NOT
   * destroy the user's authentication session.
   */

  if (state.data && !state.data.events) {
    state.data = { ...EMPTY_DATA };
  }

  renderLayout();
 }}


async function loadProgressData(renderWhenDone = true) {
  const year = Number(state.currentYear);
  const month = Number(state.currentMonth) + 1;
  if (!Number.isInteger(year) || !Number.isInteger(month)) return;
  state.progressLoading = true;
  try {
    const payload = await apiRequest(`/api/progress?year=${year}&month=${month}`);
    state.progressData = payload;
  } catch (error) {
    console.warn('Progress load failed:', error.message);
    state.progressData = null;
  } finally {
    state.progressLoading = false;
    if (renderWhenDone && state.view === 'progress') renderLayout();
  }
}

async function createResource(type, body) {
  const endpoints = {
    event: '/api/events',
    task: '/api/tasks',
    mood: '/api/moods',
    habit: '/api/habits',
    goal: '/api/goals',
    expense: '/api/expenses',
    subscription: '/api/subscriptions',
    asset: '/api/assets',
  };

  const endpoint = endpoints[type];
  if (!endpoint) return;

  let payload = body;
  if (type === 'expense' || type === 'subscription') {
    payload = {
      ...body,
      type: 'expense',
      amount: Number(body.amount),
      note: String(body.title || body.note || '').trim(),
      category: String(body.category || 'General').trim() || 'General',
      date: body.date || state.selectedDate,
      paymentMethod: body.paymentMethod || 'Cash',
    };
  }

  await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  await loadDashboardData();
  if (
    (type === 'event' || type === 'task') &&
    payload.reminder &&
    state.user?.preferences?.reminderSettings?.enabled !== false
  ) {
    await reconcileNativeNotifications();
  }
}

async function addQuickTaskFromInput(input) {
  if (!input) return;

  const title = input.value.trim();
  if (!title) {
    showToast('Please enter a task title.');
    input.focus();
    return;
  }
  if (isJunkTask({ title })) {
    showToast('Please choose a meaningful task title.');
    input.focus();
    return;
  }

  try {
    await createResource('task', {
      title,
      description: '',
      date: state.selectedDate,
      time: null,
      priority: 'Normal',
      status: 'Pending',
      completed: false,
      reminder: '',
      category: 'General',
    });
    input.value = '';
    showToast('Task added');
  } catch (error) {
    showToast(error.message || 'Unable to add task');
  }
}
function getReminderOffsetMs(reminder) {
  const match = String(reminder || '').toLowerCase().match(/(\d+)\s*(min(?:ute)?s?|hours?|days?)/);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit.startsWith('day')) return amount * 24 * 60 * 60 * 1000;
  if (unit.startsWith('hour')) return amount * 60 * 60 * 1000;
  return amount * 60 * 1000;
}
function getReminderMoment(item, resource) {
  const time = resource === 'event' ? item.startTime : item.time;
  if (!item?.date || !time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const scheduled = new Date(`${item.date}T${time}:00`);
  if (Number.isNaN(scheduled.getTime())) return null;
  return new Date(scheduled.getTime() - getReminderOffsetMs(item.reminder));
}
function stableNotificationId(resource, itemId) {
  const source = `${resource}:${itemId || ''}`;
  let hash = resource === 'event' ? 17 : 23;
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash * 31) + source.charCodeAt(index)) | 0;
  }
  return (Math.abs(hash) % 2_147_483_646) + 1;
}
function nativeReminderPayload(resource, item) {
  const scheduledAt = getReminderMoment(item, resource);
  const itemId = item.id || item._id;
  if (!scheduledAt || !itemId || scheduledAt.getTime() <= Date.now()) return null;
  const time = resource === 'event' ? item.startTime : item.time;
  return {
    id: stableNotificationId(resource, itemId),
    title: 'DaySync reminder',
    body: `${resource === 'event' ? 'Event' : 'Task'}: ${item.title}${time ? ` • ${time}` : ''}`,
    schedule: { at: scheduledAt, allowWhileIdle: true },
    channelId: 'daysync-reminders',
    sound: 'default',
    extra: { date: item.date, resource, id: String(itemId) },
  };
}
async function reconcileNativeNotifications({ requestPermission = false } = {}) {
  const bridge = window.SAHRA_NOTIFICATIONS;
  if (!bridge?.isNative?.()) return { native: false };

  const preferences = state.user?.preferences?.reminderSettings || {};
  const remindersEnabled = preferences.enabled !== false;
  const notifications = remindersEnabled
    ? [
      ...(preferences.tasksEnabled === false ? [] : state.data.tasks.filter((task) => !task.completed && task.status !== 'Completed').map((item) => nativeReminderPayload('task', item))),
      ...(preferences.eventsEnabled === false ? [] : state.data.events.map((item) => nativeReminderPayload('event', item))),
    ].filter(Boolean)
    : [];

  try {
    const result = await bridge.reconcile(notifications, { requestPermission });
    if (requestPermission && result.permission !== 'granted') {
      showToast('Notifications are disabled. You can enable them in your device settings.');
    } else if (requestPermission && result.scheduled) {
      showToast(`${result.scheduled} reminder${result.scheduled === 1 ? '' : 's'} registered on this device.`);
    }
    return result;
  } catch (error) {
    console.warn('Native reminder reconciliation failed:', error.message);
    if (requestPermission) showToast('DaySync could not register this device reminder.');
    return { native: true, error };
  }
}
async function showSahraNotification(resource, item) {
  const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
  const time = resource === 'event' ? item.startTime : item.time;
  const options = {
    body: `${resource === 'event' ? 'Event' : 'Task'}: ${item.title}${time ? ` • ${time}` : ''}`,
    icon: '/images/sahra.png',
    badge: '/images/sahra.png',
    tag: `sahra-${resource}-${item.id || item._id}`,
    data: { date: item.date, resource, id: item.id || item._id },
  };
  if (registration?.showNotification) {
    await registration.showNotification('DaySync reminder', options);
    return;
  }
  const notification = new Notification('DaySync reminder', options);
  notification.onclick = () => {
    window.focus();
    window.location.href = `/dashboard?date=${encodeURIComponent(item.date)}`;
  };
}
async function checkDueNotifications() {
  const preferences = state.user?.preferences?.reminderSettings || {};
  if (preferences.enabled === false) return;
  if (window.SAHRA_NOTIFICATIONS?.isNative?.()) {
    await reconcileNativeNotifications();
    return;
  }
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  const resources = [
    ...(preferences.tasksEnabled === false ? [] : state.data.tasks.map((item) => ({ resource: 'task', item }))),
    ...(preferences.eventsEnabled === false ? [] : state.data.events.map((item) => ({ resource: 'event', item }))),
  ];
  for (const { resource, item } of resources) {
    if (item.reminderNotifiedAt) continue;
    const dueAt = getReminderMoment(item, resource);
    if (!dueAt || now < dueAt.getTime() || now - dueAt.getTime() > 2 * 60 * 1000) continue;
    try {
      const response = await apiRequest('/api/notifications/mark-sent', {
        method: 'POST',
        body: JSON.stringify({ resource, id: item.id || item._id }),
      });
      if (response.sent) await showSahraNotification(resource, item);
    } catch (error) {
      console.warn('Reminder notification failed:', error.message);
    }
  }
}
async function loadSelectedDateData(dateString) {
  if (!state.authenticated || state.calendarCache.has(dateString)) return;

state.calendarCache.add(dateString);

  try {
    const payload = await apiRequest(`/api/calendar/${dateString}`);
    state.calendarCache.add(dateString);
    const nextTasks = payload.tasks || [];
    const nextEvents = payload.events || [];
    const nextMoods = payload.moods || [];

    state.data.tasks = [
      ...state.data.tasks.filter((task) => task.date !== dateString),
      ...nextTasks,
    ];
    state.data.events = [
      ...state.data.events.filter((event) => event.date !== dateString),
      ...nextEvents,
    ];
    state.data.moods = [
      ...state.data.moods.filter((mood) => mood.date !== dateString),
      ...nextMoods,
    ];
  }catch (error) {
    state.calendarCache.delete(dateString); // Allow retry if failed
    console.warn('Selected day data refresh failed:', error.message);
  }
}

async function setSelectedDate(dateString) {
  state.selectedDate = dateString;
  const [year, month, day] = dateString.split('-').map(Number);
  state.currentYear = year;
  state.currentMonth = month - 1;
  await loadSelectedDateData(dateString);
  renderLayout();
}

function shiftMonth(offset) {
  const nextDate = new Date(state.currentYear, state.currentMonth + offset, 1);
  state.currentYear = nextDate.getFullYear();
  state.currentMonth = nextDate.getMonth();
  renderLayout();
}

function getTodayLabel() {
  const today = new Date();
  return today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getProgress(tasks = []) {
  const total = tasks.length;
  if (!total) return 0;
  const completed = tasks.filter((task) => task.status === 'Completed').length;
  return Math.round((completed / total) * 100);
}

function isFutureDate(dateString) {
  if (!dateString) return false;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${dateString}T00:00:00`);
    return target > today;
  } catch (error) {
    return false;
  }
}

function isPastDate(dateString) {
  if (!dateString) return false;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${dateString}T00:00:00`);
    return target < today;
  } catch (error) {
    return false;
  }
}

function renderSahraLogo(size = 52) {
  return `
    <img
      class="sahra-logo"
      src="/images/sahra.png"
      alt="Sahra logo"
      width="${size}"
      height="${size}"
    />
  `;
}

function openEntryModal(type = 'event') {
  if (type === 'mood' && isFutureDate(state.selectedDate)) {
    window.alert('Future dates cannot have a mood.');
    return;
  }

  // Block both events and tasks for past dates
  if ((type === 'event' || type === 'task') && isPastDate(state.selectedDate)) {
    window.alert('Tasks and events can only be added for today or future dates.');
    return;
  }

  state.entryModalOpen = true;
  state.entryDraft = {
    type,
    title: '',
    description: '',
    date: state.selectedDate,
    startTime: '09:00',
    endTime: '10:00',
    category: 'General',
    reminder: '',
    priority: 'Normal',
    status: 'Pending',
    mood: '😊',
    note: '',
    goal: 1,
    frequency: 'Daily',
    target: 30,
    current: 0,
    duration: '30 days',
    time: '19:00',
    amount: '',
    renewalDate: state.selectedDate,
    content: '',
    tags: '',
  };
  renderLayout();
}

function setView(nextView) {
  // Prevent pushing duplicate consecutive views onto history
  if (state.view !== nextView) {
    if (state.view && state.view !== 'home') {
      state.navigationHistory.push(state.view);
    }
    state.view = nextView;
  }
  renderLayout();
}

function goBackFromView() {
  // Calendar is opened from Home's date/event overview; Back must return to Home,
  // rather than popping a stale Menu entry left from an earlier navigation.
  if (state.view === 'calendar') {
    state.view = 'home';
    state.navigationHistory = (state.navigationHistory || []).filter((view) => view !== 'menu' && view !== 'calendar');
    state.moreMenuOpen = false;
    state.menuOpen = false;
    renderLayout();
    return;
  }
  if (state.navigationHistory.length > 0) {
    state.view = state.navigationHistory.pop();
  } else {
    state.view = 'home';
  }
  renderLayout();
}

function closeEntryModal() {
  state.entryModalOpen = false;
  state.entryDraft = null;
  renderLayout();
}

window.sahraHandleNativeBack = () => {
  if (state.entryModalOpen) {
    closeEntryModal();
    return true;
  }
  if (state.profileModalOpen) {
    state.profileModalOpen = false;
    state.profileEditing = false;
    renderLayout();
    return true;
  }
  if (state.showFinanceResetConfirm) {
    state.showFinanceResetConfirm = false;
    renderLayout();
    return true;
  }
  if (state.financeDetail) {
    state.financeDetail = null;
    renderLayout();
    return true;
  }
  if (state.calendarDetail) {
    state.calendarDetail = null;
    renderLayout();
    return true;
  }
  if (state.moreMenuOpen || state.menuOpen || state.moodPickerOpen) {
    state.moreMenuOpen = false;
    state.menuOpen = false;
    state.moodPickerOpen = false;
    renderLayout();
    return true;
  }
  if (state.view !== 'home') {
    goBackFromView();
    return true;
  }
  return false;
};

function renderProfileModal() {
  if (!state.profileModalOpen) return '';
  const user = state.user || {};
  const profile = user.profile || {};
  const draft = state.profileDraft || {
    name: user.name || '',
    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : '',
  };
  const isEditing = Boolean(state.profileEditing);
  const successMessage = state.profileSuccessMessage || '';

  const formattedDob = profile.dateOfBirth
    ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Not set';

  const hasPhone = Boolean(profile.phone);

  return `
    <div class="entry-modal-backdrop visible" style="z-index: 2000;">
      <div class="entry-modal" style="width: min(100%, 390px); background: var(--panel-bg); border-color: var(--panel-border); padding: 20px;">
        <div class="entry-modal-header" style="margin-bottom: 14px;">
          <h3 style="font-size: 1.2rem; color: var(--text);">User Profile</h3>
          <button class="entry-close" type="button" data-action="close-profile-modal">✕</button>
        </div>

        ${successMessage ? `<div style="background: rgba(97, 245, 176, 0.15); color: #61f5b0; padding: 8px 12px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 12px; text-align: center;">${successMessage}</div>` : ''}

        <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div class="profile-avatar large" style="width: 64px; height: 64px; font-size: 1.8rem; margin: 0; background: linear-gradient(135deg, var(--purple), var(--cyan)); color: white; display: grid; place-items: center; border-radius: 20px; font-weight: 800;">
            ${(user.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div style="overflow: hidden;">
            <strong style="display: block; font-size: 1.2rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.name || 'DaySync User'}</strong>
            <span style="color: var(--muted); font-size: 0.82rem; word-break: break-all;">${user.email || ''}</span>
          </div>
        </div>

        ${isEditing ? `
          <div style="display: grid; gap: 12px;">
            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px;">
              Full Name
              <input class="profile-input" data-field="name" value="${(draft.name || '').replace(/"/g, '&quot;')}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.2); background: rgba(255,255,255,0.04); border-radius: 12px; padding: 11px 12px; color: var(--text);" />
            </label>

            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px;">
              Date of Birth
              <input class="profile-input" data-field="dateOfBirth" type="date" value="${draft.dateOfBirth || ''}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.2); background: rgba(255,255,255,0.04); border-radius: 12px; padding: 11px 12px; color: var(--text);" />
            </label>

            <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px; opacity: 0.75;">
              Email (Cannot be edited)
              <input type="email" disabled value="${user.email || ''}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.1); background: rgba(255,255,255,0.02); border-radius: 12px; padding: 11px 12px; color: var(--muted); cursor: not-allowed;" />
            </label>

            ${hasPhone ? `
              <label style="color: var(--muted); font-size: 0.82rem; display: grid; gap: 6px; opacity: 0.75;">
                Phone Number (Cannot be edited)
                <input type="text" disabled value="${profile.phone}" style="width: 100%; border: 1px solid rgba(160, 177, 255, 0.1); background: rgba(255,255,255,0.02); border-radius: 12px; padding: 11px 12px; color: var(--muted); cursor: not-allowed;" />
              </label>
            ` : ''}

            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 10px;">
              <button class="secondary-btn" type="button" data-action="profile-cancel-edit" style="padding: 10px 14px; border-radius: 12px; border: none; background: rgba(255,255,255,0.06); color: var(--text); cursor: pointer;">Cancel</button>
              <button class="primary-btn compact-btn" type="button" data-action="profile-save" style="padding: 10px 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #9d82ff, #68d5ff); color: white; font-weight: 700; cursor: pointer;">Save</button>
            </div>
          </div>
        ` : `
          <div style="display: grid; gap: 8px; margin-bottom: 16px;">
            <div class="profile-row" style="display: flex; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 12px; color: var(--muted); font-size: 0.88rem;">
              <span>Date of Birth</span>
              <strong style="color: var(--text);">${formattedDob}</strong>
            </div>

            <div class="profile-row" style="display: flex; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 12px; color: var(--muted); font-size: 0.88rem;">
              <span>Email</span>
              <strong style="color: var(--text);">${user.email || 'Not set'}</strong>
            </div>

            ${hasPhone ? `
              <div class="profile-row" style="display: flex; justify-content: space-between; padding: 10px 12px; background: rgba(255,255,255,0.03); border-radius: 12px; color: var(--muted); font-size: 0.88rem;">
                <span>Phone</span>
                <strong style="color: var(--text);">${profile.phone}</strong>
              </div>
            ` : ''}
          </div>

          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="secondary-btn" type="button" data-action="close-profile-modal" style="padding: 10px 14px; border-radius: 12px; border: none; background: rgba(255,255,255,0.06); color: var(--text); cursor: pointer;">Close</button>
            <button class="primary-btn compact-btn" type="button" data-action="profile-start-edit" style="padding: 10px 16px; border-radius: 12px; border: none; background: linear-gradient(135deg, #9d82ff, #68d5ff); color: white; font-weight: 700; cursor: pointer;">Edit Profile</button>
          </div>
        `}
      </div>
    </div>
  `;
}
function renderEntryModal() {
  if (!state.entryModalOpen || !state.entryDraft) return '';

  const moodOptions = ['😊', '😐', '😢', '😡', '😴', '🔥', '😍'];
  const draft = state.entryDraft;
  const modalTitle = draft.type === 'task' ? 'Add Task' : draft.type === 'mood' ? 'Add Mood' : draft.type === 'note' ? 'Add Note' : 'Add Event';

  return `
    <div class="entry-modal-backdrop visible">
      <div class="entry-modal">
        <div class="entry-modal-header">
          <h3>${modalTitle}</h3>
          <button class="entry-close" type="button" data-action="close-entry-modal">✕</button>
        </div>

        <div class="entry-form">

          <!-- 1. STRICTLY NOTE FORM (Only Title & Description) -->
          ${draft.type === 'note' ? `
            <label class="entry-field">
              <span>Title</span>
              <input type="text" data-entry-field="title" value="${(draft.title || '').replace(/"/g, '&quot;')}" placeholder="e.g., My Grocery List" />
            </label>
            <label class="entry-field">
              <span>Description</span>
              <textarea rows="6" data-entry-field="description" placeholder="Type your note, password, or list here...">${(draft.description || draft.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
            </label>
          ` : ''}

          <!-- 2. TASK FORM -->
          ${draft.type === 'task' ? `
            <label class="entry-field">
              <span>Task Name</span>
              <input type="text" data-entry-field="title" value="${(draft.title || '').replace(/"/g, '&quot;')}" placeholder="Study JavaScript" />
            </label>
            <label class="entry-field">
              <span>Date</span>
              <input type="date" data-entry-field="date" min="${formatDateKey(new Date())}" value="${draft.date || state.selectedDate}" />
            </label>
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Time</span>
                <input type="time" data-entry-field="time" value="${draft.time || '19:00'}" />
              </label>
              <label class="entry-field">
                <span>Priority</span>
                <select data-entry-field="priority">
                  <option value="Low" ${draft.priority === 'Low' ? 'selected' : ''}>Low</option>
                  <option value="Normal" ${draft.priority === 'Normal' ? 'selected' : ''}>Normal</option>
                  <option value="High" ${draft.priority === 'High' ? 'selected' : ''}>High</option>
                </select>
              </label>
            </div>
            <label class="entry-field">
              <span>Reminder</span>
              <select data-entry-field="reminder">
                <option value="" ${!draft.reminder ? 'selected' : ''}>No reminder</option>
                <option value="5 minutes before" ${draft.reminder === '5 minutes before' ? 'selected' : ''}>5 minutes before</option>
                <option value="10 minutes before" ${draft.reminder === '10 minutes before' ? 'selected' : ''}>10 minutes before</option>
                <option value="15 minutes before" ${draft.reminder === '15 minutes before' ? 'selected' : ''}>15 minutes before</option>
                <option value="30 minutes before" ${draft.reminder === '30 minutes before' ? 'selected' : ''}>30 minutes before</option>
                <option value="1 hour before" ${draft.reminder === '1 hour before' ? 'selected' : ''}>1 hour before</option>
              </select>
            </label>
          ` : ''}

          <!-- 3. EVENT FORM -->
          ${draft.type === 'event' ? `
            <label class="entry-field">
              <span>Date</span>
              <input type="date" data-entry-field="date" min="${formatDateKey(new Date())}" value="${draft.date || state.selectedDate}" />
            </label>
            <label class="entry-field">
              <span>Title</span>
              <input type="text" data-entry-field="title" value="${(draft.title || '').replace(/"/g, '&quot;')}" placeholder="Enter title here" />
            </label>
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Start</span>
                <input type="time" data-entry-field="startTime" value="${draft.startTime || '09:00'}" />
              </label>
              <label class="entry-field">
                <span>End</span>
                <input type="time" data-entry-field="endTime" value="${draft.endTime || '10:00'}" />
              </label>
            </div>
            <label class="entry-field">
              <span>Category</span>
              <input type="text" data-entry-field="category" value="${(draft.category || 'General').replace(/"/g, '&quot;')}" placeholder="General" />
            </label>
            <label class="entry-field">
              <span>Reminder</span>
              <select data-entry-field="reminder">
                <option value="" ${!draft.reminder ? 'selected' : ''}>No reminder</option>
                <option value="5 minutes before" ${draft.reminder === '5 minutes before' ? 'selected' : ''}>5 minutes before</option>
                <option value="10 minutes before" ${draft.reminder === '10 minutes before' ? 'selected' : ''}>10 minutes before</option>
                <option value="15 minutes before" ${draft.reminder === '15 minutes before' ? 'selected' : ''}>15 minutes before</option>
                <option value="30 minutes before" ${draft.reminder === '30 minutes before' ? 'selected' : ''}>30 minutes before</option>
                <option value="1 hour before" ${draft.reminder === '1 hour before' ? 'selected' : ''}>1 hour before</option>
              </select>
            </label>
            <label class="entry-field">
              <span>Description</span>
              <textarea rows="3" data-entry-field="description" placeholder="Add details">${(draft.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
            </label>
          ` : ''}

          <!-- 4. ASSET FORM -->
          ${draft.type === 'asset' ? `
            <label class="entry-field">
              <span>Title / Name</span>
              <input type="text" data-entry-field="title" value="${(draft.title || '').replace(/"/g, '&quot;')}" placeholder="e.g., Round Robin Snippet" />
            </label>
            <label class="entry-field">
              <span>Content / Code / Prompt</span>
              <textarea rows="6" data-entry-field="content" placeholder="Paste your reference material here...">${(draft.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
            </label>
          ` : ''}

          <!-- 5. EXPENSE FORM -->
          ${draft.type === 'expense' || draft.type === 'subscription' ? `
            <label class="entry-field">
              <span>${draft.type === 'expense' ? 'Expense Name' : 'Service Name'}</span>
              <input type="text" data-entry-field="title" value="${(draft.title || '').replace(/"/g, '&quot;')}" placeholder="e.g., Server Hosting" />
            </label>
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Amount ($)</span>
                <input type="number" step="0.01" min="0" data-entry-field="amount" value="${draft.amount || ''}" placeholder="0.00" />
              </label>
              <label class="entry-field">
                <span>${draft.type === 'expense' ? 'Date' : 'Next Renewal'}</span>
                <input type="date" data-entry-field="${draft.type === 'expense' ? 'date' : 'renewalDate'}" value="${draft.type === 'expense' ? (draft.date || state.selectedDate) : (draft.renewalDate || state.selectedDate)}" />
              </label>
            </div>
            <label class="entry-field">
              <span>Category</span>
              <input type="text" data-entry-field="category" value="${(draft.category || '').replace(/"/g, '&quot;')}" placeholder="e.g., Software" />
            </label>
            <label class="entry-field">
              <span>Description</span>
              <textarea rows="3" data-entry-field="description" placeholder="Add details">${(draft.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
            </label>
          ` : ''}

          <!-- 6. MOOD & HABIT & GOALS (Abbreviated to keep it clean) -->
          ${draft.type === 'mood' ? `
            <div class="mood-picker-wrap">
              <span class="mood-picker-label">Mood</span>
              <div class="mood-picker-grid">
                ${moodOptions.map((mood) => `
                  <button type="button" class="mood-option ${draft.mood === mood ? 'selected' : ''}" data-entry-field="mood" data-entry-value="${mood}">${mood}</button>
                `).join('')}
              </div>
            </div>
            <label class="entry-field">
              <span>Note</span>
              <textarea rows="3" data-entry-field="note" placeholder="Add a quick note">${(draft.note || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
            </label>
          ` : ''}

          <div class="entry-form-actions">
            <button class="secondary-btn" type="button" data-action="close-entry-modal">Cancel</button>
            <button class="primary-btn compact-btn" type="button" data-action="save-entry">${draft.type === 'task' ? 'Add Task' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderProfilePage() {
  const user = state.user || {};
  const profile = user.profile || {};
  const draft = state.profileDraft || {
    name: user.name || '',
    email: user.email || '',
    dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : '',
    location: profile.location || '',
    gender: profile.gender || '',
  };

  if (state.profileEditing) {
    return `
      

        <div class="glass-card profile-panel">
          <div class="profile-avatar large">${(user.name || 'S').charAt(0).toUpperCase()}</div>
          <div class="profile-form-grid">
            <label>
              Full Name
              <input class="profile-input" data-field="name" value="${(draft.name || '').replace(/"/g, '&quot;')}" />
            </label>
            <label>
              Email
              <input class="profile-input" data-field="email" type="email" value="${(draft.email || '').replace(/"/g, '&quot;')}" />
            </label>
            <label>
              Date of Birth
              <input class="profile-input" data-field="dateOfBirth" type="date" value="${draft.dateOfBirth || ''}" />
            </label>
            <label>
              Location
              <input class="profile-input" data-field="location" value="${(draft.location || '').replace(/"/g, '&quot;')}" />
            </label>
            <label>
              Gender
              <input class="profile-input" data-field="gender" value="${(draft.gender || '').replace(/"/g, '&quot;')}" />
            </label>
          </div>

          <div class="profile-actions">
            <button class="secondary-btn" type="button" data-action="profile-cancel">Cancel</button>
            <button class="primary-btn compact-btn" type="button" data-action="profile-save">Save Changes</button>
          </div>
        </div>
      </section>
    `;
  }

  return `
   <div class="page-header profile-header">
  <h2>Profile</h2>
</div>

      <div class="glass-card profile-panel">
        <div class="profile-avatar large">${(user.name || 'S').charAt(0).toUpperCase()}</div>
        <div class="profile-name">${user.name || 'DaySync User'}</div>
        <div class="profile-email">${user.email || 'No email'}</div>

        <div class="profile-details">
          <div class="profile-row"><span>Date of Birth</span><strong>${profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set'}</strong></div>
          <div class="profile-row"><span>Location</span><strong>${profile.location || 'Not set'}</strong></div>
          <div class="profile-row"><span>Gender</span><strong>${profile.gender || 'Not set'}</strong></div>
          <div class="profile-row"><span>Theme</span><strong>${state.theme === 'light' ? 'Light Mode' : 'Dark Mode'}</strong></div>
        </div>

        <button class="primary-btn compact-btn" type="button" data-action="profile-edit">Edit Profile</button>
      </div>
    </section>
  `;
}

function renderHomePage() {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const monthLabel = new Date(state.currentYear, state.currentMonth, 1).toLocaleDateString('en-IN', {
    month: 'long', year: 'numeric',
  });
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfMonth = new Date(state.currentYear, state.currentMonth, 1);
  const offset = firstDayOfMonth.getDay();
  const totalDaysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(state.currentYear, state.currentMonth, 0).getDate();
  const entriesByDate = {
    events: new Set((state.data.events || []).map((event) => getRecordDateKey(event.date))),
    tasks: new Set((state.data.tasks || []).filter((task) => !isJunkTask(task)).map((task) => getRecordDateKey(task.date))),
    moods: new Set((state.data.moods || []).map((mood) => getRecordDateKey(mood.date))),
  };
  const calendarDays = [];
  for (let i = 0; i < offset; i += 1) {
    calendarDays.push({ value: totalDaysInPrevMonth - offset + i + 1, empty: true });
  }
  for (let day = 1; day <= totalDaysInMonth; day += 1) {
    const iso = formatDateKey(new Date(state.currentYear, state.currentMonth, day));
    calendarDays.push({
      value: day, empty: false, active: iso === state.selectedDate, iso,
      hasEvent: entriesByDate.events.has(iso), hasTask: entriesByDate.tasks.has(iso), hasMood: entriesByDate.moods.has(iso),
    });
  }
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({ value: calendarDays.length - totalDaysInMonth - offset + 1, empty: true });
  }

  const allTasks = (Array.isArray(state.data.tasks) ? state.data.tasks : []).filter((task) => !isJunkTask(task));
  const todaysTasks = allTasks.filter((task) => getRecordDateKey(task.date) === todayKey)
    .sort((a, b) => Number(Boolean(a.completed || a.status === 'Completed')) - Number(Boolean(b.completed || b.status === 'Completed')));
  const completedToday = todaysTasks.filter((task) => task.completed || task.status === 'Completed').length;
  const totalToday = todaysTasks.length;
  const progressPercent = totalToday ? Math.round((completedToday / totalToday) * 100) : 0;
  const todaysEvents = (Array.isArray(state.data.events) ? state.data.events : [])
    .filter((event) => getRecordDateKey(event.date) === todayKey)
    .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
  const transactions = Array.isArray(state.financeData) ? state.financeData : [];
  const todaysTransactions = transactions.filter((transaction) => getRecordDateKey(transaction.date) === todayKey);
  const incomeOf = (rows) => rows.filter((row) => String(row.type || '').toLowerCase() === 'income')
    .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const expenseOf = (rows) => rows.filter((row) => String(row.type || '').toLowerCase() === 'expense')
    .reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
  const todaysIncome = incomeOf(todaysTransactions);
  const todaysExpense = expenseOf(todaysTransactions);
  const totalBalance = incomeOf(transactions) - expenseOf(transactions);
  const deviceNotificationsEnabled = areDeviceNotificationsEnabled();
  const isLightTheme = state.theme === 'light';
  const weather = state.weather || {};
  const liveCurrent = weather.data?.current;
  const liveDaily = weather.data?.daily;
  const weatherCode = liveCurrent?.weather_code;
  const weatherText = liveCurrent ? weatherConditionText(weatherCode) : 'Tap View Weather for live conditions';
  const weatherIcon = liveCurrent ? weatherConditionIcon(weatherCode, liveCurrent.is_day) : '☁️';
  const eventCountForSelectedDay = state.data.events.filter((event) => getRecordDateKey(event.date) === state.selectedDate).length;
  const selectedWeatherLocation = weather.locationLabel ? escapeHtml(weather.locationLabel) : 'Local forecast';

  return `
    <section class="screen home-screen" aria-label="DaySync home">
      <section class="hero glass-card page-fixed-header home-hero">
        <div class="hero-top">
          <div class="brand">
            <div class="brand-mark">${renderSahraLogo(52)}</div>
            <div class="brand-text"><h1>DaySync</h1><p>DAILY PLANNER</p></div>
          </div>
        </div>
      </section>

      <section class="glass-card layout-card date-weather-card home-weather-card" aria-label="Weather overview">
        <div class="weather-topline">
          <div class="weather-date-copy">
            <div class="date-weather-day">${today.toLocaleDateString('en-IN', { weekday: 'long' })}</div>
            <div class="date-weather-date">${today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <button class="weather-view-button" type="button" data-action="open-weather"><span>View Weather</span><span aria-hidden="true">↗</span></button>
        </div>
        <div class="weather-overview-row">
          <div class="date-weather-temp-wrap">
            <div class="temp-value">${liveCurrent ? `${Math.round(Number(liveCurrent.temperature_2m))}°` : '—°'}<span>C</span></div>
            <div class="weather-meta">${escapeHtml(weatherText)}</div>
            ${liveCurrent && liveDaily ? `<div class="weather-range">H ${Math.round(Number(liveDaily.temperature_2m_max?.[0]))}° · L ${Math.round(Number(liveDaily.temperature_2m_min?.[0]))}°</div>` : `<div class="weather-range">${weather.status === 'error' ? 'Weather unavailable' : 'Live data · no sample values'}</div>`}
          </div>
          <div class="weather-icon" aria-hidden="true">${weatherIcon}</div>
        </div>
        <div class="weather-live-footer"><span class="weather-live-dot ${liveCurrent ? 'is-live' : ''}"></span><span>${liveCurrent ? `Live · ${selectedWeatherLocation}` : (weather.status === 'loading' ? 'Loading live weather…' : 'Real weather appears after you open View Weather')}</span></div>
      </section>

      <section class="glass-card layout-card calendar-card">
        <div class="calendar-header"><h3>${monthLabel}</h3><div class="calendar-actions">
          <button class="calendar-arrow" type="button" data-action="prev-month" aria-label="Previous month">‹</button>
          <button class="calendar-arrow" type="button" data-action="next-month" aria-label="Next month">›</button>
          <button class="today-button" type="button" data-action="today">Today</button>
        </div></div>
        <div class="calendar-grid">
          ${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join('')}
          ${calendarDays.map((day) => {
            const indicators = [];
            if (day.hasEvent) indicators.push('<span class="mini-indicator event"></span>');
            if (day.hasTask) indicators.push('<span class="mini-indicator task"></span>');
            if (day.hasMood) indicators.push('<span class="mini-indicator mood"></span>');
            return `<button class="calendar-day ${day.empty ? 'dim' : ''} ${day.active ? 'selected' : ''}" type="button" data-date="${day.iso || ''}" ${day.empty ? 'disabled' : ''}><span>${day.value}</span>${indicators.length ? `<span class="calendar-indicators">${indicators.join('')}</span>` : ''}</button>`;
          }).join('')}
        </div>
        <div class="event-row">
          <div class="event-status"><span class="status-dot"></span><span>${eventCountForSelectedDay ? `Selected day has ${eventCountForSelectedDay} event(s)` : 'No events on this day'}</span></div>
          <div class="event-actions"><button class="show-event" type="button" data-action="show-selected-day">Show</button><button class="add-event" type="button" data-action="open-add-entry" data-type="event">+ Add Event</button></div>
        </div>
      </section>

      <section class="glass-card layout-card progress-card">
        <div class="card-header compact"><h3>Today's Progress</h3><span class="chip">${progressPercent}%</span></div>
        <div class="progress-block"><div class="progress-row"><div class="progress-label"><span>Today's task completion</span><strong>${progressPercent}%</strong></div><div class="progress-bar"><div class="progress-fill" style="width:${progressPercent}%"></div></div></div></div>
        <div class="progress-footer">${completedToday} / ${totalToday} tasks complete today</div>
      </section>

      <section class="daily-programs-section" aria-label="Today's Programs">
        <header class="daily-programs-heading"><div><p class="daily-programs-eyebrow">YOUR DAY AT A GLANCE</p><h2>Today's Programs</h2><p>Everything planned and recorded for today.</p></div><span class="daily-date-pill">${today.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span></header>

        <section class="glass-card daily-program-card daily-tasks-panel">
          <div class="daily-program-card-header"><div class="daily-program-title"><span class="daily-program-icon">✓</span><div><h3>Today's Tasks</h3><p>${completedToday} of ${totalToday} complete</p></div></div><button class="daily-view-link" type="button" data-view="tasks">View all <span>↗</span></button></div>
          ${todaysTasks.length ? `<div class="daily-task-list">${todaysTasks.map((task) => {
            const done = Boolean(task.completed || task.status === 'Completed');
            const priority = String(task.priority || 'Normal');
            const priorityClass = priority.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const time = task.time ? new Date(`2000-01-01T${String(task.time).slice(0,5)}:00`).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '';
            const id = task.id || task._id || '';
            return `<article class="daily-task-row ${done ? 'is-complete' : ''}"><button type="button" class="daily-task-check ${done ? 'is-checked' : ''}" data-action="toggle-task" data-task-id="${escapeAttribute(id)}" aria-label="${done ? 'Mark incomplete' : 'Complete'} ${escapeAttribute(task.title || task.name || 'task')}">${done ? '✓' : ''}</button><div class="daily-task-copy"><strong>${escapeHtml(task.title || task.name || 'Untitled task')}</strong><span>${time ? `${escapeHtml(time)} · ` : ''}${escapeHtml(task.category || 'Task')}</span></div><span class="daily-priority priority-${priorityClass}">${escapeHtml(priority)}</span></article>`;
          }).join('')}</div>` : `<div class="daily-empty-state"><span class="daily-empty-icon">✓</span><div><strong>No tasks for today</strong><p>Add a task with today's date to plan your day.</p></div><button type="button" class="daily-add-button" data-action="open-add-entry" data-type="task">+ Add Task</button></div>`}
        </section>

        <section class="glass-card daily-program-card daily-events-panel">
          <div class="daily-program-card-header"><div class="daily-program-title"><span class="daily-program-icon">▦</span><div><h3>Today's Events</h3><p>${todaysEvents.length} scheduled</p></div></div><button class="daily-view-link" type="button" data-action="view-today-events">View all <span>↗</span></button></div>
          ${todaysEvents.length ? `<div class="daily-event-list">${todaysEvents.map((event) => {
            const time = event.time ? String(event.time).slice(0,5) : '';
            return `<article class="daily-event-row"><span class="daily-event-time">${time ? escapeHtml(time) : 'All day'}</span><span class="daily-event-marker" aria-hidden="true"></span><div class="daily-event-copy"><strong>${escapeHtml(event.title || event.name || 'Untitled event')}</strong><span>${escapeHtml(event.location || event.category || (event.description ? String(event.description).slice(0,80) : 'Scheduled today'))}</span></div><span class="daily-reminder-icon" title="${event.reminder ? 'Reminder set' : 'No reminder shown'}" aria-label="${event.reminder ? 'Reminder set' : 'No reminder shown'}">${event.reminder ? '🔔' : '◷'}</span></article>`;
          }).join('')}</div>` : `<div class="daily-empty-state"><span class="daily-empty-icon">▦</span><div><strong>No events for today</strong><p>Your saved events for today will appear here.</p></div><button type="button" class="daily-add-button" data-action="open-add-entry" data-type="event">+ Add Event</button></div>`}
        </section>

        <section class="glass-card daily-program-card daily-finance-panel">
          <div class="daily-program-card-header"><div class="daily-program-title"><span class="daily-program-icon">₹</span><div><h3>Income &amp; Expenses</h3><p>From your saved transactions</p></div></div><button class="daily-view-link" type="button" data-view="finance">Finance <span>↗</span></button></div>
          <div class="daily-money-grid">
            <article class="daily-money-card income"><span>Today's income</span><strong>${formatINR(todaysIncome)}</strong></article>
            <article class="daily-money-card expense"><span>Today's expenses</span><strong>${formatINR(todaysExpense)}</strong></article>
            <article class="daily-money-card net"><span>Today's net</span><strong>${formatINR(todaysIncome - todaysExpense)}</strong><small>Income minus expenses today</small></article>
            <article class="daily-money-card balance"><span>Total balance</span><strong>${formatINR(totalBalance)}</strong><small>All saved income minus expenses</small></article>
          </div>
          ${todaysTransactions.length ? `<div class="daily-transactions-list"><h4>Today's transactions</h4>${todaysTransactions.slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).map((transaction) => {
            const isIncome = String(transaction.type || '').toLowerCase() === 'income';
            return `<div class="daily-transaction-row"><span class="daily-transaction-type ${isIncome ? 'is-income' : 'is-expense'}">${isIncome ? '↙' : '↗'}</span><span class="daily-transaction-name">${escapeHtml(transaction.category || transaction.title || transaction.note || (isIncome ? 'Income' : 'Expense'))}<small>${escapeHtml(transaction.note || transaction.description || transaction.paymentMethod || transaction.payment_method || '')}</small></span><strong class="${isIncome ? 'money-positive' : 'money-negative'}">${isIncome ? '+' : '−'}${formatINR(transaction.amount).replace(/^₹\s?/, '₹')}</strong></div>`;
          }).join('')}</div>` : `<p class="daily-finance-empty">No income or expense transactions recorded today.</p>`}
        </section>
      </section>
    </section>
  `;
}

function weatherConditionText(code) {
  const c = Number(code);
  if (c === 0) return 'Clear sky';
  if (c === 1) return 'Mainly clear';
  if (c === 2) return 'Partly cloudy';
  if (c === 3) return 'Overcast';
  if (c === 45 || c === 48) return 'Foggy';
  if ([51, 53, 55].includes(c)) return 'Drizzle';
  if ([56, 57].includes(c)) return 'Freezing drizzle';
  if ([61, 63, 65].includes(c)) return 'Rain';
  if ([66, 67].includes(c)) return 'Freezing rain';
  if ([71, 73, 75, 77].includes(c)) return 'Snow';
  if ([80, 81, 82].includes(c)) return 'Rain showers';
  if ([85, 86].includes(c)) return 'Snow showers';
  if (c === 95) return 'Thunderstorm';
  if ([96, 99].includes(c)) return 'Thunderstorm with hail';
  return 'Conditions unavailable';
}

function weatherConditionIcon(code, isDay = 1) {
  const c = Number(code);
  if (c === 0) return Number(isDay) ? '☀️' : '🌙';
  if ([1, 2].includes(c)) return Number(isDay) ? '🌤️' : '☁️';
  if (c === 3) return '☁️';
  if ([45, 48].includes(c)) return '🌫️';
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(c)) return '🌧️';
  if ([71,73,75,77,85,86].includes(c)) return '🌨️';
  if ([95,96,99].includes(c)) return '⛈️';
  return '🌦️';
}

function formatWeatherTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value).slice(-5) : date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

function renderWeatherPage() {
  const weather = state.weather || {};
  const data = weather.data;
  const current = data?.current;
  const daily = data?.daily;
  const hourly = data?.hourly;
  const currentHour = current && hourly?.time?.length ? Math.max(0, hourly.time.reduce((best, value, index) => {
    const target = Date.parse(current.time || '');
    const candidate = Date.parse(value || '');
    if (!Number.isFinite(candidate) || !Number.isFinite(target)) return best;
    return Math.abs(candidate - target) < Math.abs(Date.parse(hourly.time[best] || '') - target) ? index : best;
  }, 0)) : 0;
  const light = state.theme === 'light';
  const safeLocation = escapeHtml(weather.locationLabel || 'Current location');
  const metric = (label, value, hint = '', icon = '•') => `<article class="weather-metric-card"><span class="weather-metric-icon" aria-hidden="true">${icon}</span><div class="weather-metric-copy"><span>${label}</span><strong>${value}</strong>${hint ? `<small>${hint}</small>` : ''}</div></article>`;
  const statusContent = weather.status === 'loading'
    ? `<div class="weather-status-panel is-loading"><span class="weather-spinner"></span><div><strong>Getting real weather…</strong><p>Fetching current conditions and the forecast.</p></div></div>`
    : weather.status === 'error'
      ? `<div class="weather-status-panel is-error"><span class="weather-status-symbol">!</span><div><strong>Weather unavailable</strong><p>${escapeHtml(weather.error || 'Could not fetch weather data.')}</p><p>Allow location access or search for a city below.</p>${window.Capacitor?.isNativePlatform?.() && /location|permission|gps|services|denied/i.test(weather.error || '') ? `<div class="weather-permission-actions"><button type="button" data-action="open-location-permission-settings">App permissions</button><button type="button" data-action="open-device-location-settings">Device location</button></div>` : ''}</div></div>`
      : !current
        ? `<div class="weather-status-panel"><span class="weather-status-symbol">☁</span><div><strong>Live weather, not estimates</strong><p>Use your device location or search a city to load current weather from the forecast service.</p></div></div>`
        : '';
  return `
    <section class="screen weather-page" aria-label="Detailed weather">
      <header class="weather-page-header"><button type="button" class="weather-back-button" data-action="weather-back" aria-label="Back to home">‹</button><div class="weather-page-heading"><p>DAYSYNC • LIVE FORECAST</p><h1>Weather</h1><span>${safeLocation}</span></div><button type="button" class="weather-refresh-button" data-action="weather-refresh" ${weather.status === 'loading' ? 'disabled' : ''} aria-label="Refresh weather">↻</button></header>
      ${statusContent}
      ${current && data ? `
        <section class="weather-hero-panel">
          <div class="weather-hero-top"><span class="weather-live-label"><i></i> LIVE DATA</span><span class="weather-updated">Updated ${escapeHtml(formatWeatherTime(weather.updatedAt))}</span></div>
          <div class="weather-hero-main"><div><p class="weather-condition-label">${escapeHtml(weatherConditionText(current.weather_code))}</p><div class="weather-hero-temperature">${Math.round(Number(current.temperature_2m))}<span>°C</span></div><p class="weather-feels-like">Feels like ${Math.round(Number(current.apparent_temperature))}°C</p></div><div class="weather-hero-icon" aria-hidden="true">${weatherConditionIcon(current.weather_code, current.is_day)}</div></div>
          <div class="weather-hero-range"><span>Today’s high <strong>${Math.round(Number(daily?.temperature_2m_max?.[0]))}°</strong></span><span>Today’s low <strong>${Math.round(Number(daily?.temperature_2m_min?.[0]))}°</strong></span></div>
        </section>
        <section class="weather-detail-section"><div class="weather-section-heading"><div><p>RIGHT NOW</p><h2>Weather details</h2></div><span>Real-time forecast</span></div>
          <div class="weather-metrics-grid">
            ${metric('Humidity', `${Math.round(Number(current.relative_humidity_2m))}%`, 'Relative humidity', '◌')}
            ${metric('Wind speed', `${Math.round(Number(current.wind_speed_10m))} km/h`, `Direction ${Math.round(Number(current.wind_direction_10m))}°`, '↗')}
            ${metric('Wind gusts', `${Math.round(Number(current.wind_gusts_10m))} km/h`, 'Peak wind gust', '≋')}
            ${metric('Pressure', `${Math.round(Number(current.pressure_msl))} hPa`, 'Sea-level pressure', '⌁')}
            ${metric('Visibility', Number.isFinite(Number(hourly?.visibility?.[currentHour])) ? `${(Number(hourly.visibility[currentHour]) / 1000).toFixed(1)} km` : '—', 'Forecast estimate', '◉')}
            ${metric('Dew point', Number.isFinite(Number(hourly?.dew_point_2m?.[currentHour])) ? `${Math.round(Number(hourly.dew_point_2m[currentHour]))}°C` : '—', 'Moisture in the air', '❄')}
            ${metric('UV index', Number.isFinite(Number(hourly?.uv_index?.[currentHour])) ? Number(hourly.uv_index[currentHour]).toFixed(1) : (Number.isFinite(Number(daily?.uv_index_max?.[0])) ? `Max ${Number(daily.uv_index_max[0]).toFixed(1)}` : '—'), 'Sun exposure level', '☼')}
            ${metric('Precipitation', `${Number(current.precipitation || 0).toFixed(1)} mm`, `Rain ${Number(current.rain || 0).toFixed(1)} mm · Showers ${Number(current.showers || 0).toFixed(1)} mm`, '☂')}
            ${metric('Cloud cover', `${Math.round(Number(current.cloud_cover))}%`, 'Sky covered by clouds', '☁')}
            ${metric('Rain chance', Number.isFinite(Number(hourly?.precipitation_probability?.[currentHour])) ? `${Math.round(Number(hourly.precipitation_probability[currentHour]))}%` : (Number.isFinite(Number(daily?.precipitation_probability_max?.[0])) ? `${Math.round(Number(daily.precipitation_probability_max[0]))}% max today` : '—'), 'Probability of precipitation', '◒')}
          </div>
        </section>
        <section class="weather-sun-grid"><article class="weather-sun-card sunrise"><span>☀</span><div><small>Sunrise</small><strong>${escapeHtml(formatWeatherTime(daily?.sunrise?.[0]))}</strong></div></article><article class="weather-sun-card sunset"><span>☾</span><div><small>Sunset</small><strong>${escapeHtml(formatWeatherTime(daily?.sunset?.[0]))}</strong></div></article></section>
        <section class="weather-detail-section"><div class="weather-section-heading"><div><p>COMING UP</p><h2>Hourly forecast</h2></div><span>Next 6 hours</span></div><div class="weather-hourly-strip">${(hourly?.time || []).slice(currentHour, currentHour + 6).map((time, idx) => { const i = currentHour + idx; return `<article class="weather-hour-card"><span>${idx === 0 ? 'Now' : escapeHtml(formatWeatherTime(time))}</span><span class="weather-hour-icon">${weatherConditionIcon(hourly.weather_code?.[i], 1)}</span><strong>${Math.round(Number(hourly.temperature_2m?.[i]))}°</strong><small>${Number.isFinite(Number(hourly.precipitation_probability?.[i])) ? `${Math.round(Number(hourly.precipitation_probability[i]))}% rain` : escapeHtml(weatherConditionText(hourly.weather_code?.[i]))}</small></article>`; }).join('')}</div></section>
        <section class="weather-detail-section"><div class="weather-section-heading"><div><p>PLAN AHEAD</p><h2>7-day forecast</h2></div><span>Daily outlook</span></div><div class="weather-daily-list">${(daily?.time || []).map((date, i) => `<article class="weather-daily-row"><div class="weather-daily-day"><strong>${i === 0 ? 'Today' : escapeHtml(new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'short' }))}</strong><small>${escapeHtml(new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }))}</small></div><span class="weather-daily-icon">${weatherConditionIcon(daily.weather_code?.[i], 1)}</span><span class="weather-daily-condition">${escapeHtml(weatherConditionText(daily.weather_code?.[i]))}</span><div class="weather-daily-temps"><span>${Math.round(Number(daily.temperature_2m_min?.[i]))}°</span><i><b style="width:${Math.max(8, Math.min(100, (Number(daily.temperature_2m_max?.[i]) - Number(daily.temperature_2m_min?.[i]) + 8) * 5))}%"></b></i><strong>${Math.round(Number(daily.temperature_2m_max?.[i]))}°</strong></div></article>`).join('')}</div></section>
      ` : ''}
      <section class="weather-search-panel"><div><p>LOCATION</p><h2>Check another city</h2><span>Search a city to load its real forecast.</span></div><form data-weather-search-form class="weather-search-form"><input name="city" type="search" placeholder="Enter city or town" autocomplete="off" required minlength="2" aria-label="City for weather forecast"><button type="submit" ${weather.status === 'loading' ? 'disabled' : ''}>Search</button></form><button type="button" class="weather-use-location" data-action="weather-refresh" ${weather.status === 'loading' ? 'disabled' : ''}>↗ Use my current location</button></section>
      <p class="weather-source-note">Weather and forecast provided by Open-Meteo. Location access is used only to find local forecast coordinates.</p>
    </section>`;
}

async function openDaySyncNativeSettings(method) {
  const plugin = window.Capacitor?.Plugins?.DaySyncSettings;
  if (!window.Capacitor?.isNativePlatform?.() || typeof plugin?.[method] !== 'function') {
    showToast('Open your device Settings and select DaySync permissions.');
    return;
  }
  try { await plugin[method](); }
  catch (error) { showToast(error.message || 'Could not open device settings.'); }
}

async function geocodeWeatherCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: city, count: '1', language: 'en', format: 'json' })}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('City search failed. Please try again.');
  const payload = await response.json();
  const place = payload.results?.[0];
  if (!place) throw new Error(`No location found for “${city}”. Check the spelling and try again.`);
  return { latitude: place.latitude, longitude: place.longitude, label: [place.name, place.admin1, place.country].filter(Boolean).filter((x, i, arr) => arr.indexOf(x) === i).join(', ') };
}

async function getBrowserCoordinates() {
  const isNative = Boolean(window.Capacitor?.isNativePlatform?.());
  if (isNative) {
    try {
      let permissions = await Geolocation.checkPermissions();
      const allowed = () => permissions.location === 'granted' || permissions.coarseLocation === 'granted';
      if (!allowed()) {
        permissions = await Geolocation.requestPermissions({ permissions: ['location', 'coarseLocation'] });
      }
      if (!allowed()) {
        throw new Error('Location permission was denied. Allow DaySync location access in Android Settings, or search for a city below.');
      }
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: permissions.location === 'granted',
        timeout: 15000,
        maximumAge: 5 * 60 * 1000,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        label: 'Your current location',
      };
    } catch (error) {
      const message = String(error?.message || '');
      if (/denied|permission/i.test(message)) {
        throw new Error('Location permission is unavailable. Enable location for DaySync in Android Settings, or search for a city below.');
      }
      if (/disabled|services|location provider/i.test(message)) {
        throw new Error('Turn on device location services and try again, or search for a city below.');
      }
      throw new Error(`${message || 'Could not determine your device location.'} You can also search for a city below.`);
    }
  }

  if (!navigator.geolocation) throw new Error('This browser does not support location access. Search for a city below.');
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude, label: 'Your current location' }),
      (error) => reject(new Error(error.code === 1
        ? 'Location permission was denied. Allow location access in browser settings, or search for a city below.'
        : error.code === 2
          ? 'Your location is unavailable. Turn on location services or search for a city below.'
          : 'Location lookup timed out. Try again or search for a city below.')),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

async function fetchLiveWeather(location, requestId) {
  const params = new URLSearchParams({
    latitude: String(location.latitude), longitude: String(location.longitude),
    current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    hourly: 'temperature_2m,precipitation_probability,weather_code,visibility,dew_point_2m,uv_index',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max',
    timezone: 'auto', forecast_days: '7', wind_speed_unit: 'kmh', temperature_unit: 'celsius', precipitation_unit: 'mm',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Weather service returned ${response.status}. Please try again.`);
  const data = await response.json();
  if (!data.current || !data.daily || !data.hourly) throw new Error('The weather service returned incomplete data. Please refresh.');
  if (state.weather.requestId !== requestId) return;
  state.weather = { ...state.weather, status: 'success', data, locationLabel: location.label, error: '', updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem('daysyncWeatherLocation', JSON.stringify({ latitude: Number(location.latitude), longitude: Number(location.longitude), label: String(location.label || 'Selected location') }));
  } catch (_) {}
}

async function loadWeatherForCurrentLocation(city = '') {
  const requestId = Number(state.weather.requestId || 0) + 1;
  state.weather = { ...state.weather, requestId, status: 'loading', error: '', data: null };
  if (state.view === 'weather') renderLayout();
  try {
    let location;
    if (city) {
      location = await geocodeWeatherCity(city);
    } else {
      try {
        location = await getBrowserCoordinates();
      } catch (locationError) {
        let savedWeatherLocation = null;
        try { savedWeatherLocation = JSON.parse(localStorage.getItem('daysyncWeatherLocation') || 'null'); } catch (_) {}
        if (savedWeatherLocation && Number.isFinite(Number(savedWeatherLocation.latitude)) && Number.isFinite(Number(savedWeatherLocation.longitude)) && Math.abs(Number(savedWeatherLocation.latitude)) <= 90 && Math.abs(Number(savedWeatherLocation.longitude)) <= 180) {
          location = { latitude: Number(savedWeatherLocation.latitude), longitude: Number(savedWeatherLocation.longitude), label: `${String(savedWeatherLocation.label || 'Selected location')} · last selected` };
        } else {
          const savedLocation = state.user?.location || state.user?.preferences?.location || state.user?.city || '';
          if (!String(savedLocation).trim()) throw new Error(`${locationError.message} Allow location access in your browser, or search for a city below.`);
          location = await geocodeWeatherCity(String(savedLocation));
          location.label = `${location.label} · saved profile location`;
        }
      }
    }
    await fetchLiveWeather(location, requestId);
  } catch (error) {
    if (state.weather.requestId === requestId) {
      state.weather = { ...state.weather, status: 'error', error: error.message || 'Unable to load weather data.' };
    }
  } finally {
    if (state.view === 'weather' && state.weather.requestId === requestId) renderLayout();
  }
}


function renderFocusPage() {
  const total = Math.max(1, Number(state.focusInitialSeconds) || 1500);
  const left = Math.max(0, Number(state.focusSeconds) || 0);
  const progress = Math.min(100, Math.max(0, ((total - left) / total) * 100));
  const mm = String(Math.floor(left / 60)).padStart(2, '0');
  const ss = String(left % 60).padStart(2, '0');
  const light = state.theme === 'light';
  const sessions = Array.isArray(state.focusSessions) ? state.focusSessions : [];
  const todayKey = formatDateKey(new Date());
  const todaySessions = sessions.filter((x) => x.date === todayKey && x.completed);
  const todayMinutes = todaySessions.reduce((sum, x) => sum + (Number(x.minutes) || 0), 0);
  return `
    <section class="screen focus-screen" aria-label="Focus Timer">
      <header class="focus-header">
        <button class="focus-back" type="button" data-action="focus-back" aria-label="Back">‹</button>
        <div class="focus-title-copy"><p class="focus-eyebrow">DAYSYNC • FOCUS SESSION</p><h1>Focus Timer</h1></div>
        <span class="focus-mode-pill">${state.focusRunning ? 'FOCUSING' : state.focusAlarmActive ? 'COMPLETE' : 'READY'}</span>
      </header>
      <div class="focus-card glass-card">
        <div class="focus-label-row"><label for="focus-label">Session</label><input id="focus-label" maxlength="60" value="${escapeAttribute(state.focusLabel || 'Study session')}" placeholder="Study session" /></div>
        <div class="focus-ring-wrap">
          <svg class="focus-ring" viewBox="0 0 240 240" role="img" aria-label="Timer progress">
            <circle class="focus-ring-track" cx="120" cy="120" r="101"></circle>
            <circle class="focus-ring-progress" cx="120" cy="120" r="101" style="stroke-dasharray: ${2*Math.PI*101}; stroke-dashoffset: ${(2*Math.PI*101)*(1-progress/100)}"></circle>
          </svg>
          <div class="focus-clock"><strong id="focus-clock">${mm}:${ss}</strong><span id="focus-status">${state.focusRunning ? 'STAY IN THE FLOW' : state.focusAlarmActive ? 'SESSION COMPLETE' : 'READY WHEN YOU ARE'}</span></div>
        </div>
        <div class="focus-controls">
          <button type="button" class="focus-control secondary" data-action="focus-reset" aria-label="Reset timer" title="Reset">↺</button>
          <button type="button" class="focus-control primary" data-action="focus-toggle" aria-label="${state.focusRunning ? 'Pause timer' : 'Start timer'}">${state.focusRunning ? 'Ⅱ' : '▶'}</button>
          <button type="button" class="focus-control secondary" data-action="focus-stop" aria-label="Stop timer" title="Stop">■</button>
        </div>
        <div class="focus-custom"><label for="focus-minutes">Session length</label><div class="focus-custom-row"><input id="focus-minutes" type="number" min="1" max="180" value="${Math.max(1, Math.round((state.focusSeconds > 0 ? state.focusSeconds : total)/60))}" ${state.focusRunning ? 'disabled' : ''}/><span>minutes</span><button type="button" data-action="focus-set" ${state.focusRunning ? 'disabled' : ''}>Set time</button></div></div>
        <div class="focus-presets"><button type="button" data-focus-minutes="15" ${state.focusRunning ? 'disabled' : ''}>15 min</button><button type="button" data-focus-minutes="25" ${state.focusRunning ? 'disabled' : ''}>25 min</button><button type="button" data-focus-minutes="45" ${state.focusRunning ? 'disabled' : ''}>45 min</button><button type="button" data-focus-minutes="60" ${state.focusRunning ? 'disabled' : ''}>60 min</button></div>
        <p class="focus-tip">${light ? 'A clear mind starts with one focused session.' : 'One session. One goal. Keep your momentum.'}</p>
      </div>
      <div class="focus-stats"><div class="focus-stat glass-card"><span>Today’s focus</span><strong>${todayMinutes} <small>min</small></strong></div><div class="focus-stat glass-card"><span>Sessions completed</span><strong>${todaySessions.length}</strong></div><div class="focus-stat glass-card"><span>Total sessions</span><strong>${sessions.filter((x)=>x.completed).length}</strong></div></div>
    </section>`;
}

let focusTicker = null;
const focusCompletionNotificationId = 941207;
let focusAudioContext = null;
let focusAudioNodes = [];
let focusAudioInterval = null;
let focusAudioStopTimeout = null;
let lastFocusPersistedSecond = -1;
const FOCUS_TIMER_STORAGE_KEY = 'daysyncFocusTimerState';

function focusCreateSessionId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function persistFocusTimerState() {
  try {
    localStorage.setItem(FOCUS_TIMER_STORAGE_KEY, JSON.stringify({
      focusSeconds: Number(state.focusSeconds) || 0,
      focusInitialSeconds: Number(state.focusInitialSeconds) || 1500,
      focusRunning: Boolean(state.focusRunning),
      focusEndsAt: Number(state.focusEndsAt) || null,
      focusLabel: String(state.focusLabel || 'Study session').slice(0, 60),
      focusAlarmActive: Boolean(state.focusAlarmActive),
      focusAlarmStartedAt: Number(state.focusAlarmStartedAt) || null,
      focusSessionId: state.focusSessionId || null,
      focusLastCompletedId: state.focusLastCompletedId || null,
    }));
  } catch (error) { console.warn('Could not persist Focus Timer state:', error); }
}
function focusStopAudio({ closeContext = true } = {}) {
  if (focusAudioInterval) clearInterval(focusAudioInterval);
  if (focusAudioStopTimeout) clearTimeout(focusAudioStopTimeout);
  focusAudioInterval = null;
  focusAudioStopTimeout = null;
  focusAudioNodes.forEach((node) => { try { node.stop(); } catch (_) {} });
  focusAudioNodes = [];
  if (closeContext && focusAudioContext) {
    const context = focusAudioContext;
    focusAudioContext = null;
    try { void context.close(); } catch (_) {}
  }
}
function focusPrimeAudio() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;
  try {
    if (!focusAudioContext || focusAudioContext.state === 'closed') focusAudioContext = new AudioCtx();
    if (focusAudioContext.state === 'suspended') void focusAudioContext.resume().catch(() => {});
  } catch (error) { console.warn('Focus alarm audio could not be prepared:', error); }
}
function focusStartAlarmTone(durationMs = 10000) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx || durationMs <= 0) return;
  focusStopAudio({ closeContext: false });
  try {
    if (!focusAudioContext || focusAudioContext.state === 'closed') focusAudioContext = new AudioCtx();
    const context = focusAudioContext;
    if (context.state === 'suspended') void context.resume().catch(() => {});
    const startedAt = Date.now();
    const pulse = () => {
      if (!focusAudioContext || focusAudioContext !== context || Date.now() - startedAt >= durationMs) return;
      const now = context.currentTime;
      [0, 0.18].forEach((delay, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.value = index ? 1046.5 : 880;
        gain.gain.setValueAtTime(0.0001, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.2, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.15);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now + delay);
        oscillator.stop(now + delay + 0.17);
        focusAudioNodes.push(oscillator);
        oscillator.onended = () => { focusAudioNodes = focusAudioNodes.filter((node) => node !== oscillator); try { oscillator.disconnect(); gain.disconnect(); } catch (_) {} };
      });
    };
    pulse();
    focusAudioInterval = setInterval(pulse, 650);
    focusAudioStopTimeout = setTimeout(() => focusStopAudio({ closeContext: true }), durationMs);
  } catch (error) {
    console.warn('Focus alarm audio is unavailable on this device:', error);
    focusStopAudio();
  }
}
async function focusCancelNotification({ removeDelivered = false } = {}) {
  if (!window.Capacitor?.isNativePlatform?.()) return;
  try {
    await LocalNotifications.cancel({ notifications: [{ id: focusCompletionNotificationId }] });
    if (removeDelivered) await LocalNotifications.removeDeliveredNotifications({ notifications: [{ id: focusCompletionNotificationId }] });
  } catch (error) { console.warn('Could not cancel Focus Timer notification:', error.message); }
}
async function focusScheduleNotification(seconds) {
  if (!window.Capacitor?.isNativePlatform?.()) {
    if ('Notification' in window && Notification.permission === 'default') {
      try { await Notification.requestPermission(); } catch (_) {}
    }
    return;
  }
  try {
    if (window.SAHRA_NOTIFICATIONS?.ready) await window.SAHRA_NOTIFICATIONS.ready;
    let permission = await LocalNotifications.checkPermissions();
    if (permission.display !== 'granted' && ['prompt', 'prompt-with-rationale', 'unknown'].includes(permission.display)) {
      permission = await LocalNotifications.requestPermissions();
    }
    if (permission.display !== 'granted') {
      showToast('Enable DaySync notifications in Android Settings to receive timer alerts while the app is in the background.');
      return;
    }
    await LocalNotifications.schedule({ notifications: [{
      id: focusCompletionNotificationId,
      title: 'Focus session complete',
      body: `${state.focusLabel || 'Your focus session'} is finished. Tap Reset to start another session.`,
      schedule: { at: new Date(Date.now() + Math.max(1, seconds) * 1000), allowWhileIdle: true },
      sound: 'daysync_alarm.wav',
      channelId: 'daysync-focus-alarm',
      actionTypeId: 'daysync-focus-alarm',
      autoCancel: false,
      extra: { type: 'focus-alarm', sessionId: String(state.focusSessionId || '') },
    }] });
  } catch (error) {
    console.warn('Could not schedule background Focus Timer alert:', error.message);
    showToast('The on-screen timer works, but Android could not schedule its background alert. Check notification/alarm permissions in Settings.');
  }
}
function focusUpdateClock() {
  const clock = document.getElementById('focus-clock');
  if (clock) clock.textContent = `${String(Math.floor(state.focusSeconds / 60)).padStart(2, '0')}:${String(state.focusSeconds % 60).padStart(2, '0')}`;
  const progress = document.querySelector('.focus-ring-progress');
  if (progress) progress.style.strokeDashoffset = `${(2 * Math.PI * 101) * (1 - (state.focusInitialSeconds - state.focusSeconds) / Math.max(1, state.focusInitialSeconds))}`;
}
function focusFinish() {
  if (state.focusAlarmActive || (!state.focusRunning && state.focusSeconds === 0 && state.focusLastCompletedId === state.focusSessionId)) return;
  clearInterval(focusTicker); focusTicker = null;
  state.focusRunning = false;
  state.focusStartedAt = null;
  state.focusEndsAt = null;
  state.focusSeconds = 0;
  if (!state.focusSessionId) state.focusSessionId = focusCreateSessionId();
  if (state.focusLastCompletedId !== state.focusSessionId) {
    const minutes = Math.max(1, Math.round((state.focusInitialSeconds || 1500) / 60));
    const sessions = Array.isArray(state.focusSessions) ? state.focusSessions : [];
    sessions.unshift({ date: formatDateKey(new Date()), minutes, label: state.focusLabel || 'Study session', completed: true, completedAt: new Date().toISOString(), sessionId: state.focusSessionId });
    state.focusSessions = sessions.slice(0, 500);
    state.focusLastCompletedId = state.focusSessionId;
    try { localStorage.setItem('sahraFocusSessions', JSON.stringify(state.focusSessions)); } catch (_) {}
  }
  state.focusAlarmActive = true;
  state.focusAlarmStartedAt = Date.now();
  persistFocusTimerState();
  if (document.visibilityState !== 'hidden') focusStartAlarmTone(10000);
  if ('Notification' in window && Notification.permission === 'granted' && !window.Capacitor?.isNativePlatform?.() && document.visibilityState === 'hidden') {
    try { new Notification('DaySync Focus Timer', { body: `${state.focusLabel || 'Focus session'} is complete.`, icon: './image-192.png', tag: 'daysync-focus-complete' }); } catch (_) {}
  }
  if (document.visibilityState === 'visible') void focusCancelNotification({ removeDelivered: true });
  showToast('Focus session complete! Your alarm will stop after 10 seconds.');
  renderLayout();
}
function focusTick() {
  if (!state.focusRunning || !state.focusEndsAt) return;
  state.focusSeconds = Math.max(0, Math.ceil((state.focusEndsAt - Date.now()) / 1000));
  if (state.focusSeconds !== lastFocusPersistedSecond) {
    lastFocusPersistedSecond = state.focusSeconds;
    persistFocusTimerState();
  }
  focusUpdateClock();
  if (state.focusSeconds <= 0) focusFinish();
}
function focusStartTicker({ resume = false } = {}) {
  clearInterval(focusTicker);
  state.focusRunning = true;
  if (!resume || !state.focusEndsAt) state.focusEndsAt = Date.now() + Math.max(1, state.focusSeconds) * 1000;
  state.focusStartedAt = Date.now();
  if (!state.focusSessionId || state.focusLastCompletedId === state.focusSessionId) state.focusSessionId = focusCreateSessionId();
  state.focusAlarmActive = false;
  state.focusAlarmStartedAt = null;
  lastFocusPersistedSecond = -1;
  persistFocusTimerState();
  void focusScheduleNotification(state.focusSeconds);
  focusTick();
  if (state.focusRunning) focusTicker = setInterval(focusTick, 250);
  renderLayout();
}
function focusPause() {
  if (!state.focusRunning) return;
  state.focusSeconds = Math.max(0, Math.ceil(((state.focusEndsAt || Date.now()) - Date.now()) / 1000));
  state.focusRunning = false;
  state.focusStartedAt = null;
  state.focusEndsAt = null;
  clearInterval(focusTicker); focusTicker = null;
  void focusCancelNotification();
  persistFocusTimerState();
  renderLayout();
}
function focusDismissAlarm({ reset = false, expectedSessionId = null } = {}) {
  if (expectedSessionId && state.focusSessionId && expectedSessionId !== state.focusSessionId) return;
  focusStopAudio();
  state.focusAlarmActive = false;
  state.focusAlarmStartedAt = null;
  state.focusRunning = false;
  state.focusEndsAt = null;
  clearInterval(focusTicker); focusTicker = null;
  void focusCancelNotification({ removeDelivered: true });
  if (reset) {
    state.view = 'focus';
    state.focusSeconds = Math.max(1, Number(state.focusInitialSeconds) || 1500);
    state.focusSessionId = null;
  }
  persistFocusTimerState();
  renderLayout();
}
function renderFocusAlarmOverlay() {
  document.getElementById('daysync-focus-alarm-overlay')?.remove();
  if (!state.focusAlarmActive) return;
  const banner = document.createElement('section');
  banner.id = 'daysync-focus-alarm-overlay';
  banner.className = 'daysync-focus-alarm';
  banner.setAttribute('role', 'alertdialog');
  banner.setAttribute('aria-live', 'assertive');
  banner.innerHTML = `
    <div class="daysync-focus-alarm-copy"><span class="daysync-focus-alarm-icon" aria-hidden="true">⏱</span><div><strong>Focus session completed</strong><p>${escapeHtml(state.focusLabel || 'Your focus session')} is finished.</p></div></div>
    <div class="daysync-focus-alarm-actions"><button type="button" data-focus-alarm-action="stop">Stop</button><button type="button" data-focus-alarm-action="reset">Reset</button></div>`;
  document.body.appendChild(banner);
}
function handleFocusAlarmAction({ actionId, sessionId } = {}) {
  const expected = sessionId ? String(sessionId) : null;
  if (expected && state.focusSessionId && expected !== String(state.focusSessionId)) return;
  if (state.focusRunning && state.focusEndsAt && state.focusEndsAt <= Date.now()) focusFinish();
  if (actionId === 'stop') focusDismissAlarm({ expectedSessionId: expected });
  if (actionId === 'reset') focusDismissAlarm({ reset: true, expectedSessionId: expected });
}
window.SAHRA_HANDLE_FOCUS_ALARM_ACTION = handleFocusAlarmAction;
function processPendingFocusAlarmAction() {
  try {
    const raw = localStorage.getItem('daysyncPendingFocusAlarmAction');
    if (!raw) return;
    localStorage.removeItem('daysyncPendingFocusAlarmAction');
    handleFocusAlarmAction(JSON.parse(raw));
  } catch (error) { console.warn('Could not restore Focus Timer notification action:', error); }
}
function restorePersistedFocusTimer() {
  try {
    const saved = JSON.parse(localStorage.getItem(FOCUS_TIMER_STORAGE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return;
    state.focusInitialSeconds = Math.max(60, Math.min(180 * 60, Number(saved.focusInitialSeconds) || 1500));
    state.focusSeconds = Math.max(0, Math.min(state.focusInitialSeconds, Number(saved.focusSeconds) || 0));
    state.focusLabel = String(saved.focusLabel || 'Study session').slice(0, 60);
    state.focusSessionId = saved.focusSessionId || null;
    state.focusLastCompletedId = saved.focusLastCompletedId || null;
    state.focusAlarmActive = Boolean(saved.focusAlarmActive);
    state.focusAlarmStartedAt = Number(saved.focusAlarmStartedAt) || null;
    if (saved.focusRunning && Number(saved.focusEndsAt) > 0) {
      state.focusRunning = true;
      state.focusEndsAt = Number(saved.focusEndsAt);
      state.focusSeconds = Math.max(0, Math.ceil((state.focusEndsAt - Date.now()) / 1000));
      if (state.focusSeconds <= 0) focusFinish();
      else focusStartTicker({ resume: true });
    } else {
      state.focusRunning = false;
      state.focusEndsAt = null;
      if (state.focusAlarmActive) {
        const alarmAge = state.focusAlarmStartedAt ? Date.now() - state.focusAlarmStartedAt : 10000;
        if (alarmAge >= 0 && alarmAge < 10000 && document.visibilityState !== 'hidden') focusStartAlarmTone(10000 - alarmAge);
      }
      persistFocusTimerState();
    }
  } catch (error) { console.warn('Could not restore Focus Timer state:', error); }
  renderLayout();
}
function bindFocusTimer() {
  const app = document.getElementById('app');
  if (!app || state.view !== 'focus') return;
  const label = app.querySelector('#focus-label');
  label?.addEventListener('change', () => { state.focusLabel = label.value.trim() || 'Study session'; persistFocusTimerState(); });
  app.querySelectorAll('[data-focus-minutes]').forEach((button) => button.addEventListener('click', () => {
    if (state.focusRunning) return;
    const minutes = Math.max(1, Math.min(180, Number(button.dataset.focusMinutes) || 25));
    state.focusSeconds = state.focusInitialSeconds = minutes * 60;
    state.focusSessionId = null;
    state.focusAlarmActive = false;
    persistFocusTimerState();
    renderLayout();
  }));
  app.querySelectorAll('[data-action^="focus-"]').forEach((button) => button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'focus-back') { goBackFromView(); }
    if (action === 'focus-toggle') {
      if (state.focusRunning) focusPause();
      else {
        const labelInput = document.getElementById('focus-label');
        state.focusLabel = labelInput?.value?.trim() || state.focusLabel || 'Study session';
        if (state.focusSeconds <= 0) state.focusSeconds = state.focusInitialSeconds;
        if (!state.focusSessionId || state.focusLastCompletedId === state.focusSessionId) state.focusSessionId = focusCreateSessionId();
        focusStopAudio();
        focusPrimeAudio();
        focusStartTicker();
      }
    }
    if (action === 'focus-reset') {
      state.focusRunning = false; state.focusEndsAt = null; clearInterval(focusTicker); focusTicker = null;
      focusStopAudio(); void focusCancelNotification({ removeDelivered: true });
      state.focusAlarmActive = false; state.focusAlarmStartedAt = null; state.focusSeconds = state.focusInitialSeconds; state.focusSessionId = null;
      persistFocusTimerState(); renderLayout();
    }
    if (action === 'focus-stop') {
      state.focusRunning = false; state.focusEndsAt = null; clearInterval(focusTicker); focusTicker = null;
      focusStopAudio(); void focusCancelNotification({ removeDelivered: true });
      state.focusAlarmActive = false; state.focusAlarmStartedAt = null; state.focusSeconds = state.focusInitialSeconds = 25*60; state.focusSessionId = null;
      persistFocusTimerState(); renderLayout();
    }
    if (action === 'focus-set') {
      const input = document.getElementById('focus-minutes');
      const minutes = Math.max(1, Math.min(180, Number(input?.value) || 25));
      state.focusSeconds = state.focusInitialSeconds = minutes*60; state.focusSessionId = null; state.focusAlarmActive = false;
      persistFocusTimerState(); renderLayout();
    }
  }));
}

document.addEventListener('click', (event) => {
  const alarmAction = event.target.closest('[data-focus-alarm-action]');
  if (!alarmAction) return;
  handleFocusAlarmAction({ actionId: alarmAction.dataset.focusAlarmAction, sessionId: state.focusSessionId });
});

window.addEventListener('daysync:resume', () => {
  if (state.focusRunning) focusTick();
  if (state.focusAlarmActive) renderFocusAlarmOverlay();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (state.focusRunning) focusTick();
  if (state.focusAlarmActive) renderFocusAlarmOverlay();
});

function renderProgressPage() {
  const tasks = Array.isArray(state.data.tasks) ? state.data.tasks : [];
  const events = Array.isArray(state.data.events) ? state.data.events : [];
  const habits = Array.isArray(state.data.habits) ? state.data.habits : [];
  const goals = Array.isArray(state.data.goals) ? state.data.goals : [];

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const currentMonthName =
    months[state.currentMonth] || months[new Date().getMonth()];

  const todayIso = formatDateKey(new Date());
    /* ---------------------------------------------------------
   * MONTHLY FINANCE SUMMARY
   * --------------------------------------------------------- */

  const monthlyTransactions = (Array.isArray(state.financeData)
    ? state.financeData
    : []
  ).filter((transaction) => {
    if (!transaction?.date) return false;

    const transactionDate = new Date(transaction.date);

    if (Number.isNaN(transactionDate.getTime())) return false;

    return (
      transactionDate.getFullYear() === Number(state.currentYear) &&
      transactionDate.getMonth() === Number(state.currentMonth)
    );
  });

  const monthlyIncome = monthlyTransactions
    .filter(
      (transaction) =>
        String(transaction.type || '').toLowerCase() === 'income'
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  const monthlyExpense = monthlyTransactions
    .filter(
      (transaction) =>
        String(transaction.type || '').toLowerCase() === 'expense'
    )
    .reduce(
      (total, transaction) =>
        total + Number(transaction.amount || 0),
      0
    );

  const monthlyBalance = monthlyIncome - monthlyExpense;

  /*
   * ---------------------------------------------------------
   * MONTH TASKS
   * ---------------------------------------------------------
   */

  const monthTasks = tasks.filter((task) => {
    if (!task.date) return false;

    const parts = String(task.date)
      .slice(0, 10)
      .split('-');

    if (parts.length < 3) return false;

    const taskYear = Number(parts[0]);
    const taskMonth = Number(parts[1]) - 1;

    return (
      taskYear === Number(state.currentYear) &&
      taskMonth === Number(state.currentMonth)
    );
  });

  const fallbackCompletedTasks = monthTasks.filter(
    (task) =>
      task.completed ||
      task.status === 'Completed'
  ).length;

  const fallbackPendingTasks = monthTasks.filter(
    (task) =>
      !task.completed &&
      task.status !== 'Completed'
  ).length;

  const fallbackOverdueTasks = monthTasks.filter((task) => {
    const completed =
      task.completed ||
      task.status === 'Completed';

    if (completed) return false;

    return (
      task.status === 'Overdue' ||
      (task.date && String(task.date).slice(0, 10) < todayIso)
    );
  }).length;

  const fallbackTotalTasks = monthTasks.length;

  /*
   * ---------------------------------------------------------
   * MONTH EVENTS
   * ---------------------------------------------------------
   */

  const monthEvents = events.filter((event) => {
    if (!event.date) return false;

    const parts = String(event.date)
      .slice(0, 10)
      .split('-');

    if (parts.length < 3) return false;

    const eventYear = Number(parts[0]);
    const eventMonth = Number(parts[1]) - 1;

    return (
      eventYear === Number(state.currentYear) &&
      eventMonth === Number(state.currentMonth)
    );
  });

  /*
   * ---------------------------------------------------------
   * FALLBACK ACTIVITY
   * ---------------------------------------------------------
   */

  const fallbackActivity = [
    ...monthTasks.map((task) => ({
      type:
        task.completed || task.status === 'Completed'
          ? 'task-complete'
          : 'task-pending',

      label:
        task.completed || task.status === 'Completed'
          ? `Completed task “${task.title}”`
          : `Task “${task.title}”`,

      timeLabel: task.date
        ? formatFriendlyDate(task.date)
        : 'This month'
    })),

    ...monthEvents.map((event) => ({
      type: 'event',
      label: `Event “${event.title}”`,
      timeLabel: event.date
        ? formatFriendlyDate(event.date)
        : 'This month'
    })),

    ...habits.slice(0, 2).map((habit) => ({
      type: 'habit',
      label: `Habit “${habit.name}”`,
      timeLabel: habit.frequency || 'Daily'
    })),

    ...goals.slice(0, 2).map((goal) => ({
      type: 'goal',
      label: `Goal “${goal.title}”`,
      timeLabel: goal.status || 'Active'
    }))
  ];

  /*
   * ---------------------------------------------------------
   * USE REAL BACKEND PROGRESS DATA WHEN AVAILABLE
   * ---------------------------------------------------------
   */

  const selectedProgress =
    state.progressData?.period?.year === Number(state.currentYear) &&
    state.progressData?.period?.month === Number(state.currentMonth) + 1
      ? state.progressData
      : null;

  const stats = selectedProgress?.stats || {
    totalTasks: fallbackTotalTasks,
    completedTasks: fallbackCompletedTasks,
    pendingTasks: fallbackPendingTasks,
    overdueTasks: fallbackOverdueTasks,

    completionPercent:
      fallbackTotalTasks > 0
        ? Math.round(
            (fallbackCompletedTasks / fallbackTotalTasks) * 100
          )
        : 0
  };

  const totalTasks = Number(stats.totalTasks || 0);
  const completedTasks = Number(stats.completedTasks || 0);
  const pendingTasks = Number(stats.pendingTasks || 0);
  const overdueTasks = Number(stats.overdueTasks || 0);

  const completionPercent = Math.max(
    0,
    Math.min(
      100,
      Number(stats.completionPercent || 0)
    )
  );

  const activityItems = (
    selectedProgress?.activity || fallbackActivity
  )
    .map((item) => ({
      ...item,
      timeLabel:
        item.timeLabel ||
        formatActivityTime(item.occurredAt)
    }))
    .slice(0, 10);

  /*
   * ---------------------------------------------------------
   * MONTH PICKER
   * ---------------------------------------------------------
   */

  const pickerOpenClass =
    state.progressPickerOpen ? 'open' : '';

  return `
    <section class="screen dashboard-screen">

      <!-- TOP BAR -->

      <header class="dashboard-topbar page-fixed-header">

        <button
          class="back-button"
          type="button"
          data-action="back-home"
        >
          ← Back
        </button>

        <!-- MONTH SELECTOR -->

        <div class="month-picker-wrapper ${pickerOpenClass}">

          <button
            class="month-picker"
            type="button"
            data-action="toggle-progress-picker"
            aria-label="Select month and year"
            aria-expanded="${
              state.progressPickerOpen
                ? 'true'
                : 'false'
            }"
          >

            <span class="picker-icon">
              🗓️
            </span>

            <span class="picker-label">

              <span class="picker-month">
                ${currentMonthName}
              </span>

              <span class="picker-year">
                ${state.currentYear}
              </span>

            </span>

            <span class="caret">
              ⌄
            </span>

          </button>

          <!-- BACKDROP -->

          <div
            class="month-picker-backdrop ${pickerOpenClass}"
            data-action="close-progress-picker"
          ></div>

          <!-- PICKER -->

          <div
            class="month-picker-popover ${pickerOpenClass}"
            role="dialog"
            aria-modal="true"
            aria-label="Month and year picker"
          >

            <div class="month-picker-header">

              <button
                class="month-picker-nav"
                type="button"
                data-action="progress-year-change"
                data-direction="-1"
                aria-label="Previous year"
              >
                ‹
              </button>

              <div class="year-selector-row">

                <button
                  class="year-chip"
                  type="button"
                  data-action="progress-year-set"
                  data-year="${state.currentYear - 1}"
                >
                  ${state.currentYear - 1}
                </button>

                <span
                  class="year-chip active"
                  aria-current="true"
                >
                  ${state.currentYear}
                </span>

                <button
                  class="year-chip"
                  type="button"
                  data-action="progress-year-set"
                  data-year="${state.currentYear + 1}"
                >
                  ${state.currentYear + 1}
                </button>

              </div>

              <button
                class="month-picker-nav"
                type="button"
                data-action="progress-year-change"
                data-direction="1"
                aria-label="Next year"
              >
                ›
              </button>

            </div>

            <div class="month-picker-grid">

              ${months
                .map(
                  (month, index) => `
                    <button
                      class="month-option ${
                        index === state.currentMonth
                          ? 'active'
                          : ''
                      }"
                      type="button"
                      data-progress-month="${index}"
                      aria-pressed="${
                        index === state.currentMonth
                          ? 'true'
                          : 'false'
                      }"
                    >
                      ${month}
                    </button>
                  `
                )
                .join('')}

            </div>

          </div>

        </div>

      </header>

      <!-- HERO -->

      <section class="glass-card dashboard-hero">

        <div class="hero-copy-block">

          <h2>
            ${
              totalTasks > 0
                ? completionPercent >= 80
                  ? `You're doing great! <span class="rocket">🚀</span>`
                  : completionPercent >= 50
                    ? `Steady progress! <span class="rocket">✨</span>`
                    : `Keep going! <span class="rocket">💪</span>`
                : `Ready for ${currentMonthName}! <span class="rocket">🎯</span>`
            }
          </h2>

          <p>
            ${
              totalTasks > 0
                ? `${completionPercent}% of your tasks are complete.`
                : `No tasks logged for ${currentMonthName} ${state.currentYear} yet.`
            }
          </p>

        </div>

        <div class="hero-quote">
          “Small steps<br>
          every day lead<br>
          to big results.”
        </div>

      </section>

      <!-- OVERALL PROGRESS -->

      <section class="glass-card progress-panel">

        <div class="panel-header">

          <h3>
            Overall Progress
          </h3>

      

        </div>

        <div class="progress-grid">

          <div class="donut-wrap">

            <div
              class="donut-chart"
              style="
                background:
                  conic-gradient(
                    from 220deg,
                    #7ad8ff 0 ${completionPercent}%,
                    #9f7cff ${completionPercent}% 100%
                  );
              "
            >

              <div class="donut-center">

                <strong>
                  ${completionPercent}%
                </strong>

                <span>
                  Completed
                </span>

              </div>

            </div>

          </div>

          <div class="progress-metrics">

            <div class="metric-item">

              <span class="metric-icon success">
                ✓
              </span>

              <span class="metric-label">
                Tasks Completed
              </span>

              <strong>
                ${completedTasks}
              </strong>

            </div>

            <div class="metric-item">

              <span class="metric-icon pending">
                ◔
              </span>

              <span class="metric-label">
                Pending
              </span>

              <strong>
                ${pendingTasks}
              </strong>

            </div>

            <div class="metric-item">

              <span class="metric-icon overdue">
                •
              </span>

              <span class="metric-label">
                Overdue
              </span>

              <strong>
                ${overdueTasks}
              </strong>

            </div>

          </div>

          </div>

        </div>

      </section>

            <!-- MONTHLY FINANCE -->

      <section class="glass-card monthly-finance-panel">

        <div class="panel-header">
          <h3>Monthly Finance</h3>

          <span class="finance-month-label">
            ${currentMonthName} ${state.currentYear}
          </span>
        </div>

        <div class="monthly-finance-grid">

          <div class="finance-summary-card income-card">

            <div class="finance-summary-icon">
              ↗
            </div>

            <div class="finance-summary-label">
              Income
            </div>

            <strong>
              ₹${monthlyIncome.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </strong>

          </div>

          <div class="finance-summary-card expense-card">

            <div class="finance-summary-icon">
              ↘
            </div>

            <div class="finance-summary-label">
              Expense
            </div>

            <strong>
              ₹${monthlyExpense.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </strong>

          </div>

        </div>

        <div class="finance-net-row">

          <span>Net Balance</span>

          <strong class="${monthlyBalance >= 0 ? 'positive' : 'negative'}">
            ${monthlyBalance >= 0 ? '+' : '-'}₹${Math.abs(monthlyBalance).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </strong>

        </div>

      </section>

      <!-- RECENT ACTIVITY -->

      <section class="glass-card activity-panel">

        <div class="panel-header">

          <h3>
            Recent Activity
          </h3>

        </div>

        <div class="activity-list">

          ${
            activityItems.length
              ? activityItems
                  .map(
                    (item) => `
                      <div class="activity-item">

                        <span
                          class="
                            activity-dot
                            ${
                              item.type.includes('task')
                                ? 'blue'
                                : item.type === 'event'
                                  ? 'purple'
                                  : item.type === 'habit'
                                    ? 'green'
                                    : 'red'
                            }
                          "
                        >
                          ${
                            item.type === 'task-complete'
                              ? '✓'
                              : item.type === 'event'
                                ? '▣'
                                : item.type === 'habit'
                                  ? '◌'
                                  : '◎'
                          }
                        </span>

                        <span class="activity-text">
                          ${escapeHtml(item.label)}
                        </span>

                        <span class="activity-time">
                          ${escapeHtml(item.timeLabel)}
                        </span>

                      </div>
                    `
                  )
                  .join('')
              : `
                <div class="activity-item">

                  <span class="activity-text">
                    No activity recorded for
                    ${currentMonthName}
                    ${state.currentYear} yet.
                  </span>

                </div>
              `
          }

        </div>

      </section>

    </section>
  `;
}
let isRendering = false;
let lastAssistantMessageCount = null;
let lastAssistantLoadingState = null;

function applySharedPageBackButton() {
  // Home, Assistant and the main feature menu intentionally have no shared page-back control.
  if (['home', 'assistant', 'menu'].includes(state.view)) return;
  // Finance subpages render their own context-specific back button. Do not inject a second one.
  if (state.view === 'finance' && ['transactions', 'add-choice', 'add-expense'].includes(state.financeView)) return;
  const app = document.getElementById('app');
  if (!app) return;
  const selectors = {
    tasks: '.todo-header', vault: '.notepad-page-header',
    finance: '.finance-dashboard-header, .finance-transactions-header', calendar: '.page-header', mood: '.page-header',
    habits: '.page-header', goals: '.page-header', progress: '.dashboard-topbar',
    focus: '.focus-header', weather: '.weather-page-header', settings: '.daysync-settings-header',
    'reset-options': '.daysync-reset-header',
  };
  let header = app.querySelector(selectors[state.view] || '.screen > header, .screen > .page-header');
  if (!header && state.view === 'finance') header = app.querySelector('.finance-transactions-header');
  if (!header) {
    const root = app.querySelector('.screen, .finance-dashboard-page, .notepad-container') || app.firstElementChild;
    if (!root) return;
    header = document.createElement('header');
    header.className = 'daysync-generated-page-header daysync-common-header';
    root.prepend(header);
  }
  header.classList.add('daysync-common-header');
  let button = header.querySelector('.daysync-page-back-button, .weather-back-button, .focus-back, .daysync-settings-back, .back-button');
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'daysync-page-back-button';
    button.dataset.action = 'shared-page-back';
    button.setAttribute('aria-label', 'Back');
    button.title = 'Back';
    button.textContent = '‹';
    header.prepend(button);
  } else {
    button.classList.add('daysync-page-back-button');
    button.setAttribute('aria-label', 'Back');
    button.title = 'Back';
    if (button.classList.contains('back-button')) button.textContent = '‹';
  }
  if (header.classList.contains('menu-page-heading')) header.classList.add('daysync-menu-header');
}

function renderLayout() {
  if (isRendering) return; // Prevent overlapping render cycles
  isRendering = true;
  const app = document.getElementById('app');
  const viewChanged = state.view !== lastRenderedView;
  lastRenderedView = state.view;

  if (state.view === 'calendar' && state.authenticated && !state.calendarCache.has(state.selectedDate)) {
    loadSelectedDateData(state.selectedDate);
  }

  let content = renderHomePage();

 if (state.view === 'calendar') {
  content = renderCalendarPage(state);

} else if (state.view === 'finance') {
  content = renderFinancePage(state);

} else if (state.view === 'vault') {
  content = renderVaultPage(state);

} else if (state.view === 'mood') {
  content = renderMoodPage(state);

} else if (state.view === 'tasks') {
  content = renderTasksPage(state);

} else if (state.view === 'habits') {
  content = renderHabitsPage(state);

} else if (state.view === 'goals') {
  content = renderGoalsPage(state);

} else if (state.view === 'assistant') {
  content = renderAssistantPage(state);

} else if (state.view === 'menu') {
  content = renderMenuPage();
} else if (state.view === 'settings') {
  content = renderSettingsPage();
} else if (state.view === 'reset-options') {
  content = renderResetOptionsPage();
} else if (state.view === 'focus') {
  content = renderFocusPage();

} else if (state.view === 'weather') {
  content = renderWeatherPage();

} else if (state.view === 'progress' || state.view === 'more') {
  content = renderProgressPage();
}

  // Appends active modals and menus over the main content
  app.innerHTML = content + renderEntryModal() + renderProfileModal();
  renderFocusAlarmOverlay();
  applySharedPageBackButton();

  // Follow the newest assistant conversation message after a chat update,
  // without stealing scroll when the user first opens the Assistant page.
  const assistantMessageCount = Array.isArray(state.assistantMessages) ? state.assistantMessages.length : 0;
  const assistantLoadingNow = Boolean(state.assistantLoading);
  const assistantConversationChanged = state.view === 'assistant' && !viewChanged && (
    assistantMessageCount !== lastAssistantMessageCount ||
    assistantLoadingNow !== lastAssistantLoadingState
  );
  lastAssistantMessageCount = assistantMessageCount;
  lastAssistantLoadingState = assistantLoadingNow;
  if (assistantConversationChanged) {
    requestAnimationFrame(() => {
      if (state.view !== 'assistant') return;
      const currentApp = document.getElementById('app');
      if (!currentApp) return;
      currentApp.scrollTo({
        top: Math.max(0, currentApp.scrollHeight - currentApp.clientHeight),
        behavior: 'smooth'
      });
    });
  }

  // Every real page change starts at the top; re-renders within the same page
  // preserve scroll so form edits and data refreshes do not jump unexpectedly.
  if (viewChanged) {
    app.scrollTop = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    const nav = document.querySelector('.bottom-nav');
    nav?.classList.remove('scroll-hidden');
  }
  syncKeyboardViewport();

  // Highlight active bottom navigation button
  const menuSubPages = ['menu', 'tasks', 'vault', 'finance', 'progress', 'habits', 'goals', 'focus', 'weather', 'settings', 'reset-options'];



  document.querySelectorAll('.bottom-nav .nav-item').forEach((button) => {
    const isMenuButton = button.dataset.action === 'toggle-more-menu';

    if (isMenuButton) {
      button.classList.toggle('active', state.moreMenuOpen || menuSubPages.includes(state.view));
    } else {
      button.classList.toggle('active', button.dataset.view === state.view && !state.moreMenuOpen);
    }
  });

  // --- NEW: Hardware-accelerated smooth slide ---
  requestAnimationFrame(() => {
    const indicator = document.querySelector('.nav-indicator');
    const activeBtn = document.querySelector('.bottom-nav .nav-item.active');
    
    if (indicator && activeBtn) {
      indicator.style.width = `${activeBtn.offsetWidth}px`;
      indicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    }
  }); // Small delay ensures DOM calculates sizes correctly

  app.querySelectorAll('[data-view]').forEach((button) => {
    if (!button.dataset.view) return;
    button.addEventListener('click', () => {
      if (['home', 'calendar', 'assistant', 'more', 'progress', 'tasks', 'habits', 'goals', 'mood', 'finance', 'vault', 'focus', 'weather', 'settings', 'reset-options'].includes(button.dataset.view)) {
        if (state.view !== button.dataset.view && state.view !== 'home' && state.view !== 'assistant') state.navigationHistory.push(state.view);
        state.view = button.dataset.view;
        state.entryModalOpen = false;
        state.entryDraft = null;
        state.moreMenuOpen = false;
        renderLayout();
      }
    });
  });

  // --- NATIVE APP & BROWSER SMART MICROPHONE ---
let webRecognition;
let idleTimer;
let pauseTimer;

// Detect if the app is running as a compiled Native APK/iOS app via Capacitor
const isNativeApp = Boolean(window.Capacitor?.isNativePlatform?.());
const getNativeSpeechRecognition = () =>
  window.SAHRA_SPEECH_RECOGNITION || window.Capacitor?.Plugins?.SpeechRecognition || null;

// Setup Web Fallback (For when you test on your computer browser)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition && !isNativeApp) {
  webRecognition = new SpeechRecognition();
  webRecognition.continuous = true;      
  webRecognition.interimResults = true;  
}

document.querySelectorAll('[data-action="toggle-mic"]').forEach((button) => {
  button.addEventListener('click', async () => {
    const micImg = document.getElementById('chat-mic-img');
    const chatInput = document.querySelector('input[placeholder*="speak"]'); 
    
    if (!micImg) return;

    if (!isNativeApp && !webRecognition) {
      showToast("Voice recognition isn't supported on this browser.");
      return;
    }

    const isListening = micImg.classList.contains('listening');

    if (isListening) {
      stopListening();
    } else {
      // If Native App, we must ask the phone for microphone permission first
      try {
        if (isNativeApp) {
          const nativeSpeech = getNativeSpeechRecognition();
          if (!nativeSpeech) {
            showToast('Voice input is unavailable in this mobile build. Please update the app.');
            return;
          }

          let permissions = await nativeSpeech.checkPermissions();
          if (permissions.speechRecognition !== 'granted') {
            permissions = await nativeSpeech.requestPermissions();
          }
          if (permissions.speechRecognition !== 'granted') {
            showToast('Microphone permission is required for voice input.');
            return;
          }
        }
        await startListening(micImg, chatInput);
      } catch (error) {
        console.error('Unable to start voice input:', error);
        showToast('Voice input could not be started.');
      }
    }
  });
});

async function startListening(micImg, chatInput) {
  if (!micImg) return;

  micImg.classList.add('listening');
  if (chatInput) chatInput.value = ''; 

  // 1. RULE: Turn off if NO input after 5 seconds
  idleTimer = setTimeout(() => {
    stopListening();
    showToast("Microphone turned off (no speech detected)");
  }, 5000);

  if (isNativeApp) {
    // --- NATIVE APP LOGIC (Capacitor Plugin) ---
    const nativeSpeech = getNativeSpeechRecognition();
    if (!nativeSpeech) throw new Error('Native speech recognition plugin is unavailable.');

    await nativeSpeech.start({
      language: "en-US",
      partialResults: true,
      popup: false
    });

    await nativeSpeech.addListener('partialResults', (data) => {
      if (data.matches?.[0]) handleSpeechResult(data.matches[0], chatInput);
    });
  } else {
    if (webRecognition && webRecognition.state === 'listening') {
      return;
    }

    // --- WEB BROWSER LOGIC ---
    try {
      webRecognition.start();
      webRecognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        handleSpeechResult(transcript, chatInput);
      };
      webRecognition.onend = () => {
        const micImgEl = document.getElementById('chat-mic-img');
        if (micImgEl) micImgEl.classList.remove('listening');
      };
    } catch (error) {
      if (error && error.name !== 'InvalidStateError') {
        throw error;
      }
      // Another start attempt already happened; keep the current listening state stable.
      if (webRecognition && webRecognition.state === 'listening') {
        return;
      }
      console.warn('Speech recognition already active; ignoring duplicate start request.');
    }
  }
}

function handleSpeechResult(transcript, chatInput) {
  clearTimeout(idleTimer);  
  clearTimeout(pauseTimer); 

  if (chatInput) chatInput.value = transcript;

  // 2. RULE: Auto-send if they pause for 3 seconds
  pauseTimer = setTimeout(() => {
    stopListening(); 
  }, 3000);
}

async function stopListening() {
  clearTimeout(idleTimer);
  clearTimeout(pauseTimer);
  
  const micImg = document.getElementById('chat-mic-img');
  if (micImg) micImg.classList.remove('listening');

  if (isNativeApp) {
    const nativeSpeech = getNativeSpeechRecognition();
    if (nativeSpeech) {
      await nativeSpeech.stop();
      await nativeSpeech.removeAllListeners();
    }
  } else if (webRecognition) {
    if (webRecognition.state === 'listening') {
      webRecognition.stop();
    }
  }

  // Automatically trigger the SEND button
  const chatInput = document.querySelector('input[placeholder*="speak"]');
  if (chatInput && chatInput.value.trim() !== '') {
    const sendBtn = chatInput.nextElementSibling; 
    if (sendBtn) sendBtn.click();
  }
}

  // Month Picker toggle
  document.querySelectorAll('[data-action="toggle-progress-picker"]').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); 
      state.progressPickerOpen = !state.progressPickerOpen;
      renderLayout();
    });
  });

  // Profile Modal Event Bindings
  document.querySelectorAll('[data-action="close-profile-modal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.profileModalOpen = false;
      state.profileEditing = false;
      state.profileDraft = null;
      state.profileSuccessMessage = '';
      renderLayout();
    });
  });

  document.querySelectorAll('[data-action="profile-start-edit"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.profileEditing = true;
      state.profileSuccessMessage = '';
      const profile = state.user?.profile || {};
      state.profileDraft = {
        name: state.user?.name || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().slice(0, 10) : '',
      };
      renderLayout();
    });
  });

  document.querySelectorAll('[data-action="profile-cancel-edit"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.profileEditing = false;
      state.profileSuccessMessage = '';
      renderLayout();
    });
  });

  document.querySelectorAll('[data-action="profile-save"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const draft = state.profileDraft || {};
      const payload = {
        name: draft.name,
        dateOfBirth: draft.dateOfBirth || null,
      };

      try {
        const response = await apiRequest('/api/profile', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        state.user = response.user || state.user;
        localStorage.setItem('sahraUser', JSON.stringify(state.user));
        state.profileEditing = false;
        state.profileSuccessMessage = 'Profile updated successfully!';
        renderLayout();

        setTimeout(() => {
          if (state.profileSuccessMessage) {
            state.profileSuccessMessage = '';
            renderLayout();
          }
        }, 3000);
      } catch (error) {
        window.alert(error.message || 'Unable to save profile');
      }
    });
  });

  document.querySelectorAll('.profile-input').forEach((input) => {
    input.addEventListener('input', (event) => {
      const field = event.target.dataset.field;
      const value = event.target.value;
      state.profileDraft = state.profileDraft || {};
      state.profileDraft[field] = value;
    });
  });

  document.querySelectorAll('[data-action="prev-month"]').forEach((button) => {
    button.addEventListener('click', () => shiftMonth(-1));
  });

  document.querySelectorAll('[data-action="next-month"]').forEach((button) => {
    button.addEventListener('click', () => shiftMonth(1));
  });

  document.querySelectorAll('[data-action="today"]').forEach((button) => {
    button.addEventListener('click', () => {
      const today = new Date();
      state.currentMonth = today.getMonth();
      state.currentYear = today.getFullYear();
      state.selectedDate = formatDateKey(today);
      renderLayout();
    });
  });

  document.querySelectorAll('[data-date]').forEach((button) => {
    const dateValue = button.dataset.date;
    if (!dateValue) return;
    button.addEventListener('click', () => setSelectedDate(dateValue));
  });

  /* =====================================================
   CALENDAR ITEM DETAILS
===================================================== */

document.querySelectorAll('[data-action="show-calendar-event"]').forEach((row) => {

  row.addEventListener('click', (event) => {

    // Don't open details when clicking the trash button
    if (event.target.closest('[data-action="delete-calendar-event"]')) {
      return;
    }

    const eventId = row.dataset.eventId;

    const calendarEvent = state.data.events.find(
      (item) =>
        String(item.id || item._id) === String(eventId)
    );

    if (!calendarEvent) return;

    state.calendarDetail = {
      type: 'event',
      item: calendarEvent,
    };

    renderLayout();
  });


  row.addEventListener('keydown', (event) => {

    if (
      event.key !== 'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    event.preventDefault();

    const eventId = row.dataset.eventId;

    const calendarEvent = state.data.events.find(
      (item) =>
        String(item.id || item._id) === String(eventId)
    );

    if (!calendarEvent) return;

    state.calendarDetail = {
      type: 'event',
      item: calendarEvent,
    };

    renderLayout();

  });

});



document.querySelectorAll('[data-action="show-calendar-task"]').forEach((row) => {

  row.addEventListener('click', (event) => {

    // Don't open details when clicking the trash button
    if (event.target.closest('[data-action="delete-calendar-task"]')) {
      return;
    }

    const taskId = row.dataset.taskId;

    const task = state.data.tasks.find(
      (item) =>
        String(item.id || item._id) === String(taskId)
    );

    if (!task) return;

    state.calendarDetail = {
      type: 'task',
      item: task,
    };

    renderLayout();
  });


  row.addEventListener('keydown', (event) => {

    if (
      event.key !== 'Enter' &&
      event.key !== ' '
    ) {
      return;
    }

    event.preventDefault();

    const taskId = row.dataset.taskId;

    const task = state.data.tasks.find(
      (item) =>
        String(item.id || item._id) === String(taskId)
    );

    if (!task) return;

    state.calendarDetail = {
      type: 'task',
      item: task,
    };

    renderLayout();

  });

});

  /* =====================================================
   DELETE CALENDAR TASK
===================================================== */

document.querySelectorAll(
  '[data-action="delete-calendar-task"]'
).forEach((button) => {

  button.addEventListener('click', (event) => {

    event.stopPropagation();

    const taskId = button.dataset.taskId;

    if (!taskId) return;


    showAppConfirm(
      'Are you sure you want to delete this task?',
      async () => {

        try {

          await apiRequest(
            `/api/tasks/${taskId}`,
            {
              method: 'DELETE',
            }
          );


          // Remove from current frontend state
          state.data.tasks =
            state.data.tasks.filter(
              (task) =>
                String(task.id || task._id) !==
                String(taskId)
            );


          // Allow selected date to reload
          state.calendarCache.delete(
            state.selectedDate
          );


          // Close details if open
          state.calendarDetail = null;


          showToast(
            'Task deleted successfully'
          );


          renderLayout();

        } catch (error) {

          showToast(
            error.message ||
            'Unable to delete task'
          );

        }

      }
    );

  });

});



/* =====================================================
   DELETE CALENDAR EVENT
===================================================== */

document.querySelectorAll(
  '[data-action="delete-calendar-event"]'
).forEach((button) => {

  button.addEventListener('click', (event) => {

    event.stopPropagation();

    const eventId = button.dataset.eventId;

    if (!eventId) return;


    showAppConfirm(
      'Are you sure you want to delete this event?',
      async () => {

        try {

          await apiRequest(
            `/api/events/${eventId}`,
            {
              method: 'DELETE',
            }
          );


          // Remove from current frontend state
          state.data.events =
            state.data.events.filter(
              (calendarEvent) =>
                String(
                  calendarEvent.id ||
                  calendarEvent._id
                ) !== String(eventId)
            );


          // Allow selected date to reload
          state.calendarCache.delete(
            state.selectedDate
          );


          // Close details if open
          state.calendarDetail = null;


          showToast(
            'Event deleted successfully'
          );


          renderLayout();

        } catch (error) {

          showToast(
            error.message ||
            'Unable to delete event'
          );

        }

      }
    );

  });

});

    /* =====================================================
   CLOSE CALENDAR DETAIL
===================================================== */

document.querySelectorAll(
  '[data-action="close-calendar-detail"]'
).forEach((button) => {

  button.addEventListener('click', (event) => {

    /*
      If the click happened inside the modal,
      don't close unless it is an actual close button.
    */
    if (
      event.target.closest(
        '[data-calendar-detail-content]'
      ) &&
      !event.target.closest(
        '[data-action="close-calendar-detail"]'
      )
    ) {
      return;
    }

    state.calendarDetail = null;

    renderLayout();

  });

});

  document.querySelectorAll('[data-action="open-add-entry"]').forEach((button) => {
    button.addEventListener('click', () => {
      openEntryModal(button.dataset.type || 'event');
    });
  });

  document.querySelectorAll('.task-input').forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addQuickTaskFromInput(input);
      }
    });
  });

  document.querySelectorAll('[data-action="quick-task-add"]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.querySelector('.task-input');
      addQuickTaskFromInput(input);
    });
  });

  document.querySelectorAll('[data-action="show-selected-day"]').forEach((button) => {
    button.addEventListener('click', () => {
      setView('calendar');
    });
  });

  document.querySelectorAll('[data-task-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.todoFilter = button.dataset.taskFilter || 'All';
      renderLayout();
    });
  });

  document.querySelectorAll('[data-action="toggle-mood-picker"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.moodPickerOpen = !state.moodPickerOpen;
      renderLayout();
    });
  });

  document.querySelectorAll('[data-mood-value]').forEach((button) => {
    button.addEventListener('click', async () => {
      const mood = button.dataset.moodValue;
      if (!mood) return;

      state.moodPickerOpen = false;
      renderLayout(); 

      const existingMood = state.data.moods.find((m) => m.date === state.selectedDate);

      try {
        if (existingMood) {
          await apiRequest(`/api/moods/${existingMood.id || existingMood._id}`, {
            method: 'PUT',
            body: JSON.stringify({ mood, energy: 80, note: existingMood.note || '' }),
          });
          await loadDashboardData();
        } else {
          await createResource('mood', {
            date: state.selectedDate,
            mood,
            energy: 80,
            note: '',
          });
        }
      } catch (error) {
        window.alert(error.message || 'Unable to save mood');
      }
    });
  });



// ==========================================
// FINANCE SEARCH AND FILTER LISTENERS
// ==========================================

// Handle dropdown filter change
document.addEventListener('change', (e) => {
    const target = e.target;
    if (target.getAttribute('data-action') === 'finance-filter') {
        state.financeTypeFilter = target.value;
        triggerAppRender(); 
    }
});

// Handle text typing (with cursor position fix so the keyboard doesn't close)
document.addEventListener('input', (e) => {
    const searchInput = e.target.closest('[data-action="finance-search"]');
    
    if (searchInput) {
        // 1. Remember where the cursor was before rendering
        const cursorPosition = searchInput.selectionStart ?? searchInput.value.length;
        
        // 2. Save the search text to state
        state.financeSearchQuery = searchInput.value;
        
        // 3. Re-render the app to filter the list
        triggerAppRender();

        // 4. Immediately put the cursor back where it was
        setTimeout(() => {
            const newInput = document.querySelector('[data-action="finance-search"]');
            if (newInput) {
                newInput.focus();
                const position = Math.min(cursorPosition, newInput.value.length);
                newInput.setSelectionRange(position, position);
            }
        }, 0);
    }
});

  document.querySelectorAll('[data-action="edit-task"]').forEach((button) => {
    button.addEventListener('click', () => {
      const task = state.data.tasks.find((item) => String(item.id || item._id) === String(button.dataset.taskId));
      if (!task) return;
      state.entryModalOpen = true;
      state.entryDraft = {
        type: 'task',
        id: task.id || task._id,
        title: task.title || '',
        description: task.description || '',
        date: task.date || state.selectedDate,
        time: task.time || '19:00',
        priority: task.priority || 'Normal',
        status: task.status || 'Pending',
        reminder: task.reminder || '',
        category: task.category || 'General',
      };
      renderLayout();
    });
  });

 document.querySelectorAll('[data-action="delete-task"]').forEach((button) => {
    button.addEventListener('click', () => {
      const taskId = button.dataset.taskId;
      if (!taskId) return;
      
      // Replaces window.confirm with our custom Native App Modal
      showAppConfirm('Are you sure you want to delete this task?', async () => {
        try {
          await apiRequest(`/api/tasks/${taskId}`, { method: 'DELETE' });
          await loadDashboardData();
          showToast('Task deleted successfully');
        } catch (error) {
          showToast(error.message || 'Unable to delete task');
        }
      });
    });
  });

  document.querySelectorAll('[data-action="toggle-task"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const taskId = button.dataset.taskId;
      const task = state.data.tasks.find((item) => String(item.id || item._id) === String(taskId));
      if (!task) return;
      const nextCompleted = !(task.completed || task.status === 'Completed');
      try {
        await apiRequest(`/api/tasks/${taskId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: task.title,
            description: task.description || '',
            date: task.date || state.selectedDate,
            time: task.time || null,
            priority: task.priority || 'Normal',
            status: nextCompleted ? 'Completed' : 'Pending',
            completed: nextCompleted,
            reminder: task.reminder || '',
            category: task.category || 'General',
          }),
        });
        await loadDashboardData();
      } catch (error) {
        window.alert(error.message || 'Unable to update task');
      }
    });
  });

  document.querySelectorAll('[data-action="copy-asset"]').forEach((button) => {
    button.addEventListener('click', (e) => {
      const content = button.dataset.content || '';
      navigator.clipboard.writeText(content);
      button.textContent = 'Copied!';
      setTimeout(() => { button.textContent = 'Copy'; }, 2000);
    });
  });

  document.querySelectorAll('[data-action="close-entry-modal"]').forEach((button) => {
    button.addEventListener('click', () => {
      closeEntryModal();
    });
  });

  document.querySelectorAll('[data-action="save-entry"]').forEach((button) => {
  button.addEventListener('click', async () => {

    // Collect all form values before saving
    document.querySelectorAll('[data-entry-field]').forEach((field) => {
      const fieldName = field.dataset.entryField;

      if (fieldName) {
        state.entryDraft = state.entryDraft || {};
        state.entryDraft[fieldName] =
          field.type === 'checkbox' ? field.checked : field.value;
      }
    });

    const draft = state.entryDraft || {};
    const type = draft.type || 'event';
    const date = draft.date || state.selectedDate;
    if (type === 'task' && isJunkTask({ title: draft.title || draft.name || '' })) {
      showToast('That test task name has been removed. Please enter a meaningful task title.');
      button.dataset.submitting = 'false';
      button.textContent = 'Add Task';
      return;
    }

    // Tasks and events cannot be added to past dates
    if ((type === 'event' || type === 'task') && isPastDate(date)) {
      window.alert(
        'Tasks and events can only be added for today or future dates.'
      );
      return;
    }

    try {

      // ==========================================
      // EVENT
      // ==========================================
      if (type === 'event') {
        const title = (draft.title || '').trim();
        if (!title) {
          window.alert('Please enter an event title.');
          return;
        }
        await createResource('event', {
          title,
          description: draft.description || '',
          date,
          startTime: draft.startTime || '09:00',
          endTime: draft.endTime || '10:00',
          category: draft.category || 'General',
          reminder: draft.reminder || '',
        });

      // ==========================================
      // TASK
      // ==========================================
      } else if (type === 'task') {
        const title = (draft.title || '').trim();
        if (!title) {
          window.alert('Please enter a task title.');
          return;
        }
        const taskPayload = {
          title,
          description: draft.description || '',
          date,
          time: draft.time || null,
          priority: draft.priority || 'Normal',
          status: draft.status || 'Pending',
          completed: draft.completed || false,
          reminder: draft.reminder || '',
          category: draft.category || 'General',
        };

        if (draft.id) {
          await apiRequest(`/api/tasks/${draft.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(taskPayload),
          });
          await loadDashboardData();
        } else {
          await createResource('task', taskPayload);
        }

      // ==========================================
      // HABIT
      // ==========================================
      } else if (type === 'habit') {
        const name = (draft.title || '').trim();
        if (!name) {
          window.alert('Please enter a habit name.');
          return;
        }
        await createResource('habit', {
          name,
          description: draft.description || '',
          goal: Number(draft.goal || 1),
          progress: 0,
          frequency: draft.frequency || 'Daily',
        });

      // ==========================================
      // GOAL
      // ==========================================
      } else if (type === 'goal') {
        const title = (draft.title || '').trim();
        if (!title) {
          window.alert('Please enter a goal title.');
          return;
        }
        const current = Number(draft.current || 0);
        const target = Math.max(Number(draft.target || 30), 1);
        await createResource('goal', {
          title,
          description: draft.description || '',
          duration: draft.duration || '30 days',
          current,
          target,
          progress: Math.min(100, Math.round((current / target) * 100)),
          status: 'Active',
        });

      // ==========================================
      // MOOD
      // ==========================================
      } else if (type === 'mood') {
        const mood = draft.mood || '😊';
        await createResource('mood', {
          date,
          mood,
          energy: 80,
          note: draft.note || '',
        });

      // ==========================================
      // ASSET / NOTEPAD
      // ==========================================
      } else if (type === 'asset' || type === 'note') {
        const title = (draft.title || '').trim();
        const description = (draft.description || draft.content || '').trim();

        if (!title || !description) {
          window.alert('Please enter a title and description.');
          return;
        }

        const payload = { title: title, content: description, tags: draft.tags || 'Note' };

        if (draft.id) {
          // 🔴 ADDED HEADERS HERE SO THE BACKEND CAN READ THE JSON 🔴
          await apiRequest(`/api/assets/${draft.id}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
          // Refresh the data so the UI updates instantly
          await loadDashboardData(); 
          renderLayout();
        } else {
          // Creates a brand new note
          await createResource('asset', payload);
        }

      // ==========================================
      // EXPENSE / SUBSCRIPTION
      // ==========================================
      } else if (type === 'expense' || type === 'subscription') {
        const title = (draft.title || '').trim();
        const amount = Number(draft.amount);

        if (!title) {
          window.alert('Please enter a title.');
          return;
        }
        if (!Number.isFinite(amount) || amount <= 0) {
          window.alert('Please enter a valid amount.');
          return;
        }
        await createResource(type, {
          title,
          amount,
          date: draft.date || state.selectedDate,
          renewalDate: draft.renewalDate || state.selectedDate,
          category: draft.category || 'General',
        });
      }

      // Close modal after successful save (placed only once at the end)
      closeEntryModal();

      // Show success message
      if (typeof showToast === 'function') {
        showToast('Saved successfully!');
      } else {
        window.alert('Saved successfully!');
      }

    } catch (error) {
      console.error('Save entry failed:', error);
      if (typeof showToast === 'function') {
        showToast(error.message || 'Unable to save item');
      } else {
        window.alert(error.message || 'Unable to save item');
      }
    }
  });
});

  document.querySelectorAll('[data-entry-field]').forEach((field) => {
    const fieldName = field.dataset.entryField;
    if (!fieldName) return;

    const updateDraft = (element) => {
      const value = element.type === 'checkbox' ? element.checked : element.value;
      state.entryDraft = {
        ...(state.entryDraft || {}),
        [fieldName]: value,
      };

      if (fieldName === 'type') {
        renderLayout();
      }
    };

    field.addEventListener('input', () => updateDraft(field));
    field.addEventListener('change', () => updateDraft(field));
  });

  const menuButton = document.querySelector('.menu-button');
  const menuPanel = document.querySelector('.menu-panel');

  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', (event) => {
      event.stopPropagation();
      state.menuOpen = !state.menuOpen;
      menuPanel.classList.toggle('hidden', !state.menuOpen);
      menuPanel.classList.toggle('open', state.menuOpen);
    });
  }

  document.querySelectorAll('[data-menu-action]').forEach((button) => {
    button.addEventListener('click', async () => {
      const action = button.dataset.menuAction;

      if (action === 'toggle-theme') {
        const nextTheme = state.theme === 'light' ? 'dark' : 'light';
        state.menuOpen = false;
        applyTheme(nextTheme);
        renderLayout();
        await updateThemeInDatabase(nextTheme);
        return;
      }

      state.menuOpen = false;

      if (action === 'profile') {
        state.profileModalOpen = true; 
        state.profileEditing = false;
        state.profileSuccessMessage = '';
        state.profileDraft = {
          name: state.user?.name || '',
          dateOfBirth: state.user?.profile?.dateOfBirth ? new Date(state.user.profile.dateOfBirth).toISOString().slice(0, 10) : '',
        };
        renderLayout();
        return;
      }

      if (action === 'notifications') {
        state.menuOpen = false;
        renderLayout();
        await toggleDeviceNotifications();
        renderLayout();
        return;
      }

      if (action === 'privacy-security') {
        state.settingsInfoPanel = state.settingsInfoPanel === 'privacy' ? '' : 'privacy';
        renderLayout();
        return;
      }

      if (action === 'sync-now') {
        try {
          const token = await getAuthToken();
          if (token && globalThis.navigator?.onLine) await offlineSync.flush(token);
          await loadDashboardData();
          await fetchFinanceData();
          showToast('DaySync data sync finished.');
        } catch (error) { showToast(error.message || 'Unable to sync DaySync data.'); }
        return;
      }

      if (action === 'exact-alarms') {
        try {
          if (!window.Capacitor?.isNativePlatform?.()) { showToast('Timer alarm settings are available in the installed mobile app.'); return; }
          const permission = await LocalNotifications.checkExactNotificationSetting();
          if (permission.exact_alarm !== 'granted') {
            await LocalNotifications.changeExactNotificationSetting();
            showToast('Check Android alarm access, then return to DaySync.');
          } else showToast('Precise timer alarms are already allowed.');
        } catch (error) { showToast(error.message || 'Unable to open Android alarm settings.'); }
        return;
      }

      if (action === 'logout') {
        focusStopAudio();
        state.focusRunning = false; state.focusEndsAt = null; clearInterval(focusTicker); focusTicker = null;
        persistFocusTimerState();
        await removeAuthToken();
        localStorage.removeItem('sahraUser');
        state.authenticated = false;
        state.user = { name: 'DaySync User' };
        state.view = 'home';
        window.location.href = getLoginPath();
      }
    });
  });

  if (!notepadEventsBound) {
  notepadEventsBound = true;

  // ==========================================
// NOTEPAD: SEARCH, EDIT & DELETE ACTIONS
// ==========================================


// 1. Toggle Search
document.addEventListener('click', (e) => {
  const toggleBtn = e.target.closest('[data-action="toggle-notepad-search"]');

  if (!toggleBtn) return;

  // Remember current page position
  const app = document.querySelector('#app');
  const currentScroll = app ? app.scrollTop : 0;

  state.notepadSearchOpen = !state.notepadSearchOpen;

  renderLayout();

  // Restore position after render
  requestAnimationFrame(() => {
    const newApp = document.querySelector('#app');

    if (newApp) {
      newApp.scrollTop = currentScroll;
    }

    if (state.notepadSearchOpen) {
      const searchInput = document.querySelector(
        '[data-action="notepad-search-input"]'
      );

      if (searchInput) {
        searchInput.focus();
      }
    }
  });
});


// 2. Search typing
document.addEventListener('input', (e) => {
  const input = e.target.closest(
    '[data-action="notepad-search-input"]'
  );

  if (!input) return;

  const cursorPosition =
    input.selectionStart ?? input.value.length;

  // Save current scroll position
  const app = document.querySelector('#app');
  const currentScroll = app ? app.scrollTop : 0;

  // Update search text
  state.noteSearchQuery = input.value;

  // Re-render filtered notes
  renderLayout();

  // Restore scroll + focus
  requestAnimationFrame(() => {
    const newApp = document.querySelector('#app');

    if (newApp) {
      newApp.scrollTop = currentScroll;
    }

    const newInput = document.querySelector(
      '[data-action="notepad-search-input"]'
    );

    if (!newInput) return;

    newInput.focus();

    const position = Math.min(
      cursorPosition,
      newInput.value.length
    );

    newInput.setSelectionRange(position, position);
  });
});

// 2. Open Edit inside Native App Modal (Replaces prompt)
document.addEventListener('click', (e) => {
  const editBtn = e.target.closest('[data-action="edit-note"]');
  if (editBtn) {
    const noteId = editBtn.dataset.noteId;
    const notes = state.data.assets || state.data.notes || [];
    const note = notes.find(n => String(n.id || n._id) === String(noteId));
    if (!note) return;

    state.entryModalOpen = true;
    state.entryDraft = {
  type: 'asset',
  id: note.id || note._id,
  title: note.title || '',
  content: note.content || note.description || '',
  description: note.content || note.description || '',
  tags: note.tags || 'Note'
};
    renderLayout();
  }
});

// 3. Delete Note with Beautiful Custom UI Modal
function showCustomNotepadConfirm(message, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'notepad-confirm-overlay';
  overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.6); z-index: 10000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(3px);';
  
  const box = document.createElement('div');
  box.className = 'notepad-confirm-box';
  box.style.cssText = 'background: #1e293b; padding: 24px; border-radius: 16px; width: 85%; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; border: 1px solid rgba(255,255,255,0.1);';
  
  const text = document.createElement('p');
  text.className = 'notepad-confirm-message';
  text.style.cssText = 'margin: 0 0 24px 0; font-size: 1.1rem; line-height: 1.5; color: #f8fafc; font-weight: 500;';
  text.innerText = message;
  
  const btnContainer = document.createElement('div');
  btnContainer.style.cssText = 'display: flex; gap: 12px; justify-content: center;';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.innerText = 'Cancel';
  cancelBtn.type = 'button';
  cancelBtn.style.cssText = 'padding: 12px; border-radius: 10px; border: none; background: #334155; color: white; font-weight: 600; cursor: pointer; flex: 1;';
  
  const confirmBtn = document.createElement('button');
  confirmBtn.innerText = 'Delete';
  confirmBtn.style.cssText = 'padding: 12px; border-radius: 10px; border: none; background: #ef4444; color: white; font-weight: 600; cursor: pointer; flex: 1; box-shadow: 0 4px 10px rgba(239,68,68,0.3);';
  
  cancelBtn.onclick = () => document.body.removeChild(overlay); 
  let confirmed = false;

confirmBtn.onclick = async () => {
  if (confirmed) return;

  confirmed = true;

  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Deleting...';
  confirmBtn.style.opacity = '0.6';
  confirmBtn.style.pointerEvents = 'none';

  overlay.remove();

  await onConfirm();
};
  
  btnContainer.appendChild(cancelBtn);
  btnContainer.appendChild(confirmBtn);
  box.appendChild(text);
  box.appendChild(btnContainer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

document.addEventListener('click', (e) => {
  const delBtn = e.target.closest('[data-action="delete-note"]');
  if (delBtn) {
    e.preventDefault();
    e.stopPropagation();
    const noteId = delBtn.dataset.noteId;
    
    showCustomNotepadConfirm('Are you sure you want to delete this note?', async () => {
      try {
        // 🔴 UPDATED URL HERE 🔴
       await apiRequest(`/api/assets/${noteId}`, {
  method: 'DELETE'
});
    
        await loadDashboardData(); 
        if (typeof showToast === 'function') showToast('Note deleted');
      } catch (error) {
        if (typeof showToast === 'function') showToast(error.message || 'Failed to delete note');
      }
    });
  }
});
  }

  document.querySelectorAll('[data-action="back-home"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.profileModalOpen = false;
      state.profileDraft = null;
      state.entryModalOpen = false;
      state.entryDraft = null;

      const previousView = state.navigationHistory.length > 0 ? state.navigationHistory.pop() : 'home';
      state.view = previousView;
      renderLayout();
    });
  });

  const submitAssistantMessage = async (message, requestId, addUserMessage = true) => {
    if (state.assistantLoading) return;
    const generation = state.assistantGeneration;
    if (addUserMessage) state.assistantMessages.push({ role: 'user', text: message });
    state.assistantLoading = true;
    renderLayout();

    try {
      let response;
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15_000);
        try {
          response = await apiRequest('/api/assistant/chat', {
            method: 'POST',
            signal: controller.signal,
            body: JSON.stringify({ message, requestId }),
          });
          break;
        } catch (error) {
          const retryable = !Number.isInteger(error.status) || error.status >= 500 || error.status === 408;
          if (attempt === 0 && retryable) {
            await new Promise((resolve) => setTimeout(resolve, 250));
            continue;
          }
          throw error;
        } finally {
          clearTimeout(timeout);
        }
      }

      if (generation === state.assistantGeneration) {
        state.assistantMessages.push({ role: 'assistant', text: response.message || 'Sahra is temporarily unavailable.' });
      }

      if (generation === state.assistantGeneration && response.action === 'requiresConfirmation' && response.confirmationToken) {
        const label = /delete/i.test(response.message || '') ? 'Delete task' : /complete/i.test(response.message || '') ? 'Mark complete' : /event/i.test(response.message || '') ? 'Add event' : 'Add task';
        showAppConfirm('Do you want Sahra to perform this change?', async () => {
          state.assistantLoading = true;
          renderLayout();
          try {
            const execution = await apiRequest('/api/assistant/execute', {
              method: 'POST',
              body: JSON.stringify({ confirmationToken: response.confirmationToken }),
            });
            state.assistantMessages.push({ role: 'assistant', text: execution.message || 'The change was completed.' });
            await loadDashboardData();
          } catch (error) {
            state.assistantMessages.push({ role: 'assistant', text: error.message || 'Sahra could not complete that change.' });
          } finally {
            state.assistantLoading = false;
            renderLayout();
          }
        }, label);
      } else if (['createdTask', 'createdEvent', 'createdNote', 'createdTransaction'].includes(response.action)) {
        await loadDashboardData();
        if (response.action === 'createdTransaction') await fetchFinanceData();
      }
    } catch (error) {
      const messageText = error.message || 'Sahra is temporarily unavailable.';
      const canRetry = !Number.isInteger(error.status) || error.status >= 500 || error.status === 408;
      if (generation === state.assistantGeneration) {
        state.assistantMessages.push({
          role: 'assistant',
          text: canRetry ? `${messageText} You can retry safely.` : messageText,
          ...(canRetry ? { retryRequestId: requestId, retryMessage: message } : {}),
        });
      }
    } finally {
      state.assistantLoading = false;
      renderLayout();
    }
  };

  document.querySelectorAll('.composer-send').forEach((button) => {
    button.addEventListener('click', async () => {
      const input = document.querySelector('.assistant-input');
      const message = input?.value?.trim();
      if (!message || state.assistantLoading) return;
      if (input) input.value = '';
      const requestId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      await submitAssistantMessage(message, requestId);
    });
  });

  document.querySelectorAll('[data-assistant-retry]').forEach((button) => {
    button.addEventListener('click', async () => {
      const message = button.dataset.retryMessage || '';
      const requestId = button.dataset.assistantRetry || '';
      if (message && requestId) await submitAssistantMessage(message, requestId, false);
    });
  });

  document.querySelectorAll('[data-progress-month]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      const month = Number(button.dataset.progressMonth);
      if (!Number.isInteger(month) || month < 0 || month > 11) return;

      state.currentMonth = month;
      state.progressPickerOpen = false;
      state.progressLoading = true;
      renderLayout();
      await loadProgressData(true);
    });
  });

  document.querySelectorAll('[data-action="close-progress-picker"]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      state.progressPickerOpen = false;
      renderLayout();
    });
  });

  document.querySelectorAll('[data-action="progress-year-change"]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      const direction = Number(button.dataset.direction || 0);
      if (!direction) return;

      state.currentYear += direction;
      state.progressData = null;
      renderLayout();
      await loadProgressData(true);
    });
  });

  document.querySelectorAll('[data-action="progress-year-set"]').forEach((button) => {
    button.addEventListener('click', async (event) => {
      event.stopPropagation();
      const targetYear = Number(button.dataset.year);
      if (!Number.isInteger(targetYear) || targetYear < 1900 || targetYear > 2200) return;

      state.currentYear = targetYear;
      state.progressData = null;
      renderLayout();
      await loadProgressData(true);
    });
  });

  document.querySelectorAll('.assistant-input').forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const sendButton = document.querySelector('.composer-send');
        sendButton?.click();
      }
    });
  });

  document.querySelectorAll('.composer-mic').forEach((button) => {
    button.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        window.alert('Voice input is not supported in this browser.');
        return;
      }

      button.style.color = '#ff4757'; 

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.querySelector('.assistant-input');
        const sendButton = document.querySelector('.composer-send');
        
        if (input) {
          input.value = transcript; 
        }

        if (sendButton) {
          sendButton.click(); 
        }
      };

      recognition.onend = () => {
        button.style.color = ''; 
      };

      recognition.start();
    });
  });

  app.querySelectorAll('[data-action="close-more-menu"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.moreMenuOpen = false;
      renderLayout();
    });
  });

  bindFocusTimer();
  isRendering = false;
}


function bindBottomNav() {
  document.querySelectorAll('.bottom-nav .nav-item').forEach((button) => {
    button.addEventListener('click', async (e) => {
      // The Menu button opens a dedicated page instead of a popup over the current page.
      if (button.dataset.action === 'toggle-more-menu') {
        e.stopPropagation();
        state.entryModalOpen = false;
        state.entryDraft = null;
        state.progressPickerOpen = false;
        state.profileModalOpen = false;
        state.moreMenuOpen = false;
        state.menuOpen = false;
        state.moodPickerOpen = false;
        state.view = 'menu';
        renderLayout();
        return;
      }

      // 2. If it's Home or Assistant
      const view = button.dataset.view;
      if (!view) return;

      // 3. Force close ALL popups before switching pages (Fixes the highlight bug)
      state.entryModalOpen = false;
      state.entryDraft = null;
      state.progressPickerOpen = false;
      state.profileModalOpen = false; 
      state.moreMenuOpen = false; 

      if (state.view !== view && state.view !== 'home' && state.view !== 'assistant') state.navigationHistory.push(state.view);
      state.view = view;
      renderLayout();

      if (view === 'progress') {
        await loadProgressData(true);
      }
    });
  });
}
let globalListenersBound = false;
let lastAppScrollTop = 0;
let smartNavBound = false;

function isEditableControl(element) {
  return Boolean(element?.matches?.('input:not([type="button"]):not([type="submit"]), textarea, select, [contenteditable="true"]'));
}

function syncKeyboardViewport() {
  const viewport = window.visualViewport;
  const activeEditable = isEditableControl(document.activeElement);
  const isSmallScreen = window.matchMedia?.('(max-width: 760px)').matches || window.innerWidth <= 760;
  const viewportReduced = Boolean(viewport && (window.innerHeight - viewport.height > 120 || viewport.height < window.innerHeight * 0.76));
  const keyboardOpen = Boolean(isSmallScreen && activeEditable && (viewportReduced || document.activeElement));
  document.body.classList.toggle('keyboard-open', keyboardOpen);
  document.documentElement.classList.toggle('keyboard-open', keyboardOpen);
  document.querySelector('.bottom-nav')?.classList.toggle('keyboard-hidden', keyboardOpen);
  if (viewport) {
    document.documentElement.style.setProperty('--sahra-visual-height', `${Math.max(220, viewport.height)}px`);
  }
}

function revealFocusedControl(element) {
  if (!isEditableControl(element)) return;
  const target = element;
  [100, 320, 520].forEach((delay) => {
    window.setTimeout(() => {
      if (!target.isConnected || document.activeElement !== target) return;
      syncKeyboardViewport();
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const rect = target.getBoundingClientRect();
      if (rect.bottom > viewportHeight - 26 || rect.top < 10) {
        target.scrollIntoView({ block: 'center', behavior: delay > 100 ? 'smooth' : 'auto' });
      }
    }, delay);
  });
}

function bindSmartNavigationAndKeyboard() {
  if (smartNavBound) return;
  smartNavBound = true;
  const app = document.getElementById('app');
  const nav = document.querySelector('.bottom-nav');
  if (app && nav) {
    lastAppScrollTop = app.scrollTop;
    app.addEventListener('scroll', () => {
      const currentTop = app.scrollTop;
      if (document.body.classList.contains('keyboard-open')) {
        nav.classList.add('keyboard-hidden');
        lastAppScrollTop = currentTop;
        return;
      }
      const delta = currentTop - lastAppScrollTop;
      if (currentTop <= 8) {
        nav.classList.remove('scroll-hidden');
      } else if (delta > 5) {
        nav.classList.add('scroll-hidden');
      } else if (delta < -5) {
        nav.classList.remove('scroll-hidden');
      }
      lastAppScrollTop = currentTop;
    }, { passive: true });
  }

  document.addEventListener('focusin', (event) => {
    if (!isEditableControl(event.target)) return;
    syncKeyboardViewport();
    revealFocusedControl(event.target);
  });
  document.addEventListener('focusout', () => {
    window.setTimeout(() => {
      syncKeyboardViewport();
      if (!document.body.classList.contains('keyboard-open')) {
        document.querySelector('.bottom-nav')?.classList.remove('keyboard-hidden');
      }
    }, 180);
  });
  window.addEventListener('resize', syncKeyboardViewport, { passive: true });
  window.visualViewport?.addEventListener('resize', syncKeyboardViewport, { passive: true });
  window.visualViewport?.addEventListener('scroll', syncKeyboardViewport, { passive: true });
}

async function clearResetCategoryLocalCache(token, category) {
  const collections = RESET_CATEGORY_META[category]?.collections || [];
  const names = new Set(collections);
  if (category === 'notepad') { names.add('notes'); names.add('assets'); }
  if (category === 'expenses') { names.add('transactions'); names.add('expenses'); names.add('subscriptions'); }
  if (category === 'calendar') { names.add('events'); names.add('reminders'); }
  if (category === 'progress') { names.add('goals'); names.add('habits'); names.add('habitLogs'); names.add('moods'); }
  for (const collection of names) {
    try {
      const cached = await offlineSync.read(token, collection);
      for (const row of cached) await offlineSync.remove(token, collection, row.id || row._id);
    } catch (error) { console.warn(`Could not clear ${collection} local cache after reset:`, error.message); }
  }
  try {
    const outbox = await offlineSync.read(token, 'syncOutbox');
    const roots = category === 'tasks' ? ['tasks']
      : category === 'notepad' ? ['assets', 'notes']
      : category === 'expenses' ? ['transactions', 'expenses', 'subscriptions']
      : category === 'calendar' ? ['events', 'reminders']
      : category === 'progress' ? ['goals', 'habits', 'habitlogs', 'habit-logs', 'moods'] : [];
    for (const op of outbox) {
      if (roots.includes(String(op.resource || op.root || op.collection || '').toLowerCase())) {
        await offlineSync.remove(token, 'syncOutbox', op.id || op._id);
      }
    }
  } catch (error) { console.warn('Could not reconcile reset queue:', error.message); }
}

async function performSelectedDataReset() {
  const selected = Object.keys(RESET_CATEGORY_META).filter((key) => state.resetOptionsSelected?.[key]);
  if (!selected.length) { showToast('Select at least one data section to reset.'); return; }
  const token = await getAuthToken();
  if (!token) { showToast('Sign in again to reset saved data.'); return; }
  if (!globalThis.navigator?.onLine) { showToast('Connect to the internet before resetting synced data.'); return; }
  state.resetOptionsBusy = true;
  renderLayout();
  try {
    const syncStatus = await offlineSync.flush(token);
    if (syncStatus?.pending) {
      throw new Error('Some offline changes are still waiting to sync. Reconnect and try again before resetting so deleted data cannot return.');
    }
    const results = [];
    for (const category of selected) {
      const response = await apiRequest(`/api/reset-data/${encodeURIComponent(category)}`, { method: 'DELETE' });
      results.push({ category, count: Number(response.deletedCount || 0) });
      await clearResetCategoryLocalCache(token, category);
      if (category === 'focus') {
        focusStopAudio();
        state.focusRunning = false; state.focusEndsAt = null; state.focusStartedAt = null;
        state.focusAlarmActive = false; state.focusAlarmStartedAt = null; state.focusSessionId = null;
        state.focusSeconds = state.focusInitialSeconds || 25 * 60;
        state.focusSessions = [];
        try { localStorage.removeItem('sahraFocusSessions'); localStorage.removeItem(FOCUS_TIMER_STORAGE_KEY); } catch (_) {}
        try { await LocalNotifications.cancel({ notifications: [{ id: 7001 }] }); } catch (_) {}
      }
    }
    if (selected.includes('tasks')) state.data.tasks = [];
    if (selected.includes('notepad')) { state.data.assets = []; state.data.notes = []; }
    if (selected.includes('expenses')) { state.financeData = []; state.data.expenses = []; state.data.subscriptions = []; }
    if (selected.includes('calendar')) { state.data.events = []; state.data.reminders = []; state.calendarCache = new Set(); }
    if (selected.includes('progress')) { state.data.goals = []; state.data.habits = []; state.data.habitLogs = []; state.data.moods = []; state.progressData = null; }
    state.resetConfirmOpen = false;
    state.resetOptionsSelected = { tasks: false, notepad: false, expenses: false, calendar: false, progress: false, focus: false };
    await loadDashboardData();
    await fetchFinanceData();
    await loadProgressData(false);
    try { await reconcileNativeNotifications(); } catch (error) { console.warn('Notification reconciliation after reset failed:', error.message); }
    const summary = results.map((row) => `${RESET_CATEGORY_META[row.category].title}: ${row.count}`).join(' · ');
    showToast(`Selected data reset. ${summary}`);
    state.view = 'settings';
    renderLayout();
  } catch (error) {
    console.error('DaySync reset operation failed:', error);
    showToast(error.message || 'The reset could not finish. Check your connection and review the selected data.');
    try { await loadDashboardData(); await fetchFinanceData(); await loadProgressData(false); } catch (refreshError) { console.warn('Unable to refresh after a partial reset:', refreshError.message); }
    state.resetConfirmOpen = true;
    renderLayout();
  } finally {
    state.resetOptionsBusy = false;
    renderLayout();
  }
}

function bindGlobalListeners() {
  if (globalListenersBound) return;
  globalListenersBound = true;
  bindSmartNavigationAndKeyboard();

  document.addEventListener('click', async (event) => {
    const sharedBack = event.target.closest('[data-action="shared-page-back"]');
    if (sharedBack) { goBackFromView(); return; }
    const openReset = event.target.closest('[data-action="open-reset-options"]');
    if (openReset) {
      state.resetOptionsSelected = { tasks: false, notepad: false, expenses: false, calendar: false, progress: false, focus: false };
      state.resetConfirmOpen = false;
      setView('reset-options');
      return;
    }
    const resetBack = event.target.closest('[data-action="reset-back-settings"]');
    if (resetBack) { state.resetConfirmOpen = false; state.view = 'settings'; renderLayout(); return; }
    const toggleResetCategory = event.target.closest('[data-action="reset-toggle-category"]');
    if (toggleResetCategory) {
      const category = toggleResetCategory.dataset.category;
      if (Object.prototype.hasOwnProperty.call(RESET_CATEGORY_META, category)) {
        state.resetOptionsSelected = { ...state.resetOptionsSelected, [category]: !state.resetOptionsSelected[category] };
        renderLayout();
      }
      return;
    }
    const selectAllReset = event.target.closest('[data-action="reset-select-all"]');
    if (selectAllReset) {
      const allSelected = Object.keys(RESET_CATEGORY_META).every((key) => state.resetOptionsSelected?.[key]);
      state.resetOptionsSelected = Object.fromEntries(Object.keys(RESET_CATEGORY_META).map((key) => [key, !allSelected]));
      renderLayout();
      return;
    }
    const reviewReset = event.target.closest('[data-action="reset-review"]');
    if (reviewReset) {
      const anySelected = Object.keys(RESET_CATEGORY_META).some((key) => state.resetOptionsSelected?.[key]);
      if (!anySelected) { showToast('Select at least one data section to reset.'); return; }
      state.resetConfirmOpen = true;
      renderLayout();
      return;
    }
    const cancelReset = event.target.closest('[data-action="reset-cancel"]');
    if (cancelReset) {
      state.resetConfirmOpen = false;
      renderLayout();
      return;
    }
    const confirmReset = event.target.closest('[data-action="reset-confirm"]');
    if (confirmReset) {
      if (state.resetOptionsBusy) return;
      const phrase = String(document.getElementById('reset-confirm-phrase')?.value || '').trim();
      const acknowledged = Boolean(document.querySelector('[data-reset-acknowledge]')?.checked);
      if (phrase !== 'DELETE' || !acknowledged) {
        showToast('Check the permanent deletion acknowledgment and type DELETE to continue.');
        return;
      }
      await performSelectedDataReset();
      return;
    }

    const locationSettingsButton = event.target.closest('[data-action="open-location-permission-settings"]');
    if (locationSettingsButton) { void openDaySyncNativeSettings('openAppSettings'); return; }
    const deviceLocationSettingsButton = event.target.closest('[data-action="open-device-location-settings"]');
    if (deviceLocationSettingsButton) { void openDaySyncNativeSettings('openLocationSettings'); return; }
    const notificationSettingsButton = event.target.closest('[data-action="open-notification-permission-settings"]');
    if (notificationSettingsButton) { void openDaySyncNativeSettings('openNotificationSettings'); return; }
    const openSettingsButton = event.target.closest('[data-action="open-settings"]');
    if (openSettingsButton) {
      state.menuOpen = false; state.moreMenuOpen = false; state.entryModalOpen = false; state.entryDraft = null;
      setView('settings'); return;
    }
    const settingsBackButton = event.target.closest('[data-action="settings-back"]');
    if (settingsBackButton) { goBackFromView(); return; }
    const clearAssistantButton = event.target.closest('[data-action="clear-assistant-chat"]');
    if (clearAssistantButton) {
      state.assistantGeneration += 1;
      state.assistantMessages = [
        { role: 'assistant', text: "I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress." },
      ];
      renderLayout();
      return;
    }

    const clickedMonthPicker = event.target.closest('.month-picker-wrapper');
    const clickedMenu = event.target.closest('.menu-panel, .menu-button');
    const clickedMoodPicker = event.target.closest('.mood-selector-wrap');
    const clickedMoreMenu = event.target.closest('.more-menu-panel');
    const clickedMoreMenuToggle = event.target.closest('[data-action="toggle-more-menu"]');

    let needsRender = false;

    if (!clickedMenu && state.menuOpen) {
      state.menuOpen = false;
      needsRender = true;
    }

    if (state.progressPickerOpen && !clickedMonthPicker) {
      state.progressPickerOpen = false;
      needsRender = true;
    }

    if (state.moodPickerOpen && !clickedMoodPicker) {
      state.moodPickerOpen = false;
      needsRender = true;
    }

    if (state.moreMenuOpen && !clickedMoreMenu && !clickedMoreMenuToggle) {
      state.moreMenuOpen = false;
      needsRender = true;
    }

    if (needsRender) {
      renderLayout();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    let changed = false;
    if (state.resetConfirmOpen) { state.resetConfirmOpen = false; changed = true; }

    if (state.progressPickerOpen) {
      state.progressPickerOpen = false;
      changed = true;
    }

    if (state.menuOpen) {
      state.menuOpen = false;
      changed = true;
    }

    if (state.moodPickerOpen) {
      state.moodPickerOpen = false;
      changed = true;
    }

    if (state.moreMenuOpen) {
      state.moreMenuOpen = false;
      changed = true;
    }

    if (changed) {
      renderLayout();
    }
  });
}

// ==========================================
// FINANCE MODULE
// ==========================================

function triggerAppRender() {
  renderLayout();
}

async function fetchFinanceData() {
  if (!state.authenticated) return;

  try {
    const payload = await apiRequest('/api/transactions');

    state.financeData = Array.isArray(payload)
      ? payload
      : (payload.transactions || []);

    renderLayout();
  } catch (error) {
    console.error('Failed to load finance data:', error);
    try {
      const cached = await offlineSync.transactionFallback(await getAuthToken());
      if (cached.length) { state.financeData = cached; showOfflineBannerOnce(); renderLayout(); }
    } catch (cacheError) { console.warn('Finance cache unavailable:', cacheError.message); }
  }
}

let financeListenersBound = false;

function bindFinanceListeners() {
  if (financeListenersBound) return;
  financeListenersBound = true;

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const action = button.dataset.action;

    // Quick amount chips add their value to the current amount.
    // This handler supports both income and expense forms because they share the same input.
    if (action === 'quick-amount') {
      event.preventDefault();
      const amountInput = document.getElementById('finance-amount');
      const increment = Number(button.dataset.val);
      if (!amountInput || !Number.isFinite(increment) || increment <= 0) return;
      const currentAmount = Number.parseFloat(amountInput.value);
      const current = Number.isFinite(currentAmount) && currentAmount > 0 ? currentAmount : 0;
      amountInput.value = String(Number((current + increment).toFixed(2)));
      amountInput.dispatchEvent(new Event('input', { bubbles: true }));
      amountInput.dispatchEvent(new Event('change', { bubbles: true }));
      button.classList.add('quick-amount-applied');
      window.setTimeout(() => button.classList.remove('quick-amount-applied'), 240);
      return;
    }

    // -------------------------------
    // CHANGE FINANCE VIEW
    // -------------------------------
    if (action === 'set-finance-view') {
      state.financeView = button.dataset.view || 'dashboard';
      renderLayout();
      return;
    }

    // -------------------------------
    // WEEK / MONTH / YEAR
    // -------------------------------
    if (action === 'set-finance-filter') {
      state.financeFilter = button.dataset.filter || 'week';
      renderLayout();
      return;
    }

    // -------------------------------
    // SELECT INCOME / EXPENSE
    // -------------------------------
    if (action === 'select-finance-type') {
      state.tempFinanceType = button.dataset.type || 'expense';
      state.financeView = 'add-expense';
      renderLayout();
      return;
    }

    // -------------------------------
    // SHOW RESET MODAL
    // -------------------------------
    if (action === 'show-finance-reset-confirm') {
      state.showFinanceResetConfirm = true;
      renderLayout();
      return;
    }

    // -------------------------------
    // CANCEL RESET
    // -------------------------------
    if (action === 'cancel-finance-reset') {
      state.showFinanceResetConfirm = false;
      renderLayout();
      return;
    }

    // -------------------------------
    // DELETE ALL TRANSACTIONS
    // -------------------------------
    if (action === 'confirm-finance-reset') {
      if (state.financeResetLoading) return;
      state.financeResetLoading = true;
      renderLayout();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15_000);
      try {
        const response = await apiRequest('/api/transactions', {
          method: 'DELETE',
          signal: controller.signal,
        });

        state.financeData = [];
        state.financeDetail = null;
        state.showFinanceResetConfirm = false;
        state.tempFinanceType = null;
        state.financeView = 'dashboard';

        showToast(
          `${response.deletedCount || 0} transactions deleted`
        );

        renderLayout();

      } catch (error) {
        console.error('Reset transactions error:', error);
        showToast(error.name === 'AbortError'
          ? 'Reset timed out. Check your connection and retry.'
          : error.message || 'Unable to reset transactions');
      } finally {
        clearTimeout(timeout);
        state.financeResetLoading = false;
        renderLayout();
      }

      return;
    }

    // -------------------------------
    // OPEN TRANSACTION DETAIL
    // -------------------------------
    if (action === 'show-transaction-detail') {
      const id = button.dataset.id;

      const transaction = state.financeData.find(
        (item) =>
          String(item._id || item.id) === String(id)
      );

      if (!transaction) return;

      state.financeDetail = transaction;
      renderLayout();
      return;
    }

    // -------------------------------
    // CLOSE DETAIL
    // -------------------------------
    if (action === 'close-transaction-detail') {
      state.financeDetail = null;
      renderLayout();
      return;
    }

    // -------------------------------
    // DELETE ONE TRANSACTION
    // -------------------------------
   // -------------------------------
// DELETE ONE TRANSACTION
// -------------------------------
// -------------------------------
// DELETE ONE TRANSACTION
// -------------------------------
if (action === 'delete-finance-transaction') {
  const id = button.dataset.id;

  if (!id) {
    showToast('Transaction ID is missing');
    return;
  }

  // Prevent multiple taps
  if (button.dataset.deleting === 'true') {
    return;
  }

  const index = state.financeData.findIndex(
    (item) => String(item._id || item.id) === String(id)
  );

  if (index === -1) {
    showToast('Transaction not found');
    return;
  }

  const deletedTransaction = state.financeData[index];

  // Lock button immediately
  button.dataset.deleting = 'true';
  button.disabled = true;

  // --------------------------------
  // REMOVE FROM UI IMMEDIATELY
  // --------------------------------
  state.financeData.splice(index, 1);
  state.financeDetail = null;

  renderLayout();

  // --------------------------------
  // DELETE FROM MONGODB
  // --------------------------------
  try {
    await apiRequest(`/api/transactions/${id}`, {
      method: 'DELETE'
    });

    showToast('Transaction deleted successfully');

  } catch (error) {
    console.error('Delete transaction error:', error);

    // --------------------------------
    // RESTORE IF SERVER DELETE FAILED
    // --------------------------------
    state.financeData.splice(index, 0, deletedTransaction);

    state.financeDetail = deletedTransaction;

    renderLayout();

    showToast(
      error.message || 'Unable to delete transaction'
    );
  }

  return;
}

    // -------------------------------
    // SAVE TRANSACTION
    // -------------------------------
    if (action === 'save-finance-transaction') {
      if (button.dataset.submitting === 'true') return;

      button.dataset.submitting = 'true';
      button.textContent = 'Saving...';

      const amount = document.getElementById('finance-amount')?.value;
      const category = document.getElementById('finance-category')?.value;
      const date = document.getElementById('finance-date')?.value;
      const note = document.getElementById('finance-note')?.value;
      
      // 👈 1. ADD THIS LINE to grab the payment method from your form
      const paymentMethod = document.getElementById('finance-payment-method')?.value || 'Cash';

      const type = button.dataset.type || state.tempFinanceType || 'expense';

      if (!amount || Number(amount) <= 0) {
        showToast('Please enter a valid amount.');

        button.dataset.submitting = 'false';
        button.textContent = 'Save Transaction';
        return;
      }

      try {
        await apiRequest('/api/transactions', {
          method: 'POST',
          body: JSON.stringify({
            amount: Number(amount),
            category: category || 'Other',
            date: date || new Date().toISOString(),
            note: note || '',
            type,
            paymentMethod // 👈 2. ADD THIS LINE to send it to the database
          })
        });

        state.financeView = 'dashboard';
        state.tempFinanceType = null;

        await fetchFinanceData();


        showToast('Transaction saved successfully');

      } catch (error) {
        console.error(error);

        showToast(
          error.message || 'Unable to save transaction'
        );

        button.dataset.submitting = 'false';
        button.textContent = 'Save Transaction';
      }

      return;
    }
  });
}

// Weather actions are delegated at document level so they continue working after re-renders.
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action="open-weather"], [data-action="weather-back"], [data-action="weather-refresh"], [data-action="view-today-events"]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'open-weather') {
    state.view = 'weather';
    state.entryModalOpen = false;
    state.entryDraft = null;
    renderLayout();
    void loadWeatherForCurrentLocation();
  } else if (action === 'weather-back') {
    state.view = 'home';
    renderLayout();
  } else if (action === 'weather-refresh') {
    void loadWeatherForCurrentLocation();
  } else if (action === 'view-today-events') {
    state.selectedDate = formatDateKey(new Date());
    state.currentMonth = new Date().getMonth();
    state.currentYear = new Date().getFullYear();
    state.view = 'calendar';
    renderLayout();
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-weather-search-form]');
  if (!form) return;
  event.preventDefault();
  const city = String(new FormData(form).get('city') || '').trim();
  if (city.length >= 2) void loadWeatherForCurrentLocation(city);
});

async function initializeApp() {
  await initializeLocalDatabase();
  window.addEventListener('daysync:permissions-updated', () => { if (state.view === 'settings') renderLayout(); });
  applyTheme(getStoredTheme());
  bindBottomNav();
  bindGlobalListeners();
  bindFinanceListeners();

  const token = await getAuthToken();
  state.authenticated = Boolean(token);
  if (!token) {
    window.location.href = getLoginPath();
    return;
  }

  if (globalThis.navigator?.onLine) await offlineSync.flush(token);
  await loadDashboardData();
  await fetchFinanceData();
  restorePersistedFocusTimer();
  if (window.SAHRA_NOTIFICATIONS?.isNative?.()) { void window.SAHRA_NOTIFICATIONS.permissionStatus().then(() => { if (state.view === 'settings') renderLayout(); }); }
  window.SAHRA_FOCUS_TIMER_READY = true;
  processPendingFocusAlarmAction();

  if (window.Capacitor?.isNativePlatform()) {
    const { markSahraOtaReady } = await import('./scripts/mobile-ota.js');
    await markSahraOtaReady();
  }
}

initializeApp().catch((error) => {
  console.error('App initialization failed:', error);
  showToast(error.message || 'Unable to initialize DaySync.');
  renderLayout();
});
