import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	// eslint-disable-next-line no-console
	console.warn('Missing Supabase environment variables. Check your .env file.');
}

// Fallbacks keep the UI rendering before .env is configured —
// requests simply fail until the real project values are set.
export const supabase = createClient(
	supabaseUrl || 'http://localhost:54321',
	supabaseAnonKey || 'missing-anon-key'
);
