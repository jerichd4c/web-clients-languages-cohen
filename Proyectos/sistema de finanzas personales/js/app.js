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

        // instantiate managers (only if their sections exist)
        let transactionManager = null;
        let budgetManager = null;

        if (document.getElementById('budget-section')) {
            budgetManager = new BudgetManager();
        }

        if (document.getElementById('transactions-section')) {
            transactionManager = new TransactionManager();
        }

        if (document.getElementById('dashboard-section')) {
            new DashboardManager();
        }

        // link transactions -> budget refresh
        if (transactionManager && budgetManager) {
            transactionManager.onChange = () => budgetManager.loadBudgetStatus();
        }

        new Navigation();
        
        console.log('App initialized successfully.');
        
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
});