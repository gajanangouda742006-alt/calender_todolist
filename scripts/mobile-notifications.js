import { LocalNotifications } from '@capacitor/local-notifications';

const STORAGE_KEY = 'sahraNativeNotificationIds';
const SIGNATURE_KEY = 'daysyncNativeNotificationSignature';
const PERMISSION_KEY = 'daysyncNotificationPermission';
const pendingFocusActionKey = 'daysyncPendingFocusAlarmAction';
let cachedPermission = localStorage.getItem(PERMISSION_KEY) || 'unknown';
let listenerSetup = false;
let nativeSetupPromise = Promise.resolve();

function isNative() {
  return Boolean(window.Capacitor?.isNativePlatform?.());
}

function savedIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(Number.isInteger) : [];
  } catch {
    return [];
  }
}

function saveIds(ids) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(ids)]));
}

function normalizedPermission(permission) {
  if (permission?.display) return permission.display;
  return 'unknown';
}

async function permissionStatus() {
  if (!isNative()) return { display: 'unsupported' };
  try {
    const permission = await LocalNotifications.checkPermissions();
    cachedPermission = normalizedPermission(permission);
    localStorage.setItem(PERMISSION_KEY, cachedPermission);
    window.dispatchEvent(new CustomEvent('daysync:permissions-updated'));
    return permission;
  } catch (error) {
    console.warn('Could not check notification permission:', error);
    return { display: cachedPermission };
  }
}

async function requestPermission() {
  if (!isNative()) return { display: 'unsupported' };
  const before = await permissionStatus();
  if (before.display === 'granted') return before;
  try {
    const result = await LocalNotifications.requestPermissions();
    cachedPermission = normalizedPermission(result);
    localStorage.setItem(PERMISSION_KEY, cachedPermission);
    window.dispatchEvent(new CustomEvent('daysync:permissions-updated'));
    return result;
  } catch (error) {
    console.warn('Notification permission request failed:', error);
    cachedPermission = 'denied';
    localStorage.setItem(PERMISSION_KEY, cachedPermission);
    return { display: cachedPermission };
  }
}

function notificationSignature(notifications) {
  return JSON.stringify(notifications.map((notification) => ({
    id: notification.id,
    title: notification.title,
    body: notification.body,
    at: notification.schedule?.at instanceof Date ? notification.schedule.at.getTime() : null,
    channelId: notification.channelId || '',
    sound: notification.sound || '',
    extra: notification.extra || {},
  })).sort((a, b) => a.id - b.id));
}

async function reconcile(notifications, { requestPermission: shouldRequestPermission = false } = {}) {
  if (!isNative()) return { native: false, scheduled: 0, permission: 'unsupported' };
  await nativeSetupPromise;

  let permission = await permissionStatus();
  if (permission.display !== 'granted' && shouldRequestPermission) {
    permission = await requestPermission();
  }
  if (permission.display !== 'granted') {
    return { native: true, scheduled: 0, permission: permission.display || 'denied' };
  }

  const next = (Array.isArray(notifications) ? notifications : []).filter((notification) =>
    Number.isInteger(notification?.id) && notification?.schedule?.at instanceof Date &&
    Number.isFinite(notification.schedule.at.getTime()) && notification.schedule.at.getTime() > Date.now()
  );
  const signature = notificationSignature(next);
  const previousSignature = localStorage.getItem(SIGNATURE_KEY) || '';
  const previousIds = savedIds();

  // Reconciliation may run repeatedly while the app is open. Do not cancel and recreate
  // identical reminders every time; that can reset notification delivery on Android.
  if (signature === previousSignature) {
    return { native: true, scheduled: next.length, permission: 'granted', unchanged: true };
  }

  if (previousIds.length) {
    try { await LocalNotifications.cancel({ notifications: previousIds.map((id) => ({ id })) }); }
    catch (error) { console.warn('Could not cancel old reminders:', error.message); }
  }
  if (next.length) await LocalNotifications.schedule({ notifications: next });
  saveIds(next.map((notification) => notification.id));
  localStorage.setItem(SIGNATURE_KEY, signature);
  return { native: true, scheduled: next.length, permission: 'granted' };
}

async function cancelAllSahraNotifications() {
  if (!isNative()) return;
  const ids = savedIds();
  if (ids.length) await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
  saveIds([]);
  localStorage.removeItem(SIGNATURE_KEY);
}

function processFocusActionWhenReady(action) {
  if (!action || !['stop', 'reset'].includes(action.actionId)) return;
  // On a cold launch the module can receive the native action before app.js restores
  // timer state. Persist the action, then let app.js apply it after restoration.
  if (!window.SAHRA_FOCUS_TIMER_READY || typeof window.SAHRA_HANDLE_FOCUS_ALARM_ACTION !== 'function') {
    try { localStorage.setItem(pendingFocusActionKey, JSON.stringify(action)); } catch (_) {}
    return;
  }
  window.SAHRA_HANDLE_FOCUS_ALARM_ACTION(action);
}

async function configureNotificationTapHandling() {
  if (!isNative() || listenerSetup) return;
  listenerSetup = true;
  try {
    await LocalNotifications.registerActionTypes({
      types: [{
        id: 'daysync-focus-alarm',
        actions: [
          { id: 'stop', title: 'Stop', destructive: true, foreground: true },
          { id: 'reset', title: 'Reset', foreground: true },
        ],
      }],
    });
  } catch (error) {
    console.warn('Focus Timer notification actions could not be registered:', error.message);
  }

  if (window.Capacitor.getPlatform() === 'android') {
    try {
      await LocalNotifications.createChannel({
        id: 'daysync-reminders',
        name: 'DaySync reminders',
        description: 'Task and calendar reminders from DaySync',
        importance: 4,
        visibility: 1,
        sound: 'default',
        vibration: true,
      });
    } catch (error) { console.warn('Could not create DaySync reminders channel:', error.message); }
    try {
      await LocalNotifications.createChannel({
        id: 'daysync-focus-alarm',
        name: 'DaySync Focus Timer',
        description: 'Focus session completion alarm',
        importance: 5,
        visibility: 1,
        sound: 'daysync_alarm.wav',
        vibration: true,
        lights: true,
      });
    } catch (error) { console.warn('Could not create Focus Timer alarm channel:', error.message); }
  }

  await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    const notification = action?.notification || {};
    const extra = notification.extra || {};
    const actionId = String(action?.actionId || 'tap').toLowerCase();
    if (extra.type === 'focus-alarm') {
      const focusAction = ['stop', 'reset'].includes(actionId) ? actionId : 'reset';
      processFocusActionWhenReady({ actionId: focusAction, sessionId: String(extra.sessionId || '') });
      void LocalNotifications.cancel({ notifications: [{ id: notification.id }] }).catch(() => {});
      void LocalNotifications.removeDeliveredNotifications({ notifications: [{ id: notification.id }] }).catch(() => {});
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(extra.date || '')) return;
    const prefix = '/index.html';
    window.location.href = `${prefix}?date=${encodeURIComponent(extra.date)}&resource=${encodeURIComponent(extra.resource || '')}&id=${encodeURIComponent(extra.id || '')}`;
  });
}

window.SAHRA_NOTIFICATIONS = {
  isNative,
  permissionStatus,
  requestPermission,
  reconcile,
  cancelAllSahraNotifications,
  getCachedPermission: () => cachedPermission,
  get ready() { return nativeSetupPromise; },
};

nativeSetupPromise = configureNotificationTapHandling().catch((error) => {
  console.error('Native notification setup failed:', error.message);
});

// Permission toggles can change in Android Settings while DaySync is backgrounded.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && isNative()) void permissionStatus();
});
