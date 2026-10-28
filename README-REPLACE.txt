SAHRA MENU + SETTINGS NAVIGATION PATCH

This is a small patch ZIP, not the full project. The archive contains the replacement files directly at the ZIP root.

FILES TO REPLACE IN YOUR EXISTING PROJECT ROOT (for example P:\MyProjects\calender_todolist):
- app.js
- index.html
- style.css

Changes:
- Removes the home-page three-dot menu/popup.
- Keeps the bottom navigation Menu button as the entry to the centered feature list.
- Sets menu order to To Do List, Notepad (Vault), Expense Tracker, Focus Timer, Progress & Stats, Settings.
- Adds a dedicated Settings page styled after the supplied reference screenshot.
- Appearance toggles the app theme; Profile opens the existing profile editor; Notifications uses the existing notification permission flow.
- Adds Data & Sync, Privacy & Security tips, Help & Support tips, About Sahra, and Sign Out.
- Updates asset query versions in index.html to avoid reusing the old CSS/JS cache URLs.

AFTER replacing the files, open PowerShell at the project root and run:
  node --check .\app.js
  node .\scripts\build-web.js

For Android, re-stage the mobile bundle before syncing (the Android project consumes `www`, not the root `web-app.js` directly):
  $env:SAHRA_API_BASE_URL = "https://calender-todolist.onrender.com"
  npm run mobile:stage
  npx cap sync android
  cd .\android
  $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
  $env:Path = "$env:JAVA_HOME\bin;$env:Path"
  .\gradlew.bat assembleDebug

The Android APK output path is:
  android\app\build\outputs\apk\debug\app-debug.apk

Do not extract this ZIP into a new nested project folder. Copy/overwrite these three files in the existing project root.
