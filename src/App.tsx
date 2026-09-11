import { useEffect, useState } from "react";
import { applyTheme, getInitialTheme } from "./lib/theme";

const LOGO_URL =
  "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";
const HERO_GIF =
  "https://cdn.hackclub.com/01a0909a-4a98-7483-8658-3438faa0f2e0/a500cea59963d3187152da4b1b5d2981.gif";

const genres = [
  { label: "Space", slug: "space" },
  { label: "Cybersecurity", slug: "cybersecurity" },
  { label: "Tech", slug: "tech" },
  { label: "Aviation", slug: "aviation" },
  { label: "Innovations", slug: "innovations" },
];

const stories = [
  { category: "SPACE", title: "The new space race is being built by students too", excerpt: "From reusable rockets to autonomous rovers, the next generation is moving from watching space to actually building for it.", meta: "6 min read · Feature", image: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=1400&q=85" },
  { category: "CYBERSECURITY", title: "Your school account is a bigger target than you think", excerpt: "Why student accounts are valuable to attackers—and the simple habits that make phishing dramatically harder to pull off.", meta: "4 min read · Explainer", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1000&q=85" },
  { category: "TECH", title: "AI is getting smaller, faster and much closer to your laptop", excerpt: "The interesting AI story isn't only giant models. Smaller systems are making powerful features possible without sending everything to the cloud.", meta: "5 min read · Technology", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85" },
  { category: "AVIATION", title: "What comes after the age of bigger airplanes?", excerpt: "Electric propulsion, efficient aircraft and new approaches to short-haul travel are reshaping what the next aircraft could look like.", meta: "7 min read · Aviation", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1000&q=85" },
  { category: "INNOVATIONS", title: "The best inventions don't always look like inventions", excerpt: "A look at the deceptively simple ideas turning into serious solutions in classrooms, labs and garages around the world.", meta: "5 min read · Ideas", image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1000&q=85" },
];

function Icon({ name }: { name: "linkedin" | "instagram" | "youtube" | "search" | "menu" | "close" | "arrow-up-right" | "heart" }) {
  const common = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "linkedin") return <svg {...common}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
  if (name === "instagram") return <svg {...common}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></svg>;
  if (name === "youtube") return <svg {...common}><rect x="3" y="6" width="18" height="12" rx="3" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" /></svg>;
  if (name === "search") return <svg {...common}><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></svg>;
  if (name === "menu") return <svg {...common}><path d="M3 6h18M3 12h18M3 18h18" /></svg>;
  if (name === "arrow-up-right") return <svg {...common}><path d="M7 17 17 7M8 7h9v9" /></svg>;
  if (name === "heart") return <svg {...common}><path d="M20.8 8.8c0 5.2-8.8 10.1-8.8 10.1S3.2 14 3.2 8.8A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.6Z" /></svg>;
  return <svg {...common}><path d="m6 6 12 12M18 6 6 18" /></svg>;
}

const navLinks = [["About Us", "#about"], ["Flag It", "#flag-it"], ["Chanakya AI", "#chanakya-ai"], ["Tool Box", "#tool-box"]] as const;

type Headline = { title: string; url: string; source: string; breaking: boolean };

function BreakingTicker() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/news");
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data)) setHeadlines(data);
      } catch {
        // Keep the ticker hidden when the feed is unavailable.
      }
    };
    load();
  }, []);

  if (!headlines.length) return null;
  const items = [...headlines, ...headlines];
  return <div className="overflow-hidden border-b border-white/10 bg-black text-white"><div className="flex h-11 items-center"><span className="z-10 flex h-full shrink-0 items-center gap-2 border-r border-white/10 bg-black px-4 text-[10px] font-bold tracking-[0.14em]"><span className="h-1.5 w-1.5 rounded-full bg-green-400" /> LIVE</span><div className="min-w-0 flex-1 overflow-hidden"><div className="bitbuzz-ticker flex w-max items-center gap-10 whitespace-nowrap" style={{ animationPlayState: paused ? "paused" : "running" }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>{items.map((headline, index) => <a key={`${headline.title}-${index}`} href={headline.url} target="_blank" rel="noreferrer" className="text-[11px] text-white/65 transition hover:text-white"><span className="mr-2 text-honey">{headline.source}</span>{headline.title}</a>)}</div></div></div></div>;
}

function App() {
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme());
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);

  useEffect(() => { applyTheme(theme); }, [theme]);

  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");
  const closeMenu = () => { setMenuOpen(false); setExploreOpen(false); };

  return (
    <div className="min-h-[100dvh] bg-black text-ink">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Skip to main content</a>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-[58px] max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <div className="hidden shrink-0 items-center gap-4 2xl:flex"><div className="flex items-center gap-3 border-r border-white/15 pr-5"><a href="https://www.linkedin.com/company/bitbuzzspace/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-white/55 transition hover:text-white"><Icon name="linkedin" /></a><a href="https://www.instagram.com/bitbuzz_CLUB/" target="_blank" rel="noreferrer" aria-label="Instagram" className="text-white/55 transition hover:text-white"><Icon name="instagram" /></a><a href="https://www.youtube.com/@Bitbuzz-club" target="_blank" rel="noreferrer" aria-label="YouTube" className="text-white/55 transition hover:text-white"><Icon name="youtube" /></a></div><span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.08em] text-white/45">{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}</span></div>
          <button type="button" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white 2xl:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen}><Icon name="menu" /></button>
          <a href="/home" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 rounded-full px-2 py-1.5 transition hover:bg-white/5" aria-label="BitBuzz Home"><img src={LOGO_URL} alt="BitBuzz" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" /><span className="font-serif text-[21px] font-semibold tracking-[-0.04em]">BitBuzz</span></a>
          <nav className="ml-auto hidden items-center gap-1 2xl:flex" aria-label="Main navigation"><a href="/home" className="relative rounded-lg px-3 py-3 text-[13px] text-white transition hover:bg-white/5 after:absolute after:bottom-1 after:left-1/2 after:h-0.5 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-honey" aria-current="page">Home</a><div className="relative"><button type="button" onClick={() => setExploreOpen((open) => !open)} className="flex items-center gap-1 rounded-lg px-3 py-3 text-[13px] text-white/65 transition hover:bg-white/5 hover:text-white" aria-expanded={exploreOpen} aria-haspopup="true">Explore <span className={`text-[9px] transition-transform ${exploreOpen ? "rotate-180" : ""}`}>▼</span></button>{exploreOpen && <div className="absolute right-0 top-[calc(100%+7px)] w-56 rounded-xl border border-white/10 bg-black p-2 shadow-2xl backdrop-blur-xl">{genres.map((genre) => <a key={genre.slug} href={`/home#${genre.slug}`} onClick={() => setExploreOpen(false)} className="block rounded-lg px-3 py-2.5 text-[13px] text-white/70 transition hover:bg-white/5 hover:text-honey">{genre.label}</a>)}</div>}</div>{navLinks.map(([label, href]) => <a key={label} href={href} className="rounded-lg px-3 py-3 text-[13px] text-white/65 transition hover:bg-white/5 hover:text-white">{label}</a>)}<div className="ml-2 flex items-center gap-2 border-l border-white/15 pl-4"><button type="button" aria-label="Search" className="flex h-10 w-10 items-center justify-center rounded-full text-white/60 transition hover:bg-white/5 hover:text-white"><Icon name="search" /></button><button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-full text-[17px] text-white/70 transition hover:bg-white/5 hover:text-honey">{theme === "dark" ? "☀" : "☾"}</button><a href="/submit" className="ml-1 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-black transition hover:bg-honey hover:text-black">Submit</a></div></nav>
          <div className="ml-auto flex items-center gap-1 2xl:hidden"><button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-full text-[17px] text-white/75 transition hover:bg-white/10">{theme === "dark" ? "☀" : "☾"}</button><a href="/submit" className="rounded-full bg-white px-4 py-2.5 text-[12px] font-bold text-black transition hover:bg-honey">Submit</a></div>
        </div>
      </header>

      <BreakingTicker />

      {menuOpen && <div className="fixed inset-0 z-[90] overflow-y-auto bg-black text-white 2xl:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation"><div className="sticky top-0 flex h-[58px] items-center justify-between border-b border-white/10 bg-black/95 px-4 backdrop-blur-xl sm:px-6"><a href="/home" className="flex items-center gap-2.5" onClick={closeMenu}><img src={LOGO_URL} alt="BitBuzz" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" /><span className="font-serif text-[21px] font-semibold tracking-[-0.04em]">BitBuzz</span></a><button type="button" onClick={closeMenu} className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Close menu"><Icon name="close" /></button></div><nav className="mx-auto max-w-xl px-5 py-8 sm:px-8" aria-label="Mobile navigation"><a href="/home" onClick={closeMenu} className="block rounded-xl border-l-2 border-honey bg-white/[0.03] px-4 py-3.5 text-[16px] font-semibold text-honey">Home</a><p className="mt-8 px-4 pb-2 text-[10px] font-bold tracking-[0.18em] text-white/35">EXPLORE</p>{genres.map((genre) => <a key={genre.slug} href={`/home#${genre.slug}`} onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[15px] text-white/70 transition hover:bg-white/5 hover:text-white">{genre.label}</a>)}<div className="my-6 border-t border-white/10" />{navLinks.map(([label, href]) => <a key={label} href={href} onClick={closeMenu} className="block rounded-xl px-4 py-3 text-[15px] text-white/70 transition hover:bg-white/5 hover:text-white">{label}</a>)}<a href="/submit" onClick={closeMenu} className="mt-5 block rounded-full bg-white px-5 py-3 text-center text-[13px] font-bold text-black transition hover:bg-honey">Submit an Article</a><div className="mt-8 flex flex-wrap items-center gap-5 border-t border-white/10 px-4 pt-5 text-white/45"><a href="https://www.linkedin.com/company/bitbuzzspace/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Icon name="linkedin" /></a><a href="https://www.instagram.com/bitbuzz_CLUB/" target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="instagram" /></a><a href="https://www.youtube.com/@Bitbuzz-club" target="_blank" rel="noreferrer" aria-label="YouTube"><Icon name="youtube" /></a><span className="text-[10px] uppercase tracking-[0.08em]">{new Date().toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase()}</span></div></nav></div>}

      <main id="main-content" className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-8">
        <section className="relative isolate min-h-[460px] overflow-hidden border-b border-line py-8 sm:min-h-[500px] sm:py-10 lg:min-h-[540px] lg:py-12">
          <img src={HERO_GIF} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 z-[-2] h-full w-full object-cover opacity-55 mix-blend-screen" />
          <div className="pointer-events-none absolute inset-0 z-[-1] bg-[linear-gradient(90deg,#000000_0%,rgba(0,0,0,.84)_30%,rgba(0,0,0,.54)_62%,rgba(0,0,0,.68)_100%)]" />
          <div className="pointer-events-none absolute inset-0 z-[-1] bg-[radial-gradient(circle_at_78%_50%,rgba(93,152,255,.18),transparent_38%)]" />
          <div className="relative z-10 max-w-5xl pt-5 sm:pt-7 lg:pt-9">
            <div className="mb-4 flex items-center gap-3 text-[11px] font-bold tracking-[0.14em] text-honey"><span className="h-2 w-2 rounded-full bg-honey" /> THE STUDENT NEWSROOM</div>
            <h1 className="font-serif text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.055em]">News worth<br /><em className="font-normal">knowing.</em></h1>
            <p className="mt-5 max-w-2xl text-[clamp(1rem,1.35vw,1.15rem)] leading-[1.5] text-soft">Science, technology and the ideas shaping tomorrow — reported for students, by students.</p>
          </div>
        </section>
        <section className="border-b border-line py-6" aria-label="Genres"><div className="flex flex-wrap gap-2">{genres.map((genre) => <a id={genre.slug} key={genre.slug} href={`/home#${genre.slug}`} className="rounded-full border border-line px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] transition hover:border-honey hover:text-honey">{genre.label}</a>)}</div></section>
        <section className="py-12 sm:py-16"><div className="mb-8 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold tracking-[0.16em] text-honey">FEATURED</p><h2 className="mt-2 font-serif text-step-4 font-medium">Stories worth your time.</h2></div></div><div className="grid gap-5 lg:grid-cols-2">{stories.slice(0, 2).map((story) => <article key={story.title} className="group overflow-hidden rounded-2xl border border-line bg-paper"><div className="aspect-[16/9] overflow-hidden bg-black/5"><img src={story.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" /></div><div className="p-6 sm:p-8"><p className="text-[10px] font-bold tracking-[0.15em] text-honey">{story.category}</p><h3 className="mt-3 font-serif text-step-3 font-medium leading-tight">{story.title}</h3><p className="mt-4 max-w-2xl text-step--1 leading-relaxed text-soft">{story.excerpt}</p><p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.1em] text-soft">{story.meta}</p></div></article>)}</div></section>
        <section className="border-t border-line py-12 sm:py-16"><div className="mb-8"><p className="text-[10px] font-bold tracking-[0.16em] text-honey">MORE TO EXPLORE</p><h2 className="mt-2 font-serif text-step-4 font-medium">Go deeper.</h2></div><div className="grid gap-x-8 gap-y-10 md:grid-cols-3">{stories.slice(2).map((story) => <article key={story.title} className="group"><div className="aspect-[16/10] overflow-hidden rounded-xl bg-black/5"><img src={story.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" /></div><p className="mt-5 text-[10px] font-bold tracking-[0.15em] text-honey">{story.category}</p><h3 className="mt-2 font-serif text-step-2 font-medium leading-tight">{story.title}</h3><p className="mt-3 text-step--1 leading-relaxed text-soft">{story.excerpt}</p></article>)}</div></section>
      </main>

      <footer className="bg-black px-4 py-14 text-white sm:px-6 lg:px-8"><div className="mx-auto max-w-[1440px]"><div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.5fr_repeat(3,1fr)]"><div><div className="flex items-center gap-3"><img src={LOGO_URL} alt="BitBuzz" className="h-9 w-9 rounded-full object-cover" /><span className="font-serif text-2xl font-semibold">BitBuzz</span></div><p className="mt-5 max-w-sm text-sm leading-relaxed text-white/50">News, ideas and opportunities worth knowing, built for the next generation.</p><a href="/submit" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-honey">Submit an article <Icon name="arrow-up-right" /></a></div><div><h3 className="text-[10px] font-bold tracking-[0.15em] text-white/35">EXPLORE</h3><div className="mt-5 grid gap-3 text-sm text-white/60">{genres.map((genre) => <a key={genre.slug} href={`/home#${genre.slug}`} className="transition hover:text-white">{genre.label}</a>)}</div></div><div><h3 className="text-[10px] font-bold tracking-[0.15em] text-white/35">PLATFORM</h3><div className="mt-5 grid gap-3 text-sm text-white/60">{navLinks.map(([label, href]) => <a key={label} href={href} className="transition hover:text-white">{label}</a>)}</div></div><div><h3 className="text-[10px] font-bold tracking-[0.15em] text-white/35">FOLLOW</h3><div className="mt-5 flex gap-4 text-white/60"><a href="https://www.linkedin.com/company/bitbuzzspace/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="transition hover:text-white"><Icon name="linkedin" /></a><a href="https://www.instagram.com/bitbuzz_CLUB/" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition hover:text-white"><Icon name="instagram" /></a><a href="https://www.youtube.com/@Bitbuzz-club" target="_blank" rel="noreferrer" aria-label="YouTube" className="transition hover:text-white"><Icon name="youtube" /></a></div></div></div><div className="flex flex-col gap-3 pt-7 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} BitBuzz · All rights reserved.</p><p>News for students, by students.</p><p className="inline-flex items-center gap-1.5">Made with <span className="inline-flex text-honey"><Icon name="heart" /></span> by Hridhaan and The BitBuzz Squad</p></div></div></footer>
    </div>
  );
}

export default App;
