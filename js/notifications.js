// Notification system for task reminders
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
        
        // Start checking for due tasks
        this.startDueTaskChecker();
    }

    startDueTaskChecker() {
        // Check every minute for due tasks
        setInterval(() => {
            this.checkDueTasks();
        }, 60000); // 60 seconds
        
        // Also check immediately
        this.checkDueTasks();
    }

    async checkDueTasks() {
        // Import taskManager dynamically to avoid circular dependencies
        const { default: taskManager } = await import('./taskManager.js');
        const dueTasks = taskManager.getTasksDueSoon();
        
        dueTasks.forEach(task => {
            if (!this.notifications.has(task.id)) {
                this.scheduleNotification(task);
            }
        });
    }

    scheduleNotification(task) {
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const timeUntilDue = dueDate.getTime() - now.getTime();
        
        if (timeUntilDue > 0 && timeUntilDue <= 60 * 60 * 1000) { // Within 1 hour
            const timeoutId = setTimeout(() => {
                this.showNotification(task);
                this.notifications.delete(task.id);
            }, timeUntilDue);
            
            this.notifications.set(task.id, timeoutId);
        }
    }

    showNotification(task) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Task Reminder', {
                body: `"${task.description}" is due now!`,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: task.id,
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

            // Auto-close after 10 seconds
            setTimeout(() => {
                notification.close();
            }, 10000);
        } else {
            // Fallback to in-app notification
            this.showInAppNotification(task);
        }
    }

    showInAppNotification(task) {
        // Create a visual notification banner
        const notification = document.createElement('div');
        notification.className = 'notification-banner';
        notification.innerHTML = `
            <div class="notification-content">
                <i data-lucide="bell" class="h-5 w-5"></i>
                <div class="notification-text">
                    <strong>Task Due:</strong> ${task.description}
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

    clearNotification(taskId) {
        if (this.notifications.has(taskId)) {
            clearTimeout(this.notifications.get(taskId));
            this.notifications.delete(taskId);
        }
    }

    clearAllNotifications() {
        this.notifications.forEach(timeoutId => clearTimeout(timeoutId));
        this.notifications.clear();
    }
}

// Create and export singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;