import { createClient } from "@supabase/supabase-js";

// Supabase publishable keys are safe to expose in browser code. Prefer Vercel
// environment variables when present, but keep a production fallback so the
// static Vite build cannot silently render a broken auth client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cjywdvaitaasxtmgpwas.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_Zz3-F6wTEyzViX1CAuktZQ_0wH9yLOV";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
