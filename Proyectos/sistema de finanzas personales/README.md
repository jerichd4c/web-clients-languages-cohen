<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h3 align="center">Personal Finance System</h3>

  <p align="center">
    A retro-styled finance manager with a nostalgic Windows 95 aesthetic.
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#features--screens">Features & Screens</a></li>
    <li><a href="#technical-notes">Technical Notes</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->
## About The Project

A comprehensive personal finance application built with a faithful recreation of the **Windows 95 interface**. Track income, expenses, and monthly budgets with full data persistence.

### Built With

* HTML5
* CSS3 (Modular)
* JavaScript (Vanilla)
* IndexedDB
* [Chart.js](https://www.chartjs.org/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->
## Getting Started

To launch the system:

1. Navigate to `Proyectos/sistema de finanzas personales/`.
2. Open `index.html` in your browser.
3. Experience the **boot sequence** (optional: press Esc to skip).
4. Use the bottom **Taskbar** to navigate between apps.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FEATURES & SCREENS -->
## Features & Screens

- **Dashboard**: Financial health overview with dynamic charts.
- **Transactions**: Ledger for recording and filtering income/expenses.
- **Budget**: Monthly limits tracking with real-time progress bars.
- **Categories**: Custom categorization system for transactions.
- **Start Menu**: App settings and "Skip Intro" toggle for faster access.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- TECHNICAL NOTES -->
## Technical Notes

- **Architecture**: Modular component-based logic (`DashboardManager`, `TransactionManager`).
- **Persistence**: Built on **IndexedDB** for robust client-side storage.
- **State Management**: Observer-pattern synchronization across views.
- **Aesthetic**: Custom CSS tokens mimicking classic UI elements without frameworks.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- FILES -->
## Files

- `index.html` — Main UI shell
- `js/app.js` — Core coordinator
- `js/db/db.js` — IndexedDB wrapper
- `css/` — Modular styling (Base, Layout, Components)
- `resources/` — Retro assets and icons
