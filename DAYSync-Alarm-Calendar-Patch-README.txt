DaySync focused source patch — 15 November 2026

Modified files:
- app.js: remove alarm deletion confirmation, show latest 10 saved alarms, schedule one-shot alarms for the next occurrence, repeat daily alarms with native repeating notifications, stable 32-bit notification IDs, cancel new and legacy scheduled IDs, remove automatic shared calendar back button.
- pages/calendar.js: remove the red-marked calendar back button.
- style.css: sticky calendar navigation at top, blue selected date.
- scripts/mobile-notifications.js: new Android sound-enabled alarm channel (Android notification channel sounds are immutable once created).

IMPORTANT INSTALL:
1. Back up P:\MyProjects\calender_todolist.
2. Extract this patch ZIP INTO P:\MyProjects\calender_todolist, replacing matching files. Do not delete other files.
3. In PowerShell:
   cd P:\MyProjects\calender_todolist
   npm install
   node scripts/build-web.js
4. For Android native app (requires deployed HTTPS API URL):
   $env:SAHRA_API_BASE_URL = 'https://YOUR-DEPLOYED-API-ORIGIN'
   npm run android:sync
   cd android
   .\gradlew.bat assembleDebug
5. For iOS, use macOS with Xcode and signing; set SAHRA_API_BASE_URL and run npm run ios:sync, then npx cap open ios.

ALARM LIMITATIONS:
- This uses native local notifications and the packaged Android daysync_alarm.wav resource; it does not implement a continuously ringing foreground alarm screen or guaranteed override of Do Not Disturb.
- iOS custom sound requires a compatible audio asset in the iOS app bundle and platform testing; no iOS native project or sound bundle was included in this ZIP.
- Exact timing on Android may require permission for Alarms & reminders, plus notification permission. OEM battery management and OS restrictions can affect delivery.
- Repeating alarms rely on native scheduling. Existing alarms previously saved with the older scheduler are not automatically migrated; delete and recreate them to use the new schedule.
- A powered-off phone cannot run this app's alarms. Background delivery must be tested on physical Android/iOS devices.
- Latest 10 means display only; older saved alarms are preserved, not deleted.

VALIDATION: node --check passed on the three edited JS files. Device behavior and full bundle rebuild must be tested on the user's machine.
