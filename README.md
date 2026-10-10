# Sahra Life Calendar

Sahra is a vanilla JavaScript, HTML, and CSS personal calendar client served by an Express API. MongoDB/Mongoose stores user and calendar data. The existing navy/blue glassmorphism UI is shared with native Android and iOS shells through Capacitor; the web app remains usable independently.

## Requirements

- Node.js 22 or newer and npm.
- MongoDB running locally or a MongoDB deployment.
- Android Studio/Android SDK for Android builds.
- macOS, Xcode, and Apple signing configuration for iOS builds.

## Local setup

Install the lockfile-pinned dependencies:

```bash
npm ci
```

Create `.env` from `.env.example` only if you do not already have a local `.env`. Do not overwrite an existing environment file. At minimum, configure `MONGODB_URI` for the database and replace the example `JWT_SECRET` with a long, random value. `NODE_ENV=production` additionally requires a JWT secret of at least 32 bytes and an explicit `MONGODB_URI` or `MONGO_URI`.

The server currently uses MongoDB. The old MySQL configuration/schema files are legacy and are not part of the running API.

Start the app:

```bash
npm start
```

For development with Node's built-in file watcher:

```bash
npm run dev
```

Open the `/login` route at the URL printed by the server. The default preferred port is 9090; if it is occupied, the server tries its configured fallback ports. MongoDB must be available before the server starts. Check `/api/health` for server and database status.

## Configuration

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` or `MONGO_URI` | MongoDB connection string. |
| `JWT_SECRET` | Signing secret for seven-day access tokens; use a cryptographically random value and never commit it. |
| `PORT` | Preferred local HTTP port. |
| `NODE_ENV` | Set to `production` for production startup checks. |
| `CORS_ORIGINS` | Comma-separated exact browser origins allowed to call the API. Capacitor localhost origins are allowed by default. Add the deployed web origin when hosting the client separately. |
| `GEMINI_API_KEY` | Optional Google Gemini API key used only by the server-side assistant. Never put this key in client/mobile configuration. |
| `GEMINI_MODEL` | Optional Gemini model name; defaults to `gemini-2.5-flash`. |
| `AI_API_KEY` | Optional OpenAI-compatible provider key. When present, Sahra uses this provider before Gemini. Keep it server-side. |
| `AI_API_URL` / `AI_MODEL` | OpenAI-compatible chat-completions endpoint and model name for `AI_API_KEY`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` | Optional SMTP connection details for password-reset email. |
| `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` | Optional SMTP credentials and sender; needed only for email-based password resets. |
| `OTP_SECRET` | A separate random secret used to hash password-reset codes. |
| `OTP_TTL_MINUTES` / `OTP_RESEND_COOLDOWN_SECONDS` | Optional password-reset code lifetime and resend cooldown; bounded to safe server limits. |
| `ASSISTANT_ACTION_SECRET` | Optional separate signing secret for one-time Sahra action confirmations. |
| `SEED_DEMO_DATA` | Set to `true` only when intentionally seeding the development demo account. Defaults to disabled. |

Account creation and sign-in do not require email delivery or email verification. Registration creates the account and signs the user in immediately using the supplied email and password. SMTP is optional and is used only by password-reset codes. For SendGrid, create an API key with Mail Send access, verify a sender identity, and configure the server environment if you want email-based password resets:

```dotenv
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=<SendGrid API key>
EMAIL_FROM="Sahra Life Calendar <verified-sender@your-domain.example>"
```

Set `SMTP_PASS` and `EMAIL_FROM` in the hosting provider's secret/environment settings (or the ignored local `.env` file), then restart the server. Do not commit real credentials or paste them into chat. Without SMTP, signup and login still work normally; only password-reset email delivery is unavailable. Password-reset codes are hashed, expire after ten minutes by default, have a five-attempt limit, and are protected by resend and request rate limits.

The checked-in `.env.example` contains placeholders only. `.env` is ignored by Git.

## Mobile client staging and builds

The Capacitor web bundle contains only the browser client; it does not copy the Express server, `.env`, or credentials. Mobile builds require a publicly reachable HTTPS API origin. Do not use `localhost` as the API host for a real phone.

In PowerShell, set the deployed API origin and stage the static client:

```powershell
$env:SAHRA_API_BASE_URL = "https://api.your-domain.example"
npm run mobile:stage
```

The staging command rejects non-HTTPS URLs, credentials, paths, query strings, and fragments. It writes generated web assets to the ignored `www/` directory and refuses to replace an existing `www/` directory unless it contains the generator marker.

Add each native platform once:

```bash
npx cap add android
npx cap add ios
```

Then sync staged web and plugin assets after client changes:

```bash
npm run android:sync
npm run ios:sync
```

Android debug build on Windows after Android Studio/SDK setup:

```powershell
npx cap open android
cd android
.\gradlew.bat assembleDebug
```

iOS build on macOS after Xcode setup:

```bash
npx cap open ios
```

Select a simulator/device and configure signing/team settings in Xcode before archiving or distributing. Release identifiers, icons, splash assets, privacy disclosures, HTTPS hosting, store metadata, and signing credentials must be finalized before publishing. The current Capacitor identifier (`com.sahra.lifecalendar`) should be checked for availability and changed to the publisher's unique identifier before release.

The native shell uses Keychain/Android Keystore-backed secure storage for the auth token, applies status-bar and keyboard resizing configuration, handles Android back navigation through app overlays/views, and scopes safe-area styling to the native client. The web login continues to use browser local storage. iOS secure keychain values may survive app reinstall; account logout remains necessary on shared devices.

## Reminders and notifications

Native reminder scheduling uses Capacitor Local Notifications for tasks and events with an explicit reminder time. Scheduling depends on per-device OS notification permission and platform delivery policy; Android may use inexact timing if exact-alarm access is unavailable, and iOS/Android settings may suppress alerts. A registered notification is not proof that it was delivered or seen. Web reminders are best-effort foreground notifications and are not expected to fire when the browser/app is closed. Remote push notifications are not configured.

## Checks

```bash
npm audit
node --check app.js
node --check server.js
node --check backend/routes/auth.js
node --check backend/routes/dashboard.js
```

There is not yet a complete device-test suite in the repository. Browser/API smoke checks should use a dedicated test account and clean up that account and its records afterwards; never run tests against production user data.

Isolated smoke workflows are included for a local, already-running server. They create temporary accounts, exercise authenticated API and assistant actions, and remove their records in a `finally` cleanup path:

```bash
npm run test:smoke
npm run test:smoke:assistant
```

Explicit Sahra requests create routine tasks, events, notes, and INR transactions immediately. Event conflicts and missing details are surfaced instead of guessed; assistant retries reuse a request ID to avoid duplicate records. Deletion and task completion continue to require an explicit confirmation.

## Known release prerequisites

- Deploy the Express API and MongoDB with HTTPS, backups, monitoring, and production CORS origins.
- Supply `MONGODB_URI`, a random 32-byte-or-longer `JWT_SECRET`, and the deployed `SAHRA_API_BASE_URL` outside Git.
- Configure a production AI key if real AI responses are required; otherwise the assistant provider is unavailable.
- Configure `GEMINI_API_KEY` on the server to enable the Gemini-backed assistant. The key is not bundled into Capacitor assets. A local API key is not included.
- Configure and build Android on a host with Android Studio/SDK. This Windows environment does not have the Android SDK/ADB configured.
- Build and sign iOS on macOS with Xcode; Windows cannot compile or sign the iOS app.
- Implement and test scheduled native reminders before representing reminder data as a guaranteed notification.
