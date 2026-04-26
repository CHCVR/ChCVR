// ==========================================
// SUPABASE CLIENT INITIALIZATION MATRIX
// ==========================================

// INSERT YOUR PROJECT CREDENTIALS HERE
const SUPABASE_URL = "https://zrkrhyvlgsbchhldesyk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vjJgBmOg66-Fo7OOrunjHQ_3ITpoF8H";

// Initialize Supabase Client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Utility Function for ID Hash Generation
const generateHash = (prefix) => {
    return prefix + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
};
