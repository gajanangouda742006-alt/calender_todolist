const crypto = require('node:crypto');
const { MutationReceipt } = require('../models');

async function idempotencyMiddleware(req, res, next) {
  const key = String(req.get('Idempotency-Key') || '').trim();
  if (!key || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) return next();
  if (key.length > 200) return res.status(400).json({ message: 'Idempotency-Key is too long.' });
  if (!req.user?.id) return res.status(401).json({ message: 'Access token missing' });

  const requestHash = crypto.createHash('sha256').update(JSON.stringify({ method: req.method, path: req.originalUrl, body: req.body || {} })).digest('hex');
  try {
    const prior = await MutationReceipt.findOne({ userId: req.user.id, key });
    if (prior && prior.requestHash !== requestHash) return res.status(409).json({ message: 'Idempotency-Key was already used for a different request.' });
    if (prior?.completed) return res.status(prior.statusCode).json(prior.responseBody);
    if (prior && !prior.completed) return res.status(409).json({ message: 'This operation is still being processed. Retry shortly.' });

    let receipt;
    try {
      receipt = await MutationReceipt.create({ userId: req.user.id, key, requestHash, completed: false });
    } catch (error) {
      if (error?.code !== 11000) throw error;
      const duplicate = await MutationReceipt.findOne({ userId: req.user.id, key });
      if (duplicate && duplicate.requestHash !== requestHash) return res.status(409).json({ message: 'Idempotency-Key was already used for a different request.' });
      if (duplicate?.completed) return res.status(duplicate.statusCode).json(duplicate.responseBody);
      return res.status(409).json({ message: 'This operation is still being processed. Retry shortly.' });
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      const statusCode = res.statusCode;
      void MutationReceipt.updateOne(
        { _id: receipt._id, userId: req.user.id },
        { $set: { statusCode, responseBody: body, completed: true } }
      ).then(() => originalJson(body)).catch((error) => {
        console.error('Could not save idempotency receipt:', error.message);
        originalJson(body);
      });
      return res;
    };
    return next();
  } catch (error) {
    console.error('Idempotency middleware failed:', error.message);
    return res.status(503).json({ message: 'Unable to verify operation receipt; retry when connected.' });
  }
}

module.exports = { idempotencyMiddleware };
