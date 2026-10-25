SAHRA HOME UI — INSTALL FIX
===========================

This package addresses the situation where the previous UI patch was copied,
but the visible app still looked unchanged. It installs the updated app.js and
style.css, changes the existing service worker cache version (without replacing
the rest of service-worker.js), adds cache-busting versions to index.html asset
URLs, and runs the real web-app.js build.

INSTALL
-------
1. Extract this ZIP to a folder, e.g. Downloads\sahra-home-ui-refresh-install-fix.
2. Open PowerShell and run:

   powershell -ExecutionPolicy Bypass -File "C:\FULL\PATH\TO\EXTRACTED\INSTALL-SAHRA-HOME-UI.ps1"

The script defaults to P:\MyProjects\calender_todolist. If your project is in a
different folder, pass it explicitly:

   powershell -ExecutionPolicy Bypass -File "C:\FULL\PATH\TO\EXTRACTED\INSTALL-SAHRA-HOME-UI.ps1" -ProjectRoot "P:\MyProjects\calender_todolist"

It makes timestamped backups before replacing files. It then runs:
   node --check app.js
   node scripts/build-web.js

3. Visit the LOCAL app URL and press Ctrl+Shift+R.
4. Check that the home has Today's Programs and the weather card has View Weather.
   Clicking View Weather should open the detailed weather page. Live readings need
   internet and browser location permission, or a city search.

WHAT THE PATCH CONTAINS
-----------------------
- A refreshed home layout for dark and light themes.
- Today's Programs cards (tasks, events, income, expenses, today's net and overall
  recorded transaction balance).
- A top-right View Weather button opening a detailed weather page with current,
  hourly and 7-day values from Open-Meteo. It displays unavailable/error states,
  not fabricated weather data.
- Filtering of the two explicitly identified bad task titles (`tytyty` and the
  literal `<span>tytyty</span>`). Permanent deletion is attempted through the app's
  existing authenticated DELETE task endpoint; the API must allow that operation.

IMPORTANT
---------
The installer changes LOCAL files only. If you are looking at the deployed Render
website, this does not change production. Commit and push intended changes, then
wait for the deployment to complete. Do not commit backups, .env files, tokens,
passwords, or secrets.
