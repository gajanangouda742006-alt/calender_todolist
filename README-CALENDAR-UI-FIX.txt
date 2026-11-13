DaySync Calendar UI Improvements

Files to replace in your existing project:
- app.js
- style.css
- pages/calendar.js

Changes:
1. Calendar page header now uses the shared DaySync common header/back-button styling, consistent with other pages.
2. Selected date uses a high-contrast blue fill and white date text in dark and light themes.
3. Selected-day heading shows the date and a clear mood prompt: "Pick today's mood" / "Today's mood" for today, or the equivalent for another selected date.
4. Mood control shows the saved emoji when one exists and a Pick mood action when no mood is saved.
5. Events and Tasks are separated into structured sections with count badges, readable time/status, title and secondary details.
6. Empty sections have clearer empty-state messaging.
7. Selecting a date now updates the UI immediately. The API request runs in the background, and its response refreshes only the date still selected. This avoids waiting on the network before the calendar responds.

Install:
1. Back up the three existing files.
2. Extract this ZIP into P:\MyProjects\calender_todolist, preserving the pages folder, and overwrite the three files.
3. In PowerShell run:
   cd P:\MyProjects\calender_todolist
   node --check app.js
   node --check pages\calendar.js
   node scripts\build-web.js
4. Restart DaySync and hard-refresh Chrome with Ctrl+Shift+R.

Note:
- The generated web-app.js is intentionally not included. Your project builds it from app.js and pages/calendar.js using the existing esbuild script.
- The source ZIP did not include node_modules, so the bundle build was not run in this preparation environment. Run it in your normal project folder where esbuild is installed.
