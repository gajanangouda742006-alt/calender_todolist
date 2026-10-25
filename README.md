# Sahra — Scroll End Cleanup, Settings Menu & Home Card Removal

This patch is based on the project version supplied for this request. It updates only the app shell/rendering files needed for these UI fixes.

## Changes

- Removes the redundant Home-page mini `To Do List` card from the app template and generated web bundle. The full Tasks page and the Today's Tasks panel remain available.
- Reduces oversized trailing padding/min-height rules so pages stop closer to the last real section while retaining the clearance needed above the bottom navigation.
- Gives the Home three-dot menu a more polished, structured 3D popup with readable Appearance/Profile/Notifications/Logout rows, consistent switches, scroll safety on short screens, and separate light-theme colors.
- Updates stylesheet/bundle cache query versions and service-worker cache name to avoid serving the old UI.
- Does not delete any saved tasks or other user data.

## Install

1. Back up these files in `P:\MyProjects\calender_todolist`: `app.js`, `style.css`, `index.html`, `service-worker.js`, and `web-app.js`.
2. Copy the five files from this ZIP into the project root, replacing the existing files.
3. In PowerShell run:

   ```powershell
   cd P:\MyProjects\calender_todolist
   node --check app.js
   node scripts/build-web.js
   ```

4. Refresh the local app with **Ctrl+Shift+R**.
5. If building the Android app, run `npm run mobile:stage` and `npx cap sync android` before rebuilding the app.

The generated `web-app.js` in this ZIP already has the matching Home card removal, but rebuilding after copying `app.js` ensures it remains consistent with the source.
