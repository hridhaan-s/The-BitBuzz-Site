import { useState } from "react";
import { applyTheme, getInitialTheme } from "./lib/theme";

export function BeeMark() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="text-ink"
    >
      <path d="M12 2a4 4 0 0 1 4 4v2H8V6a4 4 0 0 1 4-4z" />
      <path d="M8 8h8v9a4 4 0 0 1-8 0V8z" />
      <line x1="6" y1="12" x2="18" y2="12" />
      <line x1="6" y1="15" x2="18" y2="15" />
      <path d="m5 6 3 2" />
      <path d="m19 6-3 2" />
    </svg>
  );
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => getInitialTheme());

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-paper text-ink selection:bg-honey selection:text-paper">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:ring-2 focus:ring-honey"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 w-full bg-paper/95 backdrop-blur-sm transition-colors border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-sp-md flex items-center justify-between h-16 min-h-[44px]">
          <a
            href="/"
            className="flex items-center gap-2 text-ink no-underline min-h-[44px] min-w-[44px]"
            aria-label="BitBuzz Home"
          >
            <BeeMark />
            <span className="font-serif font-semibold text-step-2 tracking-[-0.02em] leading-none">
              BitBuzz
            </span>
          </a>

          <nav aria-label="Main navigation" className="flex items-center gap-sp-sm">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded text-ink hover-honey transition-colors"
            >
              {theme === "dark" ? "☀" : "☾"}
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-sp-md py-sp-2xl">
        <h1 className="font-serif font-light text-step-6 tracking-[-0.02em] leading-tight mb-sp-md">
          BitBuzz
        </h1>
        <p className="font-sans text-step-0 text-soft max-w-[68ch] leading-relaxed">
          Stop eating noise. Foundation running with strict CSS custom properties and liquid type tokens.
        </p>
      </main>

      <footer className="border-t border-line mt-auto pb-[env(safe-area-inset-bottom)]">
        <div className="max-w-7xl mx-auto px-sp-md py-sp-lg">
          <p className="font-sans text-step--1 text-soft">
            © {new Date().getFullYear()} BitBuzz. News for students, by students.
          </p>
        </div>
      </footer>
    </div>
  );
}
