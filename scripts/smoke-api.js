/*
 * Isolated API smoke test. Start `npm start` first, then run:
 *   node scripts/smoke-api.js
 *
 * It creates two uniquely named test users, exercises the authenticated API,
 * and removes all records associated with them in a finally block.
 */
require('dotenv').config();

const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { connectMongo, mongoose } = require('../backend/config/mongo');
const {
  User,
  Event,
  Task,
  Mood,
  Habit,
  HabitLog,
  Goal,
  Reminder,
  Note,
  Asset,
  Transaction,
  AssistantActionReceipt,
} = require('../backend/models');

const apiBase = (process.env.SAHRA_SMOKE_API_URL || 'http://localhost:9500').replace(/\/$/, '');
const tag = `smoke-${crypto.randomUUID()}`;
const testIds = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

async function cleanup() {
  if (!testIds.length) return;
  const query = { userId: { $in: testIds } };
  await Promise.all([
    Event.deleteMany(query), Task.deleteMany(query), Mood.deleteMany(query),
    Habit.deleteMany(query), HabitLog.deleteMany(query), Goal.deleteMany(query),
    Reminder.deleteMany(query), Note.deleteMany(query), Asset.deleteMany(query),
    Transaction.deleteMany(query), AssistantActionReceipt.deleteMany(query),
  ]);
  await User.deleteMany({ _id: { $in: testIds } });
}

async function main() {
  const connected = await connectMongo();
  assert(connected, 'MongoDB is unavailable.');

  try {
    const passwordHash = await bcrypt.hash('SmokePassword123!', 10);
    const primary = await User.create({
      name: 'Sahra Smoke Primary',
      email: `${tag}-primary@example.invalid`,
      passwordHash,
      emailVerified: true,
      preferences: { theme: 'dark' },
    });
    const secondary = await User.create({
      name: 'Sahra Smoke Secondary',
      email: `${tag}-secondary@example.invalid`,
      passwordHash,
      emailVerified: true,
      preferences: { theme: 'dark' },
    });
    testIds.push(primary._id, secondary._id);

    const primaryLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: primary.email, password: 'SmokePassword123!' },
    });
    assert(primaryLogin.response.status === 200 && primaryLogin.payload.token, 'Primary login failed.');
    const secondaryLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: secondary.email, password: 'SmokePassword123!' },
    });
    assert(secondaryLogin.response.status === 200 && secondaryLogin.payload.token, 'Secondary login failed.');

    const eventPayload = {
      title: `Planning ${tag}`,
      date: '2099-01-15',
      startTime: '10:00',
      endTime: '11:00',
      category: 'General',
      reminder: '15 minutes before',
    };
    const createdEvent = await request('/api/events', { token: primaryLogin.payload.token, method: 'POST', body: eventPayload });
    assert(createdEvent.response.status === 201, 'Event creation failed.');
    const overlappingEvent = await request('/api/events', {
      token: primaryLogin.payload.token,
      method: 'POST',
      body: { ...eventPayload, title: `Overlap ${tag}`, startTime: '10:30', endTime: '11:30' },
    });
    assert(overlappingEvent.response.status === 409, 'Event conflict was not rejected.');

    const createdTask = await request('/api/tasks', {
      token: primaryLogin.payload.token,
      method: 'POST',
      body: { title: `Task ${tag}`, date: '2099-01-16', time: '09:00', priority: 'High', reminder: '10 minutes before' },
    });
    assert(createdTask.response.status === 201 && createdTask.payload.task?.id, 'Task creation failed.');
    const completedTask = await request(`/api/tasks/${createdTask.payload.task.id}`, {
      token: primaryLogin.payload.token,
      method: 'PUT',
      body: { title: `Task ${tag}`, date: '2099-01-16', time: '09:00', priority: 'High', status: 'Completed', completed: true, reminder: '10 minutes before' },
    });
    assert(completedTask.response.status === 200 && completedTask.payload.task.completed, 'Task completion did not persist.');

    const forbiddenTask = await request(`/api/tasks/${createdTask.payload.task.id}`, { token: secondaryLogin.payload.token });
    assert(forbiddenTask.response.status === 404, 'A second user could access the first user’s task.');

    const finance = await request('/api/transactions', {
      token: primaryLogin.payload.token,
      method: 'POST',
      body: { type: 'income', amount: 1200, category: 'Smoke', paymentMethod: 'UPI', date: '2099-01-16', note: tag },
    });
    assert(finance.response.status === 201, 'Finance transaction creation failed.');

    const assistantProposal = await request('/api/assistant/chat', {
      token: primaryLogin.payload.token,
      method: 'POST',
      body: { message: `Add task ${tag} tomorrow` },
    });
    assert(
      assistantProposal.response.status === 200 && assistantProposal.payload.confirmationToken,
      `Assistant did not return a confirmation token (HTTP ${assistantProposal.response.status}: ${assistantProposal.payload.message || 'no message'}).`
    );
    const assistantExecution = await request('/api/assistant/execute', {
      token: primaryLogin.payload.token,
      method: 'POST',
      body: { confirmationToken: assistantProposal.payload.confirmationToken },
    });
    assert(assistantExecution.response.status === 201, 'Confirmed assistant task creation failed.');
    const replay = await request('/api/assistant/execute', {
      token: primaryLogin.payload.token,
      method: 'POST',
      body: { confirmationToken: assistantProposal.payload.confirmationToken },
    });
    assert(replay.response.status === 409, 'Assistant confirmation token was replayable.');

    const dashboard = await request('/api/dashboard', { token: primaryLogin.payload.token });
    assert(
      dashboard.response.status === 200 &&
      dashboard.payload.data.events.some((item) => item.id === createdEvent.payload.event.id) &&
      dashboard.payload.data.tasks.some((item) => item.id === createdTask.payload.task.id),
      'Dashboard did not return persisted records.'
    );

    console.log('API smoke workflow passed.');
  } finally {
    // Cleanup runs in the outer finalizer so failures and successes share one
    // connected teardown path.
  }
}

main().catch((error) => {
  console.error(`API smoke workflow failed: ${error.message}`);
  process.exitCode = 1;
}).finally(async () => {
  try {
    await cleanup();
    await mongoose.disconnect();
  } catch (error) {
    console.error(`API smoke cleanup failed: ${error.message}`);
    process.exitCode = 1;
  }
});
