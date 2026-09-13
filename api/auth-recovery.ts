import { createClient } from "@supabase/supabase-js";

type Payload = { email?: string; redirectTo?: string };

const SUPABASE_URL = process.env.SUPABASE_URL || "https://cjywdvaitaasxtmgpwas.supabase.co";
const FROM = "BitBuzz <hello@bitbuzz.app>";

const validEmail = (value: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());
const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const emailHtml = (resetUrl: string) => `<!DOCTYPE html><html><body style="margin:0;background:#f4f4f1;color:#111;-webkit-font-smoothing:antialiased;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f1;padding:40px 16px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #e8e8e3"><tr><td style="padding:30px 32px;border-bottom:1px solid #ededeb"><p style="margin:0;font:700 10px Arial,sans-serif;letter-spacing:2px;color:#8a8a83">BITBUZZ · ACCOUNT SECURITY</p><h1 style="margin:10px 0 0;font:700 30px Georgia,serif;line-height:36px">Reset your password.</h1></td></tr><tr><td style="padding:30px 32px 36px"><p style="font:15px Arial,sans-serif;line-height:25px;color:#242424">We received a request to reset your BitBuzz password.</p><p style="font:15px Arial,sans-serif;line-height:25px;color:#242424">Use the button below to choose a new password. If you didn't request this, you can safely ignore this email.</p><p style="margin:28px 0"><a href="${escapeHtml(resetUrl)}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#111;color:#fff;text-decoration:none;font:700 13px Arial,sans-serif">Reset password →</a></p><p style="font:12px Arial,sans-serif;line-height:19px;color:#888">For security, this link is single-use and expires according to your BitBuzz/Supabase Auth settings.</p></td></tr><tr><td style="padding:18px 32px;border-top:1px solid #ededeb;background:#fafaf8"><p style="margin:0;font:10px Arial,sans-serif;line-height:16px;color:#999">BitBuzz · Student newsroom for science, technology, cybersecurity, aviation &amp; innovation</p></td></tr></table></td></tr></table></body></html>`;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  if (!serviceKey || !resendKey) return res.status(500).json({ error: "Auth email service is not configured" });

  const payload = req.body as Payload;
  const email = String(payload?.email ?? "").trim().toLowerCase();
  const redirectTo = String(payload?.redirectTo ?? "").trim();
  if (!validEmail(email) || !redirectTo) return res.status(400).json({ error: "Invalid reset request" });

  const allowedOrigin = new URL(redirectTo).origin;
  const configuredOrigins = new Set([
    "https://bitbuzz.app",
    "https://www.bitbuzz.app",
    "http://localhost:5173",
    "http://localhost:4173",
  ]);
  if (!configuredOrigins.has(allowedOrigin)) return res.status(400).json({ error: "Invalid redirect origin" });

  const admin = createClient(SUPABASE_URL, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const { data, error } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: { redirectTo },
    });

    // Keep account existence private: a missing account gets the same response as a valid one.
    if (error || !data?.properties?.action_link) {
      if (error) console.error("Password recovery link generation failed", error.message);
      return res.status(200).json({ ok: true });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({
        from: FROM,
        to: [email],
        subject: "Reset your BitBuzz password",
        html: emailHtml(data.properties.action_link),
        text: `Reset your BitBuzz password: ${data.properties.action_link}`,
      }),
    });

    if (!response.ok) {
      console.error("Password recovery email failed", await response.text());
      return res.status(502).json({ error: "Email delivery failed" });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Password recovery failed", error);
    return res.status(502).json({ error: "Password recovery failed" });
  }
}
