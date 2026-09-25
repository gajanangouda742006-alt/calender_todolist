// pages/expense.js

export function renderFinancePage(state) {
  const expenses = state?.data?.expenses || [];
  const subscriptions = state?.data?.subscriptions || [];

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const totalSubs = subscriptions.reduce(
    (sum, subscription) => sum + Number(subscription.amount || 0),
    0
  );

  const burnRate = totalExpenses + totalSubs;

  return `
    <section class="screen finance-screen">

      <div
        class="page-header"
        style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:20px;
        "
      >

        <h2>Finance Manager</h2>

        <div
          style="
            display:flex;
            gap:8px;
            flex-wrap:wrap;
          "
        >

          <button
            class="secondary-btn compact-btn"
            type="button"
            data-action="open-add-entry"
            data-type="subscription"
          >
            + Sub
          </button>

          <button
            class="primary-btn compact-btn"
            type="button"
            data-action="open-add-entry"
            data-type="expense"
          >
            + Expense
          </button>

        </div>

      </div>


      <div
        class="glass-card progress-panel"
        style="margin-bottom:20px;"
      >

        <div class="panel-header">
          <h3>Monthly Burn Rate</h3>
        </div>

        <div
          style="
            font-size:2.5rem;
            font-weight:800;
            color:var(--text);
            text-align:center;
            padding:20px 0;
          "
        >
          $${burnRate.toFixed(2)}
        </div>

        <div
          style="
            display:flex;
            justify-content:space-around;
            gap:15px;
            color:var(--muted);
            font-size:0.85rem;
          "
        >
          <span>
            Expenses: $${totalExpenses.toFixed(2)}
          </span>

          <span>
            Subs: $${totalSubs.toFixed(2)}
          </span>

        </div>

      </div>


      <div style="display:grid;gap:20px;">

        <div class="glass-card layout-card">

          <div class="card-header compact">
            <h3>Active Subscriptions</h3>
          </div>

          <div
            style="
              margin-top:12px;
              display:grid;
              gap:8px;
            "
          >

            ${
              subscriptions.length
                ? subscriptions.map((sub) => `
                    <div
                      class="mini-row"
                      style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:12px;
                        background:rgba(255,255,255,0.02);
                        padding:12px;
                        border-radius:8px;
                      "
                    >

                      <div>

                        <strong
                          style="
                            display:block;
                            color:var(--text);
                          "
                        >
                          ${escapeHtml(sub.title || 'Subscription')}
                        </strong>

                        <span
                          style="
                            font-size:0.8rem;
                            color:var(--muted);
                          "
                        >
                          Renews:
                          ${escapeHtml(sub.renewalDate || 'N/A')}
                        </span>

                      </div>

                      <strong style="color:var(--cyan);">
                        $${Number(sub.amount || 0).toFixed(2)}
                      </strong>

                    </div>
                  `).join('')
                : `
                    <p class="mini-empty">
                      No subscriptions logged.
                    </p>
                  `
            }

          </div>

        </div>

      </div>

    </section>
  `;
}