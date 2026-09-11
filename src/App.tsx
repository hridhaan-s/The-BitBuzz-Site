import { useState } from "react";
import { applyTheme, getInitialTheme } from "./lib/theme";

const LOGO_URL =
  "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

const genres = [
  { label: "Space", slug: "space" },
  { label: "Cybersecurity", slug: "cybersecurity" },
  { label: "Tech", slug: "tech" },
  { label: "Aviation", slug: "aviation" },
  { label: "Innovations", slug: "innovations" },
];

const stories = [
  {
    category: "SPACE",
    title: "The new space race is being built by students too",
    excerpt:
      "From reusable rockets to autonomous rovers, the next generation is moving from watching space to actually building for it.",
    meta: "6 min read · Feature",
    image:
      "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1400&q=85",
  },
  {
    category: "CYBERSECURITY",
    title: "Your school account is a bigger target than you think",
    excerpt:
      "Why student accounts are valuable to attackers—and the simple habits that make phishing dramatically harder to pull off.",
    meta: "4 min read · Explainer",
    image:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1000&q=85",
  },
  {
    category: "TECH",
    title: "AI is getting smaller, faster and much closer to your laptop",
    excerpt:
      "The interesting AI story isn't only giant models. Smaller systems are making powerful features possible without sending everything to the cloud.",
    meta: "5 min read · Technology",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85",
  },
  {
    category: "AVIATION",
    title: "What comes after the age of bigger airplanes?",
    excerpt:
      "Electric propulsion, efficient aircraft and new approaches to short-haul travel are reshaping what the next aircraft could look like.",
    meta: "7 min read · Aviation",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=85",
  },
  {
    category: "INNOVATIONS",
    title: "The best inventions don't always look like inventions",
    excerpt:
      "A look at the deceptively simple ideas turning into serious solutions in classrooms, labs and garages around the world.",
    meta: "5 min read · Ideas",
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=85",
  },
];

function Icon({ name }: { name: "linkedin" | "instagram" | "youtube" | "search" | "menu" | "close" }) {
  const common = {
    width: 17,
    height: 17,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "linkedin") return <svg {...common}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
  if (name === "instagram") return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>;
  if (name === "youtube") return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="3" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M3 6h18M3 12h18M3 18h18" /></svg>;
  return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

const navLinks = [
  ["About Us", "#about"],
  ["Flag It", "#flag-it"],
  ["Chanakya AI", "#chanakya-ai"],
  ["Tool Box", "#tool-box"],
] as const;

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setExploreOpen(false);
  };

  return (
    <div className="min-h-[100dvh] bg-paper text-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#161617]/95 text-white shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-[58px] max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="hidden shrink-0 items-center gap-4 2xl:flex">
            <div className="flex items-center gap-3 border-r border-white/15 pr-5">
              <a href="https://www.linkedin.com/company/bitbuzzspace/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-white/55 transition hover:text-white"><Icon name="linkedin" /></a>
              <a href="https://www.instagram.com/bitbuzz_CLUB/" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-white/55 transition hover:text-white"><Icon name="instagram" /></a>
              <a href="https://www.youtube.com/@Bitbuzz-club" target="_blank" rel="noreferrer" aria-label="YouTube" className="text-white/55 transition hover:text-white"><Icon name="youtube" /></a>
            </div>
            <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.08em] text-white/45">
              {new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}
            </span>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white 2xl:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <Icon name="menu" />
          </button>

          <a
            href="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-2 py-1.5 transition hover:bg-white/5"
            aria-label="BitBuzz Home"
          >
            <img src={LOGO_URL} alt="BitBuzz" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" />
            <span className="font-serif text-[21px] font-semibold tracking-[-0.04em]">BitBuzz</span>
          </a>

          <nav className="ml-auto hidden items-center gap-1 2xl:flex" aria-label="Main navigation">
            <a href="/" className="relative rounded-lg px-3 py-3 text-[13px] text-white transition hover:bg-white/5 after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-honey" aria-current="page">Home</a>
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
                <div className="absolute right-0 top-[calc(100%+7px)] w-56 rounded-xl border border-white/10 bg-[#181819]/98 p-2 shadow-2xl backdrop-blur-xl">
                  {genres.map((genre) => (
                    <a key={genre.slug} href={`/#${genre.slug}`} onClick={() => setExploreOpen(false)} className="block rounded-lg px-3 py-2.5 text-[13px] text-white/70 transition hover:bg-white/5 hover:text-honey">
                      {genre.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} className="rounded-lg px-3 py-3 text-[13px] text-white/65 transition hover:bg-white/5 hover:text-white">{label}</a>
            ))}
            <div className="ml-2 flex items-center gap-2 border-l border-white/15 pl-4">
              <button type="button" aria-label="Search" className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-white"><Icon name="search" /></button>
              <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-full text-[17px] text-white/70 transition hover:bg-white/5 hover:text-honey">{theme === "dark" ? "☀" : "☾"}</button>
              <a href="#submit" className="ml-1 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-black transition hover:bg-honey hover:text-black">Submit</a>
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-1 2xl:hidden">
            <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-full text-[17px] text-white/75 transition hover:bg-white/10">{theme === "dark" ? "☀" : "☾"}</button>
            <a href="#submit" className="rounded-full bg-white px-4 py-2.5 text-[12px] font-bold text-black transition hover:bg-honey">Submit</a>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[90] overflow-y-auto bg-[#111112] text-white 2xl:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="sticky top-0 flex h-[58px] items-center justify-between border-b border-white/10 bg-[#111112]/95 px-4 backdrop-blur-xl sm:px-6">
            <a href="/" className="flex items-center gap-2.5" onClick={closeMenu}>
              <img src={LOGO_URL} alt="BitBuzz" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" />
              <span className="font-serif text-[21px] font-semibold tracking-[-0.04em]">BitBuzz</span>
            </a>
            <button type="button" onClick={closeMenu} className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Close menu"><Icon name="close" /></button>
          </div>
          <nav className="mx-auto max-w-xl px-5 py-8 sm:px-8" aria-label="Mobile navigation">
            <a href="/" onClick={closeMenu} className="block rounded-xl border-l-2 border-honey bg-white/[0.03] px-4 py-3.5 text-[16px] font-semibold text-honey">Home</a>
            <p className="mt-8 px-4 pb-2 text-[10px] font-bold tracking-[0.18em] text-white/35">EXPLORE</p>
            {genres.map((genre) => (
              <a key={genre.slug} href={`/#${genre.slug}`} onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[15px] text-white/70 transition hover:bg-white/5 hover:text-white">{genre.label}</a>
            ))}
            <div className="my-6 border-t border-white/10" />
            {navLinks.map(([label, href]) => (
              <a key={label} href={href} onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[15px] text-white/70 transition hover:bg-white/5 hover:text-white">{label}</a>
            ))}
            <a href="#submit" onClick={closeMenu} className="mt-5 block rounded-full bg-white px-5 py-3 text-center text-[13px] font-bold text-black transition hover:bg-honey">Submit an Article</a>
            <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-white/10 px-4 pt-5 text-white/45">
              <a href="https://www.linkedin.com/company/bitbuzzspace/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Icon name="linkedin" /></a>
              <a href="https://www.instagram.com/bitbuzz_CLUB/" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" /></a>
              <a href="https://www.youtube.com/@Bitbuzz-club" target="_blank" rel="noreferrer" aria-label="YouTube"><Icon name="youtube" /></a>
              <span className="text-[10px] uppercase tracking-[0.08em]">{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}</span>
            </div>
          </nav>
        </div>
      )}

      <main id="main-content" className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <section className="border-b border-line py-10 sm:py-14 lg:py-16">
          <div className="mb-5 flex items-center gap-3 text-[11px] font-bold tracking-[0.14em] text-honey"><span className="h-2 w-2 rounded-full bg-honey" /> THE STUDENT NEWSROOM</div>
          <h1 className="max-w-5xl font-serif text-[clamp(3rem,8vw,7.5rem)] font-medium leading-[0.9] tracking-[-0.055em]">News worth<br /><em className="font-light">knowing.</em></h1>
          <p className="mt-7 max-w-2xl text-[16px] leading-7 text-soft sm:text-[18px]">Science, technology and the ideas shaping tomorrow — reported for students, by students.</p>
        </section>

        <section className="border-b border-line py-8" aria-label="Explore genres">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
            {genres.map((genre, index) => <a key={genre.slug} href={`#${genre.slug}`} className={`whitespace-nowrap rounded-full border px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] transition ${index === 0 ? "border-ink bg-ink text-paper" : "border-line text-soft hover:border-ink hover:text-ink"}`}>{genre.label}</a>)}
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr]">
            <article className="group min-w-0">
              <a href="#space" className="block aspect-[16/9] overflow-hidden bg-[#ddd] sm:aspect-[2/1]"><img src={stories[0].image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" /></a>
              <div className="pt-5">
                <p className="text-[10px] font-bold tracking-[0.16em] text-honey">{stories[0].category}</p>
                <h2 className="mt-2 max-w-4xl font-serif text-[clamp(2rem,4vw,4rem)] font-medium leading-[0.98] tracking-[-0.04em] transition group-hover:text-honey">{stories[0].title}</h2>
                <p className="mt-4 max-w-2xl text-[15px] leading-6 text-soft">{stories[0].excerpt}</p>
                <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.1em] text-soft/80">{stories[0].meta}</p>
              </div>
            </article>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
              {stories.slice(1, 3).map((story) => <article key={story.title} className="group grid grid-cols-[120px_1fr] gap-4 border-t border-line pt-5 sm:block lg:grid lg:grid-cols-[120px_1fr] lg:gap-4">
                <a href={`#${story.category.toLowerCase()}`} className="block aspect-[4/3] overflow-hidden bg-[#ddd] sm:mb-4 lg:mb-0"><img src={story.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></a>
                <div><p className="text-[9px] font-bold tracking-[0.15em] text-honey">{story.category}</p><h3 className="mt-1 font-serif text-[22px] font-medium leading-[1.05] tracking-[-0.025em] group-hover:text-honey">{story.title}</h3><p className="mt-2 hidden text-[13px] leading-5 text-soft sm:block lg:hidden">{story.excerpt}</p><p className="mt-3 text-[9px] uppercase tracking-[0.1em] text-soft">{story.meta}</p></div>
              </article>)}
            </div>
          </div>
        </section>

        <section className="border-t border-line py-10 lg:py-14">
          <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[0.16em] text-honey">FROM THE NEWSROOM</p><h2 className="mt-1 font-serif text-4xl font-medium tracking-[-0.04em]">More to explore</h2></div><a href="#explore" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-soft hover:text-honey">View all →</a></div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {stories.slice(2).map((story) => <article key={story.title} className="group"><a href={`#${story.category.toLowerCase()}`} className="mb-4 block aspect-[16/10] overflow-hidden bg-[#ddd]"><img src={story.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></a><p className="text-[9px] font-bold tracking-[0.15em] text-honey">{story.category}</p><h3 className="mt-2 font-serif text-[26px] font-medium leading-[1.03] tracking-[-0.03em] group-hover:text-honey">{story.title}</h3><p className="mt-2 text-[13px] leading-5 text-soft">{story.excerpt}</p><p className="mt-3 text-[9px] uppercase tracking-[0.1em] text-soft">{story.meta}</p></article>)}
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-[#111111] px-5 py-8 text-white/50"><div className="mx-auto flex max-w-[1440px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><span className="font-serif text-xl text-white">BitBuzz</span><p className="text-[10px] uppercase tracking-[0.12em]">© 2026 BitBuzz · News for students, by students.</p></div></footer>
    </div>
  );
}
