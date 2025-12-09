//navigation component
export class Navigation {
    constructor() {
        this.navItems = document.querySelectorAll('.taskbar-btn');
        this.sections = document.querySelectorAll('.view-section');

        this.init();
        this.initClock();
    }

    init() {
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.getAttribute('data-target');
                if (targetId) {
                    this.switchView(targetId);
                }
            });
        });
    }

    // method to switch views in the application
    switchView(targetId) {
        // 1. update menu (active class)
        this.navItems.forEach(item => {
            // only update active state for navigation items (those with data-target)
            if (item.getAttribute('data-target')) {
                item.classList.remove('active');
                if (item.getAttribute('data-target') === targetId) {
                    item.classList.add('active');
                }
            }
        });

        // 2. show corresponding section
        this.sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active');

                // optional: trigger event for graphs if in dashboard
                if (targetId === 'dashboard-section') {
                    document.getElementById('dashboard-month-picker').dispatchEvent(new Event('change'));
                }
            }
        });
    }

    // Initialize and update taskbar clock
    initClock() {
        const updateClock = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            const clockElement = document.querySelector('.time-text');
            if (clockElement) {
                clockElement.textContent = timeStr;
            }
        };

        // Update immediately and then every minute
        updateClock();
        setInterval(updateClock, 60000);
    }
}