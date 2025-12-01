import { db } from "./db/db.js";
import { CategoryManager } from "./components/CategoryManager.js";
import { TransactionManager } from "./components/TransactionManager.js";

// wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. init database
        await db.open();

        // 2. init components
        // (instance only loads if HTML has a container)
        if (document.getElementById('categories-section')) {
            new CategoryManager();
        }

        // 3. other components can be initialized here similarly
        if (document.getElementById('transactions-section')) {
            new TransactionManager();
        }
        
        console.log('App initialized successfully.');
        
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
});