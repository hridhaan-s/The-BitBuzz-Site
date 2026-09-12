import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const FLAG_IT_URL = "https://www.bitbuzz.club/flag-it";
const GENRES = [["space", "Space"], ["cybersecurity", "Cybersecurity"], ["tech", "Tech"], ["aviation", "Aviation"], ["innovation", "Innovation"], ["biobuzz", "BioBuzz"]] as const;

type Props = { initialCategory?: string; hideHeader?: boolean };
type Article = {
  id: string; slug: string; title: string; standfirst: string | null;
  cover_image_url: string | null; cover_alt: string | null; read_minutes: number | null;
  is_lead: boolean; published_at: string | null;
  categories?: { name: string; slug: string }[] | null;
  profiles?: { display_name: string } | null;
};

const COPY: Record<string, { kicker: string; title: string; deck: string }> = {
  space: { kicker: "SPACE", title: "Space", deck: "Missions, discoveries and the technology pushing humanity farther." },
  cybersecurity: { kicker: "CYBERSECURITY", title: "Cybersecurity", deck: "Threats, privacy and the systems protecting the digital world." },
  tech: { kicker: "TECH", title: "Technology", deck: "The products, platforms and ideas changing how we live and build." },
  aviation: { kicker: "AVIATION", title: "Aviation", deck: "Aircraft, aerospace and the engineering behind flight." },
  innovation: { kicker: "INNOVATION", title: "Innovation", deck: "The people and ideas turning ambitious problems into useful things." },
  biobuzz: { kicker: "BIOBUZZ", title: "BioBuzz", deck: "Biology and discoveries reshaping what we know about life." },
};

const date = (v: string | null) => v ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(v)) : "";

function Meta({ article }: { article: Article }) {
  return <p className="mt-3 text-[9px] uppercase tracking-[.13em] text-white/30">{article.profiles?.display_name || "BitBuzz"} · {article.read_minutes || 1} min read{article.published_at ? ` · ${date(article.published_at)}` : ""}</p>;
}

function FlagIt() {
  return <a href={FLAG_IT_URL} target="_blank" rel="noreferrer" className="group block border border-white/10 bg-[#050505] p-5 transition hover:border-white/25">
    <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/45">Flag It</p><h3 className="mt-3 font-serif text-[27px] leading-[.92] tracking-[-.045em]">See something suspicious?</h3></div><span className="text-lg text-white/30 transition group-hover:translate-x-1 group-hover:text-white">↗</span></div>
    <p className="mt-5 text-xs leading-5 text-white/40">Report scams and suspicious digital activity to the BitBuzz community.</p>
  </a>;
}

function StoryImage({ article, className = "" }: { article: Article; className?: string }) {
  return article.cover_image_url ? <img src={article.cover_image_url} alt={article.cover_alt || ""} className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.02] ${className}`} /> : <div className={`h-full w-full bg-[#0a0a0a] ${className}`} />;
}

function StarField() {
  const stars = useMemo(() => Array.from({ length: 34 }, (_, i) => ({
    left: `${(i * 47 + 11) % 100}%`, top: `${(i * 31 + 7) % 100}%`,
    size: i % 7 === 0 ? 2 : i % 3 === 0 ? 1.5 : 1,
    delay: `${(i * 0.37) % 5}s`, duration: `${3.8 + (i % 5) * 0.8}s`, opacity: 0.22 + (i % 5) * 0.09,
  })), []);
  return <div className="bb-newsroom-stars" aria-hidden="true">
    {stars.map((star, i) => <span key={i} className="bb-newsroom-star" style={{ left: star.left, top: star.top, width: star.size, height: star.size, animationDelay: star.delay, animationDuration: star.duration, opacity: star.opacity }} />)}
    <span className="bb-newsroom-shooting bb-newsroom-shooting-one" />
    <span className="bb-newsroom-shooting bb-newsroom-shooting-two" />
  </div>;
}

export default function HomeNewsroom({ initialCategory, hideHeader = false }: Props) {
  const category = initialCategory || "";
  const copy = COPY[category];
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setError("");
      const select = category
        ? "id,slug,title,standfirst,cover_image_url,cover_alt,read_minutes,is_lead,published_at,categories!inner(name,slug),profiles(display_name)"
        : "id,slug,title,standfirst,cover_image_url,cover_alt,read_minutes,is_lead,published_at,categories(name,slug),profiles(display_name)";
      let query = supabase.from("articles").select(select).eq("status", "published");
      if (category) query = query.eq("categories.slug", category);
      const { data, error: queryError } = await query.order("is_lead", { ascending: false }).order("published_at", { ascending: false });
      if (!active) return;
      if (queryError) setError(queryError.message);
      setArticles((data || []) as unknown as Article[]); setLoading(false);
    })();
    return () => { active = false; };
  }, [category]);

  const lead = articles[0];
  const side = useMemo(() => articles.slice(1, 4), [articles]);
  const latest = useMemo(() => articles.slice(4), [articles]);

  return <div className="min-h-screen overflow-x-hidden bg-black text-white">
    <div className="h-[70px]" />
    <style>{`
      .bb-newsroom-hero { position:relative; overflow:hidden; isolation:isolate; }
      .bb-newsroom-hero::before { content:""; position:absolute; inset:0; background:radial-gradient(circle at 76% 42%,rgba(91,124,185,.10),transparent 27%),radial-gradient(circle at 24% 72%,rgba(255,255,255,.035),transparent 24%); pointer-events:none; }
      .bb-newsroom-stars { position:absolute; inset:0; z-index:-1; overflow:hidden; background:linear-gradient(180deg,#020304 0%,#000 100%); pointer-events:none; }
      .bb-newsroom-star { position:absolute; display:block; border-radius:999px; background:#fff; box-shadow:0 0 7px rgba(255,255,255,.42); animation:bbStarPulse ease-in-out infinite; }
      .bb-newsroom-shooting { position:absolute; width:68px; height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.75),transparent); opacity:0; transform:rotate(-42deg); animation:bbShooting 8s ease-in-out infinite; }
      .bb-newsroom-shooting-one { top:28%; left:57%; }
      .bb-newsroom-shooting-two { top:63%; left:82%; width:48px; animation-delay:4.5s; }
      @keyframes bbStarPulse { 0%,100%{transform:scale(.75);opacity:.18} 50%{transform:scale(1.35);opacity:.75} }
      @keyframes bbShooting { 0%,55%,100%{opacity:0;transform:translate(0,0) rotate(-42deg)} 62%{opacity:.7} 70%{opacity:0;transform:translate(115px,80px) rotate(-42deg)} }
      @media(prefers-reduced-motion:reduce){.bb-newsroom-star,.bb-newsroom-shooting{animation:none!important}}
    `}</style>
    <main>
      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-[1480px] px-5 lg:px-8">
          <div className="flex items-center justify-between border-b border-white/10 py-2.5 text-[8px] font-semibold uppercase tracking-[.18em] text-white/30">
            <span>BITBUZZ JOURNAL</span>
            <span className="hidden sm:block">Independent student newsroom · Science · Technology · Innovation</span>
            <span>{copy?.kicker || "ALL"}</span>
          </div>
          <div className="bb-newsroom-hero -mx-5 px-5 py-9 sm:py-11 lg:-mx-8 lg:px-8 lg:py-12">
            <StarField />
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.24em] text-white/45">{copy?.kicker || "BITBUZZ JOURNAL"}</p>
                <h1 className="mt-2 font-serif text-[clamp(3.1rem,6vw,6.4rem)] leading-[.84] tracking-[-.065em]">{copy?.title || "The newsroom"}</h1>
              </div>
              <p className="max-w-md text-[12px] leading-5 text-white/45 sm:text-right">{copy?.deck || "Science, technology, cybersecurity, aviation and innovation — explained clearly, without the noise."}</p>
            </div>
          </div>
          <div className="-mx-5 flex overflow-x-auto border-t border-white/10 lg:-mx-8 lg:px-3">
            {[['', 'All stories'], ...GENRES].map(([slug, label]) => <a key={slug || "all"} href={slug ? `/${slug}` : "/home"} className={`shrink-0 border-r border-white/10 px-5 py-3.5 text-[9px] font-semibold uppercase tracking-[.14em] transition first:border-l lg:px-6 ${category === slug ? "bg-white text-black" : "text-white/40 hover:bg-white/[.04] hover:text-white"}`}>{label}</a>)}
          </div>
        </div>
      </section>
      <div className="mx-auto max-w-[1480px] px-5 lg:px-8">
        {loading ? <div className="py-24 text-center text-[10px] uppercase tracking-[.2em] text-white/25">Loading the newsroom…</div> : error ? <div className="py-24 text-center text-sm text-red-300/70">Could not load stories.</div> : !lead ? <div className="py-24 text-center"><p className="font-serif text-4xl">No stories yet.</p><p className="mt-3 text-sm text-white/30">Published stories will appear here.</p></div> : <>
          <section className="grid gap-8 border-b border-white/10 py-7 lg:grid-cols-[minmax(0,1fr)_370px] lg:py-9">
            <a href={`/blog/${lead.slug}`} className="group block min-w-0">
              <div className="relative aspect-[16/8.5] overflow-hidden bg-[#080808]"><StoryImage article={lead} /><div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 to-transparent" /></div>
              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-9">
                <div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/45">{lead.categories?.[0]?.name || copy?.kicker || "BitBuzz"} · Lead story</p><h2 className="mt-2 max-w-4xl font-serif text-[clamp(2.45rem,4.6vw,5.5rem)] leading-[.86] tracking-[-.06em] transition group-hover:text-white/70">{lead.title}</h2></div>
                {lead.standfirst && <p className="text-[13px] leading-6 text-white/40 lg:pt-1">{lead.standfirst}</p>}
              </div>
              <Meta article={lead}/>
            </a>
            <aside className="border-t border-white/10 lg:border-l lg:border-t-0 lg:pl-7">
              <div className="pt-6 lg:pt-0">
                <div className="flex items-center justify-between border-b border-white/10 pb-3"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/35">Editors' picks</p><span className="text-[8px] uppercase tracking-[.15em] text-white/20">Top stories</span></div>
                {side.map(a => <a key={a.id} href={`/blog/${a.slug}`} className="group grid grid-cols-[1fr_108px] gap-4 border-b border-white/10 py-5 first:pt-4"><div><p className="text-[8px] font-bold uppercase tracking-[.16em] text-white/35">{a.categories?.[0]?.name || "Story"}</p><h3 className="mt-2 font-serif text-[22px] leading-[.96] tracking-[-.04em] text-white/85 transition group-hover:text-white">{a.title}</h3><Meta article={a}/></div><div className="h-[78px] overflow-hidden bg-[#0a0a0a]"><StoryImage article={a}/></div></a>)}
              </div>
              <div className="mt-6"><FlagIt /></div>
            </aside>
          </section>
          {latest.length > 0 && <section className="py-10 lg:py-14"><div className="flex items-end justify-between border-b border-white/10 pb-4"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/30">{category ? `${copy?.kicker} · MORE` : "FROM THE NEWSROOM"}</p><h2 className="mt-2 font-serif text-4xl tracking-[-.05em]">Latest</h2></div><span className="text-[9px] uppercase tracking-[.16em] text-white/20">{articles.length} stories</span></div><div className="grid gap-x-7 gap-y-10 pt-7 sm:grid-cols-2 lg:grid-cols-3">{latest.map(a => <a key={a.id} href={`/blog/${a.slug}`} className="group block border-b border-white/10 pb-8">{a.cover_image_url && <div className="mb-4 aspect-[16/9] overflow-hidden bg-[#080808]"><StoryImage article={a}/></div>}<p className="text-[8px] font-bold uppercase tracking-[.18em] text-white/35">{a.categories?.[0]?.name || "Story"}</p><h3 className="mt-2 font-serif text-[28px] leading-[.94] tracking-[-.045em] text-white/90 transition group-hover:text-white/65">{a.title}</h3>{a.standfirst && <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-white/35">{a.standfirst}</p>}<Meta article={a}/></a>)}</div></section>}
        </>}
      </div>
    </main>
  </div>;
}
