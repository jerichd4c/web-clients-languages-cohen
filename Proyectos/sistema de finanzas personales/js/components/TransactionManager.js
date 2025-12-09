import { db } from '../db/db.js';

// pseudo component
export class TransactionManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();

        // DOM references
        this.form = document.getElementById('transaction-form');
        this.inputId = document.getElementById('trans-id');
        this.inputType = document.getElementById('trans-type');
        this.inputAmount = document.getElementById('trans-amount');
        this.inputDate = document.getElementById('trans-date');
        this.inputCategory = document.getElementById('trans-category');
        this.inputDesc = document.getElementById('trans-desc');
        this.btnCancel = document.getElementById('btn-cancel-trans');

        // DOM filter and list references
        this.listContainer = document.getElementById('transactions-list');
        this.filterType = document.getElementById('filter-type');
        this.filterCategory = document.getElementById('filter-category');
        this.searchInput = document.getElementById('search-input');

        // optional callback to notify other components (e.g., BudgetManager)
        this.onChange = null;

        this.categoriesCache = {}; // for quick access to colors

        this.init();
    }

    render() {
        this.container.innerHTML = `
            <section id="transactions-section" class="view-section">
                <h2>Transaction Manager</h2>

                <div class="card">
                    <h3>
                        <span>New Transaction</span>
                        <div class="window-controls">
                            <button class="win-btn" title="Minimize">_</button>
                            <button class="win-btn" title="Maximize">□</button>
                            <button class="win-btn win-close" title="Close">×</button>
                        </div>
                    </h3>
                    <form id="transaction-form">
                        <input type="hidden" id="trans-id">

                        <div class="form-group">
                            <label>Amount:</label>
                            <input type="number" id="trans-amount" step="0.01" min="0" required placeholder="0.00">
                        </div>

                        <div class="form-group">
                            <label>Date:</label>
                            <input type="date" id="trans-date" required>
                        </div>

                        <div class="type-category-row">
                            <div class="form-group">
                                <label>Type:</label>
                                <select id="trans-type" required>
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label>Category:</label>
                                <select id="trans-category" required>
                                    <!-- categories will be dynamically populated here -->
                                    <option value="">Select Category</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Description:</label>
                            <input type="text" id="trans-desc" placeholder="Detail">
                        </div>

                        <button type="submit" id="btn-save-trans">Register Transaction</button>
                        <button type="button" id="btn-cancel-trans" style="display:none;">Cancel</button>
                    </form>
                </div>

                <div class="filters-bar">
                    <h3>History</h3>
                    <div class="filters-container">
                        <select id="filter-type">
                            <option value="all">All Types</option>
                            <option value="expense">Only Expenses</option>
                            <option value="income">Only Incomes</option>
                        </select>

                        <select id="filter-category">
                            <option value="all">All Categories</option>
                            <!-- categories will be dynamically populated here -->
                        </select>
                        <input type="text" id="search-input" placeholder="Search By Description">
                    </div>
                </div>

                <div class="table-container">
                    <table id="transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="transactions-list">
                            <!-- transactions will be dynamically populated here -->
                        </tbody>
                    </table>
                </div>
            </section>
        `;
    }

    async init() {
        // event listeners
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.btnCancel.addEventListener('click', () => this.resetForm());

        // filter events
        this.filterType.addEventListener('change', () => this.loadTransactions());
        this.filterCategory.addEventListener('change', () => this.loadTransactions());
        this.searchInput.addEventListener('input', () => this.loadTransactions());

        // load categories and transactions
        await this.loadCategoriesIntoSelects();
        this.setDefaultDate();
        this.loadTransactions();
    }

    setDefaultDate() {
        this.inputDate.valueAsDate = new Date();
    }

    // LOAD AND RENDER

    async loadCategoriesIntoSelects() {
        const categories = await db.getAll('categories');

        // clean previous options
        this.inputCategory.innerHTML = '<option value="">Select Category</option>';
        this.filterCategory.innerHTML = '<option value="">All Categories</option>';

        // fill cache and selects
        categories.forEach(cat => { 
            this.categoriesCache[cat.id] = cat; 

            // form select
            const option= document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            this.inputCategory.appendChild(option);

            // filter select
            const filterOption= option.cloneNode(true);
            this.filterCategory.appendChild(filterOption);
        });
    }

    // SAVE (ADD/EDIT))
    async handleSubmit(e) {
        e.preventDefault(); 

        const amount = parseFloat(this.inputAmount.value);
        if (amount <= 0) {
            alert('Amount must be greater than zero.');
            return;
        }

        const data = {
            type: this.inputType.value, // 'income' or 'expense'
            amount: amount,
            date: this.inputDate.value,
            category_id: Number(this.inputCategory.value), // save as number
            description: this.inputDesc.value.trim()
        };

        const id = this.inputId.value;

        try {
            const tx = db.connection.transaction(['transactions'], 'readwrite');
            const store = tx.objectStore('transactions');

            if (id) {
                data.id = Number(id);
                store.put(data); // update
            } else {
                store.add(data); // add new
            }

            tx.oncomplete = () => {
                this.resetForm();
                this.loadTransactions(); // refresh list

                // notify external listeners (e.g., to refresh budgets)
                if (typeof this.onChange === 'function') {
                    this.onChange();
                }
            };
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Error saving transaction: ' + error.message);
        }
    }

    // LIST AND FILTER  
    async loadTransactions() {
        // 1. get all transactions
        let transactions = await db.getAll('transactions');

        // 2. apply filters
        const typeFilter = this.filterType.value;
        const rawCatFilter = this.filterCategory.value;
        const catFilter = rawCatFilter === 'all' || rawCatFilter === '' ? 'all' : Number(rawCatFilter);
        const searchFilter = this.searchInput.value.toLowerCase();

        // 3. filter in memory (JS)
        transactions = transactions.filter(t => {
            const matchType = typeFilter === 'all' || t.type === typeFilter;
            const matchCat = catFilter === 'all' || t.category_id === catFilter;

            // search by description or category name
            const catName = this.categoriesCache[t.category_id]?.name.toLowerCase() || '';
            const desc = t.description ? t.description.toLowerCase() : '';
            const matchSearch = desc.includes(searchFilter) || catName.includes(searchFilter);

            return matchType && matchCat && matchSearch;
        });
        // 4. sort by date
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        this.renderTable(transactions);
    }

    renderTable(transactions) {
        this.listContainer.innerHTML = '';

        transactions.forEach(t => {
            const category = this.categoriesCache[t.category_id] || { name: 'Uncategorized', color: '#ccc' };
            const isExpense = t.type === 'expense';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${t.date}</td>
                <td style="color: ${isExpense ? 'red' : 'green'}; font-weight:bold;">
                    ${t.type.toUpperCase()}
                </td>
                <td>
                    <span style="background-color: ${category.color}33; padding: 2px 8px; border-radius: 4px; border: 1px solid ${category.color}">
                        ${category.name}
                    </span>
                </td>
                <td>${t.description || '-'}</td>
                <td>${t.amount.toFixed(2)}</td>
                <td>
                    <button class="btn-edit" data-id="${t.id}">Edit</button>
                    <button class="btn-delete" data-id="${t.id}">Delete</button>
                </td>
            `;

            // event buttons

            tr.querySelector('.btn-edit').addEventListener('click', () => this.prepareEdit(t));
            tr.querySelector('.btn-delete').addEventListener('click', () => this.deleteTransaction(t.id));

            this.listContainer.appendChild(tr);
        });
    }

    // EDIT AND DELETE
    prepareEdit(t) { 
        this.inputId.value = t.id;
        this.inputType.value = t.type;
        this.inputAmount.value = t.amount;
        this.inputDate.value = t.date;
        this.inputCategory.value = t.category_id;
        this.inputDesc.value = t.description;

        this.btnCancel.style.display = 'inline-block';
        document.getElementById('btn-save-trans').textContent = 'Update Transaction';

        // scroll to form
        this.form.scrollIntoView({ behavior: 'smooth' });
    }

    async deleteTransaction(id) {
        if (!confirm('Are you sure you want to delete this transaction?')) return;
        await db.delete('transactions', id);
        this.loadTransactions();

        // notify external listeners
        if (typeof this.onChange === 'function') {
            this.onChange();
        }
    }

    resetForm() {
        this.form.reset();
        this.inputId.value = '';
        this.setDefaultDate();
        this.btnCancel.style.display = 'none';
        document.getElementById('btn-save-trans').textContent = 'Register Transaction';
    }
}
