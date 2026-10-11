# Sahra offline-first sync: validation and safety notes

## What this integration does

- Uses the existing dashboard/finance REST endpoints, so successful queued operations are written through the existing MongoDB models (`events`, `tasks`, `moods`, `habits`, `goals`, `reminders`, `assets`, and `transactions`) rather than a separate sync-envelope collection.
- Caches dashboard and transaction responses per account in the local store. Native builds use the existing Capacitor SQLite driver; browser builds use localStorage.
- On network failures, queues supported POST/PUT/PATCH/DELETE operations, applies them locally, and replays them in order when connectivity returns.
- Adds `Idempotency-Key` receipts to avoid duplicate writes when the server commits an operation but the client loses the response. Receipts expire after 14 days.
- Uses one JWT secret helper for both token signing and verification. Production requires a configured 32-byte-or-longer `JWT_SECRET`.
- Does not auto-assign legacy unscoped local records to an account. Existing unscoped records remain untouched to avoid exposing one account's data to another account.

## Static checks

From PowerShell in the project directory:

```powershell
.\scripts\verify-offline-sync.ps1
```

## Real MongoDB end-to-end test

Use a dedicated test account on a non-production deployment. Never put the password in a committed file.

```powershell
$env:SAHRA_TEST_API_URL = 'https://YOUR-API-HOST'
$env:SAHRA_TEST_EMAIL = 'YOUR-TEST-ACCOUNT-EMAIL'
$secure = Read-Host 'Test account password' -AsSecureString
$env:SAHRA_TEST_PASSWORD = [System.Net.NetworkCredential]::new('', $secure).Password
node scripts/verify-mongo-sync.js
Remove-Item Env:\SAHRA_TEST_PASSWORD
```

The test checks MongoDB health, login, repeated idempotent task creation, dashboard visibility, edit, and deletion. It creates a temporary task and deletes it. Run only against a test account/server.

## Android offline acceptance test (must be run on the actual device)

1. Install a build staged from this exact source after the API URL and production JWT secret are configured.
2. Sign in while online and wait for the dashboard and finance screen to load once, so there is local cached data.
3. Enable Airplane mode. Create one task and one event; edit one cached task; delete one cached event. Confirm the app shows the offline-save toast and keeps the edits visible after navigating away and back.
4. Force-close Sahra and reopen it while still offline. Confirm the cached dashboard and finance data still appear and queued edits remain visible.
5. Disable Airplane mode and wait for sync to finish. Check the dashboard and finance data on the device and on the server for duplicates or missing records.
6. Repeat with one finance transaction create and delete. Confirm the transaction appears exactly once on the server.
7. Sign out and sign in as a different test account. Confirm the first account's cached records are not shown.
8. If any queued operation is rejected (for example a date validation conflict), inspect its `lastError` in the account-scoped `syncOutbox` records and resolve it before calling the feature production-ready.

## Known limitations / gates

- This chat environment has no access to the user's live MongoDB credentials or physical Android device. A real MongoDB/device result cannot honestly be reported here; run the two validation procedures above.
- Server-side validation still applies during replay. An operation that becomes invalid or conflicts while offline is retained at the head of the queue and blocks later operations to preserve order; it needs manual resolution.
- The API's server-side idempotency receipt must be available in the MongoDB deployment and the unique index must be created. The first production rollout should verify index creation and backups before relying on it.
- Account-scoped records are stored separately from the previous unscoped local cache. This patch intentionally does not migrate old unscoped records automatically.
