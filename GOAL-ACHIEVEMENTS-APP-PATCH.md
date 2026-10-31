# DaySync — Goal & Achievements: separate Create/Edit pages + 3D UI patch

## Patch files

- `app.js` — updated Goal & Achievements overview, dedicated `goal-create` and `goal-edit` views, navigation and save handling.
- `index.html` — original project HTML with the additional scoped stylesheet link.
- `goal-achievements-3d.css` — new scoped 3D styling for Goal & Achievements only.

Keep your existing full `style.css`. This patch does not replace or shorten it.

## Install

Copy the three files into the project root beside your current `index.html`, `app.js`, and `style.css`:

1. Replace `app.js`.
2. Replace `index.html`.
3. Add `goal-achievements-3d.css` as a new file.
4. Keep your existing `style.css` unchanged.

The updated `index.html` loads `style.css` first and `goal-achievements-3d.css` afterward.

## User flow

### Goal & Achievements overview

`renderGoalAchievementsPage()` now shows the summary cards, a compact **Add Goal** entry card, filters, and the existing saved goal cards. The goal creation fields are removed from this overview page.

Clicking **Add Goal** stores the current view in `state.navigationHistory` and opens the new `goal-create` view.

### Dedicated Create Goal page

`renderGoalCreatePage()` contains the original goal creation fields:

- Goal name and description
- Target amount and unit
- Target date and frequency
- Optional reminder time
- Category

The page has **Cancel** and **Save goal** buttons. Cancel and the page Back button return to Goal & Achievements without creating a record. On successful save, the new goal is persisted through the existing `saveGoalAchievements()` function, its reminder is synchronized through `syncGoalReminder()`, and the app returns to the overview.

The existing create form identifier (`data-form="goal-achievement"`) is retained, so its current validation and creation path are reused. New goals still initialize progress, logs, XP and streak values exactly as before.

### Dedicated Edit Goal page

`renderGoalEditPage()` remains a separate `goal-edit` view. It pre-populates the selected goal and offers **Cancel** and **Save Changes**.

The Edit action stores the selected ID in `state.goalAchievementEditingId`, pushes the overview onto navigation history and opens `goal-edit`. Cancel and Back return to the overview.

### Data-safe editing

The edit save path updates the existing goal array entry using the previous object as its base:

```js
const updatedGoal = { ...previous, ...editableFields };
```

Only editable fields are changed. ID, current progress, logs, XP, current/best streaks, creation date, achievement history and other metadata stay on the previous object. Editing does not create a duplicate goal. The existing reminder synchronization is called after a successful save.

### Existing behavior retained

The patch leaves progress logging, XP awards, streak calculation, delete handling, persistence mechanism, reminder implementation, backend/API, database, authentication, offline synchronization and unrelated pages unchanged.

## Build on Windows

Run from your project root:

```powershell
node --check .\app.js
node .\scripts\build-web.js
npx cap sync android
```

Only continue to Android compilation if the web build succeeds:

```powershell
cd .\android
.\gradlew.bat assembleDebug
```

`web-app.js` is not included because no rebuilt bundle was produced as part of this patch. Rebuild it locally with your project's own esbuild dependency using the command above.

## Verification performed for this patch

- `node --check app.js` — performed after adding the `goal-create` view.
- Static source checks — performed to confirm the overview contains no create form, the separate create renderer exists, create navigation and return actions exist, and the original edit/progress form handlers remain present.
- Full browser/mobile interaction tests, native reminder delivery, refresh persistence and Android APK runtime tests — not performed here. Please test these in your project after rebuilding.

No `server.js`, backend API, database schema, authentication, offline-sync module, or unrelated page was modified. No GitHub push was performed.
