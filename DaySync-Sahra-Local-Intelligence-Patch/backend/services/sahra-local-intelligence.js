'use strict';

// Deterministic, account-scoped Sahra intelligence. No external model/API is used.
const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const doneTask = (task) => task.completed === true || /^completed$/i.test(String(task.status || ''));
const dateKey = (date, timeZone) => new Intl.DateTimeFormat('en-CA', {
  timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
}).format(date);
const startOfWeek = (key) => {
  const d = new Date(`${key}T12:00:00`);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const endOfWeek = (key) => {
  const d = new Date(`${startOfWeek(key)}T12:00:00`);
  d.setDate(d.getDate() + 6);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

async function answerWithLocalIntelligence({ userId, message, models, timeZone = 'Asia/Kolkata' }) {
  const q = String(message || '').toLowerCase().replace(/[’']/g, '');
  const today = dateKey(new Date(), timeZone);
  const month = today.slice(0, 7);
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const { Task, Event, Goal, GoalAchievement, Habit, HabitLog, Mood, Reminder, Note, Asset, Transaction, FocusSession } = models;
  const wantsSummary = /\b(summary|report|overview|how am i doing|my progress|productivity|performance)\b/.test(q);
  const period = /\b(weekly|this week|week)\b/.test(q) ? 'week' : /\b(monthly|this month|month)\b/.test(q) ? 'month' : /\b(all time|overall|ever|since i started|lifetime)\b/.test(q) ? 'all' : 'today';
  const range = period === 'week' ? { $gte: weekStart, $lte: weekEnd } : period === 'month' ? { $gte: `${month}-01`, $lte: today } : period === 'today' ? today : null;

  if (wantsSummary) {
    const taskQuery = range ? { userId, date: range } : { userId };
    const txQuery = range ? { userId, date: range } : { userId };
    const [tasks, events, goals, habits, logs, transactions, sessions, moods] = await Promise.all([
      Task.find(taskQuery).select('title date completed status'),
      Event.find(range ? { userId, date: range } : { userId }).select('title date'),
      Goal.find({ userId }).select('title current target progress status'),
      Habit.find({ userId }).select('name'),
      HabitLog.find(range ? { userId, date: range } : { userId }).select('habitId completed date'),
      Transaction.find(txQuery).select('type amount date category'),
      FocusSession.find({ userId }).select('startedAt endedAt plannedMinutes completed'),
      Mood.find(range ? { userId, date: range } : { userId }).sort({ date: -1, createdAt: -1 }).limit(1).select('mood energy date')
    ]);
    const completed = tasks.filter(doneTask).length;
    const pending = tasks.length - completed;
    const overdue = tasks.filter(t => !doneTask(t) && t.date && t.date < today).length;
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount || 0), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount || 0), 0);
    const focus = sessions.filter(s => s.startedAt && (!range || (period === 'all' || (dateKey(new Date(s.startedAt), timeZone) >= (period === 'week' ? weekStart : period === 'month' ? `${month}-01` : today) && dateKey(new Date(s.startedAt), timeZone) <= (period === 'week' ? weekEnd : today)))));
    const focusMinutes = focus.reduce((s, f) => s + Math.max(0, Number(f.plannedMinutes) || 0), 0);
    const completedHabits = logs.filter(l => l.completed).length;
    const avgGoal = goals.length ? Math.round(goals.reduce((s, g) => s + Math.max(0, Math.min(100, Number(g.progress) || (Number(g.target) > 0 ? Number(g.current || 0) / Number(g.target) * 100 : 0))), 0) / goals.length) : 0;
    const label = period === 'week' ? `this week (${weekStart} to ${weekEnd})` : period === 'month' ? `this month (${month})` : period === 'all' ? 'across all saved records' : `today (${today})`;
    const parts = [
      `${completed}/${tasks.length} tasks completed, ${pending} pending${overdue ? `, ${overdue} overdue` : ''}`,
      `${events.length} calendar events`,
      `${completedHabits}/${logs.length} habit check-ins completed`,
      `${focusMinutes} focus minutes across ${focus.length} sessions`,
      `${goals.length} goals with ${avgGoal}% average recorded progress`,
      `income ${money(income)}, expenses ${money(expenses)}, net ${money(income - expenses)}`
    ];
    if (moods[0]) parts.push(`latest recorded mood: ${moods[0].mood}${moods[0].energy ? ` (energy ${moods[0].energy}/10)` : ''}`);
    return { action: 'getProgressSummary', message: `Your DaySync ${period} summary for ${label}: ${parts.join('; ')}. These figures are calculated from records saved in your account; finance totals are not a live bank balance.` };
  }

  if (/\b(overdue|late|past due)\b/.test(q) && /\b(task|todo|work|items?)\b/.test(q)) {
    const tasks = await Task.find({ userId, date: { $lt: today }, completed: { $ne: true }, status: { $ne: 'Completed' } }).sort({ date: 1 }).limit(20).select('title date priority');
    return { action: 'getOverdueTasks', message: tasks.length ? `You have ${tasks.length} overdue tasks: ${tasks.map(t => `${t.title} (due ${t.date})`).join('; ')}.` : 'You have no overdue tasks in your saved DaySync records.' };
  }

  if (/\b(list|show|which|what are|name)\b/.test(q) && /\b(my )?(goals|achievements)\b/.test(q)) {
    const [goals, achievements] = await Promise.all([
      Goal.find({ userId }).sort({ createdAt: -1 }).limit(30).select('title current target progress status'),
      GoalAchievement.find({ userId }).sort({ updatedAt: -1 }).limit(30).select('goalId payload updatedAt')
    ]);
    if (!goals.length && !achievements.length) return { action: 'getGoals', message: 'There are no saved goals or achievements in your account yet.' };
    const lines = goals.map(g => `${g.title}: ${g.status || 'Active'}, ${Math.round(Number(g.progress) || (Number(g.target) > 0 ? Number(g.current || 0) / Number(g.target) * 100 : 0))}%`);
    return { action: 'getGoals', message: `Your saved goals: ${lines.join('; ') || 'No active goal records'}. I also found ${achievements.length} achievement record(s).` };
  }

  if (/\b(which|what|show|list|how many|count)\b/.test(q) && /\b(notes?|notepad)\b/.test(q)) {
    const [notes, assets] = await Promise.all([
      Note.find({ userId }).sort({ updatedAt: -1 }).limit(8).select('title content'),
      Asset.find({ userId }).sort({ updatedAt: -1 }).limit(8).select('title content tags')
    ]);
    const items = [...notes, ...assets].slice(0, 8);
    return { action: 'getNotes', message: items.length ? `Here are some of your saved notes: ${items.map(n => `${n.title || 'Untitled'}${n.content ? ` — ${String(n.content).slice(0, 100)}` : ''}`).join('; ')}.` : 'You have no saved notes.' };
  }

  if (/\b(upcoming|next|tomorrow)\b/.test(q) && /\b(event|schedule|calendar|appointment)\b/.test(q)) {
    const tomorrowDate = new Date(); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = dateKey(tomorrowDate, timeZone);
    const from = /\btomorrow\b/.test(q) ? tomorrow : today;
    const [events, reminders] = await Promise.all([
      Event.find({ userId, date: { $gte: from } }).sort({ date: 1, startTime: 1 }).limit(12).select('title date startTime'),
      Reminder.find({ userId, date: { $gte: from }, enabled: { $ne: false } }).sort({ date: 1, time: 1 }).limit(12).select('title date time')
    ]);
    const items = [...events.map(e => `${e.title} on ${e.date}${e.startTime ? ` at ${e.startTime}` : ''}`), ...reminders.map(r => `${r.title} reminder on ${r.date}${r.time ? ` at ${r.time}` : ''}`)];
    return { action: 'getUpcoming', message: items.length ? `Your upcoming schedule: ${items.join('; ')}.` : 'No upcoming events or enabled reminders were found in your saved records.' };
  }

  return null;
}

module.exports = { answerWithLocalIntelligence };
