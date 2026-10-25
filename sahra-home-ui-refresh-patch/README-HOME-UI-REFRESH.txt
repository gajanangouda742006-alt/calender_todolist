SAHRA HOME UI REFRESH PATCH
===========================

Patch contents
--------------
- app.js   (based on the app.js file uploaded in this conversation)
- style.css (based on the style.css file uploaded in this conversation)

Changes
-------
1. Refreshed the home screen visual hierarchy and interactions with royal-blue,
   teal, and indigo accents. Added explicit styling for dark and light themes.
2. Replaced the hardcoded home-screen 27 C reading with data-backed values.
   The top-right "View Weather" button opens a dedicated weather page.
3. The weather page fetches current conditions and 7-day/hourly details from
   Open-Meteo. It includes humidity, wind, pressure, visibility, dew point,
   UV index, rain chance/precipitation, cloud cover, sunrise/sunset, hourly
   outlook, and a 7-day forecast.
4. The weather page tries browser location first. If location access is blocked,
   it can use a saved profile location; users can also search for a city.
   Requires internet access. No weather sample numbers are presented as live.
5. Home now includes Today's Programs: today's tasks, today's events, today's
   income/expenses, today's net and overall transaction net balance.
   Money totals are calculated from transactions saved in Sahra, not a bank feed.
6. Removes task records whose title normalizes exactly to "tytyty" (including
   the literal label "<span>tytyty</span>") from the displayed dashboard data,
   and attempts to delete those specific task IDs through the existing
   authenticated /api/tasks/:id endpoint. Other task names are not removed.
   The quick-task and task form flows reject that exact test title.

Install
-------
1. Back up app.js and style.css in your project folder.
2. Copy these two files into P:\MyProjects\calender_todolist, replacing the
   current app.js and style.css.
3. In PowerShell, from the project folder run:

   node --check app.js
   node scripts/build-web.js

4. Refresh the already running Sahra page. If the app is not running, start it
   with npm start. If port 9500 is already in use, refresh the current server
   instead of starting a second one.

Validation performed in this patch workspace
--------------------------------------------
- node --check app.js passed.
- CSS parsed with tinycss2 with zero top-level parse errors.
- The live API and complete user database could not be tested from this patch
  workspace; validate in the running Sahra app after copying the files.
