type Payload = { email?: string; redirectTo?: string };

const SUPABASE_FUNCTION_URL = "https://cjywdvaitaasxtmgpwas.supabase.co/functions/v1/bitbuzz-password-recovery";

const validEmail = (value: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const payload = req.body as Payload;
    const email = String(payload?.email ?? "").trim().toLowerCase();
    const redirectTo = String(payload?.redirectTo ?? "").trim();

    if (!validEmail(email) || !redirectTo) {
      return res.status(400).json({ error: "Invalid reset request" });
    }

    const redirectOrigin = new URL(redirectTo).origin;
    const allowedOrigins = new Set([
      "https://bitbuzz.app",
      "https://www.bitbuzz.app",
      "http://localhost:5173",
      "http://localhost:4173",
    ]);

    if (!allowedOrigins.has(redirectOrigin)) {
      return res.status(400).json({ error: "Invalid redirect origin" });
    }

    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://bitbuzz.app",
      },
      body: JSON.stringify({ email, redirectTo }),
    });

    const payloadResponse = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        error: payloadResponse?.error || "Unable to send the password reset email.",
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Password recovery proxy failed", error);
    return res.status(502).json({ error: "Unable to send the password reset email. Please try again." });
  }
}
