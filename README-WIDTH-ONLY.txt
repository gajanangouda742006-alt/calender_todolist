SAHRA HOME-MATCHED PAGE WIDTH PATCH (WIDTH ONLY)

What this changes
- Uses the Home screen as the width reference (450px maximum page width).
- Applies the same horizontal gutter to the other page roots so their cards align with Home.
- Mirrors the Home screen's 9px gutter on very narrow screens (360px and below).

What this does NOT change
- No JavaScript, HTML, app features, theme colors, typography, saved data, or task records are changed.
- Only the shared stylesheet is replaced; the added CSS rules override conflicting earlier width rules.

Install
1. Make a backup of P:\MyProjects\calender_todolist\style.css.
2. Copy this ZIP's style.css into P:\MyProjects\calender_todolist\style.css, replacing the old stylesheet.
3. Hard-refresh the local app with Ctrl+Shift+R.
4. If the installed PWA still shows old widths, close the app/browser tab and reopen it, then hard-refresh again.

Optional validation from PowerShell:
  cd P:\MyProjects\calender_todolist
  node scripts\build-web.js

No JS rebuild is required for CSS itself, but running the build command is safe. This patch is based on the uploaded style(5).css file.
