function formatDateKey(date) {
  const normalized = new Date(
    date.getTime() - (date.getTimezoneOffset() * 60000)
  );

  return normalized.toISOString().slice(0, 10);
}


/* -------------------------------------------------------
   SAFE HTML HELPERS
------------------------------------------------------- */

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


function formatTime(value) {
  if (!value) return 'Not set';

  const match = String(value).match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return escapeHtml(value);
  }

  const hours = Number(match[1]);
  const minutes = match[2];

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${minutes} ${suffix}`;
}


function formatDetailDate(dateString) {
  if (!dateString) return 'Not set';

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return escapeHtml(dateString);
  }

  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}


/* -------------------------------------------------------
   DUSTBIN SVG
------------------------------------------------------- */

function renderDeleteIcon() {
  return `
    <svg
      class="calendar-trash-icon"
      viewBox="0 0 24 24"
      width="15"
      height="15"
      aria-hidden="true"
    >
      <path
        d="M6 7h12"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />

      <path
        d="M9 7V5.5C9 4.67 9.67 4 10.5 4h3c.83 0 1.5.67 1.5 1.5V7"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      />

      <path
        d="M8 7.5l.7 11c.05.84.75 1.5 1.59 1.5h3.42c.84 0 1.54-.66 1.59-1.5l.7-11"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linejoin="round"
      />

      <path
        d="M10.5 10.5v6M13.5 10.5v6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
  `;
}


/* -------------------------------------------------------
   DETAIL MODAL
------------------------------------------------------- */

function renderCalendarDetailModal(state) {
  const detail = state.calendarDetail;

  if (!detail) {
    return '';
  }

  const item = detail.item || {};
  const type = detail.type || 'task';

  const isEvent = type === 'event';

  const title = item.title || 'Untitled';

  const date = formatDetailDate(item.date);

  const description = item.description
    ? escapeHtml(item.description)
    : 'No description';

  const category = item.category
    ? escapeHtml(item.category)
    : 'General';

  const status = isEvent
    ? 'Scheduled'
    : (item.status || (item.completed ? 'Completed' : 'Pending'));

  const statusClass = String(status)
    .toLowerCase()
    .replace(/\s+/g, '-');

  return `
    <div
      class="calendar-detail-backdrop"
      data-action="close-calendar-detail"
    >

      <div
        class="calendar-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-detail-title"
        data-calendar-detail-content
      >

        <div class="calendar-detail-header">

          <div class="calendar-detail-type">
            <span class="calendar-detail-type-icon">
              ${isEvent ? '📅' : '✅'}
            </span>

            <span>
              ${isEvent ? 'Event' : 'Task'}
            </span>
          </div>

          <button
            class="calendar-detail-close"
            type="button"
            data-action="close-calendar-detail"
            aria-label="Close"
          >
            ✕
          </button>

        </div>


        <div class="calendar-detail-body">

          <h3 id="calendar-detail-title">
            ${escapeHtml(title)}
          </h3>


          <div class="calendar-detail-info">

            <div class="calendar-detail-info-row">

              <span class="calendar-detail-info-icon">
                📅
              </span>

              <div>
                <small>Date</small>
                <strong>${date}</strong>
              </div>

            </div>


            ${
              isEvent
                ? `
                  <div class="calendar-detail-info-row">

                    <span class="calendar-detail-info-icon">
                      🕐
                    </span>

                    <div>
                      <small>Time</small>

                      <strong>
                        ${formatTime(item.startTime)}
                        ${
                          item.endTime
                            ? ` - ${formatTime(item.endTime)}`
                            : ''
                        }
                      </strong>

                    </div>

                  </div>
                `
                : `
                  <div class="calendar-detail-info-row">

                    <span class="calendar-detail-info-icon">
                      🕐
                    </span>

                    <div>
                      <small>Time</small>
                      <strong>
                        ${item.time ? formatTime(item.time) : 'No time set'}
                      </strong>
                    </div>

                  </div>
                `
            }


            <div class="calendar-detail-info-row">

              <span class="calendar-detail-info-icon">
                🏷️
              </span>

              <div>
                <small>Category</small>
                <strong>${category}</strong>
              </div>

            </div>


            ${
              !isEvent
                ? `
                  <div class="calendar-detail-info-row">

                    <span class="calendar-detail-info-icon">
                      📌
                    </span>

                    <div>
                      <small>Priority</small>
                      <strong>
                        ${escapeHtml(item.priority || 'Normal')}
                      </strong>
                    </div>

                  </div>
                `
                : ''
            }


            <div class="calendar-detail-info-row">

              <span class="calendar-detail-info-icon">
                ${
                  isEvent
                    ? '📍'
                    : '🔵'
                }
              </span>

              <div>

                <small>Status</small>

                <strong>
                  <span class="calendar-status-badge ${statusClass}">
                    ${escapeHtml(status)}
                  </span>
                </strong>

              </div>

            </div>

          </div>


          <div class="calendar-detail-description">

            <h4>Description</h4>

            <p>
              ${description}
            </p>

          </div>

        </div>


        <div class="calendar-detail-footer">

          <button
            class="calendar-detail-delete"
            type="button"
            data-action="${
              isEvent
                ? 'delete-calendar-event'
                : 'delete-calendar-task'
            }"
            data-${
              isEvent
                ? 'event-id'
                : 'task-id'
            }="${escapeHtml(item.id || item._id || '')}"
          >
            ${renderDeleteIcon()}
            Delete ${isEvent ? 'Event' : 'Task'}
          </button>


          <button
            class="calendar-detail-close-btn"
            type="button"
            data-action="close-calendar-detail"
          >
            Close
          </button>

        </div>

      </div>

    </div>
  `;
}


/* -------------------------------------------------------
   MAIN CALENDAR PAGE
------------------------------------------------------- */

export function renderCalendarPage(state) {

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const monthName = `
    ${monthNames[state.currentMonth]}
    ${state.currentYear}
  `;


  const selectedDate = new Date(
    `${state.selectedDate}T00:00:00`
  );


  const firstDayOfMonth = new Date(
    state.currentYear,
    state.currentMonth,
    1
  );


  const weekdayOffset =
    (firstDayOfMonth.getDay() + 6) % 7;


  const totalDays =
    new Date(
      state.currentYear,
      state.currentMonth + 1,
      0
    ).getDate();


  const prevMonthDays =
    new Date(
      state.currentYear,
      state.currentMonth,
      0
    ).getDate();


  /* -------------------------------------------------------
     MOODS
  ------------------------------------------------------- */

  const moodMap = {
    '😊': '😊',
    '😐': '😐',
    '😢': '😢',
    '😡': '😡',
    '😴': '😴',
    '🔥': '🔥',
    '😍': '😍',
  };


  const moodOptions = [
    '😊',
    '😐',
    '😢',
    '😡',
    '😴',
    '🔥',
    '😍'
  ];


  const moodByDate = {};


  state.data.moods.forEach((entry) => {
    moodByDate[entry.date] = entry.mood;
  });


  const eventsForSelectedDay =
    state.data.events.filter(
      (event) => event.date === state.selectedDate
    );


  const tasksForSelectedDay =
    state.data.tasks.filter(
      (task) => task.date === state.selectedDate
    );


  const mood =
    state.data.moods.find(
      (entry) => entry.date === state.selectedDate
    )?.mood || '😊';


  /* -------------------------------------------------------
     BUILD CALENDAR DAYS
  ------------------------------------------------------- */

  const days = [];


  for (
    let i = 0;
    i < weekdayOffset;
    i += 1
  ) {

    days.push({
      blank: true,
      value: prevMonthDays - weekdayOffset + i + 1
    });

  }


  for (
    let day = 1;
    day <= totalDays;
    day += 1
  ) {

    const dateValue = new Date(
      state.currentYear,
      state.currentMonth,
      day
    );


    const iso = formatDateKey(dateValue);


    days.push({
      blank: false,
      value: day,
      iso,
      mood: moodByDate[iso] || ''
    });

  }


  while (days.length % 7 !== 0) {

    days.push({
      blank: true,
      value:
        days.length -
        totalDays -
        weekdayOffset +
        1
    });

  }


  const weekdays = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun'
  ];


  /* -------------------------------------------------------
     HTML
  ------------------------------------------------------- */

  return `

    <section class="screen calendar-screen">


      <!-- HEADER -->

      <div
        class="page-header"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
        "
      >

        <div
          style="
            display: flex;
            align-items: center;
            gap: 10px;
          "
        >

          <button
            class="back-button"
            type="button"
            data-action="back-home"
          >
            ← Back
          </button>

          <h2>Calendar</h2>

        </div>


        <button
          class="ghost-btn"
          type="button"
          data-action="today"
        >
          Today
        </button>

      </div>



      <!-- MONTH CALENDAR -->

      <div class="glass-card layout-card">

        <div class="card-header">

          <h3>
            ${monthName}
          </h3>


          <div class="action-row">

            <button
              class="small-btn"
              type="button"
              data-action="prev-month"
              aria-label="Previous month"
            >
              ◀
            </button>


            <button
              class="small-btn"
              type="button"
              data-action="next-month"
              aria-label="Next month"
            >
              ▶
            </button>

          </div>

        </div>


        <div class="calendar-grid">

          ${weekdays
            .map(
              (day) => `
                <div class="calendar-weekday">
                  ${day}
                </div>
              `
            )
            .join('')
          }


          ${days
            .map((day) => {

              const iso = day.iso || '';

              const isSelected =
                iso === state.selectedDate;


              const matchingEvents =
                iso
                  ? state.data.events.filter(
                      (event) => event.date === iso
                    )
                  : [];


              const matchingTasks =
                iso
                  ? state.data.tasks.filter(
                      (task) => task.date === iso
                    )
                  : [];


              const matchingMood =
                iso
                  ? state.data.moods.find(
                      (entry) => entry.date === iso
                    )?.mood
                  : null;


              const indicators = [];


              if (matchingEvents.length) {
                indicators.push(
                  '<span class="mini-indicator event"></span>'
                );
              }


              if (matchingTasks.length) {
                indicators.push(
                  '<span class="mini-indicator task"></span>'
                );
              }


              if (matchingMood) {
                indicators.push(
                  '<span class="mini-indicator mood"></span>'
                );
              }


              return `

                <button

                  class="
                    calendar-day
                    ${day.blank ? 'dim' : ''}
                    ${isSelected ? 'selected' : ''}
                  "

                  type="button"

                  data-date="${iso}"

                  ${day.blank ? 'disabled' : ''}

                >

                  <span>
                    ${day.value}
                  </span>


                  ${
                    indicators.length
                      ? `
                        <span class="calendar-indicators">
                          ${indicators.join('')}
                        </span>
                      `
                      : ''
                  }

                </button>

              `;

            })
            .join('')
          }

        </div>

      </div>



      <!-- SELECTED DAY -->

      <div class="glass-card layout-card">

        <div class="card-header">

          <h3>

            ${selectedDate.toLocaleDateString(
              'en-IN',
              {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }
            )}

          </h3>


          <div class="mood-selector-wrap">

            <button
              class="mood-selector-toggle"
              type="button"
              data-action="toggle-mood-picker"
              aria-label="Select mood"
            >
              ${moodMap[mood] || mood}
            </button>


            ${
              state.moodPickerOpen
                ? `

                  <div class="mood-selector-panel">

                    ${moodOptions
                      .map(
                        (emoji) => `

                          <button
                            type="button"
                            class="
                              mood-picker-emoji
                              ${mood === emoji ? 'selected' : ''}
                            "
                            data-mood-value="${emoji}"
                            aria-label="Choose mood ${emoji}"
                          >
                            ${emoji}
                          </button>

                        `
                      )
                      .join('')
                    }

                  </div>

                `
                : ''
            }

          </div>

        </div>



        <!-- EVENTS -->

        <div class="life-card-section">

          <h4>
            📅 Events
          </h4>


          ${
            eventsForSelectedDay.length

              ? eventsForSelectedDay
                  .map((event) => {

                    const eventId =
                      event.id || event._id;


                    return `

                      <div
                        class="calendar-entry-row event-row"
                        role="button"
                        tabindex="0"
                        data-action="show-calendar-event"
                        data-event-id="${escapeHtml(eventId || '')}"
                      >

                        <span class="calendar-entry-time">
                          ${formatTime(event.startTime)}
                        </span>


                        <strong class="calendar-entry-title">
                          ${escapeHtml(event.title)}
                        </strong>


                        <button
                          class="calendar-delete-btn"
                          type="button"
                          data-action="delete-calendar-event"
                          data-event-id="${escapeHtml(eventId || '')}"
                          aria-label="Delete event"
                          title="Delete event"
                        >
                          ${renderDeleteIcon()}
                        </button>

                      </div>

                    `;

                  })
                  .join('')

              : `
                <p class="mini-empty">
                  No events
                </p>
              `
          }

        </div>



        <!-- TASKS -->

        <div class="life-card-section">

          <h4>
            ✅ Tasks
          </h4>


          ${
            tasksForSelectedDay.length

              ? tasksForSelectedDay
                  .map((task) => {

                    const taskId =
                      task.id || task._id;


                    const completed =
                      task.completed ||
                      task.status === 'Completed';


                    return `

                      <div
                        class="
                          calendar-entry-row
                          task-row
                          ${completed ? 'completed-row' : ''}
                        "
                        role="button"
                        tabindex="0"
                        data-action="show-calendar-task"
                        data-task-id="${escapeHtml(taskId || '')}"
                      >

                        <span class="calendar-entry-time">
                          ${escapeHtml(
                            task.status ||
                            (completed
                              ? 'Completed'
                              : 'Pending')
                          )}
                        </span>


                        <strong class="calendar-entry-title">
                          ${escapeHtml(task.title)}
                        </strong>


                        <button
                          class="calendar-delete-btn"
                          type="button"
                          data-action="delete-calendar-task"
                          data-task-id="${escapeHtml(taskId || '')}"
                          aria-label="Delete task"
                          title="Delete task"
                        >
                          ${renderDeleteIcon()}
                        </button>

                      </div>

                    `;

                  })
                  .join('')

              : `
                <p class="mini-empty">
                  No tasks
                </p>
              `
          }

        </div>

      </div>


      <!-- DETAIL POPUP -->

      ${renderCalendarDetailModal(state)}

    </section>

  `;
}