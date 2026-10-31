# DaySync — Goal & Achievements edit-page patch

## Files in this patch

- `app.js` — updated application source with a separate `goal-edit` view and split create/edit submission paths.
- `index.html` — original project HTML with one additional stylesheet link.
- `goal-achievements-3d.css` — new, scoped visual layer for Goal & Achievements only.

The existing `style.css` is not replaced or shortened. Keep your full existing stylesheet in the project root.

## Install into the project root

Copy these three files into the same folder as your current `index.html`, `app.js`, and `style.css`:

1. Replace the existing `app.js` with this patched `app.js`.
2. Replace the existing `index.html` with this updated `index.html`.
3. Add `goal-achievements-3d.css` as a new file. Do not delete or replace `style.css`.

The updated HTML loads `style.css` first and `goal-achievements-3d.css` immediately afterward so the new scoped rules override only the Goal & Achievements screen.

## What changed in `app.js`

### A. Create Goal page is create-only

**Location:** `renderGoalAchievementsPage()`.

The old `editing` lookup and all edit-dependent values were removed from the Create Goal form. Its form now uses `data-form="goal-achievement"` and always creates a new goal with the same defaults as before.

The existing summary cards, filters, goal cards, progress forms, delete controls, progress display and achievement UI remain in the same function.

### B. Dedicated Edit Goal page

**Location:** immediately after `renderGoalAchievementsPage()`.

A new `renderGoalEditPage()` function renders `data-form="goal-achievement-edit"`, pre-populates title, description, target, date, unit, frequency, reminder time and category, and provides **Cancel** and **Save Changes**.

### C. Routing and navigation

**Locations:** `goBackFromView()`, the header selector map in `applySharedPageBackButton()`, and `renderLayout()`.

The Edit action stores the selected goal ID in `state.goalAchievementEditingId`, pushes the current view onto `state.navigationHistory`, and switches to `goal-edit`. The dedicated edit view is registered in `renderLayout()`.

The app Back action, header Back button, and Cancel button return to `goal-achievements` and clear the editing ID. When the selected goal no longer exists, the view returns to Goal & Achievements and displays a toast message.

### D. Data-safe edit save

**Location:** the delegated `submit` listener in `bindGlobalListeners()`.

Create and edit forms now have separate submission branches. Editing locates the existing goal by `state.goalAchievementEditingId` and updates that same array entry using:

```js
const updatedGoal = { ...previous, ...editableFields };
```

Only the editable fields from the edit form are changed. Existing ID, current progress, logs, XP, current/best streaks, created date, achievement history, and additional metadata remain on the previous object. No new ID or duplicate goal is created during editing.

The save path recalculates the derived status and calls the existing `syncGoalReminder(updatedGoal)` after a successful save. The progress logging block and XP/streak calculation functions are unchanged.

## Build and Android sync

Run from the project root on your Windows machine:

```powershell
node --check .\app.js
node .\scripts\build-web.js
npx cap sync android
```

Only continue to Android compilation if the web bundle command succeeds:

```powershell
cd .\android
.\gradlew.bat assembleDebug
```

`web-app.js` is intentionally not included: the available execution environment did not have the project's esbuild dependency, so a new bundle could not be truthfully produced or verified. Your own project already has the build script and dependencies; regenerate `web-app.js` locally with the command above.

## Verification performed here

- `node --check app.js` — passed.
- App runtime / browser interaction tests — not run in this environment.
- APK build — not run here.

Please test creating a goal, editing and cancelling, saving an edited goal, deleting a goal, progress logging, XP/streak retention, native reminder rescheduling, refresh persistence and Android hardware Back after rebuilding on your device.

No `server.js`, backend API, database schema, authentication, offline-sync module, or unrelated page was changed. No GitHub push was performed.
