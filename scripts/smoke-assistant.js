/*
 * Isolated assistant action workflow. Start `npm start` first, then run:
 *   node scripts/smoke-assistant.js
 *
 * Uses temporary database records and removes them in a finally block.
 */
require('dotenv').config();

const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const crypto = require('node:crypto');
const { connectMongo, mongoose } = require('../backend/config/mongo');
const { User, Task, Event, Asset, Transaction } = require('../backend/models');

const apiBase = (process.env.SAHRA_SMOKE_API_URL || 'http://localhost:9500').replace(/\/$/, '');
const tag = `assistant-smoke-${crypto.randomUUID()}`;
const userIds = [];

function assertTest(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(path, { token, method = 'GET', body } = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { response, payload: await response.json().catch(() => ({})) };
}

function tomorrowKey(timeZone) {
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const tomorrow = new Date(`${today}T00:00:00.000Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

async function chat(token, message, requestId = crypto.randomUUID()) {
  const result = await request('/api/assistant/chat', {
    token,
    method: 'POST',
    body: { message, requestId },
  });
  assertTest(result.response.status === 200, `Assistant request failed (${result.response.status}): ${result.payload.message || 'no message'}`);
  return { ...result.payload, requestId };
}

async function main() {
  assertTest(await connectMongo(), 'MongoDB is unavailable.');

  try {
    const passwordHash = await bcrypt.hash('AssistantSmoke123!', 10);
    const owner = await User.create({
      name: 'Assistant Smoke Owner',
      email: `${tag}-owner@example.invalid`,
      passwordHash,
      emailVerified: true,
      preferences: { timeZone: 'Asia/Kolkata' },
    });
    const other = await User.create({
      name: 'Assistant Smoke Other',
      email: `${tag}-other@example.invalid`,
      passwordHash,
      emailVerified: true,
      preferences: { timeZone: 'Asia/Kolkata' },
    });
    userIds.push(owner._id, other._id);

    const ownerLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: owner.email, password: 'AssistantSmoke123!' },
    });
    const otherLogin = await request('/api/auth/login', {
      method: 'POST',
      body: { email: other.email, password: 'AssistantSmoke123!' },
    });
    assertTest(ownerLogin.response.status === 200 && ownerLogin.payload.token, 'Could not authenticate assistant test owner.');
    assertTest(otherLogin.response.status === 200 && otherLogin.payload.token, 'Could not authenticate second test user.');

    const taskRequestId = crypto.randomUUID();
    const taskResult = await chat(ownerLogin.payload.token, 'Add a task to finish my assignment.', taskRequestId);
    assertTest(taskResult.action === 'createdTask' && /finish my assignment/i.test(taskResult.message), 'Explicit task request did not complete automatically.');
    const task = await Task.findOne({ userId: owner._id, assistantRequestId: taskRequestId });
    assertTest(task?.title === 'finish my assignment', 'Created task data was not persisted correctly.');

    const priorityRequestId = crypto.randomUUID();
    await chat(ownerLogin.payload.token, 'Add a high-priority task to submit my project by Friday.', priorityRequestId);
    const priorityTask = await Task.findOne({ userId: owner._id, assistantRequestId: priorityRequestId });
    assertTest(priorityTask?.title === 'submit my project' && priorityTask.priority === 'High', 'Task priority or natural-language due date was not parsed correctly.');

    const tomorrow = tomorrowKey('Asia/Kolkata');
    const eventRequestId = crypto.randomUUID();
    const eventResult = await chat(ownerLogin.payload.token, 'Schedule a meeting tomorrow at 3 PM.', eventRequestId);
    const event = await Event.findOne({ userId: owner._id, assistantRequestId: eventRequestId });
    assertTest(eventResult.action === 'createdEvent' && event?.date === tomorrow && event.startTime === '15:00' && event.endTime === '16:00', 'Explicit event was not saved at the requested local time.');

    const rangedEventRequestId = crypto.randomUUID();
    await chat(ownerLogin.payload.token, 'Create an appointment on October 15 from 10 to 11 AM.', rangedEventRequestId);
    const rangedEvent = await Event.findOne({ userId: owner._id, assistantRequestId: rangedEventRequestId });
    assertTest(rangedEvent?.date === '2026-10-15' && rangedEvent.startTime === '10:00' && rangedEvent.endTime === '11:00', 'Explicit event date/time range was not parsed correctly.');

    const noteRequestId = crypto.randomUUID();
    const noteResult = await chat(ownerLogin.payload.token, 'Save this note: Remember to review my project.', noteRequestId);
    const note = await Asset.findOne({ userId: owner._id, assistantRequestId: noteRequestId });
    assertTest(noteResult.action === 'createdNote' && note?.content === 'Remember to review my project.', 'Note was not persisted.');

    const expenseRequestId = crypto.randomUUID();
    const expenseResult = await chat(ownerLogin.payload.token, 'Add ₹500 as a food expense.', expenseRequestId);
    const expense = await Transaction.findOne({ userId: owner._id, assistantRequestId: expenseRequestId });
    assertTest(
      expenseResult.action === 'createdTransaction' && expense?.type === 'expense' && expense.amount === 500 && expense.category === 'Food',
      `Food expense was not persisted correctly (response=${JSON.stringify(expenseResult)}, record=${JSON.stringify(expense?.toObject() || null)}).`
    );

    const incomeRequestId = crypto.randomUUID();
    const incomeResult = await chat(ownerLogin.payload.token, 'Add ₹2,000 as salary income.', incomeRequestId);
    const income = await Transaction.findOne({ userId: owner._id, assistantRequestId: incomeRequestId });
    assertTest(
      incomeResult.action === 'createdTransaction' && income?.type === 'income' && income.amount === 2000 && income.category === 'Salary',
      `Salary income was not persisted correctly (response=${JSON.stringify(incomeResult)}, record=${JSON.stringify(income?.toObject() || null)}).`
    );
    const financeSummary = await request('/api/transactions', { token: ownerLogin.payload.token });
    const recordedTotal = financeSummary.payload
      .filter((item) => [expense._id.toString(), income._id.toString()].includes(item.id))
      .reduce((sum, item) => sum + Number(item.amount), 0);
    assertTest(recordedTotal === 2500, 'Saved finance data did not match the transaction records.');

    const retryTaskRequest = { message: 'Add a task to finish my assignment.', requestId: taskRequestId };
    const retryTask = await request('/api/assistant/chat', { token: ownerLogin.payload.token, method: 'POST', body: retryTaskRequest });
    assertTest(retryTask.response.status === 200, 'Retry did not return a successful idempotent result.');
    assertTest(await Task.countDocuments({ userId: owner._id, assistantRequestId: taskRequestId }) === 1, 'Retry created a duplicate task.');

    const missingTask = await chat(ownerLogin.payload.token, 'Add a task');
    assertTest(/what should i name/i.test(missingTask.message), 'Missing task title did not ask only for the missing detail.');
    const missingNote = await chat(ownerLogin.payload.token, 'Write a note called Project Ideas');
    assertTest(/what should i write/i.test(missingNote.message), 'Missing note content did not ask for that content.');
    assertTest(!(await Asset.exists({ userId: owner._id, title: 'Project Ideas' })), 'A note without content was unexpectedly created.');

    const ambiguousEvent = await chat(ownerLogin.payload.token, 'Schedule a meeting tomorrow');
    assertTest(/start time/i.test(ambiguousEvent.message), 'Ambiguous event did not ask for its missing time.');
    assertTest(!(await Event.exists({ userId: owner._id, title: 'meeting', date: tomorrow, startTime: null })), 'An ambiguous event was unexpectedly created.');

    const conflict = await Event.create({
      userId: owner._id,
      title: `${tag} busy`,
      date: tomorrow,
      startTime: '15:00',
      endTime: '16:00',
    });
    const eventCountBeforeConflict = await Event.countDocuments({ userId: owner._id });
    const conflictResult = await chat(ownerLogin.payload.token, 'Schedule a meeting tomorrow at 3 PM.');
    assertTest(/conflicts with/i.test(conflictResult.message) && /16:00–17:00/.test(conflictResult.message), 'Event conflict or free alternative was not surfaced.');
    assertTest(await Event.countDocuments({ userId: owner._id }) === eventCountBeforeConflict, 'Conflicting event was incorrectly created.');

    const casualCount = await Task.countDocuments({ userId: owner._id });
    const casualResult = await chat(ownerLogin.payload.token, 'I should study tonight.');
    assertTest(casualResult.action === 'respond' && await Task.countDocuments({ userId: owner._id }) === casualCount, 'A casual statement incorrectly created a task.');
    const casualExpense = await chat(ownerLogin.payload.token, 'Maybe I should record this expense.');
    assertTest(casualExpense.action === 'respond' && !(await Transaction.exists({ userId: owner._id, note: /Maybe/ })), 'A tentative expense statement was recorded.');

    const missingAmount = await chat(ownerLogin.payload.token, 'Add an expense for food.');
    assertTest(/amount in INR/i.test(missingAmount.message), 'Missing transaction amount did not trigger a clarification.');
    const missingType = await chat(ownerLogin.payload.token, 'Record ₹50 for hobby.');
    assertTest(/income or as an expense/i.test(missingType.message), 'Ambiguous transaction type did not trigger a clarification.');

    const foreignTask = await Task.create({
      userId: other._id,
      title: `${tag} private task`,
      date: tomorrow,
    });
    const forbidden = await request(`/api/tasks/${foreignTask._id}`, { token: ownerLogin.payload.token });
    assertTest(forbidden.response.status === 404, 'Another user could access a private task.');
    const ownerTaskList = await chat(ownerLogin.payload.token, 'Show my tasks.');
    assertTest(!ownerTaskList.message.includes(`${tag} private task`), 'Assistant exposed another user’s task.');

    const beforeDelete = await Task.countDocuments({ userId: owner._id, _id: task._id });
    const deletion = await chat(ownerLogin.payload.token, `Delete task ${task.title}.`);
    assertTest(deletion.action === 'requiresConfirmation' && deletion.confirmationToken, 'Deletion request did not retain a safety confirmation boundary.');
    assertTest(await Task.countDocuments({ userId: owner._id, _id: task._id }) === beforeDelete, 'Deletion request removed a record before confirmation.');
    const confirmedDeletion = await request('/api/assistant/execute', {
      token: ownerLogin.payload.token,
      method: 'POST',
      body: { confirmationToken: deletion.confirmationToken },
    });
    assertTest(confirmedDeletion.response.status === 200 && confirmedDeletion.payload.action === 'deleteTask', 'Confirmed deletion did not execute.');
    assertTest(await Task.countDocuments({ userId: owner._id, _id: task._id }) === 0, 'Confirmed deletion did not remove the selected owned task.');

    const invalidRequest = await request('/api/assistant/chat', {
      token: ownerLogin.payload.token,
      method: 'POST',
      body: { message: 'Add a task to fail safely.', requestId: 'invalid' },
    });
    assertTest(invalidRequest.response.status === 400 && !invalidRequest.payload.action, 'Invalid request was reported as a successful action.');

    console.log('Assistant auto-action smoke checks passed for task, event, note, expense, income, idempotent retry, clarification, conflict, casual intent, ownership, deletion safety, and truthful failure responses.');
  } finally {
    if (userIds.length) {
      const userQuery = { userId: { $in: userIds } };
      await Promise.all([
        Task.deleteMany(userQuery),
        Event.deleteMany(userQuery),
        Asset.deleteMany(userQuery),
        Transaction.deleteMany(userQuery),
        User.deleteMany({ _id: { $in: userIds } }),
      ]);
    }
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(`Assistant smoke workflow failed: ${error.message}`);
  process.exitCode = 1;
});
