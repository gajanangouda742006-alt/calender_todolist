# Sahra assistant, intro video, and Notepad UI patch

This is a source patch for the existing `calender_todolist` project. It deliberately contains only the changed source files, not `node_modules` or the full project archive.

## Changes

1. Removes only the small Home-page `To Do List` preview card. It does not remove saved tasks, the Tasks page, or the separate `Today's Tasks` panel.
2. Moves the Notepad `+` button to the lower-left, just above the bottom navigation. It uses responsive positioning and respects mobile safe-area insets.
3. Makes the startup intro video and poster fill the available mobile viewport while retaining the entire portrait video frame (no forced crop), adds a decoded-frame fade-in, and adds a 15-second fail-safe so a stalled video cannot block app entry.
4. Improves Sahra's general assistant instructions: broader general-knowledge, learning, coding, writing, and planning responses; clearer uncertainty handling; avoids inventing live checks, sources, or personal data.
5. Sends up to 10 recent user/assistant turns to the backend for conversational follow-ups, with server-side role/length normalization.
6. Bumps the app stylesheet/script query version and service-worker cache name so browsers can fetch the updated files.

## Apply

Back up the files being replaced, then copy the files from this ZIP into the root of your existing project, preserving folders:

- `app.js`
- `style.css`
- `index.html`
- `service-worker.js`
- `pages/assistant.js`
- `pages/notepad.js`
- `backend/routes/dashboard.js`

The ZIP does not contain a regenerated `web-app.js`, because this project builds that bundle from `app.js`. After copying the patch, run PowerShell from your project root:

```powershell
node --check app.js
node --check backend/routes/dashboard.js
node --check pages/assistant.js
node --check pages/notepad.js
node scripts/build-web.js
```

Then refresh the local web app with **Ctrl+Shift+R**. If the server is already running, do not start a second copy; refresh the existing page. To refresh a native Android build, run `npm run mobile:stage` and then `npx cap sync android` before rebuilding/relaunching the app.

## Assistant configuration and accuracy

This patch improves prompting and multi-turn context; it does **not** train model weights or guarantee perfectly accurate answers. General-knowledge answers require a backend AI provider key. Configure either `GEMINI_API_KEY` or an OpenAI-compatible `AI_API_KEY` on the server/Render environment (never in frontend code and never commit the secret). With no provider configured, Sahra continues to support the built-in offline queries and record actions, but it cannot answer arbitrary general-knowledge questions as a full AI assistant. Current events, laws, prices, and other live facts still need a live verification source; the prompt instructs Sahra not to pretend it has checked one.
