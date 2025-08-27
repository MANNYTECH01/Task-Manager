// DOM rendering module for tasks
import { initIcons } from './utils.js';

/**
 * Renders tasks in the specified container
 * @param {HTMLElement} container - The container element to render tasks in
 * @param {Array} tasks - Array of task objects
 * @param {Object} callbacks - Object containing onToggle, onDelete, and onTogglePriority callbacks
 */
export function renderTasks(container, tasks, { onToggle, onDelete, onTogglePriority }) {
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = tasks.map(task => renderTaskItem(task, { onToggle, onDelete, onTogglePriority })).join('');
    attachTaskEventListeners(container, { onToggle, onDelete, onTogglePriority });
    initIcons();
}

/**
 * Renders a single task item
 * @param {Object} task - Task object
 * @param {Object} callbacks - Callback functions
 * @returns {string} HTML string for the task item
 */
function renderTaskItem(task, { onToggle, onDelete, onTogglePriority }) {
    const isImportant = task.priority === 'important';
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const now = new Date();
    const isOverdue = dueDate && dueDate < now && !task.completed;
    const isDueSoon = dueDate && dueDate > now && dueDate <= new Date(now.getTime() + 60 * 60 * 1000);
    
    let dueDateDisplay = '';
    if (dueDate) {
        const options = { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        dueDateDisplay = dueDate.toLocaleDateString('en-US', options);
    }

    return `
        <li class="task-item ${isImportant ? 'important' : ''} ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}" data-task-id="${task.id}">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                data-action="toggle"
            />
            
            <div class="task-content">
                <div class="task-text ${task.completed ? 'completed' : ''}">
                    <span>${task.description}</span>
                    ${dueDate ? `<div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                        <i data-lucide="clock" class="h-3 w-3"></i>
                        ${dueDateDisplay}
                    </div>` : ''}
                </div>
            </div>

            <div class="task-actions">
                <button class="btn btn-ghost priority-btn ${isImportant ? 'active' : ''}" 
                        data-action="priority" 
                        title="${isImportant ? 'Remove from important' : 'Mark as important'}">
                    <i data-lucide="star" class="h-4 w-4"></i>
                </button>
                <button class="btn btn-ghost btn-danger" data-action="delete" title="Delete task">
                    <i data-lucide="trash-2" class="h-4 w-4"></i>
                </button>
            </div>
        </li>
    `;
}

/**
 * Attaches event listeners to task items
 * @param {HTMLElement} container - Container element
 * @param {Object} callbacks - Callback functions
 */
function attachTaskEventListeners(container, { onToggle, onDelete, onTogglePriority }) {
    container.addEventListener('click', (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        
        const taskId = taskItem.dataset.taskId;
        const action = e.target.dataset.action || e.target.closest('[data-action]')?.dataset.action;

        switch (action) {
            case 'toggle':
                onToggle(taskId);
                break;
            case 'priority':
                onTogglePriority(taskId);
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this task?')) {
                    onDelete(taskId);
                }
                break;
        }
    });
}