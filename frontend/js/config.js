// Configuration file for AgriTrack

const CONFIG = {
    // API Backend URL (for file uploads and other operations)
    API_URL: 'https://agritrack-api.onrender.com/api',

    // Supabase Configuration - UPDATE WITH YOUR FRESH API KEY
    // Get a fresh API key from: https://supabase.com/dashboard/project/txgkmhjumamvcavvsolp/settings/api
    SUPABASE_URL: 'https://txgkmhjumamvcavvsolp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2traGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0' // ⚠️ REPLACE WITH FRESH API KEY
};

// Check if API key is valid (not expired)
if (CONFIG.SUPABASE_ANON_KEY.includes('8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0')) {
    console.error('⚠️ WARNING: Supabase API key appears to be expired!');
    console.error('🔑 Please get a fresh API key from: https://supabase.com/dashboard/project/txgkmhjumamvcavvsolp/settings/api');
    console.error('📝 Update the key in frontend/js/config.js');
}

// Initialize Supabase client
let supabase;
try {
    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully');
        console.log('🔗 Supabase URL:', CONFIG.SUPABASE_URL);
        console.log('🔑 API Key status:', CONFIG.SUPABASE_ANON_KEY.includes('8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0') ? '⚠️ EXPIRED - Needs update' : '✅ Valid');
    } else {
        console.error('❌ Supabase library not loaded');
    }
} catch (error) {
    console.error('❌ Error initializing Supabase client:', error);
}

// Make supabase available globally
if (typeof window !== 'undefined') {
    window.supabase = supabase;
}

// Test connection on page load
if (typeof window !== 'undefined' && window.supabase) {
    setTimeout(async () => {
        try {
            const { data, error } = await window.supabase.auth.getSession();
            if (error) {
                console.log('🔍 Session check:', error.message);
                if (error.message.includes('Invalid API key')) {
                    console.error('❌ API key is invalid! Please update in config.js');
                }
            } else {
                console.log('✅ Session check successful');
            }
        } catch (err) {
            console.log('🔍 Connection test:', err.message);
        }
    }, 1000);
}
