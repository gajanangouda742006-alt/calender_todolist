DaySync Calendar header fix

Replace frontend/app.js with the included file.

This change prevents applySharedPageBackButton() from injecting the extra generic button with data-action=shared-page-back on the Calendar page. It keeps the existing calendar-simple-back button and adds sticky positioning for calendar-simple-header so it remains visible while the calendar content scrolls.

Then rebuild the web bundle from your project root using your existing build command (for example: node scripts/build-web.js), restart the app, and hard refresh Chrome (Ctrl+Shift+R).

Only frontend/app.js is included. No calendar content, saved data, or other pages are changed.
