import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase settings missing: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local. Pages will load without data.');
}

// Without settings the site still starts (pages that don't need data, like /verify, keep working).
export const supabase = createClient(
    supabaseUrl || 'http://localhost:54321',
    supabaseAnonKey || 'missing-anon-key'
);
