import { db } from '../db/db.js';

// pseudo component
export class BudgetManager {
    constructor() {
        //DOM references
        this.monthPicker = document.getElementById('budget-month-picker');
        this.form = document.getElementById('budget-form');
        this.selectCategory = document.getElementById('budget-category');
        this.inputAmount = document.getElementById('budget-amount');
        this.inputId = document.getElementById('budget-id');
        this.listContainer = document.getElementById('budget-list');

        this.init();
    }

    async init() {
        // uses actual month as default format: YYYY-MM
        const now = new Date();
        const monthStr = now.toISOString().substring(0, 7);
        this.monthPicker.value = monthStr;

        // load categories into select
        await this.loadCategories();

        // event listeners
        this.monthPicker.addEventListener('change', () => this.loadBudgetStatus());
        this.form.addEventListener('submit', (e) => this.handleSave(e));

        // load initial data
        this.loadBudgetStatus();
    }

    async loadCategories() {
        const categories = await db.getAll('categories');
        this.categoriesCache = categories; // save in JS memory

        this.selectCategory.innerHTML = '';
        categories.forEach(cat => {
            const op = document.createElement('option');
            op.value = cat.id;
            op.textContent = cat.name;
            this.selectCategory.appendChild(op);
        });
    }

    // SAVE BUDGET
    async handleSave(e) {
        e.preventDefault();

        const monthVal = this.monthPicker.value;
        if (!monthVal) return alert('Please select a month.');

        const categoryId = Number(this.selectCategory.value);
        const amount = parseFloat(this.inputAmount.value);

        // verify if budget exists for this month and category
        // if exists, update; else, add new
        const existingBudget= await this.findBudget(categoryId, monthVal);

        const data = {
            category_id: categoryId,
            month: monthVal,
            max_amount: amount
        };

        try {
            const tx = db.connection.transaction('budgets', 'readwrite');
            const store = tx.objectStore('budgets');

            if (existingBudget) {
                data.id = existingBudget.id;
                store.put(data); // update
            } else {
                store.add(data); // add new
            }

            tx.oncomplete = () => {
                this.form.reset();
                this.inputId.value = '';
                this.loadBudgetStatus(); // refresh list
            };
        } catch (error) {
            console.error('Error saving budget:', error);
            alert('Error saving budget: ' + error.message);
        }
    }

    // helper to find existing budget
    async findBudget(catId, monthStr) {
        const budgets = await db.getAll('budgets');
        return budgets.find(b => b.category_id === catId && b.month === monthStr);
    }

    // CORE LOGIC: compare 
    async loadBudgetStatus() {
        const selectedMonth = this.monthPicker.value;
        if (!selectedMonth) return;

        // 1. get all data 
        const allCategories = await db.getAll('categories');
        const allBudgets = await db.getAll('budgets');
        const allTransactions = await db.getAll('transactions');

        // 2. filter transactions for the selected month
        const monthBudgets = allBudgets.filter(b => b.month === selectedMonth);

        // filter transaction of the month
        const monthTransactions = allTransactions.filter(t => { 
            return t.date.startsWith(selectedMonth) && t.type === 'expense';
        });

        this.renderTable(allCategories, monthBudgets, monthTransactions);
    }

    renderTable(categories, budgets, transactions) {
        this.listContainer.innerHTML = '';

        categories.forEach(cat => {
            // A. find budget for this category
            const budget = budgets.find(b => b.category_id === cat.id);

            // B. calc total expense
            const spent = transactions
                .filter(t => t.category_id === cat.id)
                .reduce((sum, t) => sum + t.amount, 0);
            
            // if theres no budget or expense, skip
            if (!budget && spent === 0) return;

            const max = budget ? budget.max_amount : 0;
            const difference = max - spent;

            // C. determine status and alerts
            let statusHtml = '';
            let rowStyle = '';

            if (max > 0) {
                const percentage = (spent / max) * 100;

                if (spent > max) {
                    // budget exceeded
                    statusHtml = `<span style="color:red; font-weight:bold;">Exceeded (+$${(spent - max).toFixed(2)})</span>`;
                    rowStyle = 'background-color: #ffdddd;'; // red bg
                } else if (percentage > 80) {
                    // nearing budget
                    statusHtml = `<span style="color:orange;">Warning (${percentage.toFixed(0)}%)</span>`;
                } else {
                    // within budget
                    statusHtml = `<span style="color:green;">In Order (${percentage.toFixed(0)}%)</span>`;
                }
            } else {
                statusHtml = `<span style="color:gray;">No Budget Set</span>`;
            }

            // D. render row

            const tr = document.createElement('tr');
            tr.style = rowStyle;
            tr.innerHTML = `
                <td>
                    <span style="color:${cat.color}; font-weight:bold;">${cat.name}</span>
                </td>
                <td>${max > 0 ? '$' + max.toFixed(2) : '-'}</td>
                <td>$${spent.toFixed(2)}</td>
                <td>${statusHtml}</td>
                <td>
                    ${budget ? `
                        <button class="btn-edit-budget" data-id="${budget.id}">Edit</button>
                        <button class="btn-delete-budget" data-id="${budget.id}">Delete</button>
                    ` : ''}
                </td>
            `;

            if (budget) {
                tr.querySelector('.btn-edit-budget').addEventListener('click', () => {
                    this.selectCategory.value = cat.id;
                    this.inputAmount.value = max;
                    this.inputId.value = budget.id;
                });

                tr.querySelector('.btn-delete-budget').addEventListener('click', async () => {
                    const confirmDelete = confirm('Are you sure you want to delete this budget?');
                    if (!confirmDelete) return;

                    try {
                        const tx = db.connection.transaction('budgets', 'readwrite');
                        const store = tx.objectStore('budgets');
                        store.delete(budget.id);

                        tx.oncomplete = () => {
                            this.loadBudgetStatus();
                        };
                    } catch (error) {
                        console.error('Error deleting budget:', error);
                        alert('Error deleting budget: ' + error.message);
                    }
                });
            }

            this.listContainer.appendChild(tr);
        });
    }
}