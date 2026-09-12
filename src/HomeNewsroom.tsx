import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const LOGO_URL = "https://cdn.hackclub.com/01a0909a-4a98-7483-8658-3438faa0f2e0/a500cea59963d3187152da4b1b5d2981.gif";
const HERO_GIF = LOGO_URL;
const FLAG_IT_URL = "https://www.bitbuzz.club/flag-it";

const GENRES = [
  ["space", "Space"],
  ["cybersecurity", "Cybersecurity"],
  ["tech", "Tech"],
  ["aviation", "Aviation"],
  ["innovation", "Innovation"],
  ["biobuzz", "BioBuzz"],
] as const;

const CATEGORY_COPY: Record<string, { kicker: string; title: string; accent: string; description: string }> = {
  space: { kicker: "SPACE", title: "Beyond the horizon.", accent: "space", description: "Missions, discoveries and the technology pushing humanity farther." },
  cybersecurity: { kicker: "CYBERSECURITY", title: "The internet has a memory.", accent: "cybersecurity", description: "Threats, privacy and the systems protecting the connected world." },
  tech: { kicker: "TECH", title: "What changes next.", accent: "tech", description: "Technology stories that actually change how we live, work and build." },
  aviation: { kicker: "AVIATION", title: "The world, in motion.", accent: "aviation", description: "Aircraft, airlines, aerospace and the engineering behind flight." },
  innovation: { kicker: "INNOVATION", title: "Ideas becoming real.", accent: "innovation", description: "The people and ideas turning ambitious problems into useful things." },
  biobuzz: { kicker: "BIOBUZZ", title: "Life, decoded.", accent: "biobuzz", description: "Biology, health science and discoveries reshaping what we know about life." },
};

type Props = { initialCategory?: string; hideHeader?: boolean };
type Article = {
  id: string; slug: string; title: string; standfirst: string | null;
  cover_image_url: string | null; cover_alt: string | null; read_minutes: number | null;
  is_lead: boolean; published_at: string | null;
  categories?: { name: string; slug: string }[] | null;
  profiles?: { display_name: string } | null;
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function FlagItWidget() {
  return <a href={FLAG_IT_URL} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-2xl border border-white/10 bg-[#090909] p-5 transition hover:border-[#7fa9ff]/40 hover:bg-[#0c0c0d]">
    <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#7fa9ff]">FLAG IT</p><h3 className="mt-2 font-serif text-[25px] leading-none tracking-[-.04em] text-white">See something suspicious?</h3></div><span className="text-xl text-white/30 transition group-hover:translate-x-1 group-hover:text-white">↗</span></div>
    <p className="mt-4 text-[12px] leading-5 text-white/40">Report scams and suspicious digital activity to the BitBuzz community.</p>
  </a>;
}

export default function HomeNewsroom({ initialCategory, hideHeader = false }: Props) {
  const categorySlug = initialCategory || "";
  const copy = CATEGORY_COPY[categorySlug];
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError("");
      const select = categorySlug
        ? "id,slug,title,standfirst,cover_image_url,cover_alt,read_minutes,is_lead,published_at,categories!inner(name,slug),profiles(display_name)"
        : "id,slug,title,standfirst,cover_image_url,cover_alt,read_minutes,is_lead,published_at,categories(name,slug),profiles(display_name)";
      let query = supabase.from("articles").select(select).eq("status", "published");
      if (categorySlug) query = query.eq("categories.slug", categorySlug);
      const { data, error: queryError } = await query.order("is_lead", { ascending: false }).order("published_at", { ascending: false });
      if (!active) return;
      if (queryError) setError(queryError.message);
      setArticles((data || []) as unknown as Article[]);
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [categorySlug]);

  const lead = articles[0];
  const sidebarStories = useMemo(() => articles.slice(1, 4), [articles]);
  const rest = useMemo(() => articles.slice(4), [articles]);

  return <div className="min-h-screen overflow-x-hidden bg-[#020202] text-white">
    {!hideHeader && <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020202]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[58px] max-w-[1320px] items-center justify-between px-5 lg:px-8">
        <a href="/home" className="flex items-center gap-3"><img src={LOGO_URL} className="h-8 w-8 rounded-full border border-white/20 object-cover" alt="BitBuzz" /><span className="font-serif text-xl tracking-[-.04em]">BitBuzz</span></a>
        <nav className="hidden items-center gap-7 text-[11px] text-white/50 lg:flex">
          <a className="text-white" href="/home">Home</a><a href="/blog">Journal</a><a href="/space">Space</a><a href="/cybersecurity">Cybersecurity</a><a href="/tech">Tech</a><a href="/aviation">Aviation</a><a href="/innovation">Innovations</a><a href="/biobuzz">BioBuzz</a><a href="/about">About</a>
        </nav>
        <div className="flex items-center gap-3"><a href="/signup" className="rounded-full bg-white px-5 py-2 text-[11px] font-semibold text-black transition hover:bg-[#dbe5ff]">Sign In</a></div>
      </div>
    </header>}

    <main className={hideHeader ? "pt-[70px]" : ""}>
      <section className="relative isolate min-h-[560px] overflow-hidden border-b border-white/10">
        <img src={HERO_GIF} alt="" aria-hidden className="pointer-events-none absolute inset-0 -z-20 h-full w-full scale-[1.06] object-cover object-center opacity-65 mix-blend-screen" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#020202_0%,rgba(2,2,2,.94)_25%,rgba(2,2,2,.48)_61%,rgba(2,2,2,.72)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.1),transparent_45%,#020202_100%)]" />
        <div className="absolute right-[7%] top-[28%] -z-10 h-64 w-64 rounded-full bg-[#5d98ff]/15 blur-3xl" />
        <div className="mx-auto flex min-h-[560px] max-w-[1320px] items-end px-5 pb-16 pt-24 lg:px-8 lg:pb-20">
          <div className="max-w-5xl">
            <div className="mb-7 flex items-center gap-3"><span className="h-px w-10 bg-[#7fa9ff]"/><p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#7fa9ff]">{copy?.kicker || "BITBUZZ JOURNAL"}</p></div>
            <h1 className="max-w-5xl font-serif text-[clamp(4rem,9vw,8.7rem)] leading-[.78] tracking-[-.075em]">{copy?.title || <>The world<br/><span className="text-[#7fa9ff]">is moving.</span></>}</h1>
            <p className="mt-8 max-w-xl text-[15px] leading-7 text-white/45">{copy?.description || "Science, technology, cybersecurity, aviation and innovation — explained clearly, without the noise."}</p>
            <div className="mt-9 flex flex-wrap gap-2">{[["", "All stories"], ...GENRES].map(([slug,label])=><a key={slug || "all"} href={slug ? `/${slug}` : "/home"} className={`rounded-full border px-4 py-2 text-[10px] uppercase tracking-[.1em] transition ${categorySlug === slug ? "border-white bg-white text-black" : "border-white/15 bg-black/30 text-white/55 hover:border-white/35 hover:text-white"}`}>{label}</a>)}</div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1320px] px-5 lg:px-8">
        {loading ? <div className="py-24 text-center text-xs uppercase tracking-[.2em] text-white/25">Loading the newsroom…</div> : error ? <div className="py-24 text-center text-sm text-red-300/70">Could not load stories.</div> : !lead ? <div className="border-b border-white/10 py-24 text-center"><p className="font-serif text-4xl">No stories yet.</p><p className="mt-3 text-sm text-white/30">Published stories will appear here.</p></div> : <>
          <section className="grid gap-8 border-b border-white/10 py-12 lg:grid-cols-[minmax(0,1.65fr)_360px] lg:py-16">
            <a href={`/blog/${lead.slug}`} className="group block">
              <div className="relative overflow-hidden rounded-2xl bg-[#0b0b0c]">{lead.cover_image_url ? <img src={lead.cover_image_url} alt={lead.cover_alt || ""} className="aspect-[16/8.5] w-full object-cover transition duration-700 group-hover:scale-[1.025]"/> : <div className="aspect-[16/8.5] bg-[radial-gradient(circle_at_70%_35%,#19335b,#080808_55%)]"/>}<div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent"/></div>
              <div className="pt-6"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#7fa9ff]">{lead.categories?.[0]?.name || "BitBuzz"} · Lead story</p><h2 className="mt-3 max-w-5xl font-serif text-[clamp(2.4rem,5vw,5.2rem)] leading-[.9] tracking-[-.06em] transition group-hover:text-white/75">{lead.title}</h2>{lead.standfirst && <p className="mt-5 max-w-3xl text-[14px] leading-6 text-white/40">{lead.standfirst}</p>}<p className="mt-5 text-[9px] uppercase tracking-[.12em] text-white/25">{lead.profiles?.display_name || "BitBuzz"} · {lead.read_minutes || 1} min read{lead.published_at ? ` · ${formatDate(lead.published_at)}` : ""}</p></div>
            </a>
            <aside className="space-y-7 lg:border-l lg:border-white/10 lg:pl-7"><FlagItWidget/>{sidebarStories.length > 0 && <div className="border-t border-white/10">{sidebarStories.map(article=><a key={article.id} href={`/blog/${article.slug}`} className="group grid grid-cols-[1fr_110px] gap-4 border-b border-white/10 py-5"><div><p className="text-[8px] font-bold uppercase tracking-[.17em] text-[#7fa9ff]">{article.categories?.[0]?.name || "Story"}</p><h3 className="mt-2 font-serif text-[20px] leading-[1.05] tracking-[-.035em] text-white/85 transition group-hover:text-white">{article.title}</h3><p className="mt-3 text-[9px] uppercase tracking-[.1em] text-white/25">{article.read_minutes || 1} min read</p></div>{article.cover_image_url ? <img src={article.cover_image_url} alt={article.cover_alt || ""} className="h-[78px] w-[110px] rounded-lg object-cover"/>:<div className="h-[78px] w-[110px] rounded-lg bg-[#101011]"/>}</a>)}</div>}</aside>
          </section>
          {rest.length > 0 && <section className="py-14 lg:py-20"><div className="mb-8 flex items-end justify-between border-b border-white/10 pb-5"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#7fa9ff]">{categorySlug ? `${copy?.kicker} · MORE` : "FROM THE NEWSROOM"}</p><h2 className="mt-2 font-serif text-4xl tracking-[-.05em]">Latest stories</h2></div><span className="text-[10px] uppercase tracking-[.15em] text-white/25">{articles.length} stories</span></div><div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{rest.map(article=><a key={article.id} href={`/blog/${article.slug}`} className="group block">{article.cover_image_url?<div className="overflow-hidden rounded-xl bg-[#080808]"><img src={article.cover_image_url} alt={article.cover_alt||""} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.025]"/></div>:<div className="aspect-[16/10] rounded-xl bg-[#0b0b0c]"/>}<p className="mt-4 text-[9px] font-bold uppercase tracking-[.17em] text-[#7fa9ff]">{article.categories?.[0]?.name||"Story"}</p><h3 className="mt-2 font-serif text-[27px] leading-[.98] tracking-[-.045em] text-white/90 transition group-hover:text-white">{article.title}</h3>{article.standfirst&&<p className="mt-3 line-clamp-2 text-[12px] leading-5 text-white/35">{article.standfirst}</p>}<p className="mt-4 text-[9px] uppercase tracking-[.1em] text-white/25">{article.profiles?.display_name||"BitBuzz"} · {article.read_minutes||1} min read</p></a>)}</div></section>}
        </>}
      </div>
    </main>
  </div>;
}
