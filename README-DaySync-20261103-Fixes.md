# DaySync – Mobile layout, saving speed and Focus Timer alarm fixes

This is a source patch for the existing DaySync project. It does not replace the project or alter MongoDB schemas.

## Changed files

- `app.js`
  - Appearance row no longer shows a chevron.
  - Reset Options and Weather use the shared page header pattern.
  - Current-location weather refresh requests a fresh device location and no longer silently falls back to a previously selected city or saved profile city.
  - Save/create updates the current in-memory data from the API response instead of reloading the complete dashboard after each save.
  - Successful server mutations update the offline cache in the background rather than holding the save/delete response while SQLite finishes.
  - Task and note deletes update the screen immediately and restore the previous state if the server request fails.
  - Task completion toggles and finance saves no longer refetch the full dashboard/transaction list unnecessarily.
  - Focus Timer uses an exact scheduled Android local notification, Doze-aware delivery, high-priority heads-up presentation, a persistent notification and the existing Stop/Reset actions.
- `style.css`
  - Removes legacy large Notepad/Progress header spacers.
  - Makes Reset Options and Weather headers match the other pages.
  - Reserves visible space for the Assistant composer and navigation on phones and small tablets.
  - Removes the Appearance row's decorative arrow.
- `index.html`
  - Updates CSS and JS cache-busting versions so clients request the new files.
- `service-worker.js`
  - Increments the shell cache name to avoid serving stale application assets.

## Apply the patch

Extract this ZIP into the existing project root:

`P:\MyProjects\calender_todolist`

Allow the four source files to be overwritten. Keep all other project files.

**Keep your original `assets\app-intro.mp4` file in place.** The source ZIP uploaded for this task excluded video files, and this patch does not include or replace the intro video.

## Rebuild and run the web app

Run in PowerShell from the project root:

```powershell
cd P:\MyProjects\calender_todolist
npm ci
node --check .\app.js
node .\scripts\build-web.js
npm start
```

Open `http://localhost:9090/login`.

## Rebuild Android

Keep the original intro video in the project because the mobile staging script copies it into `www`.

```powershell
cd P:\MyProjects\calender_todolist
$env:SAHRA_API_BASE_URL = "https://calender-todolist.onrender.com"
npm run mobile:stage
npx cap sync android

cd .\android
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
.\gradlew.bat assembleDebug
```

APK output:

`android\app\build\outputs\apk\debug\app-debug.apk`

## Focus Timer Android permissions

The project already declares `POST_NOTIFICATIONS` and `SCHEDULE_EXACT_ALARM` and creates the Focus Timer channel at maximum importance with public lock-screen visibility and the bundled `daysync_alarm.wav` sound. The scheduled notification is configured with `allowWhileIdle`, `foreground`, `ongoing`, exact delivery and Stop/Reset actions.

On Android 12+, allow DaySync under **Alarms & reminders** (Settings > Privacy & Security > Timer alarms inside DaySync can open this setting) and allow notifications. If Android declines exact-alarm access, the timer will show an instruction toast and the app will not silently claim an exact alarm was scheduled. Lock-screen notification visibility and battery restrictions remain controlled by Android/device settings. A normal heads-up/lock-screen notification is not a full-screen alarm Activity; Android may suppress presentation according to the user's notification, Do Not Disturb and lock-screen settings.

## Verification performed in this workspace

- JavaScript syntax checks: passed for all first-party `.js` files.
- CSS parsing: passed.
- Project JSON parsing: passed.
- Android manifest XML parsing: passed; `POST_NOTIFICATIONS` and `SCHEDULE_EXACT_ALARM` are present.
- Offline-sync regression tests: 6/6 passed.
- Browser/mobile runtime testing and fresh web/Android builds were not performed here because npm dependency installation timed out while retrieving packages.
