const DATA_COLLECTIONS = new Set([
  'events', 'tasks', 'moods', 'habits', 'goals', 'reminders',
  'notes', 'habitLogs', 'assets', 'transactions', 'expenses', 'subscriptions', 'goalAchievements'
]);

function parseTokenAccount(token) {
  try {
    const part = String(token || '').split('.')[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
    const id = decoded.id || decoded.sub || decoded.userId;
    return id ? String(id) : null;
  } catch {
    return null;
  }
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() || `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function cleanPath(path) {
  return String(path || '').split('?')[0].replace(/^\/+/, '');
}

function resourceFor(path, body = {}) {
  const clean = cleanPath(path).replace(/^api\//, '');
  const [root] = clean.split('/');
  const map = {
    events: 'events', tasks: 'tasks', moods: 'moods', habits: 'habits',
    goals: 'goals', reminders: 'reminders', notes: 'notes',
    'habit-logs': 'habitLogs', assets: 'assets', 'goal-achievements': 'goalAchievements', transactions: 'transactions',
    expenses: 'transactions', subscriptions: 'transactions'
  };
  const collection = map[root];
  if (!collection) return null;
  return { collection, root, id: clean.split('/')[1] || null };
}

function normalizeServerRecord(record) {
  if (!record || typeof record !== 'object') return null;
  return { ...record, id: String(record.id || record._id || makeId()) };
}

export class OfflineSync {
  constructor({ getToken, fetchImpl = (...args) => fetch(...args), baseUrl = () => '', storage = null }) {
    this.getToken = getToken;
    this.fetchImpl = fetchImpl;
    this.baseUrl = baseUrl;
    this.storage = storage;
    this.storagePromise = null;
    this.flushing = false;
  }

  async db() {
    if (this.storage) return this.storage;
    if (!this.storagePromise) this.storagePromise = import('./local-database.js');
    return this.storagePromise;
  }

  async scoped(accountId, collection) { return (await this.db()).accountCollection(accountId, collection); }
  async getNamed(name) { return (await this.db()).getCollection(name); }
  async saveNamed(name, record) { return (await this.db()).saveRecord(name, record); }
  async deleteNamed(name, id) { return (await this.db()).deleteRecord(name, id); }

  async accountId(token) {
    const id = parseTokenAccount(token);
    if (!id) throw new Error('The signed-in token does not contain an account ID; offline cache is disabled for safety.');
    return id;
  }

  async collectionName(token, collection) {
    return this.scoped(await this.accountId(token), collection);
  }

  async read(token, collection) {
    return this.getNamed(await this.collectionName(token, collection));
  }

  async write(token, collection, record) {
    return this.saveNamed(await this.collectionName(token, collection), normalizeServerRecord(record));
  }

  async remove(token, collection, id) {
    return this.deleteNamed(await this.collectionName(token, collection), String(id));
  }

  async cacheDashboard(token, payload) {
    const account = await this.accountId(token);
    const data = payload?.data || {};
    for (const collection of ['events','tasks','moods','habits','goals','reminders','notes','habitLogs','assets','goalAchievements']) {
      const name = await this.scoped(account, collection);
      const incoming = Array.isArray(data[collection]) ? data[collection] : [];
      // Do not replace the cache with a server snapshot while local operations are pending.
      const pending = await this.read(token, 'syncOutbox');
      const collectionPending = pending.some((op) => op.collection === collection);
      if (!collectionPending) {
        for (const existing of await this.getNamed(name)) await this.deleteNamed(name, existing.id ?? existing._id);
        for (const record of incoming) await this.saveNamed(name, normalizeServerRecord(record));
      }
    }
    await this.write(token, 'profileCache', { id: 'dashboard', payload: { user: payload?.user || null } }).catch(() => {});
  }

  async cacheSuccessfulMutation(token, path, options = {}, payload = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    if (!['POST','PUT','PATCH','DELETE'].includes(method)) return;
    const resource = resourceFor(path, options.body ? JSON.parse(options.body) : {});
    if (!resource) return;
    const body = options.body ? JSON.parse(options.body) : {};
    const returned = payload.event || payload.task || payload.mood || payload.habit || payload.goal || payload.goalAchievement || payload.reminder || payload.asset || payload.transaction || payload.note;
    if (method === 'DELETE') {
      const tokenAccount = await this.accountId(token);
      const name = await this.scoped(tokenAccount, resource.collection);
      if (resource.id) await this.deleteNamed(name, resource.id);
      else for (const row of await this.getNamed(name)) await this.deleteNamed(name, row.id || row._id);
      return;
    }
    const record = normalizeServerRecord(returned || body);
    if (!record) return;
    await this.write(token, resource.collection, { ...record, _offlinePending: false });
  }

  async cacheTransactions(token, transactions) {
    const pending = await this.read(token, 'syncOutbox');
    if (pending.some((op) => op.collection === 'transactions')) return;
    const existing = await this.read(token, 'transactions');
    for (const row of existing) await this.remove(token, 'transactions', row.id ?? row._id);
    for (const row of (Array.isArray(transactions) ? transactions : [])) await this.write(token, 'transactions', row);
  }

  async dashboardFallback(token) {
    const [userCache, ...values] = await Promise.all([
      this.read(token, 'profileCache'),
      ...['events','tasks','moods','habits','goals','reminders','notes','habitLogs','assets','goalAchievements'].map((c) => this.read(token, c))
    ]);
    const names = ['events','tasks','moods','habits','goals','reminders','notes','habitLogs','assets','goalAchievements'];
    const data = Object.fromEntries(names.map((name, i) => [name, values[i]]));
    return { user: userCache.find((x) => x.id === 'dashboard')?.payload?.user || null, data, offline: true };
  }

  async transactionFallback(token) {
    return this.read(token, 'transactions');
  }

  async enqueueAndApply(token, path, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const resource = resourceFor(path, options.body ? JSON.parse(options.body) : {});
    if (!resource || !DATA_COLLECTIONS.has(resource.collection)) throw new Error('This action is not supported offline. Reconnect and try again.');
    const account = await this.accountId(token);
    const body = options.body ? JSON.parse(options.body) : {};
    const collectionName = await this.scoped(account, resource.collection);
    const outboxName = await this.scoped(account, 'syncOutbox');
    const rows = await this.getNamed(collectionName);
    const recordId = resource.id;
    const idempotencyKey = options.idempotencyKey || makeId();
    let localId = recordId;
    let localRecord = null;

    if (method === 'POST') {
      localId = makeId();
      localRecord = normalizeServerRecord({ ...body, id: localId, _offlinePending: true, updatedAt: new Date().toISOString() });
      if (resource.collection === 'transactions') {
        localRecord.type = body.type || 'expense';
        localRecord.date = body.date || new Date().toISOString().slice(0, 10);
      }
      if (resource.collection === 'moods') {
        const sameDate = rows.find((r) => r.date === body.date);
        if (sameDate) {
          localId = sameDate.id;
          localRecord = { ...sameDate, ...body, id: localId, _offlinePending: true, updatedAt: new Date().toISOString() };
        }
      }
      await this.saveNamed(collectionName, localRecord);
    } else if (method === 'PUT' || method === 'PATCH') {
      const existing = rows.find((r) => String(r.id || r._id) === String(recordId));
      if (!existing && resource.collection !== 'goalAchievements') throw new Error('Cannot edit this item offline because it is not in the local cache. Reconnect and retry.');
      localRecord = { ...existing, ...body, id: String(recordId), _offlinePending: true, updatedAt: new Date().toISOString() };
      await this.saveNamed(collectionName, localRecord);
    } else if (method === 'DELETE') {
      if (!recordId) {
        // Bulk transaction reset is represented as a queued operation, and the local cache is cleared.
        for (const row of rows) await this.deleteNamed(collectionName, row.id || row._id);
      } else {
        await this.deleteNamed(collectionName, recordId);
      }
    } else {
      throw new Error('Unsupported offline operation.');
    }

    const op = {
      id: makeId(), idempotencyKey, accountId: account, path: String(path), method,
      body, collection: resource.collection, localId, serverId: method === 'POST' ? null : recordId,
      createdAt: new Date().toISOString(), attempts: 0, status: 'pending'
    };
    await this.saveNamed(outboxName, op);
    return method === 'DELETE' ? { message: 'Deleted locally; will sync when online.', offline: true } : {
      message: 'Saved on this device; will sync when online.', offline: true,
      [resource.collection === 'transactions' ? 'transaction' : resource.collection.slice(0, -1)]: localRecord,
      id: localId
    };
  }

  async flush(token) {
    if (this.flushing || !token || !globalThis.navigator?.onLine) return { synced: 0, pending: true };
    this.flushing = true;
    let synced = 0;
    try {
      const account = await this.accountId(token);
      const outboxName = await this.scoped(account, 'syncOutbox');
      const idMapName = await this.scoped(account, 'syncIdMap');
      const ops = (await this.getNamed(outboxName)).sort((a,b) => String(a.createdAt).localeCompare(String(b.createdAt)));
      const mappings = await this.getNamed(idMapName);
      const idMap = new Map(mappings.map((m) => [String(m.localId), String(m.serverId)]));
      for (const op of ops) {
        let path = op.path;
        for (const [localId, serverId] of idMap) path = path.replace(`/${localId}`, `/${serverId}`);
        let response;
        try {
          response = await this.fetchImpl(`${this.baseUrl()}${path}`, {
            method: op.method,
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'Idempotency-Key': op.idempotencyKey },
            ...(op.method === 'GET' || op.method === 'HEAD' ? {} : { body: JSON.stringify(op.body || {}) })
          });
        } catch (error) {
          console.warn("[OfflineSync] Network request failed:", error?.name || "Error", error?.message || "Unknown network error");
          break;
        }
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          op.attempts = Number(op.attempts || 0) + 1;
          op.lastError = payload.message || `HTTP ${response.status}`;
          console.warn("[OfflineSync] Server rejected queued operation:", response.status, op.method, op.path);
          await this.saveNamed(outboxName, op);
          // Preserve order: later edits/deletes may depend on this operation.
          break;
        }
        const returned = payload.event || payload.task || payload.mood || payload.habit || payload.goal || payload.goalAchievement || payload.reminder || payload.asset || payload.transaction || payload.note;
        if (op.method === 'POST' && returned?.id && op.localId) {
          const dataName = await this.scoped(account, op.collection);
          const oldRows = await this.getNamed(dataName);
          const localRow = oldRows.find((r) => String(r.id) === String(op.localId));
          if (localRow) {
            await this.deleteNamed(dataName, op.localId);
            await this.saveNamed(dataName, { ...localRow, ...returned, id: String(returned.id), _offlinePending: false });
          }
          await this.saveNamed(idMapName, { id: op.localId, localId: String(op.localId), serverId: String(returned.id) });
          idMap.set(String(op.localId), String(returned.id));
        } else if (['PUT', 'PATCH'].includes(op.method) && returned?.id) {
          const dataName = await this.scoped(account, op.collection);
          await this.saveNamed(dataName, { ...returned, id: String(returned.id), _offlinePending: false });
        }
        await this.deleteNamed(outboxName, op.id);
        synced += 1;
      }
      return { synced, pending: (await this.getNamed(outboxName)).length > 0 };
    } finally {
      this.flushing = false;
    }
  }

  async handleNetworkFailure(token, path, options, error) {
    if (!globalThis.navigator?.onLine || error instanceof TypeError || error?.name === 'TypeError') {
      return this.enqueueAndApply(token, path, options);
    }
    throw error;
  }
}

export { parseTokenAccount, resourceFor };
