import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const HERO_GIF =
  "https://cdn.hackclub.com/01a0909a-4a98-7483-8658-3438faa0f2e0/a500cea59963d3187152da4b1b5d2981.gif";

const GENRES = [
  { label: "SPACE", slug: "space" },
  { label: "CYBERSECURITY", slug: "cybersecurity" },
  { label: "TECH", slug: "tech" },
  { label: "AVIATION", slug: "aviation" },
  { label: "INNOVATIONS", slug: "innovations" },
] as const;

type Article = {
  id: string;
  slug: string;
  title: string;
  standfirst: string | null;
  cover_image_url: string | null;
  cover_alt: string | null;
  read_minutes: number | null;
  is_lead: boolean;
  published_at: string | null;
  categories?: { name: string; slug: string } | null;
  profiles?: { display_name: string } | null;
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HomeNewsroom() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error: queryError } = await supabase
        .from("articles")
        .select("id,slug,title,standfirst,cover_image_url,cover_alt,read_minutes,is_lead,published_at,categories(name,slug),profiles(display_name)")
        .eq("status", "published")
        .order("is_lead", { ascending: false })
        .order("published_at", { ascending: false });

      if (!active) return;
      if (queryError) setError(queryError.message);
      setArticles((data || []) as Article[]);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const lead = useMemo(() => articles.find((article) => article.is_lead) || articles[0], [articles]);
  const rest = useMemo(() => articles.filter((article) => article.id !== lead?.id), [articles, lead]);

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative isolate min-h-[475px] overflow-hidden border-b border-white/10 sm:min-h-[500px] lg:min-h-[475px]">
        <img
          src={HERO_GIF}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-20 h-full w-full object-cover opacity-55 mix-blend-screen"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,#000000_0%,rgba(0,0,0,.84)_30%,rgba(0,0,0,.54)_62%,rgba(0,0,0,.68)_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_50%,rgba(93,152,255,.18),transparent_38%)]" />
        <div className="mx-auto flex min-h-[475px] max-w-[1480px] items-start px-8 pb-14 pt-5 sm:min-h-[500px] sm:px-10 sm:pt-6 lg:min-h-[475px] lg:px-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-honey">
              <span className="h-2 w-2 rounded-full bg-honey" /> THE STUDENT NEWSROOM
            </div>
            <h1 className="mt-3 font-serif text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.055em]">
              News worth<br /><em className="font-normal">knowing.</em>
            </h1>
            <p className="mt-5 max-w-2xl text-[clamp(1rem,1.35vw,1.15rem)] leading-[1.5] text-soft">
              Science, technology and the ideas shaping tomorrow — reported for students, by students.
            </p>
          </div>
        </div>
      </section>

      <nav className="border-b border-white/10 bg-black" aria-label="BitBuzz genres">
        <div className="mx-auto flex max-w-[1480px] gap-2 overflow-x-auto px-8 py-6 sm:px-10 lg:px-8">
          {GENRES.map((genre) => (
            <a
              key={genre.slug}
              href={`/${genre.slug}`}
              className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-[12px] font-medium uppercase tracking-[0.04em] text-white/80 transition hover:border-white/35 hover:bg-white/5 hover:text-white"
            >
              {genre.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-[1480px] px-8 py-12 sm:px-10 lg:px-8 lg:py-16">
        {loading ? (
          <p className="text-sm text-white/40">Loading the latest stories…</p>
        ) : error ? (
          <div className="border border-white/10 bg-[#080809] p-8">
            <p className="font-serif text-2xl text-white/80">The newsroom could not load.</p>
            <p className="mt-2 text-sm text-red-300/80">{error}</p>
          </div>
        ) : !lead ? (
          <div className="border border-white/10 bg-[#080809] p-10 text-center">
            <p className="font-serif text-3xl text-white/75">No stories published yet.</p>
            <p className="mt-2 text-sm text-white/35">Published BitBuzz stories will appear here.</p>
          </div>
        ) : (
          <>
            <a href={`/blog/${lead.slug}`} className="group grid overflow-hidden border border-white/10 bg-[#080809] transition hover:border-white/20 lg:grid-cols-[1.15fr_.85fr]">
              {lead.cover_image_url ? (
                <img src={lead.cover_image_url} alt={lead.cover_alt || ""} className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.02] lg:h-full" />
              ) : (
                <div className="min-h-72 bg-gradient-to-br from-[#0d1730] to-[#080809]" />
              )}
              <div className="p-7 sm:p-10">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-honey">{lead.categories?.name || "BitBuzz"} · Lead story</p>
                <h2 className="mt-5 font-serif text-4xl leading-[1] tracking-[-.05em] sm:text-5xl">{lead.title}</h2>
                {lead.standfirst && <p className="mt-5 leading-relaxed text-white/45">{lead.standfirst}</p>}
                <p className="mt-8 text-xs text-white/30">
                  {lead.read_minutes || 1} min read · {lead.profiles?.display_name || "BitBuzz"}{lead.published_at ? ` · ${formatDate(lead.published_at)}` : ""}
                </p>
              </div>
            </a>

            {rest.length > 0 && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <a key={article.id} href={`/blog/${article.slug}`} className="group overflow-hidden border border-white/10 bg-[#080809] transition hover:-translate-y-1 hover:border-white/20">
                    {article.cover_image_url ? (
                      <img src={article.cover_image_url} alt={article.cover_alt || ""} className="h-48 w-full object-cover" />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-[#111827] to-[#080809]" />
                    )}
                    <div className="p-5">
                      <p className="text-[9px] font-bold uppercase tracking-[.16em] text-honey">{article.categories?.name || "Story"}</p>
                      <h3 className="mt-3 font-serif text-2xl leading-tight tracking-[-.04em]">{article.title}</h3>
                      {article.standfirst && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/40">{article.standfirst}</p>}
                      <p className="mt-5 text-[11px] text-white/25">{article.read_minutes || 1} min read</p>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
