Sahra Life Calendar — intro-after-auth patch
============================================

Behavior:
- Opening the dashboard directly or in a new tab does NOT autoplay the intro.
- Refreshing the dashboard does NOT replay the intro.
- A successful sign-in or successful account creation queues the intro for the dashboard redirect.
- The queued flag is stored in sessionStorage and consumed once by the dashboard.
- If video playback fails, the intro overlay hides and the app continues normally.

Apply this patch:
1. Back up your project folder.
2. Extract this ZIP into the ROOT of your existing calender_todolist project folder.
3. Allow the files to overwrite existing files while preserving the folder structure.
4. For the website deployment, commit/push the changed files and wait for Render to deploy the latest commit.
5. For the native Android app, rebuild/sync the web assets using your existing Capacitor workflow after setting SAHRA_API_BASE_URL as required by scripts/stage-mobile.js.

Files included are only the canonical web pages and the staged mobile copies. No node_modules or credentials are included.
