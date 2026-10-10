import { LocalNotifications } from '@capacitor/local-notifications';

const STORAGE_KEY = 'sahraNativeNotificationIds';

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

async function permissionStatus() {
  if (!isNative()) return { display: 'unsupported' };
  return LocalNotifications.checkPermissions();
}

async function requestPermission() {
  if (!isNative()) return { display: 'unsupported' };
  const before = await permissionStatus();
  if (before.display === 'granted') return before;
  return LocalNotifications.requestPermissions();
}

async function reconcile(notifications, { requestPermission: shouldRequestPermission = false } = {}) {
  if (!isNative()) return { native: false, scheduled: 0, permission: 'unsupported' };

  let permission = await permissionStatus();
  if (permission.display !== 'granted' && shouldRequestPermission) {
    permission = await requestPermission();
  }
  if (permission.display !== 'granted') {
    return { native: true, scheduled: 0, permission: permission.display || 'denied' };
  }

  const next = notifications.filter((notification) => notification?.id && notification?.schedule?.at instanceof Date);
  const previousIds = savedIds();
  if (previousIds.length) {
    await LocalNotifications.cancel({ notifications: previousIds.map((id) => ({ id })) });
  }
  if (next.length) {
    await LocalNotifications.schedule({ notifications: next });
  }
  saveIds(next.map((notification) => notification.id));
  return { native: true, scheduled: next.length, permission: 'granted' };
}

async function cancelAllSahraNotifications() {
  if (!isNative()) return;
  const ids = savedIds();
  if (ids.length) await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) });
  saveIds([]);
}

async function configureNotificationTapHandling() {
  if (!isNative()) return;
  if (window.Capacitor.getPlatform() === 'android') {
    await LocalNotifications.createChannel({
      id: 'sahra-reminders',
      name: 'Sahra reminders',
      description: 'Calendar and task reminders from Sahra Life Calendar',
      importance: 4,
      visibility: 1,
      sound: 'default',
      vibration: true,
    });
  }
  await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
    const extra = action?.notification?.extra || {};
    if (!/^\d{4}-\d{2}-\d{2}$/.test(extra.date || '')) return;
    const prefix = window.location.pathname.endsWith('/index.html') ? '/index.html' : '/index.html';
    window.location.href = `${prefix}?date=${encodeURIComponent(extra.date)}&resource=${encodeURIComponent(extra.resource || '')}&id=${encodeURIComponent(extra.id || '')}`;
  });
}

window.SAHRA_NOTIFICATIONS = {
  isNative,
  permissionStatus,
  requestPermission,
  reconcile,
  cancelAllSahraNotifications,
};

void configureNotificationTapHandling().catch((error) => {
  console.error('Native notification setup failed:', error.message);
});
