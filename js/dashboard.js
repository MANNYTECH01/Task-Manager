// Dashboard page functionality
import taskManager from './taskManager.js';
import { initIcons, getRandomTip, showToast, initTheme, toggleTheme } from './utils.js';
import notificationManager from './notifications.js';

class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.renderStats();
        this.renderProductivityTip();
        this.attachEventListeners();
        initTheme();
        initIcons();
    }

    renderStats() {
        const stats = taskManager.getTaskStats();
        const tasks = taskManager.getTasks();
        const container = document.getElementById('stats-container');
        
        if (!container) return;

        // Calculate additional stats
        const importantTasks = tasks.filter(task => task.priority === 'important' && !task.completed).length;
        const now = new Date();
        const overdueTasks = tasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            return new Date(task.dueDate) < now;
        }).length;

        container.innerHTML = `
            <div class="stat-card">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold">Total Tasks</h3>
                    <i data-lucide="bar-chart-3" class="h-5 w-5 text-muted-foreground"></i>
                </div>
                <div class="text-3xl font-bold text-primary">${stats.total}</div>
                <p class="text-sm text-muted-foreground">All your tasks</p>
            </div>

            <div class="stat-card">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold">Completed</h3>
                    <i data-lucide="check-circle" class="h-5 w-5 text-success"></i>
                </div>
                <div class="text-3xl font-bold text-success">${stats.completed}</div>
                <p class="text-sm text-muted-foreground">Tasks finished</p>
            </div>

            <div class="stat-card">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold">Remaining</h3>
                    <i data-lucide="circle" class="h-5 w-5 text-muted-foreground"></i>
                </div>
                <div class="text-3xl font-bold">${stats.incomplete}</div>
                <p class="text-sm text-muted-foreground">Tasks to do</p>
            </div>

            <div class="stat-card">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold">Important</h3>
                    <i data-lucide="star" class="h-5 w-5" style="color: hsl(var(--important))"></i>
                </div>
                <div class="text-3xl font-bold" style="color: hsl(var(--important))">${importantTasks}</div>
                <p class="text-sm text-muted-foreground">High priority</p>
            </div>

            <div class="stat-card">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="text-lg font-semibold">Overdue</h3>
                    <i data-lucide="alert-triangle" class="h-5 w-5 text-danger"></i>
                </div>
                <div class="text-3xl font-bold text-danger">${overdueTasks}</div>
                <p class="text-sm text-muted-foreground">Past due date</p>
            </div>

            <div class="stat-card" style="grid-column: 1 / -1;">
                <h3 class="text-lg font-semibold mb-4">Progress Overview</h3>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span class="font-medium">${stats.completionRate}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${stats.completionRate}%"></div>
                    </div>
                </div>
            </div>
        `;

        initIcons();
    }

    renderProductivityTip() {
        const tipElement = document.getElementById('productivity-tip');
        if (tipElement) {
            tipElement.textContent = getRandomTip();
        }
    }

    attachEventListeners() {
        const clearCompletedBtn = document.getElementById('clear-completed');
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => {
                const clearedCount = taskManager.clearCompleted();
                if (clearedCount > 0) {
                    showToast(`Cleared ${clearedCount} completed task${clearedCount > 1 ? 's' : ''}`, 'success');
                    this.renderStats(); // Refresh stats
                } else {
                    showToast('No completed tasks to clear', 'info');
                }
            });
        }

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const newTheme = toggleTheme();
                this.updateThemeIcon(newTheme);
            });
        }

        // Set initial theme icon
        this.updateThemeIcon(localStorage.getItem('theme') || 'light');
    }

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
                initIcons(); // Re-initialize icons to update the display
            }
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Dashboard();
});