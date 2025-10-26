// Supabase Authentication Module

const Auth = {
    // Initialize Supabase Auth
    async init() {
        // Check if supabase is available
        if (!window.supabase) {
            console.error('❌ Supabase client not available');
            showErrorModal();
            return;
        }

        // Listen for auth state changes
        window.supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session);

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session) {
                    await this.handleSignIn(session);
                }
            } else if (event === 'SIGNED_OUT') {
                this.handleSignOut();
            }
        });
    },

    // Handle successful sign in
    async handleSignIn(session) {
        const user = session.user;

        // Check if user profile exists in our users table
        const { data: profile, error } = await window.supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error && error.code === 'PGRST116') {
            // User doesn't exist in our table, create profile
            const role = user.user_metadata?.role || 'farmer';
            await this.createUserProfile(user, role);
        }

        // Immediately hide login form and show dashboard (same as login forms)
        hideAllPages();
        document.getElementById('dashboardPage').style.display = 'block';
        document.getElementById('mainNav').style.display = 'block';

        // Update navigation with user info
        document.getElementById('userNameNav').textContent = profile?.full_name || user.email;

        // Load dashboard content
        setTimeout(() => {
            loadDashboardHome();
        }, 100);
    },

    // Handle sign out
    handleSignOut() {
        console.log('User signed out, redirecting to landing page');
        showLanding();
        document.getElementById('mainNav').style.display = 'none';
    },

    // Create user profile in our database
    async createUserProfile(user, role) {
        const { error } = await window.supabase
            .from('users')
            .insert({
                id: user.id,
                email: user.email,
                role: role,
                full_name: user.user_metadata?.full_name || user.email.split('@')[0]
            });

        if (error) {
            console.error('Error creating user profile:', error);
        }
    },

    // Check if user is authenticated
    isAuthenticated() {
        try {
            return !!window.supabase.auth.getSession();
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    },

    // Get current user with error handling
    async getCurrentUser() {
        try {
            const { data: { session }, error } = await window.supabase.auth.getSession();
            if (error) {
                console.error('Get session error:', error);
                return null;
            }
            return session?.user || null;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    },

    // Get user profile from database with error handling
    async getUserProfile(userId) {
        try {
            const { data, error } = await window.supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Get user profile error:', error);
            return null;
        }
    },

    // Login with email and password
    async login(email, password) {
        try {
            const { data, error } = await window.supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error('Login error:', error);
                return {
                    success: false,
                    error: error.message || 'Login failed'
                };
            }

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    },

    // Signup with email, password, and role
    async signup(userData) {
        try {
            const { data, error } = await window.supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.full_name,
                        role: userData.role,
                        phone: userData.phone
                    }
                }
            });

            if (error) {
                console.error('Signup error:', error);
                return {
                    success: false,
                    error: error.message || 'Signup failed'
                };
            }

            return {
                success: true,
                message: 'Account created successfully! Please check your email to verify your account.'
            };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                error: error.message || 'Signup failed'
            };
        }
    },

    // Logout
    async logout() {
        try {
            const { error } = await window.supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
            }

            // Immediately show landing page after logout
            showLanding();
        } catch (error) {
            console.error('Logout error:', error);
            // Still show landing page even if there's an error
            showLanding();
        }
    }
};

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();

    // Check current session with proper error handling
    try {
        const { data: { session }, error } = await window.supabase.auth.getSession();
        if (error) {
            console.error('Session check error:', error);
            showLanding();
            return;
        }

        if (session) {
            await Auth.handleSignIn(session);
        } else {
            showLanding();
        }
    } catch (error) {
        console.error('Initialization error:', error);
        showErrorModal();
    }
});

// Show error modal for authentication issues
function showErrorModal() {
    const modalHtml = `
        <div class="modal fade" id="errorModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">
                            <i class="fas fa-exclamation-triangle"></i> Authentication Error
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>There was an error with the authentication system.</strong></p>
                        <p>Please try the following:</p>
                        <ol>
                            <li>Refresh the page</li>
                            <li>Clear your browser cache and cookies</li>
                            <li>Try logging in again</li>
                            <li>If the problem persists, contact support</li>
                        </ol>
                        <div class="alert alert-info">
                            <strong>Console Output:</strong> Check the browser console for detailed error information.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="location.reload()">Refresh Page</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modal = new bootstrap.Modal(document.getElementById('errorModal'));
    modal.show();

    modal._element.addEventListener('hidden.bs.modal', () => {
        modal._element.remove();
    });
}

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

        // Immediately hide login form and show dashboard
        hideAllPages();
        document.getElementById('dashboardPage').style.display = 'block';
        document.getElementById('mainNav').style.display = 'block';

        // Load dashboard content
        setTimeout(() => {
            loadDashboardHome();
        }, 100);
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
        showToast(result.message, 'success');
        setTimeout(() => {
            showLogin();
        }, 2000);
    } else {
        showToast(result.error, 'error');
    }
});

// Handle landing page login form
document.getElementById('landingLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('landingLoginEmail').value;
    const password = document.getElementById('landingLoginPassword').value;

    showLoading();
    const result = await Auth.login(email, password);
    hideLoading();

    if (result.success) {
        showToast('Login successful!', 'success');

        // Immediately hide landing page and show dashboard
        hideAllPages();
        document.getElementById('dashboardPage').style.display = 'block';
        document.getElementById('mainNav').style.display = 'block';

        // Load dashboard content
        setTimeout(() => {
            loadDashboardHome();
        }, 100);
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
