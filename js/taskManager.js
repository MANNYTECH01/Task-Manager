// Task Manager Module - Core business logic
class TaskManager {
    constructor() {
        this.storageKey = 'Task Manager-tasks';
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

    // Add a new task with start and end times
    addTask(description, priority = 'normal', startDateTime = null, endDateTime = null) {
        if (!description || !description.trim()) {
            throw new Error('Task description is required');
        }

        const newTask = {
            id: Date.now().toString(),
            description: description.trim(),
            completed: false,
            priority: priority,
            startDateTime: startDateTime,
            endDateTime: endDateTime,
            dueDate: endDateTime, // For backward compatibility
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

    // Update task description, priority, or dates
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
            if (updates.startDateTime !== undefined) {
                task.startDateTime = updates.startDateTime;
            }
            if (updates.endDateTime !== undefined) {
                task.endDateTime = updates.endDateTime;
                task.dueDate = updates.endDateTime; // For backward compatibility
            }
            // Maintain backward compatibility
            if (updates.dueDate !== undefined) {
                task.endDateTime = updates.dueDate;
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

    // Get tasks due soon (within next hour) or starting soon
    // In Task Manager/js/taskManager.js

// Get tasks due soon (within next hour)
        getTasksDueSoon() {
            const now = new Date();
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
            
            return this.tasks.filter(task => {
                if (task.completed) return false;
                
                // Check only the end time (due date)
                const endTime = task.endDateTime || task.dueDate; // Backward compatibility
                if (endTime) {
                    const endDate = new Date(endTime);
                    return endDate <= oneHourFromNow && endDate > now;
                }
                
                return false;
            });
        }
// Get sorted tasks (important first, then by time)
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
                
                // For tasks with same priority, sort by time
                // Use end time if available, otherwise start time, otherwise creation time
                const getTaskTime = (task) => {
                    if (task.endDateTime) return new Date(task.endDateTime).getTime();
                    if (task.dueDate) return new Date(task.dueDate).getTime();
                    if (task.startDateTime) return new Date(task.startDateTime).getTime();
                    return new Date(task.createdAt).getTime();
                };
                
                const aTime = getTaskTime(a);
                const bTime = getTaskTime(b);
                
                return aTime - bTime; // Earliest first
            });
        }

        // Get tasks starting soon (within next hour)
        getTasksStartingSoon() {
            const now = new Date();
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
            
            return this.tasks.filter(task => {
                if (task.completed || !task.startDateTime) return false;
                
                const startDate = new Date(task.startDateTime);
                return startDate <= oneHourFromNow && startDate > now;
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