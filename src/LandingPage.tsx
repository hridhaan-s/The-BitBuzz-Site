import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";

const SHOWCASE_GIF =
  "https://cdn.hackclub.com/01a09276-4d33-7dd7-8a3d-5645b3673a22/white_modern_business_startup_pitch_deck_presentation__3_.gif?v=2";
const LOGO_IMAGE =
  "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";
const NEWSROOM_URL = "/home";

/* ──────────────────────────────────────────────────────────────
   Palette. True OLED black. No coloured washes anywhere — the
   only light on this page is white specular glare, the way an
   Apple product page lights a device.

   The ember accent is still the brand colour, but it is now
   spent in exactly four places: the live dot, the Flag It
   marker, the list checkmarks, and focus rings.
   ────────────────────────────────────────────────────────────── */
const ACCENT = {
  light: "#ffc48f",
  mid: "#ff7a3d",
  pale: "#ffe2c9",
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

const PILLARS = [
  {
    title: "Written by students, start to finish.",
    body: "No adult newsroom rewriting the copy. Reporters, editors and designers are all students, which is also why the writing sounds like a person instead of a press release.",
  },
  {
    title: "Every claim traces back to a source.",
    body: "Stories link out to the paper, the filing, or the advisory they came from. If we can't point at where something came from, it doesn't run.",
  },
  {
    title: "Free to read. No paywall, ever.",
    body: "The whole archive is open. No subscription, no account needed to read, no counting how many articles you have left this month.",
  },
  {
    title: "Open to any student who can write.",
    body: "Pitch a story, get an editor, get published. No experience required and no fee to join.",
  },
];

const FAQ = [
  {
    q: "Who writes BitBuzz?",
    a: "Students. Every article is reported, written and edited by students, then checked by an editor before it publishes.",
  },
  {
    q: "What is Flag It?",
    a: "Our scam watch section. We break down fake internships, phishing links and giveaway cons that target students, and show you the tell before it costs someone money.",
  },
  {
    q: "Does it cost anything to read?",
    a: "No. Everything on BitBuzz is free and always will be. You only need an account if you write for us.",
  },
  {
    q: "How do I write for BitBuzz?",
    a: "Head to the Opportunities page and send a pitch. You do not need published work or a portfolio. If you can explain something clearly, that is the bar.",
  },
];

/* ──────────────────────────────────────────────────────────────
   Styles. Scoped under .bb so the page has no dependency on
   global classes that can drift.

   NOTE on the bug in your screenshot: `.bb-icon` sets
   display:inline-flex and Tailwind's `lg:hidden` sets
   display:none. Same specificity, so whichever stylesheet loads
   last wins — this <style> block does, which is why the
   hamburger was showing on desktop next to the full nav. Fixed
   with the explicit .bb-only-mobile / .bb-only-desktop rules at
   the bottom of this sheet.
   ────────────────────────────────────────────────────────────── */
const CSS = `
.bb {
  --accent: ${ACCENT.mid};
  --accent-pale: ${ACCENT.pale};
  --ease: cubic-bezier(.22,1,.36,1);
  --line: rgba(255,255,255,.1);
  --line-strong: rgba(255,255,255,.18);
  --surface: rgba(255,255,255,.035);
  --ink-2: rgba(255,255,255,.7);
  --ink-3: rgba(255,255,255,.44);
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

.bb :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 8px; }

/* ── Navigation ─────────────────────────────────────────────── */
.bb-nav {
  position: fixed; inset: 0 0 auto 0; z-index: 60;
  border-bottom: 1px solid transparent;
  transition: background-color .5s var(--ease), border-color .5s var(--ease);
}
.bb-nav[data-stuck="true"] {
  background: rgba(0,0,0,.72);
  border-bottom-color: var(--line);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}
.bb-navlink {
  position: relative; padding: .5rem .8rem; font-size: .875rem;
  color: var(--ink-2); transition: color .25s var(--ease);
}
.bb-navlink:hover { color: #fff; }
.bb-navlink::after {
  content: ""; position: absolute; left: .8rem; right: .8rem; bottom: .15rem; height: 1px;
  background: currentColor; transform: scaleX(0); transform-origin: left;
  transition: transform .4s var(--ease);
}
.bb-navlink:hover::after, .bb-navlink[aria-current="page"]::after { transform: scaleX(1); }
.bb-navlink[aria-current="page"] { color: #fff; }

/* ── Controls ───────────────────────────────────────────────── */
.bb-btn {
  align-items: center; gap: .5rem; border-radius: 999px;
  font-size: .875rem; font-weight: 560; padding: .68rem 1.25rem; line-height: 1;
  transition: transform .35s var(--ease), background-color .3s var(--ease),
              border-color .3s var(--ease), opacity .3s var(--ease);
}
.bb-btn:active { transform: scale(.97); }
.bb-solid { background: #fff; color: #000; }
.bb-solid:hover { background: var(--accent-pale); }
.bb-ghost { border: 1px solid var(--line-strong); color: #fff; }
.bb-ghost:hover { border-color: rgba(255,255,255,.4); background: rgba(255,255,255,.05); }
.bb-quiet { color: var(--ink-2); padding-inline: .9rem; }
.bb-quiet:hover { color: #fff; }
.bb-lg { padding: .92rem 1.6rem; font-size: .96rem; }
.bb-icon {
  align-items: center; justify-content: center;
  height: 2.3rem; width: 2.3rem; border-radius: 999px;
  border: 1px solid var(--line); color: var(--ink-2);
  transition: color .3s var(--ease), border-color .3s var(--ease);
}
.bb-icon:hover { color: #fff; border-color: var(--line-strong); }
.bb-btn[disabled] { opacity: .55; cursor: wait; }

/* ── The one page-load sequence ─────────────────────────────── */
@keyframes bb-rise { from { opacity: 0; transform: translate3d(0,20px,0); } to { opacity: 1; transform: none; } }
.bb-rise { opacity: 0; animation: bb-rise .9s var(--ease) forwards; }
@keyframes bb-pulse { 0%,100% { opacity: 1; } 50% { opacity: .28; } }
.bb-dot { animation: bb-pulse 2.6s ease-in-out infinite; }

/* ── Scroll reveal. Used on two elements. Not on every section. ─ */
.bb-reveal { opacity: 0; transform: translate3d(0,28px,0) scale(.985); transition: opacity 1s var(--ease), transform 1.1s var(--ease); }
.bb-reveal[data-shown="true"] { opacity: 1; transform: none; }

/* ── Specular glare. This replaces every coloured glow. ─────── */
.bb-glare {
  position: absolute; left: 50%; transform: translateX(-50%);
  pointer-events: none; z-index: 0;
  background: radial-gradient(ellipse at 50% 100%,
              rgba(255,255,255,.20) 0%,
              rgba(255,255,255,.07) 38%,
              rgba(255,255,255,0) 72%);
  filter: blur(22px);
}

/* A lit panel: hairline highlight along the top edge, the way
   light catches the bezel of a device on an Apple page. */
.bb-pane {
  position: relative; overflow: hidden;
  border: 1px solid var(--line);
  background: var(--surface);
}
.bb-pane::before {
  content: ""; position: absolute; inset: 0 0 auto 0; height: 1px; z-index: 2;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.6) 22%, rgba(255,255,255,.6) 78%, transparent);
}
.bb-pane::after {
  content: ""; position: absolute; inset: 0 0 auto 0; height: 45%; z-index: 1;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,0));
}

/* ── FAQ ────────────────────────────────────────────────────── */
.bb-faq { border-bottom: 1px solid var(--line); }
.bb-faq summary {
  display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
  cursor: pointer; list-style: none; padding: 1.4rem 0;
  font-size: 1.02rem; transition: color .25s var(--ease);
}
.bb-faq summary::-webkit-details-marker { display: none; }
.bb-faq summary:hover { color: var(--accent-pale); }
.bb-faq .bb-plus { position: relative; flex: 0 0 15px; height: 15px; }
.bb-faq .bb-plus::before, .bb-faq .bb-plus::after {
  content: ""; position: absolute; inset: 50% 0 auto 0; height: 1.5px;
  background: currentColor; border-radius: 2px; transition: transform .35s var(--ease);
}
.bb-faq .bb-plus::after { transform: rotate(90deg); }
.bb-faq[open] .bb-plus::after { transform: rotate(0deg); }
.bb-faq p { padding-bottom: 1.4rem; }

/* ── Fields ─────────────────────────────────────────────────── */
.bb-field {
  width: 100%; border-radius: .8rem; border: 1px solid var(--line);
  background: rgba(255,255,255,.05); padding: .85rem 1rem; font-size: .9rem;
  color: #fff; outline: none;
  transition: border-color .3s var(--ease), background-color .3s var(--ease);
}
.bb-field::placeholder { color: rgba(255,255,255,.28); }
.bb-field:focus { border-color: var(--accent); background: rgba(255,255,255,.07); }

/* ── Overlays ───────────────────────────────────────────────── */
@keyframes bb-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes bb-sheet { from { opacity: 0; transform: translate3d(0,18px,0) scale(.97); } to { opacity: 1; transform: none; } }
.bb-fade { animation: bb-fade .28s var(--ease) forwards; }
.bb-sheet { animation: bb-sheet .5s var(--ease) forwards; }

@media (prefers-reduced-motion: reduce) {
  .bb *, .bb *::before, .bb *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
  .bb-rise, .bb-reveal { opacity: 1 !important; transform: none !important; }
}

/* ── Visibility. Declared last so it always beats the display
   values set by .bb-btn / .bb-icon above. ──────────────────── */
.bb-btn, .bb-icon, .bb-navlink { display: inline-flex; }
.bb-only-desktop { display: none !important; }
.bb-only-mobile  { display: flex !important; }
@media (min-width: 1024px) {
  .bb-only-desktop { display: flex !important; }
  .bb-only-mobile  { display: none !important; }
}
`;

/* ── Icons ──────────────────────────────────────────────────── */
function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h13" /><path d="m13 6 6 6-6 6" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" />
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
function Check() {
  return (
    <svg className="mt-[3px] shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT.mid} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
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
    if (typeof IntersectionObserver === "undefined") { setShown(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setShown(true); observer.disconnect(); } },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
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
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
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
    setError(""); setMenuOpen(false); setLoginOpen(true);
  }, []);
  const closeLogin = useCallback(() => {
    if (loading) return;
    setLoginOpen(false);
    lastFocused.current?.focus();
  }, [loading]);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  useOverlay(loginOpen, closeLogin);
  useOverlay(menuOpen, closeMenu);
  useEffect(() => { if (loginOpen) emailRef.current?.focus(); }, [loginOpen]);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setError(""); setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    window.location.href = NEWSROOM_URL;
  };

  return (
    <div className="bb min-h-screen">
      <style>{CSS}</style>

      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black">
        Skip to content
      </a>

      {/* ── Navigation: your original layout, logo mark only ──── */}
      <header className="bb-nav" data-stuck={stuck}>
        <div className="mx-auto flex h-[70px] max-w-[1480px] items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex shrink-0 items-center" aria-label="BitBuzz home">
            <img src={LOGO_IMAGE} alt="BitBuzz" className="h-9 w-9 rounded-full object-cover object-center" />
          </a>

          <nav className="bb-only-desktop items-center gap-1" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="bb-navlink" aria-current={link.href === NEWSROOM_URL ? "page" : undefined}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="bb-only-desktop items-center gap-1.5">
            <button type="button" aria-label="Search BitBuzz" className="bb-icon">
              <SearchIcon />
            </button>
            <button type="button" onClick={openLogin} className="bb-btn bb-quiet">
              Login
            </button>
            <a href={NEWSROOM_URL} className="bb-btn bb-solid">
              Get Started <Arrow />
            </a>
          </div>

          <button type="button" onClick={() => setMenuOpen(true)} className="bb-icon bb-only-mobile" aria-label="Open menu" aria-expanded={menuOpen}>
            <MenuIcon />
          </button>
        </div>
      </header>

      <main id="main">
        {/* ── Hero: pure OLED black, centred, one glare ────────── */}
        <section id="top" className="relative overflow-hidden bg-black">
          <div className="bb-glare" style={{ top: "-190px", width: "min(1100px, 150%)", height: "560px" }} />

          <div className="relative mx-auto max-w-[980px] px-5 pb-16 pt-[140px] text-center sm:pb-20 lg:px-8 lg:pb-24 lg:pt-[190px]">
            <p className="bb-rise inline-flex items-center gap-2.5 text-[.82rem] text-[var(--ink-3)]" style={{ animationDelay: "60ms" }}>
              <span className="bb-dot h-[7px] w-[7px] rounded-full" style={{ background: ACCENT.mid }} aria-hidden="true" />
              Written and edited by students
            </p>

            <h1 className="bb-rise bb-display mx-auto mt-6 max-w-[14ch] text-[clamp(3rem,9vw,6.6rem)] leading-[.92]" style={{ animationDelay: "140ms" }}>
              News for a <span className="block" style={{ color: ACCENT.pale }}>brighter tomorrow.</span>
            </h1>

            <p className="bb-rise mx-auto mt-8 max-w-[56ch] text-[clamp(1.02rem,1.3vw,1.22rem)] leading-[1.6] text-[var(--ink-2)]" style={{ animationDelay: "240ms" }}>
              BitBuzz covers science, technology, cybersecurity, aviation, biology and innovation for
              people who want the story underneath the headline. Curious minds writing for other
              curious minds.
            </p>

            <div className="bb-rise mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "330ms" }}>
              <a href={NEWSROOM_URL} className="bb-btn bb-solid bb-lg">Read the newsroom <Arrow /></a>
              <a href="/about" className="bb-btn bb-ghost bb-lg">How BitBuzz works</a>
            </div>

            <dl className="bb-rise mx-auto mt-16 grid max-w-[620px] grid-cols-3" style={{ animationDelay: "430ms" }}>
              {[
                { value: "50K", label: "Readers so far" },
                { value: "50+", label: "Countries reached" },
                { value: "100%", label: "Student written" },
              ].map((stat, index) => (
                <div key={stat.label} className={index > 0 ? "border-l border-[var(--line)]" : ""}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd className="bb-num text-[clamp(1.55rem,4vw,2.05rem)] font-semibold">{stat.value}</dd>
                  <p className="mt-1.5 px-2 text-[.78rem] leading-snug text-[var(--ink-3)]">{stat.label}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── The newsroom, lit from above with white glare ────── */}
        <section className="px-4 pb-28 sm:px-5 lg:px-8 lg:pb-40">
          <div ref={showcase.ref} data-shown={showcase.shown} className="bb-reveal relative mx-auto max-w-[1080px]">
            <div className="bb-glare" style={{ top: "-120px", width: "min(980px, 120%)", height: "320px" }} />
            <div className="bb-pane relative rounded-[16px] sm:rounded-[22px]">
              <img
                src={SHOWCASE_GIF}
                alt="A walkthrough of the BitBuzz newsroom, showing story cards and category pages."
                loading="lazy"
                decoding="async"
                className="relative z-[1] block h-auto w-full object-contain"
              />
            </div>
            <p className="mt-5 text-center text-[.8rem] text-[var(--ink-3)]">
              Every story lands here, sorted by beat and updated through the week.
            </p>
          </div>
        </section>

        {/* ── Statement + beats ───────────────────────────────── */}
        <section className="px-5 pb-28 lg:px-8 lg:pb-40">
          <div className="mx-auto max-w-[1080px]">
            <h2 className="bb-display mx-auto max-w-[18ch] text-center text-[clamp(2.2rem,5.6vw,3.6rem)] leading-[1.04]">
              Six beats. One newsroom.
            </h2>
            <p className="mx-auto mt-6 max-w-[52ch] text-center text-[1rem] leading-[1.62] text-[var(--ink-3)]">
              We picked these because they are the subjects our writers were already reading about at
              midnight. Nothing gets covered out of obligation.
            </p>

            <div className="mx-auto mt-14 max-w-[860px]">
              {BEATS.map((beat, index) => (
                <article
                  key={beat.name}
                  className={`grid grid-cols-[7.5rem_1fr] gap-4 border-t border-[var(--line)] py-5 sm:grid-cols-[11rem_1fr] sm:py-6 ${index === BEATS.length - 1 ? "border-b" : ""}`}
                >
                  <h3 className="bb-display text-[1.18rem] sm:text-[1.4rem]">{beat.name}</h3>
                  <p className="text-[.93rem] leading-[1.55] text-[var(--ink-3)]">{beat.line}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Flag It ─────────────────────────────────────────── */}
        <section className="px-5 pb-28 lg:px-8 lg:pb-40">
          <div ref={flagIt.ref} data-shown={flagIt.shown} className="bb-reveal relative mx-auto max-w-[1080px]">
            <div className="bb-glare" style={{ top: "-100px", width: "min(900px, 115%)", height: "280px" }} />
            <div className="bb-pane rounded-[20px] sm:rounded-[28px]">
              <div className="relative z-[2] grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14 lg:p-14">
                <div>
                  <p className="flex items-center gap-2.5 text-[.82rem]" style={{ color: ACCENT.mid }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 21V4.5a.5.5 0 0 1 .3-.46C6.5 3 8.5 3.4 10.8 4.3c2.6 1 4.7 1.3 7 .5a.5.5 0 0 1 .7.47v8.2a.5.5 0 0 1-.32.47c-2.3.85-4.4.5-7-.5-2.3-.9-4.3-1.3-6.5-.34" />
                    </svg>
                    Our most read section
                  </p>
                  <h2 className="bb-display mt-4 text-[clamp(2.1rem,5.2vw,3.4rem)] leading-[1.02]">Flag It</h2>
                  <p className="mt-5 max-w-[46ch] text-[1.02rem] leading-[1.65] text-[var(--ink-2)]">
                    Fake internships, phishing links, giveaway cons. We take apart the scams students
                    actually run into, one at a time, and show you the tell before it costs someone
                    money.
                  </p>
                  <a href="/categories" className="bb-btn bb-solid mt-8">Open Flag It <Arrow /></a>
                </div>

                <ul className="text-[.95rem]">
                  {[
                    "Spot the fake before you click",
                    "Real cases, broken down step by step",
                    "Plain language, no jargon",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 border-t border-[var(--line)] py-4 last:border-b">
                      <Check />
                      <span className="text-[var(--ink-2)]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pillars ─────────────────────────────────────────── */}
        <section className="px-5 pb-28 lg:px-8 lg:pb-40">
          <div className="mx-auto max-w-[1080px]">
            <h2 className="bb-display mx-auto max-w-[20ch] text-center text-[clamp(2.2rem,5.6vw,3.6rem)] leading-[1.04]">
              A student newsroom you can actually trust.
            </h2>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 sm:gap-5">
              {PILLARS.map((pillar) => (
                <article key={pillar.title} className="bb-pane rounded-[18px] p-7 sm:rounded-[22px] sm:p-9">
                  <div className="relative z-[2]">
                    <h3 className="bb-display max-w-[20ch] text-[clamp(1.35rem,2.4vw,1.7rem)] leading-[1.14]">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 max-w-[42ch] text-[.94rem] leading-[1.6] text-[var(--ink-3)]">
                      {pillar.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Questions ───────────────────────────────────────── */}
        <section className="px-5 pb-28 lg:px-8 lg:pb-40">
          <div className="mx-auto max-w-[760px]">
            <h2 className="bb-display text-[clamp(2rem,5vw,3rem)] leading-[1.05]">Questions? Answers.</h2>
            <div className="mt-10">
              {FAQ.map((item) => (
                <details key={item.q} className="bb-faq">
                  <summary>
                    <span>{item.q}</span>
                    <span className="bb-plus" aria-hidden="true" />
                  </summary>
                  <p className="max-w-[62ch] text-[.94rem] leading-[1.65] text-[var(--ink-3)]">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Join ────────────────────────────────────────────── */}
        <section className="border-t border-[var(--line)] px-5 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-[720px] text-center">
            <h2 className="bb-display text-[clamp(2.2rem,6vw,3.8rem)] leading-[1.02]">
              Every story here was written by someone your age.
            </h2>
            <p className="mx-auto mt-6 max-w-[46ch] text-[1.02rem] leading-[1.62] text-[var(--ink-2)]">
              If you can explain something clearly, you can write for BitBuzz. No experience, no
              application fee, no gatekeeping.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a href="/opportunities" className="bb-btn bb-solid bb-lg">Write for BitBuzz <Arrow /></a>
              <button type="button" onClick={openLogin} className="bb-btn bb-ghost bb-lg">Login</button>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--line)] px-5 py-12 lg:px-8">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Back to top">
            <img src={LOGO_IMAGE} alt="" className="h-7 w-7 rounded-full object-cover" />
            <span className="bb-display text-[1.05rem]">BitBuzz</span>
          </a>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[.85rem] text-[var(--ink-3)]" aria-label="Footer">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="transition-colors hover:text-white">{link.label}</a>
            ))}
          </nav>
          <p className="text-[.78rem] text-[var(--ink-3)]">© {new Date().getFullYear()} BitBuzz. Student run.</p>
        </div>
      </footer>

      {/* ── Mobile menu ───────────────────────────────────────── */}
      {menuOpen && (
        <div className="bb-fade bb-only-mobile fixed inset-0 z-[100] flex-col bg-black px-5 py-5" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between">
            <img src={LOGO_IMAGE} alt="BitBuzz" className="h-9 w-9 rounded-full object-cover" />
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
            <a href={NEWSROOM_URL} className="bb-btn bb-solid bb-lg justify-center">Get Started <Arrow /></a>
            <button type="button" onClick={openLogin} className="bb-btn bb-ghost bb-lg justify-center">Login</button>
          </div>
        </div>
      )}

      {/* ── Login ─────────────────────────────────────────────── */}
      {loginOpen && (
        <div
          className="bb-fade fixed inset-0 z-[110] flex items-end justify-center bg-black/75 px-4 pb-4 backdrop-blur-md sm:items-center sm:p-5"
          onMouseDown={closeLogin}
        >
          <div
            className="bb-sheet bb-pane w-full max-w-[420px] rounded-[24px] p-7 shadow-2xl sm:p-9"
            style={{ background: "#070707" }}
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bb-login-title"
          >
            <div className="relative z-[2]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="bb-login-title" className="bb-display text-[2.1rem] leading-none">Welcome back.</h2>
                  <p className="mt-3 text-[.86rem] text-[var(--ink-3)]">Sign in to write, edit and publish.</p>
                </div>
                <button type="button" onClick={closeLogin} className="bb-icon shrink-0" aria-label="Close">
                  <CloseIcon />
                </button>
              </div>

              <form onSubmit={login} className="mt-8 space-y-4">
                <div>
                  <label htmlFor="bb-email" className="block text-[.78rem] text-[var(--ink-3)]">Email</label>
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
                  <label htmlFor="bb-password" className="block text-[.78rem] text-[var(--ink-3)]">Password</label>
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
        </div>
      )}
    </div>
  );
}
