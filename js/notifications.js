// Notification system for task reminders and start time alerts
import { showToast } from './utils.js';

class NotificationManager {
    constructor() {
        this.notifications = new Map();
        this.isInitialized = false;
    }

    async init() {
        // Prevent multiple initializations
        if (this.isInitialized) return;
        this.isInitialized = true;

        if ('Notification' in window) {
            const permission = Notification.permission;
            if (permission === 'default') {
                // If permission hasn't been granted or denied, show the native browser pop-up.
                await Notification.requestPermission();
            } else if (permission === 'denied') {
                // If permission was explicitly blocked, show a clear, one-time alert with instructions.
                // This is the standard way to handle this, as browsers prevent asking again.
                alert(
                    'Notifications are currently blocked by your browser.\n\n' +
                    'To enable them, please go to your browser settings for this site and change the notification permission to "Allow".\n\n' +
                    'You can usually find this by clicking the lock icon 🔒 next to the website address.'
                );
            }
        }
        
        // Always start the checker. It will only send notifications if permission is granted.
        this.startTaskChecker();
    }

    startTaskChecker() {
        // Check every 30 seconds for tasks that need notifications
        setInterval(() => {
            this.checkTasksForNotifications();
        }, 30000); // 30 seconds
        
        // Also check immediately on load
        this.checkTasksForNotifications();
    }

    async checkTasksForNotifications() {
        // Import taskManager dynamically to avoid circular dependencies
        const { default: taskManager } = await import('./taskManager.js');
        
        const dueTasks = taskManager.getTasksDueSoon();
        dueTasks.forEach(task => {
            if (!this.notifications.has(`due-${task.id}`)) {
                this.scheduleNotification(task, 'due');
            }
        });
        
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
                ? 'Task Manager - Time to Start Task' 
                : 'Task Manager - Task Due Soon';
                
            const body = type === 'start'
                ? `It's time to start: "${task.description}"`
                : `"${task.description}" is due soon!`;
            
            const options = {
                body: body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                tag: `${type}-${task.id}`,
                renotify: true,
                requireInteraction: true,
                vibrate: [200, 100, 200]
            };

            const notification = new Notification(title, options);

            notification.onclick = () => {
                window.focus();
                if (!window.location.pathname.includes('tasks.html')) {
                    window.location.href = 'tasks.html';
                }
                notification.close();
            };

            setTimeout(() => {
                notification.close();
            }, 15000);
        } else {
            this.showInAppNotification(task, type);
        }
    }

    showInAppNotification(task, type) {
        const existingBanner = document.querySelector('.notification-banner');
        if (existingBanner) {
            existingBanner.remove();
        }

        const message = type === 'start' 
            ? `It's time to start: "${task.description}"` 
            : `"${task.description}" is due soon!`;
        const icon = type === 'start' ? 'play-circle' : 'bell';

        const banner = document.createElement('div');
        banner.className = 'notification-banner';
        banner.style.display = 'block';
        banner.innerHTML = `
            <div class="notification-content">
                <i data-lucide="${icon}" class="h-5 w-5 text-primary"></i>
                <div class="notification-text">
                    <span>${message}</span>
                </div>
                <button class="notification-close">
                    <i data-lucide="x" class="h-4 w-4"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(banner);

        banner.querySelector('.notification-close').addEventListener('click', () => {
            banner.remove();
        });
        
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        setTimeout(() => {
            if (banner.parentElement) {
                banner.remove();
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
    
    async requestNotificationPermission() {
        if ('Notification' in window) {
            return await Notification.requestPermission();
        }
        return 'denied';
    }
    
    areNotificationsEnabled() {
        return 'Notification' in window && Notification.permission === 'granted';
    }
}

// Create and export singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;