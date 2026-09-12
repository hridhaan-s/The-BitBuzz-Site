import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const FLAG_IT_URL = "https://www.bitbuzz.club/flag-it";
const HERO_GIF = "https://cdn.hackclub.com/01a0909a-4a98-7483-8658-3438faa0f2e0/a500cea59963d3187152da4b1b5d2981.gif";
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
  space: { kicker: "SPACE", title: "The universe, closer than ever.", deck: "Missions, discoveries and the technology pushing humanity farther." },
  cybersecurity: { kicker: "CYBERSECURITY", title: "Inside the connected world.", deck: "Threats, privacy and the systems protecting the digital world." },
  tech: { kicker: "TECH", title: "The technology shaping tomorrow.", deck: "The products, platforms and ideas changing how we live and build." },
  aviation: { kicker: "AVIATION", title: "A world in motion.", deck: "Aircraft, aerospace and the engineering behind flight." },
  innovation: { kicker: "INNOVATION", title: "Ideas become reality.", deck: "The people and ideas turning ambitious problems into useful things." },
  biobuzz: { kicker: "BIOBUZZ", title: "Life, decoded.", deck: "Biology and discoveries reshaping what we know about life." },
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
    {hideHeader ? <div className="h-[70px]" /> : <div className="h-[70px]" />}
    <main>
      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-[1480px] px-5 lg:px-8">
          <div className="flex items-center justify-between border-b border-white/10 py-3 text-[8px] font-semibold uppercase tracking-[.18em] text-white/30">
            <span>{copy?.kicker || "BITBUZZ JOURNAL"}</span><span className="hidden sm:block">Student newsroom · Science · Technology · Innovation</span><span>Independent</span>
          </div>
          <div className="py-10 lg:py-14">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-white/45">{copy?.kicker || "BITBUZZ JOURNAL"}</p><h1 className="mt-4 max-w-5xl font-serif text-[clamp(3.6rem,7.5vw,7.7rem)] leading-[.82] tracking-[-.075em]">{copy?.title || <>The world<br/><span className="text-white/35">is moving.</span></>}</h1></div>
              <p className="max-w-sm text-[13px] leading-6 text-white/40 lg:pb-1">{copy?.deck || "Science, technology, cybersecurity, aviation and innovation — explained clearly, without the noise."}</p>
            </div>
          </div>
          <div className="-mx-5 flex overflow-x-auto border-t border-white/10 lg:-mx-8 lg:px-3">
            {[["", "All stories"], ...GENRES].map(([slug, label]) => <a key={slug || "all"} href={slug ? `/${slug}` : "/home"} className={`shrink-0 border-r border-white/10 px-5 py-4 text-[9px] font-semibold uppercase tracking-[.14em] transition first:border-l lg:px-6 ${category === slug ? "bg-white text-black" : "text-white/40 hover:bg-white/[.04] hover:text-white"}`}>{label}</a>)}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1480px] px-5 lg:px-8">
        {loading ? <div className="py-28 text-center text-[10px] uppercase tracking-[.2em] text-white/25">Loading the newsroom…</div> : error ? <div className="py-28 text-center text-sm text-red-300/70">Could not load stories.</div> : !lead ? <div className="py-28 text-center"><p className="font-serif text-4xl">No stories yet.</p><p className="mt-3 text-sm text-white/30">Published stories will appear here.</p></div> : <>
          <section className="grid gap-8 border-b border-white/10 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
            <a href={`/blog/${lead.slug}`} className="group block min-w-0">
              <div className="relative aspect-[16/9] overflow-hidden bg-[#080808]"><StoryImage article={lead} /><div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 to-transparent" /></div>
              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_280px] lg:gap-8"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/45">{lead.categories?.[0]?.name || copy?.kicker || "BitBuzz"} · Lead</p><h2 className="mt-2 max-w-4xl font-serif text-[clamp(2.5rem,5vw,5.8rem)] leading-[.87] tracking-[-.065em] transition group-hover:text-white/70">{lead.title}</h2></div>{lead.standfirst && <p className="text-[13px] leading-6 text-white/40 lg:pt-1">{lead.standfirst}</p>}</div><Meta article={lead}/>
            </a>
            <aside className="border-t border-white/10 lg:border-l lg:border-t-0 lg:pl-7">
              <div className="pt-6 lg:pt-0"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/30">Editors' picks</p>{side.map(a => <a key={a.id} href={`/blog/${a.slug}`} className="group grid grid-cols-[1fr_105px] gap-4 border-b border-white/10 py-5 first:pt-4"><div><p className="text-[8px] font-bold uppercase tracking-[.16em] text-white/35">{a.categories?.[0]?.name || "Story"}</p><h3 className="mt-2 font-serif text-[23px] leading-[.96] tracking-[-.04em] text-white/85 transition group-hover:text-white">{a.title}</h3><Meta article={a}/></div><div className="h-[76px] overflow-hidden bg-[#0a0a0a]"><StoryImage article={a}/></div></a>)}</div>
              <div className="mt-6"><FlagIt /></div>
            </aside>
          </section>

          {latest.length > 0 && <section className="py-10 lg:py-14"><div className="flex items-end justify-between border-b border-white/10 pb-4"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/30">{category ? `${copy?.kicker} · MORE` : "FROM THE NEWSROOM"}</p><h2 className="mt-2 font-serif text-4xl tracking-[-.05em]">Latest</h2></div><span className="text-[9px] uppercase tracking-[.16em] text-white/20">{articles.length} stories</span></div><div className="grid gap-x-7 gap-y-10 pt-7 sm:grid-cols-2 lg:grid-cols-3">{latest.map(a => <a key={a.id} href={`/blog/${a.slug}`} className="group block border-b border-white/10 pb-8">{a.cover_image_url && <div className="mb-4 aspect-[16/9] overflow-hidden bg-[#080808]"><StoryImage article={a}/></div>}<p className="text-[8px] font-bold uppercase tracking-[.18em] text-white/35">{a.categories?.[0]?.name || "Story"}</p><h3 className="mt-2 font-serif text-[28px] leading-[.94] tracking-[-.045em] text-white/90 transition group-hover:text-white/65">{a.title}</h3>{a.standfirst && <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-white/35">{a.standfirst}</p>}<Meta article={a}/></a>)}</div></section>}
        </>}
      </div>
    </main>
  </div>;
}
