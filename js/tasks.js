// Tasks page functionality
import taskManager from './taskManager.js';
import { renderTasks } from './renderTasks.js';
import { initIcons, showToast, initTheme, toggleTheme } from './utils.js';
import notificationManager from './notifications.js';

class TasksPage {
    constructor() {
        this.init();
    }

    init() {
        this.renderAllTasks();
        this.updateTaskCount();
        this.attachEventListeners();
        initTheme();
        initIcons();
    }

    renderAllTasks() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');
        const tasks = taskManager.getSortedTasks();

        if (!taskList) return;

        if (tasks.length === 0) {
            taskList.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        taskList.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        renderTasks(taskList, tasks, {
            onToggle: (id) => this.handleToggleComplete(id),
            onDelete: (id) => this.handleDeleteTask(id),
            onTogglePriority: (id) => this.handleTogglePriority(id)
        });
    }

    attachEventListeners() {
        // Task form submission
        const taskForm = document.getElementById('task-form');
        const taskInput = document.getElementById('task-input');
        const prioritySelect = document.getElementById('priority-select');
        const dueDateInput = document.getElementById('due-date-input');
        const formError = document.getElementById('form-error');

        if (taskForm) {
            taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const description = taskInput.value.trim();
                const priority = prioritySelect.value;
                const dueDate = dueDateInput.value || null;
                
                // Clear previous error
                if (formError) {
                    formError.style.display = 'none';
                    formError.textContent = '';
                }

                if (!description) {
                    if (formError) {
                        formError.textContent = 'Please enter a task description before adding.';
                        formError.style.display = 'block';
                    }
                    return;
                }

                try {
                    taskManager.addTask(description, priority, dueDate);
                    taskInput.value = '';
                    prioritySelect.value = 'normal';
                    dueDateInput.value = '';
                    this.renderAllTasks();
                    this.updateTaskCount();
                    showToast('Task added successfully', 'success');
                } catch (error) {
                    if (formError) {
                        formError.textContent = error.message;
                        formError.style.display = 'block';
                    }
                }
            });
        }

        // Clear form error when user starts typing
        if (taskInput && formError) {
            taskInput.addEventListener('input', () => {
                if (formError.style.display !== 'none') {
                    formError.style.display = 'none';
                    formError.textContent = '';
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

    handleTogglePriority(taskId) {
        const task = taskManager.togglePriority(taskId);
        if (task) {
            this.renderAllTasks();
            this.updateTaskCount();
            
            const priorityText = task.priority === 'important' ? 'marked as important' : 'priority removed';
            showToast(`Task ${priorityText}`, 'success');
        }
    }

    handleToggleComplete(taskId) {
        const task = taskManager.toggleComplete(taskId);
        if (task) {
            this.renderAllTasks();
            this.updateTaskCount();
            
            if (task.completed) {
                showToast('Task completed! 🎉', 'success');
            }
        }
    }

    handleDeleteTask(taskId) {
        const deleted = taskManager.deleteTask(taskId);
        if (deleted) {
            this.renderAllTasks();
            this.updateTaskCount();
            showToast('Task deleted successfully', 'success');
        }
    }

    updateTaskCount() {
        const taskCountElement = document.getElementById('task-count');
        if (taskCountElement) {
            const stats = taskManager.getTaskStats();
            taskCountElement.textContent = stats.total;
        }
    }
}

// Initialize tasks page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TasksPage();
});