export function renderGoalsPage(state) {
  return `
    <section class="screen">
      <div class="page-header">
        <button class="back-button" type="button" data-action="back-home">← Back</button>
        <h2>Goals</h2>
        <button class="ghost-btn" type="button" data-create="goal">+ Add</button>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>Personal growth</h3>
        </div>
        <div class="progress-block">
          ${state.data.goals.map((goal) => `
            <div class="progress-row">
              <div class="progress-label">
                <span>${goal.title}</span>
                <strong>${goal.progress}%</strong>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" style="width:${goal.progress}%"></div>
              </div>
              <small style="color: var(--muted);">${goal.current} / ${goal.target} days</small>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
