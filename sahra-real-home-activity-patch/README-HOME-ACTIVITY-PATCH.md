# Sahra — Real Daily Home Summary + Live Weather

This is a focused replacement-file patch for the existing Sahra Life Calendar project. It contains only `app.js` and `style.css`; it does not replace your backend, `.env`, database, or Git history.

## Home page updates

- **My Day:** Shows today's top three tasks, sorted by incomplete first, then priority (High, Normal, Low), then time. Each completion checkbox uses the existing authenticated `PUT /api/tasks/:id` flow. **View All** opens the existing task page.
- **Today's Events & Reminders:** Shows up to three events from today forward, including the event date, start/end time, reminder indicator, and location when saved. **View All** opens the calendar on today's date.
- **Today's Money:** Reads the signed-in user's actual transactions from the existing authenticated `GET /api/transactions` API. It totals today's income and expenses and shows the net plus up to three transactions. If finance data cannot be loaded and no usable cached data exists, the card reports that the records are unavailable instead of making up totals.
- **Daily progress:** Task completion percentage is calculated from tasks dated today, not all tasks in the account.

## Live expandable weather

The weather card intentionally does not show a hard-coded temperature or condition. Tap it to request browser/device location permission. The app then requests current conditions and today's forecast from the Open-Meteo Forecast API using the returned coordinates. Details include temperature, condition, feels-like, humidity, wind, UV maximum, pressure, visibility, dew point, precipitation, sunrise, sunset, and today's high/low.

Weather is loaded only after the card is tapped, so the app does not prompt for location immediately at startup. Coordinates are kept in memory for the current page session and are sent to Open-Meteo to obtain weather; this patch does not send coordinates to Sahra's backend or persist them. The expanded card links to Open-Meteo for attribution.

Location access and internet are required for live weather. Browser/device permissions usually require HTTPS or localhost. If access is denied or weather cannot be reached, the card explains the error and provides **Try again**; it does not fall back to fake weather values.

## Install in PowerShell

1. Close the running Sahra server or leave it running and apply the files after backing up.
2. Extract this ZIP to a temporary folder.
3. In PowerShell, make backups of the current project files:

```powershell
cd P:\MyProjects\calender_todolist
Copy-Item .\app.js .\app.js.before-home-activity.bak
Copy-Item .\style.css .\style.css.before-home-activity.bak
```

4. Copy the patch's `app.js` and `style.css` to `P:\MyProjects\calender_todolist`, replacing those two files only.
5. Run:

```powershell
node --check app.js
node scripts/build-web.js
npm start
```

If port 9500 is already occupied by your running Sahra server, do not start a second instance; refresh the existing app instead.

## Validation

The patched `app.js` passed `node --check`. A renderer smoke test verified that task, event, daily income/expense, and no-sample-weather states render. A live browser/device test and live API/account integration test were not performed in this environment.
