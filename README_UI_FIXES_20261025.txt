SAHRA LIFE CALENDAR — CHAT, MENU, TODO FILTERS AND FINANCE QUICK AMOUNT FIXES

This is a PATCH ZIP (only changed files), not a full replacement project.
Merge its contents into the root of your existing P:\MyProjects\calender_todolist folder.
Choose Replace files if Windows asks. Keep the paths/folders intact.

Changes included:
1. Assistant auto-scrolls smoothly to the latest conversation when a new message/loading response is added. Opening the Assistant page still starts at the top; it does not forcibly jump to the bottom merely because you navigated to the page.
2. Menu title and four feature buttons are centered as a group with clear vertical spacing.
3. To Do List heading remains sticky and its four filter buttons stay pinned beneath the heading while the task list scrolls. Removed the old excessive top spacer.
4. +100, +500, +1000 and +5000 chips now ADD the selected value to the existing amount for both income and expense. Example: click +100 then +500 and the amount becomes 600.
5. Bottom navigation hide/reveal transform now keeps its horizontal center while sliding vertically off/on screen, instead of coming from the side.
6. Existing UI polish styles are preserved. Browser service-worker cache version is bumped so the updated bundle and styles are fetched after deployment.

FILES IN THIS PATCH:
- app.js
- web-app.js
- style.css
- service-worker.js
- www/mobile-entry.js
- www/style.css
- android/app/src/main/assets/public/mobile-entry.js
- android/app/src/main/assets/public/style.css

After merging, use PowerShell in the project root:
  git diff --check
  git status --short
  git add app.js web-app.js style.css service-worker.js www/mobile-entry.js www/style.css android/app/src/main/assets/public/mobile-entry.js android/app/src/main/assets/public/style.css
  git commit -m "Fix assistant scrolling and finance quick amounts"
  git push

Then wait for Render to deploy and hard-refresh the website (Ctrl+Shift+R).
For Android, rebuild/stage/sync the app separately before making a new APK.
