# DaySync Email OTP Authentication Patch

## Included files
- backend/routes/auth.js — signup verification, verified-only login, OTP resend/expiry/attempt handling, password reset, and authenticated password change.
- frontend/login.html — verification screen and resend controls, preserving the existing DaySync login design and native secure-storage flow.

## Apply
1. Back up your current project.
2. Extract this ZIP into P:\MyProjects\calender_todolist and allow these two files to be replaced.
3. Keep your existing backend/models/index.js; it already contains emailVerification and passwordReset OTP fields.
4. Configure SMTP values in the server's .env file. Do not put SMTP credentials in frontend files or commit .env.
5. Restart the Node server and test signup, email verification, login, forgot-password reset, and resend cooldown.

## Password change without OTP
For a signed-in user, the backend now supports POST /api/auth/password/change.
Send JSON: {"currentPassword":"current password","newPassword":"new password"}
Include the existing DaySync bearer token in the Authorization: Bearer <token> header. This direct password-change path does not use email OTP; it still checks the current password. Forgot-password recovery continues to require email OTP.

## Notes
- New registrations are created as unverified and receive a six-digit email verification code.
- Codes expire according to OTP_TTL_MINUTES (5–30 minutes; default 10), allow up to five verification attempts, and enforce the configured resend cooldown and hourly send limit.
- Existing accounts with emailVerified: true remain able to sign in.
- Email delivery requires valid SMTP configuration and a verified sender address.
- The uploaded source ZIP did not include backend/routes/dashboard.js or backend/data/seedData.js, which server.js imports. A full server startup/integration test could not be run from this limited source package.
