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

// Initialize Supabase client
const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
