// Configuration file for AgriTrack

const CONFIG = {
    // API Backend URL
    API_URL: 'https://agritrack-api.onrender.com/api',

    // Supabase Configuration (Replace with your actual values)
    SUPABASE_URL: 'https://txgkmhjumamvcavvsolp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2ttaGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0',

    // Local Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'agritrack_token',
        USER: 'agritrack_user'
    }
};

// Initialize Supabase using the global supabase from CDN
const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthState();
});

function checkAuthState() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    const user = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);

    if (token && user) {
        try {
            const userData = JSON.parse(user);
            // Initialize dashboard instead of just showing it
            initializeDashboard();
        } catch (e) {
            console.error('Error parsing user data:', e);
            logout();
        }
    }
}

function logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    showLandingPage();
}
