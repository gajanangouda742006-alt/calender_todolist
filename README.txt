SAHRA HOME — TODAY'S PROGRAMS + LIVE WEATHER PATCH

Files:
- app.js
- style.css

Installation:
1. Back up your current project app.js and style.css.
2. Copy these files into P:\MyProjects\calender_todolist, replacing the matching files.
3. Run:
   node --check app.js
   node scripts/build-web.js
4. Refresh the existing server/browser.

Included:
- Today's Programs section below Today's Progress.
- All tasks and events whose date matches the device's local date.
- Task completion checkboxes use the existing PUT /api/tasks/:id endpoint.
- Today's income/expenses and net plus overall recorded transaction net balance, using existing /api/transactions data.
- Expandable live weather via Open-Meteo and browser/device geolocation. No fake temperature is shown.
- Location/network errors are shown in the UI.

Notes:
- Total balance means all recorded income minus all recorded expenses; if you need opening balance or account-specific bank balance, that must be stored separately.
- Weather location requires device/browser location permission and internet access.
- Please test with your existing API/database before deployment.
