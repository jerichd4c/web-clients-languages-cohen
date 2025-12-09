import { db } from '../db/db.js';

// pseudo component
export class DashboardManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();

        this.monthPicker = document.getElementById('dashboard-month-picker');
        this.planSelector = document.getElementById('dashboard-plan-selector');
        this.alertIcon = document.getElementById('dashboard-alert');

        // KPIs references (key performance indicators)
        this.kpiIncome = document.getElementById('kpi-income');
        this.kpiExpense = document.getElementById('kpi-expense');
        this.kpiBalance = document.getElementById('kpi-balance');

        // graph instances
        this.charts = {};

        this.init();
    }

    render() {
        this.container.innerHTML = `
            <section id="dashboard-section" class="view-section active">
                <div class="dashboard-header">
                    <h2>Financial Dashboard</h2>
                    <div class="dashboard-controls">
                        <label class="month-picker-wrapper">
                            <span>Monthly Plan:</span>
                            <input type="month" id="dashboard-month-picker">
                        </label>
                        <select id="dashboard-plan-selector">
                            <option value="">Existing plans...</option>
                        </select>
                        <div id="dashboard-alert" class="dashboard-alert" style="display:none;" title="">
                            &#9888;
                        </div>
                    </div>
                </div>

                <div class="summary-cards">
                    <div class="card kpi">
                        <h3>Income</h3>
                        <p id="kpi-income" class="amount positive">$0.00</p>
                    </div>
                    <div class="card kpi">
                        <h3>Expenses</h3>
                        <p id="kpi-expense" class="amount negative">$0.00</p>
                    </div>
                    <div class="card kpi">
                        <h3>Balance</h3>
                        <p id="kpi-balance" class="amount">$0.00</p>
                    </div>
                </div>

                <div class="charts-grid">
                    <div class="chart-container">
                        <h3>
                            <span>Expenses by Category</span>
                            <div class="window-controls">
                                <button class="win-btn" title="Minimize">_</button>
                                <button class="win-btn" title="Maximize">□</button>
                                <button class="win-btn win-close" title="Close">×</button>
                            </div>
                        </h3>
                        <canvas id="chart-categories"></canvas>
                    </div>

                    <div class="chart-container">
                        <h3>
                            <span>Budget vs Reality</span>
                            <div class="window-controls">
                                <button class="win-btn" title="Minimize">_</button>
                                <button class="win-btn" title="Maximize">□</button>
                                <button class="win-btn win-close" title="Close">×</button>
                            </div>
                        </h3>
                        <canvas id="chart-budgets"></canvas>
                    </div>

                    <div class="chart-container">
                        <h3>
                            <span>Income vs Expense</span>
                            <div class="window-controls">
                                <button class="win-btn" title="Minimize">_</button>
                                <button class="win-btn" title="Maximize">□</button>
                                <button class="win-btn win-close" title="Close">×</button>
                            </div>
                        </h3>
                        <canvas id="chart-balance-bar"></canvas>
                    </div>

                    <div class="chart-container">
                        <h3>
                            <span>Anual Evolution</span>
                            <div class="window-controls">
                                <button class="win-btn" title="Minimize">_</button>
                                <button class="win-btn" title="Maximize">□</button>
                                <button class="win-btn win-close" title="Close">×</button>
                            </div>
                        </h3>
                        <canvas id="chart-history"></canvas>
                    </div>
                </div>
            </section>
        `;
    }

    async init() {
        // declare actual month
        const now = new Date();
        this.monthPicker.value = now.toISOString().slice(0, 7);

        this.monthPicker.addEventListener('change', () => this.refreshDashboard());

        if (this.planSelector) {
            this.planSelector.addEventListener('change', () => this.handlePlanChange());
        }

        // retro rpg chart defaults
        Chart.defaults.color = '#000000';
        Chart.defaults.font.family = '\'W95FA\', "MS Sans Serif", "Segoe UI", sans-serif';
        Chart.defaults.borderColor = '#000000';

        // initial load
        await this.loadPlans();
        this.refreshDashboard();
    }

    async refreshDashboard() {
        const selectedMonth = this.monthPicker.value; // "YYYY-MM"

        // 1. get raw data
        const allTransactions = await db.getAll('transactions');
        const allCategories = await db.getAll('categories');
        const allBudgets = await db.getAll('budgets');

        // keep plans list in sync in case budgets changed elsewhere
        await this.loadPlans(allBudgets);

        // 2. filter by month
        const currentTransactions = allTransactions.filter(t => t.date.startsWith(selectedMonth));

        // compute budget alerts for this month
        this.updateBudgetAlerts(selectedMonth, allBudgets, allTransactions, allCategories);

        // 3. update KPIs

        this.updateKPIs(currentTransactions);

        // 4. render charts
        this.renderCategoryChart(currentTransactions, allCategories);
        this.renderBudgetComparisonChart(currentTransactions, allBudgets, allCategories, selectedMonth);
        this.renderIncomeVsExpenseChart(currentTransactions);
        this.renderHistoryChart(allTransactions, selectedMonth);
    }

    updateBudgetAlerts(selectedMonth, allBudgets, allTransactions, allCategories) {
        if (!this.alertIcon) return;

        const monthlyBudgets = allBudgets.filter(b => b.month === selectedMonth);
        const monthExpenses = allTransactions.filter(t => t.date.startsWith(selectedMonth) && t.type === 'expense');

        const overLimit = [];

        monthlyBudgets.forEach(b => {
            const spent = monthExpenses
                .filter(t => t.category_id === b.category_id)
                .reduce((sum, t) => sum + t.amount, 0);

            if (spent > b.max_amount) {
                const cat = allCategories.find(c => c.id === b.category_id);
                const name = cat ? cat.name : `Category ${b.category_id}`;
                overLimit.push(`${name} is over budget by $${(spent - b.max_amount).toFixed(2)}`);
            }
        });

        if (overLimit.length > 0) {
            this.alertIcon.style.display = 'flex';
            this.alertIcon.title = overLimit.join('\n');
        } else {
            this.alertIcon.style.display = 'none';
            this.alertIcon.title = '';
        }
    }

    async loadPlans(preloadedBudgets) {
        if (!this.planSelector) return;

        const budgets = preloadedBudgets || await db.getAll('budgets');
        const uniqueMonths = Array.from(new Set(budgets.map(b => b.month))).sort();

        this.planSelector.innerHTML = '<option value="">Existing plans...</option>';

        uniqueMonths.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            this.planSelector.appendChild(option);
        });

        const current = this.monthPicker.value;
        if (current && uniqueMonths.includes(current)) {
            this.planSelector.value = current;
        } else {
            this.planSelector.value = '';
        }
    }

    handlePlanChange() {
        const selected = this.planSelector.value;
        if (!selected) return;
        this.monthPicker.value = selected;
        this.refreshDashboard();
    }

    updateKPIs(transactions) {
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = income - expense;

        this.kpiIncome.textContent = `+$${income.toFixed(2)}`;
        this.kpiExpense.textContent = `-$${expense.toFixed(2)}`;
        this.kpiBalance.textContent = `$${balance.toFixed(2)}`;

        // balance color
        this.kpiBalance.style.color = balance >= 0 ? '#008000' : '#cf0000'; // Theme Green/Red
    }

    // GRAPH 1: Expenses by Category (donut)
    renderCategoryChart(transactions, categories) {
        const ctx = document.getElementById('chart-categories').getContext('2d');

        // group expenses by category
        const expenses = transactions.filter(t => t.type === 'expense');
        const dataMap = {};

        expenses.forEach(t => {
            if (!dataMap[t.category_id]) dataMap[t.category_id] = 0;
            dataMap[t.category_id] += t.amount;
        });

        // arrays for chart js
        const labels = [];
        const data = [];
        const colors = []

        Object.keys(dataMap).forEach(catId => {
            const cat = categories.find(c => c.id === Number(catId));
            labels.push(cat ? cat.name : 'Uncategorized');
            data.push(dataMap[catId]);
            colors.push(cat ? cat.color : '#ccc');
        });

        this.createOrUpdateChart('categoryChart', ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: '#ffffff', // white border to separate segments
                    borderWidth: 2
                }]
            }
        });
    }

    // GRAPH 2: Budget vs Actual (bar)
    renderBudgetComparisonChart(transactions, budgets, categories, selectedMonth) {
        const ctx = document.getElementById('chart-budgets').getContext('2d');

        // filter budget by month
        const monthlyBudgets = budgets.filter(b => b.month === selectedMonth);

        const labels = [];
        const estimatedData = [];
        const realData = [];

        monthlyBudgets.forEach(b => {
            const cat = categories.find(c => c.id === b.category_id);
            const catName = cat ? cat.name : 'ID' + b.category_id;

            // calc real spend for category
            const realSpend = transactions
                .filter(t => t.category_id === b.category_id && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            labels.push(catName);
            estimatedData.push(b.max_amount);
            realData.push(realSpend);
        });

        this.createOrUpdateChart('budgetChart', ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Budget', data: estimatedData, backgroundColor: '#2563EB' }, // Blue
                    { label: 'Actual Spend', data: realData, backgroundColor: '#cf0000' } // Red
                ]
            },
            options: { scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.1)' } }, x: { grid: { color: 'rgba(0,0,0,0.1)' } } } }
        });
    }

    // GRAPH 3: Income vs Expense (balanced bar)
    renderIncomeVsExpenseChart(transactions) {
        const ctx = document.getElementById('chart-balance-bar').getContext('2d');

        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        this.createOrUpdateChart('balBarChart', ctx, {
            type: 'bar',
            data: {
                labels: ['Income', 'Expense'],
                datasets: [{
                    label: 'Total Amount',
                    data: [income, expense],
                    backgroundColor: ['#008000', '#cf0000'] // Theme Green, Red
                }]
            },
            options: { scales: { y: { grid: { color: 'rgba(0,0,0,0.1)' } }, x: { grid: { color: 'rgba(0,0,0,0.1)' } } } }
        });
    }

    // GRAPH 4: History over year (line)
    renderHistoryChart(allTransactions, selectedMonth) {
        const ctx = document.getElementById('chart-history').getContext('2d');

        // extract year from selected month
        const year = selectedMonth.split('-')[0];

        // initialize 12 months array in 0
        const monthlyBalance = Array(12).fill(0);

        allTransactions.forEach(t => {
            if (t.date.startsWith(year)) {
                const monthIndex = parseInt(t.date.split('-')[1]) - 1;
                if (t.type === 'income') monthlyBalance[monthIndex] += t.amount;
                else monthlyBalance[monthIndex] -= t.amount;
            }
        });

        this.createOrUpdateChart('histChart', ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: `Balance ${year}`,
                    data: monthlyBalance,
                    borderColor: '#2563EB', // Blue
                    backgroundColor: 'rgba(37, 99, 235, 0.4)', // Blue fill
                    fill: true,
                    tension: 0.1 // straighter lines for retro feel
                }]
            },
            options: { scales: { y: { grid: { color: 'rgba(0,0,0,0.1)' } }, x: { grid: { color: 'rgba(0,0,0,0.1)' } } } }
        });
    }

    // helper: delete and replace existing charts
    createOrUpdateChart(key, ctx, config) {
        if (this.charts[key]) {
            this.charts[key].destroy();
        }

        // base options for charts
        const baseOptions = {
            responsive: true,
            // css control size
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { font: { size: 12, family: '\'W95FA\', "MS Sans Serif", "Segoe UI", sans-serif' } } },
                tooltip: {
                    bodyFont: { size: 12, family: '\'W95FA\', "MS Sans Serif", "Segoe UI", sans-serif' },
                    titleFont: { size: 13, family: '\'W95FA\', "MS Sans Serif", "Segoe UI", sans-serif' },
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#000000',
                    bodyColor: '#000000',
                    borderColor: '#000000',
                    borderWidth: 2,
                    displayColors: false,
                    cornerRadius: 0
                }
            }
        };

        // merge base options
        config.options = {
            ...baseOptions,
            ...(config.options || {}),
            plugins: { ...baseOptions.plugins, ...(config.options?.plugins || {}) },
            scales: { ...baseOptions.scales, ...(config.options?.scales || {}) }
        };

        this.charts[key] = new Chart(ctx, config);
    }
}

