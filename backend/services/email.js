const nodemailer = require('nodemailer');

let transporter;

function getEmailConfiguration() {
  const host = String(process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || '');
  const from = String(process.env.EMAIL_FROM || '').trim();

  if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !user || !pass || !from) {
    const error = new Error('Email delivery is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM on the server.');
    error.statusCode = 503;
    error.code = 'EMAIL_NOT_CONFIGURED';
    throw error;
  }

  return {
    host,
    port,
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465,
    auth: { user, pass },
    from,
  };
}

function getTransporter(configuration) {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: configuration.host,
      port: configuration.port,
      secure: configuration.secure,
      auth: configuration.auth,
      connectionTimeout: 12_000,
      greetingTimeout: 12_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function sendOneTimeCode({ to, code, purpose }) {
  const configuration = getEmailConfiguration();
  const isPasswordReset = purpose === 'password-reset';
  const heading = isPasswordReset ? 'Reset your Sahra password' : 'Verify your Sahra email';
  const action = isPasswordReset ? 'reset your password' : 'verify your email address';

  try {
    const info = await getTransporter(configuration).sendMail({
      from: configuration.from,
      to,
      subject: `${heading} — Sahra Life Calendar`,
      text: `Your Sahra verification code is ${code}. Use it to ${action}. It expires in 10 minutes. If you did not request this, you can safely ignore this email.`,
      html: `<p>Your Sahra verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${escapeHtml(code)}</p><p>Use it to ${escapeHtml(action)}. It expires in 10 minutes.</p><p>If you did not request this, you can safely ignore this email.</p>`,
    });

    if (!Array.isArray(info.accepted) || !info.accepted.length) {
      const error = new Error('The email provider did not accept the verification message.');
      error.statusCode = 502;
      error.code = 'EMAIL_REJECTED';
      throw error;
    }
  } catch (cause) {
    if (cause.statusCode) throw cause;
    // Do not log recipient addresses, credentials, or one-time codes.
    console.error('Email delivery request failed:', cause.message);
    const error = new Error('Unable to send the verification email. Please try again later.');
    error.statusCode = 502;
    error.code = 'EMAIL_DELIVERY_FAILED';
    throw error;
  }
}

module.exports = { sendOneTimeCode, getEmailConfiguration };
