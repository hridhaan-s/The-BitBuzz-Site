import { useEffect, useMemo, useRef, useState } from "react";
import UniversalNavbar from "./UniversalNavbar";
import { supabase } from "./lib/supabase";
import { MAGAZINE_CSS, MagazinePage, PAGE_COLS, PrintIssue, type Article, type MagPage, type Magazine, type Publication } from "./MagazineShared";

function useMedia(q: string) {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => { const mq = window.matchMedia(q); const on = () => setM(mq.matches); mq.addEventListener("change", on); return () => mq.removeEventListener("change", on); }, [q]);
  return m;
}

// On phones a fixed A4 page is unreadable, so template pages reflow into a scrolling article.
// Free-design pages (.mz-fixed) keep their exact layout, since moving elements would break the design.
const READER_CSS = `
.mz-reader .mz-paper:not(.mz-fixed){--fs-kick:10px;--fs-h1:46px;--fs-h2:38px;--fs-h3:17px;--fs-h4:20px;--fs-body:16.5px;--fs-quote:40px;--fs-pull:22px;--fs-small:11px;--pad:26px;aspect-ratio:auto;container-type:normal;width:100%;box-shadow:none}
.mz-reader .mz-paper:not(.mz-fixed) .mz-pad{height:auto;overflow:visible;clip-path:none;padding-bottom:60px}
.mz-reader .mz-t-cover{aspect-ratio:3/4}
.mz-reader .mz-cover-copy h1{font-size:52px}.mz-reader .mz-cover-copy p{font-size:15px}.mz-reader .mz-mast{font-size:22px;top:22px;left:22px;right:22px;padding-bottom:12px}.mz-reader .mz-logo{width:30px;height:30px;border-radius:7px}
.mz-reader .mz-hero{height:auto;aspect-ratio:16/10;margin-bottom:18px}
.mz-reader .mz-cols,.mz-reader .mz-grid{grid-template-columns:1fr;gap:22px}
.mz-reader .mz-paper hr{border-top-width:2px;width:60px;margin:18px 0}
.mz-reader .mz-close{min-height:70vh}
.mz-reader .mz-folio{bottom:22px}
.mz-reader .mz-body{text-align:left}`;

export default function MagazineViewer({ slug, id }: { slug: string; id?: string }) {
  const [pub, setPub] = useState<Publication | null>(null);
  const [mag, setMag] = useState<Magazine | null>(null);
  const [issues, setIssues] = useState<Magazine[]>([]);
  const [pages, setPages] = useState<MagPage[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [spreadIdx, setSpreadIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const wide = useMedia("(min-width: 1180px)");
  const phone = useMedia("(max-width: 640px)");
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      const { data: p } = await supabase.from("bitbuzz_publications").select("id,slug,profile_name,school_name,logo_url,description").eq("slug", slug).eq("status", "active").maybeSingle();
      if (!p) { setError("Publication not found."); setLoading(false); return; }
      setPub(p as Publication);
      const { data: all } = await supabase.from("bitbuzz_magazines").select("id,title,subtitle,updated_at").eq("publication_id", p.id).eq("status", "published").order("updated_at", { ascending: false });
      const list = (all || []) as Magazine[];
      setIssues(list);
      const m = id ? list.find((x) => x.id === id) : list[0];
      if (!m) { setError(id ? "This issue isn't published." : "No published magazine yet."); setLoading(false); return; }
      setMag(m);
      document.title = `${m.title} — ${p.profile_name} · BitBuzz`;
      const { data: pg } = await supabase.from("bitbuzz_magazine_pages").select(PAGE_COLS).eq("magazine_id", m.id).order("page_number");
      const list2 = (pg || []) as MagPage[];
      setPages(list2);
      const ids = [...new Set(list2.flatMap((x) => x.content?.storyIds || []))];
      if (ids.length) {
        const { data: a } = await supabase.from("bitbuzz_articles").select("id,headline,description,body,category,cover_url").in("id", ids).eq("status", "published");
        setArticles((a || []) as Article[]);
      }
      setLoading(false);
    })();
  }, [slug, id]);

  // Cover alone, then facing pages — like a real magazine.
  const spreads = useMemo(() => {
    if (!wide || phone) return pages.map((_, i) => [i]);
    const s: number[][] = pages.length ? [[0]] : [];
    for (let i = 1; i < pages.length; i += 2) s.push(i + 1 < pages.length ? [i, i + 1] : [i]);
    return s;
  }, [pages, wide, phone]);

  // Deep links: #p5 opens the spread containing page 5.
  useEffect(() => {
    if (!pages.length) return;
    const n = Number(window.location.hash.match(/^#p(\d+)$/)?.[1] || 1) - 1;
    const at = spreads.findIndex((s) => s.includes(n));
    setSpreadIdx(at >= 0 ? at : 0);
  }, [spreads, pages.length]);

  const go = (to: number) => {
    const next = Math.max(0, Math.min(spreads.length - 1, to));
    setSpreadIdx(next);
    window.history.replaceState(null, "", `#p${(spreads[next]?.[0] ?? 0) + 1}`);
  };

  useEffect(() => {
    if (phone) return;
    const key = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea,select")) return;
      if (e.key === "ArrowRight") go(spreadIdx + 1);
      if (e.key === "ArrowLeft") go(spreadIdx - 1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  });

  const share = async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) await navigator.share({ title: mag?.title, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch { /* user cancelled */ }
  };

  const shell = (body: React.ReactNode) => <><UniversalNavbar /><div className="min-h-screen bg-[#080808] px-5 pt-40 text-center text-white">{body}</div></>;
  if (error) return shell(<><h1 className="font-serif text-5xl font-black">{error}</h1><a href={`/ambassadors/${slug}`} className="mt-6 inline-block text-sm text-[#ff6a1f] underline">Back to the publication</a></>);
  if (loading || !pub || !mag) return shell(<p className="text-white/40">Loading magazine…</p>);
  if (!pages.length) return shell(<h1 className="font-serif text-4xl font-black">This issue has no pages yet.</h1>);

  const current = spreads[spreadIdx] || [0];
  const pageLabel = current.length > 1 ? `${current[0] + 1}–${current[1] + 1}` : `${current[0] + 1}`;
  const ctl = "rounded-full border border-white/10 px-4 py-2 text-xs transition hover:border-white/30 disabled:opacity-25";
  const others = issues.filter((m) => m.id !== mag.id);

  return <div className="min-h-screen bg-[#080808] text-white">
    <style>{MAGAZINE_CSS + READER_CSS}</style>
    <UniversalNavbar />
    <PrintIssue pages={pages} pub={pub} articles={articles} />

    <main className="mx-auto max-w-[1600px] px-4 pb-20 pt-[100px] sm:px-5">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <a href={`/ambassadors/${slug}`} className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f] hover:underline">{pub.profile_name}</a>
          <h1 className="mt-2 font-serif text-4xl font-black">{mag.title}</h1>
          <p className="mt-1 text-sm text-white/35">{mag.subtitle || "Digital magazine"} · {pages.length} pages</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!phone && <>
            <button onClick={() => go(spreadIdx - 1)} disabled={spreadIdx === 0} className={ctl} aria-label="Previous">←</button>
            <span className="min-w-16 text-center text-xs text-white/40">{pageLabel} / {pages.length}</span>
            <button onClick={() => go(spreadIdx + 1)} disabled={spreadIdx >= spreads.length - 1} className={ctl} aria-label="Next">→</button>
          </>}
          <button onClick={share} className={ctl}>{copied ? "Link copied ✓" : "Share"}</button>
          <button onClick={() => window.print()} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black">Print / PDF</button>
        </div>
      </div>

      {phone ? <div className="mz-reader -mx-4 space-y-3">{pages.map((p) => <div key={p.id} id={`p${p.page_number}`}><MagazinePage page={p} pub={pub} articles={articles} /></div>)}</div>
      : <>
        <div
          className="relative flex select-none justify-center"
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => { if (touchX.current == null) return; const dx = e.changedTouches[0].clientX - touchX.current; if (Math.abs(dx) > 50) go(spreadIdx + (dx < 0 ? 1 : -1)); touchX.current = null; }}
        >
          <button onClick={() => go(spreadIdx - 1)} aria-label="Previous page" className="absolute inset-y-0 left-0 z-10 w-[12%] cursor-w-resize" disabled={spreadIdx === 0} />
          <div className={`flex w-full justify-center ${current.length > 1 ? "max-w-[1400px]" : "max-w-[700px]"}`}>
            {current.map((n, k) => <div key={pages[n].id} className="min-w-0 flex-1" style={{ maxWidth: 700, boxShadow: current.length > 1 ? (k === 0 ? "inset -18px 0 24px -20px rgba(0,0,0,.6)" : "inset 18px 0 24px -20px rgba(0,0,0,.6)") : undefined }}>
              <MagazinePage page={pages[n]} pub={pub} articles={articles} />
            </div>)}
          </div>
          <button onClick={() => go(spreadIdx + 1)} aria-label="Next page" className="absolute inset-y-0 right-0 z-10 w-[12%] cursor-e-resize" disabled={spreadIdx >= spreads.length - 1} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">{spreads.map((s, n) => <button key={n} onClick={() => go(n)} className={`h-2 rounded-full transition-all ${n === spreadIdx ? "w-8 bg-[#ff6a1f]" : "w-2 bg-white/20 hover:bg-white/40"}`} aria-label={`Page ${s[0] + 1}`} />)}</div>
        <p className="mt-3 text-center text-[10px] text-white/25">Use ← → keys or click the page edges</p>
      </>}

      {others.length > 0 && <section className="mt-16 border-t border-white/10 pt-8">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[.25em] text-white/35">More issues</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{others.map((m) => <a key={m.id} href={`/ambassadors/${slug}/magazine/${m.id}`} className="rounded-2xl border border-white/10 p-4 transition hover:border-[#ff6a1f]/50">
          <p className="font-serif text-xl font-black">{m.title}</p><p className="mt-1 text-xs text-white/35">{m.subtitle || "Digital magazine"}</p>
        </a>)}</div>
      </section>}
    </main>
  </div>;
}