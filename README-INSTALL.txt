DaySync Settings > Reset Options Back Navigation Fix

Files:
- app.js

Installation:
1. Back up your existing app.js.
2. Extract this ZIP into P:\MyProjects\calender_todolist and replace app.js.
3. Open PowerShell:
   cd P:\MyProjects\calender_todolist
   node --check app.js
   node scripts/build-web.js
4. Restart DaySync and hard refresh (Ctrl+Shift+R).

Verification:
- JavaScript syntax check passed in the provided environment.
- The web bundle could not be rebuilt here because the supplied source ZIP does not include node_modules (esbuild dependency). Run the build command above in your project environment.
