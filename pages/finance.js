function escapeHtml(value = '') {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Main router function for the Finance section
export function renderFinancePage(state) {
  const view = state.financeView || 'dashboard'; 
  const transactions = state.financeData || []; 
  const query = (state.financeSearchQuery || '').toLowerCase();
const typeFilter = state.financeTypeFilter || 'all';

// Filter based on search input and dropdown
let displayTransactions = transactions.filter(t => {
    const titleMatch = (t.category || t.title || '').toLowerCase().includes(query);
    const amountMatch = String(t.amount || '').includes(query);
    const typeMatch = typeFilter === 'all' || t.type === typeFilter;
    return (titleMatch || amountMatch) && typeMatch;
});

// Sort to show NEWLY ADDED FIRST (Descending by Date)
displayTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

// 2. HTML FOR SEARCH BAR & FILTER
const searchAndFilterHTML = `
    <div style="display: flex; gap: 10px; margin-bottom: 16px; position: relative; z-index: 10;">
        <input 
            type="text" 
            data-action="finance-search" 
            placeholder="Search transactions..." 
            value="${(state.financeSearchQuery || '').replace(/"/g, '&quot;')}"
            style="flex: 1; padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: white; outline: none;"
        />
        <select 
            data-action="finance-filter" 
            style="padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background: #1a1a2e; color: white; outline: none; cursor: pointer;"
        >
            <option value="all" ${typeFilter === 'all' ? 'selected' : ''}>All</option>
            <option value="income" ${typeFilter === 'income' ? 'selected' : ''}>Income</option>
            <option value="expense" ${typeFilter === 'expense' ? 'selected' : ''}>Expense</option>
        </select>
    </div>
`;
  
  let html = '';

  if (view === 'add-choice') {
    html = renderAddChoice(state);
  } else if (view === 'add-expense') {
    html = renderAddExpense(state);
  } else if (view === 'transactions') {
    html = renderTransactions(transactions, state);
  } else {
    html = renderDashboard(transactions, state);
  }

  // Inject Transaction Details Modal
  if (state.financeDetail) {
    html += renderTransactionDetailModal(state.financeDetail);
  }

  // ADDED: Inject Reset Confirmation Modal
  if (state.showFinanceResetConfirm) {
    html += renderResetConfirmModal();
  }

  return html;
}
// ==========================================
// SCREEN 1: DASHBOARD
// ==========================================
function renderDashboard(transactions, state) {
  const filter = state.financeFilter || 'week';
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const filteredTransactions = transactions.filter(t => {
    const tDate = new Date(t.date || Date.now());
    tDate.setHours(0, 0, 0, 0);

    if (filter === 'week') {
      const diffDays = (now - tDate) / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays < 7;
    } else if (filter === 'month') {
      return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
    } else if (filter === 'year') {
      return tDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  let totalIncome = 0;
  let totalExpense = 0;

  filteredTransactions.forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.type === 'income') totalIncome += amt;
    if (t.type === 'expense') totalExpense += amt;
  });

  const totalBalance = totalIncome - totalExpense;
  const spendingTitle = filter === 'week' ? 'Weekly Breakdown' : filter === 'month' ? 'Monthly Breakdown' : 'Yearly Breakdown';

  const totalFlow = totalIncome + totalExpense;
  let incomeAngle = 0;
  let incomePercent = 0;
  let expensePercent = 0;

  if (totalFlow > 0) {
    incomeAngle = (totalIncome / totalFlow) * 360;
    incomePercent = Math.round((totalIncome / totalFlow) * 100);
    expensePercent = Math.round((totalExpense / totalFlow) * 100);
  }

  const chartGradient = totalFlow > 0 
    ? `conic-gradient(#34d399 0deg ${incomeAngle}deg, #f87171 ${incomeAngle}deg 360deg)`
    : 'rgba(255,255,255,0.05)';

  return `
    <div class="finance-dashboard-page" style="background-color: #0c0e14; min-height: 100vh; padding: 24px 20px; padding-bottom: 170px; font-family: 'Segoe UI', system-ui, sans-serif; color: white; box-sizing: border-box;">
      
      <!-- Top Header -->
      <!-- =========================================
     HIGHLIGHTED DASHBOARD HEADER
========================================= -->
<div
  class="finance-dashboard-header"
  style="
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin: 0 -6px 24px;
    padding: 18px 14px 20px;

    border-radius: 22px;

    background:
      linear-gradient(
        135deg,
        rgba(96,165,255,0.18),
        rgba(37,99,235,0.08) 55%,
        rgba(255,255,255,0.025)
      );

    border:
      1px solid rgba(96,165,255,0.18);

    box-shadow:
      0 12px 30px rgba(0,0,0,0.28),
      inset 0 1px 1px rgba(255,255,255,0.10);

    overflow: hidden;
  "
>

  <!-- Soft glow -->
  <div
    style="
      position: absolute;
      width: 150px;
      height: 150px;

      top: -90px;
      left: -50px;

      background: rgba(96,165,255,0.18);

      filter: blur(45px);

      border-radius: 50%;

      pointer-events: none;
    "
  ></div>

  <!-- Header Text -->
  <div
    style="
      position: relative;
      z-index: 2;
    "
  >

    <div
      style="
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 5px;
      "
    >

      <span
        style="
          width: 5px;
          height: 28px;
          border-radius: 10px;

          background:
            linear-gradient(
              180deg,
              #60a5ff,
              #8b5cf6
            );

          box-shadow:
            0 0 14px rgba(96,165,255,0.7);
        "
      ></span>

      <h1
        style="
          margin: 0;

          font-size: 1.85rem;
          line-height: 1;

          font-weight: 850;

          color: #ffffff;

          letter-spacing: -0.035em;

          text-shadow:
            0 2px 10px rgba(96,165,255,0.25);
        "
      >
        Dashboard
      </h1>

    </div>

    <div
      style="
        margin-left: 14px;

        color: #9fb6d9;

        font-size: 0.82rem;

        font-weight: 600;

        letter-spacing: 0.02em;
      "
    >
      ${new Date().toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      })}
    </div>

  </div>

  <!-- Reset Button -->
  <button
    data-action="show-finance-reset-confirm"
    type="button"
    style="
      position: relative;
      z-index: 3;

      width: 44px;
      height: 44px;

      border-radius: 15px;

      display: grid;
      place-items: center;

      background:
        linear-gradient(
          145deg,
          rgba(47,55,72,0.95),
          rgba(20,24,34,0.95)
        );

      border:
        1px solid rgba(255,255,255,0.14);

      border-top:
        1px solid rgba(255,255,255,0.28);

      color: #8dc1ff;

      cursor: pointer;

      box-shadow:
        0 8px 18px rgba(0,0,0,0.35),
        inset 0 1px 1px rgba(255,255,255,0.12);

      transition:
        transform 0.18s ease,
        box-shadow 0.18s ease;
    "
    title="Reset Transactions"
  >
    🔄
  </button>

</div>

      <!-- Total Balance Card -->
      <div style="background: linear-gradient(145deg, #60a5ff, #2563eb); border-radius: 28px; padding: 26px; margin-bottom: 24px; box-shadow: 0 20px 45px rgba(37, 99, 235, 0.4), inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 8px rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.4);">
        <div style="color: rgba(255,255,255,0.9); font-size: 0.95rem; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Total Balance</div>
        <div style="font-size: 2.6rem; font-weight: 800; margin-bottom: 24px; letter-spacing: -0.02em; text-shadow: 0 3px 6px rgba(0,0,0,0.25);">₹${totalBalance.toFixed(2)}</div>
        🔄
        <div style="display: flex; align-items: center; background: rgba(0,0,0,0.15); padding: 14px 16px; border-radius: 18px; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15);">
          <div style="flex: 1;">
            <div style="font-size: 0.72rem; font-weight: 800; color: #a7f3d0; margin-bottom: 4px; letter-spacing: 0.05em;">✓ INCOME</div>
            <div style="font-size: 1.25rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">₹${totalIncome.toFixed(2)}</div>
          </div>
          <div style="width: 1px; height: 36px; background: rgba(255,255,255,0.25);"></div>
          <div style="flex: 1; padding-left: 16px;">
            <div style="font-size: 0.72rem; font-weight: 800; color: #fecaca; margin-bottom: 4px; letter-spacing: 0.05em;">↗ EXPENSES</div>
            <div style="font-size: 1.25rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">₹${totalExpense.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <!-- Time Frame Toggle Buttons -->
      <div style="background: linear-gradient(145deg, #181b24, #101218); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.15); border-radius: 24px; padding: 6px; display: flex; gap: 6px; margin-bottom: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.08);">
        <button data-action="set-finance-filter" data-filter="week" style="flex: 1; padding: 12px 0; border-radius: 18px; background: ${filter === 'week' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent'}; color: ${filter === 'week' ? 'white' : '#8b92a5'}; border: ${filter === 'week' ? '1px solid rgba(255,255,255,0.3)' : 'none'}; font-size: 0.95rem; font-weight: 700; cursor: pointer; box-shadow: ${filter === 'week' ? '0 6px 16px rgba(59, 130, 246, 0.4), inset 0 1px 1px rgba(255,255,255,0.4)' : 'none'}; transition: all 0.2s;">Week</button>
        <button data-action="set-finance-filter" data-filter="month" style="flex: 1; padding: 12px 0; border-radius: 18px; background: ${filter === 'month' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent'}; color: ${filter === 'month' ? 'white' : '#8b92a5'}; border: ${filter === 'month' ? '1px solid rgba(255,255,255,0.3)' : 'none'}; font-size: 0.95rem; font-weight: 700; cursor: pointer; box-shadow: ${filter === 'month' ? '0 6px 16px rgba(59, 130, 246, 0.4), inset 0 1px 1px rgba(255,255,255,0.4)' : 'none'}; transition: all 0.2s;">Month</button>
        <button data-action="set-finance-filter" data-filter="year" style="flex: 1; padding: 12px 0; border-radius: 18px; background: ${filter === 'year' ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'transparent'}; color: ${filter === 'year' ? 'white' : '#8b92a5'}; border: ${filter === 'year' ? '1px solid rgba(255,255,255,0.3)' : 'none'}; font-size: 0.95rem; font-weight: 700; cursor: pointer; box-shadow: ${filter === 'year' ? '0 6px 16px rgba(59, 130, 246, 0.4), inset 0 1px 1px rgba(255,255,255,0.4)' : 'none'}; transition: all 0.2s;">Year</button>
      </div>

      <!-- Spending Chart & Percentage Breakdown -->
      <div style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); border-radius: 28px; padding: 24px; margin-bottom: 24px; box-shadow: 0 16px 35px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
          <h3 style="margin: 0; font-size: 1.15rem; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${spendingTitle}</h3>
          <button data-action="set-finance-view" data-view="transactions" style="background: none; border: none; color: #60a5ff; font-size: 0.9rem; font-weight: 700; cursor: pointer;">Details ></button>
        </div>

        <div style="display: flex; justify-content: center; margin-bottom: 20px;">
          <div style="width: 176px; height: 176px; border-radius: 50%; background: ${chartGradient}; display: flex; align-items: center; justify-content: center; box-shadow: 0 12px 30px rgba(0,0,0,0.6), inset 0 3px 6px rgba(255,255,255,0.3);">
            <div style="width: 128px; height: 128px; border-radius: 50%; background: #12141c; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: inset 0 4px 8px rgba(0,0,0,0.6);">
              <div style="font-size: 1.35rem; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">₹${totalExpense.toFixed(2)}</div>
              <div style="font-size: 0.7rem; color: #8b92a5; margin-top: 4px; font-weight: 800; letter-spacing: 0.08em;">SPENT</div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 12px; background: rgba(0,0,0,0.25); padding: 14px; border-radius: 18px; border: 1px solid rgba(255,255,255,0.06); box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);">
          <div style="flex: 1; text-align: center; border-right: 1px solid rgba(255,255,255,0.1);">
            <div style="font-size: 0.72rem; color: #34d399; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 4px;">🟢 EARNED</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: #34d399; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${incomePercent}%</div>
          </div>
          <div style="flex: 1; text-align: center;">
            <div style="font-size: 0.72rem; color: #f87171; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 4px;">🔴 SPENT</div>
            <div style="font-size: 1.15rem; font-weight: 700; color: #f87171; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${expensePercent}%</div>
          </div>
        </div>
      </div>

      <!-- FLOATING 3D ADD BUTTON (+) -->
      <div style="position: fixed; bottom: 95px; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; display: flex; justify-content: flex-end; padding-right: 20px; box-sizing: border-box; pointer-events: none; z-index: 9999;">
        <button data-action="set-finance-view" data-view="add-choice" style="pointer-events: auto; width: 62px; height: 62px; border-radius: 50%; background: linear-gradient(135deg, #60a5ff, #2563eb); color: white; border: none; border-top: 1px solid rgba(255,255,255,0.5); font-size: 34px; font-weight: 300; cursor: pointer; box-shadow: 0 12px 30px rgba(37, 99, 235, 0.6), inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -3px 6px rgba(0,0,0,0.3); display: grid; place-items: center; transition: transform 0.1s;">+</button>
      </div>
    </div>
  `;
}

// ==========================================
// ALL TRANSACTIONS
// ONLY MONTH + YEAR SEPARATORS
// ==========================================

function renderTransactions(transactions, state) {
  const allTransactions = Array.isArray(transactions)
    ? [...transactions]
    : [];

  // Sort newest transaction first
  allTransactions.sort((a, b) => {
    return new Date(b.date || 0) - new Date(a.date || 0);
  });

  // ------------------------------------------
  // EMPTY STATE
  // ------------------------------------------

  if (allTransactions.length === 0) {
    return `
      <div
        style="
          background: #0c0e14;
          min-height: 100vh;
          padding: 24px 20px 130px;
          font-family: 'Segoe UI', system-ui, sans-serif;
          color: white;
          box-sizing: border-box;
        "
      >
        <div
          style="
            display: flex;
            align-items: center;
            margin-bottom: 24px;
          "
        >
          <button
            type="button"
            data-action="set-finance-view"
            data-view="dashboard"
            style="
              width: 42px;
              height: 42px;
              border-radius: 14px;
              background: linear-gradient(135deg, #222634, #14161c);
              border: 1px solid rgba(255,255,255,0.12);
              color: white;
              font-size: 1.2rem;
              cursor: pointer;
              display: grid;
              place-items: center;
              margin-right: 14px;
            "
          >
            ←
          </button>

          <h1
            style="
              margin: 0;
              font-size: 1.5rem;
              font-weight: 700;
            "
          >
            All Transactions
          </h1>
        </div>

        <div
          style="
            text-align: center;
            color: #8b92a5;
            margin-top: 60px;
          "
        >
          No transactions found.
        </div>
      </div>
    `;
  }

  // ------------------------------------------
  // GROUP ONLY BY MONTH + YEAR
  // ------------------------------------------

  const monthGroups = {};

  allTransactions.forEach((transaction) => {
    const date = new Date(transaction.date);

    if (Number.isNaN(date.getTime())) return;

    const year = date.getFullYear();
    const month = date.getMonth();

    const key =
      `${year}-${String(month + 1).padStart(2, '0')}`;

    if (!monthGroups[key]) {
      monthGroups[key] = {
        year,
        month,
        transactions: []
      };
    }

    monthGroups[key].transactions.push(transaction);
  });

  // ------------------------------------------
  // MONTHS NEWEST FIRST
  // ------------------------------------------

  const sortedGroups = Object.values(monthGroups).sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }

    return b.month - a.month;
  });

  // ------------------------------------------
  // BUILD MONTH SECTIONS
  // ------------------------------------------

  const sections = sortedGroups.map((group) => {
    const monthName = new Date(
      group.year,
      group.month,
      1
    ).toLocaleDateString('en-IN', {
      month: 'long'
    });

    const transactionRows = group.transactions
      .sort((a, b) => {
        return new Date(b.date || 0) - new Date(a.date || 0);
      })
      .map((t) => {
        const isExpense = t.type === 'expense';

        const sign = isExpense ? '-' : '+';

        const amountColor = isExpense
          ? '#ff8f9c'
          : '#63e6b1';

        const txId = t._id || t.id;

        const category = escapeHtml(
          t.category ||
          t.title ||
          'Transaction'
        );

        const date = new Date(t.date);

        const formattedDate =
          date.toLocaleDateString('en-IN');

        return `
          <button
            type="button"
            data-action="show-transaction-detail"
            data-id="${txId}"
            style="
              width: 100%;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 14px;

              padding: 16px 0;

              background: transparent;
              border: none;
              border-bottom: 1px solid rgba(255,255,255,0.06);

              color: white;
              text-align: left;

              cursor: pointer;
              box-sizing: border-box;
            "
          >

            <!-- LEFT -->
            <div
              style="
                display: flex;
                align-items: center;
                gap: 14px;
                min-width: 0;
                flex: 1;
              "
            >

              <div
                style="
                  width: 46px;
                  height: 46px;
                  min-width: 46px;
                  border-radius: 14px;

                  background: rgba(255,255,255,0.06);

                  display: grid;
                  place-items: center;

                  font-size: 1.15rem;
                "
              >
                💰
              </div>

              <div
                style="
                  min-width: 0;
                "
              >

                <div
                  style="
                    color: white;
                    font-size: 1rem;
                    font-weight: 700;

                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  "
                >
                  ${category}
                </div>

                <div
                  style="
                    margin-top: 4px;
                    color: #8b92a5;
                    font-size: 0.82rem;
                  "
                >
                  ${formattedDate}
                </div>

              </div>

            </div>

            <!-- AMOUNT -->
            <div
              style="
                color: ${amountColor};
                font-size: 1.05rem;
                font-weight: 800;
                white-space: nowrap;
                flex-shrink: 0;
              "
            >
              ${sign}₹${Math.abs(Number(t.amount) || 0).toFixed(2)}
            </div>

          </button>
        `;
      })
      .join('');

    // ----------------------------------------
    // ONLY MONTH/YEAR HEADING
    // ----------------------------------------

    return `
      <section
        style="
          margin: 0;
        "
      >

        <!-- MONTH SEPARATOR -->
        <div
          style="
            width: 100%;

            padding:
              20px 20px 16px;

            background: #1a1b1d;

            border-top:
              1px solid rgba(255,255,255,0.04);

            border-bottom:
              1px solid rgba(255,255,255,0.05);

            box-sizing: border-box;
          "
        >

          <div
            style="
              color: #aeb4be;
              font-size: 0.95rem;
              font-weight: 600;
              margin-bottom: 2px;
            "
          >
            ${group.year}
          </div>

          <div
            style="
              color: #f2f3f5;
              font-size: 1.75rem;
              font-weight: 500;
              line-height: 1.1;
            "
          >
            ${monthName}
          </div>

        </div>

        <!-- ONLY TRANSACTIONS OF THIS MONTH -->
        <div
          style="
            padding: 0 20px;
            background: #0f1012;
          "
        >
          ${transactionRows}
        </div>

      </section>
    `;
  }).join('');

  // ------------------------------------------
  // PAGE
  // ------------------------------------------

  return `
   <div
  class="finance-transactions-page"
  style="
    background: #040404;
    min-height: 100vh;

    padding: 18px 14px 170px;

    font-family:
      'Segoe UI',
      system-ui,
      sans-serif;

    color: white;

    box-sizing: border-box;
  "
>

      <!-- HEADER -->
      <div
  class="finance-transactions-header"
  style="
    display: flex;
    align-items: center;

    padding: 14px 20px;

    background: #050505;
  "
>

        <button
          type="button"
          data-action="set-finance-view"
          data-view="dashboard"
          style="
            width: 42px;
            height: 42px;

            border-radius: 13px;

            background:
              linear-gradient(
                145deg,
                #292d34,
                #17191d
              );

            border:
              1px solid rgba(255,255,255,0.10);

            color: white;

            font-size: 1.2rem;

            cursor: pointer;

            display: grid;
            place-items: center;

            margin-right: 14px;
          "
        >
          ←
        </button>

        <h1
          style="
            margin: 0;

            font-size: 1.5rem;

            font-weight: 800;

            color: #f5f6f8;
          "
        >
          All Transactions
        </h1>

      </div>

      <!-- MONTH GROUPS -->
      ${sections}

    </div>
  `;
}

// ==========================================
// SCREEN 3: CHOICE SCREEN
// ==========================================
function renderAddChoice(state) {
  return `
    <div style="background-color: #0c0e14; min-height: 100vh; padding: 24px 20px; padding-bottom: 130px; font-family: 'Segoe UI', system-ui, sans-serif; color: white; display: flex; flex-direction: column; justify-content: center; align-items: center; box-sizing: border-box; position: relative;">
      
      <div style="position: absolute; top: 24px; left: 20px;">
        <button data-action="set-finance-view" data-view="dashboard" style="background: linear-gradient(135deg, #222634, #14161c); border: 1px solid rgba(255,255,255,0.12); border-top: 1px solid rgba(255,255,255,0.25); width: 42px; height: 42px; border-radius: 14px; color: white; font-size: 1.2rem; cursor: pointer; display: grid; place-items: center; box-shadow: 0 6px 16px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2);">←</button>
      </div>

      <div style="text-align: center; margin-bottom: 36px;">
        <h1 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Select Type</h1>
        <p style="color: #8b92a5; font-size: 0.95rem;">Choose transaction category</p>
      </div>

      <div style="display: flex; flex-direction: column; gap: 18px; width: 100%; max-width: 340px;">
        <button data-action="select-finance-type" data-type="income" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(52, 211, 153, 0.4); border-top: 1px solid rgba(52, 211, 153, 0.7); border-radius: 24px; padding: 24px; display: flex; align-items: center; gap: 20px; cursor: pointer; color: white; text-align: left; box-shadow: 0 12px 35px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15);">
          <div style="width: 56px; height: 56px; border-radius: 18px; background: rgba(52, 211, 153, 0.2); color: #34d399; display: grid; place-items: center; font-size: 1.6rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">💰</div>
          <div>
            <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 4px; color: #34d399; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Income Money</div>
            <div style="font-size: 0.85rem; color: #8b92a5;">Salary, Gifts, Freelance</div>
          </div>
        </button>

        <button data-action="select-finance-type" data-type="expense" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(96, 165, 255, 0.4); border-top: 1px solid rgba(96, 165, 255, 0.7); border-radius: 24px; padding: 24px; display: flex; align-items: center; gap: 20px; cursor: pointer; color: white; text-align: left; box-shadow: 0 12px 35px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.15);">
          <div style="width: 56px; height: 56px; border-radius: 18px; background: rgba(96, 165, 255, 0.2); color: #60a5ff; display: grid; place-items: center; font-size: 1.6rem; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);">💸</div>
          <div>
            <div style="font-size: 1.2rem; font-weight: 700; margin-bottom: 4px; color: #60a5ff; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Expense Money</div>
            <div style="font-size: 0.85rem; color: #8b92a5;">Food, Bills, Shopping</div>
          </div>
        </button>
      </div>

    </div>
  `;
}

// ==========================================
// SCREEN 4: DETAILED FORM
// ==========================================
function renderAddExpense(state) {
  const type = state.tempFinanceType || 'expense';
  const isIncome = type === 'income';

  return `
    <div style="background-color: #0c0e14; min-height: 100vh; padding: 24px 20px; padding-bottom: 130px; font-family: 'Segoe UI', system-ui, sans-serif; color: white; display: flex; flex-direction: column; box-sizing: border-box;">
      
      <!-- Top Bar -->
      <div style="display: flex; align-items: center; margin-bottom: 24px;">
        <button data-action="set-finance-view" data-view="add-choice" style="background: linear-gradient(135deg, #222634, #14161c); border: 1px solid rgba(255,255,255,0.12); border-top: 1px solid rgba(255,255,255,0.25); width: 42px; height: 42px; border-radius: 14px; color: white; font-size: 1.2rem; cursor: pointer; display: grid; place-items: center; margin-right: 16px; box-shadow: 0 6px 16px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.2);">←</button>
        <h1 style="font-size: 1.3rem; font-weight: 700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.4);">Add ${isIncome ? 'Income' : 'Expense'} Details</h1>
      </div>

      <!-- Amount Input Card -->
      <div style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.25); border-radius: 24px; padding: 24px; text-align: center; margin-bottom: 24px; box-shadow: 0 16px 35px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.15);">
        <div style="color: #8b92a5; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.08em; margin-bottom: 8px;">ENTER AMOUNT</div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 4px;">
          <span style="font-size: 2.2rem; font-weight: 700; color: ${isIncome ? '#34d399' : '#60a5ff'}; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">₹</span>
          <input type="number" id="finance-amount" placeholder="0.00" style="background: transparent; border: none; color: white; font-size: 2.8rem; font-weight: 800; text-align: center; width: 180px; outline: none; text-shadow: 0 2px 6px rgba(0,0,0,0.4);" />
        </div>

        <!-- Quick Amount Chips -->
        <div style="display: flex; justify-content: center; gap: 8px; margin-top: 16px;">
          <button type="button" data-action="quick-amount" data-val="100" style="background: linear-gradient(135deg, #222634, #151821); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.25); color: #cbd5e1; padding: 7px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15);">+100</button>
          <button type="button" data-action="quick-amount" data-val="500" style="background: linear-gradient(135deg, #222634, #151821); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.25); color: #cbd5e1; padding: 7px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15);">+500</button>
          <button type="button" data-action="quick-amount" data-val="1000" style="background: linear-gradient(135deg, #222634, #151821); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.25); color: #cbd5e1; padding: 7px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15);">+1000</button>
          <button type="button" data-action="quick-amount" data-val="5000" style="background: linear-gradient(135deg, #222634, #151821); border: 1px solid rgba(255,255,255,0.1); border-top: 1px solid rgba(255,255,255,0.25); color: #cbd5e1; padding: 7px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.15);">+5000</button>
        </div>
      </div>

      <!-- Form Fields Container -->
      <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
        
        <div>
          <label style="color: #8b92a5; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: block; letter-spacing: 0.05em;">CATEGORY</label>
          <div style="position: relative;">
            <select id="finance-category" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 16px; border-radius: 16px; font-size: 0.95rem; outline: none; cursor: pointer; appearance: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);">
              ${isIncome ? `
                <option value="Salary" style="background: #14161c;">💰 Salary</option>
                <option value="Freelance" style="background: #14161c;">💻 Freelance & Gigs</option>
                <option value="Investments" style="background: #14161c;">📈 Investments</option>
                <option value="Business" style="background: #14161c;">🏢 Business</option>
                <option value="Gift" style="background: #14161c;">🎁 Gift / Other</option>
              ` : `
                <option value="Food" style="background: #14161c;">🍔 Food & Dining</option>
                <option value="Transport" style="background: #14161c;">🚌 Transport & Fuel</option>
                <option value="Shopping" style="background: #14161c;">🛍️ Shopping</option>
                <option value="Bills" style="background: #14161c;">⚡ Bills & Utilities</option>
                <option value="Entertainment" style="background: #14161c;">🎬 Entertainment</option>
                <option value="Health" style="background: #14161c;">💊 Health & Fitness</option>
                <option value="Education" style="background: #14161c;">📚 Education</option>
                <option value="Other" style="background: #14161c;">💸 Other Expense</option>
              `}
            </select>
            <span style="color: #8b92a5; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.8rem;">▼</span>
          </div>
        </div>

        <div>
          <label style="color: #8b92a5; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: block; letter-spacing: 0.05em;">PAYMENT METHOD</label>
          <div style="position: relative;">
            <select id="finance-payment-method" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 16px; border-radius: 16px; font-size: 0.95rem; outline: none; cursor: pointer; appearance: none; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);">
              <option value="UPI" style="background: #14161c;">📱 UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="Bank" style="background: #14161c;">🏦 Bank Account / NetBanking</option>
              <option value="Card" style="background: #14161c;">💳 Credit / Debit Card</option>
              <option value="Cash" style="background: #14161c;">💵 Cash</option>
            </select>
            <span style="color: #8b92a5; position: absolute; right: 16px; top: 50%; transform: translateY(-50%); pointer-events: none; font-size: 0.8rem;">▼</span>
          </div>
        </div>

        <div>
          <label style="color: #8b92a5; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: block; letter-spacing: 0.05em;">DATE</label>
          <input type="date" id="finance-date" value="${new Date().toISOString().split('T')[0]}" style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 16px; border-radius: 16px; font-size: 0.95rem; outline: none; cursor: pointer; text-transform: uppercase; box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);" />
        </div>

        <div>
          <label style="color: #8b92a5; font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: block; letter-spacing: 0.05em;">NOTE (OPTIONAL)</label>
          <input type="text" id="finance-note" placeholder="Add a short note or description..." style="background: linear-gradient(145deg, #191c26, #11131a); border: 1px solid rgba(255,255,255,0.08); border-top: 1px solid rgba(255,255,255,0.2); color: white; width: 100%; padding: 16px; border-radius: 16px; font-size: 0.95rem; outline: none; box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(0,0,0,0.4);" />
        </div>

      </div>

      <!-- 3D Action Button -->
      <button data-action="save-finance-transaction" data-type="${type}" style="width: 100%; padding: 18px; border-radius: 100px; background: ${isIncome ? 'linear-gradient(135deg, #34d399, #059669)' : 'linear-gradient(135deg, #60a5ff, #2563eb)'}; color: white; border: none; border-top: 1px solid rgba(255,255,255,0.5); font-size: 1.1rem; font-weight: 800; cursor: pointer; box-shadow: 0 12px 30px ${isIncome ? 'rgba(5, 150, 105, 0.5)' : 'rgba(37, 99, 235, 0.5)'}, inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.3); text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        Save Transaction
      </button>

    </div>
  `;
}

// ==========================================
// MODAL: TRANSACTION DETAILS (EVENT STYLE)
// ==========================================
function renderTransactionDetailModal(transaction) {
    if (!transaction) return '';

    const isExpense = transaction.type === 'expense';
    const sign = isExpense ? '-' : '+';
    const txId = transaction._id || transaction.id;
    
    // Format Date exactly like "Friday, 25 September 2026"
    const dateObj = new Date(transaction.date);
    const formattedDate = dateObj.toLocaleDateString('en-GB', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });

    // Safe note escaping
    const safeNote = transaction.note 
        ? String(transaction.note).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') 
        : 'No description provided';

    return `
        <!-- Modal Backdrop -->
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Segoe UI', system-ui, sans-serif; animation: fadeIn 0.2s ease-out;">
            
            <!-- Modal Container -->
            <div style="background: #141827; width: 100%; max-width: 420px; border-radius: 20px; border: 1px solid #232a3e; box-shadow: 0 25px 50px rgba(0,0,0,0.5); padding: 24px; display: flex; flex-direction: column; box-sizing: border-box; animation: scaleIn 0.2s ease-out;">
                
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 1.1rem;">📊</span>
                        <span style="color: #a0aec0; font-size: 0.85rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">TRANSACTION</span>
                    </div>
                    <button data-action="close-transaction-detail" style="background: #232a3e; border: none; width: 32px; height: 32px; border-radius: 8px; color: #a0aec0; font-size: 1.1rem; display: grid; place-items: center; cursor: pointer; transition: background 0.2s;">✕</button>
                </div>

                <!-- Main Title (Category & Amount) -->
                <h2 style="margin: 0 0 20px 0; font-size: 1.7rem; font-weight: 700; color: white;">
                    ${transaction.category || 'Transaction'} <span style="color: ${isExpense ? '#fca5a5' : '#6ee7b7'}; font-size: 1.4rem; margin-left: 8px;">${sign}₹${Math.abs(transaction.amount).toFixed(2)}</span>
                </h2>

                <!-- Detail Cards -->
                <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
                    
                    <!-- Date Row -->
                    <div style="background: #1e2438; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 16px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #283046; display: grid; place-items: center; font-size: 1.1rem; color: #93c5fd;">📅</div>
                        <div>
                            <div style="color: #7d8ea9; font-size: 0.75rem; font-weight: 600; margin-bottom: 2px;">Date</div>
                            <div style="color: white; font-size: 0.95rem; font-weight: 600;">${formattedDate}</div>
                        </div>
                    </div>

                    <!-- Payment Method Row -->
                    <div style="background: #1e2438; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 16px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #283046; display: grid; place-items: center; font-size: 1.1rem; color: #d8b4fe;">💳</div>
                        <div>
                            <div style="color: #7d8ea9; font-size: 0.75rem; font-weight: 600; margin-bottom: 2px;">Payment Method</div>
                            <div style="color: white; font-size: 0.95rem; font-weight: 600;">${transaction.paymentMethod || 'Unknown'}</div>
                        </div>
                    </div>

                    <!-- Status / Type Row -->
                    <div style="background: #1e2438; border-radius: 14px; padding: 12px 16px; display: flex; align-items: center; gap: 16px;">
                        <div style="width: 36px; height: 36px; border-radius: 10px; background: #283046; display: grid; place-items: center; font-size: 1.1rem; color: #fca5a5;">📌</div>
                        <div>
                            <div style="color: #7d8ea9; font-size: 0.75rem; font-weight: 600; margin-bottom: 6px;">Status</div>
                            <div style="display: inline-block; background: ${isExpense ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}; color: ${isExpense ? '#fca5a5' : '#6ee7b7'}; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize;">${transaction.type}</div>
                        </div>
                    </div>

                </div>

                <!-- Description -->
                <div style="margin-bottom: 24px;">
                    <div style="color: #e2e8f0; font-size: 0.9rem; font-weight: 600; margin-bottom: 8px;">Description</div>
                    <div style="color: #94a3b8; font-size: 0.95rem; line-height: 1.5;">
                        ${safeNote}
                    </div>
                </div>

                <!-- Divider -->
                <div style="height: 1px; background: #232a3e; margin: 0 -24px 20px -24px;"></div>

                <!-- Footer Actions -->
                <div style="display: flex; gap: 12px;">
                    <button data-action="delete-finance-transaction" data-id="${txId}" style="flex: 1; background: #2d1f2b; border: 1px solid #4b2c39; color: #f472b6; padding: 14px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s;">
                        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        Delete
                    </button>
                    <button data-action="close-transaction-detail" style="flex: 1; background: #202638; border: 1px solid #2e364f; color: white; padding: 14px; border-radius: 12px; font-size: 0.95rem; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        Close
                    </button>
                </div>

            </div>

            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
        </div>
    `;
}

// Add this to the bottom of finance.js
function renderResetConfirmModal() {
    return `
        <!-- Modal Backdrop -->
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Segoe UI', system-ui, sans-serif; animation: fadeIn 0.2s ease-out;">
            
            <!-- Custom Modal Container -->
            <div style="background: #141827; width: 100%; max-width: 380px; border-radius: 24px; border: 1px solid #3f2c39; box-shadow: 0 25px 50px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05); padding: 32px 24px; text-align: center; display: flex; flex-direction: column; align-items: center; animation: scaleIn 0.2s ease-out; box-sizing: border-box;">
                
                <!-- Warning Icon -->
                <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; box-shadow: inset 0 2px 4px rgba(239, 68, 68, 0.2);">
                    <span style="font-size: 2rem;">⚠️</span>
                </div>

                <!-- Text -->
                <h2 style="margin: 0 0 12px 0; font-size: 1.4rem; font-weight: 800; color: white;">Reset Entire App?</h2>
                <p style="margin: 0 0 28px 0; color: #94a3b8; font-size: 0.95rem; line-height: 1.5;">
                    This will permanently delete all your transactions, tasks, events, and data from the database, resetting your account to a clean state. This <strong>cannot be undone</strong>.
                </p>

                <!-- Action Buttons (Cancel / Confirm) -->
                <div style="display: flex; gap: 12px; width: 100%;">
                    <button data-action="cancel-finance-reset" style="flex: 1; background: #202638; border: 1px solid #2e364f; color: white; padding: 14px; border-radius: 14px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s;">
                        Cancel
                    </button>
                    <button data-action="confirm-finance-reset" style="flex: 1; background: linear-gradient(135deg, #ef4444, #b91c1c); border: none; color: white; padding: 14px; border-radius: 14px; font-size: 0.95rem; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);">
                        Yes, Reset All
                    </button>
                </div>
            </div>
            
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            </style>
        </div>
    `;
}

function renderAllTransactions(state) {
    // 1. Get the raw transactions from state
    const transactions = state.financeData || [];
    
    // 2. Get current filter and search settings (default to 'all' and empty search)
    const typeFilter = state.financeTypeFilter || 'all';
    const query = (state.financeSearchQuery || '').toLowerCase();

    // 3. FILTER LOGIC: Apply search bar & dropdown selections
    let displayTransactions = transactions.filter(t => {
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        
        // Search by category, title, or amount
        const matchesSearch = (t.category || t.title || '').toLowerCase().includes(query) || 
                              String(t.amount || '').includes(query);
                              
        return matchesType && matchesSearch;
    });

    // 4. SORT LOGIC: Newest on Top (Descending order by Date)
    displayTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 5. BUILD HTML UI (Filter Bar + List)
    return `
        <!-- Filter & Search Bar -->
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <input 
                type="text" 
                data-action="finance-search" 
                placeholder="Search transactions..." 
                value="${(state.financeSearchQuery || '').replace(/"/g, '&quot;')}"
                style="flex: 1; padding: 12px 16px; border-radius: 12px; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); outline: none; font-size: 1rem;"
            />
            <select 
                data-action="finance-filter" 
                style="padding: 12px; border-radius: 12px; background: #1a1a2e; color: white; border: 1px solid rgba(255,255,255,0.1); outline: none; cursor: pointer; font-size: 1rem;"
            >
                <option value="all" ${typeFilter === 'all' ? 'selected' : ''}>All</option>
                <option value="income" ${typeFilter === 'income' ? 'selected' : ''}>Income</option>
                <option value="expense" ${typeFilter === 'expense' ? 'selected' : ''}>Expense</option>
            </select>
        </div>

        <!-- Transaction List -->
        <div class="transaction-list" style="display: flex; flex-direction: column; gap: 12px;">
            ${displayTransactions.length > 0 ? displayTransactions.map(t => `
                <button 
                    class="transaction-card" 
                    data-action="show-transaction-detail" 
                    data-id="${t._id || t.id}" 
                    style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; width: 100%; text-align: left; cursor: pointer;"
                >
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.08); display: grid; place-items: center; font-size: 1.2rem;">
                            💰
                        </div>
                        <div>
                            <strong style="color: white; display: block; font-size: 1.05rem; margin-bottom: 2px;">
                                ${t.category || t.title || 'Transaction'}
                            </strong>
                            <span style="color: #94a3b8; font-size: 0.85rem;">
                                ${t.date ? new Date(t.date).toLocaleDateString('en-IN') : ''}
                            </span>
                        </div>
                    </div>
                    <strong style="color: ${t.type === 'income' ? '#61f5b0' : '#ff4757'}; font-size: 1.15rem;">
                        ${t.type === 'income' ? '+' : '-'}₹${Number(t.amount).toFixed(2)}
                    </strong>
                </button>
            `).join('') : `
                <div style="text-align: center; color: rgba(255,255,255,0.5); padding: 40px 0; font-size: 0.95rem;">
                    No transactions found.
                </div>
            `}
        </div>
    `;
}