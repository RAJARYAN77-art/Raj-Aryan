// auth-protection.js - Complete Page Protection System
(function() {
    'use strict';
    
    const AuthProtection = {
        // Pages that don't require authentication (public pages)
        PUBLIC_PAGES: [
            'index.html',
            'login.html', 
            'signup.html',
            'about.html'
        ],
        
        // Initialize protection system
        init: function() {
            this.protectCurrentPage();
            this.setupGlobalClickHandler();
            this.updateNavigation();
            
            console.log('AuthProtection: System initialized');
        },
        
        // Check if user is logged in
        isLoggedIn: function() {
            try {
                const userData = sessionStorage.getItem('user');
                if (!userData) return false;
                
                const user = JSON.parse(userData);
                return user && user.isAuthenticated === true;
            } catch (e) {
                return false;
            }
        },
        
        // Get current user data
        getCurrentUser: function() {
            try {
                return JSON.parse(sessionStorage.getItem('user'));
            } catch (e) {
                return null;
            }
        },
        
        // Protect the current page
        protectCurrentPage: function() {
            const currentPage = this.getCurrentPageName();
            
            // Check if current page is public
            const isPublicPage = this.PUBLIC_PAGES.includes(currentPage);
            
            // If page is not public and user is not logged in, redirect to login
            if (!isPublicPage && !this.isLoggedIn()) {
                // Store the intended destination
                sessionStorage.setItem('redirectAfterLogin', window.location.href);
                window.location.href = 'login.html';
                return false;
            }
            
            // If user is on login/signup but already logged in, redirect to home
            if ((currentPage === 'login.html' || currentPage === 'signup.html') && this.isLoggedIn()) {
                window.location.href = 'index.html';
                return false;
            }
            
            return true;
        },
        
        // Setup global click handler to protect all links/buttons
        setupGlobalClickHandler: function() {
            document.addEventListener('click', (e) => {
                // Check if clicked element is a link or button
                const target = e.target;
                const isLink = target.tagName === 'A' && target.href;
                const isButton = target.tagName === 'BUTTON' || target.closest('button');
                
                if (isLink || isButton) {
                    // Get the target page from link href or button action
                    let targetPage = '';
                    
                    if (isLink) {
                        targetPage = this.extractPageName(target.href);
                    } else {
                        // For buttons, check if they have onclick or form action
                        const button = isButton ? (target.tagName === 'BUTTON' ? target : target.closest('button')) : null;
                        if (button) {
                            const onclick = button.getAttribute('onclick');
                            if (onclick && onclick.includes('location.href')) {
                                const match = onclick.match(/location\.href\s*=\s*['"]([^'"]+)['"]/);
                                if (match) targetPage = this.extractPageName(match[1]);
                            }
                        }
                    }
                    
                    // If target page is protected and user is not logged in, prevent action and redirect to login
                    if (targetPage && !this.PUBLIC_PAGES.includes(targetPage) && !this.isLoggedIn()) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Store intended destination
                        sessionStorage.setItem('redirectAfterLogin', this.getFullUrl(targetPage));
                        
                        // Show warning message
                        this.showLoginWarning();
                        
                        // Redirect to login
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 1000);
                        
                        return false;
                    }
                }
            });
        },
        
        // Extract page name from URL
        extractPageName: function(url) {
            try {
                // Handle both absolute and relative URLs
                const urlObj = new URL(url, window.location.origin);
                return urlObj.pathname.split('/').pop() || 'index.html';
            } catch (e) {
                // If URL parsing fails, try to extract manually
                const match = url.match(/([^\/]+)\.html/);
                return match ? match[0] : '';
            }
        },
        
        // Get full URL for a page
        getFullUrl: function(pageName) {
            return window.location.origin + '/' + pageName;
        },
        
        // Get current page name
        getCurrentPageName: function() {
            return window.location.pathname.split('/').pop() || 'index.html';
        },
        
        // Show login warning message
        showLoginWarning: function() {
            // Remove existing warning if any
            const existingWarning = document.getElementById('auth-warning');
            if (existingWarning) existingWarning.remove();
            
            // Create warning element
            const warning = document.createElement('div');
            warning.id = 'auth-warning';
            warning.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: rgba(255, 68, 68, 0.9);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 5px;
                    border: 2px solid #ff4444;
                    font-family: 'Courier New', monospace;
                    font-weight: bold;
                    z-index: 10000;
                    box-shadow: 0 0 20px rgba(255, 68, 68, 0.5);
                    animation: slideIn 0.3s ease;
                ">
                    ⚠️ ACCESS DENIED: Please login first
                </div>
            `;
            
            // Add styles for animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(warning);
            
            // Remove warning after 3 seconds
            setTimeout(() => {
                if (warning.parentNode) {
                    warning.parentNode.removeChild(warning);
                }
            }, 3000);
        },
        
        // Update navigation based on login status
        updateNavigation: function() {
            const nav = document.getElementById('main-nav');
            if (!nav) return;
            
            const user = this.getCurrentUser();
            const loginItem = nav.querySelector('[data-auth="login"]');
            const signupItem = nav.querySelector('[data-auth="signup"]');
            
            // Remove existing profile item
            const existingProfile = document.getElementById('nav-profile');
            if (existingProfile) existingProfile.remove();
            
            if (user) {
                // User is logged in - replace login/signup with profile
                if (loginItem) loginItem.style.display = 'none';
                if (signupItem) signupItem.style.display = 'none';
                
                // Add profile link
                const profileLi = document.createElement('li');
                profileLi.id = 'nav-profile';
                profileLi.innerHTML = `<a href="profile.html"><button>Profile (${user.name})</button></a>`;
                nav.appendChild(profileLi);
                
                // Show welcome message if element exists
                this.showWelcomeMessage();
            } else {
                // User is not logged in - ensure login/signup are visible
                if (loginItem) loginItem.style.display = 'block';
                if (signupItem) signupItem.style.display = 'block';
                
                // Hide welcome message
                this.hideWelcomeMessage();
            }
        },
        
        // Show welcome message on home page
        showWelcomeMessage: function() {
            const user = this.getCurrentUser();
            const welcomeMsg = document.getElementById('welcome-message');
            const userName = document.getElementById('user-name');
            
            if (welcomeMsg && userName && user) {
                welcomeMsg.style.display = 'block';
                userName.textContent = user.name;
            }
        },
        
        // Hide welcome message
        hideWelcomeMessage: function() {
            const welcomeMsg = document.getElementById('welcome-message');
            if (welcomeMsg) {
                welcomeMsg.style.display = 'none';
            }
        },
        
        // Login function
        login: function(userData) {
            try {
                sessionStorage.setItem('user', JSON.stringify(userData));
                this.updateNavigation();
                return true;
            } catch (e) {
                console.error('Login failed:', e);
                return false;
            }
        },
        
        // Logout function
        logout: function() {
            sessionStorage.removeItem('user');
            this.updateNavigation();
            window.location.href = 'login.html';
        },
        
        // Redirect after successful login
        redirectAfterLogin: function() {
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin') || 'index.html';
            sessionStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl;
        }
    };
    
    // Make it globally available
    window.AuthProtection = AuthProtection;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            AuthProtection.init();
        });
    } else {
        AuthProtection.init();
    }
    
})();