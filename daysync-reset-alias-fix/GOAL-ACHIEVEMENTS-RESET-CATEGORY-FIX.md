# DaySync – Unknown Reset Category Fix

The reset API now recognizes all of these Goal & Achievements category values:

- `goal-achievements` (canonical)
- `goalAchievements` (older camelCase clients)
- `goal_achievements` / `goal achievements` (legacy variants)

The route normalizes incoming category names before looking them up. The delete remains scoped to `req.user.id` and only targets the separate `GoalAchievement` model. It does not delete Progress Tracker goals.

## Exact replacement paths

Copy the ZIP contents into `P:\MyProjects\calender_todolist` and preserve folders:

- `app.js` → project root
- `backend/models/index.js` → `backend\models\index.js`
- `backend/routes/dashboard.js` → `backend\routes\dashboard.js`

The critical fix is `backend\routes\dashboard.js`. Replacing only `app.js` is not enough: the API route running on the server must contain the category alias handling.

## Apply and restart

From PowerShell:

```powershell
cd P:\MyProjects\calender_todolist
node --check .\app.js
node --check .\backend\models\index.js
node --check .\backend\routes\dashboard.js
```

Stop the currently running `npm start` process with `Ctrl+C`, then restart it:

```powershell
npm start
```

If the API is hosted separately, deploy/restart that backend service with the updated `backend/routes/dashboard.js` and `backend/models/index.js`.

The frontend app should then rebuild its bundle as usual if `app.js` was replaced:

```powershell
node .\scripts\build-web.js
```

## Expected behavior

Selecting Goal & Achievements in Reset Options calls `DELETE /api/reset-data/goal-achievements`. The server also accepts the legacy category spellings. It deletes only the signed-in user's Goal & Achievements rows and returns the count.

This patch has passed JavaScript syntax checks. A live MongoDB/API deletion test was not run in this environment.
