# Personal Finance System 💸

A retro-styled personal finance management application built with HTML, CSS, and vanilla JavaScript, featuring a nostalgic Windows 95 aesthetic. Track your income, expenses, and budgets with a fully functional desktop-like interface.

## Quick Start 🚀

1. Open `index.html` in your browser.
2. Enjoy the **Windows 95 startup sequence** (or press `Esc` / click the screen to skip).
3. Use the **Taskbar** at the bottom to navigate between apps (Dashboard, Transactions, Budget, Categories).
4. Start by adding some **Categories** or use the defaults.
5. Record your **Transactions** (Income/Expense).
6. Set up **Budgets** to monitor your spending.

## Features & Screens 🧭

- **Startup**: A faithful recreation of the Windows 95 boot sequence, complete with loading bars and sound effects.
- **Dashboard**: Visual overview of your financial health using charts (powered by Chart.js) and summary cards.
- **Transactions**: A ledger to record and view all your financial movements. Supports filtering and deletion.
- **Budget**: Set monthly spending limits per category and track your progress with visual progress bars.
- **Categories**: Manage your transaction categories with custom names and colors.
- **Taskbar Navigation**: Switch between different "apps" seamlessly without reloading the page.

## Controls & Configuration ⚙️

- **Navigation**: Click the buttons on the bottom taskbar to switch views.
- **Skip Intro**: Toggle the "Skip Intro" button in the Start Menu/Taskbar to bypass the boot sequence on future visits.
- **Data Entry**: Use the forms in each section to add data. All data is validated before saving.
- **Persistence**: Your data is saved automatically using the browser's **IndexedDB**, so it persists even after you close the browser.

## Technical Notes 🛠️

- **Architecture**: Built using a modular component-based architecture (`DashboardManager`, `TransactionManager`, etc.) with a central `app.js` controller.
- **Data Storage**: Uses **IndexedDB** for robust client-side storage of Categories, Transactions, and Budgets.
- **Styling**: Modular CSS structure (Base, Layout, Components, Sections) with no external frameworks (except Chart.js).
- **Visualization**: Integrates **Chart.js** for rendering dynamic financial charts.
- **State Management**: Implements an Observer-like pattern to synchronize data across components (e.g., updating the Budget view when a new Transaction is added).

## Files 📁

- `index.html` — Main entry point and application shell.
- `js/app.js` — Core logic, initialization, and component coordination.
- `js/db/db.js` — IndexedDB wrapper and schema definition.
- `js/components/` — Individual logic for Dashboard, Transactions, Budget, etc.
- `css/` — Organized styles (Base, Layout, Components, Sections).
- `resources/` — Icons and images for the Windows 95 theme.
