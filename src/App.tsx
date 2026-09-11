import { useState } from "react";
import { applyTheme, getInitialTheme } from "./lib/theme";

const LOGO_URL =
  "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

const navItems = ["Home", "Explore", "About Us", "Flag It", "Chanakya AI", "Tool Box"];

function SocialIcon({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center text-white/55 transition-colors hover:text-white focus-visible:text-white"
    >
      {children}
    </a>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[19px] w-[19px]">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[19px] w-[19px]">
      <path
        d="M20 15.3A8.5 8.5 0 0 1 8.7 4a8.6 8.6 0 1 0 11.3 11.3Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[19px] w-[19px]">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
      <path d="M5 5l14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowDown() {
  return (
    <svg viewBox="0 0 12 8" fill="none" aria-hidden="true" className="h-2 w-3">
      <path d="m1 1 5 5 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  const today = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
    .format(new Date())
    .toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-paper text-ink selection:bg-honey selection:text-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#151515] text-white shadow-[0_1px_0_rgba(255,255,255,0.03)]">
        <div className="mx-auto flex h-[54px] max-w-[1500px] items-center px-4 sm:px-6 lg:px-8">
          {/* Desktop left rail */}
          <div className="hidden shrink-0 items-center gap-1 xl:flex">
            <SocialIcon label="BitBuzz on LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M6.5 8.2H3.2V20h3.3V8.2ZM4.85 3A2 2 0 1 0 4.8 7a2 2 0 0 0 .05-4ZM20.8 13.2c0-3.55-1.9-5.2-4.45-5.2-2.05 0-2.96 1.13-3.47 1.92V8.2H9.6V20h3.28v-6.52c0-1.72.32-3.38 2.46-3.38 2.11 0 2.14 1.96 2.14 3.49V20h3.32v-6.8Z" /></svg>
            </SocialIcon>
            <SocialIcon label="BitBuzz on Instagram">
              <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2"/><circle cx="17.2" cy="6.8" r="1" fill="currentColor"/></svg>
            </SocialIcon>
            <SocialIcon label="BitBuzz on YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M21 8.1a2.7 2.7 0 0 0-1.9-1.9C17.4 5.8 12 5.8 12 5.8s-5.4 0-7.1.4A2.7 2.7 0 0 0 3 8.1C2.6 9.8 2.6 12 2.6 12s0 2.2.4 3.9a2.7 2.7 0 0 0 1.9 1.9c1.7.4 7.1.4 7.1.4s5.4 0 7.1-.4a2.7 2.7 0 0 0 1.9-1.9c.4-1.7.4-3.9.4-3.9s0-2.2-.4-3.9ZM10.3 15.1V8.9l5.2 3.1-5.2 3.1Z"/></svg>
            </SocialIcon>
            <span className="mx-3 h-5 w-px bg-white/15" />
            <span className="whitespace-nowrap text-[10px] font-medium tracking-[0.08em] text-white/50">
              {today}
            </span>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-white/85 transition-colors hover:text-white xl:hidden"
          >
            <MenuIcon open={menuOpen} />
          </button>

          {/* Brand */}
          <a
            href="/"
            aria-label="BitBuzz home"
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2.5 xl:static xl:ml-[clamp(30px,6vw,110px)] xl:translate-x-0"
          >
            <img
              src={LOGO_URL}
              alt="BitBuzz"
              className="h-8 w-8 rounded-full object-cover ring-1 ring-white/15 sm:h-9 sm:w-9"
            />
            <span className="font-serif text-[21px] font-semibold leading-none tracking-[-0.035em] sm:text-[23px]">
              BitBuzz
            </span>
          </a>

          {/* Desktop navigation */}
          <nav aria-label="Main navigation" className="ml-auto hidden items-center gap-[clamp(20px,2.2vw,38px)] xl:flex">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className={`group relative flex min-h-10 items-center whitespace-nowrap text-[13px] font-medium text-white/50 transition-colors hover:text-white ${item === "Home" ? "text-white" : ""}`}
              >
                {item}
                {item === "Explore" && <span className="ml-1 text-white/45"><ArrowDown /></span>}
                {item === "Home" && <span className="absolute -bottom-[1px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-honey" />}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 xl:ml-[clamp(20px,2.6vw,44px)]">
            <button
              type="button"
              aria-label="Search BitBuzz"
              className="inline-flex h-10 w-10 items-center justify-center text-white/65 transition-colors hover:text-white"
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="hidden h-10 w-10 items-center justify-center text-white/65 transition-colors hover:text-white sm:inline-flex"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <span className="mx-1 hidden h-6 w-px bg-white/15 xl:block" />
            <a
              href="#"
              className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-[12px] font-semibold text-black transition-transform hover:scale-[1.02] active:scale-[0.98] sm:px-5"
            >
              Submit
            </a>
          </div>
        </div>
      </header>

      {/* Mobile navigation */}
      {menuOpen && (
        <div className="fixed inset-0 top-[54px] z-40 bg-[#151515] text-white xl:hidden">
          <nav aria-label="Mobile navigation" className="flex h-full flex-col px-6 pb-8 pt-7 sm:px-10">
            <div className="flex-1">
              {navItems.map((item) => (
                <a
                  key={item}
                  href="#"
                  onClick={() => setMenuOpen(false)}
                  className={`flex min-h-[54px] items-center border-b border-white/[0.08] text-[18px] font-medium ${item === "Home" ? "text-honey" : "text-white/80"}`}
                >
                  <span className={item === "Home" ? "border-l-2 border-honey pl-4" : "pl-[18px]"}>{item}</span>
                  {item === "Explore" && <span className="ml-auto mr-2 text-white/45">›</span>}
                </a>
              ))}
            </div>
            <div className="border-t border-white/[0.1] pt-5">
              <div className="mb-4 flex items-center gap-1">
                <SocialIcon label="BitBuzz on LinkedIn"><span className="text-xs">in</span></SocialIcon>
                <SocialIcon label="BitBuzz on Instagram"><span className="text-xs">◎</span></SocialIcon>
                <SocialIcon label="BitBuzz on YouTube"><span className="text-xs">▶</span></SocialIcon>
                <span className="mx-3 h-5 w-px bg-white/15" />
                <span className="text-[9px] tracking-[0.08em] text-white/45">{today}</span>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex min-h-11 w-full items-center justify-between border border-white/10 px-4 text-sm text-white/70"
              >
                <span>Appearance</span>
                <span className="flex items-center gap-2">{theme === "dark" ? <MoonIcon /> : <SunIcon />} {theme === "dark" ? "Dark" : "Light"}</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <main id="main-content" className="min-h-[calc(100dvh-54px)] bg-paper">
        <div className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <h1 className="font-serif text-step-6 font-light tracking-[-0.03em]">BitBuzz</h1>
          <p className="mt-4 max-w-[60ch] text-step-0 text-soft">
            Stop eating noise. News, ideas and opportunities for students.
          </p>
        </div>
      </main>
    </div>
  );
}
