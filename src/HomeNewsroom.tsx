import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const HERO_GIF = "https://cdn.hackclub.com/01a0909a-4a98-7483-8658-3438faa0f2e0/a500cea59963d3187152da4b1b5d2981.gif";
const FLAG_IT_URL = "https://www.bitbuzz.club/flag-it";

const GENRES = [
  ["space", "Space"], ["cybersecurity", "Cybersecurity"], ["tech", "Tech"],
  ["aviation", "Aviation"], ["innovation", "Innovation"], ["biobuzz", "BioBuzz"],
] as const;

type Props = { initialCategory?: string; hideHeader?: boolean };
type Article = {
  id: string; slug: string; title: string; standfirst: string | null;
  cover_image_url: string | null; cover_alt: string | null; read_minutes: number | null;
  is_lead: boolean; published_at: string | null;
  categories?: { name: string; slug: string }[] | null;
  profiles?: { display_name: string } | null;
};

const COPY: Record<string, { kicker: string; title: string; deck: string }> = {
  space: { kicker: "SPACE", title: "Beyond the horizon.", deck: "Missions, discoveries and the technology pushing humanity farther." },
  cybersecurity: { kicker: "CYBERSECURITY", title: "The internet has a memory.", deck: "Threats, privacy and the systems protecting the connected world." },
  tech: { kicker: "TECH", title: "What changes next.", deck: "Technology stories that actually change how we live, work and build." },
  aviation: { kicker: "AVIATION", title: "The world, in motion.", deck: "Aircraft, aerospace and the engineering behind flight." },
  innovation: { kicker: "INNOVATION", title: "Ideas becoming real.", deck: "The people and ideas turning ambitious problems into useful things." },
  biobuzz: { kicker: "BIOBUZZ", title: "Life, decoded.", deck: "Biology and discoveries reshaping what we know about life." },
};

const date = (v: string | null) => v ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(v)) : "";

function StoryMeta({ article }: { article: Article }) {
  return <p className="mt-3 text-[9px] uppercase tracking-[.13em] text-white/25">{article.profiles?.display_name || "BitBuzz"} · {article.read_minutes || 1} min read{article.published_at ? ` · ${date(article.published_at)}` : ""}</p>;
}

function FlagIt() {
  return <a href={FLAG_IT_URL} target="_blank" rel="noreferrer" className="group block rounded-2xl border border-white/10 bg-[#080808] p-5 transition hover:border-white/25 hover:bg-[#0b0b0c]"><div className="flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#83adff]">Flag It</p><h3 className="mt-2 font-serif text-[26px] leading-none tracking-[-.045em]">See something suspicious?</h3></div><span className="text-xl text-white/30 transition group-hover:translate-x-1 group-hover:text-white">↗</span></div><p className="mt-4 text-xs leading-5 text-white/40">Report scams and suspicious digital activity to the BitBuzz community.</p></a>;
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
    {!hideHeader && <div className="h-[70px]" />}
    <main className={hideHeader ? "pt-[70px]" : ""}>
      <section className="relative overflow-hidden border-b border-white/10">
        <img src={HERO_GIF} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,.9)_28%,rgba(0,0,0,.55)_68%,rgba(0,0,0,.82)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.25),#000_96%)]" />
        <div className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-16 lg:px-10 lg:pb-16 lg:pt-20">
          <div className="max-w-5xl"><div className="flex items-center gap-3"><span className="h-px w-9 bg-white/50"/><p className="text-[9px] font-bold uppercase tracking-[.25em] text-white/55">{copy?.kicker || "BITBUZZ JOURNAL"}</p></div><h1 className="mt-6 max-w-5xl font-serif text-[clamp(4rem,9vw,9rem)] leading-[.78] tracking-[-.075em]">{copy?.title || <>The world<br/><span className="text-white/45">is moving.</span></>}</h1><p className="mt-7 max-w-2xl text-[14px] leading-6 text-white/45">{copy?.deck || "Science, technology, cybersecurity, aviation and innovation — explained clearly, without the noise."}</p></div>
          <div className="mt-10 flex gap-2 overflow-x-auto pb-1">{[["", "All"], ...GENRES].map(([slug, label]) => <a key={slug || "all"} href={slug ? `/${slug}` : "/home"} className={`shrink-0 rounded-full border px-4 py-2 text-[9px] font-semibold uppercase tracking-[.12em] transition ${category === slug ? "border-white bg-white text-black" : "border-white/15 bg-black/30 text-white/55 hover:border-white/35 hover:text-white"}`}>{label}</a>)}</div>
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
        {loading ? <div className="py-28 text-center text-[10px] uppercase tracking-[.2em] text-white/25">Loading the newsroom…</div> : error ? <div className="py-28 text-center text-sm text-red-300/70">Could not load stories.</div> : !lead ? <div className="py-28 text-center"><p className="font-serif text-4xl">No stories yet.</p><p className="mt-3 text-sm text-white/30">Published stories will appear here.</p></div> : <>
          <section className="grid gap-8 border-b border-white/10 py-10 lg:grid-cols-[minmax(0,1fr)_350px] lg:py-14">
            <a href={`/blog/${lead.slug}`} className="group block min-w-0">
              <div className="relative overflow-hidden rounded-[4px] bg-[#090909]"><div className="aspect-[16/9]">{lead.cover_image_url ? <img src={lead.cover_image_url} alt={lead.cover_alt || ""} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"/> : <div className="h-full w-full bg-[radial-gradient(circle_at_70%_30%,#182b4d,#070707_60%)]"/>}</div><div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent"/></div>
              <p className="mt-6 text-[9px] font-bold uppercase tracking-[.2em] text-white/45">{lead.categories?.[0]?.name || copy?.kicker || "BitBuzz"} · Lead story</p><h2 className="mt-3 max-w-5xl font-serif text-[clamp(2.7rem,5.8vw,6.2rem)] leading-[.86] tracking-[-.065em] transition group-hover:text-white/75">{lead.title}</h2>{lead.standfirst && <p className="mt-5 max-w-3xl text-[14px] leading-6 text-white/40">{lead.standfirst}</p>}<StoryMeta article={lead}/>
            </a>
            <aside className="lg:border-l lg:border-white/10 lg:pl-7"><FlagIt/><div className="mt-7 border-t border-white/10">{side.map(a => <a key={a.id} href={`/blog/${a.slug}`} className="group grid grid-cols-[1fr_110px] gap-4 border-b border-white/10 py-5"><div><p className="text-[8px] font-bold uppercase tracking-[.17em] text-white/35">{a.categories?.[0]?.name || "Story"}</p><h3 className="mt-2 font-serif text-[21px] leading-[1.02] tracking-[-.04em] text-white/85 transition group-hover:text-white">{a.title}</h3><StoryMeta article={a}/></div>{a.cover_image_url ? <img src={a.cover_image_url} alt={a.cover_alt || ""} className="h-[78px] w-[110px] rounded object-cover"/> : <div className="h-[78px] w-[110px] rounded bg-[#101011]"/>}</a>)}</div></aside>
          </section>
          {latest.length > 0 && <section className="py-12 lg:py-16"><div className="flex items-end justify-between border-b border-white/10 pb-5"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/35">{category ? `${copy?.kicker} · MORE` : "FROM THE NEWSROOM"}</p><h2 className="mt-2 font-serif text-4xl tracking-[-.05em]">Latest stories</h2></div><span className="text-[9px] uppercase tracking-[.16em] text-white/20">{articles.length} stories</span></div><div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">{latest.map(a => <a key={a.id} href={`/blog/${a.slug}`} className="group block">{a.cover_image_url ? <div className="overflow-hidden rounded bg-[#080808]"><img src={a.cover_image_url} alt={a.cover_alt || ""} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.025]"/></div> : <div className="aspect-[16/10] rounded bg-[#090909]"/>}<p className="mt-4 text-[8px] font-bold uppercase tracking-[.18em] text-white/35">{a.categories?.[0]?.name || "Story"}</p><h3 className="mt-2 font-serif text-[27px] leading-[.96] tracking-[-.045em] text-white/90 transition group-hover:text-white">{a.title}</h3>{a.standfirst && <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-white/35">{a.standfirst}</p>}<StoryMeta article={a}/></a>)}</div></section>}
        </>}
      </div>
    </main>
  </div>;
}
