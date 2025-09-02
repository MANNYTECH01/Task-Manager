/**
 * MOBILE MENU FUNCTIONALITY MODULE
 * ================================
 * Handles mobile hamburger menu interactions and theme toggle synchronization
 * Provides responsive navigation for mobile devices
 */

// Initialize mobile menu functionality when DOM is loaded
export function initMobileMenu() {
    // Get references to mobile menu elements with descriptive names
    const mobileMenuHamburgerToggle = document.getElementById('mobile-menu-hamburger-toggle');
    const mobileNavigationDropdown = document.getElementById('mobile-navigation-dropdown');
    const mobileThemeToggleButton = document.getElementById('mobile-theme-toggle-button');
    
    // Early return if essential elements are not found
    if (!mobileMenuHamburgerToggle || !mobileNavigationDropdown) return;

    /**
     * HAMBURGER MENU TOGGLE HANDLER
     * Toggles the visibility of the mobile navigation dropdown
     */
    mobileMenuHamburgerToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event bubbling to document
        mobileNavigationDropdown.classList.toggle('menu-visible');
    });

    /**
     * CLICK OUTSIDE TO CLOSE HANDLER
     * Closes mobile menu when user clicks outside the menu area
     */
    document.addEventListener('click', (e) => {
        const clickedInsideMenu = mobileNavigationDropdown.contains(e.target);
        const clickedOnToggle = mobileMenuHamburgerToggle.contains(e.target);
        
        // Close menu if click was outside both menu and toggle button
        if (!clickedInsideMenu && !clickedOnToggle) {
            mobileNavigationDropdown.classList.remove('menu-visible');
        }
    });

    /**
     * NAVIGATION LINK CLICK HANDLER
     * Closes mobile menu when user selects a navigation link
     */
    const mobileNavigationLinks = mobileNavigationDropdown.querySelectorAll('.mobile-navigation-menu-link');
    mobileNavigationLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavigationDropdown.classList.remove('menu-visible');
        });
    });

    /**
     * MOBILE THEME TOGGLE SYNCHRONIZATION
     * Syncs mobile theme toggle with the desktop theme toggle button
     */
    if (mobileThemeToggleButton) {
        // Handle mobile theme toggle clicks by triggering desktop toggle
        mobileThemeToggleButton.addEventListener('click', () => {
            const desktopThemeToggle = document.getElementById('desktop-theme-toggle-button');
            if (desktopThemeToggle) {
                desktopThemeToggle.click(); // Delegate to main theme toggle logic
            }
        });

        /**
         * THEME ICON SYNCHRONIZATION OBSERVER
         * Keeps mobile theme toggle icon in sync with desktop toggle
         */
        const themeIconSyncObserver = new MutationObserver(() => {
            const desktopThemeToggle = document.getElementById('desktop-theme-toggle-button');
            if (desktopThemeToggle) {
                const desktopIcon = desktopThemeToggle.querySelector('i');
                const mobileIcon = mobileThemeToggleButton.querySelector('i');
                
                // Sync the icon attributes from desktop to mobile
                if (desktopIcon && mobileIcon) {
                    const iconType = desktopIcon.getAttribute('data-lucide');
                    mobileIcon.setAttribute('data-lucide', iconType);
                    
                    // Re-initialize Lucide icons to update the display
                    if (window.lucide) {
                        window.lucide.createIcons();
                    }
                }
            }
        });

        // Observe changes to the desktop theme toggle for icon synchronization
        const desktopThemeToggle = document.getElementById('desktop-theme-toggle-button');
        if (desktopThemeToggle) {
            themeIconSyncObserver.observe(desktopThemeToggle, {
                childList: true,    // Watch for child element changes
                subtree: true,      // Watch for changes in descendants
                attributes: true    // Watch for attribute changes
            });
        }
    }
}