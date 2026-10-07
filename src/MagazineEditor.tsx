import { useCallback, useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import UniversalNavbar from "./UniversalNavbar";
import { supabase } from "./lib/supabase";
import {
  ACCENTS, BLANK, ElementView, FONTS, LABELS, MAGAZINE_CSS, MagazinePage, PAGE_COLS, PAPERS, PrintIssue, TEMPLATES, elBoxStyle, tpl, uid,
  type Article, type El, type FontKey, type MagPage, type Magazine, type PageContent, type Publication, type TextField,
} from "./MagazineShared";

type SaveState = "idle" | "pending" | "saving" | "saved" | "error";
type Hist = "push" | "coalesce" | "none";
type Snap = { id: string; content: PageContent | null; template: string };
type Tab = "design" | "text" | "elements" | "images" | "stories" | "issue";
const MAG_COLS = "id,publication_id,title,subtitle,cover_url,status,updated_at";
const PAGE_RATIO = 210 / 297; // 1% of height = this many % of width
const pad2 = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const round = (v: number) => Math.round(v * 10) / 10;
const fresh = (els: El[] = []) => els.map((e) => ({ ...e, id: uid() }));

// ─── Presets ─────────────────────────────────────────────────────────────────
const TEXT_PRESETS: { label: string; preview: string; make: (accent: string) => Partial<El> }[] = [
  { label: "Add a heading", preview: "font-['Playfair_Display'] text-2xl font-black", make: () => ({ text: "Add a heading", font: "playfair", size: 7, weight: 800, w: 80 }) },
  { label: "Add a subheading", preview: "text-base font-semibold", make: () => ({ text: "Add a subheading", font: "sans", size: 3, weight: 600, w: 70 }) },
  { label: "Add body text", preview: "font-serif text-xs", make: () => ({ text: "Add a little bit of body text. Double-click to edit.", font: "serif", size: 1.9, lh: 1.65, w: 55 }) },
  { label: "KICKER LABEL", preview: "text-[10px] font-bold tracking-[.2em] text-[#ff6a1f]", make: (a) => ({ text: "Kicker label", font: "sans", size: 1.4, weight: 700, upper: true, tracking: 0.2, color: a, w: 40 }) },
  { label: "42", preview: "font-['Anton'] text-4xl text-[#ff6a1f]", make: (a) => ({ text: "42", font: "anton", size: 22, color: a, w: 40 }) },
  { label: "“Pull quote”", preview: "font-['Playfair_Display'] italic text-xl font-bold", make: (a) => ({ text: "“A line readers remember.”", font: "playfair", italic: true, size: 4.5, weight: 700, color: a, w: 70 }) },
  { label: "LABEL PILL", preview: "inline-block rounded-full bg-[#ff6a1f] px-3 py-1 text-[10px] font-bold text-white", make: (a) => ({ text: "New", font: "sans", size: 1.4, weight: 700, upper: true, tracking: 0.15, color: "#ffffff", fill: a, radius: 3, w: 12 }) },
  { label: "BIG POSTER TYPE", preview: "font-['Anton'] text-2xl uppercase", make: () => ({ text: "BIG POSTER TYPE", font: "anton", size: 11, upper: true, w: 84 }) },
];
const SHAPE_PRESETS: { label: string; make: (accent: string) => Partial<El> }[] = [
  { label: "Rectangle", make: () => ({ type: "shape", shape: "rect", fill: "#141414", w: 30, h: 20 }) },
  { label: "Circle", make: (a) => ({ type: "shape", shape: "circle", fill: a, w: 22, h: 22 * PAGE_RATIO }) },
  { label: "Line", make: () => ({ type: "shape", shape: "rect", fill: "#141414", w: 60, h: 0.25 }) },
  { label: "Accent bar", make: (a) => ({ type: "shape", shape: "rect", fill: a, w: 12, h: 0.7 }) },
  { label: "Card", make: () => ({ type: "shape", shape: "rect", fill: "#ffffff", radius: 2, w: 40, h: 25 }) },
  { label: "Page tint", make: () => ({ type: "shape", shape: "rect", fill: "#000000", opacity: 0.45, x: 0, y: 0, w: 100, h: 100 }) },
  { label: "Image frame", make: () => ({ type: "image", src: "", w: 50, h: 32 }) },
  { label: "Round photo", make: () => ({ type: "image", src: "", w: 30, h: 30 * PAGE_RATIO, radius: 50 }) },
];
type Ctx = { accent: string; pub: Publication; pages: MagPage[]; cover?: string };
const T = (p: Partial<El>): El => ({ id: uid(), type: "text", x: 8, y: 8, w: 84, h: 5, font: "sans", size: 3, ...p });
const STARTERS: { label: string; bg: string; make: (c: Ctx) => El[] }[] = [
  { label: "Poster cover", bg: "#111111", make: (c) => [
    { id: uid(), type: "image", src: c.cover || "", x: 0, y: 0, w: 100, h: 100 },
    { id: uid(), type: "shape", shape: "rect", fill: "#000000", opacity: 0.55, x: 0, y: 60, w: 100, h: 40 },
    T({ text: `${c.pub.profile_name} · Issue 01`, size: 1.5, weight: 700, upper: true, tracking: 0.2, color: c.accent, y: 7 }),
    T({ text: "THE BIG ISSUE", font: "anton", size: 15, upper: true, color: "#ffffff", y: 64, lh: 0.9 }),
    T({ text: "The cover line that makes people pick it up.", size: 2.4, color: "#dddddd", y: 88, w: 70 }),
  ] },
  { label: "Contents (auto)", bg: "#f4efe7", make: (c) => {
    const rows = c.pages.filter((p) => tpl(p) !== "cover").slice(0, 10);
    return [
      T({ text: "In this issue", font: "playfair", size: 8, weight: 800, y: 8 }),
      { id: uid(), type: "shape", shape: "rect", fill: c.accent, x: 8, y: 19, w: 10, h: 0.6 },
      ...rows.flatMap((p, i) => [
        T({ text: pad2(p.page_number), font: "anton", size: 4.6, color: c.accent, x: 8, y: 24 + i * 7, w: 10 }),
        T({ text: p.content?.headline || LABELS[tpl(p)], font: "serif", size: 2.6, weight: 600, x: 20, y: 25 + i * 7, w: 72 }),
      ]),
    ];
  } },
  { label: "Big stat", bg: "#ff6a1f", make: () => [
    T({ text: "80+", font: "anton", size: 34, color: "#111111", y: 18, lh: 0.85 }),
    T({ text: "students showed up to the first rooftop star party.", font: "grotesk", size: 3.4, weight: 600, color: "#111111", y: 62, w: 72, lh: 1.15 }),
    T({ text: "Source · Event sign-ups", size: 1.4, weight: 700, upper: true, tracking: 0.2, color: "#111111", y: 88 }),
  ] },
  { label: "Photo essay", bg: "#ffffff", make: (c) => [
    { id: uid(), type: "image", src: c.cover || "", x: 6, y: 6, w: 88, h: 50 },
    { id: uid(), type: "image", src: "", x: 6, y: 58, w: 42.5, h: 27 },
    { id: uid(), type: "image", src: "", x: 51.5, y: 58, w: 42.5, h: 27 },
    T({ text: "Photo essay", font: "playfair", italic: true, size: 4.2, weight: 700, x: 6, y: 87.5, w: 40 }),
    T({ text: "Captions and credits go here.", size: 1.5, color: "#666666", x: 51.5, y: 89, w: 42.5 }),
  ] },
  { label: "Quote card", bg: "#111111", make: (c) => [
    T({ text: "“", font: "playfair", size: 34, weight: 900, color: c.accent, y: 2, lh: 1 }),
    T({ text: "Look up. It's free, and it's the best show in town.", font: "playfair", italic: true, size: 6.2, weight: 600, color: "#ffffff", y: 32, lh: 1.05 }),
    T({ text: "— Name, Class XII", size: 1.6, weight: 700, upper: true, tracking: 0.2, color: c.accent, y: 80 }),
  ] },
  { label: "Tech editorial", bg: "#0e1116", make: (c) => [
    T({ text: "// cyber desk", font: "mono", size: 1.8, color: c.accent, y: 8 }),
    T({ text: "Twelve passwords fell in under a minute.", font: "grotesk", size: 7.5, weight: 700, color: "#f4efe7", y: 14, lh: 1 }),
    { id: uid(), type: "shape", shape: "rect", fill: c.accent, x: 8, y: 47, w: 84, h: 0.3 },
    T({ text: "Write the story here. Double-click any text to edit it.", font: "serif", size: 2, color: "#c9c9c9", y: 51, w: 60, lh: 1.65 }),
  ] },
];

// ─── Small UI bits ───────────────────────────────────────────────────────────
const TB = ({ children, onClick, active, disabled, title, wide }: { children: ReactNode; onClick: () => void; active?: boolean; disabled?: boolean; title?: string; wide?: boolean }) =>
  <button title={title} onClick={onClick} disabled={disabled} className={`h-8 ${wide ? "px-3" : "min-w-8 px-2"} rounded-lg text-xs font-bold transition disabled:opacity-25 ${active ? "bg-[#8b5cf6]/25 text-[#c4b5fd]" : "hover:bg-white/10"}`}>{children}</button>;
const Sep = () => <span className="mx-1 h-5 w-px bg-white/10" />;
function Colors({ value, onChange, extra = [] }: { value?: string; onChange: (c: string) => void; extra?: string[] }) {
  const list = [...new Set([...extra, ...ACCENTS, "#ffffff", "#f4efe7"])];
  return <div className="flex items-center gap-1">
    {list.slice(0, 9).map((c) => <button key={c} title={c} onClick={() => onChange(c)} className={`h-5 w-5 rounded-full border ${value?.toLowerCase() === c.toLowerCase() ? "border-2 border-[#8b5cf6]" : "border-white/20"}`} style={{ background: c }} />)}
    <label className="relative h-5 w-5 cursor-pointer overflow-hidden rounded-full border border-white/20" style={{ background: "conic-gradient(red,yellow,lime,cyan,blue,magenta,red)" }} title="Custom colour">
      <input type="color" value={value && /^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
    </label>
  </div>;
}
function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <label className="block"><span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[.18em] text-white/35">{label}</span>
    <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] p-2.5 text-sm outline-none focus:border-[#8b5cf6]/60" /></label>;
}
const H = ({ children }: { children: ReactNode }) => <p className="mb-3 mt-5 text-[9px] font-bold uppercase tracking-[.2em] text-white/35 first:mt-0">{children}</p>;

// ─── Editor ──────────────────────────────────────────────────────────────────
export default function MagazineEditor() {
  const [session, setSession] = useState<any>(null);
  const [booting, setBooting] = useState(true);
  const [pub, setPub] = useState<Publication | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [issues, setIssues] = useState<Magazine[]>([]);
  const [mag, setMag] = useState<Magazine | null>(null);
  const [pages, setPages] = useState<MagPage[]>([]);
  const [selected, setSelected] = useState(0);
  const [selEl, setSelEl] = useState<string | null>(null);
  const [editingEl, setEditingEl] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("design");
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [busy, setBusy] = useState(false);
  const [storyQuery, setStoryQuery] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [overflow, setOverflow] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState<"fit" | number>("fit");
  const [stage, setStage] = useState({ w: 800, h: 700 });
  const [guides, setGuides] = useState<{ v: number[]; h: number[] }>({ v: [], h: [] });
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [, setTick] = useState(0);

  const pagesRef = useRef<MagPage[]>([]);
  pagesRef.current = pages;
  const commitPages = (next: MagPage[]) => { pagesRef.current = next; setPages(next); };
  const page = pages[selected];
  const pc = { ...BLANK, ...(page?.content || {}) };
  const els = pc.elements || [];
  const el = els.find((e) => e.id === selEl) || null;

  // ── Debounced, serialized autosave ──
  const dirty = useRef(new Map<string, { content?: PageContent | null; template?: string }>());
  const dirtyMag = useRef<{ title?: string; subtitle?: string | null } | null>(null);
  const magIdRef = useRef<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const chain = useRef<Promise<void>>(Promise.resolve());
  const draftStatus = useRef("draft");

  const flush = useCallback(() => {
    window.clearTimeout(timer.current);
    chain.current = chain.current.then(async () => {
      const batch = Array.from(dirty.current.entries());
      const magPatch = dirtyMag.current;
      dirty.current.clear();
      dirtyMag.current = null;
      if (!batch.length && !magPatch) return;
      setSaveState("saving");
      const results = await Promise.all([
        ...batch.map(([id, patch]) => supabase.from("bitbuzz_magazine_pages").update(patch).eq("id", id)),
        ...(magPatch && magIdRef.current ? [supabase.from("bitbuzz_magazines").update(magPatch).eq("id", magIdRef.current)] : []),
      ]);
      const err = results.find((r) => r.error)?.error;
      if (err) { setSaveState("error"); setMessage(`Save failed: ${err.message}`); }
      else setSaveState(dirty.current.size ? "pending" : "saved");
    });
    return chain.current;
  }, []);
  const schedule = () => { setSaveState("pending"); window.clearTimeout(timer.current); timer.current = window.setTimeout(flush, 700); };
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (dirty.current.size || dirtyMag.current) { flush(); e.preventDefault(); } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [flush]);

  // ── Undo / redo (content + layout edits; page add/delete/reorder are not undoable) ──
  const hist = useRef<{ undo: Snap[]; redo: Snap[]; last: { id: string; t: number } }>({ undo: [], redo: [], last: { id: "", t: 0 } });
  const snapshot = (p: MagPage, coalesce: boolean) => {
    const h = hist.current, now = Date.now();
    if (coalesce && h.last.id === p.id && now - h.last.t < 900) { h.last.t = now; return; }
    h.undo.push({ id: p.id, content: p.content, template: p.template });
    if (h.undo.length > 150) h.undo.shift();
    h.redo = [];
    h.last = { id: p.id, t: now };
    setTick((t) => t + 1);
  };
  const patchPage = (id: string, patch: { content?: PageContent; template?: string }, mode: Hist = "coalesce") => {
    const before = pagesRef.current.find((p) => p.id === id);
    if (!before) return;
    if (mode !== "none") snapshot(before, mode === "coalesce");
    commitPages(pagesRef.current.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    dirty.current.set(id, { ...dirty.current.get(id), ...patch });
    schedule();
  };
  const travel = (from: "undo" | "redo") => {
    const h = hist.current, to = from === "undo" ? "redo" : "undo";
    let s: Snap | undefined;
    while ((s = h[from].pop())) {
      const cur = pagesRef.current.find((p) => p.id === s!.id);
      if (!cur) continue;
      h[to].push({ id: cur.id, content: cur.content, template: cur.template });
      h.last = { id: "", t: 0 };
      patchPage(s.id, { content: s.content || undefined, template: s.template }, "none");
      setSelected(pagesRef.current.findIndex((p) => p.id === s!.id));
      break;
    }
    setTick((t) => t + 1);
  };

  const updateContent = (id: string, fn: (c: PageContent) => PageContent, mode: Hist = "coalesce") => {
    const p = pagesRef.current.find((x) => x.id === id);
    if (p) patchPage(id, { content: fn({ ...BLANK, ...(p.content || {}) }) }, mode);
  };
  const setContent = (patch: Partial<PageContent>, mode: Hist = "coalesce") => page && updateContent(page.id, (c) => ({ ...c, ...patch }), mode);
  const updateEls = (fn: (xs: El[]) => El[], mode: Hist = "push") => page && updateContent(page.id, (c) => ({ ...c, elements: fn(c.elements || []) }), mode);
  const updateEl = (id: string, patch: Partial<El>, mode: Hist = "coalesce") => updateEls((xs) => xs.map((e) => (e.id === id ? { ...e, ...patch } : e)), mode);
  const addEl = (partial: Partial<El>) => {
    const w = partial.w ?? 40;
    const base: El = { id: uid(), type: "text", x: round(50 - w / 2), y: 40, w, h: 20, ...partial } as El;
    if (partial.x === undefined) { // cascade so repeated adds don't stack perfectly
      const n = els.filter((e) => Math.abs(e.x - base.x) < 0.5).length;
      base.x = round(clamp(base.x + n * 2, 0, 100 - w)); base.y = round(base.y + n * 2);
    }
    updateEls((xs) => [...xs, base]);
    setSelEl(base.id);
  };
  const removeEl = (id: string) => { updateEls((xs) => xs.filter((e) => e.id !== id)); setSelEl(null); };
  const dupEl = (id: string) => { const src = els.find((e) => e.id === id); if (!src) return; const copy = { ...src, id: uid(), x: round(src.x + 2), y: round(src.y + 2), locked: false }; updateEls((xs) => [...xs, copy]); setSelEl(copy.id); };
  const layerEl = (id: string, dir: "up" | "down" | "top" | "bottom") => updateEls((xs) => {
    const i = xs.findIndex((e) => e.id === id); if (i < 0) return xs;
    const c = [...xs]; const [it] = c.splice(i, 1);
    const at = dir === "top" ? c.length : dir === "bottom" ? 0 : clamp(i + (dir === "up" ? 1 : -1), 0, c.length);
    c.splice(at, 0, it); return c;
  });

  // ── Loading ──
  const loadPages = async (m: Magazine) => {
    magIdRef.current = m.id;
    if (m.status && m.status !== "published") draftStatus.current = m.status;
    setMag(m);
    const { data, error } = await supabase.from("bitbuzz_magazine_pages").select(PAGE_COLS).eq("magazine_id", m.id).order("page_number");
    if (error) setMessage(error.message);
    commitPages((data || []) as MagPage[]);
    setSelected(0); setSelEl(null); setOverflow({});
    hist.current = { undo: [], redo: [], last: { id: "", t: 0 } };
  };
  const loadIssues = async (p: Publication, pick?: string) => {
    const { data, error } = await supabase.from("bitbuzz_magazines").select(MAG_COLS).eq("publication_id", p.id).order("updated_at", { ascending: false });
    if (error) { setMessage(error.message); return; }
    const list = (data || []) as Magazine[];
    setIssues(list);
    const target = list.find((m) => m.id === pick) || list[0];
    if (target) await loadPages(target);
  };
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (!data.session) { setBooting(false); return; }
      const { data: p } = await supabase.rpc("bitbuzz_my_publications");
      const first = (p?.[0] || null) as Publication | null;
      setPub(first);
      if (first) {
        const a = await supabase.from("bitbuzz_articles").select("id,headline,description,body,category,cover_url").eq("publication_id", first.id).eq("status", "published").order("published_at", { ascending: false });
        setArticles((a.data || []) as Article[]);
        await loadIssues(first);
      }
      setBooting(false);
    });
  }, []);

  // ── Structural actions (flush pending saves first) ──
  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await flush(); await fn(); } catch (e: any) { setMessage(e?.message || String(e)); } finally { setBusy(false); } };
  /** Renumber to match array order in two passes, so a unique (magazine_id, page_number) index can't trip. */
  const persistOrder = async (next: MagPage[]) => {
    const changed = next.map((p, i) => ({ p, n: i + 1 })).filter((x) => x.p.page_number !== x.n);
    for (const pass of [100000, 0]) {
      const res = await Promise.all(changed.map((x) => supabase.from("bitbuzz_magazine_pages").update({ page_number: pass + x.n }).eq("id", x.p.id)));
      const err = res.find((r) => r.error)?.error; if (err) throw err;
    }
    commitPages(next.map((p, i) => ({ ...p, page_number: i + 1 })));
  };
  const createIssue = () => run(async () => {
    if (!pub) return;
    const { data, error } = await supabase.rpc("bitbuzz_create_magazine", { p_publication_id: pub.id, p_title: `${pub.profile_name} · Issue ${pad2(issues.length + 1)}` });
    if (error) throw error;
    await loadIssues(pub, (data as Magazine).id);
  });
  const switchIssue = (id: string) => run(async () => { const m = issues.find((x) => x.id === id); if (m) await loadPages(m); });
  /** Canvas pages are stored as template "feature" + content.layout "canvas" (works whatever the DB allows). */
  const insertPage = (template: string, content: PageContent) => run(async () => {
    if (!mag) return;
    const max = Math.max(0, ...pagesRef.current.map((p) => p.page_number));
    const { data, error } = await supabase.from("bitbuzz_magazine_pages").insert({ magazine_id: mag.id, page_number: max + 1, template, content }).select(PAGE_COLS).single();
    if (error) throw error;
    const at = Math.min(selected + 1, pagesRef.current.length);
    const next = [...pagesRef.current]; next.splice(at, 0, data as MagPage);
    await persistOrder(next);
    setSelected(at); setSelEl(null);
  });
  const addTemplatePage = (t: string) => insertPage(t === "canvas" ? "feature" : t, { ...BLANK, accent: pc.accent, ...(t === "canvas" ? { layout: "canvas" as const, bg: "#f4efe7" } : {}) });
  const addStarter = (s: (typeof STARTERS)[number]) => pub && insertPage("feature", { ...BLANK, accent: pc.accent, layout: "canvas", bg: s.bg, elements: s.make({ accent: pc.accent || "#ff6a1f", pub, pages: pagesRef.current, cover: articles.find((a) => a.cover_url)?.cover_url || "" }) });
  const duplicatePage = () => page && insertPage(page.template, { ...BLANK, ...(page.content || {}), elements: fresh(page.content?.elements) });
  const deletePage = () => run(async () => {
    if (!page || pages.length <= 1) return;
    if (!window.confirm(`Delete page ${selected + 1} (“${page.content?.headline || LABELS[tpl(page)]}”)? This can't be undone.`)) return;
    dirty.current.delete(page.id);
    const { error } = await supabase.from("bitbuzz_magazine_pages").delete().eq("id", page.id);
    if (error) throw error;
    await persistOrder(pagesRef.current.filter((p) => p.id !== page.id));
    setSelected(Math.max(0, selected - 1)); setSelEl(null);
  });
  const reorder = (from: number, to: number) => run(async () => {
    if (from === to) return;
    const next = [...pagesRef.current]; const [it] = next.splice(from, 1); next.splice(to, 0, it);
    await persistOrder(next); setSelected(to);
  });
  const switchTemplate = (t: string) => page && patchPage(page.id, t === "canvas"
    ? { content: { ...pc, layout: "canvas" } }
    : { template: t, content: { ...pc, layout: undefined } }, "push");

  const publish = () => run(async () => {
    if (!mag) return;
    const empty = pages.filter((p) => tpl(p) !== "news_grid" && !p.content?.headline && !p.content?.body && !p.content?.quote && !(p.content?.elements?.length)).length;
    const over = pages.filter((p) => overflow[p.id]).length;
    if ((empty || over) && !window.confirm(`${empty ? `${empty} page(s) look empty. ` : ""}${over ? `${over} page(s) have text cut off. ` : ""}Publish anyway?`)) return;
    const { error } = await supabase.rpc("bitbuzz_publish_magazine", { p_magazine_id: mag.id });
    if (error) throw error;
    setMag({ ...mag, status: "published" });
    setIssues((xs) => xs.map((m) => (m.id === mag.id ? { ...m, status: "published" } : m)));
    setMessage("Published. It's live on your public magazine page.");
  });
  const unpublish = () => run(async () => {
    if (!mag || !window.confirm("Take this issue offline? Readers won't see it until you publish again.")) return;
    const { error } = await supabase.from("bitbuzz_magazines").update({ status: draftStatus.current }).eq("id", mag.id);
    if (error) throw error;
    setMag({ ...mag, status: draftStatus.current });
    setIssues((xs) => xs.map((m) => (m.id === mag.id ? { ...m, status: draftStatus.current } : m)));
  });
  const patchMag = (patch: { title?: string; subtitle?: string | null }) => {
    if (!mag) return;
    setMag({ ...mag, ...patch });
    setIssues((xs) => xs.map((m) => (m.id === mag.id ? { ...m, ...patch } : m)));
    dirtyMag.current = { ...dirtyMag.current, ...patch };
    schedule();
  };
  const onOverflow = useCallback((id: string, over: boolean) => setOverflow((o) => (o[id] === over ? o : { ...o, [id]: over })), []);

  // ── Stage sizing / zoom ──
  const stageRO = useRef<ResizeObserver | null>(null);
  const stageRef = useCallback((n: HTMLDivElement | null) => {
    stageRO.current?.disconnect();
    if (!n) return;
    const measure = () => setStage((s) => (s.w === n.clientWidth && s.h === n.clientHeight ? s : { w: n.clientWidth, h: n.clientHeight }));
    stageRO.current = new ResizeObserver(measure);
    stageRO.current.observe(n);
  }, []);
  const fitW = Math.max(240, Math.min(stage.w - 96, (stage.h - 56) * PAGE_RATIO));
  const pageW = zoom === "fit" ? fitW : 760 * zoom;

  // ── Drag / resize with snapping ──
  const layerRef = useRef<HTMLDivElement>(null);
  const startDrag = (e: RPointerEvent, target: El, mode: "move" | "resize") => {
    if (e.button !== 0 || editingEl === target.id) return;
    e.stopPropagation(); e.preventDefault();
    setSelEl(target.id);
    if (target.locked) return;
    const rect = layerRef.current!.getBoundingClientRect();
    const node = (e.currentTarget as HTMLElement).closest("[data-el]") as HTMLElement;
    const hPct = target.type === "text" ? (node.getBoundingClientRect().height / rect.height) * 100 : target.h;
    const sx = e.clientX, sy = e.clientY, s = { ...target };
    let pushed = false;
    const move = (ev: PointerEvent) => {
      const dx = ((ev.clientX - sx) / rect.width) * 100, dy = ((ev.clientY - sy) / rect.height) * 100;
      if (!pushed && Math.abs(dx) + Math.abs(dy) < 0.3) return;
      if (!pushed) { page && snapshot(pagesRef.current.find((p) => p.id === page.id)!, false); pushed = true; }
      if (mode === "resize") {
        const w = clamp(s.w + dx, 2, 100 - s.x + 50);
        const h = s.type === "text" ? s.h : ev.shiftKey || s.type === "image" && s.radius === 50 ? s.h * (w / s.w) : clamp(s.h + dy, 0.2, 200);
        updateEl(s.id, { w: round(w), h: round(h) }, "none");
        return;
      }
      let x = s.x + dx, y = s.y + dy;
      const v: number[] = [], hz: number[] = [];
      if (!ev.altKey) {
        const snapX = (edge: number, line: number, off: number) => { if (Math.abs(edge - line) < 1) { x = line - off; v.push(line); return true; } return false; };
        const snapY = (edge: number, line: number, off: number) => { if (Math.abs(edge - line) < 0.8) { y = line - off; hz.push(line); return true; } return false; };
        snapX(x + s.w / 2, 50, s.w / 2) || snapX(x, 8, 0) || snapX(x + s.w, 92, s.w) || snapX(x, 0, 0) || snapX(x + s.w, 100, s.w);
        snapY(y + hPct / 2, 50, hPct / 2) || snapY(y, 8, 0) || snapY(y + hPct, 92, hPct) || snapY(y, 0, 0) || snapY(y + hPct, 100, hPct);
      }
      setGuides({ v, h: hz });
      updateEl(s.id, { x: round(x), y: round(y) }, "none");
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); setGuides({ v: [], h: [] }); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  // ── Keyboard shortcuts ──
  const clip = useRef<El | null>(null);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t?.closest("input,textarea,select,[contenteditable]")) return;
      const mod = e.metaKey || e.ctrlKey, k = e.key.toLowerCase();
      if (preview) { if (k === "escape") setPreview(false); return; }
      if (mod && k === "z") { e.preventDefault(); travel(e.shiftKey ? "redo" : "undo"); return; }
      if (mod && k === "y") { e.preventDefault(); travel("redo"); return; }
      if (mod && k === "v" && clip.current) { e.preventDefault(); const c = { ...clip.current, id: uid(), x: round(clip.current.x + 2), y: round(clip.current.y + 2) }; updateEls((xs) => [...xs, c]); setSelEl(c.id); clip.current = c; return; }
      if (!el) return;
      if (mod && k === "c") { clip.current = { ...el }; return; }
      if (mod && k === "d") { e.preventDefault(); dupEl(el.id); return; }
      if (k === "delete" || k === "backspace") { e.preventDefault(); removeEl(el.id); return; }
      if (k === "escape") { setSelEl(null); return; }
      if (k === "enter" && el.type === "text") { e.preventDefault(); setEditingEl(el.id); return; }
      if (k === "]") return layerEl(el.id, mod ? "top" : "up");
      if (k === "[") return layerEl(el.id, mod ? "bottom" : "down");
      const step = e.shiftKey ? 2 : 0.5;
      const nudge: Record<string, [number, number]> = { arrowleft: [-step, 0], arrowright: [step, 0], arrowup: [0, -step], arrowdown: [0, step] };
      if (nudge[k] && !el.locked) { e.preventDefault(); updateEl(el.id, { x: round(el.x + nudge[k][0]), y: round(el.y + nudge[k][1]) }); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  // ── Gates ──
  const gate = (text: string) => <><UniversalNavbar /><div className="min-h-screen bg-black px-5 pt-40 text-center text-white"><h1 className="font-serif text-5xl font-black">{text}</h1></div></>;
  if (booting) return gate("Loading studio…");
  if (!session) return gate("Sign in to use the Magazine Studio.");
  if (!pub) return gate("No Ambassador publication connected.");

  const accent = pc.accent || "#ff6a1f";
  const t = page ? tpl(page) : "feature";
  const usesStories = ["feature", "two_column", "news_grid"].includes(t);
  const storyLimit = t === "news_grid" || t === "two_column" ? 3 : 1;
  const usesImage = ["cover", "feature", "two_column", "image_quote"].includes(t);
  const publicUrl = pub.slug && mag ? `/ambassadors/${pub.slug}/magazine/${mag.id}` : null;
  const saveLabel = { idle: "", pending: "Unsaved…", saving: "Saving…", saved: "Saved", error: "Save failed" }[saveState];
  const editField = (field: TextField, v: string) => page && updateContent(page.id, (c) => ({ ...c, [field]: v }), "push");
  const covers = articles.filter((a) => a.cover_url);
  const mini = (p: MagPage, w: number, ph = false) => <div className="mz-thumb pointer-events-none" style={{ width: w }}><MagazinePage page={p} pub={pub} articles={articles} placeholders={ph} /></div>;
  const fakePage = (template: string, content: PageContent = {}): MagPage => ({ id: `tpl-${template}`, page_number: 2, template, content: { ...BLANK, accent, ...content } });

  // ── Interactive element layer ──
  const layer = <div ref={layerRef} className="mz-layer" style={{ pointerEvents: "none" }}>
    {els.map((x, i) => {
      const sel = x.id === selEl;
      return <div key={x.id} data-el={x.id} className={`mz-el ${sel ? "mz-el-sel" : ""}`} style={{ ...elBoxStyle(x, i), pointerEvents: "auto", cursor: x.locked ? "default" : editingEl === x.id ? "text" : "move" }}
        onPointerDown={(e) => startDrag(e, x, "move")} onDoubleClick={() => x.type === "text" && !x.locked && setEditingEl(x.id)}>
        <ElementView el={x} editing={editingEl === x.id} onCommit={(text) => { setEditingEl(null); if (text !== x.text) updateEl(x.id, { text }, "push"); }} />
        {sel && !x.locked && editingEl !== x.id && <span className="mz-handle" onPointerDown={(e) => startDrag(e, x, "resize")} title={x.type === "text" ? "Drag to change width" : "Drag to resize (Shift keeps proportions)"} />}
        {sel && x.locked && <span className="mz-lock">🔒</span>}
      </div>;
    })}
    {guides.v.map((g) => <span key={`v${g}`} className="mz-guide" style={{ left: `${g}%`, top: 0, bottom: 0, width: 1 }} />)}
    {guides.h.map((g) => <span key={`h${g}`} className="mz-guide" style={{ top: `${g}%`, left: 0, right: 0, height: 1 }} />)}
  </div>;

  // ── Contextual toolbar ──
  const toolbar = el ? <>
    {el.type === "text" && <>
      <select value={el.font || "sans"} onChange={(e) => updateEl(el.id, { font: e.target.value as FontKey }, "push")} className="h-8 rounded-lg bg-white/5 px-2 text-xs outline-none" style={{ fontFamily: FONTS[el.font || "sans"].css }}>
        {(Object.keys(FONTS) as FontKey[]).map((f) => <option key={f} value={f} style={{ fontFamily: FONTS[f].css }}>{FONTS[f].label}</option>)}
      </select>
      <div className="flex items-center rounded-lg bg-white/5">
        <TB onClick={() => updateEl(el.id, { size: round(Math.max(0.6, (el.size ?? 3) - ((el.size ?? 3) > 6 ? 1 : 0.2))) })}>−</TB>
        <input value={Math.round((el.size ?? 3) * 7.6)} onChange={(e) => { const n = Number(e.target.value); if (n > 0) updateEl(el.id, { size: round(n / 7.6) }); }} className="w-9 bg-transparent text-center text-xs outline-none" title="Size (px at 760px page width)" />
        <TB onClick={() => updateEl(el.id, { size: round((el.size ?? 3) + ((el.size ?? 3) >= 6 ? 1 : 0.2)) })}>+</TB>
      </div>
      <TB active={(el.weight ?? 400) >= 700} onClick={() => updateEl(el.id, { weight: (el.weight ?? 400) >= 700 ? 400 : 800 }, "push")} title="Bold"><b>B</b></TB>
      <TB active={el.italic} onClick={() => updateEl(el.id, { italic: !el.italic }, "push")} title="Italic"><i className="font-serif">I</i></TB>
      <TB active={el.upper} onClick={() => updateEl(el.id, { upper: !el.upper }, "push")} title="Uppercase">aA</TB>
      <TB onClick={() => updateEl(el.id, { align: el.align === "center" ? "right" : el.align === "right" ? "left" : "center" }, "push")} title="Align">{el.align === "center" ? "≡ C" : el.align === "right" ? "≡ R" : "≡ L"}</TB>
      <Sep /><span className="text-[9px] text-white/40">Text</span><Colors value={el.color || "#141414"} onChange={(c) => updateEl(el.id, { color: c })} extra={["#141414", accent]} />
      <Sep /><span className="text-[9px] text-white/40">Fill</span><TB active={!el.fill} onClick={() => updateEl(el.id, { fill: undefined }, "push")} title="No fill">∅</TB><Colors value={el.fill} onChange={(c) => updateEl(el.id, { fill: c })} extra={[accent]} />
    </>}
    {el.type === "image" && <>
      <input defaultValue={el.src} key={el.id} placeholder="Paste image URL…" onBlur={(e) => updateEl(el.id, { src: e.target.value.trim() }, "push")} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} className="h-8 w-56 rounded-lg bg-white/5 px-2 text-xs outline-none" />
      <TB onClick={() => updateEl(el.id, { x: 0, y: 0, w: 100, h: 100 }, "push")} wide>Fill page</TB>
      <TB active={el.flipX} onClick={() => updateEl(el.id, { flipX: !el.flipX }, "push")} title="Flip">⇋</TB>
      <TB active={el.radius === 50} onClick={() => updateEl(el.id, { radius: el.radius === 50 ? 0 : 50, h: el.radius === 50 ? el.h : el.w * PAGE_RATIO }, "push")} title="Circle crop">◯</TB>
    </>}
    {el.type === "shape" && <>
      <TB active={el.shape !== "circle"} onClick={() => updateEl(el.id, { shape: "rect" }, "push")}>▭</TB>
      <TB active={el.shape === "circle"} onClick={() => updateEl(el.id, { shape: "circle" }, "push")}>◯</TB>
      <Sep /><Colors value={el.fill} onChange={(c) => updateEl(el.id, { fill: c })} extra={[accent, "#141414"]} />
    </>}
    {el.shape !== "circle" && el.radius !== 50 && <><Sep /><label className="flex items-center gap-1 text-[9px] text-white/40">Round<input type="range" min={0} max={6} step={0.2} value={el.radius || 0} onChange={(e) => updateEl(el.id, { radius: Number(e.target.value) })} className="w-14 accent-[#8b5cf6]" /></label></>}
    <label className="flex items-center gap-1 text-[9px] text-white/40">Opacity<input type="range" min={0.05} max={1} step={0.05} value={el.opacity ?? 1} onChange={(e) => updateEl(el.id, { opacity: Number(e.target.value) })} className="w-14 accent-[#8b5cf6]" /></label>
    <Sep />
    <TB onClick={() => layerEl(el.id, "up")} title="Forward  ]">⬆</TB>
    <TB onClick={() => layerEl(el.id, "down")} title="Backward  [">⬇</TB>
    <TB onClick={() => updateEl(el.id, { x: round(50 - el.w / 2) }, "push")} title="Centre horizontally">⇹</TB>
    <TB onClick={() => dupEl(el.id)} title="Duplicate  ⌘D">⧉</TB>
    <TB active={el.locked} onClick={() => updateEl(el.id, { locked: !el.locked }, "push")} title="Lock">{el.locked ? "🔒" : "🔓"}</TB>
    <TB onClick={() => removeEl(el.id)} title="Delete  ⌫"><span className="text-red-400">🗑</span></TB>
  </> : page ? <>
    <span className="px-1 text-[10px] font-bold text-white/50">{LABELS[t]} · page {selected + 1}</span><Sep />
    <span className="text-[9px] text-white/40">Paper</span><Colors value={pc.bg || "#f4efe7"} onChange={(c) => setContent({ bg: c })} extra={PAPERS} />
    <Sep /><span className="text-[9px] text-white/40">Accent</span><Colors value={accent} onChange={(c) => setContent({ accent: c })} />
    <TB wide onClick={() => pagesRef.current.forEach((p) => p.id !== page.id && updateContent(p.id, (c) => ({ ...c, accent }), "push"))}>Apply to all</TB>
    {usesImage && <><Sep /><input key={page.id} defaultValue={pc.imageUrl} placeholder="Page photo URL…" onBlur={(e) => setContent({ imageUrl: e.target.value.trim() }, "push")} onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()} className="h-8 w-44 rounded-lg bg-white/5 px-2 text-xs outline-none" /></>}
    {overflow[page.id] && <span className="ml-1 rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-bold text-red-300">Text runs off the page</span>}
  </> : null;

  // ── Left panel ──
  const tabs: [Tab, string, string][] = [["design", "▦", "Design"], ["text", "T", "Text"], ["elements", "◆", "Elements"], ["images", "▣", "Images"], ["stories", "✎", "Stories"], ["issue", "☰", "Issue"]];
  const panel = (() => {
    switch (tab) {
      case "design": return <>
        <H>Layout for this page</H>
        <div className="grid grid-cols-2 gap-2">{TEMPLATES.map((x) => <button key={x} onClick={() => switchTemplate(x)} className={`rounded-xl border p-1.5 text-left transition ${t === x ? "border-[#8b5cf6] bg-[#8b5cf6]/10" : "border-white/10 hover:border-white/30"}`}>
          {mini(fakePage(x === "canvas" ? "feature" : x, x === "canvas" ? { layout: "canvas" } : {}), 118, true)}<p className="mt-1.5 px-1 text-[10px] font-bold">{LABELS[x]}</p>
        </button>)}</div>
        <H>Add a page after this one</H>
        <div className="flex flex-wrap gap-1.5">{TEMPLATES.map((x) => <button key={x} disabled={busy} onClick={() => addTemplatePage(x)} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] hover:border-white/30">+ {LABELS[x]}</button>)}</div>
        <H>Starter designs (new page)</H>
        <div className="grid grid-cols-2 gap-2">{STARTERS.map((s) => <button key={s.label} disabled={busy} onClick={() => addStarter(s)} className="rounded-xl border border-white/10 p-1.5 text-left transition hover:border-[#8b5cf6]">
          {mini({ id: `st-${s.label}`, page_number: 0, template: "feature", content: { ...BLANK, accent, layout: "canvas", bg: s.bg, elements: s.make({ accent, pub, pages, cover: covers[0]?.cover_url || "" }) } }, 118)}
          <p className="mt-1.5 px-1 text-[10px] font-bold">{s.label}</p>
        </button>)}</div>
      </>;
      case "text": return <>
        <H>Click to add</H>
        <div className="space-y-2">{TEXT_PRESETS.map((p) => <button key={p.label} onClick={() => addEl({ type: "text", ...p.make(accent) })} className="block w-full rounded-xl border border-white/10 bg-white/[.03] p-3 text-left transition hover:border-[#8b5cf6]">
          <span className={p.preview}>{p.label}</span></button>)}</div>
        <p className="mt-4 text-[10px] leading-relaxed text-white/30">Double-click text on the page to edit it. Template text (headline, body…) is click-to-edit directly.</p>
      </>;
      case "elements": return <>
        <H>Shapes & frames</H>
        <div className="grid grid-cols-2 gap-2">{SHAPE_PRESETS.map((p) => { const m = p.make(accent); return <button key={p.label} onClick={() => addEl({ type: "shape", ...m })} className="grid h-20 place-items-center rounded-xl border border-white/10 bg-white/[.03] text-[10px] transition hover:border-[#8b5cf6]">
          <span className="grid h-8 w-12 place-items-center"><span style={{ display: "block", width: m.type === "image" ? 34 : m.w! > 50 ? 44 : m.shape === "circle" ? 24 : 34, height: m.h! < 1 ? 3 : m.shape === "circle" ? 24 : m.type === "image" && m.radius ? 24 : 22, background: m.type === "image" ? "repeating-linear-gradient(45deg,#fff2 0 3px,#0000 3px 6px)" : m.fill === "#141414" || m.fill === "#000000" ? "#e5e5e5" : m.fill, opacity: m.opacity ?? 1, border: m.type === "image" ? "1px dashed #fff5" : undefined, borderRadius: m.shape === "circle" || m.radius === 50 ? "50%" : (m.radius || 0) * 2 }} /></span>
          <span className="text-white/50">{p.label}</span></button>; })}</div>
      </>;
      case "images": return <>
        <H>Add from a link</H>
        <div className="flex gap-2"><input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://…/photo.jpg" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[.04] p-2.5 text-xs outline-none" />
          <button disabled={!imgUrl.trim()} onClick={() => { addEl({ type: "image", src: imgUrl.trim(), w: 50, h: 32 }); setImgUrl(""); }} className="rounded-xl bg-white px-3 text-[10px] font-black text-black disabled:opacity-30">Add</button></div>
        <H>Your story photos</H>
        {covers.length === 0 ? <p className="text-xs text-white/30">Stories with cover images show up here.</p> :
          <div className="grid grid-cols-2 gap-2">{covers.map((a) => <div key={a.id} className="group relative overflow-hidden rounded-xl border border-white/10">
            <img src={a.cover_url!} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end gap-1 bg-black/60 p-1.5 opacity-0 transition group-hover:opacity-100">
              <button onClick={() => addEl({ type: "image", src: a.cover_url!, w: 50, h: 32 })} className="rounded-lg bg-white py-1 text-[9px] font-black text-black">Add to page</button>
              {usesImage && <button onClick={() => setContent({ imageUrl: a.cover_url! }, "push")} className="rounded-lg border border-white/40 py-1 text-[9px] font-bold">Set as page photo</button>}
            </div></div>)}</div>}
        <p className="mt-4 text-[10px] leading-relaxed text-white/30">Use direct image links (ending in .jpg/.png/.webp). File uploads need a Supabase Storage bucket — not wired yet.</p>
      </>;
      case "stories": return <>
        <H>Newsroom material {usesStories && `· ${(pc.storyIds || []).length}/${storyLimit}`}</H>
        {!usesStories && <p className="mb-3 text-[10px] text-white/35">This layout doesn't pull stories. You can still copy one in.</p>}
        {articles.length === 0 ? <p className="text-xs text-white/35">No published stories yet.</p> : <>
          <input value={storyQuery} onChange={(e) => setStoryQuery(e.target.value)} placeholder="Search stories…" className="mb-3 w-full rounded-xl border border-white/10 bg-white/[.04] p-2.5 text-xs outline-none" />
          {articles.filter((a) => !storyQuery || a.headline.toLowerCase().includes(storyQuery.toLowerCase())).map((a) => {
            const on = pc.storyIds?.includes(a.id);
            return <div key={a.id} className={`mb-2 rounded-xl border p-3 ${on ? "border-[#8b5cf6]/60 bg-[#8b5cf6]/10" : "border-white/10"}`}>
              {usesStories ? <button className="w-full text-left" onClick={() => setContent({ storyIds: on ? pc.storyIds!.filter((x) => x !== a.id) : [...(pc.storyIds || []), a.id].slice(-storyLimit) }, "push")}>
                <p className="text-[10px] font-bold">{on ? "✓ " : ""}{a.headline}</p><p className="mt-1 line-clamp-2 text-[9px] text-white/30">{a.description || a.body.slice(0, 100)}</p>
              </button> : <p className="text-[10px] font-bold">{a.headline}</p>}
              {t !== "news_grid" && <button onClick={() => setContent({ headline: a.headline, subheadline: a.description || pc.subheadline, body: a.body, imageUrl: pc.imageUrl || a.cover_url || "" }, "push")} className="mt-2 text-[9px] text-[#c4b5fd] underline">Copy into page</button>}
            </div>;
          })}</>}
      </>;
      case "issue": return mag ? <>
        <H>Issue details</H>
        <div className="space-y-3">
          <Field label="Title" value={mag.title} onChange={(v) => patchMag({ title: v })} />
          <Field label="Subtitle" value={mag.subtitle || ""} onChange={(v) => patchMag({ subtitle: v || null })} placeholder="October 2026 · The Space Edition" />
        </div>
        <H>Shortcuts</H>
        <div className="space-y-1 text-[10px] text-white/40">{[["Double-click / Enter", "edit text"], ["Drag", "move (Alt = no snap)"], ["Arrows", "nudge (Shift = more)"], ["⌘/Ctrl Z · ⇧Z", "undo · redo"], ["⌘/Ctrl C · V · D", "copy · paste · duplicate"], ["[ · ]", "send back · bring forward"], ["⌫", "delete element"]].map(([a, b]) => <p key={a} className="flex justify-between"><span className="font-mono text-white/60">{a}</span><span>{b}</span></p>)}</div>
      </> : null;
    }
  })();

  // ── Render ──
  return <div className="flex h-screen flex-col overflow-hidden bg-[#0b0b0d] text-white">
    <style>{MAGAZINE_CSS + EDITOR_CSS}</style>
    {mag && <PrintIssue pages={pages} pub={pub} articles={articles} />}

    {/* Top bar */}
    <header className="flex h-14 flex-none items-center gap-2 border-b border-white/10 bg-[#111114] px-3">
      <a href="/ambassadors/dashboard" className="rounded-lg px-2 py-1.5 text-xs text-white/50 hover:bg-white/10 hover:text-white">← Dashboard</a>
      <span className="font-serif text-lg font-black">Magazine Studio</span>
      {mag && <>
        <select value={mag.id} onChange={(e) => switchIssue(e.target.value)} className="ml-2 max-w-52 truncate rounded-lg bg-white/5 px-2 py-1.5 text-xs outline-none">
          {issues.map((m) => <option key={m.id} value={m.id}>{m.title}{m.status === "published" ? " · live" : ""}</option>)}
        </select>
        <button onClick={createIssue} disabled={busy} className="rounded-lg px-2 py-1.5 text-xs text-white/60 hover:bg-white/10">+ Issue</button>
        <Sep />
        <TB onClick={() => travel("undo")} disabled={!hist.current.undo.length} title="Undo  ⌘Z">↶</TB>
        <TB onClick={() => travel("redo")} disabled={!hist.current.redo.length} title="Redo  ⇧⌘Z">↷</TB>
        <span className={`ml-1 text-[10px] ${saveState === "error" ? "text-red-400" : "text-white/35"}`}>{saveLabel}</span>
        <span className={`ml-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${mag.status === "published" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/10 text-white/45"}`}>{mag.status === "published" ? "Live" : "Draft"}</span>
        <div className="ml-auto flex items-center gap-1.5">
          <select value={String(zoom)} onChange={(e) => setZoom(e.target.value === "fit" ? "fit" : Number(e.target.value))} className="rounded-lg bg-white/5 px-2 py-1.5 text-xs outline-none">
            <option value="fit">Fit</option>{[0.5, 0.75, 1, 1.25, 1.5].map((z) => <option key={z} value={z}>{z * 100}%</option>)}
          </select>
          <button onClick={() => setPreview(true)} className="rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-white/10">Preview</button>
          <button onClick={async () => { await flush(); window.print(); }} title="Every page at A4 — choose 'Save as PDF' for a file" className="rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-white/10">Print / PDF</button>
          {publicUrl && mag.status === "published" && <a href={publicUrl} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-1.5 text-xs font-bold hover:bg-white/10">Open live ↗</a>}
          {mag.status === "published"
            ? <button onClick={unpublish} disabled={busy} className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold">Unpublish</button>
            : <button onClick={publish} disabled={busy} className="rounded-lg bg-[#8b5cf6] px-4 py-1.5 text-xs font-black hover:brightness-110">Publish</button>}
        </div>
      </>}
    </header>

    {message && <div className="flex flex-none items-center justify-between gap-4 border-b border-white/10 bg-[#8b5cf6]/10 px-4 py-2 text-xs text-white/70"><span>{message}</span><button onClick={() => setMessage("")} className="text-white/40">✕</button></div>}

    {!mag ? <div className="grid flex-1 place-items-center p-8"><div className="max-w-xl text-center">
      <h2 className="font-serif text-5xl font-black">Turn your newsroom into a magazine.</h2>
      <p className="mt-4 text-sm text-white/40">Drag-and-drop pages, real templates, your published stories as material, and print-ready A4 output.</p>
      <button onClick={createIssue} disabled={busy} className="mt-7 rounded-full bg-[#8b5cf6] px-7 py-3 text-xs font-black">Create Issue 01</button>
    </div></div> : <>
      <div className="grid place-items-center p-8 text-center text-sm text-white/50 lg:hidden">The Magazine Studio needs a laptop-sized screen. Your published issues read fine on phones.</div>
      <div className="hidden min-h-0 flex-1 lg:flex">
        {/* Tab rail */}
        <nav className="flex w-[68px] flex-none flex-col items-center gap-1 border-r border-white/10 bg-[#111114] py-3">
          {tabs.map(([k, icon, label]) => <button key={k} onClick={() => setTab(k)} className={`flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[9px] transition ${tab === k ? "bg-white/10 text-white" : "text-white/45 hover:text-white"}`}><span className="text-base leading-none">{icon}</span>{label}</button>)}
        </nav>
        {/* Panel */}
        <aside className="w-[290px] flex-none overflow-y-auto border-r border-white/10 bg-[#141418] p-4">{panel}</aside>

        {/* Workspace */}
        <section className="flex min-w-0 flex-1 flex-col">
          <div data-toolbar className="flex h-12 flex-none items-center gap-1 overflow-x-auto border-b border-white/10 bg-[#111114] px-3">{toolbar}</div>
          <div ref={stageRef} className="mz-stage relative min-h-0 flex-1 overflow-auto bg-[#1c1c21]"
            onPointerDown={(e) => { if (!(e.target as HTMLElement).closest("[data-el]")) setSelEl(null); }}>
            <div className="flex min-h-full items-center justify-center p-7">
              {page && <div style={{ width: pageW }}>
                <MagazinePage page={page} pub={pub} articles={articles} placeholders onOverflow={onOverflow} edit={editField} layer={layer} />
              </div>}
            </div>
          </div>
          {/* Page strip */}
          <div className="flex h-[132px] flex-none items-center gap-3 overflow-x-auto border-t border-white/10 bg-[#111114] px-4">
            {pages.map((p, i) => <div key={p.id} draggable onDragStart={() => setDragFrom(i)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragFrom !== null) reorder(dragFrom, i); setDragFrom(null); }}
              onClick={() => { setSelected(i); setSelEl(null); }} className={`relative flex-none cursor-pointer rounded-md p-0.5 transition ${i === selected ? "ring-2 ring-[#8b5cf6]" : "ring-1 ring-white/10 hover:ring-white/40"} ${dragFrom === i ? "opacity-40" : ""}`}>
              {mini(p, 70)}
              <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 translate-y-full text-[9px] text-white/40">{i + 1}</span>
              {overflow[p.id] && <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" title="Text cut off" />}
            </div>)}
            <button onClick={() => addTemplatePage("feature")} disabled={busy} className="grid h-[99px] w-[70px] flex-none place-items-center rounded-md border border-dashed border-white/20 text-xl text-white/40 hover:border-white/50">+</button>
            <div className="ml-auto flex flex-none flex-col gap-1.5">
              <button onClick={duplicatePage} disabled={busy || !page} className="rounded-lg border border-white/10 px-3 py-1.5 text-[10px] hover:border-white/30">Duplicate page</button>
              <button onClick={deletePage} disabled={busy || pages.length <= 1} className="rounded-lg border border-white/10 px-3 py-1.5 text-[10px] text-red-300 hover:border-red-400/50 disabled:opacity-30">Delete page</button>
            </div>
          </div>
        </section>
      </div>
    </>}

    {preview && <div className="fixed inset-0 z-[300] overflow-auto bg-black/95 py-12">
      <button onClick={() => setPreview(false)} className="fixed right-5 top-5 z-10 rounded-full bg-white px-4 py-2 text-xs font-black text-black">Close preview (Esc)</button>
      <div className="mx-auto max-w-[760px] space-y-10 px-4">{pages.map((p) => <MagazinePage key={p.id} page={p} pub={pub} articles={articles} onOverflow={onOverflow} />)}</div>
    </div>}
  </div>;
}

const EDITOR_CSS = `
.mz-stage .mz-paper{width:100%;max-width:none}
.mz-thumb .mz-paper{width:100%;box-shadow:0 2px 8px rgba(0,0,0,.4)}
.mz-el{touch-action:none}
.mz-el:hover{outline:1.5px solid rgba(139,92,246,.55);outline-offset:2px}
.mz-el-sel,.mz-el-sel:hover{outline:2px solid #8b5cf6;outline-offset:2px}
.mz-handle{position:absolute;right:-7px;bottom:-7px;width:13px;height:13px;background:#fff;border:2px solid #8b5cf6;border-radius:4px;cursor:nwse-resize;z-index:2}
.mz-lock{position:absolute;right:-8px;top:-10px;font-size:11px}
.mz-guide{position:absolute;background:#ec4899;pointer-events:none;z-index:999}
`;
