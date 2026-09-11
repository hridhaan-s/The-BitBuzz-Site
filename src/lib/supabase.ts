import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

const client = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabase = client ?? ({
  auth: {
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: new Error("BitBuzz authentication is not configured yet."),
    }),
  },
} as unknown as ReturnType<typeof createClient>);
