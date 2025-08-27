// Task Manager Module - Core business logic
class TaskManager {
    constructor() {
        this.storageKey = 'ZenTask-tasks';
        this.tasks = this.loadTasks();
    }

    // Load tasks from localStorage
    loadTasks() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const tasks = JSON.parse(stored);
                // Convert date strings back to Date objects
                return tasks;
            }
        } catch (error) {
            console.warn('Error loading tasks from localStorage:', error);
        }
        return [];
    }

    // Save tasks to localStorage
    saveTasks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
        } catch (error) {
            console.warn('Error saving tasks to localStorage:', error);
        }
    }

    // Get all tasks
    getTasks() {
        return [...this.tasks];
    }

    // Add a new task
    addTask(description, priority = 'normal', dueDate = null) {
        if (!description || !description.trim()) {
            throw new Error('Task description is required');
        }

        const newTask = {
            id: Date.now().toString(),
            description: description.trim(),
            completed: false,
            priority: priority,
            dueDate: dueDate,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(newTask);
        this.saveTasks();
        return newTask;
    }

    // Delete a task by ID
    deleteTask(id) {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => task.id !== id);
        
        if (this.tasks.length < initialLength) {
            this.saveTasks();
            return true;
        }
        return false;
    }

    // Toggle task completion status
    toggleComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            return task;
        }
        return null;
    }

    // Update task description, priority, or due date
    updateTask(id, updates) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            if (updates.description !== undefined) {
                if (!updates.description || !updates.description.trim()) {
                    throw new Error('Task description is required');
                }
                task.description = updates.description.trim();
            }
            if (updates.priority !== undefined) {
                task.priority = updates.priority;
            }
            if (updates.dueDate !== undefined) {
                task.dueDate = updates.dueDate;
            }
            this.saveTasks();
            return task;
        }
        return null;
    }

    // Toggle task priority
    togglePriority(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.priority = task.priority === 'important' ? 'normal' : 'important';
            this.saveTasks();
            return task;
        }
        return null;
    }

    // Get tasks due soon (within next hour)
    getTasksDueSoon() {
        const now = new Date();
        const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
        
        return this.tasks.filter(task => {
            if (task.completed || !task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate <= oneHourFromNow && dueDate > now;
        });
    }

    // Get sorted tasks (incomplete first, then completed, priority order, then by due date)
    getSortedTasks() {
        return [...this.tasks].sort((a, b) => {
            // Show incomplete tasks first
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Within same completion status, sort by priority (important first)
            if (a.priority !== b.priority) {
                const priorityOrder = { important: 0, normal: 1 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            
            // Then by due date (soonest first)
            if (a.dueDate && b.dueDate) {
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            }
            if (a.dueDate && !b.dueDate) return -1;
            if (!a.dueDate && b.dueDate) return 1;
            
            // Finally by creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    // Get task statistics
    getTaskStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const incomplete = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            incomplete,
            completionRate
        };
    }

    // Clear all completed tasks
    clearCompleted() {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => !task.completed);
        
        if (this.tasks.length < initialLength) {
            this.saveTasks();
            return initialLength - this.tasks.length;
        }
        return 0;
    }
}

// Create and export a singleton instance
const taskManager = new TaskManager();
export default taskManager;