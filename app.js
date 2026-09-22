
import { renderCalendarPage } from './pages/calendar.js';
import { renderMoodPage } from './pages/mood.js';
import { renderTasksPage } from './pages/tasks.js';
import { renderHabitsPage } from './pages/habits.js';
import { renderGoalsPage } from './pages/goals.js';
import { renderAssistantPage } from './pages/assistant.js';

const EMPTY_DATA = {
  events: [],
  tasks: [],
  moods: [],
  habits: [],
  goals: [],
  reminders: [],
  notes: [],
  habitLogs: [],
};

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
  data: { ...EMPTY_DATA },
  user: JSON.parse(localStorage.getItem('sahraUser') || 'null') || { name: 'Sahra' },
  theme: localStorage.getItem('theme') || 'dark',
  menuOpen: false,
  profileEditing: false,
  profileDraft: null,
  entryModalOpen: false,
  entryDraft: null,
  todoFilter: 'All',
  moodPickerOpen: false,
  navigationHistory: [],
  assistantMessages: [
    { role: 'assistant', text: "I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress." },
  ],
  assistantLoading: false,
  assistantDraft: '',
  voiceListening: false,
  progressPickerOpen: false,
  progressData: null,
  progressLoading: false,
  showAllActivity: false,
  calendarCache: new Set(),
};
let activeRecognition = null;
let speechSilenceTimer = null;
let notificationInterval = null;


function applyTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark';
  state.theme = nextTheme;
  document.documentElement.setAttribute('data-theme', nextTheme);
  document.body.setAttribute('data-theme', nextTheme);
  document.body.classList.toggle('theme-light', nextTheme === 'light');
  document.body.classList.toggle('theme-dark', nextTheme === 'dark');
  localStorage.setItem('theme', nextTheme);
}

function getStoredTheme() {
  return localStorage.getItem('theme') || 'dark';
}

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('sahraToken');

  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'string' ? payload : payload?.message || 'Request failed';
    if (response.status === 401) {
      localStorage.removeItem('sahraToken');
      localStorage.removeItem('sahraUser');
      window.location.href = '/login';
    }
    throw new Error(message);
  }

  return payload;
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

async function loadDashboardData() {
  const token = localStorage.getItem('sahraToken');

  if (!token) {
    window.location.href = '/login';
    return;
  }

  try {
    const payload = await apiRequest('/api/dashboard');

    state.data = {
      ...EMPTY_DATA,
      ...(payload.data || {}),
    };

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
  };

  const endpoint = endpoints[type];
  if (!endpoint) return;

  await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  await loadDashboardData();
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
async function showSahraNotification(resource, item) {
  const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
  const time = resource === 'event' ? item.startTime : item.time;
  const options = {
    body: `${resource === 'event' ? 'Event' : 'Task'}: ${item.title}${time ? ` • ${time}` : ''}`,
    icon: '/assets/sahra.png',
    badge: '/assets/sahra.png',
    tag: `sahra-${resource}-${item.id || item._id}`,
    data: { date: item.date, resource, id: item.id || item._id },
  };
  if (registration?.showNotification) {
    await registration.showNotification('Sahra reminder', options);
    return;
  }
  const notification = new Notification('Sahra reminder', options);
  notification.onclick = () => {
    window.focus();
    window.location.href = `/dashboard?date=${encodeURIComponent(item.date)}`;
  };
}
async function checkDueNotifications() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  const resources = [
    ...state.data.tasks.map((item) => ({ resource: 'task', item })),
    ...state.data.events.map((item) => ({ resource: 'event', item })),
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
async function enableNotifications() {
  if (!('Notification' in window)) {
    window.alert('Notifications are not supported in this browser.');
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    await checkDueNotifications();
    window.alert('Sahra reminders are enabled.');
  } else {
    window.alert('Notification permission was not granted.');
  }
}

async function loadSelectedDateData(dateString) {
  if (!localStorage.getItem('sahraToken') || state.calendarCache.has(dateString)) return;

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
      src="/assets/sahra.png"
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

  if (type === 'event' && isPastDate(state.selectedDate)) {
    window.alert('Events can only be added for today or future dates.');
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
  };
  renderLayout();
}

function setView(nextView) {
  if (state.view !== nextView) {
    state.navigationHistory.push(state.view);
    state.view = nextView;
  }
  renderLayout();
}

function goBackFromView() {
  const previousView = state.navigationHistory.pop();
  state.view = previousView || 'home';
  renderLayout();
}

function closeEntryModal() {
  state.entryModalOpen = false;
  state.entryDraft = null;
  renderLayout();
}

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
            <strong style="display: block; font-size: 1.2rem; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${user.name || 'Sahra User'}</strong>
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
  const modalTitle = draft.type === 'task' ? 'Add Task' : draft.type === 'mood' ? 'Add Mood' : 'Add Event';

  return `
    <div class="entry-modal-backdrop visible">
      <div class="entry-modal">
        <div class="entry-modal-header">
          <h3>${modalTitle}</h3>
          <button class="entry-close" type="button" data-action="close-entry-modal">✕</button>
        </div>

        <div class="entry-form">
          ${draft.type === 'task' ? `
            <label class="entry-field">
              <span>Task Name</span>
              <input type="text" data-entry-field="title" value="${(draft.title || '').replace(/"/g, '&quot;')}" placeholder="Study JavaScript" />
            </label>
            <label class="entry-field">
              <span>Date</span>
              <input type="date" data-entry-field="date" value="${draft.date || state.selectedDate}" />
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
          ` : `
            <label class="entry-field">
              <span>Date</span>
              <input type="date" data-entry-field="date" value="${draft.date || state.selectedDate}" />
            </label>

            <label class="entry-field">
              <span>Title</span>
              <input type="text" data-entry-field="title" value="${(draft.title || '').replace(/"/g, '&quot;')}" placeholder="Enter title here" />
            </label>
          `}

          ${draft.type === 'event' ? `
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
          ` : ''}

          ${draft.type === 'habit' ? `
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Goal</span>
                <input type="number" min="1" data-entry-field="goal" value="${draft.goal || 1}" />
              </label>
              <label class="entry-field">
                <span>Frequency</span>
                <select data-entry-field="frequency">
                  <option value="Daily" ${draft.frequency === 'Daily' ? 'selected' : ''}>Daily</option>
                  <option value="Weekly" ${draft.frequency === 'Weekly' ? 'selected' : ''}>Weekly</option>
                  <option value="Monthly" ${draft.frequency === 'Monthly' ? 'selected' : ''}>Monthly</option>
                </select>
              </label>
            </div>
          ` : ''}

          ${draft.type === 'goal' ? `
            <div class="entry-inline-grid">
              <label class="entry-field">
                <span>Current</span>
                <input type="number" min="0" data-entry-field="current" value="${draft.current || 0}" />
              </label>
              <label class="entry-field">
                <span>Target</span>
                <input type="number" min="1" data-entry-field="target" value="${draft.target || 30}" />
              </label>
            </div>
            <label class="entry-field">
              <span>Duration</span>
              <input type="text" data-entry-field="duration" value="${(draft.duration || '30 days').replace(/"/g, '&quot;')}" placeholder="30 days" />
            </label>
          ` : ''}

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

          ${draft.type !== 'task' && draft.type !== 'mood' ? `
            <label class="entry-field">
              <span>Description</span>
              <textarea rows="3" data-entry-field="description" placeholder="Add details">${(draft.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
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
      <section class="screen profile-screen">
        <div class="page-header profile-header">
          <button class="back-button" type="button" data-action="profile-cancel">← Back</button>
          <h2>Edit Profile</h2>
        </div>

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
    <section class="screen profile-screen">
      <div class="page-header profile-header">
        <button class="back-button" type="button" data-action="back-home">← Back</button>
        <h2>Profile</h2>
      </div>

      <div class="glass-card profile-panel">
        <div class="profile-avatar large">${(user.name || 'S').charAt(0).toUpperCase()}</div>
        <div class="profile-name">${user.name || 'Sahra User'}</div>
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

const monthLabel = new Date(
  state.currentYear,
  state.currentMonth,
  1
).toLocaleDateString('en-IN', {
  month: 'long',
  year: 'numeric',
});

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthStart = new Date(state.currentYear, state.currentMonth, 1);
  const firstDayOfMonth = new Date(state.currentYear, state.currentMonth, 1);
  const offset = firstDayOfMonth.getDay();
  const totalDaysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const totalDaysInPrevMonth = new Date(state.currentYear, state.currentMonth, 0).getDate();
  const entriesByDate = {
    events: new Set((state.data.events || []).map((event) => event.date)),
    tasks: new Set((state.data.tasks || []).map((task) => task.date)),
    moods: new Set((state.data.moods || []).map((mood) => mood.date)),
  };

  const calendarDays = [];
  for (let i = 0; i < offset; i += 1) {
    calendarDays.push({ value: totalDaysInPrevMonth - offset + i + 1, empty: true });
  }

  for (let day = 1; day <= totalDaysInMonth; day += 1) {
    const dateValue = new Date(state.currentYear, state.currentMonth, day);
    const iso = formatDateKey(dateValue);
    const dayEvents = entriesByDate.events.has(iso);
    const dayTasks = entriesByDate.tasks.has(iso);
    const dayMood = entriesByDate.moods.has(iso);

    calendarDays.push({
      value: day,
      empty: false,
      active: iso === state.selectedDate,
      iso,
      hasEvent: dayEvents,
      hasTask: dayTasks,
      hasMood: dayMood,
    });
  }

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push({ value: calendarDays.length - totalDaysInMonth - offset + 1, empty: true });
  }

  const userName = state.user?.name ? state.user.name.split(' ')[0] : 'Friend';
  const tasks = state.data.tasks || [];
  const taskPreview = tasks.slice(0, 3);
  const completedTasks = tasks.filter((task) => task.completed || task.status === 'Completed').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return `
    <section class="screen home-screen">
      <section class="hero glass-card">
        <div class="hero-top">
          <div class="brand">
            <div class="brand-mark">${renderSahraLogo(52)}</div>
            <div class="brand-text">
              <h1>Sahra</h1>
              <p>LIFE CALENDAR</p>
            </div>
          </div>

          <div class="menu-wrap">
            <button class="menu-button" type="button" aria-label="Open menu">⋮</button>
            <div class="menu-panel ${state.menuOpen ? 'open' : 'hidden'}">
              <button class="menu-item" type="button" data-menu-action="light-theme"><span>☀️</span> Light Mode</button>
              <button class="menu-item" type="button" data-menu-action="dark-theme"><span>🌙</span> Dark Mode</button>
              <button class="menu-item" type="button" data-menu-action="profile"><span>👤</span> Profile</button>
              <div class="menu-divider"></div>
              <button class="menu-item danger" type="button" data-menu-action="logout"><span>🚪</span> Logout</button>
            </div>
          </div>
        </div>

        <div class="hero-card">
          <div class="avatar">${(userName || 'S').charAt(0).toUpperCase()}</div>
          <div class="hero-copy">
            <h2>Hi ${userName}! 👋</h2>
            <p>I'm Sahra, your AI assistant.</p>
            <p>How can I help you today?</p>
          </div>
        </div>
      </section>

      <section class="glass-card layout-card date-weather-card">
        <div class="date-weather-row">
          <div>
            <div class="date-weather-day">${today.toLocaleDateString('en-IN', { weekday: 'long' })}</div>
            <div class="date-weather-date">${today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div class="weather-icon">⛅</div>
        </div>
        <div class="date-weather-temp-wrap">
          <div class="temp-value">27°<span>C</span></div>
          <div class="weather-meta">Partly Cloudy</div>
        </div>
      </section>

      <section class="glass-card layout-card calendar-card">
        <div class="calendar-header">
          <h3>${monthLabel}</h3>
          <div class="calendar-actions">
            <button class="calendar-arrow" type="button" aria-label="Previous month">‹</button>
            <button class="calendar-arrow" type="button" aria-label="Next month">›</button>
            <button class="today-button" type="button" data-view="calendar">Today</button>
          </div>
        </div>

        <div class="calendar-grid">
          ${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join('')}
          ${calendarDays.map((day) => {
            const indicators = [];
            if (day.hasEvent) indicators.push('<span class="mini-indicator event"></span>');
            if (day.hasTask) indicators.push('<span class="mini-indicator task"></span>');
            if (day.hasMood) indicators.push('<span class="mini-indicator mood"></span>');
            return `
              <button
                class="calendar-day ${day.empty ? 'dim' : ''} ${day.active ? 'selected' : ''}"
                type="button"
                data-date="${day.iso || ''}"
                ${day.empty ? 'disabled' : ''}
              >
                <span>${day.value}</span>
                ${indicators.length ? `<span class="calendar-indicators">${indicators.join('')}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>

        <div class="event-row">
          <div class="event-status">
            <span class="status-dot"></span>
            <span>${state.data.events.filter((event) => event.date === state.selectedDate).length ? `Selected day has ${state.data.events.filter((event) => event.date === state.selectedDate).length} event(s)` : 'No events on this day'}</span>
          </div>
          <div class="event-actions">
            <button class="show-event" type="button" data-action="show-selected-day">Show</button>
            <button class="add-event" type="button" data-action="open-add-entry" data-type="event">+ Add Event</button>
          </div>
        </div>
      </section>

      <section class="glass-card layout-card todo-card">
        <div class="card-header compact">
          <h3>To Do List</h3>
          <button class="small-btn" type="button" data-view="tasks">+ Add Task</button>
        </div>

        ${taskPreview.length ? `
          <div class="mini-todo-list">
            ${taskPreview.map((task) => `
              <div class="mini-todo-item">
                <span class="mini-check ${task.completed || task.status === 'Completed' ? 'done' : ''}">${task.completed || task.status === 'Completed' ? '✓' : ''}</span>
                <span>${task.title}</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-task-state">
            <div class="task-icon">✓</div>
            <div class="task-copy">
              <strong>No tasks yet.</strong>
              <span>Add a task to stay productive!</span>
            </div>
          </div>
        `}
      </section>

      <section class="glass-card layout-card progress-card">
        <div class="card-header compact">
          <h3>Today's Progress</h3>
          <span class="chip">${progressPercent}%</span>
        </div>

        <div class="progress-block">
          <div class="progress-row">
            <div class="progress-label">
              <span>Goal completion</span>
              <strong>${progressPercent}%</strong>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:${progressPercent}%"></div></div>
          </div>
        </div>

        <div class="progress-footer">${completedTasks} / ${totalTasks} tasks complete</div>
      </section>
    </section>
  `;
}

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
    .slice(
      0,
      state.showAllActivity ? 20 : 5
    );

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

      <header class="dashboard-topbar">

        <button
          class="back-button"
          type="button"
          data-action="back-home"
        >
          ← Back
        </button>

        <div class="brand-panel">
          <div class="brand-icon">
            ${renderSahraLogo(52)}
          </div>

          <div class="brand-copy">
            <h1>Sahra</h1>
            <span>LIFE CALENDAR</span>
          </div>
        </div>

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

          <button
            class="panel-select"
            type="button"
            data-action="toggle-progress-picker"
          >
            ${currentMonthName}
            ${state.currentYear}
            <span>⌄</span>
          </button>

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

          <div class="focus-card">

            <div class="focus-row">

              <span class="focus-icon">
                ◎
              </span>

              <span>
                Stay<br>
                Consistent!
              </span>

            </div>

            <p>
              ${
                pendingTasks > 0
                  ? `${pendingTasks} task(s) still pending. Keep going!`
                  : totalTasks > 0
                    ? 'Everything is complete. Great job!'
                    : 'No tasks scheduled yet. Plan ahead!'
              }
            </p>

          </div>

        </div>

      </section>

      <!-- RECENT ACTIVITY -->

      <section class="glass-card activity-panel">

        <div class="panel-header">

          <h3>
            Recent Activity
          </h3>

          <button
            class="panel-link"
            type="button"
            data-action="toggle-all-activity"
          >
            ${
              state.showAllActivity
                ? 'Show less'
                : 'View all'
            }
            &gt;
          </button>

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

function renderLayout() {
  if (isRendering) return; // Prevent overlapping render cycles
  isRendering = true;
  const app = document.getElementById('app');

  if (state.view === 'calendar' && localStorage.getItem('sahraToken') && !state.calendarCache.has(state.selectedDate)) {
    loadSelectedDateData(state.selectedDate);
  }

  let content = renderHomePage();

  if (state.view === 'calendar') {
    content = renderCalendarPage(state);
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
  } else if (state.view === 'progress' || state.view === 'more') {
    content = renderProgressPage();
  }

  // Appends active modals over the main content
  app.innerHTML = content + renderEntryModal() + renderProfileModal();

  // Highlight active bottom navigation button
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === state.view);
  });

  document.querySelectorAll('[data-view]').forEach((button) => {
    if (!button.dataset.view) return;
    button.addEventListener('click', () => {
      if (['home', 'calendar', 'assistant', 'more', 'progress', 'tasks', 'habits', 'goals', 'mood'].includes(button.dataset.view)) {
        state.view = button.dataset.view;
        state.entryModalOpen = false;
        state.entryDraft = null;
        renderLayout();
      }
    });
  });

  // Month Picker toggle
  document.querySelectorAll('[data-action="toggle-progress-picker"]').forEach((button) => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); 
      state.progressPickerOpen = !state.progressPickerOpen;
      renderLayout();
    });
  });

  // Profile Modal close
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

  document.querySelectorAll('[data-create]').forEach((button) => {
    button.addEventListener('click', () => {
      const type = button.dataset.create;
      if (type) {
        openEntryModal(type);
      }
    });
  });

  document.querySelectorAll('[data-action="open-add-entry"]').forEach((button) => {
    button.addEventListener('click', () => {
      openEntryModal(button.dataset.type || 'event');
    });
  });

  document.querySelectorAll('[data-action="show-selected-day"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.view = 'calendar';
      renderLayout();
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
      try {
        await createResource('mood', {
          date: state.selectedDate,
          mood,
          energy: 80,
          note: '',
        });
      } catch (error) {
        window.alert(error.message || 'Unable to save mood');
      }
    });
  });

  document.querySelectorAll('[data-action="open-task-modal"]').forEach((button) => {
    button.addEventListener('click', () => {
      openEntryModal('task');
    });
  });

  document.querySelectorAll('.task-input-row').forEach((row) => {
    row.addEventListener('click', (event) => {
      const clicked = event.target;
      if (clicked instanceof HTMLElement && (clicked.closest('button') || clicked.closest('input'))) {
        openEntryModal('task');
      }
    });
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
    button.addEventListener('click', async () => {
      const taskId = button.dataset.taskId;
      if (!taskId || !window.confirm('Delete this task?')) return;
      try {
        await apiRequest(`/api/tasks/${taskId}`, { method: 'DELETE' });
        await loadDashboardData();
      } catch (error) {
        window.alert(error.message || 'Unable to delete task');
      }
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

  document.querySelectorAll('[data-action="close-entry-modal"]').forEach((button) => {
    button.addEventListener('click', () => {
      closeEntryModal();
    });
  });

  document.querySelectorAll('[data-action="save-entry"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const draft = state.entryDraft || {};
      const type = draft.type || 'event';
      const date = draft.date || state.selectedDate;

      try {
        if (type === 'event') {
          const title = (draft.title || '').trim();
          if (!title) {
            window.alert('Please enter an event title.');
            return;
          }
          if (isPastDate(date)) {
            window.alert('Events can only be added for today or future dates.');
            return;
          }
          await createResource('event', {
            title,
            description: draft.description || '',
            date,
            startTime: draft.startTime || '09:00',
            endTime: draft.endTime || '10:00',
            category: draft.category || 'General',
          });
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
              body: JSON.stringify(taskPayload),
            });
          } else {
            await createResource('task', taskPayload);
          }
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
        } else if (type === 'goal') {
          const title = (draft.title || '').trim();
          if (!title) {
            window.alert('Please enter a goal title.');
            return;
          }
          await createResource('goal', {
            title,
            description: draft.description || '',
            duration: draft.duration || '30 days',
            current: Number(draft.current || 0),
            target: Number(draft.target || 30),
            progress: Math.min(100, Math.round((Number(draft.current || 0) / Math.max(Number(draft.target || 30), 1)) * 100)),
            status: 'Active',
          });
        } else if (type === 'mood') {
          const mood = draft.mood || '😊';
          await createResource('mood', {
            date,
            mood,
            energy: 80,
            note: draft.note || '',
          });
        }

        closeEntryModal();
      } catch (error) {
        window.alert(error.message || 'Unable to save item');
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

  document.querySelectorAll('[data-entry-value]').forEach((button) => {
    button.addEventListener('click', () => {
      const value = button.dataset.entryValue;
      state.entryDraft = {
        ...(state.entryDraft || {}),
        mood: value,
      };
      document.querySelectorAll('[data-entry-value]').forEach((item) => item.classList.toggle('selected', item.dataset.entryValue === value));
    });
  });

  document.querySelectorAll('.mood-pill').forEach((button) => {
    button.addEventListener('click', async () => {
      const mood = button.textContent.trim();
      if (!mood) return;

      try {
        await createResource('mood', {
          date: state.selectedDate,
          mood,
          energy: 80,
          note: '',
        });
      } catch (error) {
        window.alert(error.message || 'Unable to save mood');
      }
    });
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
      state.menuOpen = false;

      if (action === 'light-theme') {
        applyTheme('light');
        await updateThemeInDatabase('light');
        return;
      }

      if (action === 'dark-theme') {
        applyTheme('dark');
        await updateThemeInDatabase('dark');
        return;
      }

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

      if (action === 'logout') {
        localStorage.removeItem('sahraToken');
        localStorage.removeItem('sahraUser');
        state.user = { name: 'Sahra' };
        state.view = 'home';
        window.location.href = '/login';
      }
    });
  });

  document.querySelectorAll('[data-action="back-home"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.profileModalOpen = false;
      state.profileDraft = null;
      closeEntryModal();
      goBackFromView();
    });
  });

  document.querySelectorAll('[data-action="profile-save"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const draft = state.profileDraft || {};
      const payload = {
        name: draft.name,
        email: draft.email,
      };

      try {
        const response = await apiRequest('/api/profile', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });

        state.user = response.user || state.user;
        localStorage.setItem('sahraUser', JSON.stringify(state.user));
        state.profileModalOpen = false;
        state.profileDraft = null;
        if (response.user?.preferences?.theme) {
          applyTheme(response.user.preferences.theme);
        }
        renderLayout();
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

  document.querySelectorAll('[data-action="clear-assistant-chat"]').forEach((button) => {
    button.addEventListener('click', () => {
      state.assistantMessages = [{
        role: 'assistant',
        text: "I'm Sahra, your AI assistant. I can help you manage tasks, events, and your progress.",
      }];
      state.assistantLoading = false;
      renderLayout();
    });
  });

  document.querySelectorAll('.composer-send').forEach((button) => {
    button.addEventListener('click', async () => {
      const input = document.querySelector('.assistant-input');
      const message = input?.value?.trim();
      if (!message || state.assistantLoading) return;

      state.assistantMessages.push({ role: 'user', text: message });
      state.assistantLoading = true;
      if (input) input.value = '';
      renderLayout();

      try {
        const response = await apiRequest('/api/assistant/chat', {
          method: 'POST',
          body: JSON.stringify({ message }),
        });

        state.assistantMessages.push({ role: 'assistant', text: response.message || 'Sahra is temporarily unavailable. Please try again.' });

        if (response.action === 'createTask' || response.action === 'createEvent') {
          await loadDashboardData();
        }
      } catch (error) {
        state.assistantMessages.push({ role: 'assistant', text: 'Sahra is temporarily unavailable. Please try again.' });
      } finally {
        state.assistantLoading = false;
        renderLayout();
      }
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

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const input = document.querySelector('.assistant-input');
        if (input) input.value = transcript;
      };
      recognition.start();
    });
  });
  setTimeout(() => {
    isRendering = false;
  }, 50);
}
function bindBottomNav() {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', async () => {
      const view = button.dataset.view;
      if (!view) return;

      // Close open modals when switching tabs
      state.entryModalOpen = false;
      state.entryDraft = null;
      state.progressPickerOpen = false;
      state.profileModalOpen = false; 

      state.view = view;
      renderLayout();

      if (view === 'progress') {
        await loadProgressData(true);
      }
    });
  });
}

let globalListenersBound = false;
function bindGlobalListeners() {
  if (globalListenersBound) return;
  globalListenersBound = true;

  document.addEventListener('click', (event) => {
    const clickedMonthPicker = event.target.closest('.month-picker-wrapper');
    const clickedMenu = event.target.closest('.menu-wrap');

    let needsRender = false;
    
    if (!clickedMenu && state.menuOpen) {
      state.menuOpen = false;
      needsRender = true;
    }

    if (state.progressPickerOpen && !clickedMonthPicker) {
      state.progressPickerOpen = false;
      needsRender = true;
    }

    if (needsRender) {
      renderLayout();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      let changed = false;
      if (state.progressPickerOpen) {
        state.progressPickerOpen = false;
        changed = true;
      }
      if (state.menuOpen) {
        state.menuOpen = false;
        changed = true;
      }
      if (changed) renderLayout();
    }
  });
}

applyTheme(getStoredTheme());
bindBottomNav();
bindGlobalListeners();

if (!localStorage.getItem('sahraToken')) {
  window.location.href = '/login';
} else {
  loadDashboardData();
  renderLayout();
}