const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Use service key for server-side operations

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with service key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Client-side Supabase client (for browser)
const createClientSideSupabase = () => {
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    if (!supabaseAnonKey) {
        throw new Error('Missing SUPABASE_ANON_KEY environment variable');
    }
    
    return createClient(supabaseUrl, supabaseAnonKey);
};

module.exports = {
    supabase,
    createClientSideSupabase,
    supabaseUrl,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
};