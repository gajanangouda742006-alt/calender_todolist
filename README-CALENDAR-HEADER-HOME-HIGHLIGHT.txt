DaySync Calendar Header + Home Selected-Date Highlight

Files changed:
- pages/calendar.js
- style.css

Changes:
1. Calendar page header now uses the same DaySync branded gradient header as Home, including logo and DAILY PLANNER label.
2. Calendar back and Today controls remain available in the branded header.
3. Home page mini-calendar selected date now has a strong blue fill, white date text, and clear border/shadow in both dark and light themes.
4. Selected-date indicators remain visible.

Install:
1. Back up your current files.
2. Extract this ZIP into P:\MyProjects\calender_todolist, preserving folder structure, and overwrite the two files.
3. In PowerShell:
   cd P:\MyProjects\calender_todolist
   node --check pages\calendar.js
   node scripts\build-web.js
4. Restart DaySync and hard-refresh Chrome with Ctrl+Shift+R.

Note: The build script should be run in the project environment where its dependencies are installed. No database or user data files are changed.
