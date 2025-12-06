import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug log
console.log('🔧 Supabase URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing');
console.log('🔧 Supabase Key:', supabaseAnonKey ? '✅ Loaded' : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('Create .env.local file with:');
    console.error('VITE_SUPABASE_URL=your_url');
    console.error('VITE_SUPABASE_ANON_KEY=your_key');
}

// Create client (will fail gracefully if env vars missing)
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);

// Super Admin email - automatically gets Admin role
export const SUPER_ADMIN_EMAIL = 'hoangnhuthinh@gmail.com';

// Check if email is super admin
export const isSuperAdmin = (email) => {
    return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
};

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
    return !!(supabaseUrl && supabaseAnonKey);
};
