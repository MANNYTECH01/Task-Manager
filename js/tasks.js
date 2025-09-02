/**
 * TASKS PAGE FUNCTIONALITY MODULE
 * =============================== 
 * Handles task creation, management, and user interactions on the tasks page
 * Manages form validation, task rendering, and theme functionality
 */

// Tasks page functionality
import taskManager from './taskManager.js';
import { renderTasks } from './renderTasks.js';
import { initIcons, showToast, initTheme, toggleTheme } from './utils.js';
import notificationManager from './notifications.js';
import { initMobileMenu } from './mobileMenu.js';

class TasksPage {
    constructor() {
        this.init();
    }

    /**
     * TASKS PAGE INITIALIZATION
     * Sets up all page components and functionality
     */
    init() {
        this.renderAllUserTasks();
        this.updateTaskCountDisplay();
        this.attachUserInteractionListeners();
        initTheme();        // Initialize theme system
        initIcons();        // Initialize Lucide icons 
        initMobileMenu();   // Initialize mobile navigation
    }

    /**
     * TASK LIST RENDERING
     * Displays all user tasks with proper empty state handling
     */
    renderAllUserTasks() {
        const userTasksList = document.getElementById('user-tasks-list');
        const noTasksEmptyState = document.getElementById('no-tasks-empty-state');
        const sortedTasks = taskManager.getSortedTasks();

        // Early return if task list container not found
        if (!userTasksList) return;

        // Handle empty state when no tasks exist
        if (sortedTasks.length === 0) {
            userTasksList.style.display = 'none';
            if (noTasksEmptyState) noTasksEmptyState.style.display = 'block';
            return;
        }

        // Show task list and hide empty state
        userTasksList.style.display = 'block';
        if (noTasksEmptyState) noTasksEmptyState.style.display = 'none';

        // Render tasks with callback handlers for user interactions
        renderTasks(userTasksList, sortedTasks, {
            onToggle: (taskId) => this.handleTaskCompletionToggle(taskId),
            onDelete: (taskId) => this.handleTaskDeletion(taskId),
            onTogglePriority: (taskId) => this.handleTaskPriorityToggle(taskId)
        });
    }

    /**
     * USER INTERACTION EVENT LISTENERS
     * Sets up form handling, theme toggle, and other interactive elements
     */
    attachUserInteractionListeners() {
        // Get form elements with descriptive names
        const taskCreationForm = document.getElementById('task-creation-form');
        const taskDescriptionInput = document.getElementById('task-description-input');
        const taskPrioritySelect = document.getElementById('task-priority-select');
        const taskStartDateTimeInput = document.getElementById('task-start-datetime-input');
        const taskEndDateTimeInput = document.getElementById('task-end-datetime-input');
        const taskFormErrorMessage = document.getElementById('task-form-error-message');

        // Task creation form submission handling
        if (taskCreationForm) {
            taskCreationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Extract form data with validation
                const taskDescription = taskDescriptionInput.value.trim();
                const taskPriority = taskPrioritySelect.value;
                const taskStartDateTime = taskStartDateTimeInput.value || null;
                const taskEndDateTime = taskEndDateTimeInput.value || null;
                
                // Clear any previous error messages
                if (taskFormErrorMessage) {
                    taskFormErrorMessage.style.display = 'none';
                    taskFormErrorMessage.textContent = '';
                }

                // Validate required task description
                if (!taskDescription) {
                    this.displayFormError('Please enter a task description before adding.');
                    return;
                }

                try {
                    // Create new task and update interface
                    taskManager.addTask(taskDescription, taskPriority, taskStartDateTime, taskEndDateTime);
                    this.resetTaskCreationForm();
                    this.renderAllUserTasks();
                    this.updateTaskCountDisplay();
                    showToast('Task added successfully', 'success');
                } catch (error) {
                    this.displayFormError(error.message);
                }
            });
        }

        // Clear form errors when user starts typing
        if (taskDescriptionInput && taskFormErrorMessage) {
            taskDescriptionInput.addEventListener('input', () => {
                if (taskFormErrorMessage.style.display !== 'none') {
                    taskFormErrorMessage.style.display = 'none';
                    taskFormErrorMessage.textContent = '';
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
     * FORM ERROR DISPLAY HELPER
     * Shows validation errors to the user
     * @param {string} errorMessage - Error message to display
     */
    displayFormError(errorMessage) {
        const taskFormErrorMessage = document.getElementById('task-form-error-message');
        if (taskFormErrorMessage) {
            taskFormErrorMessage.textContent = errorMessage;
            taskFormErrorMessage.style.display = 'block';
        }
    }

    /**
     * FORM RESET HELPER
     * Clears all form fields after successful task creation
     */
    resetTaskCreationForm() {
        const taskDescriptionInput = document.getElementById('task-description-input');
        const taskPrioritySelect = document.getElementById('task-priority-select');
        const taskStartDateTimeInput = document.getElementById('task-start-datetime-input');
        const taskEndDateTimeInput = document.getElementById('task-end-datetime-input');
        
        if (taskDescriptionInput) taskDescriptionInput.value = '';
        if (taskPrioritySelect) taskPrioritySelect.value = 'normal';
        if (taskStartDateTimeInput) taskStartDateTimeInput.value = '';
        if (taskEndDateTimeInput) taskEndDateTimeInput.value = '';
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

    /**
     * TASK PRIORITY TOGGLE HANDLER
     * Handles user requests to change task priority
     * @param {string} taskId - ID of task to modify
     */
    handleTaskPriorityToggle(taskId) {
        const updatedTask = taskManager.togglePriority(taskId);
        if (updatedTask) {
            this.renderAllUserTasks();
            this.updateTaskCountDisplay();
            
            const priorityStatusMessage = updatedTask.priority === 'important' 
                ? 'marked as important' 
                : 'priority removed';
            showToast(`Task ${priorityStatusMessage}`, 'success');
        }
    }

    /**
     * TASK COMPLETION TOGGLE HANDLER  
     * Handles user requests to mark tasks as complete/incomplete
     * @param {string} taskId - ID of task to toggle
     */
    handleTaskCompletionToggle(taskId) {
        const updatedTask = taskManager.toggleComplete(taskId);
        if (updatedTask) {
            this.renderAllUserTasks();
            this.updateTaskCountDisplay();
            
            if (updatedTask.completed) {
                showToast('Task completed! 🎉', 'success');
            }
        }
    }

    /**
     * TASK DELETION HANDLER
     * Handles user requests to delete tasks
     * @param {string} taskId - ID of task to delete
     */
    handleTaskDeletion(taskId) {
        const wasDeleted = taskManager.deleteTask(taskId);
        if (wasDeleted) {
            this.renderAllUserTasks();
            this.updateTaskCountDisplay();
            showToast('Task deleted successfully', 'success');
        }
    }

    /**
     * TASK COUNT DISPLAY UPDATE
     * Updates the task counter in the page header
     */
    updateTaskCountDisplay() {
        const totalTaskCounter = document.getElementById('total-task-counter');
        if (totalTaskCounter) {
            const taskStatistics = taskManager.getTaskStats();
            totalTaskCounter.textContent = taskStatistics.total;
        }
    }
}

/**
 * TASKS PAGE INITIALIZATION
 * Initialize tasks page when DOM content is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    new TasksPage();
});