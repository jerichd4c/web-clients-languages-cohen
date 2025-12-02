import { db } from "./db/db.js";
import { CategoryManager } from "./components/CategoryManager.js";
import { TransactionManager } from "./components/TransactionManager.js";
import { BudgetManager } from "./components/BudgetManager.js";
import { DashboardManager } from './components/DashboardManager.js';
import { Navigation } from './components/Navigation.js';

// wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. init database
        await db.open();

        // 2. init components
        // (instance only loads if HTML has a container)

        // category manager
        if (document.getElementById('categories-section')) {
            new CategoryManager();
        }

        // transaction manager
        if (document.getElementById('transactions-section')) {
            new TransactionManager();
        }

        // budget manager
        if (document.getElementById('budget-section')) {
            new BudgetManager();
        }

        // dashboard manager
        if (document.getElementById('dashboard-section')) {
            new DashboardManager();
        }

        new Navigation();
        
        console.log('App initialized successfully.');
        
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
});