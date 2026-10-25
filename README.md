# Sahra Life Calendar feature API patch

Based on the project ZIP provided in this conversation. This patch adds backend API foundations, scoped to the authenticated user, for global search, finance insights and monthly budget, portable data export/restore, focus-session tracking/statistics, and security preference toggles. It adds a FocusSession MongoDB model.

## Files to merge
- `backend/models/index.js`
- `backend/routes/dashboard.js`

## Merge location
Copy these files into the matching locations in `P:\MyProjects\calender_todolist`, preserving the folder structure and replacing the old versions.

## API routes
All routes are mounted through the existing dashboard router and require the existing auth token:
- `GET /api/search?q=term`
- `GET /api/finance/insights?year=2026&month=10`
- `PUT /api/finance/budget` JSON `{ "monthlyBudget": 10000 }`
- `GET /api/backup/export`
- `POST /api/backup/restore` JSON `{ "schemaVersion": 1, "data": { ... } }`
- `POST /api/focus/sessions` JSON `{ "startedAt": "ISO", "endedAt": "ISO", "plannedMinutes": 25, "completed": true, "label": "Study" }`
- `GET /api/focus/stats`
- `PUT /api/security/preferences` JSON `{ "privateNotesLock": true, "requireReauth": false }`

## Important scope notes
This is a backend API foundation, not a complete frontend UI integration. Existing habit and event/task endpoints remain in place; drag-and-drop calendar rescheduling can use the existing authenticated `PUT /api/events/:id` and `PUT /api/tasks/:id` routes, but a calendar drag-and-drop UI still needs to be wired in the frontend. Reminder recurrence and actual device/browser notification scheduling also need frontend/service-worker/native scheduling work. `privateNotesLock` and `requireReauth` are stored preference flags only; they do not themselves implement cryptographic note encryption, an app lock screen, or reauthentication enforcement. Backup restore adds records as new entries; it does not delete or overwrite existing records. Exported backups contain personal data and should be stored securely.

## Checks performed
- `node --check backend/models/index.js`
- `node --check backend/routes/dashboard.js`

Run these again after merging. Test the routes against a non-production/test account before relying on restore or security preferences. No live database integration test was performed in this environment.
