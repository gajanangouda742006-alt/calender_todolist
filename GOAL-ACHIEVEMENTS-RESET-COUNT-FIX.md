# Goal & Achievements reset-count and deletion correction

## Root cause addressed

The earlier patch looked up only one localStorage key derived from the signed-in user ID. Goals created by an earlier app version may still be saved under a username/email-based key, so the page can show goals from an older snapshot while Reset Options sees an empty current-ID key. The previous cleanup also did not match the offline outbox's actual `collection: "goalAchievements"` field.

## Fixes

- Load/migrate current-account Goal & Achievements data from ID, email, username and name keys.
- Reset preview counts the deduplicated union of page state, dashboard records and local storage.
- Reset clears the server's account-scoped GoalAchievement collection, all known localStorage identity keys, the account-scoped SQLite/localStorage cache, and queued operations whose collection/path identifies Goal & Achievements.
- The success count reports the maximum of server-deleted and locally visible records, so local-only legacy goals are not reported as zero.
- The separate Progress Tracker data is not included.

## Deployment

Replace the same five files listed in `GOAL-ACHIEVEMENTS-SYNC-RESET-INSTALL.md`, preserving their folder paths. Rebuild `web-app.js` from the project root and restart the backend so the updated reset route and model are loaded.
