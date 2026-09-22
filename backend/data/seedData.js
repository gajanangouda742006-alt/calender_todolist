const seedData = {
  user: {
    name: 'Gajanan',
    email: 'gajanan@example.com',
    password: 'password123',
    profile: {
      dateOfBirth: '2000-01-15',
      gender: 'Male',
      location: 'Bengaluru',
    },
    preferences: {
      theme: 'dark',
      goals: ['Study', 'Fitness'],
      interests: ['Education', 'Personal Growth'],
    },
  },
  events: [
    {
      title: 'Mathematics',
      description: 'College mathematics lecture',
      date: '2026-09-19',
      startTime: '19:00',
      endTime: '20:30',
      category: 'Study',
      location: 'College',
      reminder: '30 min',
    },
    {
      title: 'Project Work',
      description: 'Work on Sahra app',
      date: '2026-09-19',
      startTime: '21:00',
      endTime: '22:00',
      category: 'Project',
      location: 'Home',
      reminder: '15 min',
    },
  ],
  tasks: [
    {
      title: 'Complete assignment',
      date: '2026-09-19',
      priority: 'Normal',
      status: 'Completed',
    },
    {
      title: 'Revise chapter 3',
      date: '2026-09-19',
      priority: 'High',
      status: 'Pending',
    },
  ],
  moods: [
    {
      date: '2026-09-19',
      mood: '😊',
      energy: 84,
      note: 'Feeling focused and productive.',
    },
  ],
  habits: [
    {
      name: 'Study 2 hours',
      progress: 2,
      goal: 2,
      frequency: 'Daily',
    },
  ],
  goals: [
    {
      title: 'Study 2 hours daily',
      progress: 72,
      duration: '30 days',
      current: 18,
      target: 30,
    },
  ],
};

module.exports = { seedData };
