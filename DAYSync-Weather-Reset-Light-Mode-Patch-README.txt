DaySync focused update — Weather header, Reset Options, and calendar selection

This patch intentionally changes only:
- app.js
- style.css

Changes:
1. Weather header uses the same shared left-side back-button style as other DaySync pages.
2. Weather and Reset Options header text is dark and readable in Light mode; the back-button arrow remains white on its dark button surface.
3. Reset Options now initializes the Alarm Clock category correctly.
4. Resetting Alarm Clock clears the locally saved DaySync alarms and cancels their native scheduled notification IDs. It does not send "alarms" to the server reset API, which caused the unknown-category error.
5. Alarm-only reset works without requiring a server connection. If native notification cancellation fails, saved alarms are retained and the reset reports an error rather than silently leaving scheduled alarms behind.
6. The calendar selected date retains a strong blue highlight in both themes.

Install:
1. Back up P:\MyProjects\calender_todolist.
2. Extract this ZIP into P:\MyProjects\calender_todolist and replace the matching app.js and style.css files.
3. Open PowerShell:
   cd P:\MyProjects\calender_todolist
   node --check .\app.js
   node .\scripts\build-web.js

If the build reports that esbuild is missing, run npm install first, then run node .\scripts\build-web.js again. The app's index.html loads web-app.js, so rebuilding the bundle is required for the changes to appear in the browser/PWA.

Android:
Set SAHRA_API_BASE_URL to your deployed HTTPS API origin, then run:
   npm run android:sync
Then build the Android app using Android Studio or Gradle.

 iOS:
The same app.js/style.css changes are shared by the iOS web view. iOS platform generation/sync, signing, and device testing require macOS with Xcode. If the ios platform folder has not been added yet, add it from the project root on the Mac with npx cap add ios, then set SAHRA_API_BASE_URL and run npm run ios:sync.

Validation performed for this patch:
- node --check app.js passed.
- node --check pages/calendar.js passed (unchanged).
- CSS braces and parentheses are balanced.
- Static checks confirm the Alarm Clock reset uses local alarm storage/notification cancellation rather than the server reset endpoint.

Not performed here:
- Physical Android/iPhone testing.
- Full browser bundle rebuild, because dependencies (including esbuild) are not installed in this working copy.
- Native app signing or store packaging.
