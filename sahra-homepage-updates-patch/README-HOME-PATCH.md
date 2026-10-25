# Sahra Life Calendar — Home Page Updates Patch

This patch is based on the project source files uploaded in this conversation.

## Included
- Expandable weather card in the existing blue-gradient style.
- My Day card with up to three of today's tasks, priority labels, time/deadline, and completion checkboxes wired to the existing task update API.
- Today's Events card plus up to two upcoming events.
- Responsive styling and light-theme support.

## Apply safely
1. Stop the local Sahra server.
2. In `P:\MyProjects\calender_todolist`, make backups of `app.js` and `style.css`.
3. Copy the two files from this ZIP into the project root, replacing those two files.
4. Run:
   ```powershell
   node --check app.js
   node scripts/build-web.js
   ```
5. Restart the app and check Home on desktop and mobile.

## Notes
- The weather card currently retains the existing demo weather values (27°C / Partly Cloudy). Humidity, wind, sunrise and sunset display `—` until a live weather provider is connected; this patch does not invent live weather data.
- Tasks/events are read from the app's existing dashboard state. Tasks are ordered by completion status, priority, then time.
- This is a UI patch based on the uploaded source files, not a full backend or Android build. Back up your current files first, since your working directory may have changes newer than these uploaded sources.
