export function renderHabitsPage(state) {
  return `
    <section class="screen">
      <div class="page-header">
        <button class="back-button" type="button" data-action="back-home">← Back</button>
        <h2>Habits</h2>
        <button class="ghost-btn" type="button" data-create="habit">+ Add</button>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>Today's habits</h3>
        </div>
        <div class="progress-block">
          ${state.data.habits.map((habit) => {
            const percent = Math.min(100, (habit.progress / habit.goal) * 100);
            return `
              <div class="progress-row">
                <div class="progress-label">
                  <span>${habit.name}</span>
                  <strong>${habit.progress}/${habit.goal}</strong>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${percent}%"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </section>
  `;
}
