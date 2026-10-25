const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/sahra_calendar';
let connectionAttempt = null;

async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // Share an in-flight attempt so the startup retry loop and /api/health do not
  // start multiple concurrent mongoose.connect() operations.
  if (connectionAttempt) {
    return connectionAttempt;
  }

  connectionAttempt = mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })
    .then(() => {
      console.log('MongoDB connected successfully.');
      return true;
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error.name, error.message);
      return false;
    })
    .finally(() => {
      connectionAttempt = null;
    });

  return connectionAttempt;
}

module.exports = { connectMongo, mongoose };
