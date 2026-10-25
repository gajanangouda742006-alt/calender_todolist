Sahra Offline Assistant Patch

Merge backend/routes/dashboard.js into P:\MyProjects\calender_todolist\backend\routes\dashboard.js.
This patch adds database-backed local query intents and a no-API fallback. Existing explicit create task/event/note/transaction flows remain in place.

After copying, run:
  node --check backend/routes/dashboard.js
  git diff --check
  git add backend/routes/dashboard.js
  git commit -m "Add offline Sahra assistant intents"
  git push

Test on Render: ask task count, progress, notes count, recorded balance, monthly income/expenses, and today schedule.
