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
.mz-reader .mz-body{text-align:left}
.mz-book-wrap{perspective:1800px}
.mz-book{position:relative;margin-inline:auto;transform-style:preserve-3d}
.mz-book-spread{width:min(100%,1400px);aspect-ratio:420/297}
.mz-book-single{width:min(100%,700px);aspect-ratio:210/297}
.mz-book-base{position:absolute;inset:0;display:flex;overflow:hidden;border-radius:2px;background:#171717;box-shadow:0 28px 90px rgba(0,0,0,.55)}
.mz-book-page{position:relative;min-width:0;flex:1;overflow:hidden;background:#f4efe7}
.mz-book-single .mz-book-page{width:100%}
.mz-book-spread .mz-book-page:first-child{border-radius:3px 0 0 3px}
.mz-book-spread .mz-book-page:last-child{border-radius:0 3px 3px 0}
.mz-book-spread .mz-book-page:first-child::after,.mz-book-spread .mz-book-page:last-child::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:20}
.mz-book-spread .mz-book-page:first-child::after{box-shadow:inset -1px 0 rgba(0,0,0,.14)}
.mz-book-spread .mz-book-page:last-child::after{box-shadow:inset 1px 0 rgba(0,0,0,.14)}
.mz-turn{position:absolute;inset:0;z-index:20;transform-style:preserve-3d;pointer-events:none;animation-duration:560ms;animation-timing-function:cubic-bezier(.22,.75,.2,1);animation-fill-mode:forwards}
.mz-turn-single{left:0;right:auto;width:100%;transform-origin:left center}
.mz-turn-spread{transform-origin:center center}
.mz-turn-next{animation-name:mz-flip-next}
.mz-turn-prev{animation-name:mz-flip-prev}
.mz-turn-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;overflow:hidden;background:#f4efe7}
.mz-turn-back{transform:rotateY(180deg)}
.mz-turn-spread .mz-turn-page{width:50%;height:100%}
.mz-turn-spread .mz-turn-front .mz-turn-page{margin-left:auto}
.mz-turn-spread .mz-turn-back .mz-turn-page{margin-left:0}
@keyframes mz-flip-next{
  0%{transform:rotateY(0deg);filter:drop-shadow(0 18px 18px rgba(0,0,0,.05))}
  45%{filter:drop-shadow(-22px 20px 22px rgba(0,0,0,.28))}
  100%{transform:rotateY(-180deg);filter:drop-shadow(-2px 8px 10px rgba(0,0,0,.05))}
}
@keyframes mz-flip-prev{
  0%{transform:rotateY(0deg);filter:drop-shadow(0 18px 18px rgba(0,0,0,.05))}
  45%{filter:drop-shadow(22px 20px 22px rgba(0,0,0,.28))}
  100%{transform:rotateY(180deg);filter:drop-shadow(2px 8px 10px rgba(0,0,0,.05))}
}
@media (max-width:640px){
  .mz-book-wrap{margin-inline:-1rem;width:calc(100% + 2rem)}
  .mz-book-single{width:100%;max-width:700px}
  .mz-book-base{box-shadow:0 18px 50px rgba(0,0,0,.5)}
  .mz-turn{animation-duration:520ms}
}
`;

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
  const [flip, setFlip] = useState<"next" | "prev" | null>(null);
  const [flipBusy, setFlipBusy] = useState(false);
  const wide = useMedia("(min-width: 1180px)");
  const phone = useMedia("(max-width: 640px)");
  const touchX = useRef<number | null>(null);
  const flipTimer = useRef<number | null>(null);

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
    if (!spreads.length || flipBusy) return;
    const next = Math.max(0, Math.min(spreads.length - 1, to));
    if (next === spreadIdx) return;
    setFlip(next > spreadIdx ? "next" : "prev");
    setFlipBusy(true);
    if (flipTimer.current) window.clearTimeout(flipTimer.current);
    flipTimer.current = window.setTimeout(() => {
      setSpreadIdx(next);
      setFlip(null);
      setFlipBusy(false);
      window.history.replaceState(null, "", `#p${(spreads[next]?.[0] ?? 0) + 1}`);
    }, 560);
  };

  useEffect(() => () => {
    if (flipTimer.current) window.clearTimeout(flipTimer.current);
  }, []);

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
          className="mz-book-wrap relative mx-auto w-full select-none"
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) go(spreadIdx + (dx < 0 ? 1 : -1));
            touchX.current = null;
          }}
        >
          <button onClick={() => go(spreadIdx - 1)} aria-label="Previous page"
            className="absolute inset-y-0 left-0 z-30 w-[14%] cursor-w-resize disabled:cursor-default"
            disabled={spreadIdx === 0 || flipBusy} />
          <div className={`mz-book mx-auto ${current.length > 1 ? "mz-book-spread" : "mz-book-single"}`}>
            <div className="mz-book-base">
              {current.map((n, k) => (
                <div key={pages[n].id} className="mz-book-page" style={{
                  zIndex: k + 1,
                  boxShadow: current.length > 1
                    ? (k === 0 ? "inset -24px 0 32px -28px rgba(0,0,0,.72)" : "inset 24px 0 32px -28px rgba(0,0,0,.72)")
                    : "inset -18px 0 28px -24px rgba(0,0,0,.55)"
                }}>
                  <MagazinePage page={pages[n]} pub={pub} articles={articles} />
                </div>
              ))}
            </div>
            {flip && (() => {
              const target = spreads[spreadIdx + (flip === "next" ? 1 : -1)] || current;
              const frontPage = current[flip === "next" ? current.length - 1 : 0];
              const backPage = target[flip === "next" ? 0 : target.length - 1];
              return (
                <div className={`mz-turn mz-turn-${flip} ${current.length > 1 ? "mz-turn-spread" : "mz-turn-single"}`}>
                  <div className="mz-turn-face mz-turn-front">
                    <div className="mz-turn-page"><MagazinePage page={pages[frontPage]} pub={pub} articles={articles} /></div>
                  </div>
                  <div className="mz-turn-face mz-turn-back">
                    <div className="mz-turn-page"><MagazinePage page={pages[backPage]} pub={pub} articles={articles} /></div>
                  </div>
                </div>
              );
            })()}
          </div>
          <button onClick={() => go(spreadIdx + 1)} aria-label="Next page"
            className="absolute inset-y-0 right-0 z-30 w-[14%] cursor-e-resize disabled:cursor-default"
            disabled={spreadIdx >= spreads.length - 1 || flipBusy} />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">{spreads.map((s, n) => <button key={n} onClick={() => go(n)} disabled={flipBusy}
          className={`h-2 rounded-full transition-all disabled:opacity-50 ${n === spreadIdx ? "w-8 bg-[#ff6a1f]" : "w-2 bg-white/20 hover:bg-white/40"}`}
          aria-label={`Page ${s[0] + 1}`} />)}</div>
        <p className="mt-3 text-center text-[10px] text-white/25">{phone ? "Swipe left or right, or tap the page edges" : "Swipe, click the page edges, or use ← → keys to turn the pages"}</p>
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