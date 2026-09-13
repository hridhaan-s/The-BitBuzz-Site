import { createClient } from "@supabase/supabase-js";

// Supabase publishable keys are safe to expose in browser code. Prefer Vercel
// environment variables when present, but keep a production fallback so the
// static Vite build cannot silently render a broken auth client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cjywdvaitaasxtmgpwas.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_Zz3-F6wTEyzViX1CAuktZQ_0wH9yLOV";

const baseSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

const NOTIFIED_TABLES = new Set([
  "bitbuzz_submissions",
  "bitbuzz_flag_it_reports",
  "opportunities",
]);

const submissionKind = (table: string) =>
  table === "bitbuzz_flag_it_reports" ? "flagit" : table === "opportunities" ? "opportunity" : "story";

const notifySubmission = (table: string, rows: unknown) => {
  if (!NOTIFIED_TABLES.has(table)) return;
  const values = Array.isArray(rows) ? rows : [rows];

  for (const value of values) {
    if (!value || typeof value !== "object") continue;
    const submission = value as Record<string, unknown>;
    if (submission.status !== "pending") continue;

    void fetch("/api/submission-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: submissionKind(table), submission }),
      keepalive: true,
    }).catch((error) => {
      console.error("BitBuzz submission notification failed", error);
    });
  }
};

export const supabase = new Proxy(baseSupabase, {
  get(target, property, receiver) {
    if (property !== "from") return Reflect.get(target, property, receiver);

    return (table: string) => {
      const builder = target.from(table);
      if (!NOTIFIED_TABLES.has(table)) return builder;

      return new Proxy(builder, {
        get(builderTarget, builderProperty, builderReceiver) {
          if (builderProperty !== "insert") return Reflect.get(builderTarget, builderProperty, builderReceiver);

          const originalInsert = Reflect.get(builderTarget, builderProperty, builderReceiver) as (...args: unknown[]) => Promise<{ error: unknown }>;
          return async (...args: unknown[]) => {
            const result = await originalInsert.apply(builderTarget, args);
            if (!result.error) notifySubmission(table, args[0]);
            return result;
          };
        },
      });
    };
  },
}) as typeof baseSupabase;
