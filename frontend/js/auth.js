// Supabase Authentication Module

const Auth = {
    // Initialize Supabase Auth
    async init() {
        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (event, session) => {
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
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error && error.code === 'PGRST116') {
            // User doesn't exist in our table, create profile
            const role = user.user_metadata?.role || 'farmer';
            await this.createUserProfile(user, role);
        }

        // Hide login form and show dashboard
        this.redirectToDashboard();
    },

    // Handle sign out
    handleSignOut() {
        showLanding();
        document.getElementById('mainNav').style.display = 'none';
    },

    // Create user profile in our database
    async createUserProfile(user, role) {
        const { error } = await supabase
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
        return !!supabase.auth.getSession();
    },

    // Get current user
    getCurrentUser() {
        const { data: { session } } = supabase.auth.getSession();
        return session?.user || null;
    },

    // Get user profile from database
    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        return data;
    },

    // Login with email and password
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                throw error;
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
            const { data, error } = await supabase.auth.signUp({
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
                throw error;
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
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    },

    // Redirect to dashboard
    redirectToDashboard() {
        hideAllPages();
        document.getElementById('dashboardPage').style.display = 'block';
        document.getElementById('mainNav').style.display = 'block';

        // Load dashboard based on user role
        setTimeout(() => {
            loadDashboardHome();
        }, 100);
    }
};

// Initialize authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            Auth.handleSignIn(session);
        } else {
            showLanding();
        }
    });
});

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
        // Auth state change will handle the redirect
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
        // Auth state change will handle the redirect
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
