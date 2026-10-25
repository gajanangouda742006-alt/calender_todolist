SAHRA FOCUS & STUDY TIMER PATCH

Adds a dedicated Focus & Study Timer page reachable from Menu > Focus & Study Timer.
Features: start/pause/reset/stop, custom 1-180 minute sessions, 15/25/45/60-minute presets, green-blue progress ring, theme-aware dark/light styling, completion beep, browser notification when permission is granted, Capacitor local notification scheduled for native mobile builds, and local daily/session statistics.

PATCH CONTENTS
- app.js (source frontend)
- style.css

INSTALL (Windows PowerShell)
1. Back up P:\MyProjects\calender_todolist\app.js, style.css, and web-app.js.
2. Extract the ZIP. Copy its app.js and style.css into P:\MyProjects\calender_todolist\ replacing those two files. Do not copy the ZIP files over your whole project.
3. In PowerShell, from P:\MyProjects\calender_todolist run: node --check app.js
4. Rebuild the browser bundle: node scripts/build-web.js (requires the project dependencies already installed with npm install). This updates web-app.js.
5. Test locally: npm start, then open the app and select Menu > Focus & Study Timer.
6. For Android APK builds, run: npm run android:sync, then rebuild/reinstall the APK. Notification permission must be allowed by the user.
7. Deploy the changed files to Render using your usual Git workflow.

NOTES
- Session statistics are stored in this browser/device's localStorage; they are not synced to MongoDB.
- Browser notifications generally require HTTPS/localhost and permission. Browser background timers may be throttled. Native Capacitor local notifications are scheduled at timer start; native app build and notification permission are required.
- The completion alarm is generated in the app and plays while the page/app is active. A browser/OS may suspend audio in the background.
- This patch is built from the uploaded project snapshot. It does not include .env, credentials, node_modules, or .git.
