// Configuration file for AgriTrack

const CONFIG = {
    // API Backend URL
    API_URL: 'http://localhost:3000/api',
    
    // Supabase Configuration (Replace with your actual values)
    SUPABASE_URL: 'YOUR_SUPABASE_PROJECT_URL',
    SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
    
    // Local Storage Keys
    STORAGE_KEYS: {
        TOKEN: 'agritrack_token',
        USER: 'agritrack_user'
    }
};

// Initialize Supabase client
let supabaseClient;
if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
}
