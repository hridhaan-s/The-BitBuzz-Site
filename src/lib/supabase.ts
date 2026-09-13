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

const ensureSubmissionIds = (rows: unknown) => {
  const values = Array.isArray(rows) ? rows : [rows];
  const withIds = values.map((value) => {
    if (!value || typeof value !== "object") return value;
    const row = value as Record<string, unknown>;
    return row.id ? row : { ...row, id: crypto.randomUUID() };
  });
  return Array.isArray(rows) ? withIds : withIds[0];
};

const notifySubmission = (table: string, rows: unknown) => {
  if (!NOTIFIED_TABLES.has(table)) return;
  const values = Array.isArray(rows) ? rows : [rows];

  for (const value of values) {
    if (!value || typeof value !== "object") continue;
    const submission = value as Record<string, unknown>;
    if (submission.status !== "pending" || !submission.id) continue;

    void fetch("/api/submission-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: submissionKind(table), id: submission.id }),
      keepalive: true,
    }).catch((error) => {
      console.error("BitBuzz submission notification failed", error);
    });
  }
};

const secureAuth = new Proxy(baseSupabase.auth, {
  get(target, property, receiver) {
    if (property !== "resetPasswordForEmail") return Reflect.get(target, property, receiver);

    return async (email: string, options?: { redirectTo?: string }) => {
      try {
        const response = await fetch("/api/auth-recovery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, redirectTo: options?.redirectTo || `${window.location.origin}/reset-password` }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          return { data: {}, error: { message: payload?.error || "Unable to send the password reset email." } };
        }

        return { data: {}, error: null };
      } catch (error) {
        console.error("BitBuzz password recovery request failed", error);
        return { data: {}, error: { message: "Unable to send the password reset email. Please try again." } };
      }
    };
  },
}) as typeof baseSupabase.auth;

export const supabase = new Proxy(baseSupabase, {
  get(target, property, receiver) {
    if (property === "auth") return secureAuth;
    if (property !== "from") return Reflect.get(target, property, receiver);

    return (table: string) => {
      const builder = target.from(table);
      if (!NOTIFIED_TABLES.has(table)) return builder;

      return new Proxy(builder, {
        get(builderTarget, builderProperty, builderReceiver) {
          if (builderProperty !== "insert") return Reflect.get(builderTarget, builderProperty, builderReceiver);

          const originalInsert = Reflect.get(builderTarget, builderProperty, builderReceiver) as (...args: unknown[]) => Promise<{ error: unknown }>;
          return async (...args: unknown[]) => {
            // Give each new submission a known UUID before it reaches the database.
            // This lets the server verify the exact row before sending email.
            args[0] = ensureSubmissionIds(args[0]);
            const result = await originalInsert.apply(builderTarget, args);
            if (!result.error) notifySubmission(table, args[0]);
            return result;
          };
        },
      });
    };
  },
}) as typeof baseSupabase;
