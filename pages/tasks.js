export function renderTasksPage(state) {
  const tasks = state.data.tasks || [];
  const activeFilter = state.todoFilter || 'All';
  const todayIso = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  const normalizedTasks = tasks.map((task) => ({
    ...task,
    id: task.id || task._id,
    status: task.status || (task.completed ? 'Completed' : 'Pending'),
    priority: task.priority || 'Normal',
    title: task.title || 'Untitled task',
    date: task.date || todayIso,
    time: task.time || null,
  }));

  const filteredTasks = normalizedTasks.filter((task) => {
    const isCompleted = task.status === 'Completed' || task.completed;
    if (activeFilter === 'Pending') return !isCompleted;
    if (activeFilter === 'Completed') return isCompleted;
    if (activeFilter === 'Today') return task.date === todayIso;
    return true;
  });

  const filters = ['All', 'Pending', 'Completed', 'Today'];

  const taskRows = filteredTasks.length
    ? filteredTasks.map((task) => {
        const isCompleted = task.status === 'Completed' || task.completed;
        const priorityClass = (task.priority || 'Normal').toLowerCase();
        const taskDate = task.date ? new Date(`${task.date}T00:00:00`).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) : 'No date';
        const taskTime = task.time ? new Date(`2000-01-01T${task.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'All day';

        return `
          <div class="todo-item ${isCompleted ? 'completed' : ''}">
            <button class="todo-check ${isCompleted ? 'checked' : ''}" type="button" data-action="toggle-task" data-task-id="${task.id}">${isCompleted ? '✓' : ''}</button>

            <div class="todo-content">
              <div class="todo-title-row">
                <h4 class="${isCompleted ? 'done' : ''}">${task.title}</h4>
                <div class="todo-actions">
                  <button class="icon-btn" type="button" data-action="edit-task" data-task-id="${task.id}" aria-label="Edit task">✎</button>
                  <button class="icon-btn" type="button" data-action="delete-task" data-task-id="${task.id}" aria-label="Delete task">🗑</button>
                </div>
              </div>

              <div class="todo-meta">
                <span>📅 ${taskDate}</span>
                <span>•</span>
                <span>${taskTime}</span>
              </div>

              <div class="priority-badge ${priorityClass}">${task.priority || 'Normal'}</div>
            </div>
          </div>
        `;
      }).join('')
    : '<div class="todo-item"><div class="todo-content"><div class="todo-title-row"><h4>No tasks yet.</h4></div></div></div>';

  return `
    <section class="screen todo-screen">
      <div class="todo-header">
        <div class="todo-back-wrap">
          <button class="nav-back" type="button" data-action="back-home" aria-label="Back">←</button>
        </div>

        <div class="todo-heading">
          <div class="todo-icon">☑️</div>
          <div>
            <h2>To Do List</h2>
            <p>Plan today, build your tomorrow</p>
          </div>
        </div>

        <button class="more-menu" type="button">⋮</button>
      </div>

      <div class="filter-row">
        ${filters.map((filter) => {
          const label = filter === 'All' ? 'All' : filter === 'Pending' ? 'Pending' : filter === 'Completed' ? 'Completed' : 'Today';
          const active = activeFilter === filter ? 'active' : '';
          const icon = filter === 'All' ? '📋' : filter === 'Pending' ? '◯' : filter === 'Completed' ? '✓' : '🗓️';
          return `<button class="filter-btn ${active}" type="button" data-task-filter="${filter}">${icon} ${label}</button>`;
        }).join('')}
      </div>

      <div class="task-input-row">
        <button class="task-plus" type="button" data-action="open-task-modal" aria-label="Add new task">＋</button>
        <input type="text" placeholder="Add a new task..." aria-label="Add new task" readonly data-action="open-task-modal" />
        <button class="task-add" type="button" data-action="open-task-modal">Add</button>
      </div>

      <div class="todo-list">
        ${taskRows}
      </div>

      <div class="motivation-card">
        <div class="sparkle">✦</div>
        <div>
          <h3>Small steps, big progress!</h3>
          <p>Keep going, you're doing great.</p>
        </div>
      </div>
    </section>
  `;
}
