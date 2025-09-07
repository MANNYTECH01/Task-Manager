// DOM rendering module for tasks
import { initIcons, formatDate } from './utils.js';

/**
 * Renders tasks in the specified container
 * @param {HTMLElement} container - The container element to render tasks in
 * @param {Array} tasks - Array of task objects
 * @param {Object} callbacks - Object containing onToggle, onDelete, onTogglePriority, and onEdit callbacks
 */
export function renderTasks(container, tasks, { onToggle, onDelete, onTogglePriority, onEdit }) {
    if (!container) return;
    
    if (tasks.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = tasks.map(task => renderTaskItem(task, { onToggle, onDelete, onTogglePriority, onEdit })).join('');
    attachTaskEventListeners(container, { onToggle, onDelete, onTogglePriority, onEdit });
    initIcons();
}

/**
 * Renders a single task item
 * @param {Object} task - Task object
 * @param {Object} callbacks - Callback functions
 * @returns {string} HTML string for the task item
 */
// In renderTasks.js, update the renderTaskItem function:

function renderTaskItem(task, { onToggle, onDelete, onTogglePriority, onEdit }) {
    const isImportant = task.priority === 'important';
    
    // Handle both new (startDateTime/endDateTime) and old (dueDate) formats for compatibility
    const startTime = task.startDateTime ? new Date(task.startDateTime) : null;
    const endTime = task.endDateTime ? new Date(task.endDateTime) : (task.dueDate ? new Date(task.dueDate) : null);
    
    const now = new Date();
    const isOverdue = endTime && endTime < now && !task.completed;
    const isDueSoon = endTime && endTime > now && endTime <= new Date(now.getTime() + 60 * 60 * 1000);
    
    let dateDisplay = '';
    if (startTime || endTime) {
        dateDisplay = '<div class="task-details">';
        
        if (startTime) {
            dateDisplay += `
                <div class="task-date ${isImportant ? 'important-date' : ''}">
                    <i data-lucide="calendar" class="h-3 w-3"></i>
                    ${formatDate(startTime)}
                </div>
            `;
        }
        
        if (endTime) {
            dateDisplay += `
                <div class="task-date ${isOverdue ? 'overdue' : ''} ${isImportant ? 'important-date' : ''}">
                    <i data-lucide="flag" class="h-3 w-3"></i>
                    ${formatDate(endTime)}
                </div>
            `;
        }
        
        dateDisplay += '</div>';
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
                    ${isImportant ? '<span class="priority-badge">Important</span>' : ''}
                </div>
                ${dateDisplay}
                
                <div class="task-edit-form">
                    <input type="text" class="edit-input task-edit-description" value="${task.description}" placeholder="Task description">
                    <input type="datetime-local" class="edit-input task-edit-start" value="${task.startDateTime || ''}" placeholder="Start time">
                    <input type="datetime-local" class="edit-input task-edit-end" value="${task.endDateTime || task.dueDate || ''}" placeholder="Due date">
                    <div class="checkbox-group">
                        <input type="checkbox" id="edit-priority-${task.id}" class="task-edit-priority" ${isImportant ? 'checked' : ''}>
                        <label for="edit-priority-${task.id}">Important</label>
                    </div>
                    <div class="edit-actions">
                        <button class="interactive-button interactive-button--primary btn-save-edit" data-action="save-edit">Save</button>
                        <button class="interactive-button interactive-button--secondary btn-cancel-edit" data-action="cancel-edit">Cancel</button>
                    </div>
                </div>
            </div>

            <div class="task-actions">
                <button class="btn btn-ghost priority-btn ${isImportant ? 'active' : ''}" 
                        data-action="priority" 
                        title="${isImportant ? 'Remove from important' : 'Mark as important'}">
                    <i data-lucide="${isImportant ? 'star' : 'star-off'}" class="h-4 w-4 ${isImportant ? 'text-important' : ''}"></i>
                </button>
                <button class="btn btn-ghost" data-action="edit" title="Edit task">
                    <i data-lucide="edit" class="h-4 w-4"></i>
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
// In renderTasks.js, update the attachTaskEventListeners function:

function attachTaskEventListeners(container, { onToggle, onDelete, onTogglePriority, onEdit }) {
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
            case 'edit':
                // Enable edit mode
                taskItem.classList.add('editing');
                break;
            case 'save-edit':
                // Get edited values
                const description = taskItem.querySelector('.task-edit-description').value;
                const startDateTime = taskItem.querySelector('.task-edit-start').value;
                const endDateTime = taskItem.querySelector('.task-edit-end').value;
                const priority = taskItem.querySelector('.task-edit-priority').checked ? 'important' : 'normal';
                
                // Call edit callback
                onEdit(taskId, { description, startDateTime, endDateTime, priority });
                
                // Exit edit mode
                taskItem.classList.remove('editing');
                break;
            case 'cancel-edit':
                // Exit edit mode without saving
                taskItem.classList.remove('editing');
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this task?')) {
                    onDelete(taskId);
                }
                break;
        }
    });
}