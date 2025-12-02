//navigation component
export class Navigation {
    constructor() {
        this.navItems = document.querySelectorAll('.nav-item');
        this.sections = document.querySelectorAll('.view-section');

        this.init();
    }

    init() {
        this.navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetId = item.getAttribute('data-target');
                this.switchView(targetId);
            });
        });
    }

    // method to switch views in the application
    switchView(targetId) {
        // 1. update menu (active class)
        this.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
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
}