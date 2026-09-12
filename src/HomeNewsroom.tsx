import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";
const HERO_GIF =
  "https://cdn.hackclub.com/01a0909a-4a98-7483-8658-3438faa0f2e0/a500cea59963d3187152da4b1b5d2981.gif";

const GENRES = [
  { label: "SPACE", slug: "space" },
  { label: "CYBERSECURITY", slug: "cybersecurity" },
  { label: "TECH", slug: "tech" },
  { label: "AVIATION", slug: "aviation" },
  { label: "INNOVATIONS", slug: "innovations" },
] as const;

const NAV_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "Flag It", href: "https://www.bitbuzz.club/flag-it", external: true },
  { label: "Chanakya AI", href: "/about" },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

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

  const closeMenu = () => {
    setMenuOpen(false);
    setExploreOpen(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white shadow-sm backdrop-blur-xl">
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
            <a href="/home" aria-current="page" className="relative rounded-lg px-3 py-3 text-[13px] text-white transition hover:bg-white/5 after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-honey">
              Home
            </a>
            <div className="relative">
              <button
                type="button"
                onClick={() => setExploreOpen((open) => !open)}
                className="flex items-center gap-1 rounded-lg px-3 py-3 text-[13px] text-white/65 transition hover:bg-white/5 hover:text-white"
                aria-expanded={exploreOpen}
                aria-haspopup="true"
              >
                Explore <span className={`text-[9px] transition-transform ${exploreOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {exploreOpen && (
                <div className="absolute right-0 top-[calc(100%+7px)] w-56 rounded-xl border border-white/10 bg-black p-2 shadow-2xl">
                  {GENRES.map((genre) => (
                    <a
                      key={genre.slug}
                      href={`/${genre.slug}`}
                      onClick={() => setExploreOpen(false)}
                      className="block rounded-lg px-3 py-2.5 text-[13px] text-white/70 transition hover:bg-white/5 hover:text-honey"
                    >
                      {genre.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                className="rounded-lg px-3 py-3 text-[13px] text-white/65 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a href="/submit" className="ml-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-black transition hover:bg-honey">
              Submit
            </a>
          </nav>

          <a href="/submit" className="ml-auto rounded-full bg-white px-4 py-2.5 text-[12px] font-bold text-black transition hover:bg-honey lg:hidden">
            Submit
          </a>
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
            <a href="/home" onClick={closeMenu} className="block rounded-xl border-l-2 border-honey bg-white/[0.03] px-4 py-3.5 text-[16px] font-semibold text-honey">Home</a>
            <p className="mt-8 px-4 pb-2 text-[10px] font-bold tracking-[0.18em] text-white/35">EXPLORE</p>
            {GENRES.map((genre) => (
              <a key={genre.slug} href={`/${genre.slug}`} onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[15px] text-white/70 transition hover:bg-white/5 hover:text-white">
                {genre.label}
              </a>
            ))}
            <div className="my-6 border-t border-white/10" />
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target={link.external ? "_blank" : undefined}
                rel={link.external ? "noreferrer" : undefined}
                onClick={closeMenu}
                className="block rounded-xl px-4 py-3 text-[15px] text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <a href="/submit" onClick={closeMenu} className="mt-5 block rounded-full bg-white px-5 py-3 text-center text-[13px] font-bold text-black transition hover:bg-honey">
              Submit an Article
            </a>
          </nav>
        </div>
      )}

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
