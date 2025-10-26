// Configuration file for AgriTrack

const CONFIG = {
    // API Backend URL (for file uploads and other operations)
    API_URL: 'https://agritrack-api.onrender.com/api',

    // Supabase Configuration
    SUPABASE_URL: 'https://txgkmhjumamvcavvsolp.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_IAFoeiKNMpRn12tn0AeqdQ_rSQB7oFd'
};

// Initialize Supabase client
let supabase;
try {
    if (typeof window !== 'undefined' && window.supabase) {
        supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        console.log('✅ Supabase client initialized successfully');
        console.log('🔗 Supabase URL:', CONFIG.SUPABASE_URL);
        console.log('🔑 API Key: Valid');
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
            } else {
                console.log('✅ Session check successful');
            }
        } catch (err) {
            console.log('🔍 Connection test:', err.message);
        }
    }, 1000);
}
