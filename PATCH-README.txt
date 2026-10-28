DaySync navigation and reset API patch
======================================

Files in this patch (copy these into the existing project root, overwriting matching files):

1. app.js
   - Removes the Settings gear from the Home header (Settings remains in the Menu).
   - Prevents the shared header code from inserting a back button on the Menu screen.
   - Makes Calendar Back return directly to Home instead of stale Menu navigation history.
   - Avoids adding duplicate shared back controls on Expense Tracker sub-pages.
   - Converts an HTML 404 response for the reset endpoint into a readable deployment message.

2. style.css
   - Gives the Focus Timer header a proper safe-area offset and raised 3D panel spacing.
   - Left-aligns the Expense Tracker dashboard title block.
   - Hides any generated back control in finance sub-pages, where their existing contextual Back button is retained.

3. pages/finance.js
   - Adds an explicit title-copy class and left alignment for the Expense Tracker dashboard heading.

4. backend/routes/dashboard.js
   - Adds account-scoped DELETE /api/reset-data/:category handling for the Reset Options screen.
   - Supports the categories used by Reset Options: tasks, notepad, expenses, calendar, progress and focus.

Apply:
1. Extract this ZIP directly into P:\MyProjects\calender_todolist and overwrite matching files.
2. In PowerShell from the project root run:

   cd P:\MyProjects\calender_todolist
   node --check .\app.js
   node --check .\pages\finance.js
   node --check .\backend\routes\dashboard.js
   node .\scripts\build-web.js

3. Commit and push from the PROJECT ROOT (not from the android subfolder) so the backend reset endpoint is pushed too:

   git add app.js style.css pages/finance.js backend/routes/dashboard.js
   git commit -m "Fix reset API and navigation headers"
   git push origin main

4. Wait for the hosted API service connected to this repository to finish deploying. The current error `Cannot DELETE /api/reset-data/tasks` means the API currently serving your app does not have that route deployed yet. Rebuilding the Android APK alone will not add an endpoint to the hosted server.

5. Rebuild Android if you use the native app:

   npx cap sync android
   cd .\android
   $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
   $env:Path = "$env:JAVA_HOME\bin;$env:Path"
   .\gradlew.bat assembleDebug

APK output:
android\app\build\outputs\apk\debug\app-debug.apk

Safety notes:
- Reset deletion remains scoped to the authenticated user's records.
- Test Reset Options with noncritical records first; selected-category deletion is permanent.
- Do not run `git reset --hard` or `git clean` to apply this patch.
