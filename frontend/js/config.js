// Configuration file for AgriTrack

const CONFIG = {
    // API Backend URL (for file uploads and other operations)
    API_URL: 'https://agritrack-api.onrender.com/api',

    // Supabase Configuration
    SUPABASE_URL: 'https://txgkmhjumamvcavvsolp.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4Z2traGp1bWFtdmNhdnZzb2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNzg3ODMsImV4cCI6MjA3Njk1NDc4M30.8AkJbTeDOIXQMT34KsqFnKBlpgHd-G24-MQzYKWGHy0'
};

// Initialize Supabase client
const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
