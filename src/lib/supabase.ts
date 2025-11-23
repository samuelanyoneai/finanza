import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasSupabaseConfig = Boolean(supabaseUrl && supabaseKey);

let client: SupabaseClient | null = null;

if (hasSupabaseConfig) {
  client = createClient(supabaseUrl as string, supabaseKey as string);
} else if (import.meta.env.DEV) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY no están configurados. ' +
    'La app se ejecutará sin persistencia remota.'
  );
}

export const supabase = client;
export const isSupabaseConfigured = hasSupabaseConfig;
