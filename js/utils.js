// Utility functions

// Show toast notification
export function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.style.display = 'block';
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    } else {
        // Fallback to alert if toast elements not found
        alert(message);
    }
}

// Initialize Lucide icons
export function initIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Format date for display
export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

// Productivity tips
export const productivityTips = [
    "Break large tasks into smaller, manageable chunks to avoid overwhelm.",
    "Use the 2-minute rule: If it takes less than 2 minutes, do it now!",
    "Prioritize your tasks using the Eisenhower Matrix: urgent vs important.",
    "Take regular breaks to maintain focus and prevent burnout.",
    "Review and update your task list daily to stay organized.",
    "Celebrate small wins to maintain motivation and momentum.",
    "Focus on one task at a time to improve quality and efficiency.",
    "Set specific deadlines for your tasks to create accountability."
];

// Get random productivity tip
export function getRandomTip() {
    return productivityTips[Math.floor(Math.random() * productivityTips.length)];
}

// Theme management
export function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

export function setTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
}

export function toggleTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
}