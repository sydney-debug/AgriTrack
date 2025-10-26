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
