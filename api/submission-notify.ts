type SubmissionKind = "story" | "flagit" | "opportunity";

type Payload = {
  kind: SubmissionKind;
  submission: Record<string, unknown>;
};

const ADMINS = ["hi@hridhaan.me", "agentritvik@gmail.com"];
const FROM = "BitBuzz <hello@bitbuzz.app>";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const kindLabel = (kind: SubmissionKind) =>
  kind === "flagit" ? "Flag It report" : kind === "opportunity" ? "opportunity" : "story";

const subjectFor = (kind: SubmissionKind) =>
  kind === "flagit"
    ? "We received your Flag It report"
    : kind === "opportunity"
      ? "We received your BitBuzz opportunity submission"
      : "We received your BitBuzz submission";

const titleFor = (kind: SubmissionKind) =>
  kind === "flagit" ? "Your Flag It report is in" : kind === "opportunity" ? "Your opportunity is under review" : "Your submission is under review";

const introFor = (kind: SubmissionKind) =>
  kind === "flagit"
    ? "Thanks for helping us document a scam experience. We’ve received your report and it is now under editorial review."
    : kind === "opportunity"
      ? "Thanks for contributing to the BitBuzz Opportunities board. We’ve received your submission and it is now under editorial review."
      : "Thanks for contributing to BitBuzz. We’ve received your submission and it is now under editorial review.";

const adminSummary = (kind: SubmissionKind, submission: Record<string, unknown>) => {
  if (kind === "flagit") {
    return [
      ["Headline", submission.title],
      ["Reporter email", submission.reporter_email],
      ["Scam type", submission.scam_type],
      ["Platform", submission.platform],
      ["Story", submission.story],
    ];
  }
  if (kind === "opportunity") {
    return [
      ["Event", submission.title],
      ["Organizer", submission.organiser],
      ["Organizer email", submission.organizer_email],
      ["Website", submission.website_url || submission.url],
      ["Description", submission.description],
    ];
  }
  return [
    ["Headline", submission.headline],
    ["Contributor", submission.author_name],
    ["Contributor email", submission.author_email],
    ["Category", submission.section || (submission.media as Record<string, unknown> | undefined)?.category],
    ["Body", submission.body],
  ];
};

const renderRows = (rows: Array<[string, unknown]>) =>
  rows
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== "")
    .map(
      ([label, value]) =>
        `<tr><td style="padding:12px 0;border-bottom:1px solid #ececec;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#777;vertical-align:top;width:140px;">${escapeHtml(label)}</td><td style="padding:12px 0;border-bottom:1px solid #ececec;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#171717;vertical-align:top;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

const emailShell = (eyebrow: string, title: string, body: string) => `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"></head><body style="margin:0;background:#f4f4f1;color:#111;-webkit-font-smoothing:antialiased;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#f4f4f1;"><tr><td align="center" style="padding:40px 16px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#fff;border:1px solid #e8e8e3;"><tr><td style="padding:28px 32px 20px;border-bottom:1px solid #ededeb;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#8a8a83;">${escapeHtml(eyebrow)}</p><p style="margin:10px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:32px;font-weight:700;letter-spacing:-.5px;color:#111;">${escapeHtml(title)}</p></td></tr><tr><td style="padding:28px 32px 34px;">${body}</td></tr><tr><td style="padding:18px 32px;border-top:1px solid #ededeb;background:#fafaf8;"><p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:16px;color:#999;">BitBuzz · Student newsroom for science, technology, cybersecurity, aviation &amp; innovation</p></td></tr></table></td></tr></table></body></html>`;

const submitterEmail = (kind: SubmissionKind, submission: Record<string, unknown>) => {
  const name = escapeHtml(submission.author_name || submission.organiser || "there");
  const intro = introFor(kind);
  const body = `<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;color:#242424;">Hi ${name},</p><p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:25px;color:#242424;">${intro}</p><table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin:22px 0 24px;border-left:3px solid #111;"><tr><td style="padding:4px 0 4px 16px;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:25px;color:#111;">We’ll review it and aim to process it within 48 hours.</td></tr></table><p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:23px;color:#555;">If we need any clarification, we’ll contact you at this email address.</p><p style="margin:24px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:24px;color:#111;">Thanks for contributing.<br><span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#777;">The BitBuzz Editorial Team</span></p>`;
  return emailShell("BITBUZZ · SUBMISSION RECEIVED", titleFor(kind), body);
};

const adminEmail = (kind: SubmissionKind, submission: Record<string, unknown>) => {
  const label = kindLabel(kind);
  const rows = renderRows(adminSummary(kind, submission));
  const body = `<p style="margin:0 0 20px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:22px;color:#444;">A new <strong>${escapeHtml(label)}</strong> has just been submitted and is waiting for review.</p><table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">${rows}</table>`;
  return emailShell("BITBUZZ · EDITORIAL ALERT", `New ${label} received`, body);
};

const validEmail = (value: unknown) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? "").trim());

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "RESEND_API_KEY is not configured" });

  const payload = req.body as Payload;
  if (!payload || !["story", "flagit", "opportunity"].includes(payload.kind) || !payload.submission) {
    return res.status(400).json({ error: "Invalid submission payload" });
  }

  const submission = payload.submission;
  const recipient = String(
    payload.kind === "flagit"
      ? submission.reporter_email || ""
      : payload.kind === "opportunity"
        ? submission.organizer_email || ""
        : submission.author_email || "",
  ).trim().toLowerCase();

  if (!validEmail(recipient)) return res.status(400).json({ error: "A valid submitter email is required" });

  const send = async (to: string[], subject: string, html: string, replyTo?: string) => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from: FROM, to, subject, html, text: subject, ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  };

  try {
    await Promise.all([
      send([recipient], subjectFor(payload.kind), submitterEmail(payload.kind, submission), recipient),
      send(ADMINS, `[BitBuzz] New ${kindLabel(payload.kind)} submission`, adminEmail(payload.kind, submission), recipient),
    ]);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("submission-notify failed", error);
    return res.status(502).json({ error: "Email delivery failed" });
  }
}
