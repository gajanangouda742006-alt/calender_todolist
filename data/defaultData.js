const STORAGE_KEY = 'sahra-life-calendar-v1';

export const seedData = {
  events: [
    { id: 1, title: 'Mathematics', date: '2026-09-19', startTime: '19:00', endTime: '20:30', location: 'College', category: 'Study', reminder: '30 min' },
    { id: 2, title: 'Project Work', date: '2026-09-19', startTime: '21:00', endTime: '22:00', location: 'Home', category: 'Project', reminder: '15 min' },
    { id: 3, title: 'DBMS Exam', date: '2026-09-30', startTime: '10:00', endTime: '11:30', location: 'Exam Hall', category: 'Study', reminder: '1 day' },
  ],
  tasks: [
    { id: 1, title: 'Complete assignment', date: '2026-09-19', priority: 'Normal', status: 'Completed' },
    { id: 2, title: 'Revise chapter 3', date: '2026-09-19', priority: 'High', status: 'Pending' },
    { id: 3, title: 'Submit project report', date: '2026-09-19', priority: 'High', status: 'Pending' },
    { id: 4, title: 'Call home', date: '2026-09-20', priority: 'Low', status: 'Pending' },
  ],
  moods: [
    { id: 1, date: '2026-09-14', mood: '😊', energy: 80, note: 'Productive and relaxed.' },
    { id: 2, date: '2026-09-15', mood: '🔥', energy: 92, note: 'Very motivated.' },
    { id: 3, date: '2026-09-16', mood: '😐', energy: 72, note: 'Moderate focus.' },
    { id: 4, date: '2026-09-17', mood: '😴', energy: 50, note: 'Needed a break.' },
    { id: 5, date: '2026-09-18', mood: '😍', energy: 88, note: 'Had a great day.' },
    { id: 6, date: '2026-09-19', mood: '😊', energy: 84, note: 'Feeling stable and focused.' },
  ],
  habits: [
    { id: 1, name: 'Study 2 hours', goal: 2, progress: 2, frequency: 'Daily' },
    { id: 2, name: 'Exercise', goal: 1, progress: 1, frequency: 'Daily' },
    { id: 3, name: 'Drink water', goal: 8, progress: 7, frequency: 'Daily' },
    { id: 4, name: 'Read 10 pages', goal: 1, progress: 0, frequency: 'Daily' },
  ],
  goals: [
    { id: 1, title: 'Study 2 hours daily', progress: 72, duration: '30 days', current: 18, target: 30 },
    { id: 2, title: 'Build better version of myself', progress: 58, duration: '50 days', current: 29, target: 50 },
  ],
  countdowns: [
    { id: 1, title: 'DBMS Exam', daysLeft: 12, date: '2026-09-30' },
    { id: 2, title: 'Project Deadline', daysLeft: 5, date: '2026-09-24' },
    { id: 3, title: 'Birthday', daysLeft: 43, date: '2026-10-31' },
  ],
  journal: [
    { id: 1, date: '2026-09-19', content: 'Today I completed my DBMS work and practiced Java.', mood: '🔥', energy: 84 },
  ]
};

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      return structuredClone(seedData);
    }
    return { ...structuredClone(seedData), ...JSON.parse(raw) };
  } catch (error) {
    console.warn('Using seed data because localStorage could not be read:', error);
    return structuredClone(seedData);
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
