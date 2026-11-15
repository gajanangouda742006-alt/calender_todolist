DaySync focused patch — based on DaySync-Latest-Source.zip

Files:
- app.js
- style.css
- calendar.js
- mobile-notifications.js

Changes:
- Calendar header is sticky; Today button has a blue 3D treatment.
- Selected calendar day has a stronger blue highlight.
- Light-mode Calendar event heading/count are purple; task heading/count are green; card text is dark and readable.
- Dashboard To-Do progress now derives from the current monthly task records instead of potentially stale cached progress API values.
- Alarm Clock notification channel requests the bundled daysync_alarm.wav sound. Focus Timer already uses that sound channel in the uploaded source.
- Existing alarm deletion confirmation remains unchanged if no app-level confirmation helper exists.

Important:
- The source bundle has no native full-screen alarm Activity/receiver or boot-reschedule receiver. This patch does not claim that a notification is a guaranteed full-screen alarm.
- Android can deliver scheduled notifications while the app is closed/screen is off subject to permissions, battery policy and notification channel settings. If the device is powered OFF, apps cannot play an alarm. iOS also does not permit arbitrary continuous background alarm playback; local notification sound is subject to iOS notification rules.
- Android notification channels are effectively immutable after creation. To change the sound of an already-created channel, the user may need to change it in Android notification settings or uninstall/reinstall for a clean test.
- Alarm reset category is not added in this patch because the existing reset executor in the supplied source needs a coordinated storage-clear flow; no destructive reset behavior was guessed.
