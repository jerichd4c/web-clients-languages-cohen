const DB_NAME = 'personal_finance_db';
const DB_VERSION = 1;

export const db = {
    // connection instance
    connection: null,

    // 1. open the database
    open() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error('Error opening database:', event);
                reject(event.target.error);

            };

            request.onsuccess = (event) => {
                this.connection = event.target.result;
                console.log('Database opened successfully');
                resolve(this.connection);
            };

            // define DB schema 
            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // STORE: categories 
                if (!db.objectStoreNames.contains('categories')) {
                    const store = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('name', 'name', { unique: true });

                    // load initial categories
                    const defaultCategories = [
                        { name: 'Food', color: '#FF6384' },
                        { name: 'Transport', color: '#36A2EB' },
                        { name: 'Entertainment', color: '#FFCE56' },
                        { name: 'Services', color: '#4BC0C0' },
                        { name: 'Health', color: '#9966FF' },
                        { name: 'Education', color: '#FF9F40' },
                        { name: 'Others', color: '#C9CBCF' }
                    ];

                    defaultCategories.forEach(cat => store.add(cat));
                }

                // STORE: transactions 
                if (!db.objectStoreNames.contains('transactions')) {
                    const store = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
                    // indexes for quick filtering
                    store.createIndex('type', 'type', { unique: false }); // income or expense
                    store.createIndex('category_id', 'category_id', { unique: false });
                    store.createIndex('date', 'date', { unique: false });
                }

                // STORE: budgets
                if (!db.objectStoreNames.contains('budgets')) {
                    const store = db.createObjectStore('budgets', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('category_id', 'category_id', { unique: false });
                    store.createIndex('month_year', 'month_year', { unique: false }); // format: 'MM-YYYY'
                }
            };
        });
    },

    // CRUD METHODS 

    // add item to store
    add(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.connection.transaction([storeName], 'readwrite');
            const store= transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // get item by id
    getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.connection.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // delete item by id
    delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.connection.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }
};