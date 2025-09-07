// Notification system for task reminders and start time alerts
class NotificationManager {
    constructor() {
        this.notifications = new Map();
        this.init();
    }

    async init() {
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
        
        // Start checking for due tasks and start times
        this.startTaskChecker();
    }

    startTaskChecker() {
        // Check every 30 seconds for tasks that need notifications
        setInterval(() => {
            this.checkTasksForNotifications();
        }, 30000); // 30 seconds
        
        // Also check immediately
        this.checkTasksForNotifications();
    }

    async checkTasksForNotifications() {
        // Import taskManager dynamically to avoid circular dependencies
        const { default: taskManager } = await import('./taskManager.js');
        
        // Check for tasks due soon
        const dueTasks = taskManager.getTasksDueSoon();
        dueTasks.forEach(task => {
            if (!this.notifications.has(`due-${task.id}`)) {
                this.scheduleNotification(task, 'due');
            }
        });
        
        // Check for tasks starting soon
        const startingTasks = taskManager.getTasksStartingSoon();
        startingTasks.forEach(task => {
            if (!this.notifications.has(`start-${task.id}`)) {
                this.scheduleNotification(task, 'start');
            }
        });
    }

    scheduleNotification(task, type) {
        let targetDate;
        let notificationType;
        
        if (type === 'due') {
            targetDate = new Date(task.dueDate || task.endDateTime);
            notificationType = 'due';
        } else {
            targetDate = new Date(task.startDateTime);
            notificationType = 'start';
        }
        
        const now = new Date();
        const timeUntil = targetDate.getTime() - now.getTime();
        
        // Schedule notification if within the next hour
        if (timeUntil > 0 && timeUntil <= 60 * 60 * 1000) {
            const timeoutId = setTimeout(() => {
                this.showSystemNotification(task, notificationType);
                this.notifications.delete(`${notificationType}-${task.id}`);
            }, timeUntil);
            
            this.notifications.set(`${notificationType}-${task.id}`, timeoutId);
        }
    }

    showSystemNotification(task, type) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const title = type === 'start' 
                ? 'TaskFlow - Time to Start Task' 
                : 'TaskFlow - Task Due Soon';
                
            const body = type === 'start'
                ? `It's time to start: "${task.description}"`
                : `"${task.description}" is due soon!`;
            
            const notification = new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `${type}-${task.id}`,
                requireInteraction: true
            });

            notification.onclick = () => {
                window.focus();
                // Navigate to tasks page if not already there
                if (!window.location.pathname.includes('tasks.html')) {
                    window.location.href = 'tasks.html';
                }
                notification.close();
            };

            // Auto-close after 15 seconds
            setTimeout(() => {
                notification.close();
            }, 15000);
        } else {
            // Fallback to in-app notification
            this.showInAppNotification(task, type);
        }
    }

    showInAppNotification(task, type) {
        // Create a visual notification banner
        const notification = document.createElement('div');
        notification.className = 'notification-banner';
        notification.innerHTML = `
            <div class="notification-content">
                <i data-lucide="${type === 'start' ? 'play' : 'bell'}" class="h-5 w-5"></i>
                <div class="notification-text">
                    <strong>${type === 'start' ? 'Time to Start:' : 'Task Due:'}</strong> ${task.description}
                </div>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i data-lucide="x" class="h-4 w-4"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Initialize icons for the notification
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    clearNotification(taskId, type = 'due') {
        const notificationKey = `${type}-${taskId}`;
        if (this.notifications.has(notificationKey)) {
            clearTimeout(this.notifications.get(notificationKey));
            this.notifications.delete(notificationKey);
        }
    }

    clearAllNotifications() {
        this.notifications.forEach(timeoutId => clearTimeout(timeoutId));
        this.notifications.clear();
    }
    
    // Method to manually request notification permissions
    async requestNotificationPermission() {
        if ('Notification' in window) {
            return await Notification.requestPermission();
        }
        return 'denied';
    }
    
    // Check if notifications are enabled
    areNotificationsEnabled() {
        return 'Notification' in window && Notification.permission === 'granted';
    }
}

// Create and export singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;