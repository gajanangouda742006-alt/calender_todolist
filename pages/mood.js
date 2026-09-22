export function renderMoodPage(state) {
  const moods = ['😊', '😐', '😢', '😡', '😴', '🔥', '😍'];
  const counts = moods.reduce((acc, mood) => {
    acc[mood] = state.data.moods.filter((entry) => entry.mood === mood).length;
    return acc;
  }, {});

  return `
    <section class="screen">
      <div class="page-header">
        <button class="back-button" type="button" data-action="back-home">← Back</button>
        <h2>Mood</h2>
        <button class="ghost-btn" type="button" data-create="mood">+ Add</button>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>How are you feeling?</h3>
        </div>
        <div class="mood-row">
          ${moods.map((mood) => `
            <button class="mood-pill ${mood === '😊' ? 'selected' : ''}" type="button">${mood}</button>
          `).join('')}
        </div>
      </div>

      <div class="glass-card layout-card">
        <div class="card-header">
          <h3>Monthly mood</h3>
        </div>
        <div class="list">
          ${moods.map((mood) => `
            <div class="list-item">
              <span class="dot"></span>
              <div>
                <strong>${mood} ${mood === '🔥' ? 'Motivated' : mood === '😊' ? 'Happy' : mood === '😐' ? 'Normal' : mood === '😴' ? 'Tired' : mood === '😢' ? 'Sad' : mood === '😡' ? 'Angry' : 'Excited'}</strong>
                <small>${counts[mood] || 0} days</small>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}
