SAHRA OFFLINE INTENT FIX

This patch contains the active backend route file only.

Copy backend/routes/dashboard.js to:
  P:\MyProjects\calender_todolist\backend\routes\dashboard.js

Then in PowerShell from the project root run:
  node --check backend/routes/dashboard.js
  git diff --check
  git add backend/routes/dashboard.js
  git commit -m "Improve offline assistant question matching"
  git push

Wait for Render to deploy the new commit. Verify the Render commit matches the pushed GitHub commit. The task and balance answers query only the authenticated user's saved records. No AI API key is needed for these supported questions.
