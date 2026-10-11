const crypto = require('node:crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');
const { rateLimit } = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth');
const { User } = require('../models');
const { sendOneTimeCode, getEmailConfiguration } = require('../services/email');

const router = express.Router();
const OTP_TTL_MS = Math.min(Math.max(Number(process.env.OTP_TTL_MINUTES || 10), 5), 30) * 60 * 1000;
const RESEND_COOLDOWN_MS = Math.min(Math.max(Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60), 30), 600) * 1000;
const SEND_WINDOW_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_WINDOW = 5;
const MAX_CODE_ATTEMPTS = 5;

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ message: 'Too many attempts. Please wait a few minutes and try again.' }),
});

const codeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ message: 'Too many code requests. Please wait before requesting another code.' }),
});

function isDateKey(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function hasValidEmailShape(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && Buffer.byteLength(password, 'utf8') <= 72;
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, emailVerified: true },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    emailVerified: Boolean(user.emailVerified),
  };
}

function codeDigest(userId, purpose, code) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || 'sahra-development-otp-secret-not-for-production';
  return crypto
    .createHmac('sha256', secret)
    .update(`${userId}:${purpose}:${code}`)
    .digest('hex');
}

function statusError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

async function issueCode(user, purpose) {
  const key = 'passwordReset';
  const now = new Date();
  const existing = user[key] || {};
  const resendAvailableAt = existing.resendAvailableAt ? new Date(existing.resendAvailableAt) : null;

  if (resendAvailableAt && resendAvailableAt > now) {
    const retryAfterSeconds = Math.ceil((resendAvailableAt.getTime() - now.getTime()) / 1000);
    throw statusError(`Please wait ${retryAfterSeconds} seconds before requesting another code.`, 429, 'RESEND_COOLDOWN');
  }

  const currentWindowStartedAt = existing.windowStartedAt ? new Date(existing.windowStartedAt) : null;
  const withinWindow = currentWindowStartedAt && now.getTime() - currentWindowStartedAt.getTime() < SEND_WINDOW_MS;
  const sendsInWindow = withinWindow ? Number(existing.sendsInWindow || 0) : 0;
  if (sendsInWindow >= MAX_SENDS_PER_WINDOW) {
    throw statusError('Too many password reset emails were requested. Please try again in an hour.', 429, 'SEND_LIMIT');
  }

  const code = crypto.randomInt(100000, 1_000_000).toString();
  const nextState = {
    codeHash: codeDigest(user._id.toString(), purpose, code),
    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
    attempts: 0,
    lastSentAt: now,
    resendAvailableAt: new Date(now.getTime() + RESEND_COOLDOWN_MS),
    windowStartedAt: withinWindow ? currentWindowStartedAt : now,
    sendsInWindow: sendsInWindow + 1,
  };

  user.set(key, nextState);
  await user.save();

  try {
    await sendOneTimeCode({
      to: user.email,
      code,
      purpose,
      expiresInMinutes: Math.ceil(OTP_TTL_MS / 60_000),
    });
  } catch (error) {
    // The code was never accepted by the provider, so invalidate it and let
    // the user retry rather than claiming delivery or trapping the account.
    user.set(key, {
      ...nextState,
      codeHash: null,
      expiresAt: null,
      attempts: 0,
      lastSentAt: null,
      resendAvailableAt: null,
    });
    await user.save();
    throw error;
  }

  return {
    expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
    resendInSeconds: Math.floor(RESEND_COOLDOWN_MS / 1000),
  };
}

async function verifyCode(user, purpose, suppliedCode) {
  const key = 'passwordReset';
  const current = user[key] || {};
  const now = new Date();
  const code = typeof suppliedCode === 'string' ? suppliedCode.trim() : '';
  const invalid = () => statusError('The password reset code is invalid or has expired.', 400, 'INVALID_CODE');

  if (!/^\d{6}$/.test(code) || !current.codeHash || !current.expiresAt || new Date(current.expiresAt) <= now) {
    throw invalid();
  }

  if (Number(current.attempts || 0) >= MAX_CODE_ATTEMPTS) {
    user.set(key, { ...current, codeHash: null, expiresAt: null });
    await user.save();
    throw invalid();
  }

  const expected = Buffer.from(current.codeHash, 'hex');
  const actual = Buffer.from(codeDigest(user._id.toString(), purpose, code), 'hex');
  const matches = expected.length === actual.length && crypto.timingSafeEqual(expected, actual);

  if (!matches) {
    const attempts = Number(current.attempts || 0) + 1;
    user.set(key, {
      ...current,
      attempts,
      ...(attempts >= MAX_CODE_ATTEMPTS ? { codeHash: null, expiresAt: null } : {}),
    });
    await user.save();
    throw invalid();
  }

  user.set(key, {
    ...current,
    codeHash: null,
    expiresAt: null,
    attempts: 0,
    resendAvailableAt: null,
  });
  return user;
}

router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { name, email, password, dateOfBirth } = req.body;
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = normalizeEmail(email);

    if (!cleanName || !normalizedEmail || !validatePassword(password)) {
      return res.status(400).json({ message: 'Enter a name, a valid email address, and a password of 8 to 72 bytes.' });
    }
    if (cleanName.length > 100 || !hasValidEmailShape(normalizedEmail)) {
      return res.status(400).json({ message: 'Enter a valid name and email address.' });
    }
    if (dateOfBirth && !isDateKey(dateOfBirth)) {
      return res.status(400).json({ message: 'Date of birth is invalid.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account already exists for this email address.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: cleanName,
      email: normalizedEmail,
      passwordHash,
      emailVerified: true,
      profile: { dateOfBirth: dateOfBirth || null },
      preferences: { theme: 'light', goals: [], interests: [] },
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      token: generateToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'An account already exists for this email address.' });
    }
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message, code: error.code });
    console.error('Registration failed:', error.message);
    return res.status(500).json({ message: 'Registration could not be completed.' });
  }
});

router.post('/login', authRateLimit, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    if (!hasValidEmailShape(email) || typeof password !== 'string' || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if (!user.emailVerified) {
      user.emailVerified = true;
      await user.save();
    }

    return res.status(200).json({ message: 'Login successful.', token: generateToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ message: 'Login could not be completed.' });
  }
});

router.post('/password-reset/request', codeRateLimit, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!hasValidEmailShape(email)) return res.status(400).json({ message: 'Enter a valid email address.' });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'If an eligible account exists, a reset code has been sent.' });
    }

    getEmailConfiguration();
    const timing = await issueCode(user, 'password-reset');
    return res.status(200).json({ message: 'Password reset code sent.', email: user.email, ...timing });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message, code: error.code });
    console.error('Password reset request failed:', error.message);
    return res.status(500).json({ message: 'Unable to send a password reset code.' });
  }
});

router.post('/password-reset/confirm', authRateLimit, async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { code, password } = req.body || {};
    if (!hasValidEmailShape(email) || !validatePassword(password)) {
      return res.status(400).json({ message: 'Enter a valid email address and a password of 8 to 72 bytes.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'The password reset code is invalid or has expired.' });
    await verifyCode(user, 'password-reset', code);
    user.passwordHash = await bcrypt.hash(password, 12);
    await user.save();
    return res.status(200).json({ message: 'Password updated. You can now sign in.' });
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ message: error.message, code: error.code });
    console.error('Password reset confirmation failed:', error.message);
    return res.status(500).json({ message: 'Unable to reset the password.' });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email emailVerified profile preferences createdAt');
    if (!user) return res.status(401).json({ message: 'User not found.' });
    return res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    console.error('Get user failed:', error.message);
    return res.status(500).json({ message: 'Could not load the account.' });
  }
});

module.exports = router;
