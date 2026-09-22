function formatDateKey(date) {
  const normalized = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  return normalized.toISOString().slice(0, 10);
}

export function renderCalendarPage(state) {
  const monthName = new Date(state.currentYear, state.currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const selectedDate = new Date(`${state.selectedDate}T00:00:00`);
  const firstDayOfMonth = new Date(state.currentYear, state.currentMonth, 1);
  const weekdayOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const totalDays = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const prevMonthDays = new Date(state.currentYear, state.currentMonth, 0).getDate();

  const moodMap = {
    '😊': '😊',
    '😐': '😐',
    '😢': '😢',
    '😡': '😡',
    '😴': '😴',
    '🔥': '🔥',
    '😍': '😍',
  };

  const moodOptions = ['😊', '😐', '😢', '😡', '😴', '🔥', '😍'];

  const moodByDate = {};
  state.data.moods.forEach((entry) => {
    moodByDate[entry.date] = entry.mood;
  });

  const eventsForSelectedDay = state.data.events.filter((event) => event.date === state.selectedDate);
  const tasksForSelectedDay = state.data.tasks.filter((task) => task.date === state.selectedDate);
  const mood = state.data.moods.find((entry) => entry.date === state.selectedDate)?.mood || '😊';

  const days = [];

  for (let i = 0; i < weekdayOffset; i += 1) {
    days.push({ blank: true, value: prevMonthDays - weekdayOffset + i + 1 });
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const dateValue = new Date(state.currentYear, state.currentMonth, day);
    const iso = formatDateKey(dateValue);
    days.push({ blank: false, value: day, iso, mood: moodByDate[iso] || '' });
  }

  while (days.length % 7 !== 0) {
    days.push({ blank: true, value: days.length - totalDays - weekdayOffset + 1 });
  }

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return `
    <section class="screen">
      <div class="page-header">
        <h2>Calendar</h2>
        <button class="ghost-btn" type="button" data-action="today">Today</button>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>${monthName}</h3>
          <div class="action-row">
            <button class="small-btn" type="button" data-action="prev-month">◀</button>
            <button class="small-btn" type="button" data-action="next-month">▶</button>
          </div>
        </div>

        <div class="calendar-grid">
          ${weekdays.map((day) => `<div class="calendar-weekday">${day}</div>`).join('')}
          ${days.map((day) => {
            const iso = day.iso || '';
            const isSelected = iso === state.selectedDate;
            const matchingEvents = state.data.events.filter((event) => event.date === iso);
            const matchingTasks = state.data.tasks.filter((task) => task.date === iso);
            const matchingMood = state.data.moods.find((entry) => entry.date === iso)?.mood;
            const indicators = [];
            if (matchingEvents.length) indicators.push('<span class="mini-indicator event"></span>');
            if (matchingTasks.length) indicators.push('<span class="mini-indicator task"></span>');
            if (matchingMood) indicators.push('<span class="mini-indicator mood"></span>');

            return `
              <button
                class="calendar-day ${day.blank ? 'dim' : ''} ${isSelected ? 'selected' : ''}"
                type="button"
                data-date="${iso}"
                ${day.blank ? 'disabled' : ''}
              >
                <span>${day.value}</span>
                ${indicators.length ? `<span class="calendar-indicators">${indicators.join('')}</span>` : ''}
              </button>
            `;
          }).join('')}
        </div>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>${selectedDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h3>
          <div class="mood-selector-wrap">
            <button class="mood-selector-toggle" type="button" data-action="toggle-mood-picker" aria-label="Select mood">${moodMap[mood] || mood}</button>
            ${state.moodPickerOpen ? `
              <div class="mood-selector-panel">
                ${moodOptions.map((emoji) => `
                  <button type="button" class="mood-picker-emoji ${mood === emoji ? 'selected' : ''}" data-mood-value="${emoji}" aria-label="Choose mood ${emoji}">${emoji}</button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="life-card-section">
          <h4>📅 Events</h4>
          ${
            eventsForSelectedDay.length
              ? eventsForSelectedDay.map((event) => `
                  <div class="mini-row">
                    <span>${event.startTime || 'All day'}</span>
                    <strong>${event.title}</strong>
                  </div>
                `).join('')
              : '<p class="mini-empty">No events</p>'
          }
        </div>

        <div class="life-card-section">
          <h4>✅ Tasks</h4>
          ${
            tasksForSelectedDay.length
              ? tasksForSelectedDay.map((task) => `
                  <div class="mini-row">
                    <span>${task.status || 'Pending'}</span>
                    <strong>${task.title}</strong>
                  </div>
                `).join('')
              : '<p class="mini-empty">No tasks</p>'
          }
        </div>
      </div>
    </section>
  `;
}
