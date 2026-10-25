SAHRA MENU PAGE UPDATE
======================

Purpose
-------
The bottom Menu button opens a dedicated Menu page instead of a floating popup over the Assistant page. The Menu page reuses the existing four raised 3D button styles and destinations.

Files in this patch
-------------------
app.js            Source application logic
web-app.js        Browser bundle loaded by the root index.html
style.css         Styles for the dedicated Menu screen
service-worker.js Bumps the shell cache version so browsers refresh the updated bundle and CSS

Apply
-----
1. Extract this ZIP directly into your existing calender_todolist project folder.
2. When Windows asks, choose “Replace the files in the destination”.
3. In PowerShell, from the project folder, run:

   git status --short
   git add app.js web-app.js style.css service-worker.js
   git commit -m "Open menu options on a separate page"
   git push

4. Wait for Render to deploy the latest commit, then refresh the website with Ctrl+Shift+R.

Expected behavior
-----------------
- The bottom Menu button opens a separate page titled “Menu”.
- The page shows To Do List, Notepad (Vault), Expense Tracker, and Progress & Stats using the existing button styling.
- Choosing one of the four options navigates to its existing feature page.
- The Assistant page no longer has the four-option popup overlay.

Note: This patch targets the root browser app (index.html + web-app.js) used by the Render website. If you also want the same screen in a separately built Android APK, rebuild/stage the mobile assets after applying the source changes.
