SAHRA LIFE CALENDAR — MOBILE UI POLISH PATCH

This is a patch ZIP containing changed files, not a full copy of the project.

Changes included:
- Shorter page headers to give content more vertical space.
- More balanced Menu page spacing and wider feature option panel.
- Appearance setting changed from separate Light/Dark items to one toggle.
- Notification setting styled as a consistent toggle switch.
- Input forms use a wider 90%-width modal and remain scrollable when the mobile keyboard is open.
- Focused controls are automatically brought into view.
- Bottom navigation hides when scrolling down and reappears when scrolling up.
- Bottom navigation hides while typing so it doesn't cover form controls.
- Page navigation starts at the top; routine re-renders preserve the current scroll position.
- Service worker cache version bumped so updated web assets are fetched.

HOW TO APPLY:
1. Back up your current project folder.
2. Extract this ZIP into the root of P:\MyProjects\calender_todolist.
3. Choose “Replace the files in the destination” when prompted.
4. Run `git status --short` to inspect changed files.
5. Commit and push the listed changes, then wait for Render deployment.

The source file app.js and browser bundle web-app.js are both included. The web bundle was patched and syntax-checked. If you rebuild it locally later, use the project build-web script on your Windows machine so it can use the Windows esbuild binary.
