# DaySync – Goal & Achievements in Data & Sync and Reset Options

This patch updates the existing DaySync source. It does not replace the app or change `server.js`, authentication, the existing Progress Tracker `Goal` model, XP calculations, or unrelated pages.

## Files and destinations

Copy these files into the matching locations in your project and replace the existing files:

| Patch file | Destination in `P:\MyProjects\calender_todolist` |
|---|---|
| `app.js` | `app.js` |
| `scripts/offline-sync.js` | `scripts/offline-sync.js` |
| `scripts/local-database.js` | `scripts/local-database.js` |
| `backend/models/index.js` | `backend/models/index.js` |
| `backend/routes/dashboard.js` | `backend/routes/dashboard.js` |

Keep your existing `style.css`, `index.html`, `server.js`, `package.json`, and `scripts/build-web.js`. They do not need changes for this patch.

## What changes

- Settings → Data & Sync now displays the number of Goal & Achievements goals and completed achievements.
- Goal & Achievements now has its own MongoDB collection (`goalAchievements`), separate from Progress Tracker goals.
- The dashboard API returns Goal & Achievements records for the signed-in account.
- Saving or editing a goal upserts by its stable client-side ID; it does not create duplicates.
- Deleting a goal deletes the matching account-scoped server record.
- Existing localStorage goals are merged with server records on dashboard load, then uploaded using the existing API and offline sync queue.
- Offline storage and queued operations include `goalAchievements`, scoped to the current account.
- Reset Options includes a separate **Goal & Achievements** category. It resets only this collection and the current account's local Goal & Achievements data; it does not reset Progress Tracker data.
- Native goal reminder notifications are cancelled when Goal & Achievements is reset.

## Build and deploy

Run from the project root in PowerShell:

```powershell
cd P:\MyProjects\calender_todolist
node --check .\app.js
node --check .\scripts\offline-sync.js
node --check .\scripts\local-database.js
node .\scripts\build-web.js
```

After the web bundle succeeds, sync and build Android if needed:

```powershell
npx cap sync android
cd .\android
.\gradlew.bat assembleDebug
```

The backend source has also changed. Deploy the updated `backend/models/index.js` and `backend/routes/dashboard.js` together with the app source before relying on cloud sync or the server-side reset category. No server.js edit is required because it already mounts the dashboard router and models directory.

## Verification scope

JavaScript syntax checks and static wiring checks were run on the patched files. The goal merge helper was exercised with two devices' sample goal records, verifying stable-ID merging, preservation of maximum progress/XP/best streak, and union of distinct log entries.

A complete browser/Android runtime test, MongoDB integration test, and `web-app.js` rebuild were not run in this workspace: the uploaded project archive does not contain `node_modules`, and `esbuild`/`mongoose` are not installed here. Your existing local project has the build dependencies, so run the commands above after copying the patch. Do not copy an old `web-app.js` over the newly rebuilt bundle.
