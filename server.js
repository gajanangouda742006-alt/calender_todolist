require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const { testConnection } = require('./backend/config/db');
const { connectMongo } = require('./backend/config/mongo');
const { User, Event, Task, Mood, Habit, Goal } = require('./backend/models');
const { seedData } = require('./backend/data/seedData');
const authRoutes = require('./backend/routes/auth');
const dashboardRoutes = require('./backend/routes/dashboard');

const app = express();
const preferredPorts = [Number(process.env.PORT) || 9090, 9091, 9200, 9300, 9400];

app.use(cors());
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

  return res.json({
    status: 'ok',
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
  await connectMongo();
  await seedMongoDatabase();

  const port = preferredPorts[portIndex];

  const server = app.listen(port, () => {
    console.log(`Sahra server running on http://localhost:${port}`);
    console.log('Open /login to access the auth flow.');
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && portIndex < preferredPorts.length - 1) {
      console.warn(`Port ${port} is busy. Retrying on http://localhost:${preferredPorts[portIndex + 1]}...`);
      startServer(portIndex + 1);
      return;
    }

    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

startServer();
