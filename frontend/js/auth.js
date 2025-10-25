// Authentication Module

const Auth = {
    // Check if user is logged in
    isAuthenticated() {
        return !!localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    },

    // Get current user
    getCurrentUser() {
        const userJson = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
        return userJson ? JSON.parse(userJson) : null;
    },

    // Get auth token
    getToken() {
        return localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    },

    // Set auth data
    setAuthData(token, user) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(user));
    },

    // Clear auth data
    clearAuthData() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    },

    // Login
    async login(email, password) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store token and user data
            this.setAuthData(data.session.access_token, data.user);

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    // Signup
    async signup(userData) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            return { success: true, message: data.message };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    },

    // Logout
    async logout() {
        try {
            const token = this.getToken();
            if (token) {
                await fetch(`${CONFIG.API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuthData();
            window.location.href = '/';
        }
    },

    // Get current user from server
    async getCurrentUserFromServer() {
        try {
            const token = this.getToken();
            if (!token) return null;

            const response = await fetch(`${CONFIG.API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                this.clearAuthData();
                return null;
            }

            const data = await response.json();
            return data.user;
        } catch (error) {
            console.error('Get user error:', error);
            return null;
        }
    }
};

// Handle login form
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    showLoading();
    const result = await Auth.login(email, password);
    hideLoading();

    if (result.success) {
        showToast('Login successful!', 'success');
        setTimeout(() => {
            initializeDashboard();
        }, 500);
    } else {
        showToast(result.error, 'error');
    }
});

// Handle signup form
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const userData = {
        full_name: document.getElementById('signupName').value,
        email: document.getElementById('signupEmail').value,
        phone: document.getElementById('signupPhone').value,
        password: document.getElementById('signupPassword').value,
        role: document.getElementById('signupRole').value
    };

    showLoading();
    const result = await Auth.signup(userData);
    hideLoading();

    if (result.success) {
        showToast('Account created successfully! Please login.', 'success');
        setTimeout(() => {
            showLogin();
        }, 1500);
    } else {
        showToast(result.error, 'error');
    }
});

// Logout button handler
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        Auth.logout();
    }
});
