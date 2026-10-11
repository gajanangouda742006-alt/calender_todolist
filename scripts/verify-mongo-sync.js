/*
 * End-to-end verification against a REAL running Sahra API + MongoDB.
 * Required environment variables: SAHRA_TEST_API_URL, SAHRA_TEST_EMAIL,
 * SAHRA_TEST_PASSWORD. Use a test account, never production user data.
 */
const assert = require('node:assert/strict');

const baseUrl = String(process.env.SAHRA_TEST_API_URL || '').replace(/\/+$/, '');
const email = process.env.SAHRA_TEST_EMAIL;
const password = process.env.SAHRA_TEST_PASSWORD;
if (!baseUrl || !email || !password) {
  console.error('Set SAHRA_TEST_API_URL, SAHRA_TEST_EMAIL and SAHRA_TEST_PASSWORD before running this test.');
  process.exit(2);
}

async function request(path, { token, method = 'GET', body, key } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(key ? { 'Idempotency-Key': key } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`${method} ${path} failed (${response.status}): ${data.message || 'no message'}`);
  return data;
}

(async () => {
  const health = await request('/api/health');
  assert.equal(health.status, 'ok', 'API health must be ok');
  assert.equal(health.database?.mongo, 'connected', 'MongoDB must be connected');

  const login = await request('/api/auth/login', { method: 'POST', body: { email, password } });
  assert.ok(login.token, 'Login must return an access token');
  const token = login.token;
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const tomorrow = new Date(Date.now() + 86400000);
  const date = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
  const key = `sahra-e2e-task-${suffix}`;
  let taskId;

  try {
    const body = { title: `SYNC TEST ${suffix}`, description: 'Temporary automated sync verification record', date, time: null, priority: 'Normal', status: 'Pending', completed: false, category: 'General' };
    const created1 = await request('/api/tasks', { token, method: 'POST', body, key });
    const created2 = await request('/api/tasks', { token, method: 'POST', body, key });
    taskId = String(created1.task?.id || created1.task?._id || '');
    assert.ok(taskId, 'Task create must return an ID');
    assert.equal(String(created2.task?.id || created2.task?._id || ''), taskId, 'Same idempotency key must return the same task, not create a duplicate');

    const dashboard1 = await request('/api/dashboard', { token });
    assert.ok((dashboard1.data?.tasks || []).some((row) => String(row.id || row._id) === taskId), 'Created task must appear in dashboard model');

    const updated = await request(`/api/tasks/${taskId}`, { token, method: 'PUT', body: { ...body, title: `SYNC TEST UPDATED ${suffix}` }, key: `sahra-e2e-update-${suffix}` });
    assert.equal(updated.task?.title, `SYNC TEST UPDATED ${suffix}`, 'Task update must be reflected in Mongo-backed model');

    await request(`/api/tasks/${taskId}`, { token, method: 'DELETE', key: `sahra-e2e-delete-${suffix}` });
    const dashboard2 = await request('/api/dashboard', { token });
    assert.ok(!(dashboard2.data?.tasks || []).some((row) => String(row.id || row._id) === taskId), 'Deleted task must be absent from dashboard model');
    taskId = null;
    console.log('PASS: MongoDB health, login, idempotent create, dashboard mapping, edit, and delete.');
  } finally {
    if (taskId) {
      try { await request(`/api/tasks/${taskId}`, { token, method: 'DELETE', key: `sahra-e2e-cleanup-${suffix}` }); }
      catch (error) { console.error('WARNING: cleanup failed; remove temporary task manually:', error.message); }
    }
  }
})().catch((error) => {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
});
