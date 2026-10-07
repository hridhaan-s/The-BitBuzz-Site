import { useLayoutEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

// ─── Types ───────────────────────────────────────────────────────────────────
export type Publication = { id: string; slug?: string; profile_name: string; school_name: string; logo_url: string | null; description: string | null };
export type Article = { id: string; headline: string; description: string | null; body: string; category: string | null; cover_url: string | null };
export type Magazine = { id: string; publication_id?: string; title: string; subtitle: string | null; cover_url?: string | null; status?: string; updated_at?: string };

/** A freely placed element. x/y/w/h are % of the page; text size is in cqw (1% of page width). */
export type El = {
  id: string; type: "text" | "image" | "shape";
  x: number; y: number; w: number; h: number;
  text?: string; src?: string; shape?: "rect" | "circle";
  fill?: string; color?: string; size?: number; font?: FontKey; weight?: number; italic?: boolean;
  align?: "left" | "center" | "right"; upper?: boolean; tracking?: number; lh?: number;
  opacity?: number; radius?: number; flipX?: boolean; locked?: boolean;
};
export type PageContent = {
  headline?: string; subheadline?: string; body?: string; imageUrl?: string; quote?: string; caption?: string;
  storyIds?: string[]; accent?: string; bg?: string; layout?: "canvas"; elements?: El[];
};
export type MagPage = { id: string; magazine_id?: string; page_number: number; template: string; content: PageContent | null };
export type TextField = "headline" | "subheadline" | "body" | "quote" | "caption";

export const TEMPLATES = ["cover", "feature", "two_column", "image_quote", "news_grid", "closing", "canvas"] as const;
export const LABELS: Record<string, string> = { cover: "Cover", feature: "Feature", two_column: "Two column", image_quote: "Image + quote", news_grid: "News grid", closing: "Closing", canvas: "Blank canvas" };
export const ACCENTS = ["#ff6a1f", "#e8364f", "#7c5cff", "#1fa37a", "#1f7aff", "#f2b705", "#111111"];
export const PAPERS = ["#f4efe7", "#ffffff", "#111111", "#f6e7d8", "#e9f0ea", "#1b2a4a"];
export const BLANK: PageContent = { headline: "", subheadline: "", body: "", imageUrl: "", quote: "", caption: "", storyIds: [], accent: "#ff6a1f" };
export const PAGE_COLS = "id,magazine_id,page_number,template,content";

export const FONTS = {
  serif: { label: "Newsreader", css: `"Newsreader",Georgia,serif` },
  playfair: { label: "Playfair", css: `"Playfair Display",Georgia,serif` },
  dmserif: { label: "DM Serif", css: `"DM Serif Display",Georgia,serif` },
  sans: { label: "Inter Tight", css: `"Inter Tight",ui-sans-serif,system-ui,sans-serif` },
  grotesk: { label: "Space Grotesk", css: `"Space Grotesk",ui-sans-serif,sans-serif` },
  anton: { label: "Anton", css: `"Anton",Impact,sans-serif` },
  mono: { label: "Mono", css: `ui-monospace,"SF Mono",Menlo,monospace` },
} as const;
export type FontKey = keyof typeof FONTS;

/** Canvas pages are stored as content.layout = "canvas" so no DB enum/check constraint can reject them. */
export const tpl = (p: MagPage) => (p.content?.layout === "canvas" ? "canvas" : p.template);
export const uid = () => Math.random().toString(36).slice(2, 10);
const isDark = (hex?: string) => { if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return false; const n = parseInt(hex.slice(1), 16); return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 110; };

const Img = ({ src, className }: { src?: string; className?: string }) =>
  src ? <img src={src} alt="" className={className} loading="lazy" draggable={false} onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null;

// ─── Elements ────────────────────────────────────────────────────────────────
export function elBoxStyle(el: El, z: number): CSSProperties {
  return { position: "absolute", left: `${el.x}%`, top: `${el.y}%`, width: `${el.w}%`, height: el.type === "text" ? "auto" : `${el.h}%`, zIndex: 10 + z, opacity: el.opacity ?? 1 };
}
export function ElementView({ el, editing, onCommit }: { el: El; editing?: boolean; onCommit?: (text: string) => void }) {
  if (el.type === "image") return el.src
    ? <img src={el.src} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", borderRadius: `${el.radius || 0}cqw`, transform: el.flipX ? "scaleX(-1)" : undefined }} />
    : <div className="mz-img-empty">Add an image URL</div>;
  if (el.type === "shape") return <div style={{ width: "100%", height: "100%", background: el.fill || "#ff6a1f", borderRadius: el.shape === "circle" ? "50%" : `${el.radius || 0}cqw` }} />;
  const size = el.size ?? 3;
  const style: CSSProperties = {
    fontFamily: FONTS[el.font || "sans"].css, fontSize: `${size}cqw`, fontWeight: el.weight ?? 400, fontStyle: el.italic ? "italic" : undefined,
    color: el.color || "#141414", textAlign: el.align || "left", lineHeight: el.lh ?? (size > 4 ? 0.95 : 1.45),
    letterSpacing: `${el.tracking ?? (size > 6 ? -0.03 : 0)}em`, textTransform: el.upper ? "uppercase" : undefined,
    background: el.fill || undefined, padding: el.fill ? "0.25em 0.45em" : undefined, borderRadius: `${el.radius || 0}cqw`,
    whiteSpace: "pre-wrap", overflowWrap: "anywhere", margin: 0, outline: "none", minHeight: "1em",
  };
  if (editing) return <div style={style} contentEditable="plaintext-only" suppressContentEditableWarning autoFocus
    ref={(n) => { if (n && document.activeElement !== n) { n.focus(); const r = document.createRange(); r.selectNodeContents(n); const s = getSelection(); s?.removeAllRanges(); s?.addRange(r); } }}
    onBlur={(e) => onCommit?.(e.currentTarget.innerText.replace(/\n$/, ""))}
    onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Escape") e.currentTarget.blur(); }}
    onPointerDown={(e) => e.stopPropagation()}>{el.text}</div>;
  return <div style={style}>{el.text || " "}</div>;
}

// ─── Page renderer: editor, viewer and print all use this ───────────────────
// Typography uses container-query units (cqw), so a page has the same layout at 160px
// (thumbnail), 760px (screen) and 210mm (paper). What fits on screen fits in print.
export function MagazinePage({ page, pub, articles, placeholders = false, onOverflow, edit, layer }: {
  page: MagPage; pub: Publication; articles: Article[]; placeholders?: boolean;
  onOverflow?: (id: string, over: boolean) => void;
  /** When set, template text becomes click-to-edit on the page. */
  edit?: (field: TextField, value: string) => void;
  /** Replaces the static element layer (the editor passes its interactive one). */
  layer?: ReactNode;
}) {
  const c = { ...BLANK, ...(page.content || {}) };
  const t = tpl(page);
  const stories = (c.storyIds || []).map((id) => articles.find((a) => a.id === id)).filter(Boolean) as Article[];
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!onOverflow) return;
    const el = ref.current;
    if (!el) { onOverflow(page.id, false); return; }
    const check = () => onOverflow(page.id, el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    const imgs = Array.from(el.querySelectorAll("img"));
    imgs.forEach((i) => i.addEventListener("load", check));
    return () => { ro.disconnect(); imgs.forEach((i) => i.removeEventListener("load", check)); };
  }, [page, articles, onOverflow]);

  /** Editable text slot. Read-only: renders value or fallback. Edit mode: contentEditable with a ghost placeholder. */
  const T = (field: TextField, Tag: "h1" | "h2" | "h3" | "p" | "small" | "blockquote", value: string | undefined, opts: { ph: string; fallback?: string; className?: string; multi?: boolean }) => {
    if (!edit) {
      const v = value || opts.fallback || (placeholders ? opts.ph : "");
      return v ? <Tag className={opts.className}>{v}</Tag> : null;
    }
    return <Tag key={`${field}:${value}`} className={`${opts.className || ""} mz-ed`} data-ph={opts.fallback || opts.ph}
      contentEditable="plaintext-only" suppressContentEditableWarning
      onKeyDown={(e: KeyboardEvent<HTMLElement>) => { e.stopPropagation(); if ((e.key === "Enter" && !opts.multi) || e.key === "Escape") { e.preventDefault(); e.currentTarget.blur(); } }}
      onBlur={(e) => { const v = e.currentTarget.innerText.replace(/\n$/, "").trim() === "" ? "" : e.currentTarget.innerText.replace(/\n$/, ""); if (v !== (value || "")) edit(field, v); }}>{value || ""}</Tag>;
  };

  const storyBody = stories[0]?.body;
  let inner: ReactNode = null;
  switch (t) {
    case "canvas": break;
    case "cover":
      inner = <div className="mz-cover">
        <Img src={c.imageUrl} className="mz-cover-img" />
        <div className="mz-shade" />
        <div className="mz-mast">{pub.logo_url && <Img src={pub.logo_url} className="mz-logo" />}<span>{pub.profile_name}</span></div>
        <div className="mz-cover-copy"><small>{pub.school_name}</small>
          {T("headline", "h1", c.headline, { ph: "Your magazine" })}
          {T("subheadline", "p", c.subheadline, { ph: "The cover line that sells the issue." })}
        </div>
      </div>;
      break;
    case "feature":
      inner = <div className="mz-pad" ref={ref}>
        <Img src={c.imageUrl} className="mz-hero" />
        {T("caption", "small", c.caption, { ph: "Section", fallback: pub.profile_name })}
        {T("headline", "h1", c.headline, { ph: "Feature headline" })}
        {T("subheadline", "h3", c.subheadline, { ph: "A strong standfirst for the story." })}
        {T("body", "p", c.body || storyBody, { ph: "Click to write the story…", className: "mz-body mz-dropcap", multi: true })}
      </div>;
      break;
    case "two_column":
      inner = <div className="mz-pad" ref={ref}>
        {T("subheadline", "small", c.subheadline, { ph: "Kicker", fallback: "Editorial" })}
        {T("headline", "h2", c.headline, { ph: "A story worth reading" })}<hr />
        <div className="mz-cols">
          {T("body", "p", c.body || storyBody, { ph: "Click to write…", className: "mz-body", multi: true })}
          <div>
            {T("quote", "blockquote", c.quote, { ph: "Pull quote", className: "mz-pull" })}
            <Img src={c.imageUrl} className="mz-side-img" />
            {stories.slice(c.body ? 0 : 1, 3).map((a) => <figure key={a.id}><Img src={a.cover_url || undefined} /><figcaption>{a.headline}</figcaption></figure>)}
          </div>
        </div>
      </div>;
      break;
    case "image_quote":
      inner = <div className="mz-pad mz-iq" ref={ref}>
        <Img src={c.imageUrl} className="mz-hero mz-hero-tall" />
        {T("quote", "blockquote", c.quote, { ph: "A line readers remember." })}
        {T("body", "p", c.body, { ph: "Supporting context and credits.", className: "mz-body", multi: true })}
        {T("caption", "small", c.caption, { ph: "Credit", fallback: pub.profile_name })}
      </div>;
      break;
    case "news_grid":
      inner = <div className="mz-pad" ref={ref}>
        {T("subheadline", "small", c.subheadline, { ph: "Kicker", fallback: "In this issue" })}
        {T("headline", "h2", c.headline, { ph: "The latest" })}
        {stories.length === 0 && (placeholders || edit) && <p className="mz-empty">Pick up to 3 newsroom stories from the Stories tab.</p>}
        <div className="mz-grid">{stories.slice(0, 3).map((a) => <div key={a.id}>
          <Img src={a.cover_url || undefined} /><small>{a.category || "News"}</small><h4>{a.headline}</h4><p>{a.description || a.body.slice(0, 160) + "…"}</p>
        </div>)}</div>
      </div>;
      break;
    case "closing":
    default:
      inner = <div className="mz-pad mz-close" ref={ref}>
        <b>✦</b>
        {T("headline", "h2", c.headline, { ph: "Thanks for reading.", fallback: "Thanks for reading." })}
        {T("subheadline", "h3", c.subheadline, { ph: "Made by the community.", fallback: pub.description || undefined })}<hr />
        {T("body", "p", c.body, { ph: "Credits, contact details and acknowledgements.", className: "mz-body", multi: true })}
      </div>;
  }
  const els = c.elements || [];
  const fixed = t === "canvas" || els.length > 0;
  return <article className={`mz-paper mz-t-${t}${fixed ? " mz-fixed" : ""}${isDark(c.bg) ? " mz-dark" : ""}`} style={{ "--accent": c.accent || "#ff6a1f", background: c.bg || undefined } as CSSProperties}>
    {inner}
    {layer ?? (els.length > 0 && <div className="mz-layer">{els.map((el, i) => <div key={el.id} style={elBoxStyle(el, i)}><ElementView el={el} /></div>)}</div>)}
    {t !== "cover" && t !== "canvas" && <footer className="mz-folio"><span>{pub.profile_name}</span><span>{page.page_number}</span></footer>}
  </article>;
}

/** Every page at true A4, mounted in <body>, visible only when printing. */
export function PrintIssue({ pages, pub, articles }: { pages: MagPage[]; pub: Publication; articles: Article[] }) {
  return createPortal(<div className="mz-print-root">{pages.map((p) => <MagazinePage key={p.id} page={p} pub={pub} articles={articles} />)}</div>, document.body);
}

export const MAGAZINE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Serif+Display:ital@0;1&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Space+Grotesk:wght@400..700&display=swap');
.mz-paper{--accent:#ff6a1f;--fs-kick:1.35cqw;--fs-h1:10.2cqw;--fs-h2:7.4cqw;--fs-h3:2.5cqw;--fs-h4:2.6cqw;--fs-body:1.9cqw;--fs-quote:7.6cqw;--fs-pull:3.4cqw;--fs-small:1.25cqw;--pad:9cqw;
  container-type:inline-size;position:relative;width:min(100%,760px);aspect-ratio:210/297;background:#f4efe7;color:#141414;overflow:hidden;box-shadow:0 25px 80px rgba(0,0,0,.45);margin:auto;flex:none;
  -webkit-print-color-adjust:exact;print-color-adjust:exact}
.mz-paper *{box-sizing:border-box}
.mz-dark{color:#f4efe7}.mz-dark .mz-paper h3,.mz-dark h3,.mz-dark .mz-grid p{color:#bdbdbd}
.mz-paper small{display:block;font:700 var(--fs-kick)/1.2 "Inter Tight",ui-sans-serif,system-ui,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin:0}
.mz-paper h1{font:900 var(--fs-h1)/.86 Georgia,"Times New Roman",serif;letter-spacing:-.055em;margin:.25em 0 .2em;overflow-wrap:anywhere}
.mz-paper h2{font:900 var(--fs-h2)/.9 Georgia,serif;letter-spacing:-.05em;margin:.25em 0;overflow-wrap:anywhere}
.mz-paper h3{font:500 var(--fs-h3)/1.35 "Inter Tight",ui-sans-serif,system-ui,sans-serif;color:#5d5d5d;margin:0 0 1.2em}
.mz-paper hr{border:0;border-top:.25cqw solid var(--accent);width:12cqw;margin:2.4cqw 0}
.mz-body{font:400 var(--fs-body)/1.7 Georgia,serif;white-space:pre-line;margin:0;hyphens:auto;text-align:justify}
.mz-dropcap::first-letter{float:left;font:900 calc(var(--fs-body)*4.1)/.8 Georgia,serif;color:var(--accent);margin:.06em .1em 0 0}
.mz-pad{height:100%;padding:var(--pad) var(--pad) calc(var(--pad) + 2cqw);overflow:hidden;clip-path:inset(0 0 calc(var(--pad) + 2cqw) 0)}
.mz-hero{width:100%;height:34cqw;object-fit:cover;margin-bottom:3cqw;display:block}
.mz-hero-tall{height:58cqw}
.mz-cover{position:absolute;inset:0;background:#141414;color:#fff}
.mz-cover-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.mz-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55) 0%,transparent 22%,transparent 45%,rgba(0,0,0,.88) 100%)}
.mz-mast{position:absolute;top:6cqw;left:8cqw;right:8cqw;display:flex;align-items:center;gap:2.4cqw;font:900 4.6cqw/1 Georgia,serif;letter-spacing:-.04em;border-bottom:.3cqw solid var(--accent);padding-bottom:2.6cqw}
.mz-logo{width:7cqw;height:7cqw;object-fit:cover;border-radius:1.4cqw}
.mz-cover-copy{position:absolute;left:8cqw;right:8cqw;bottom:9cqw}
.mz-cover-copy h1{font-size:12cqw}
.mz-cover-copy p{font:500 2.4cqw/1.45 "Inter Tight",ui-sans-serif,system-ui,sans-serif;color:#ddd;max-width:80%;margin:0}
.mz-cols{display:grid;grid-template-columns:1.3fr .7fr;gap:4cqw}
.mz-cols figure{margin:0 0 2.4cqw}.mz-cols img,.mz-grid img,.mz-side-img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}
.mz-side-img{margin-bottom:2.4cqw}
.mz-cols figcaption{font:700 var(--fs-small)/1.3 ui-sans-serif,sans-serif;margin-top:.8cqw}
.mz-pull{font:900 var(--fs-pull)/1.05 Georgia,serif;letter-spacing:-.03em;color:var(--accent);margin:0 0 3cqw;border-left:.5cqw solid var(--accent);padding-left:2cqw}
.mz-iq blockquote{font:900 var(--fs-quote)/.92 Georgia,serif;letter-spacing:-.05em;margin:3cqw 0 3cqw}
.mz-iq blockquote::before{content:"“";color:var(--accent)}
.mz-iq small{margin-top:2cqw}
.mz-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2.6cqw;margin-top:4cqw}
.mz-grid small{margin-top:1.6cqw}
.mz-grid h4{font:900 var(--fs-h4)/1 Georgia,serif;margin:.8cqw 0;letter-spacing:-.02em}
.mz-grid p{font:var(--fs-small)/1.5 ui-sans-serif,sans-serif;color:#5d5d5d;margin:0}
.mz-empty{font:600 var(--fs-body)/1.4 ui-sans-serif,sans-serif;color:#999;margin-top:4cqw}
.mz-close{display:flex;flex-direction:column;justify-content:center}
.mz-close>b{font-size:8cqw;color:var(--accent)}
.mz-folio{position:absolute;left:var(--pad);right:var(--pad);bottom:4.5cqw;display:flex;justify-content:space-between;font:700 var(--fs-small)/1 ui-sans-serif,sans-serif;color:#8a8a8a;letter-spacing:.12em;text-transform:uppercase;z-index:5}
.mz-layer{position:absolute;inset:0;z-index:6}
.mz-img-empty{width:100%;height:100%;display:grid;place-items:center;background:repeating-linear-gradient(45deg,#0001 0 1cqw,#0000 1cqw 2cqw);border:.2cqw dashed #0003;font:600 1.6cqw ui-sans-serif,sans-serif;color:#0007}
.mz-ed{outline:none;cursor:text;border-radius:.4cqw;transition:box-shadow .15s}
.mz-ed:hover{box-shadow:0 0 0 .25cqw rgba(255,106,31,.45)}
.mz-ed:focus{box-shadow:0 0 0 .3cqw #ff6a1f}
.mz-ed:empty::before{content:attr(data-ph);opacity:.32;pointer-events:none}
.mz-print-root{display:none}
@media print{
  @page{size:A4;margin:0}
  body>*:not(.mz-print-root){display:none!important}
  html,body{background:#fff!important;margin:0!important}
  .mz-print-root{display:block!important}
  .mz-print-root .mz-paper{width:210mm;box-shadow:none;margin:0;break-after:page;page-break-after:always}
  .mz-print-root .mz-paper:last-child{break-after:auto;page-break-after:auto}
}`;
