Sahra assistant deterministic intent patch

Replace backend/routes/dashboard.js with the included file.
This adds authenticated, database-backed responses for task counts, account balance
(calculated from recorded income minus recorded expenses), current-month finance totals,
notes, and today's task/event plan. Existing creation and confirmation handlers remain.

After merging, run:
  node --check backend/routes/dashboard.js
  git diff --check
  git add backend/routes/dashboard.js
  git commit -m "Improve Sahra assistant data queries"
  git push

Notes:
- Balance is based only on transactions recorded in Sahra; it is not a bank connection.
- Existing create-action parsing still has limits. Ambiguous requests should be clarified.
- Ensure MongoDB is connected and the service has the expected environment variables.
