/*
 * Safety-report email alerts (Resend).
 *
 * POST { kind: "report", id }   → tells every safety contact of that publication
 *                                  that a new report arrived. The email NEVER
 *                                  contains the report text — only the category,
 *                                  urgency and a link to the dashboard. Emails get
 *                                  forwarded and sit in inboxes forever.
 * POST { kind: "contact", id }  → a safety contact was added/removed. Emails the
 *                                  affected person and every current contact, so
 *                                  nobody can quietly give themselves access.
 *
 * Idempotent: each row is emailed once (notified_at), so the public endpoint
 * can't be used to spam anyone.
 */

type Payload = { kind: "report" | "contact"; id: string };

const FROM = "BitBuzz Safety <hello@bitbuzz.app>";
const SITE = "https://www.bitbuzz.app";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://cjywdvaitaasxtmgpwas.supabase.co";

const CATEGORY_LABELS: Record<string, string> = {
  bullying: "Bullying",
  cyberbullying: "Cyberbullying",
  harassment: "Harassment",
  discrimination: "Discrimination",
  threat_or_violence: "Threat or violence",
  self_harm_concern: "Worried about someone's safety",
  substance: "Drugs, alcohol or vaping",
  other: "Something else",
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const validUuid = (value: unknown) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value ?? ""));

const p = (html: string) => `<p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;color:#242424;">${html}</p>`;
const button = (href: string, label: string) =>
  `<p style="margin:24px 0 8px;"><a href="${href}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;padding:12px 22px;border-radius:999px;">${escapeHtml(label)}</a></p>`;

const shell = (eyebrow: string, title: string, body: string) =>
  `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head><body style="margin:0;background:#f4f4f1;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f1;"><tr><td align="center" style="padding:40px 16px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#fff;border:1px solid #e8e8e3;"><tr><td style="padding:28px 32px 20px;border-bottom:1px solid #ededeb;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8a8a83;">${escapeHtml(eyebrow)}</p><p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:31px;font-weight:700;color:#111;">${escapeHtml(title)}</p></td></tr><tr><td style="padding:28px 32px 30px;">${body}</td></tr><tr><td style="padding:18px 32px;border-top:1px solid #ededeb;background:#fafaf8;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:17px;color:#888;">You get these because you are a designated safety contact on BitBuzz. Report contents are only visible after signing in with this email address. Please don't forward these emails to students.</p></td></tr></table></td></tr></table></body></html>`;

const supabaseRequest = async (path: string, init: RequestInit = {}) => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
};

const getOne = async (path: string) => {
  const r = await supabaseRequest(path);
  if (!r.ok) throw new Error(`Lookup failed: ${await r.text()}`);
  return ((await r.json()) as Array<Record<string, any>>)[0];
};

const getContacts = async (publicationId: string) => {
  const r = await supabaseRequest(`bitbuzz_safety_contacts?publication_id=eq.${publicationId}&select=email,name`);
  if (!r.ok) throw new Error(`Contact lookup failed: ${await r.text()}`);
  return (await r.json()) as Array<{ email: string; name: string | null }>;
};

const markNotified = (table: string, id: string) =>
  supabaseRequest(`${table}?id=eq.${id}&notified_at=is.null`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ notified_at: new Date().toISOString() }),
  });

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "RESEND_API_KEY is not configured" });

  const payload = req.body as Payload;
  if (!payload || !["report", "contact"].includes(payload.kind) || !validUuid(payload.id)) {
    return res.status(400).json({ error: "Invalid reference" });
  }

  const send = async (to: string[], subject: string, html: string) => {
    if (!to.length) return;
    // Separate emails per recipient, so contacts don't see each other's addresses.
    await Promise.all(
      to.map(async (recipient) => {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ from: FROM, to: [recipient], subject, html, text: subject }),
        });
        if (!response.ok) throw new Error(await response.text());
      }),
    );
  };

  try {
    if (payload.kind === "report") {
      const report = await getOne(`bitbuzz_safety_reports?id=eq.${payload.id}&select=id,publication_id,category,is_urgent,is_ongoing,notified_at`);
      if (!report) return res.status(404).json({ error: "Not found" });
      if (report.notified_at) return res.status(200).json({ ok: true, alreadySent: true });
      const pub = await getOne(`bitbuzz_publications?id=eq.${report.publication_id}&select=profile_name,school_name`);
      const contacts = await getContacts(report.publication_id);

      const category = CATEGORY_LABELS[report.category] || "Safety concern";
      const urgent = report.is_urgent ? "URGENT · " : "";
      const body =
        p(`A student has submitted a new safety report for <strong>${escapeHtml(pub?.school_name || pub?.profile_name)}</strong>.`) +
        `<table cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 8px;border-left:3px solid ${report.is_urgent ? "#d92d20" : "#111"};"><tr><td style="padding:4px 0 4px 14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#111;"><strong>${escapeHtml(category)}</strong>${report.is_urgent ? "<br><span style=\"color:#d92d20;font-weight:700;\">Marked urgent by the student</span>" : ""}${report.is_ongoing ? "<br>Still happening" : ""}</td></tr></table>` +
        p("For the student's privacy, the details are not included in this email. Sign in with this email address to read and respond.") +
        button(`${SITE}/ambassadors/safety`, "Open safety inbox");
      await send(
        contacts.map((c) => c.email),
        `${urgent}New safety report · ${pub?.profile_name || "BitBuzz"}`,
        shell("BITBUZZ · SAFETY REPORT", report.is_urgent ? "Urgent report received" : "New report received", body),
      );
      await markNotified("bitbuzz_safety_reports", report.id);
      return res.status(200).json({ ok: true });
    }

    // kind === "contact"
    const log = await getOne(`bitbuzz_safety_contact_log?id=eq.${payload.id}&select=id,publication_id,action,contact_email,contact_name,actor_email,notified_at`);
    if (!log) return res.status(404).json({ error: "Not found" });
    if (log.notified_at) return res.status(200).json({ ok: true, alreadySent: true });
    const pub = await getOne(`bitbuzz_publications?id=eq.${log.publication_id}&select=profile_name,school_name`);
    const contacts = (await getContacts(log.publication_id)).map((c) => c.email.toLowerCase());
    const who = escapeHtml(log.contact_name ? `${log.contact_name} (${log.contact_email})` : log.contact_email);
    const actor = escapeHtml(log.actor_email || "a BitBuzz admin");
    const school = escapeHtml(pub?.school_name || pub?.profile_name);

    if (log.action === "added") {
      await send(
        [String(log.contact_email).toLowerCase()],
        `You're now a safety contact for ${pub?.profile_name || "a BitBuzz publication"}`,
        shell(
          "BITBUZZ · SAFETY CONTACT",
          "You've been added as a safety contact",
          p(`${actor} added you as a safety contact for <strong>${school}</strong> on BitBuzz.`) +
            p("Students can now anonymously report bullying and other safety concerns. Only safety contacts can read these reports — not the student team running the publication, and not BitBuzz staff.") +
            p("Sign in (or create an account) with <strong>this exact email address</strong> to see reports.") +
            button(`${SITE}/ambassadors/safety`, "Open safety inbox") +
            p(`<span style="color:#777;font-size:13px;">Not expecting this? Reply to the school or contact hi@hridhaan.me and we'll remove you.</span>`),
        ),
      );
    }
    const others = contacts.filter((e) => e !== String(log.contact_email).toLowerCase());
    await send(
      others,
      `Safety contacts changed · ${pub?.profile_name || "BitBuzz"}`,
      shell(
        "BITBUZZ · SAFETY CONTACTS",
        log.action === "added" ? "A safety contact was added" : "A safety contact was removed",
        p(`${actor} ${log.action === "added" ? "added" : "removed"} <strong>${who}</strong> as a safety contact for <strong>${school}</strong>.`) +
          p("Safety contacts can read every report. If you didn't expect this change, check it in the safety inbox.") +
          button(`${SITE}/ambassadors/safety`, "Review contacts"),
      ),
    );
    await markNotified("bitbuzz_safety_contact_log", log.id);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("safety-notify failed", error);
    return res.status(502).json({ error: "Email delivery failed" });
  }
}