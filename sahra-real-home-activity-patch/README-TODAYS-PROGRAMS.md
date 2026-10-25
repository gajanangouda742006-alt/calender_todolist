# Sahra — Today's Programs + Live Weather Update

This is a replacement-file patch for the existing Sahra Life Calendar project. It includes `app.js` and `style.css` only. It does not include or overwrite your backend, database, `.env`, Android project, or Git history.

## What's changed

- Adds a **Today's Programs** heading beneath the calendar, with today's date and a daily-overview subtitle.
- Adds a soft purple/neumorphic style to the daily activity cards inspired by the supplied reference image.
- **Today's Tasks** lists every task dated today (not only the first three), shows priority and due time, and keeps the existing task-completion action.
- **Today's Events** lists every event dated today, ordered by start time, with reminder icon, time, and location when saved.
- **Income, Expenses & Balance** shows today's income, today's expenses, today's net, and the overall net balance calculated from the signed-in user's recorded transactions. Recent transactions are shown below the totals.
- Keeps the expandable weather card. Tapping it requests device/browser location and fetches live conditions and today's forecast from Open-Meteo. It displays temperature, condition, feels-like, humidity, wind, UV maximum, pressure, visibility, dew point, precipitation, sunrise, sunset, and today's high/low. It never uses hardcoded sample weather values.

## Apply the patch

1. Extract the ZIP.
2. In PowerShell, back up the current files:

```powershell
cd P:\MyProjects\calender_todolist
Copy-Item .\app.js .\app.js.before-todays-programs.bak
Copy-Item .\style.css .\style.css.before-todays-programs.bak
```

3. Copy the included `app.js` and `style.css` into `P:\MyProjects\calender_todolist`, replacing those two files only.
4. Run:

```powershell
node --check app.js
node scripts/build-web.js
```

5. If the Sahra server is already running on port 9500, refresh the existing app. Otherwise run `npm start`.

## Notes

- Weather needs internet access and browser/device location permission. `localhost` and HTTPS are generally required for browser geolocation. If permission is denied or the service is unavailable, the UI shows an error and retry action instead of fake data.
- Task, event, and finance sections use data already loaded by Sahra. The total balance is calculated from transactions returned by the existing finance API; it is not a bank-account balance.
- `node --check app.js` passed in the patch-generation environment. Full live database and device testing must be performed in your project environment.
