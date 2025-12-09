import { db } from '../db/db.js';

// pseudo component
export class CategoryManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.render();

        // DOM references
        this.form = document.getElementById('category-form');
        this.listContainer = document.getElementById('categories-list');
        this.inputName = document.getElementById('cat-name');
        this.inputColor = document.getElementById('cat-color');
        this.inputId = document.getElementById('cat-id');
        this.btnCancel = document.getElementById('btn-cancel-cat');

        // link events to methods
        this.init();

    }

    render() {
        this.container.innerHTML = `
            <section id="categories-section" class="view-section">
                <h2>Category Manager</h2>

                <div class="card">
                    <h3>
                        <span>New/Edit Category</span>
                        <div class="window-controls">
                            <button class="win-btn" title="Minimize">_</button>
                            <button class="win-btn" title="Maximize">□</button>
                            <button class="win-btn win-close" title="Close">×</button>
                        </div>
                    </h3>
                    <form id="category-form">
                        <input type="hidden" id="cat-id">
                        <div class="form-group">
                            <label>Name:</label>
                            <input type="text" id="cat-name" required placeholder="Example: Gym">
                        </div>

                        <div class="form-group">
                            <label>Color (for graphs):</label>
                            <input type="color" id="cat-color" value="#36A2EB">
                        </div>

                        <button type="submit" id="btn-save-cat">Save Category</button>
                        <button type="button" id="btn-cancel-cat" style="display:none">Cancel</button>
                    </form>
                </div>

                <div class="list-container">
                    <h3>Categories List</h3>
                    <ul id="categories-list" class="styled-list">
                        <!-- categories will be dynamically populated here -->
                    </ul>
                </div>
            </section>
        `;
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.btnCancel.addEventListener('click', () => this.resetForm());

        // load and render categories
        this.loadCategories();
    }

    // LOAD AND RENDER

    async loadCategories() {
        const categories = await db.getAll('categories');
        this.renderList(categories);
    }

    renderList(categories) {
        this.listContainer.innerHTML = '';

        categories.forEach(cat => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="category-info">
                    <span class="category-color-box" style="background-color: ${cat.color};"></span>
                    <span>${cat.name}</span>
                </div>
                <div class="actions">
                    <button class="btn-edit" data-id="${cat.id}">Edit</button>
                    <button class="btn-delete" data-id="${cat.id}">Delete</button>
                </div>
            `;

            // link buttons to methods
            li.querySelector('.btn-edit').addEventListener('click', () => this.prepareEdit(cat));
            li.querySelector('.btn-delete').addEventListener('click', () => this.deleteCategory(cat.id));

            this.listContainer.appendChild(li);
        });
    }

    // SAVE (ADD/EDIT)
    async handleSubmit(e) {
        e.preventDefault();

        const data = {
            name: this.inputName.value,
            color: this.inputColor.value
        };

        const id = this.inputId.value;

        try {
            if (id) {
                // edit mode: hold the id
                // nt: replace the object, pass the id
                // indexdexDB requires 'put' to update the key if passed
                const tx = db.connection.transaction(['categories'], 'readwrite');
                const store = tx.objectStore('categories');
                data.id = Number(id);
                store.put(data);

                // wait for transaction to complete
                tx.oncomplete = () => {
                    this.resetForm();
                    this.loadCategories();
                };

            } else {
                // create mode: no id
                await db.add('categories', data);
                this.resetForm();
                this.loadCategories();
            }
        } catch (error) {
            alert('Error saving category: ' + error.message);
        }
    }

    prepareEdit(cat) {
        this.inputName.value = cat.name;
        this.inputColor.value = cat.color;
        this.inputId.value = cat.id;
        this.btnCancel.style.display = 'inline-block';
        document.getElementById('btn-save-cat').textContent = 'Update Category';

    }

    resetForm() {
        this.form.reset();
        this.inputId.value = '';
        this.btnCancel.style.display = 'none';
        document.getElementById('btn-save-cat').textContent = 'Add Category';
    }

    // DELETE (cascade deletion)
    async deleteCategory(id) {
        if (!confirm('Are you sure you want to delete this category? This will also delete all associated transactions related to this category.')) {
            return;
        }

        try {
            // 1. open a transaction for both stores
            const tx = db.connection.transaction(['categories', 'transactions'], 'readwrite');
            const catStore = tx.objectStore('categories');
            const transStore = tx.objectStore('transactions');

            // 2. delete the category
            catStore.delete(id);

            // 3. search and delete associated transactions
            // using category_id index 
            const index = transStore.index('category_id');
            const request = index.openCursor(IDBKeyRange.only(id));

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete(); // delete current transaction
                    cursor.continue(); // move to next
                }
            };

            tx.oncomplete = () => {
                alert('Category and associated transactions deleted successfully.');
                this.loadCategories();
            };
        } catch (error) {
            console.error(error);
            alert('Error deleting category');
        }
    }
}