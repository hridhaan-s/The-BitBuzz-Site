import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";

const SHOWCASE_GIF =
  "https://cdn.hackclub.com/01a09276-4d33-7dd7-8a3d-5645b3673a22/white_modern_business_startup_pitch_deck_presentation__3_.gif?v=2";
const LOGO_IMAGE =
  "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";
const NEWSROOM_URL = "/home";

/* ──────────────────────────────────────────────────────────────
   Palette. Every colour on the page resolves from these five
   values via CSS custom properties, so a rebrand is a one-line
   change. `mid` is the only saturated colour on the page and it
   is spent in exactly three places: the Flag It marker, the live
   dot, and focus rings. Restraint is the point.
   ────────────────────────────────────────────────────────────── */
const ACCENT = {
  light: "#ffc48f",
  mid: "#ff7a3d",
  pale: "#ffe2c9",
  glowA: "rgba(255,122,61,.17)",
  glowB: "rgba(255,158,92,.14)",
};

const NAV_LINKS = [
  { href: NEWSROOM_URL, label: "Home" },
  { href: "/explore", label: "Explore" },
  { href: "/categories", label: "Categories" },
  { href: "/opportunities", label: "Opportunities" },
  { href: "/about", label: "About" },
];

const BEATS = [
  { name: "Science", line: "What the research actually found, minus the press release." },
  { name: "Technology", line: "Launches, tools, and the fine print underneath them." },
  { name: "Cybersecurity", line: "Breaches, scams, and how they reached ordinary people." },
  { name: "Aviation", line: "Incidents, aircraft, and how flying keeps getting safer." },
  { name: "Biology", line: "Bodies, genomes, and the ideas rewriting both." },
  { name: "Innovation", line: "The builds and ideas that came out of nowhere." },
];

/* ──────────────────────────────────────────────────────────────
   Styles. Kept local to the component so the page no longer
   depends on global classes (.landing-nav-link, .landing-primary
   …) that live somewhere else and can silently drift.
   ────────────────────────────────────────────────────────────── */
const CSS = `
.bb {
  --accent: ${ACCENT.mid};
  --accent-light: ${ACCENT.light};
  --accent-pale: ${ACCENT.pale};
  --glow-a: ${ACCENT.glowA};
  --glow-b: ${ACCENT.glowB};
  --ease: cubic-bezier(.22,1,.36,1);
  --line: rgba(255,255,255,.11);
  --ink-2: rgba(255,255,255,.72);
  --ink-3: rgba(255,255,255,.46);
  background: #000;
  color: #fff;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.bb-display {
  font-family: ui-serif, "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif;
  font-weight: 500;
  letter-spacing: -.045em;
}

.bb-num { font-variant-numeric: tabular-nums; letter-spacing: -.03em; }

/* Focus is the one place the accent is allowed to shout. */
.bb :focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 6px;
}

/* ── Navigation ─────────────────────────────────────────────── */
.bb-nav {
  position: fixed; inset: 0 0 auto 0; z-index: 60;
  border-bottom: 1px solid transparent;
  transition: background-color .45s var(--ease), border-color .45s var(--ease), backdrop-filter .45s var(--ease);
}
.bb-nav[data-stuck="true"] {
  background: rgba(0,0,0,.62);
  border-bottom-color: var(--line);
  backdrop-filter: saturate(180%) blur(18px);
  -webkit-backdrop-filter: saturate(180%) blur(18px);
}
.bb-navlink {
  position: relative; display: inline-flex; align-items: center;
  padding: .5rem .85rem; font-size: .875rem; color: var(--ink-2);
  transition: color .25s var(--ease);
}
.bb-navlink:hover { color: #fff; }
.bb-navlink::after {
  content: ""; position: absolute; left: .85rem; right: .85rem; bottom: .18rem;
  height: 1px; background: currentColor; transform: scaleX(0); transform-origin: left;
  transition: transform .4s var(--ease);
}
.bb-navlink:hover::after, .bb-navlink[aria-current="page"]::after { transform: scaleX(1); }
.bb-navlink[aria-current="page"] { color: #fff; }

/* ── Buttons ────────────────────────────────────────────────── */
.bb-btn {
  display: inline-flex; align-items: center; gap: .5rem;
  border-radius: 999px; font-size: .9rem; font-weight: 560;
  padding: .72rem 1.3rem; line-height: 1;
  transition: transform .35s var(--ease), background-color .3s var(--ease), color .3s var(--ease), border-color .3s var(--ease), opacity .3s var(--ease);
}
.bb-btn:active { transform: scale(.97); }
.bb-solid { background: #fff; color: #000; }
.bb-solid:hover { background: var(--accent-pale); }
.bb-ghost { border: 1px solid var(--line); color: #fff; }
.bb-ghost:hover { border-color: rgba(255,255,255,.34); background: rgba(255,255,255,.04); }
.bb-lg { padding: .95rem 1.6rem; font-size: .98rem; }
.bb-icon {
  display: inline-flex; align-items: center; justify-content: center;
  height: 2.35rem; width: 2.35rem; border-radius: 999px;
  border: 1px solid var(--line); color: var(--ink-2);
  transition: color .3s var(--ease), border-color .3s var(--ease);
}
.bb-icon:hover { color: #fff; border-color: rgba(255,255,255,.34); }
.bb-btn[disabled] { opacity: .55; cursor: wait; }

/* ── Hero load sequence: the one orchestrated motion moment ─── */
@keyframes bb-rise { from { opacity: 0; transform: translate3d(0,22px,0); } to { opacity: 1; transform: none; } }
.bb-rise { opacity: 0; animation: bb-rise .95s var(--ease) forwards; }

@keyframes bb-pulse { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
.bb-dot { animation: bb-pulse 2.6s ease-in-out infinite; }

/* ── Scroll reveal: used twice on the whole page, nowhere else ─ */
.bb-reveal { opacity: 0; transform: translate3d(0,26px,0) scale(.985); transition: opacity 1s var(--ease), transform 1.1s var(--ease); }
.bb-reveal[data-shown="true"] { opacity: 1; transform: none; }

/* ── Editorial beat list ────────────────────────────────────── */
.bb-beat { border-top: 1px solid var(--line); }
.bb-beat:last-child { border-bottom: 1px solid var(--line); }

/* ── Fields ─────────────────────────────────────────────────── */
.bb-field {
  width: 100%; border-radius: .8rem; border: 1px solid var(--line);
  background: rgba(255,255,255,.05); padding: .85rem 1rem; font-size: .9rem;
  color: #fff; outline: none; transition: border-color .3s var(--ease), background-color .3s var(--ease);
}
.bb-field::placeholder { color: rgba(255,255,255,.3); }
.bb-field:focus { border-color: var(--accent); background: rgba(255,255,255,.07); }

/* ── Overlays ───────────────────────────────────────────────── */
@keyframes bb-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes bb-sheet { from { opacity: 0; transform: translate3d(0,18px,0) scale(.97); } to { opacity: 1; transform: none; } }
.bb-fade { animation: bb-fade .3s var(--ease) forwards; }
.bb-sheet { animation: bb-sheet .5s var(--ease) forwards; }

@media (prefers-reduced-motion: reduce) {
  .bb *, .bb *::before, .bb *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
  .bb-rise, .bb-reveal { opacity: 1 !important; transform: none !important; }
}
`;

/* ── Icons ──────────────────────────────────────────────────── */
function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 5 5" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M4 8h16M4 16h16" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

/* ── Hooks ──────────────────────────────────────────────────── */
function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, shown };
}

/** Locks page scroll and wires Escape while an overlay is open. */
function useOverlay(open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const stuck = useScrolled();
  const showcase = useReveal<HTMLDivElement>();
  const flagIt = useReveal<HTMLDivElement>();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const openLogin = useCallback(() => {
    lastFocused.current = document.activeElement as HTMLElement;
    setError("");
    setMenuOpen(false);
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    if (loading) return;
    setLoginOpen(false);
    lastFocused.current?.focus();
  }, [loading]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useOverlay(loginOpen, closeLogin);
  useOverlay(menuOpen, closeMenu);

  useEffect(() => {
    if (loginOpen) emailRef.current?.focus();
  }, [loginOpen]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    window.location.href = NEWSROOM_URL;
  };

  return (
    <div className="bb min-h-screen">
      <style>{CSS}</style>

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>

      {/* ── Navigation ─────────────────────────────────────── */}
      <header className="bb-nav" data-stuck={stuck}>
        <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex shrink-0 items-center gap-2.5" aria-label="BitBuzz home">
            <img src={LOGO_IMAGE} alt="" className="h-8 w-8 rounded-full object-cover" />
            <span className="bb-display text-[1.15rem]">BitBuzz</span>
          </a>

          <nav className="hidden items-center lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="bb-navlink"
                aria-current={link.href === NEWSROOM_URL ? "page" : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button type="button" aria-label="Search BitBuzz" className="bb-icon">
              <SearchIcon />
            </button>
            <button type="button" onClick={openLogin} className="bb-btn bb-ghost">
              Log in
            </button>
            <a href={NEWSROOM_URL} className="bb-btn bb-solid">
              Read the newsroom
            </a>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="bb-icon lg:hidden"
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <main id="main">
        {/* ── Hero ─────────────────────────────────────────── */}
        <section id="top" className="relative overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(ellipse 70% 55% at 18% 30%, ${ACCENT.glowA}, transparent 70%), radial-gradient(ellipse 55% 45% at 82% 58%, ${ACCENT.glowB}, transparent 70%)`,
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-black" />

          <div className="relative mx-auto max-w-[1240px] px-5 pb-20 pt-[136px] sm:pb-24 lg:px-8 lg:pb-32 lg:pt-[180px]">
            <p
              className="bb-rise flex items-center gap-2.5 text-[.82rem] text-[var(--ink-3)]"
              style={{ animationDelay: "60ms" }}
            >
              <span
                className="bb-dot h-[7px] w-[7px] rounded-full"
                style={{ background: ACCENT.mid }}
                aria-hidden="true"
              />
              Written and edited by students
            </p>

            <h1
              className="bb-rise bb-display mt-6 max-w-[15ch] text-[clamp(3.2rem,10.5vw,7.5rem)] leading-[.9]"
              style={{ animationDelay: "140ms" }}
            >
              News for a{" "}
              <span className="block" style={{ color: ACCENT.pale }}>
                brighter tomorrow.
              </span>
            </h1>

            <p
              className="bb-rise mt-8 max-w-[56ch] text-[clamp(1.02rem,1.35vw,1.2rem)] leading-[1.62] text-[var(--ink-2)]"
              style={{ animationDelay: "240ms" }}
            >
              BitBuzz covers science, technology, cybersecurity, aviation, biology and innovation
              for people who want the story underneath the headline. No newsroom of adults. Just
              curious minds writing for other curious minds.
            </p>

            <div
              className="bb-rise mt-10 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "330ms" }}
            >
              <a href={NEWSROOM_URL} className="bb-btn bb-solid bb-lg">
                Read the newsroom <Arrow />
              </a>
              <a href="/about" className="bb-btn bb-ghost bb-lg">
                How BitBuzz works
              </a>
            </div>

            <dl
              className="bb-rise mt-16 grid max-w-[640px] grid-cols-3 gap-x-4 border-t border-[var(--line)] pt-8"
              style={{ animationDelay: "430ms" }}
            >
              {[
                { value: "50K", label: "Readers so far" },
                { value: "50+", label: "Countries reached" },
                { value: "100%", label: "Student written" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="bb-num text-[clamp(1.6rem,4.2vw,2.1rem)] font-semibold">
                    {stat.value}
                  </dd>
                  <p className="mt-1 text-[.78rem] leading-snug text-[var(--ink-3)]">{stat.label}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── The newsroom itself ──────────────────────────── */}
        <section className="px-4 pb-24 sm:px-5 lg:px-8 lg:pb-36">
          <div
            ref={showcase.ref}
            data-shown={showcase.shown}
            className="bb-reveal relative mx-auto max-w-[1080px]"
          >
            <div
              className="pointer-events-none absolute inset-x-8 -top-16 h-40 blur-3xl"
              style={{ background: ACCENT.glowA }}
            />
            <div className="relative overflow-hidden rounded-[16px] border border-[var(--line)] bg-white/[.03] sm:rounded-[22px]">
              <img
                src={SHOWCASE_GIF}
                alt="A walkthrough of the BitBuzz newsroom, showing story cards and category pages."
                loading="lazy"
                decoding="async"
                className="block h-auto w-full object-contain"
              />
            </div>
            <p className="mt-5 text-center text-[.8rem] text-[var(--ink-3)]">
              Every story lands here, sorted by beat and updated through the week.
            </p>
          </div>
        </section>

        {/* ── Flag It: the thing people actually come for ──── */}
        <section className="px-5 pb-24 lg:px-8 lg:pb-36">
          <div
            ref={flagIt.ref}
            data-shown={flagIt.shown}
            className="bb-reveal mx-auto max-w-[1080px] overflow-hidden rounded-[20px] border border-[var(--line)] sm:rounded-[26px]"
            style={{
              backgroundImage: `linear-gradient(140deg, rgba(255,122,61,.12), rgba(255,122,61,0) 58%)`,
            }}
          >
            <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14 lg:p-14">
              <div>
                <p className="flex items-center gap-2.5 text-[.82rem]" style={{ color: ACCENT.mid }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 21V4.5a.5.5 0 0 1 .3-.46C6.5 3 8.5 3.4 10.8 4.3c2.6 1 4.7 1.3 7 .5a.5.5 0 0 1 .7.47v8.2a.5.5 0 0 1-.32.47c-2.3.85-4.4.5-7-.5-2.3-.9-4.3-1.3-6.5-.34" />
                  </svg>
                  Our most read section
                </p>
                <h2 className="bb-display mt-4 text-[clamp(2.1rem,5.2vw,3.4rem)] leading-[1.02]">
                  Flag It
                </h2>
                <p className="mt-5 max-w-[46ch] text-[1.02rem] leading-[1.65] text-[var(--ink-2)]">
                  Fake internships, phishing links, giveaway cons. We take apart the scams students
                  actually run into, one at a time, and show you the tell before it costs someone
                  money.
                </p>
                <a href="/categories" className="bb-btn bb-solid mt-8">
                  Open Flag It <Arrow />
                </a>
              </div>

              <ul className="space-y-0 text-[.95rem]">
                {[
                  "Spot the fake before you click",
                  "Real cases, broken down step by step",
                  "Written in plain language, no jargon",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 border-t border-[var(--line)] py-4 last:border-b"
                  >
                    <svg className="mt-[3px] shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT.mid} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    <span className="text-[var(--ink-2)]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Beats ────────────────────────────────────────── */}
        <section className="px-5 pb-24 lg:px-8 lg:pb-36">
          <div className="mx-auto max-w-[1080px]">
            <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-16">
              <div>
                <h2 className="bb-display text-[clamp(2.1rem,5.2vw,3.2rem)] leading-[1.04]">
                  What we cover
                </h2>
                <p className="mt-5 max-w-[38ch] text-[.98rem] leading-[1.6] text-[var(--ink-3)]">
                  Six beats, chosen because they are the ones our writers keep reading about anyway.
                </p>
              </div>

              <div>
                {BEATS.map((beat) => (
                  <article
                    key={beat.name}
                    className="bb-beat grid grid-cols-[7.5rem_1fr] gap-4 py-5 sm:grid-cols-[9.5rem_1fr] sm:py-6"
                  >
                    <h3 className="bb-display text-[1.18rem] sm:text-[1.35rem]">{beat.name}</h3>
                    <p className="text-[.93rem] leading-[1.55] text-[var(--ink-3)]">{beat.line}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Join ─────────────────────────────────────────── */}
        <section className="border-t border-[var(--line)] px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-[720px] text-center">
            <h2 className="bb-display text-[clamp(2.3rem,6.2vw,4rem)] leading-[1.02]">
              Every story here was written by someone your age.
            </h2>
            <p className="mx-auto mt-6 max-w-[46ch] text-[1.02rem] leading-[1.62] text-[var(--ink-2)]">
              If you can explain something clearly, you can write for BitBuzz. No experience, no
              application fee, no gatekeeping.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a href="/opportunities" className="bb-btn bb-solid bb-lg">
                Write for BitBuzz <Arrow />
              </a>
              <button type="button" onClick={openLogin} className="bb-btn bb-ghost bb-lg">
                Log in
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-[var(--line)] px-5 py-12 lg:px-8">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Back to top">
            <img src={LOGO_IMAGE} alt="" className="h-7 w-7 rounded-full object-cover" />
            <span className="bb-display text-[1.05rem]">BitBuzz</span>
          </a>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[.85rem] text-[var(--ink-3)]" aria-label="Footer">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-white">
                {link.label}
              </a>
            ))}
          </nav>
          <p className="text-[.78rem] text-[var(--ink-3)]">
            © {new Date().getFullYear()} BitBuzz. Student run.
          </p>
        </div>
      </footer>

      {/* ── Mobile menu ────────────────────────────────────── */}
      {menuOpen && (
        <div className="bb-fade fixed inset-0 z-[100] bg-black px-5 py-5 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2.5">
              <img src={LOGO_IMAGE} alt="" className="h-8 w-8 rounded-full object-cover" />
              <span className="bb-display text-[1.15rem]">BitBuzz</span>
            </span>
            <button type="button" onClick={closeMenu} className="bb-icon" aria-label="Close menu" autoFocus>
              <CloseIcon />
            </button>
          </div>

          <nav className="mt-12" aria-label="Mobile">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="bb-rise bb-display block border-b border-[var(--line)] py-5 text-[1.9rem]"
                style={{ animationDelay: `${60 + index * 45}ms` }}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="bb-rise mt-9 flex flex-col gap-3" style={{ animationDelay: "300ms" }}>
            <a href={NEWSROOM_URL} className="bb-btn bb-solid bb-lg justify-center">
              Read the newsroom <Arrow />
            </a>
            <button type="button" onClick={openLogin} className="bb-btn bb-ghost bb-lg justify-center">
              Log in
            </button>
          </div>
        </div>
      )}

      {/* ── Login ──────────────────────────────────────────── */}
      {loginOpen && (
        <div
          className="bb-fade fixed inset-0 z-[110] flex items-end justify-center bg-black/75 px-4 pb-4 backdrop-blur-md sm:items-center sm:p-5"
          onMouseDown={closeLogin}
        >
          <div
            className="bb-sheet w-full max-w-[420px] rounded-[24px] border border-[var(--line)] bg-[#0a0a0a] p-7 shadow-2xl sm:p-9"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bb-login-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="bb-login-title" className="bb-display text-[2.1rem] leading-none">
                  Welcome back.
                </h2>
                <p className="mt-3 text-[.86rem] text-[var(--ink-3)]">
                  Sign in to write, edit and publish.
                </p>
              </div>
              <button type="button" onClick={closeLogin} className="bb-icon shrink-0" aria-label="Close">
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={login} className="mt-8 space-y-4">
              <div>
                <label htmlFor="bb-email" className="block text-[.78rem] text-[var(--ink-3)]">
                  Email
                </label>
                <input
                  id="bb-email"
                  ref={emailRef}
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="bb-field mt-2"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="bb-password" className="block text-[.78rem] text-[var(--ink-3)]">
                  Password
                </label>
                <input
                  id="bb-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="bb-field mt-2"
                  placeholder="Your password"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-[.8rem] text-red-200">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading} className="bb-btn bb-solid bb-lg w-full justify-center">
                {loading ? "Signing in…" : "Sign in"}
                {!loading && <Arrow />}
              </button>
            </form>

            <p className="mt-6 text-center text-[.72rem] text-[var(--ink-3)]">
              Accounts are handled securely through BitBuzz authentication.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
