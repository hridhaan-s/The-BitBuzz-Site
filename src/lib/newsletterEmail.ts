// Block-based newsletter renderer.
// Email HTML rules: tables for layout, inline styles only, no flex/grid,
// nothing that depends on <style> support. Works in Gmail, Apple Mail, Outlook.

export type StoryBlock = { id: string; type: "story"; kicker: string; title: string; summary: string; url: string; image: string };
export type TextBlock = { id: string; type: "text"; text: string };
export type ImageBlock = { id: string; type: "image"; src: string; alt: string; caption: string; href: string };
export type CtaBlock = { id: string; type: "cta"; label: string; url: string };
export type DividerBlock = { id: string; type: "divider" };
export type Block = StoryBlock | TextBlock | ImageBlock | CtaBlock | DividerBlock;
export type BlockType = Block["type"];

export type Edition = {
  subject: string;
  preheader: string;
  headline: string;
  intro: string;
  accent: string;
  headerImage: string;
  blocks: Block[];
};

export type Brand = { name: string; sub: string; logoUrl?: string | null; homeUrl: string };

export const SITE = "https://www.bitbuzz.app";
const FONT = "Helvetica,Arial,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";
const INK = "#16140f";
const MUTED = "#5b5750";
const RULE = "#e7e2d9";

export const uid = () => Math.random().toString(36).slice(2, 10);

export function blankBlock(type: BlockType): Block {
  const id = uid();
  switch (type) {
    case "story": return { id, type, kicker: "", title: "", summary: "", url: "", image: "" };
    case "text": return { id, type, text: "" };
    case "image": return { id, type, src: "", alt: "", caption: "", href: "" };
    case "cta": return { id, type, label: "Read more", url: "" };
    case "divider": return { id, type };
  }
}

export const esc = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Only http(s) and mailto survive. Relative paths are resolved against the site. Everything else is dropped. */
export function safeUrl(raw: string): string {
  const v = String(raw ?? "").trim();
  if (!v) return "";
  if (v.startsWith("/")) return SITE + v;
  try {
    const u = new URL(v);
    return ["http:", "https:", "mailto:"].includes(u.protocol) ? u.toString() : "";
  } catch {
    return "";
  }
}

// ---------- colour ----------
function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map(c => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
const toHex = (r: number, g: number, b: number) => "#" + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, "0")).join("");
function lum([r, g, b]: [number, number, number]) {
  const f = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
export function contrast(a: string, b: string) {
  const x = hexToRgb(a), y = hexToRgb(b);
  if (!x || !y) return 1;
  const [l1, l2] = [lum(x), lum(y)].sort((p, q) => q - p);
  return (l1 + 0.05) / (l2 + 0.05);
}
/** Text colour for a button filled with `bg`. */
export const inkOn = (bg: string) => (contrast(bg, "#ffffff") >= contrast(bg, INK) ? "#ffffff" : INK);
/** Darken an accent until it is readable as text on white (WCAG AA, 4.5:1). */
export function readableAccent(accent: string) {
  const rgb = hexToRgb(accent);
  if (!rgb) return INK;
  let [r, g, b] = rgb;
  for (let i = 0; i < 20 && contrast(toHex(r, g, b), "#ffffff") < 4.5; i++) { r *= 0.88; g *= 0.88; b *= 0.88; }
  return toHex(r, g, b);
}
export const normalizeAccent = (a: string) => (hexToRgb(a) ? (a.startsWith("#") ? a : "#" + a) : "#ff6a1f");

// ---------- inline text ----------
/** Paragraphs split on blank lines. Supports **bold** and [label](url). Everything else is escaped. */
function richText(src: string, linkColor: string) {
  return String(src ?? "")
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => {
      let h = esc(p);
      h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      h = h.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
        const href = safeUrl(url.replace(/&amp;/g, "&"));
        return href ? `<a href="${esc(href)}" style="color:${linkColor};text-decoration:underline">${label}</a>` : label;
      });
      h = h.replace(/\n/g, "<br>");
      return `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:1.65;color:${INK}">${h}</p>`;
    })
    .join("");
}

// ---------- blocks ----------
const row = (inner: string, pad = "0 32px 28px") => `<tr><td style="padding:${pad}">${inner}</td></tr>`;

function button(label: string, url: string, accent: string) {
  const href = safeUrl(url);
  if (!href || !label.trim()) return "";
  const ink = inkOn(accent);
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${accent}" style="border-radius:6px">` +
    `<a href="${esc(href)}" style="display:inline-block;padding:13px 22px;font-family:${FONT};font-size:14px;font-weight:bold;color:${ink};text-decoration:none;border-radius:6px">${esc(label)}</a>` +
    `</td></tr></table>`;
}

function renderBlock(b: Block, accent: string, text: string, isLeadStory: boolean) {
  switch (b.type) {
    case "story": {
      if (!b.title.trim()) return "";
      const href = safeUrl(b.url);
      const img = safeUrl(b.image);
      const title = href ? `<a href="${esc(href)}" style="color:${INK};text-decoration:none">${esc(b.title)}</a>` : esc(b.title);
      const size = isLeadStory ? 30 : 22;
      return row(
        (img ? (href ? `<a href="${esc(href)}">` : "") + `<img src="${esc(img)}" width="536" alt="${esc(b.title)}" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:4px;margin:0 0 16px">` + (href ? "</a>" : "") : "") +
        (b.kicker.trim() ? `<div style="font-family:${FONT};font-size:12px;font-weight:bold;letter-spacing:.06em;color:${text};margin:0 0 6px">${esc(b.kicker)}</div>` : "") +
        `<h2 style="margin:0 0 10px;font-family:${SERIF};font-size:${size}px;line-height:1.15;font-weight:normal;color:${INK}">${title}</h2>` +
        (b.summary.trim() ? `<p style="margin:0 0 12px;font-family:${FONT};font-size:15px;line-height:1.6;color:${MUTED}">${esc(b.summary)}</p>` : "") +
        (href ? `<a href="${esc(href)}" style="font-family:${FONT};font-size:14px;font-weight:bold;color:${text};text-decoration:none">Read the story</a>` : "")
      );
    }
    case "text":
      return b.text.trim() ? row(richText(b.text, text), "0 32px 12px") : "";
    case "image": {
      const src = safeUrl(b.src);
      if (!src) return "";
      const href = safeUrl(b.href);
      const img = `<img src="${esc(src)}" width="536" alt="${esc(b.alt)}" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:4px">`;
      return row((href ? `<a href="${esc(href)}">${img}</a>` : img) +
        (b.caption.trim() ? `<p style="margin:8px 0 0;font-family:${FONT};font-size:13px;line-height:1.5;color:${MUTED}">${esc(b.caption)}</p>` : ""));
    }
    case "cta":
      return row(button(b.label, b.url, accent));
    case "divider":
      return row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ${RULE};font-size:0;line-height:0">&nbsp;</td></tr></table>`, "4px 32px 28px");
  }
}

// Stores the editable blocks inside the saved HTML so drafts can be reopened without a schema change.
const MARK = "bb-edition:";
export function packEdition(e: Edition) {
  return `<!--${MARK}${btoa(unescape(encodeURIComponent(JSON.stringify(e))))}-->`;
}
export function unpackEdition(html: string): Edition | null {
  const m = new RegExp(`<!--${MARK}([A-Za-z0-9+/=]+)-->`).exec(html || "");
  if (!m) return null;
  try { return JSON.parse(decodeURIComponent(escape(atob(m[1])))) as Edition; } catch { return null; }
}

export function renderEmail(brand: Brand, e: Edition): string {
  const accent = normalizeAccent(e.accent);
  const text = readableAccent(accent);
  const firstStory = e.blocks.findIndex(b => b.type === "story" && b.title.trim());
  const logo = safeUrl(brand.logoUrl || "");
  const header = safeUrl(e.headerImage);
  const home = safeUrl(brand.homeUrl) || SITE;
  const pre = esc(e.preheader || "");

  const masthead =
    `<tr><td style="padding:24px 32px;border-bottom:1px solid ${RULE}">` +
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
    (logo ? `<td style="padding-right:12px" valign="middle"><img src="${esc(logo)}" width="40" height="40" alt="" style="display:block;border:0;border-radius:8px"></td>` : "") +
    `<td valign="middle"><a href="${esc(home)}" style="font-family:${FONT};font-size:15px;font-weight:bold;color:${INK};text-decoration:none">${esc(brand.name)}</a>` +
    (brand.sub ? `<div style="font-family:${FONT};font-size:12px;color:${MUTED};margin-top:2px">${esc(brand.sub)}</div>` : "") +
    `</td></tr></table></td></tr>`;

  const hero =
    (header ? `<tr><td style="padding:28px 32px 0"><img src="${esc(header)}" width="536" alt="" style="display:block;width:100%;max-width:536px;height:auto;border:0;border-radius:4px"></td></tr>` : "") +
    `<tr><td style="padding:28px 32px 8px"><div style="width:40px;height:4px;background:${accent};font-size:0;line-height:0;margin:0 0 18px">&nbsp;</div>` +
    `<h1 style="margin:0 0 14px;font-family:${SERIF};font-size:36px;line-height:1.08;font-weight:normal;color:${INK}">${esc(e.headline || e.subject)}</h1></td></tr>` +
    (e.intro.trim() ? row(richText(e.intro, text), "0 32px 16px") : "");

  const body = e.blocks.map((b, i) => renderBlock(b, accent, text, i === firstStory)).join("");

  const footer =
    `<tr><td style="padding:22px 32px;border-top:1px solid ${RULE};font-family:${FONT};font-size:12px;line-height:1.6;color:${MUTED}">` +
    `You're getting this because you subscribed to ${esc(brand.name)}.</td></tr>`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(e.subject)}</title></head>` +
    `<body style="margin:0;padding:0;background:#f3f1ec">` +
    `<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:#f3f1ec">${pre}${"&#847;&zwnj;&nbsp;".repeat(60)}</div>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f1ec"><tr><td align="center" style="padding:24px 12px">` +
    `<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;background:#ffffff;border-radius:8px">` +
    masthead + hero + body + footer +
    `</table></td></tr></table>${packEdition(e)}</body></html>`;
}

// ---------- pre-send checks ----------
export type Check = { level: "error" | "warn"; msg: string };
export function checkEdition(e: Edition): Check[] {
  const out: Check[] = [];
  if (!e.subject.trim()) out.push({ level: "error", msg: "Subject is empty." });
  else if (e.subject.length > 60) out.push({ level: "warn", msg: `Subject is ${e.subject.length} characters. Phones cut it around 40–60.` });
  if (!e.preheader.trim()) out.push({ level: "warn", msg: "No preview text. Inboxes will show whatever text comes first instead." });
  if (!e.headline.trim()) out.push({ level: "error", msg: "Edition headline is empty." });
  const live = e.blocks.filter(b => b.type !== "divider");
  if (!live.length && !e.intro.trim()) out.push({ level: "error", msg: "The edition has no content." });
  e.blocks.forEach((b, i) => {
    const n = `Block ${i + 1}`;
    if (b.type === "story") {
      if (!b.title.trim()) out.push({ level: "error", msg: `${n}: story has no title, it won't render.` });
      if (b.url.trim() && !safeUrl(b.url)) out.push({ level: "error", msg: `${n}: story link isn't a valid http(s) URL.` });
    }
    if (b.type === "image") {
      if (!safeUrl(b.src)) out.push({ level: "error", msg: `${n}: image URL is missing or invalid.` });
      if (!b.alt.trim()) out.push({ level: "warn", msg: `${n}: image has no alt text. Many inboxes block images by default.` });
    }
    if (b.type === "cta" && (!b.label.trim() || !safeUrl(b.url))) out.push({ level: "error", msg: `${n}: button needs a label and a valid URL.` });
  });
  if (e.headerImage.trim() && !safeUrl(e.headerImage)) out.push({ level: "error", msg: "Header image URL is invalid." });
  if (contrast(normalizeAccent(e.accent), "#ffffff") < 4.5) out.push({ level: "warn", msg: "Accent is light, so text uses a darkened version of it. Buttons keep the original colour." });
  return out;
}
