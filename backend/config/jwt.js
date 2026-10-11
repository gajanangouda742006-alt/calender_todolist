function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
      throw new Error('JWT_SECRET must contain at least 32 bytes in production.');
    }
    return secret;
  }
  // Development-only fallback. Production startup explicitly rejects fallback use.
  return secret || 'sahra-development-secret-not-for-production';
}

module.exports = { getJwtSecret };
