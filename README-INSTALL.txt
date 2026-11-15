DaySync Alarm Clock patch (based on uploaded source ZIP)

Files: app.js and style.css. Replace the matching root files in your project.

Then run from P:\MyProjects\calender_todolist:
  npm run mobile:stage
  npx cap sync android
  cd android
  .\gradlew.bat assembleDebug

This patch adds a separate Alarm Clock page, menu item immediately above Progress & Stats, local alarm storage, daily-repeat scheduling for the next 14 days through the existing Capacitor Local Notifications plugin, and delete/cancel controls. It is separate from Focus Timer.

IMPORTANT LIMITATION: this is NOT a native full-screen Android alarm implementation. Android may show a heads-up notification depending on device settings and Android policy. A native AlarmManager + BroadcastReceiver + full-screen Activity, boot rescheduling, ringtone playback and permission handling still need to be implemented and tested in Android Studio before claiming incoming-call-style full-screen alarms. Browser/web builds save alarms locally but cannot guarantee background delivery.

The patch uses the existing daysync-clock-alarm channel. Notification IDs are based on the alarm timestamp; do not create alarms within the same millisecond (normal UI use avoids this).
