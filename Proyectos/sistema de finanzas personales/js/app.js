import { db } from "./db/db.js";
import { CategoryManager } from "./components/CategoryManager.js";
import { TransactionManager } from "./components/TransactionManager.js";
import { BudgetManager } from "./components/BudgetManager.js";
import { DashboardManager } from './components/DashboardManager.js';
import { Navigation } from './components/Navigation.js';
import { StartupManager } from './components/StartupManager.js';

// hide app container until startup completes
document.querySelector('.app-container').style.display = 'none';

// wait for DOM to load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        //EXTRA: show startup screen
        const startup= new StartupManager();

        // check for skip preference
        const shouldSkip = localStorage.getItem('skipIntro') === 'true';
        
        // setup skip button logic
        const skipBtn = document.getElementById('btn-skip-intro');
        if (skipBtn) {
            // set initial state
            if (shouldSkip) {
                skipBtn.classList.add('active');
            }
            
            skipBtn.addEventListener('click', () => {
                const isSkipping = skipBtn.classList.toggle('active');
                localStorage.setItem('skipIntro', isSkipping);
                alert(isSkipping ? 'Intro Skipped (OFF)' : 'Intro Enabled (ON)');
            });
        }

        if (shouldSkip) {
            startup.skipStartup();
        } else {
            // skip startup with escape key (for dev convenience)
            const skipStartupHandler = () => {
                startup.skipStartup();
                // remove listeners to avoid multiple calls when startup finishes
                document.removeEventListener('keydown', keyHandler);
                document.getElementById('win95-startup').removeEventListener('click', clickHandler);
            };
            
            // key listener
            const keyHandler = (e) => {
                if (e.key === 'Escape') {
                    skipStartupHandler();
                }
            };

            // click listener
            const clickHandler = () => {
                skipStartupHandler();
            };

            // add listeners
            document.addEventListener('keydown', keyHandler);
            document.getElementById('win95-startup').addEventListener('click', clickHandler);

            // init sequence
            await startup.start();

            // remove listeners after normal completion
            document.removeEventListener('keydown', keyHandler);
            document.getElementById('win95-startup').removeEventListener('click', clickHandler);
        }

        // END OF STARTUP SEQUENCE

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