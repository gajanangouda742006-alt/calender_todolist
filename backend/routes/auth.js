const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/jwt');
const { rateLimit } = require('express-rate-limit');
const { verifyToken } = require('../middleware/auth');
const { User } = require('../models');

const router = express.Router();

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ message: 'Too many attempts. Please wait a few minutes and try again.' }),
});

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
    emailVerified: true,
  };
}

router.post('/register', authRateLimit, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const normalizedEmail = normalizeEmail(email);

    if (!cleanName || !normalizedEmail || !validatePassword(password)) {
      return res.status(400).json({ message: 'Enter a name, a valid email address, and a password of 8 to 72 bytes.' });
    }
    if (cleanName.length > 100 || !hasValidEmailShape(normalizedEmail)) {
      return res.status(400).json({ message: 'Enter a valid name and email address.' });
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
      profile: {},
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

    return res.status(200).json({ message: 'Login successful.', token: generateToken(user), user: publicUser(user) });
  } catch (error) {
    console.error('Login failed:', error.message);
    return res.status(500).json({ message: 'Login could not be completed.' });
  }
});

router.post('/password/change', verifyToken, authRateLimit, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!validatePassword(newPassword) || typeof currentPassword !== 'string' || !currentPassword) {
      return res.status(400).json({ message: 'Enter your current password and a new password of 8 to 72 bytes.' });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'User not found.' });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(400).json({ message: 'Your current password is incorrect.', code: 'CURRENT_PASSWORD_INVALID' });
    }
    if (currentPassword === newPassword) {
      return res.status(400).json({ message: 'Choose a new password different from your current password.' });
    }
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    await user.save();
    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Password change failed:', error.message);
    return res.status(500).json({ message: 'Unable to change the password.' });
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
