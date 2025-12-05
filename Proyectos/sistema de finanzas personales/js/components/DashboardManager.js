import { db } from '../db/db.js';

// pseudo component
export class DashboardManager { 
    constructor() {
        this.monthPicker = document.getElementById('dashboard-month-picker');

        // KPIs references (key performance indicators)
        this.kpiIncome = document.getElementById('kpi-income');
        this.kpiExpense = document.getElementById('kpi-expense');
        this.kpiBalance = document.getElementById('kpi-balance');

        // graph instances
        this.charts = {};

        this.init();
    }

    async init() {
        // declare actual month
        const now = new Date();
        this.monthPicker.value = now.toISOString().slice(0, 7);

        this.monthPicker.addEventListener('change', () => this.refreshDashboard());

        // initial load
        this.refreshDashboard();
    }

    async refreshDashboard() {
        const selectedMonth = this.monthPicker.value; // "YYYY-MM"

        // 1. get raw data
        const allTransactions = await db.getAll('transactions');
        const allCategories = await db.getAll('categories');
        const allBudgets = await db.getAll('budgets');

        // 2. filter by month
        const currentTransactions = allTransactions.filter(t => t.date.startsWith(selectedMonth));

        // 3. update KPIs

        this.updateKPIs(currentTransactions);

        // 4. render charts
        this.renderCategoryChart(currentTransactions, allCategories);
        this.renderBudgetComparisonChart(currentTransactions, allBudgets, allCategories, selectedMonth);
        this.renderIncomeVsExpenseChart(currentTransactions);
        this.renderHistoryChart(allTransactions, selectedMonth);
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
        this.kpiBalance.style.color = balance >= 0 ? 'green' : 'red';
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
            const cat= categories.find(c => c.id === Number(catId));
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
                }]
            }
        });
    }

    // GRAPH 2: Budget vs Actual (bar)
    renderBudgetComparisonChart(transactions, budgets, categories, selectedMonth) {
        const ctx= document.getElementById('chart-budgets').getContext('2d');

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
                    { label: 'Budget', data: estimatedData, backgroundColor: '#36A2EB' },
                    { label: 'Actual Spend', data: realData, backgroundColor: '#FF6384' }
                ]
            },
            options: { scales: { y: { beginAtZero: true } } }
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
                    backgroundColor: ['#4BC0C0', '#FF6384']
                }]
            }
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
                    borderColor: '#9966FF',
                    fill: false,
                }]
            }
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
                legend: { labels: { font: { size: 10 } } },
                tooltip: {
                    bodyFont: { size: 10 },
                    titleFont: { size: 11 }
            }
        }
    };

        // merge base options
        config.options = {
            ...baseOptions,
            ...(config.options || {})
        };

        this.charts[key] = new Chart(ctx, config);
    }
}

