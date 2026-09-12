import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";
const HERO_GIF =
  "https://cdn.hackclub.com/01a0909a-4a98-7483-8658-3438faa0f2e0/a500cea59963d3187152da4b1b5d2981.gif";
const FLAG_IT_URL = "https://www.bitbuzz.club/flag-it";

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

type Props = { initialCategory?: string };

const CATEGORY_COPY: Record<string, { kicker: string; title: string; description: string }> = {
  space: {
    kicker: "SPACE DESK",
    title: "Beyond the blue.",
    description: "Missions, rockets, discoveries and the science taking us further.",
  },
  cybersecurity: {
    kicker: "CYBERSECURITY DESK",
    title: "Stay one step ahead.",
    description: "The threats, tools and digital habits shaping a safer internet.",
  },
  tech: {
    kicker: "TECH DESK",
    title: "Technology, decoded.",
    description: "The products, systems and breakthroughs changing how we live and build.",
  },
  aviation: {
    kicker: "AVIATION DESK",
    title: "The sky is changing.",
    description: "Aircraft, airlines, aerospace and the engineering behind flight.",
  },
  innovation: {
    kicker: "INNOVATION DESK",
    title: "Ideas worth building.",
    description: "Inventors, startups, experiments and ideas pushing tomorrow forward.",
  },
};

function formatDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function normalizeCategorySlug(slug?: string) {
  return slug === "innovations" ? "innovation" : slug;
}

function FlagItWidget() {
  return (
    <aside className="relative overflow-hidden border border-white/10 bg-[#080808] p-6 sm:p-7">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border border-honey/20" />
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full border border-honey/10" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-honey">Community Cyber Safety Intelligence</p>
          <h2 className="mt-3 font-serif text-[31px] leading-[.98] tracking-[-.04em] text-white">
            Spot a scam?<br /><span className="text-honey">Flag it.</span>
          </h2>
        </div>
        <div className="relative mt-1 h-12 w-10 shrink-0" aria-hidden="true">
          <div className="absolute bottom-0 left-1/2 h-10 w-px -translate-x-1/2 bg-white/35" />
          <div className="absolute left-1/2 top-0 h-6 w-7 -translate-x-[calc(50%-2px)] -skew-y-2 border-y border-white/45 bg-honey/80" />
        </div>
      </div>
      <p className="relative mt-5 text-[12px] leading-5 text-white/55">
        Report frauds · protect your community · stop scammers.
      </p>
      <p className="relative mt-3 text-[11px] leading-5 text-white/35">
        Every report helps protect someone&apos;s savings, identity and dignity.
      </p>
      <a
        href={FLAG_IT_URL}
        target="_blank"
        rel="noreferrer"
        className="relative mt-6 flex items-center justify-between border border-white/15 px-4 py-3 text-[11px] font-bold uppercase tracking-[.12em] text-white transition hover:border-honey hover:bg-honey hover:text-black"
      >
        Open Flag It <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}

export default function HomeNewsroom({ initialCategory }: Props) {
  const categorySlug = normalizeCategorySlug(initialCategory);
  const copy = categorySlug ? CATEGORY_COPY[categorySlug] : null;
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    (async () => {
      let query = supabase
        .from("articles")
        .select("id,slug,title,standfirst,cover_image_url,cover_alt,read_minutes,is_lead,published_at,categories(name,slug),profiles(display_name)")
        .eq("status", "published");

      if (categorySlug) query = query.eq("categories.slug", categorySlug);

      const { data, error: queryError } = await query
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
  }, [categorySlug]);

  const lead = useMemo(() => articles[0], [articles]);
  const sidebarStories = useMemo(() => articles.slice(1, 3), [articles]);
  const rest = useMemo(() => articles.slice(1), [articles]);

  const closeMenu = () => {
    setMenuOpen(false);
    setExploreOpen(false);
  };

  const pageTitle = copy?.title || "News worth knowing.";
  const pageDescription = copy?.description || "Science, technology and the ideas shaping tomorrow — reported for students, by students.";
  const pageKicker = copy?.kicker || "THE STUDENT NEWSROOM";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-honey selection:text-black">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur-xl">
        <div className="mx-auto flex min-h-[64px] max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/75 transition hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <span className="text-xl leading-none">☰</span>
          </button>

          <a href="/home" className="flex items-center gap-2.5" aria-label="BitBuzz Home">
            <img src={LOGO_URL} alt="BitBuzz" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" />
            <span className="font-serif text-[21px] font-semibold tracking-[-0.04em]">BitBuzz</span>
          </a>

          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            <a href="/home" className={`relative rounded-lg px-3 py-3 text-[13px] transition hover:bg-white/5 ${!categorySlug ? "text-white after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-honey" : "text-white/65 hover:text-white"}`}>
              Home
            </a>
            <div className="relative">
              <button
                type="button"
                onClick={() => setExploreOpen((open) => !open)}
                className={`flex items-center gap-1 rounded-lg px-3 py-3 text-[13px] transition hover:bg-white/5 ${categorySlug ? "text-white" : "text-white/65 hover:text-white"}`}
                aria-expanded={exploreOpen}
                aria-haspopup="true"
              >
                Explore <span className={`text-[9px] transition-transform ${exploreOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {exploreOpen && (
                <div className="absolute right-0 top-[calc(100%+7px)] w-56 rounded-xl border border-white/10 bg-black p-2 shadow-2xl">
                  {GENRES.map((genre) => (
                    <a key={genre.slug} href={`/${genre.slug}`} onClick={() => setExploreOpen(false)} className="block rounded-lg px-3 py-2.5 text-[13px] text-white/70 transition hover:bg-white/5 hover:text-honey">
                      {genre.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <a href="/about" className="rounded-lg px-3 py-3 text-[13px] text-white/65 transition hover:bg-white/5 hover:text-white">About Us</a>
            <a href={FLAG_IT_URL} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-3 text-[13px] text-white/65 transition hover:bg-white/5 hover:text-white">Flag It</a>
            <a href="/about" className="rounded-lg px-3 py-3 text-[13px] text-white/65 transition hover:bg-white/5 hover:text-white">Chanakya AI</a>
            <a href="/submit" className="ml-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-black transition hover:bg-honey">Submit</a>
          </nav>

          <a href="/submit" className="ml-auto rounded-full bg-white px-4 py-2.5 text-[12px] font-bold text-black transition hover:bg-honey lg:hidden">Submit</a>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-black text-white lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="sticky top-0 flex h-[64px] items-center justify-between border-b border-white/10 bg-black/95 px-4 backdrop-blur-xl sm:px-6">
            <a href="/home" className="flex items-center gap-2.5" onClick={closeMenu}>
              <img src={LOGO_URL} alt="BitBuzz" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" />
              <span className="font-serif text-[21px] font-semibold tracking-[-0.04em]">BitBuzz</span>
            </a>
            <button type="button" onClick={closeMenu} className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10" aria-label="Close menu">
              <span className="text-2xl leading-none">×</span>
            </button>
          </div>
          <nav className="mx-auto max-w-xl px-5 py-8 sm:px-8" aria-label="Mobile navigation">
            <a href="/home" onClick={closeMenu} className={`block rounded-xl px-4 py-3.5 text-[16px] font-semibold ${!categorySlug ? "border-l-2 border-honey bg-white/[0.03] text-honey" : "text-white/70"}`}>Home</a>
            <p className="mt-8 px-4 pb-2 text-[10px] font-bold tracking-[0.18em] text-white/35">EXPLORE</p>
            {GENRES.map((genre) => (
              <a key={genre.slug} href={`/${genre.slug}`} onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[15px] text-white/70 transition hover:bg-white/5 hover:text-white">{genre.label}</a>
            ))}
            <div className="my-6 border-t border-white/10" />
            <a href="/about" onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[15px] text-white/70 transition hover:bg-white/5 hover:text-white">About Us</a>
            <a href={FLAG_IT_URL} target="_blank" rel="noreferrer" onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[15px] text-white/70 transition hover:bg-white/5 hover:text-white">Flag It</a>
            <a href="/about" onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[15px] text-white/70 transition hover:bg-white/5 hover:text-white">Chanakya AI</a>
            <a href="/submit" onClick={closeMenu} className="mt-5 block rounded-full bg-white px-5 py-3 text-center text-[13px] font-bold text-black transition hover:bg-honey">Submit an Article</a>
          </nav>
        </div>
      )}

      <section className="relative isolate overflow-hidden border-b border-white/10 bg-black">
        <img src={HERO_GIF} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 -z-20 h-full w-full scale-[1.04] object-cover object-center opacity-70 mix-blend-screen" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,.94)_24%,rgba(0,0,0,.58)_62%,rgba(0,0,0,.72)_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,.1)_0%,transparent_42%,#000_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_45%,rgba(255,193,7,.12),transparent_35%)]" />
        <div className="mx-auto flex min-h-[390px] max-w-[1480px] items-end px-8 pb-12 pt-16 sm:min-h-[430px] sm:px-10 sm:pb-14 lg:px-8">
          <div className="max-w-4xl">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.2em] text-honey">
              <span className="h-1.5 w-1.5 rounded-full bg-honey" /> {pageKicker}
            </p>
            <h1 className="mt-4 max-w-4xl font-serif text-[clamp(3.2rem,7.5vw,7rem)] font-medium leading-[.86] tracking-[-.06em]">
              {categorySlug ? pageTitle : <>News worth<br /><em className="font-normal">knowing.</em></>}
            </h1>
            <p className="mt-6 max-w-2xl text-[clamp(1rem,1.35vw,1.15rem)] leading-[1.5] text-white/55">{pageDescription}</p>
          </div>
        </div>
      </section>

      <nav className="border-b border-white/10 bg-black" aria-label="BitBuzz genres">
        <div className="mx-auto flex max-w-[1480px] gap-2 overflow-x-auto px-8 py-5 sm:px-10 lg:px-8">
          <a href="/home" className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[.05em] transition ${!categorySlug ? "border-white bg-white text-black" : "border-white/15 text-white/65 hover:border-white/35 hover:text-white"}`}>LATEST</a>
          {GENRES.map((genre) => {
            const active = categorySlug === normalizeCategorySlug(genre.slug);
            return <a key={genre.slug} href={`/${genre.slug}`} className={`shrink-0 rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[.05em] transition ${active ? "border-honey bg-honey text-black" : "border-white/15 text-white/65 hover:border-white/35 hover:text-white"}`}>{genre.label}</a>;
          })}
        </div>
      </nav>

      <main className="mx-auto max-w-[1480px] px-6 py-10 sm:px-10 sm:py-12 lg:px-8 lg:py-16">
        {loading ? (
          <div className="border-y border-white/10 py-12 text-sm text-white/40">Loading the newsroom…</div>
        ) : error ? (
          <div className="border border-white/10 bg-[#080808] p-8">
            <p className="font-serif text-2xl text-white/80">The newsroom could not load.</p>
            <p className="mt-2 text-sm text-red-300/80">{error}</p>
          </div>
        ) : !lead ? (
          <div className="border-y border-white/10 py-16 text-center">
            <p className="font-serif text-3xl text-white/75">No stories published here yet.</p>
            <p className="mt-2 text-sm text-white/35">Published BitBuzz stories will appear automatically.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.72fr)_minmax(300px,.78fr)] lg:items-start">
              <article>
                <a href={`/blog/${lead.slug}`} className="group block">
                  {lead.cover_image_url ? (
                    <div className="overflow-hidden bg-[#080808]">
                      <img src={lead.cover_image_url} alt={lead.cover_alt || ""} className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-[radial-gradient(circle_at_70%_40%,#182b4b,#080808_60%)]" />
                  )}
                  <div className="pt-5">
                    <p className="text-[9px] font-bold uppercase tracking-[.18em] text-honey">{lead.categories?.name || "BitBuzz"} · Lead story</p>
                    <h2 className="mt-3 max-w-5xl font-serif text-[clamp(2rem,4.1vw,4.2rem)] leading-[.95] tracking-[-.05em] transition group-hover:text-white/80">{lead.title}</h2>
                    {lead.standfirst && <p className="mt-4 max-w-3xl text-[14px] leading-6 text-white/45">{lead.standfirst}</p>}
                    <p className="mt-5 text-[10px] uppercase tracking-[.12em] text-white/30">{lead.profiles?.display_name || "BitBuzz"} · {lead.read_minutes || 1} min read{lead.published_at ? ` · ${formatDate(lead.published_at)}` : ""}</p>
                  </div>
                </a>
              </article>

              <div className="space-y-7 lg:border-l lg:border-white/10 lg:pl-7">
                <FlagItWidget />
                {sidebarStories.length > 0 && (
                  <div className="border-t border-white/10">
                    {sidebarStories.map((article) => (
                      <a key={article.id} href={`/blog/${article.slug}`} className="group grid grid-cols-[1fr_116px] gap-4 border-b border-white/10 py-5">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-[.17em] text-honey">{article.categories?.name || "Story"}</p>
                          <h3 className="mt-2 font-serif text-[20px] leading-[1.05] tracking-[-.035em] text-white/90 transition group-hover:text-white">{article.title}</h3>
                          <p className="mt-3 text-[9px] uppercase tracking-[.1em] text-white/30">{article.read_minutes || 1} min read</p>
                        </div>
                        {article.cover_image_url ? <img src={article.cover_image_url} alt={article.cover_alt || ""} className="h-[82px] w-[116px] object-cover" /> : <div className="h-[82px] w-[116px] bg-[#111]" />}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {rest.length > 0 && (
              <section className="mt-14 border-t border-white/10 pt-7">
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.2em] text-honey">{categorySlug ? `${copy?.kicker} · MORE` : "FROM THE NEWSROOM"}</p>
                    <h2 className="mt-2 font-serif text-3xl tracking-[-.04em]">Latest stories</h2>
                  </div>
                  <span className="hidden text-[10px] uppercase tracking-[.15em] text-white/25 sm:block">{articles.length} {articles.length === 1 ? "story" : "stories"}</span>
                </div>
                <div className="grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((article) => (
                    <a key={article.id} href={`/blog/${article.slug}`} className="group block">
                      {article.cover_image_url ? <div className="overflow-hidden bg-[#080808]"><img src={article.cover_image_url} alt={article.cover_alt || ""} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.025]" /></div> : <div className="aspect-[16/10] bg-[#0b0b0c]" />}
                      <p className="mt-4 text-[9px] font-bold uppercase tracking-[.17em] text-honey">{article.categories?.name || "Story"}</p>
                      <h3 className="mt-2 font-serif text-[25px] leading-[1] tracking-[-.04em] text-white/90 transition group-hover:text-white">{article.title}</h3>
                      {article.standfirst && <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-white/35">{article.standfirst}</p>}
                      <p className="mt-4 text-[9px] uppercase tracking-[.1em] text-white/25">{article.profiles?.display_name || "BitBuzz"} · {article.read_minutes || 1} min read</p>
                    </a>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
