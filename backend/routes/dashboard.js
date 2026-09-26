const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  User,
  Event,
  Task,
  Mood,
  Habit,
  HabitLog,
  Goal,
  Reminder,
  Note,
  Asset,
  Transaction
} = require('../models');

const router = express.Router();

router.get('/dashboard', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [user, events, tasks, moods, habits, goals, reminders, assets, habitLogs] = await Promise.all([
      User.findById(userId).select('name email profile preferences createdAt'),
      Event.find({ userId }).sort({ date: 1, startTime: 1 }),
      Task.find({ userId }).sort({ date: 1, createdAt: -1 }),
      Mood.find({ userId }).sort({ date: 1, createdAt: -1 }),
      Habit.find({ userId }).sort({ createdAt: -1 }),
      Goal.find({ userId }).sort({ createdAt: -1 }),
      Reminder.find({ userId }).sort({ date: 1, time: 1 }),
      Asset.find({ userId }).sort({ createdAt: -1 }),
      HabitLog.find({ userId }).sort({ date: 1 }),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
      },
      data: {
        events: events.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
        tasks: tasks.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
        moods: moods.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
        habits: habits.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
        goals: goals.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
        reminders: reminders.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
        notes: assets.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
        assets: assets.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
        habitLogs: habitLogs.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
      },
    });
  } catch (error) {
    console.error('Dashboard fetch error:', error);
    return res.status(500).json({ message: 'Unable to load dashboard data' });
  }
});

module.exports = {
  User,
  Event,
  Task,
  Mood,
  Habit,
  HabitLog,
  Goal,
  Reminder,
  Note,
  Transaction,
};

router.get('/progress', verifyToken, async (req, res) => {
  try {
    const year = Number(req.query.year);
    const month = Number(req.query.month);

    if (!Number.isInteger(year) || year < 1970 || year > 3000 || !Number.isInteger(month) || month < 1 || month > 12) {
      return res.status(400).json({ message: 'A valid year and month are required.' });
    }

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
    const startInstant = new Date(year, month - 1, 1);
    const endInstant = new Date(year, month, 1);
    const userId = req.user.id;

    const [tasks, events, habitLogs, habits, goals] = await Promise.all([
      Task.find({ userId, date: { $gte: startDate, $lte: endDate } }).sort({ date: -1, updatedAt: -1 }),
      Event.find({ userId, date: { $gte: startDate, $lte: endDate } }).sort({ date: -1, startTime: -1, createdAt: -1 }),
      HabitLog.find({ userId, date: { $gte: startDate, $lte: endDate } }).sort({ date: -1, createdAt: -1 }),
      Habit.find({ userId }).select('name'),
      Goal.find({ userId, createdAt: { $gte: startInstant, $lt: endInstant } }).sort({ createdAt: -1 }),
    ]);

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const completedTasks = tasks.filter((task) => task.completed || task.status === 'Completed');
    const pendingTasks = tasks.filter((task) => !(task.completed || task.status === 'Completed'));
    const overdueTasks = pendingTasks.filter((task) => task.status === 'Overdue' || task.date < todayKey);
    const habitNames = new Map(habits.map((habit) => [habit._id.toString(), habit.name]));

    const activity = [
      ...tasks.map((task) => ({
        type: task.completed || task.status === 'Completed' ? 'task-complete' : 'task-pending',
        label: `${task.completed || task.status === 'Completed' ? 'Completed task' : 'Task'} “${task.title}”`,
        detail: task.completed || task.status === 'Completed' ? 'Task marked complete.' : `Scheduled for ${task.date}`,
        occurredAt: task.completedAt || task.updatedAt || task.createdAt,
      })),
      ...events.map((event) => ({
        type: 'event',
        label: `Event “${event.title}”`,
        detail: event.startTime ? `Scheduled at ${event.startTime}` : `Scheduled for ${event.date}`,
        occurredAt: event.createdAt,
      })),
      ...habitLogs.filter((log) => log.completed).map((log) => ({
        type: 'habit',
        label: `Completed habit “${habitNames.get(log.habitId.toString()) || 'Habit'}”`,
        detail: 'Habit progress recorded.',
        occurredAt: log.createdAt,
      })),
      ...goals.map((goal) => ({
        type: 'goal',
        label: `Added goal “${goal.title}”`,
        detail: 'Goal progress tracking started.',
        occurredAt: goal.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
      .slice(0, 20);

    return res.status(200).json({
      period: { year, month, startDate, endDate },
      stats: {
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        overdueTasks: overdueTasks.length,
        completionPercent: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
        events: events.length,
        completedHabits: habitLogs.filter((log) => log.completed).length,
        goals: goals.length,
      },
      activity,
    });
  } catch (error) {
    console.error('Progress fetch error:', error);
    return res.status(500).json({ message: 'Unable to load progress data' });
  }
});

function normalizeEventPayload(body) {
  const { title, description = '', date, startTime = null, endTime = null, category = 'General', location = '', reminder = '' } = body;
  return {
    title: typeof title === 'string' ? title.trim() : '',
    description: typeof description === 'string' ? description.trim() : '',
    date,
    startTime,
    endTime,
    category: typeof category === 'string' && category.trim() ? category.trim() : 'General',
    location: typeof location === 'string' ? location.trim() : '',
    reminder: typeof reminder === 'string' ? reminder.trim() : '',
  };
}

function isDateKey(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

function isTimeValue(value) {
  return value === null || value === undefined || value === '' || (typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
}

function serialize(item) {
  return { ...item.toObject(), id: item._id.toString() };
}

function isPastLocalDate(dateString) {
  if (!dateString) return false;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${dateString}T00:00:00`);
    return Number.isNaN(target.getTime()) ? false : target < today;
  } catch (error) {
    return false;
  }
}

function validateEventDate(dateString, allowToday = true) {
  if (!dateString) {
    return 'Event date is required.';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(target.getTime())) {
    return 'Event date is invalid.';
  }

  const isPast = target < today;
  if (isPast) {
    return 'Events cannot be created for past dates.';
  }

  if (!allowToday && target.getTime() === today.getTime()) {
    return 'Please select a future date.';
  }

  return null;
}

function validateEventPayload(payload) {
  if (!payload.title || !payload.date) return 'Event title and date are required';
  if (!isDateKey(payload.date)) return 'Event date is invalid.';
  if (!isTimeValue(payload.startTime) || !isTimeValue(payload.endTime)) return 'Event time is invalid.';
  if (payload.startTime && payload.endTime && payload.endTime <= payload.startTime) return 'Event end time must be after the start time.';
  return validateEventDate(payload.date);
}

function normalizeTaskPayload(body = {}) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const description = typeof body.description === 'string' ? body.description.trim() : '';
  const date = body.date || new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 10);
  const time = body.time || null;
  const priority = ['Low', 'Normal', 'High'].includes(body.priority) ? body.priority : 'Normal';
  const completed = Boolean(body.completed);
  const status = completed ? 'Completed' : (['Pending', 'In Progress', 'Overdue'].includes(body.status) ? body.status : 'Pending');
  const reminder = typeof body.reminder === 'string' ? body.reminder : '';
  const category = typeof body.category === 'string' && body.category.trim() ? body.category.trim() : 'General';

  return {
    title,
    description,
    date,
    time,
    priority,
    completed,
    status,
    reminder,
    category,
    updatedAt: new Date(),
  };
}

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name email profile preferences createdAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load profile' });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, dateOfBirth } = req.body;
    const update = {};

    if (name !== undefined) {
      const nextName = String(name).trim();
      if (!nextName || nextName.length > 100) {
        return res.status(400).json({ message: 'Please provide a name up to 100 characters.' });
      }
      update.name = nextName;
    }

    if (dateOfBirth !== undefined) {
      update['profile.dateOfBirth'] = dateOfBirth || null;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: update },
      { new: true }
    ).select('name email profile preferences');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return res.status(500).json({ message: 'Unable to update profile' });
  }
});

router.put('/profile/theme', verifyToken, async (req, res) => {
  try {
    const theme = req.body?.theme === 'light' ? 'light' : 'dark';
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { 'preferences.theme': theme } },
      { new: true }
    ).select('name email profile preferences');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      message: 'Theme updated',
      theme,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error('Theme update error:', error);
    return res.status(500).json({ message: 'Unable to update theme preference' });
  }
});

function formatFriendlyDate(dateString) {
  if (!dateString) return 'today';

  try {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (error) {
    return dateString;
  }
}

function parseTime(value) {
  if (!value) return null;
  const match = String(value).toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const period = match[3];

  if (period === 'pm' && hours < 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function buildLocalDate(offsetDays = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function extractTitleFromMessage(message) {
  const match = String(message).match(/(?:add|create|schedule|remind|plan|set)\s+(?:a\s+)?(?:task|event)\s+(?:called\s+)?(.+?)(?:\s+for\s+|\s+at\s+|\s+tomorrow|\s+today|$)/i);
  if (match && match[1]) return match[1].trim().replace(/[.?!]+$/, '');

  const general = String(message).replace(/^(add|create|remind|schedule|plan|set)\s+/i, '').trim();
  return general.split(/\s+(?:for|at|tomorrow|today|on)\b/i)[0]?.trim() || 'Untitled';
}

async function callAIProvider(message) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'You are Sahra, a helpful personal assistant. Reply with compact JSON only: {"action":"respond|createTask|createEvent|completeTask|deleteTask|getTasks|getEvents|getProgress|getMood|getProfile","message":"...","title":"...","date":"YYYY-MM-DD","time":"HH:MM","status":"Completed|Pending"}. Use only the allowed actions and never invent data. If unsure, set action to respond and give a helpful fallback message.'
          },
          { role: 'user', content: message },
        ],
      }),
    });

    if (!response.ok) return null;

    const payload = await response.json();
    const raw = payload.choices?.[0]?.message?.content;
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (error) {
      const trimmed = raw.replace(/```json|```/g, '').trim();
      return JSON.parse(trimmed);
    }
  } catch (error) {
    console.warn('AI provider call failed:', error.message);
    return null;
  }
}

function toDateKey(dateValue) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(dateValue);

  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (!year || !month || !day) {
    return dateValue.toISOString().slice(0, 10);
  }

  return `${year}-${month}-${day}`;
}

function addDaysToDate(dateValue, offsetDays) {
  const nextDate = new Date(dateValue);
  nextDate.setHours(0, 0, 0, 0);
  nextDate.setDate(nextDate.getDate() + offsetDays);
  return nextDate;
}

function getNextWeekdayDate(baseDate, weekdayIndex) {
  const source = new Date(baseDate);
  source.setHours(0, 0, 0, 0);
  const currentDay = source.getDay();
  const diff = (weekdayIndex - currentDay + 7) % 7 || 7;
  source.setDate(source.getDate() + diff);
  return source;
}

function parseNaturalDate(text) {
  const lower = String(text).toLowerCase();
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  if (/\b(today)\b/.test(lower)) return toDateKey(now);
  if (/\b(tomorrow)\b/.test(lower)) return toDateKey(addDaysToDate(now, 1));
  if (/\b(yesterday)\b/.test(lower)) return toDateKey(addDaysToDate(now, -1));
  if (/\b(tonight|this evening)\b/.test(lower)) return toDateKey(now);

  const inDaysMatch = lower.match(/\bin\s+(\d+)\s+days?\b/);
  if (inDaysMatch) {
    return toDateKey(addDaysToDate(now, Number(inDaysMatch[1])));
  }

  const weekdayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const nextWeekdayMatch = lower.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (nextWeekdayMatch) {
    const target = weekdayMap[nextWeekdayMatch[1]];
    return toDateKey(getNextWeekdayDate(now, target));
  }

  const monthNameMatch = lower.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?\b/);
  if (monthNameMatch) {
    const monthIndex = new Date(`${monthNameMatch[1]} 1, 2000`).getMonth();
    const day = Number(monthNameMatch[2]);
    const finalDate = new Date(now.getFullYear(), monthIndex, day);
    return toDateKey(finalDate);
  }

  const isoMatch = lower.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (isoMatch) {
    return `${isoMatch[1]}-${String(Number(isoMatch[2])).padStart(2, '0')}-${String(Number(isoMatch[3])).padStart(2, '0')}`;
  }

  return toDateKey(now);
}

function parseNaturalTime(text, fallback = null) {
  const lower = String(text).toLowerCase();

  if (/\b(tonight|this evening)\b/.test(lower)) {
    return '20:00';
  }

  const match = String(text).match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) {
    return fallback;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const period = (match[3] || '').toLowerCase();

  if (period === 'pm' && hours < 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function cleanTaskTitle(message) {
  const withoutDate = String(message)
    .replace(/^(add|create|schedule|remind|plan|set|make|book)\s+/i, '')
    .replace(/^(task|todo)\s+/i, '')
    .replace(/\b(today|tomorrow|yesterday|tonight|this evening|next monday|next tuesday|next wednesday|next thursday|next friday|next saturday|next sunday)\b/gi, '')
    .replace(/\b(at|on|for|in)\s+\d{1,2}(?::\d{2})?\s*(am|pm)?\b/gi, '')
    .replace(/\b(to)\s+/i, '');

  const match = withoutDate.match(/(?:^|\s)([A-Za-z0-9][A-Za-z0-9\s&/.-]{2,80})$/i);
  const title = (match ? match[1] : withoutDate).trim().replace(/[.!?]+$/g, '');

  return title || 'Untitled task';
}

function cleanEventTitle(message) {
  const withoutDate = String(message)
    .replace(/^(add|create|schedule|plan|book|set)\s+/i, '')
    .replace(/^(an|a|the)\s+/i, '')
    .replace(/\b(today|tomorrow|yesterday|tonight|this evening|next monday|next tuesday|next wednesday|next thursday|next friday|next saturday|next sunday)\b/gi, '')
    .replace(/\b(at|on|for|in)\s+\d{1,2}(?::\d{2})?\s*(am|pm)?\b/gi, '')
    .replace(/\s+(?:called|named)\s+/i, '');

  const match = withoutDate.match(/(?:meeting|birthday|gym|appointment|class|session|call|doctor|launch|interview|coffee|lunch|dinner|party|workshop|webinar|trip|brunch|training)/i);
  if (match) {
    const before = withoutDate.slice(0, match.index).trim();
    const matchedWord = match[0];
    return (before ? `${before} ${matchedWord}` : matchedWord).replace(/[.!?]+$/g, '') || 'New event';
  }

  const fallback = withoutDate.trim().replace(/[.!?]+$/g, '');
  return fallback || 'New event';
}

function looksLikeEvent(message) {
  const lower = String(message).toLowerCase();
  const eventSignals = ['meeting', 'appointment', 'birthday', 'gym', 'session', 'doctor', 'interview', 'class', 'coffee', 'lunch', 'dinner', 'brunch', 'party', 'call', 'workshop', 'webinar', 'conference', 'trip', 'event', 'schedule'];
  const taskSignals = ['remind', 'buy', 'submit', 'study', 'finish', 'write', 'pay', 'clean', 'cook', 'practice', 'learn', 'read', 'task', 'todo', 'plan', 'complete', 'watch'];

  const eventScore = eventSignals.filter((signal) => lower.includes(signal)).length;
  const taskScore = taskSignals.filter((signal) => lower.includes(signal)).length;

  if (eventScore > 0 && taskScore === 0) return true;
  if (eventScore > taskScore) return true;
  if (taskScore > eventScore) return false;
  return null;
}

function createTaskPayloadFromMessage(message, userId) {
  const lower = String(message).toLowerCase();
  const date = parseNaturalDate(message);
  const time = parseNaturalTime(message, null);
  const priority = /high|urgent/.test(lower) ? 'High' : /low/.test(lower) ? 'Low' : 'Normal';
  const title = cleanTaskTitle(message);

  return {
    userId,
    title,
    description: '',
    date,
    time,
    priority,
    status: 'Pending',
    completed: false,
    reminder: '',
    category: 'General',
  };
}

function createEventPayloadFromMessage(message, userId) {
  const lower = String(message).toLowerCase();
  const date = parseNaturalDate(message);
  const time = parseNaturalTime(message, '09:00');
  const title = cleanEventTitle(message);

  const [hours, minutes] = time.split(':').map(Number);
  const endHours = (hours + 1) % 24;

  return {
    userId,
    title,
    description: '',
    date,
    startTime: time,
    endTime: `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    category: /birthday/.test(lower) ? 'Personal' : 'General',
    location: '',
    reminder: '',
  };
}

async function createAssistantTask(userId, message, override = {}) {
  const payload = createTaskPayloadFromMessage(message, userId);
  const title = typeof override.title === 'string' && override.title.trim() ? override.title.trim() : payload.title;
  const time = isTimeValue(override.time) && override.time ? override.time : payload.time;
  const date = isDateKey(override.date) ? override.date : payload.date;

  if (!title || title.length > 200 || !isDateKey(date) || !isTimeValue(time)) {
    throw new Error('I could not understand a valid task title, date, or time.');
  }

  return Task.create({ ...payload, title, date, time, userId });
}

async function createAssistantEvent(userId, message, override = {}) {
  const payload = createEventPayloadFromMessage(message, userId);
  const title = typeof override.title === 'string' && override.title.trim() ? override.title.trim() : payload.title;
  const date = isDateKey(override.date) ? override.date : payload.date;
  const startTime = isTimeValue(override.time) && override.time ? override.time : payload.startTime;
  const endTime = payload.endTime;
  const validationMessage = validateEventPayload({ ...payload, title, date, startTime, endTime });

  if (validationMessage) throw new Error(validationMessage);
  return Event.create({ ...payload, title, date, startTime, endTime, userId });
}

async function handleAssistantIntent(userId, message) {
  const lower = String(message).toLowerCase();

  if (/(^|\s)(hi|hii|hiii|hello|hey)(\s|$)/i.test(message) || /^(hey there|good morning|good evening|good afternoon)\b/i.test(lower)) {
    return {
      action: 'respond',
      message: "Hi! I'm Sahra. I can help you manage tasks, events, and your progress.",
    };
  }

  const inferredType = looksLikeEvent(message);
  const isExistingItemRequest = /\b(show|what|list|pending|progress|completion|mark|complete|done|finish|delete|remove)\b/.test(lower);
  const isTaskRequest = !isExistingItemRequest && ((/\b(add|create|remind|plan|set)\b/.test(lower) && /\b(task|todo)\b/.test(lower)) || inferredType === false);
  const isEventRequest = !isExistingItemRequest && ((/\b(add|create|schedule|plan|set)\b/.test(lower) && /\b(event|meeting|appointment)\b/.test(lower)) || inferredType === true);

  if (isTaskRequest) {
    const task = await createAssistantTask(userId, message);

    return {
      action: 'createTask',
      message: `Done! I added "${task.title}" for ${formatFriendlyDate(task.date)}${task.time ? ` at ${new Date(`2000-01-01T${task.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}.`,
    };
  }

  if (isEventRequest) {
    const event = await createAssistantEvent(userId, message);

    return {
      action: 'createEvent',
      message: `Done! I added "${event.title}" for ${formatFriendlyDate(event.date)} at ${event.startTime}.`,
    };
  }

  if (/show|what.*tasks|list.*tasks|pending tasks|my tasks/.test(lower)) {
    const tasks = await Task.find({ userId }).sort({ date: 1, createdAt: -1 }).limit(5);
    if (!tasks.length) {
      return { action: 'getTasks', message: 'You do not have any tasks yet.' };
    }

    const list = tasks.map((task) => `${task.title} (${task.completed ? 'Completed' : 'Pending'})`).join(', ');
    return { action: 'getTasks', message: `Here are your tasks: ${list}.` };
  }

  if (/show|what.*events|list.*events|my events/.test(lower)) {
    const events = await Event.find({ userId }).sort({ date: 1, startTime: 1 }).limit(5);
    if (!events.length) {
      return { action: 'getEvents', message: 'You do not have any upcoming events.' };
    }

    const list = events.map((event) => `${event.title} (${event.date})`).join(', ');
    return { action: 'getEvents', message: `Here are your events: ${list}.` };
  }

  if (/progress|how.*month|completion/.test(lower)) {
    const tasks = await Task.find({ userId });
    const completed = tasks.filter((task) => task.completed || task.status === 'Completed').length;
    const total = tasks.length || 0;
    const percent = total ? Math.round((completed / total) * 100) : 0;
    return { action: 'getProgress', message: `Your current progress is ${percent}% with ${completed} of ${total} tasks completed.` };
  }

  if (/mark.*complete|complete.*task|done.*task/.test(lower)) {
    const taskTitle = String(message).replace(/^(mark|complete|done|finish)\s+/i, '').replace(/\s+as\s+complete.*$/i, '').trim() || 'task';
    const task = await Task.findOne({ userId, title: { $regex: taskTitle,$options: 'i' } }).sort({ createdAt: -1 });
    if (!task) {
      return { action: 'completeTask', message: "I couldn't find that task to mark complete." };
    }
    task.completed = true;
    task.status = 'Completed';
    task.completedAt = new Date();
    await task.save();
    return { action: 'completeTask', message: `Done! I marked "${task.title}" as complete.` };
  }

  if (/delete|remove/.test(lower) && /task|event/.test(lower)) {
    const title = extractTitleFromMessage(message).replace(/^(delete|remove)\s+/i, '').trim() || 'task';
    const task = await Task.findOne({ userId, title: { $regex: title,$options: 'i' } }).sort({ createdAt: -1 });
    if (task) {
      await task.deleteOne();
      return { action: 'deleteTask', message: `Deleted "${task.title}".` };
    }

    const event = await Event.findOne({ userId, title: { $regex: title,$options: 'i' } }).sort({ createdAt: -1 });
    if (event) {
      await event.deleteOne();
      return { action: 'deleteEvent', message: `Deleted "${event.title}".` };
    }

    return { action: 'respond', message: "I couldn't find that item to delete." };
  }

  const providerResult = await callAIProvider(message);
  if (providerResult?.action === 'createTask') {
    const task = await createAssistantTask(userId, message, providerResult);
    return { action: 'createTask', message: `Done! I added "${task.title}" for ${formatFriendlyDate(task.date)}${task.time ? ` at ${task.time}` : ''}.` };
  }

  if (providerResult?.action === 'createEvent') {
    const event = await createAssistantEvent(userId, message, providerResult);
    return { action: 'createEvent', message: `Done! I added "${event.title}" for ${formatFriendlyDate(event.date)} at ${event.startTime}.` };
  }

  if (providerResult?.action === 'respond') {
    return { action: 'respond', message: String(providerResult.message || 'How can I help you?').slice(0, 1000) };
  }

  return {
    action: 'respond',
    message: "I didn't quite understand that. You can ask me to add a task, create an event, check your schedule, or update your progress.",
  };
}

router.post('/assistant/chat', verifyToken, async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({ message: 'Please enter a message for Sahra.' });
    }

    const result = await handleAssistantIntent(req.user.id, message);
    return res.status(200).json({
      message: result.message || 'Sahra is temporarily unavailable. Please try again.',
      action: result.action || 'respond',
    });
  } catch (error) {
    console.error('Assistant error:', error);
    return res.status(200).json({
      message: 'Sahra is temporarily unavailable. Please try again.',
      action: 'respond',
    });
  }
});

router.get('/events', verifyToken, async (req, res) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.date) query.date = req.query.date;

    const items = await Event.find(query).sort({ date: 1, startTime: 1, createdAt: -1 });
    return res.status(200).json({ events: items.map((item) => ({ ...item.toObject(), id: item._id.toString() })) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load events' });
  }
});

router.post('/events', verifyToken, async (req, res) => {
  try {
    const payload = normalizeEventPayload(req.body);
    const validationMessage = validateEventPayload(payload);
    if (validationMessage) {
      return res.status(400).json({ message: validationMessage });
    }

    const item = await Event.create({ ...payload, userId: req.user.id });
    return res.status(201).json({ message: 'Event created', event: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create event' });
  }
});

router.get('/tasks', verifyToken, async (req, res) => {
  try {
    const query = { userId: req.user.id };

    if (req.query.date) {
      query.date = req.query.date;
    }

    if (req.query.status) {
      const status = String(req.query.status).toLowerCase();
      if (status === 'pending') {
        query.completed = false;
      } else if (status === 'completed') {
        query.completed = true;
      }
    }

    const items = await Task.find(query).sort({ date: 1, time: 1, createdAt: -1 });
    return res.status(200).json({ tasks: items.map((item) => ({ ...item.toObject(), id: item._id.toString() })) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load tasks' });
  }
});

router.get('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const item = await Task.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Task not found' });
    return res.status(200).json({ task: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load task' });
  }
});

router.post('/tasks', verifyToken, async (req, res) => {
  try {
    const payload = normalizeTaskPayload(req.body);
    if (!payload.title || payload.title.length > 200 || !isDateKey(payload.date) || !isTimeValue(payload.time)) {
      return res.status(400).json({ message: 'A valid task title, date, and time are required' });
    }

    const item = await Task.create({
      userId: req.user.id,
      title: payload.title,
      description: payload.description,
      date: payload.date,
      time: payload.time,
      priority: payload.priority,
      status: payload.status,
      completed: payload.completed,
      reminder: payload.reminder,
      category: payload.category,
    });

    return res.status(201).json({ message: 'Task created', task: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create task' });
  }
});

router.get('/moods', verifyToken, async (req, res) => {
  try {
    const query = { userId: req.user.id };
    if (req.query.date) query.date = req.query.date;

    const items = await Mood.find(query).sort({ date: 1, createdAt: -1 });
    return res.status(200).json({ moods: items.map((item) => ({ ...item.toObject(), id: item._id.toString() })) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load moods' });
  }
});

router.post('/moods', verifyToken, async (req, res) => {
  try {
    const { date, mood, energy = 0, note = '' } = req.body;
    if (!date || !mood) {
      return res.status(400).json({ message: 'Mood date and mood are required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(`${date}T00:00:00`);

    if (selectedDate > today) {
      return res.status(400).json({ message: 'Future dates cannot have a mood.' });
    }

    const item = await Mood.findOneAndUpdate(
      { userId: req.user.id, date },
      { userId: req.user.id, date, mood, energy, note },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ message: 'Mood saved', mood: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save mood' });
  }
});

router.get('/calendar/:date', verifyToken, async (req, res) => {
  try {
    const selectedDate = req.params.date;
    const [tasks, events, moods] = await Promise.all([
      Task.find({ userId: req.user.id, date: selectedDate }).sort({ time: 1, createdAt: -1 }),
      Event.find({ userId: req.user.id, date: selectedDate }).sort({ startTime: 1, createdAt: -1 }),
      Mood.find({ userId: req.user.id, date: selectedDate }).sort({ createdAt: -1 })
    ]);

    return res.status(200).json({
      date: selectedDate,
      tasks: tasks.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
      events: events.map((item) => ({ ...item.toObject(), id: item._id.toString() })),
      moods: moods.map((item) => ({ ...item.toObject(), id: item._id.toString() }))
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load calendar details' });
  }
});

router.put('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const payload = normalizeTaskPayload(req.body);
    if (!payload.title || payload.title.length > 200 || !isDateKey(payload.date) || !isTimeValue(payload.time)) {
      return res.status(400).json({ message: 'A valid task title, date, and time are required' });
    }
    const item = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        $set: {
          ...payload,
          title: payload.title,
          date: payload.date,
          time: payload.time,
          description: payload.description,
          priority: payload.priority,
          completed: payload.completed,
          status: payload.status,
          reminder: payload.reminder,
          category: payload.category,
          reminderNotifiedAt: null,
          updatedAt: new Date(),
          ...(payload.completed ? { completedAt: new Date() } : { completedAt: null }),
        },
      },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Task not found' });
    return res.status(200).json({ message: 'Task updated', task: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update task' });
  }
});

router.delete('/tasks/:id', verifyToken, async (req, res) => {
  try {
    const item = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Task not found' });
    return res.status(200).json({ message: 'Task deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete task' });
  }
});

router.put('/events/:id', verifyToken, async (req, res) => {
  try {
    const existing = await Event.findOne({ _id: req.params.id, userId: req.user.id });
    if (!existing) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const nextBody = normalizeEventPayload({ ...existing.toObject(), ...req.body });
    const validationMessage = validateEventPayload(nextBody);
    if (validationMessage) return res.status(400).json({ message: validationMessage });

    const item = await Event.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { ...nextBody, reminderNotifiedAt: null } },
      { new: true }
    );

    return res.status(200).json({ message: 'Event updated', event: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update event' });
  }
});

router.delete('/events/:id', verifyToken, async (req, res) => {
  try {
    const item = await Event.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Event not found' });
    return res.status(200).json({ message: 'Event deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete event' });
  }
});

router.post('/notifications/mark-sent', verifyToken, async (req, res) => {
  try {
    const { resource, id } = req.body || {};
    const Model = resource === 'task' ? Task : resource === 'event' ? Event : null;
    if (!Model || typeof id !== 'string') {
      return res.status(400).json({ message: 'A valid notification resource is required.' });
    }

    const item = await Model.findOneAndUpdate(
      { _id: id, userId: req.user.id, reminderNotifiedAt: null },
      { $set: { reminderNotifiedAt: new Date() } },
      { new: true }
    );

    return res.status(200).json({ sent: Boolean(item), item: item ? serialize(item) : null });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to record notification delivery.' });
  }
});

router.put('/moods/:id', verifyToken, async (req, res) => {
  try {
    const { date } = req.body || {};
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(`${date}T00:00:00`);
      if (selectedDate > today) {
        return res.status(400).json({ message: 'Future dates cannot have a mood.' });
      }
    }

    const item = await Mood.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!item) return res.status(404).json({ message: 'Mood not found' });
    return res.status(200).json({ message: 'Mood updated', mood: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update mood' });
  }
});

router.delete('/moods/:id', verifyToken, async (req, res) => {
  try {
    const item = await Mood.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ message: 'Mood not found' });
    return res.status(200).json({ message: 'Mood deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete mood' });
  }
});

router.get('/habits', verifyToken, async (req, res) => {
  try {
    const items = await Habit.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ habits: items.map((item) => ({ ...item.toObject(), id: item._id.toString() })) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load habits' });
  }
});

router.post('/habits', verifyToken, async (req, res) => {
  try {
    const { name, description = '', goal = 1, progress = 0, frequency = 'Daily' } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Habit name is required' });
    }

    const item = await Habit.create({ userId: req.user.id, name, description, goal, progress, frequency });
    return res.status(201).json({ message: 'Habit created', habit: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create habit' });
  }
});

router.get('/goals', verifyToken, async (req, res) => {
  try {
    const items = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ goals: items.map((item) => ({ ...item.toObject(), id: item._id.toString() })) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load goals' });
  }
});

router.post('/goals', verifyToken, async (req, res) => {
  try {
    const { title, description = '', duration = '30 days', current = 0, target = 30, progress = 0, status = 'Active' } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Goal title is required' });
    }

    const item = await Goal.create({ userId: req.user.id, title, description, duration, current, target, progress, status });
    return res.status(201).json({ message: 'Goal created', goal: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create goal' });
  }
});

router.get('/reminders', verifyToken, async (req, res) => {
  try {
    const items = await Reminder.find({ userId: req.user.id }).sort({ date: 1, time: 1 });
    return res.status(200).json({ reminders: items.map((item) => ({ ...item.toObject(), id: item._id.toString() })) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load reminders' });
  }
});

router.post('/reminders', verifyToken, async (req, res) => {
  try {
    const { title, date, time = '', enabled = true, note = '' } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: 'Reminder title and date are required' });
    }

    const item = await Reminder.create({ userId: req.user.id, title, date, time, enabled, note });
    return res.status(201).json({ message: 'Reminder created', reminder: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create reminder' });
  }
});

router.get('/notes', verifyToken, async (req, res) => {
  try {
    const items = await Asset.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ notes: items.map((item) => ({ ...item.toObject(), id: item._id.toString() })) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load notes' });
  }
});

router.post('/notes', verifyToken, async (req, res) => {
  try {
    const { title = 'Note', content = '', date = null } = req.body;
    if (!content.trim()) {
      return res.status(400).json({ message: 'Note content is required' });
    }

    const item = await Asset.create({ userId: req.user.id, title, content, tags: 'Note', date });
    return res.status(201).json({ message: 'Note created', note: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to create note' });
  }
});

router.get('/habit-logs', verifyToken, async (req, res) => {
  try {
    const items = await HabitLog.find({ userId: req.user.id }).sort({ date: 1 });
    return res.status(200).json({ habitLogs: items.map((item) => ({ ...item.toObject(), id: item._id.toString() })) });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load habit logs' });
  }
});

router.post('/habit-logs', verifyToken, async (req, res) => {
  try {
    const { habitId, date, completed = true } = req.body;
    if (!habitId || !date) {
      return res.status(400).json({ message: 'Habit ID and date are required' });
    }

    const item = await HabitLog.findOneAndUpdate(
      { userId: req.user.id, habitId, date },
      { userId: req.user.id, habitId, date, completed },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ message: 'Habit log saved', habitLog: { ...item.toObject(), id: item._id.toString() } });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save habit log' });
  }
});

// UPDATE NOTE
router.put('/assets/:id', verifyToken, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const item = await Asset.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id
      },
      {
        $set: {
          title: String(title || '').trim(),
          content: String(content || '').trim(),
          tags: String(tags || 'Note').trim() || 'Note'
        }
      },
      { new: true }
    );

    if (!item) {
      return res.status(404).json({
        message: 'Note not found'
      });
    }

    return res.status(200).json({
      message: 'Note updated',
      data: serialize(item)
    });

  } catch (error) {
    console.error('Update note error:', error);

    return res.status(500).json({
      message: 'Unable to update note'
    });
  }
});


// DELETE NOTE
router.delete('/assets/:id', verifyToken, async (req, res) => {
  try {
    const item = await Asset.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!item) {
      return res.status(404).json({
        message: 'Note not found'
      });
    }

    return res.status(200).json({
      message: 'Note deleted'
    });

  } catch (error) {
    console.error('Delete note error:', error);

    return res.status(500).json({
      message: 'Unable to delete note'
    });
  }
});

// ==========================================
// CREATE A NEW ASSET/NOTE
// ==========================================
router.post('/assets', verifyToken, async (req, res) => {
  try {
    const { title = 'Note', content = '', description = '', tags = 'Note' } = req.body;
    
    const item = await Asset.create({
      userId: req.user.id,
      title: String(title).trim(),
      content: String(content || description).trim(),
      tags: String(tags).trim() || 'Note'
    });

    return res.status(201).json({
      message: 'Asset created',
      data: { ...item.toObject(), id: item._id.toString() }
    });
  } catch (error) {
    console.error('Asset creation error:', error);
    return res.status(500).json({ message: 'Unable to create asset' });
  }
});
// ==========================================
// FINANCE / TRANSACTIONS
// ==========================================

router.get('/transactions', verifyToken, async (req, res) => {
  try {
    const items = await Transaction.find({
      userId: req.user.id
    }).sort({ date: -1, createdAt: -1 });

    return res.status(200).json(
      items.map(item => ({
        ...item.toObject(),
        id: item._id.toString()
      }))
    );
  } catch (error) {
    console.error('Load transactions error:', error);
    return res.status(500).json({
      message: 'Unable to load transactions'
    });
  }
});

router.post('/transactions', verifyToken, async (req, res) => {
  try {
    const {
      amount,
      category = 'General',
      date,
      note = '',
      type
    } = req.body;

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        message: 'Amount must be greater than 0'
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({
        message: 'Transaction type must be income or expense'
      });
    }

    if (!date) {
      return res.status(400).json({
        message: 'Transaction date is required'
      });
    }

    const item = await Transaction.create({
      userId: req.user.id,
      amount: numericAmount,
      category: String(category).trim(),
      date,
      note: String(note).trim(),
      type
    });

    return res.status(201).json({
      message: 'Transaction created',
      transaction: {
        ...item.toObject(),
        id: item._id.toString()
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    return res.status(500).json({
      message: 'Unable to create transaction'
    });
  }
});

router.delete('/transactions/:id', verifyToken, async (req, res) => {
  try {
    const item = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!item) {
      return res.status(404).json({
        message: 'Transaction not found'
      });
    }

    return res.status(200).json({
      message: 'Transaction deleted'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return res.status(500).json({
      message: 'Unable to delete transaction'
    });
  }
});

router.delete('/transactions', verifyToken, async (req, res) => {
  try {
    const result = await Transaction.deleteMany({
      userId: req.user.id
    });

    return res.status(200).json({
      message: 'All transactions deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Reset transactions error:', error);
    return res.status(500).json({
      message: 'Unable to reset transactions'
    });
  }
});

module.exports = router;

