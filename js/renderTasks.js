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
    
    // Handle both new (startDateTime/endDateTime) and old (dueDate) formats for compatibility
    const startTime = task.startDateTime ? new Date(task.startDateTime) : null;
    const endTime = task.endDateTime ? new Date(task.endDateTime) : (task.dueDate ? new Date(task.dueDate) : null);
    
    const now = new Date();
    const isOverdue = endTime && endTime < now && !task.completed;
    const isDueSoon = endTime && endTime > now && endTime <= new Date(now.getTime() + 60 * 60 * 1000);
    
    let dateTimeDisplay = '';
    if (startTime || endTime) {
        const options = { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        if (startTime && endTime) {
            // Show both start and end times
            const startDisplay = startTime.toLocaleDateString('en-US', options);
            const endDisplay = endTime.toLocaleDateString('en-US', options);
            dateTimeDisplay = `
                <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                    <i data-lucide="play" class="h-3 w-3"></i>
                    Start: ${startDisplay}
                </div>
                <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                    <i data-lucide="flag" class="h-3 w-3"></i>
                    End: ${endDisplay}
                </div>
            `;
        } else if (startTime) {
            // Show only start time
            const startDisplay = startTime.toLocaleDateString('en-US', options);
            dateTimeDisplay = `
                <div class="task-due-date">
                    <i data-lucide="play" class="h-3 w-3"></i>
                    Start: ${startDisplay}
                </div>
            `;
        } else if (endTime) {
            // Show only end time (backward compatibility with dueDate)
            const endDisplay = endTime.toLocaleDateString('en-US', options);
            dateTimeDisplay = `
                <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                    <i data-lucide="flag" class="h-3 w-3"></i>
                    Due: ${endDisplay}
                </div>
            `;
        }
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
                    ${dateTimeDisplay}
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