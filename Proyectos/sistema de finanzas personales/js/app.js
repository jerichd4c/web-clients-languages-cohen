import { db } from "./db/db.js";
import { CategoryManager } from "./components/CategoryManager.js";

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
        console.log('App initialized successfully.');
    } catch (error) {
        console.error('Error during app initialization:', error);
    }
});