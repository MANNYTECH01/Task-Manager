/**
 * DASHBOARD PAGE FUNCTIONALITY MODULE
 * ==================================
 * Manages dashboard statistics, productivity tips, and user interactions
 * Handles theme management and task statistics visualization
 */

// Dashboard page functionality
import taskManager from './taskManager.js';
import { initIcons, getRandomTip, showToast, initTheme, toggleTheme } from './utils.js';
import notificationManager from './notifications.js';
import { initMobileMenu } from './mobileMenu.js';

class Dashboard {
    constructor() {
        this.init();
    }

    /**
     * DASHBOARD INITIALIZATION
     * Sets up all dashboard components and event listeners
     */
    init() {
        this.renderStatisticsCards();
        this.renderDailyProductivityTip();
        this.attachUserInteractionListeners();
        this.setupNotificationButton(); // Add this line
        initTheme();        // Initialize theme system
        initIcons();        // Initialize Lucide icons
        initMobileMenu();   // Initialize mobile navigation
        
        // Explicitly start the notification manager
        notificationManager.init();
    }


    /**
     * STATISTICS CARDS RENDERING
     * Generates and displays task statistics in interactive cards
     */
    //dashboard.js
    renderStatisticsCards() {
        const taskStatistics = taskManager.getTaskStats();
        const statisticsContainer = document.getElementById('dashboard-statistics-container');
        
        // Early return if container element not found
        if (!statisticsContainer) return;

        // Generate statistics cards HTML with descriptive classes and accessibility
        statisticsContainer.innerHTML = `
            <div class="dashboard-statistics-card" role="button" tabindex="0" aria-label="Total tasks: ${taskStatistics.total}">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold">Total Tasks</h3>
                    <i data-lucide="bar-chart-3" class="h-5 w-5 text-muted-foreground" title="Total tasks icon"></i>
                </div>
                <div class="text-3xl font-bold text-primary">${taskStatistics.total}</div>
                <p class="text-sm text-muted-foreground">All your tasks</p>
            </div>

            <div class="dashboard-statistics-card" role="button" tabindex="0" aria-label="Completed tasks: ${taskStatistics.completed}">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold">Completed</h3>
                    <i data-lucide="check-circle" class="h-5 w-5 text-success" title="Completed tasks icon"></i>
                </div>
                <div class="text-3xl font-bold text-success">${taskStatistics.completed}</div>
                <p class="text-sm text-muted-foreground">Tasks finished</p>
            </div>

            <div class="dashboard-statistics-card" role="button" tabindex="0" aria-label="Remaining tasks: ${taskStatistics.incomplete}">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold">Remaining</h3>
                    <i data-lucide="circle" class="h-5 w-5 text-muted-foreground" title="Remaining tasks icon"></i>
                </div>
                <div class="text-3xl font-bold">${taskStatistics.incomplete}</div>
                <p class="text-sm text-muted-foreground">Tasks to do</p>
            </div>

            <div class="dashboard-statistics-card" style="grid-column: 1 / -1;" role="region" aria-label="Progress overview">
                <h3 class="text-lg font-semibold mb-4">Progress Overview</h3>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span class="font-medium">${taskStatistics.completionRate}%</span>
                    </div>
                    <div class="progress-bar" role="progressbar" aria-valuenow="${taskStatistics.completionRate}" aria-valuemin="0" aria-valuemax="100" aria-label="Task completion progress">
                        <div class="progress-fill" style="width: ${taskStatistics.completionRate}%"></div>
                    </div>
                </div>
            </div>
        `;

        // Re-initialize icons after DOM update
        initIcons();
    }
    
    /**
     * PRODUCTIVITY TIP RENDERING
     * Displays a random productivity tip to help user engagement
     */
    renderDailyProductivityTip() {
        const productivityTipElement = document.getElementById('daily-productivity-tip-content');
        if (productivityTipElement) {
            productivityTipElement.textContent = getRandomTip();
        }
    }

    /**
     * NOTIFICATION BUTTON SETUP
     * Configures the "Enable Notifications" button based on permission status.
     */
    setupNotificationButton() {
        const enableNotificationsButton = document.getElementById('enable-notifications-button');
        if (!enableNotificationsButton || !('Notification' in window)) {
            return; // Exit if button or Notification API not present
        }

        const updateButtonVisibility = () => {
            if (Notification.permission === 'granted') {
                enableNotificationsButton.style.display = 'none';
            } else {
                enableNotificationsButton.style.display = 'inline-flex';
                initIcons(); // Re-render Lucide icon
            }
        };

        // Set initial visibility
        updateButtonVisibility();

        // Add click listener
        enableNotificationsButton.addEventListener('click', async () => {
            if (Notification.permission === 'denied') {
                // Guide user to manually enable notifications if they are blocked
                alert(
                    'Notifications are currently blocked by your browser.\n\n' +
                    'To enable them, please go to your browser settings for this site and change the notification permission to "Allow".\n\n' +
                    'You can usually find this by clicking the lock icon 🔒 next to the website address.'
                );
            } else if (Notification.permission === 'default') {
                // Request permission if not yet decided
                const permission = await notificationManager.requestNotificationPermission();
                if (permission === 'granted') {
                    showToast('Notifications enabled successfully!', 'success');
                }
                updateButtonVisibility(); // Hide button after granting
            }
        });
    }

    /**
     * USER INTERACTION EVENT LISTENERS
     Sets up all interactive elements and their event handlers
     */
    attachUserInteractionListeners() {
        // Clear completed tasks button functionality
        const clearCompletedButton = document.getElementById('clear-completed-tasks-button');
        if (clearCompletedButton) {
            clearCompletedButton.addEventListener('click', () => {
                const clearedTasksCount = taskManager.clearCompleted();
                if (clearedTasksCount > 0) {
                    const taskWord = clearedTasksCount > 1 ? 'tasks' : 'task';
                    showToast(`Cleared ${clearedTasksCount} completed ${taskWord}`, 'success');
                    this.renderStatisticsCards(); // Refresh statistics display
                } else {
                    showToast('No completed tasks to clear', 'info');
                }
            });
        }

        // Desktop theme toggle functionality
        const desktopThemeToggle = document.getElementById('desktop-theme-toggle-button');
        if (desktopThemeToggle) {
            desktopThemeToggle.addEventListener('click', () => {
                const newThemeMode = toggleTheme();
                this.updateThemeToggleIcons(newThemeMode);
            });
        }

        // Set initial theme toggle icon state
        const currentTheme = localStorage.getItem('theme') || 'light';
        this.updateThemeToggleIcons(currentTheme);
    }

    /**
     * THEME TOGGLE ICON MANAGEMENT
     * Updates both desktop and mobile theme toggle icons consistently
     * @param {string} themeMode - Current theme mode ('light' or 'dark')
     */
    updateThemeToggleIcons(themeMode) {
        const desktopThemeToggle = document.getElementById('desktop-theme-toggle-button');
        const mobileThemeToggle = document.getElementById('mobile-theme-toggle-button');
        
        // Update both desktop and mobile theme toggle icons
        [desktopThemeToggle, mobileThemeToggle].forEach(toggleButton => {
            if (toggleButton) {
                const iconElement = toggleButton.querySelector('i');
                if (iconElement) {
                    // Set appropriate icon: sun for dark mode, moon for light mode
                    const iconName = themeMode === 'dark' ? 'sun' : 'moon';
                    iconElement.setAttribute('data-lucide', iconName);
                }
            }
        });
        
        // Re-initialize Lucide icons to apply changes
        initIcons();
    }
}

/**
 * DASHBOARD INITIALIZATION
 * Initialize dashboard when DOM content is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});