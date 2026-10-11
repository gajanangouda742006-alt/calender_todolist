import test from 'node:test';
import assert from 'node:assert/strict';
import { OfflineSync, parseTokenAccount, resourceFor } from '../scripts/offline-sync.js';

class MemoryStore {
  constructor() { this.rows = new Map(); }
  accountCollection(account, collection) { return `acct_${String(account).replace(/[^A-Za-z0-9_-]/g, '_')}__${collection}`; }
  async getCollection(collection) { return [...(this.rows.get(collection)?.values() || [])].map((r) => ({ ...r })); }
  async saveRecord(collection, record) {
    const row = { ...record, id: String(record.id ?? record._id ?? `row-${Math.random()}`) };
    if (!this.rows.has(collection)) this.rows.set(collection, new Map());
    this.rows.get(collection).set(row.id, row);
    return row;
  }
  async deleteRecord(collection, id) { this.rows.get(collection)?.delete(String(id)); }
}

function tokenFor(id = 'user-123') {
  const payload = Buffer.from(JSON.stringify({ id, exp: 9999999999 })).toString('base64url');
  return `header.${payload}.signature`;
}

test('extracts account ID and maps app endpoints to existing domain collections', () => {
  assert.equal(parseTokenAccount(tokenFor()), 'user-123');
  assert.equal(resourceFor('/api/tasks/abc', {}).collection, 'tasks');
  assert.equal(resourceFor('/api/transactions', {}).collection, 'transactions');
  assert.equal(resourceFor('/api/unknown', {}), null);
});

test('offline create is cached and then replayed to the existing task API', async () => {
  const storage = new MemoryStore();
  const requests = [];
  const sync = new OfflineSync({
    storage,
    getToken: async () => tokenFor(),
    baseUrl: () => 'https://api.test',
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return new Response(JSON.stringify({ task: { id: 'mongo-task-1', title: 'Offline task', date: '2099-01-01' } }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    },
  });
  const queued = await sync.enqueueAndApply(tokenFor(), '/api/tasks', { method: 'POST', body: JSON.stringify({ title: 'Offline task', date: '2099-01-01' }), idempotencyKey: 'stable-key-1' });
  assert.equal(queued.offline, true);
  const local = await sync.read(tokenFor(), 'tasks');
  assert.equal(local.length, 1);
  assert.ok(local[0].id.length > 0);
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
  const result = await sync.flush(tokenFor());
  assert.equal(result.synced, 1);
  assert.equal(result.pending, false);
  assert.equal(requests[0].options.headers['Idempotency-Key'], 'stable-key-1');
  const synced = await sync.read(tokenFor(), 'tasks');
  assert.equal(synced.length, 1);
  assert.equal(synced[0].id, 'mongo-task-1');
  assert.equal(synced[0]._offlinePending, false);
});

test('pull/cache refresh does not overwrite records with pending local changes', async () => {
  const storage = new MemoryStore();
  const sync = new OfflineSync({ storage, getToken: async () => tokenFor() });
  await sync.write(tokenFor(), 'tasks', { id: 'task-1', title: 'Local pending title', _offlinePending: true });
  await sync.write(tokenFor(), 'syncOutbox', { id: 'op-1', collection: 'tasks', method: 'PUT', path: '/api/tasks/task-1', createdAt: new Date().toISOString() });
  await sync.cacheDashboard(tokenFor(), { user: { id: 'user-123' }, data: { tasks: [{ id: 'task-1', title: 'Old server title' }] } });
  const tasks = await sync.read(tokenFor(), 'tasks');
  assert.equal(tasks[0].title, 'Local pending title');
});

test('rejects a token without a usable account ID before reading local data', async () => {
  const sync = new OfflineSync({ storage: new MemoryStore() });
  await assert.rejects(() => sync.read('bad-token', 'tasks'), /account ID/);
});

test('queued create followed by delete replays in order and leaves no local ghost', async () => {
  const storage = new MemoryStore();
  const requests = [];
  const sync = new OfflineSync({
    storage,
    baseUrl: () => 'https://api.test',
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      if (options.method === 'POST') return new Response(JSON.stringify({ task: { id: 'mongo-task-2', title: 'Create then delete', date: '2099-01-01' } }), { status: 201, headers: { 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ message: 'Task deleted' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    },
  });
  const created = await sync.enqueueAndApply(tokenFor(), '/api/tasks', { method: 'POST', body: JSON.stringify({ title: 'Create then delete', date: '2099-01-01' }), idempotencyKey: 'create-before-delete' });
  await sync.enqueueAndApply(tokenFor(), `/api/tasks/${created.id}`, { method: 'DELETE', idempotencyKey: 'delete-after-create' });
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
  const result = await sync.flush(tokenFor());
  assert.equal(result.synced, 2);
  assert.equal(result.pending, false);
  assert.equal(requests.length, 2);
  assert.match(requests[1].url, /mongo-task-2$/);
  assert.equal((await sync.read(tokenFor(), 'tasks')).length, 0);
});

test('local cache is isolated by account ID', async () => {
  const storage = new MemoryStore();
  const sync = new OfflineSync({ storage });
  await sync.write(tokenFor('account-A'), 'tasks', { id: 'task-a', title: 'A only' });
  await sync.write(tokenFor('account-B'), 'tasks', { id: 'task-b', title: 'B only' });
  assert.deepEqual((await sync.read(tokenFor('account-A'), 'tasks')).map((r) => r.title), ['A only']);
  assert.deepEqual((await sync.read(tokenFor('account-B'), 'tasks')).map((r) => r.title), ['B only']);
});
