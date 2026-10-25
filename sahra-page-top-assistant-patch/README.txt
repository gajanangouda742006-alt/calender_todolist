SAHRA LIFE CALENDAR — PAGE SCROLL-TO-TOP PATCH

This patch is based on the latest available prior patch ZIP in this conversation:
sahra-chat-menu-finance-fixes.zip

Changed file:
- app.js

What changed:
- On actual view changes, scrolls the main app and known nested page/content scroll areas to the top.
- Runs the reset immediately and again on the next animation frame so it applies after the new view has rendered.
- Keeps the bottom navigation's scroll-hidden state reset on page change.
- Does not reset scroll on normal re-renders within the same view, such as typing or updating data.

IMPORTANT WEB DEPLOY NOTE:
Your web page loads web-app.js, not app.js. After copying this file into the project root, rebuild the bundle before committing:
  node scripts/build-web.js
Then verify web-app.js changed:
  git status --short
Commit both app.js and web-app.js, plus any service-worker cache version update required by your project.

Assistant capabilities note:
The available prior patch already sends assistant messages to /api/assistant/chat and posts confirmed actions to /api/assistant/execute. Full natural-language data queries and reliable create-task/event/note/finance actions depend on the server implementation of those endpoints and the authenticated user's database records. This patch does not pretend to implement or verify backend assistant training; backend source must be inspected and updated separately to support every requested intent safely.
