DaySync Calendar UI Fix

Included:
- pages/calendar.js
- style.css

Changes:
1. Replaced the branded Calendar header with one compact blue navigation bar.
2. Back is at the left and Today is at the right.
3. Header is sticky at the top with a small top gap and stays above scrolling content.
4. Mood picker is a tidy two-column grid for all seven emoji options.
5. Mood button shows the selected emoji and its mood name.
6. Standardized event (cyan), task (purple), and mood (yellow) indicator colors for calendar-day markup and common Home mini-calendar indicator classes.

Install:
1. Back up your current pages/calendar.js and style.css.
2. Extract this ZIP into P:\MyProjects\calender_todolist, preserving folders and replacing the files.
3. Run:
   cd P:\MyProjects\calender_todolist
   node --check pages\calendar.js
   node scripts\build-web.js
4. Restart the server and hard refresh Chrome (Ctrl+Shift+R).

Note:
- The Home page HTML/JavaScript is not included in the uploaded source files. The CSS unifies the indicator colors where the Home mini-calendar uses the same indicator classes (mini-indicator/day-indicator with event/task/mood). If Home uses different markup classes, its rendering file will also be needed for a fully exact match.
- The header is sticky within the Calendar scroll container. If your app scrolls the outer viewport rather than the calendar content container, sticky keeps the header visible while the page scrolls.
