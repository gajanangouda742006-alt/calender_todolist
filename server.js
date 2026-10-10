require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { connectMongo } = require('./backend/config/mongo');
const { User, Event, Task, Mood, Habit, Goal, Transaction } = require('./backend/models');
const { seedData } = require('./backend/data/seedData');
const { verifyToken } = require('./backend/middleware/auth');
const authRoutes = require('./backend/routes/auth');
const dashboardRoutes = require('./backend/routes/dashboard');



const app = express();
const preferredPorts = [Number(process.env.PORT) || 9090, 9091, 9200, 9300, 9400];

const allowedOrigins = new Set([
  'capacitor://localhost',
  'http://localhost',
  'https://localhost',
  ...(process.env.CORS_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean),
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api', dashboardRoutes);

app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(__dirname));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/api/health', async (req, res) => {
  const mongoStatus = await connectMongo();

  return res.status(mongoStatus ? 200 : 503).json({
    status: mongoStatus ? 'ok' : 'unavailable',
    database: {
      mysql: 'not used',
      mongo: mongoStatus ? 'connected' : 'not connected',
    },
  });
});



async function seedMongoDatabase() {
  const shouldSeed = String(process.env.SEED_DEMO_DATA || '').toLowerCase() === 'true';

  if (!shouldSeed) {
    console.log('Demo seeding disabled. New users will start empty.');
    return;
  }

  const existingUser = await User.findOne({ email: seedData.user.email });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(seedData.user.password, 10);
    const user = await User.create({
      name: seedData.user.name,
      email: seedData.user.email,
      passwordHash,
      profile: seedData.user.profile,
      preferences: seedData.user.preferences,
    });

    const userId = user._id;

    await Event.insertMany(seedData.events.map((item) => ({ ...item, userId })));
    await Task.insertMany(seedData.tasks.map((item) => ({ ...item, userId })));
    await Mood.insertMany(seedData.moods.map((item) => ({ ...item, userId })));
    await Habit.insertMany(seedData.habits.map((item) => ({ ...item, userId })));
    await Goal.insertMany(seedData.goals.map((item) => ({ ...item, userId })));

    console.log('Seed data inserted into MongoDB because SEED_DEMO_DATA=true.');
  } else {
    console.log('Seed data already exists in MongoDB.');
  }
}



async function startServer(portIndex = 0) {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || Buffer.byteLength(process.env.JWT_SECRET, 'utf8') < 32) {
      throw new Error('JWT_SECRET must contain at least 32 bytes in production.');
    }
    if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
      throw new Error('MONGODB_URI or MONGO_URI must be configured in production.');
    }
    if (String(process.env.SEED_DEMO_DATA || '').toLowerCase() === 'true') {
      throw new Error('SEED_DEMO_DATA must be disabled in production.');
    }
  }

  const mongoConnected = await connectMongo();
  if (!mongoConnected) {
    throw new Error('MongoDB is unavailable; refusing to start the API server.');
  }
  await seedMongoDatabase();

  const port = preferredPorts[portIndex];

  const server = app.listen(port, () => {
    console.log(`Sahra server running on http://localhost:${port}`);
    console.log('Open /login to access the auth flow.');
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && portIndex < preferredPorts.length - 1) {
      console.warn(`Port ${port} is busy. Retrying on http://localhost:${preferredPorts[portIndex + 1]}...`);
      startServer(portIndex + 1).catch((startError) => {
        console.error('Server failed to start:', startError.message);
        process.exit(1);
      });
      return;
    }

    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

app.get('/api/finance', verifyToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1, createdAt: -1 });
    return res.json(
      transactions.map((transaction) => ({
        ...transaction.toObject(),
        id: transaction._id.toString(),
      }))
    );
  } catch (error) {
    console.error('Finance fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.post('/api/finance', verifyToken, async (req, res) => {
  try {
    const { type, amount, category = 'General', note = '', date, paymentMethod = 'Cash' } = req.body;
    const numericAmount = Number(amount);

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Transaction type must be income or expense' });
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    if (!date) {
      return res.status(400).json({ message: 'Transaction date is required' });
    }

    const cleanPaymentMethod = ['UPI', 'Bank', 'Card', 'Cash'].includes(paymentMethod)
      ? paymentMethod
      : 'Cash';

    const newTransaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount: numericAmount,
      category: String(category).trim() || 'General',
      note: String(note).trim(),
      paymentMethod: cleanPaymentMethod,
      date,
    });

    return res.status(201).json({
      message: 'Transaction created',
      transaction: {
        ...newTransaction.toObject(),
        id: newTransaction._id.toString(),
      },
    });
  } catch (error) {
    console.error('Finance save error:', error);
    return res.status(500).json({ error: 'Failed to save transaction' });
  }
});

startServer().catch((error) => {
  console.error('Server startup failed:', error.message);
  process.exit(1);
});
