import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type TouchEvent as RTouchEvent } from "react";
import UniversalNavbar from "./UniversalNavbar";
import { supabase } from "./lib/supabase";
import { MAGAZINE_CSS, MagazinePage, PAGE_COLS, PrintIssue, type Article, type MagPage, type Magazine, type Publication } from "./MagazineShared";

function useMedia(q: string) {
  const [m, setM] = useState(() => (typeof window !== "undefined" ? window.matchMedia(q).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [q]);
  return m;
}

// On phones a fixed A4 page is unreadable, so template pages reflow into a scrolling article.
// Free-design pages (.mz-fixed) keep their exact layout, since moving elements would break the design.
const TURN_MS = 700;
type Spread = (number | null)[];
type Turn = { dir: "next" | "prev"; from: number; to: number };

const READER_CSS = `
.mz-reader .mz-paper:not(.mz-fixed){--fs-kick:10px;--fs-h1:46px;--fs-h2:38px;--fs-h3:17px;--fs-h4:20px;--fs-body:16.5px;--fs-quote:40px;--fs-pull:22px;--fs-small:11px;--pad:26px;aspect-ratio:auto;container-type:normal;width:100%;box-shadow:none}
.mz-reader .mz-paper:not(.mz-fixed) .mz-pad{height:auto;overflow:visible;clip-path:none;padding-bottom:60px}
.mz-reader .mz-paper.mz-fixed{box-shadow:none;width:100%;max-width:760px}
.mz-reader .mz-t-cover{aspect-ratio:3/4}.mz-reader .mz-cover-copy h1{font-size:52px}.mz-reader .mz-cover-copy p{font-size:15px}.mz-reader .mz-mast{font-size:22px;top:22px;left:22px;right:22px;padding-bottom:12px}.mz-reader .mz-logo{width:30px;height:30px;border-radius:7px}
.mz-reader .mz-hero{height:auto;aspect-ratio:16/10;margin-bottom:18px}.mz-reader .mz-cols,.mz-reader .mz-grid{grid-template-columns:1fr;gap:22px}.mz-reader .mz-paper hr{border-top-width:2px;width:60px;margin:18px 0}.mz-reader .mz-close{min-height:70vh}.mz-reader .mz-folio{bottom:22px}.mz-reader .mz-body{text-align:left}
.mz-stage{overflow-x:clip;perspective:2400px;touch-action:pan-y;-webkit-user-select:none;user-select:none}.mz-book{position:relative;margin-inline:auto;transform-style:preserve-3d}
.mz-book.is-spread{width:min(100%,calc((100svh - var(--mz-chrome,230px)) * 420 / 297));aspect-ratio:420/297}.mz-book.is-single{width:min(100%,calc((100svh - var(--mz-chrome,230px)) * 210 / 297));aspect-ratio:210/297}
.mz-slot{position:absolute;top:0;bottom:0;overflow:hidden}.is-spread .mz-slot.l{left:0;width:50%}.is-spread .mz-slot.r{left:50%;width:50%}.is-single .mz-slot.l,.is-single .mz-slot.r{left:0;width:100%}
.mz-slot .mz-paper,.mz-leaf .mz-paper{width:100%;max-width:none;box-shadow:none;margin:0}.mz-sheet{position:absolute;inset:0;background:#f4efe7;box-shadow:0 22px 60px rgba(0,0,0,.5)}
.is-spread .mz-slot.l .mz-sheet{border-radius:4px 0 0 4px}.is-spread .mz-slot.r .mz-sheet{border-radius:0 4px 4px 0}.is-single .mz-sheet{border-radius:3px 6px 6px 3px}.mz-sheet::after{content:"";position:absolute;inset:0;pointer-events:none;z-index:40}
.is-spread .mz-slot.l .mz-sheet::after{background:linear-gradient(to left,rgba(0,0,0,.28),rgba(0,0,0,.06) 4%,transparent 12%)}.is-spread .mz-slot.r .mz-sheet::after{background:linear-gradient(to right,rgba(0,0,0,.28),rgba(0,0,0,.06) 4%,transparent 12%)}.is-single .mz-sheet::after{background:linear-gradient(to right,rgba(0,0,0,.22),transparent 5%)}
.mz-leaf{position:absolute;top:0;bottom:0;z-index:30;transform-style:preserve-3d;will-change:transform;animation:700ms cubic-bezier(.45,.05,.25,1) forwards}.is-spread .mz-leaf.next{left:50%;width:50%;transform-origin:left center;animation-name:mz-next}.is-spread .mz-leaf.prev{left:0;width:50%;transform-origin:right center;animation-name:mz-prev}.is-single .mz-leaf{left:0;width:100%;transform-origin:left center}.is-single .mz-leaf.next{animation-name:mz-next}.is-single .mz-leaf.prev{animation-name:mz-prev-single}
.mz-face{position:absolute;inset:0;overflow:hidden;background:#f4efe7;backface-visibility:hidden;-webkit-backface-visibility:hidden}.mz-face.back{transform:rotateY(180deg)}.mz-shade{position:absolute;inset:0;pointer-events:none;z-index:45;animation:700ms ease-in-out forwards mz-shade}
.mz-face.front .mz-shade{background:linear-gradient(to left,rgba(0,0,0,.35),transparent 60%)}.mz-face.back .mz-shade{background:linear-gradient(to right,rgba(0,0,0,.35),transparent 60%)}.is-spread .mz-leaf.prev .mz-face.front .mz-shade{background:linear-gradient(to right,rgba(0,0,0,.35),transparent 60%)}.is-spread .mz-leaf.prev .mz-face.back .mz-shade{background:linear-gradient(to left,rgba(0,0,0,.35),transparent 60%)}
.mz-cast{position:absolute;top:0;bottom:0;z-index:25;pointer-events:none;animation:700ms ease-in-out forwards mz-shade}@keyframes mz-next{0%{transform:rotateY(0)}100%{transform:rotateY(-180deg)}}@keyframes mz-prev{0%{transform:rotateY(0)}100%{transform:rotateY(180deg)}}@keyframes mz-prev-single{0%{transform:rotateY(-180deg)}100%{transform:rotateY(0)}}@keyframes mz-shade{0%{opacity:0}50%{opacity:1}100%{opacity:0}}
.mz-edge{position:absolute;top:0;bottom:0;z-index:35;width:18%;cursor:pointer;background:transparent;border:0;padding:0}.mz-edge:disabled{cursor:default}.mz-edge.l{left:0}.mz-edge.r{right:0}.mz-edge::after{content:"";position:absolute;top:0;bottom:0;width:36px;opacity:0;transition:opacity .2s}.mz-edge.r::after{right:0;background:linear-gradient(to left,rgba(0,0,0,.12),transparent)}.mz-edge.l::after{left:0;background:linear-gradient(to right,rgba(0,0,0,.12),transparent)}@media (hover:hover){.mz-edge:not(:disabled):hover::after{opacity:1}}
.mz-zoom{position:fixed;inset:0;z-index:300;overflow:auto;background:#050505;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}.mz-zoom-page{width:max(200vw,780px);margin:0 auto;padding:64px 0 40px}@media (min-width:900px){.mz-zoom-page{width:min(1100px,94vw)}}@media (prefers-reduced-motion:reduce){.mz-leaf,.mz-shade,.mz-cast{animation-duration:1ms!important}}
`;



export default function MagazineViewer({ slug, id }: { slug: string; id?: string }) {
  const [pub, setPub] = useState<Publication | null>(null);
  const [mag, setMag] = useState<Magazine | null>(null);
  const [issues, setIssues] = useState<Magazine[]>([]);
  const [pages, setPages] = useState<MagPage[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [mode, setMode] = useState<"book" | "scroll">("book");
  const [zoom, setZoom] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const wide = useMedia("(min-width: 1024px) and (min-aspect-ratio: 5/4)");
  const touch = useRef<{ x: number; y: number; t: number } | null>(null);
  const timer = useRef<number | null>(null);
  const lastTap = useRef(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError("");
      const { data: p } = await supabase.from("bitbuzz_publications").select("id,slug,profile_name,school_name,logo_url,description").eq("slug", slug).eq("status", "active").maybeSingle();
      if (!alive) return; if (!p) { setError("Publication not found."); setLoading(false); return; } setPub(p as Publication);
      const { data: all } = await supabase.from("bitbuzz_magazines").select("id,title,subtitle,updated_at").eq("publication_id", p.id).eq("status", "published").order("updated_at", { ascending: false });
      if (!alive) return; const list=(all||[]) as Magazine[]; setIssues(list); const m=id?list.find(x=>x.id===id):list[0];
      if(!m){setError(id?"This issue isn't published.":"No published magazine yet.");setLoading(false);return;} setMag(m);document.title=`${m.title} — ${p.profile_name} · BitBuzz`;
      const { data: pg }=await supabase.from("bitbuzz_magazine_pages").select(PAGE_COLS).eq("magazine_id",m.id).order("page_number"); if(!alive)return;
      const list2=(pg||[]) as MagPage[];setPages(list2);const ids=[...new Set(list2.flatMap(x=>x.content?.storyIds||[]))];
      if(ids.length){const {data:a}=await supabase.from("bitbuzz_articles").select("id,headline,description,body,category,cover_url").in("id",ids).eq("status","published");if(alive)setArticles((a||[]) as Article[]);}
      if(alive)setLoading(false);
    })(); return()=>{alive=false};
  },[slug,id]);

  const spreads=useMemo<Spread[]>(()=>{if(!pages.length)return[];if(!wide)return pages.map((_,i)=>[i]);const s:Spread[]=[[null,0]];for(let i=1;i<pages.length;i+=2)s.push([i,i+1<pages.length?i+1:null]);return s;},[pages,wide]);
  useEffect(()=>{if(!spreads.length)return;const n=Number(window.location.hash.match(/^#p(\\d+)$/)?.[1]||1)-1;const at=spreads.findIndex(s=>s.includes(n));setIdx(at>=0?at:0);setTurn(null)},[spreads]);
  const first=(s:Spread|undefined)=>(s?(s.find(x=>x!==null)??0):0);
  const go=useCallback((to:number)=>{if(turn||!spreads.length)return;const next=Math.max(0,Math.min(spreads.length-1,to));if(next===idx)return;if(Math.abs(next-idx)>1){setIdx(next);window.history.replaceState(null,"",`#p${first(spreads[next])+1}`);return;}setTurn({dir:next>idx?"next":"prev",from:idx,to:next});if(timer.current)window.clearTimeout(timer.current);timer.current=window.setTimeout(()=>{setIdx(next);setTurn(null);window.history.replaceState(null,"",`#p${first(spreads[next])+1}`)},TURN_MS)},[turn,spreads,idx]);
  useEffect(()=>()=>{if(timer.current)window.clearTimeout(timer.current)},[]);
  useEffect(()=>{if(mode!=="book")return;const key=(e:KeyboardEvent)=>{if((e.target as HTMLElement)?.closest("input,textarea,select"))return;if(zoom!==null){if(e.key==="Escape")setZoom(null);return}if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();go(idx+1)}if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();go(idx-1)}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[go,idx,mode,zoom]);
  useEffect(()=>{const near=[idx-1,idx+1,idx+2].flatMap(k=>spreads[k]||[]).filter((x):x is number=>x!==null);near.forEach(n=>(pages[n]?.content?.elements||[]).forEach(el=>{if(el.type==="image"&&el.src){const im=new Image();im.src=el.src}}))},[idx,spreads,pages]);
  useEffect(()=>{document.body.style.overflow=zoom!==null?"hidden":"";return()=>{document.body.style.overflow=""}},[zoom]);

  const share = async () => {
    const url = window.location.href.split("#")[0];
    try {
      if (navigator.share) await navigator.share({ title: mag?.title, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    } catch { /* user cancelled */ }
  };

  const shell=(body:ReactNode)=><><UniversalNavbar/><div className="min-h-screen bg-[#080808] px-5 pt-40 text-center text-white">{body}</div></>;
  if(error)return shell(<><h1 className="font-serif text-5xl font-black">{error}</h1><a href={`/ambassadors/${slug}`} className="mt-6 inline-block text-sm text-[#ff6a1f] underline">Back to the publication</a></>);
  if(loading||!pub||!mag)return shell(<p className="text-white/40">Loading magazine…</p>);if(!pages.length)return shell(<h1 className="font-serif text-4xl font-black">This issue has no pages yet.</h1>);
  const spreadMode=wide,cur=spreads[idx]||[0];const page=(n:number|null|undefined)=>(n===null||n===undefined||!pages[n]?null:<MagazinePage page={pages[n]} pub={pub} articles={articles}/>);const sheet=(n:number|null|undefined)=>(n===null||n===undefined||!pages[n]?null:<div className="mz-sheet">{page(n)}</div>);
  let baseL:number|null=cur[0],baseR:number|null=spreadMode?cur[1]:null,leaf:ReactNode=null;if(turn){const from=spreads[turn.from],to=spreads[turn.to];if(spreadMode){if(turn.dir==="next"){baseL=from[0];baseR=to[1];leaf=<div className="mz-leaf next" key={`t${turn.from}-${turn.to}`}><div className="mz-face front">{sheet(from[1])}<div className="mz-shade"/></div><div className="mz-face back">{sheet(to[0])}<div className="mz-shade"/></div></div>}else{baseL=to[0];baseR=from[1];leaf=<div className="mz-leaf prev" key={`t${turn.from}-${turn.to}`}><div className="mz-face front">{sheet(from[0])}<div className="mz-shade"/></div><div className="mz-face back">{sheet(to[1])}<div className="mz-shade"/></div></div>}}else if(turn.dir==="next"){baseL=to[0];leaf=<div className="mz-leaf next" key={`t${turn.from}-${turn.to}`}><div className="mz-face front">{sheet(from[0])}<div className="mz-shade"/></div><div className="mz-face back"><div className="mz-sheet" style={{background:"#e9e3d8"}}/></div></div>}else{baseL=from[0];leaf=<div className="mz-leaf prev" key={`t${turn.from}-${turn.to}`}><div className="mz-face front">{sheet(to[0])}<div className="mz-shade"/></div><div className="mz-face back"><div className="mz-sheet" style={{background:"#e9e3d8"}}/></div></div>}}
  const label=(()=>{const ns=cur.filter((x):x is number=>x!==null).map(x=>x+1);return ns.length>1?`${ns[0]}–${ns[1]}`:`${ns[0]??1}`})();const atStart=idx===0,atEnd=idx>=spreads.length-1;const ctl="rounded-full border border-white/10 px-3.5 py-2 text-xs transition hover:border-white/30 disabled:opacity-25";const others=issues.filter(m=>m.id!==mag.id);
  const onTouchStart=(e:RTouchEvent)=>{if(e.touches.length!==1){touch.current=null;return}touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()}};const onTouchEnd=(e:RTouchEvent)=>{const s=touch.current;touch.current=null;if(!s)return;const dx=e.changedTouches[0].clientX-s.x,dy=e.changedTouches[0].clientY-s.y;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)*1.2){go(idx+(dx<0?1:-1));return}if(Math.abs(dx)<10&&Math.abs(dy)<10){const now=Date.now();if(now-lastTap.current<320){setZoom(first(cur));lastTap.current=0}else lastTap.current=now}};
  return <div className="min-h-screen bg-[#080808] text-white">
    <style>{MAGAZINE_CSS + READER_CSS}</style>
    <UniversalNavbar />
    <PrintIssue pages={pages} pub={pub} articles={articles} />

    <main className="mx-auto max-w-[1600px] px-3 pb-20 pt-[78px] sm:px-5 sm:pt-[100px]">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-2 sm:mb-6"><div className="min-w-0"><a href={`/ambassadors/${slug}`} className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f] hover:underline">{pub.profile_name}</a><h1 className="mt-1 font-serif text-xl font-black sm:mt-1.5 sm:text-4xl">{mag.title}</h1><p className="mt-1 hidden text-sm text-white/35 sm:block">{mag.subtitle||"Digital magazine"} · {pages.length} pages</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex rounded-full border border-white/10 p-0.5 text-xs">{(["book","scroll"] as const).map(m=><button key={m} onClick={()=>setMode(m)} className={`rounded-full px-3 py-1.5 capitalize transition ${mode===m?"bg-white text-black":"text-white/55 hover:text-white"}`}>{m}</button>)}</div><button onClick={share} className={ctl}>{copied?"Link copied ✓":"Share"}</button><button onClick={()=>window.print()} className="hidden rounded-full bg-white px-4 py-2 text-xs font-bold text-black sm:inline-block">Print / PDF</button></div></div>
      {mode==="scroll"?<div className="mz-reader mx-auto max-w-[760px] space-y-4">{pages.map(p=><div key={p.id} id={`p${p.page_number}`} className="overflow-hidden rounded-sm"><MagazinePage page={p} pub={pub} articles={articles}/></div>)}</div>:<>
        <div className="mz-stage" style={{["--mz-chrome" as string]:spreadMode?"300px":"250px"}} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}><div className={`mz-book ${spreadMode?"is-spread":"is-single"}`}><div className="mz-slot l">{sheet(baseL)}</div>{spreadMode&&<div className="mz-slot r">{sheet(baseR)}</div>}{leaf}<button className="mz-edge l" aria-label="Previous page" disabled={atStart||!!turn} onClick={()=>go(idx-1)}/><button className="mz-edge r" aria-label="Next page" disabled={atEnd||!!turn} onClick={()=>go(idx+1)}/></div></div>
        <div className="mt-3 flex items-center justify-center gap-2 sm:mt-4 sm:gap-3"><button onClick={()=>go(idx-1)} disabled={atStart||!!turn} className={ctl} aria-label="Previous">← <span className="hidden sm:inline">Prev</span></button><span className="min-w-20 text-center text-xs tabular-nums text-white/50">{label} / {pages.length}</span><button onClick={()=>go(idx+1)} disabled={atEnd||!!turn} className={ctl} aria-label="Next"><span className="hidden sm:inline">Next</span> →</button><button onClick={()=>setZoom(first(cur))} className={ctl} aria-label="Zoom in to read">⤢ <span className="hidden sm:inline">Zoom</span></button></div>
        <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-1.5">{spreads.map((s,n)=><button key={n} onClick={()=>go(n)} disabled={!!turn} className={`h-1.5 rounded-full transition-all ${n===idx?"w-7 bg-[#ff6a1f]":"w-1.5 bg-white/20 hover:bg-white/45"}`} aria-label={`Go to page ${first(s)+1}`}/>)}</div><p className="mt-3 text-center text-[10px] text-white/30">{wide?"Click the page edges or use ← → to turn pages · Zoom to read up close":"Swipe to turn pages · Double-tap or Zoom to read up close"}</p></>}
      {others.length > 0 && <section className="mt-16 border-t border-white/10 pt-8">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[.25em] text-white/35">More issues</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{others.map((m) => <a key={m.id} href={`/ambassadors/${slug}/magazine/${m.id}`} className="rounded-2xl border border-white/10 p-4 transition hover:border-[#ff6a1f]/50">
          <p className="font-serif text-xl font-black">{m.title}</p><p className="mt-1 text-xs text-white/35">{m.subtitle || "Digital magazine"}</p>
        </a>)}</div>
      </section>}
    </main>
    {zoom !== null && pages[zoom] && <div className="mz-zoom" role="dialog" aria-label={`Page ${zoom+1}, zoomed`}><div className="fixed inset-x-0 top-0 z-10 flex items-center justify-between gap-2 bg-black/80 px-3 py-2.5 backdrop-blur"><button onClick={()=>setZoom(Math.max(0,zoom-1))} disabled={zoom===0} className={ctl}>←</button><span className="text-xs tabular-nums text-white/60">Page {zoom+1} / {pages.length}</span><button onClick={()=>setZoom(Math.min(pages.length-1,zoom+1))} disabled={zoom>=pages.length-1} className={ctl}>→</button><button onClick={()=>{const at=spreads.findIndex(s=>s.includes(zoom));if(at>=0){setIdx(at);window.history.replaceState(null,"",`#p${zoom+1}`)}setZoom(null)}} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black">Close</button></div><div className="mz-zoom-page"><MagazinePage page={pages[zoom]} pub={pub} articles={articles}/></div></div>}
  </div>;
}