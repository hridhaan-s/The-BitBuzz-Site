import { FormEvent, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

const NEWSLETTER_SEEN_KEY = "bitbuzz_newsletter_subscribed";
const NEWSLETTER_SNOOZE_KEY = "bitbuzz_newsletter_snoozed_until";
const FIRST_PROMPT_DELAY = 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

function canShowPrompt() {
  try {
    if (localStorage.getItem(NEWSLETTER_SEEN_KEY) === "true") return false;
    const snoozedUntil = Number(localStorage.getItem(NEWSLETTER_SNOOZE_KEY) || 0);
    return Date.now() >= snoozedUntil;
  } catch {
    return true;
  }
}

function snoozePrompt() {
  try {
    const jitter = (Math.random() * 4 - 2) * 60 * 1000;
    localStorage.setItem(NEWSLETTER_SNOOZE_KEY, String(Date.now() + TEN_MINUTES + jitter));
  } catch {}
}

export default function NewsletterSignup({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    let cancelled = false;

    if (!canShowPrompt()) return;

    timer = window.setTimeout(() => {
      if (!cancelled && canShowPrompt()) setPromptOpen(true);
    }, FIRST_PROMPT_DELAY);

    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!promptOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPromptOpen(false);
        snoozePrompt();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [promptOpen]);

  const closePrompt = () => {
    setPromptOpen(false);
    snoozePrompt();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value || !value.includes("@")) {
      setStatus("Enter a valid email.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const { data: pub, error: pubError } = await supabase
        .from("bitbuzz_publications")
        .select("id")
        .eq("slug", "srgs")
        .eq("status", "active")
        .maybeSingle();

      if (pubError || !pub) {
        setStatus("Newsletter is temporarily unavailable.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("newsletter-subscribe", {
        body: { email: value, publication_id: pub.id },
      });

      if (error || !data?.ok) {
        setStatus((data?.error as string) || "Could not subscribe right now.");
        return;
      }

      try {
        localStorage.setItem(NEWSLETTER_SEEN_KEY, "true");
        localStorage.removeItem(NEWSLETTER_SNOOZE_KEY);
      } catch {}

      setStatus("You're on the BitBuzz list. Check your inbox for a welcome email.");
      setEmail("");
      setPromptOpen(false);
    } catch {
      setStatus("Could not subscribe right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <section className={`${compact ? "rounded-2xl border border-white/10 bg-white/[.025] p-5" : "border-y border-white/10 py-12"} text-white`}>
        <div className={compact ? "" : "mx-auto max-w-[1120px] px-5 lg:px-8"}>
          <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#ffe600]">The BitBuzz Brief</p>
          <h2 className="mt-2 font-serif text-3xl tracking-[-.04em]">The good stuff. In your inbox.</h2>
          <p className="mt-2 max-w-xl text-xs leading-5 text-white/35">Occasional highlights from space, technology, cybersecurity, aviation and innovation. No spam.</p>
          <form onSubmit={submit} className="mt-5 flex max-w-xl gap-2">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" aria-label="Email address" disabled={busy} className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/[.04] px-4 py-3 text-xs outline-none focus:border-white/30 disabled:opacity-60" />
            <button type="submit" disabled={busy} className="rounded-full bg-white px-5 py-3 text-[10px] font-bold text-black disabled:opacity-50">{busy ? "Joining…" : "Subscribe"}</button>
          </form>
          {status && <p role="status" aria-live="polite" className="mt-3 text-[10px] text-white/45">{status}</p>}
          <p className="mt-3 text-[9px] text-white/20">By subscribing, you agree to receive BitBuzz newsletter emails. Unsubscribe anytime.</p>
        </div>
      </section>

      {promptOpen && (
        <div className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/75 px-4 pb-4 backdrop-blur-md sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="newsletter-prompt-title">
          <div className="w-full max-w-[430px] overflow-hidden rounded-[24px] border border-white/10 bg-[#080808] p-7 shadow-2xl sm:p-9">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#ffe600]">The BitBuzz Brief</p>
                <h2 id="newsletter-prompt-title" className="mt-3 font-serif text-[2rem] leading-none tracking-[-.045em]">Stay in the loop.</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/45">Science, technology, cybersecurity and innovation — the best stories, delivered occasionally. No spam.</p>
              </div>
              <button type="button" onClick={closePrompt} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-white/20 hover:text-white" aria-label="Close newsletter prompt">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>

            <form onSubmit={submit} className="mt-7 space-y-3">
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" aria-label="Newsletter email address" disabled={busy} autoFocus className="w-full rounded-xl border border-white/10 bg-white/[.04] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30 disabled:opacity-60" />
              {status && <p role="status" aria-live="polite" className="rounded-xl border border-white/10 bg-white/[.025] p-3 text-xs text-white/55">{status}</p>}
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-[#ffe600] disabled:cursor-wait disabled:opacity-50">{busy ? "Joining…" : "Subscribe to the Brief"}</button>
            </form>
            <p className="mt-4 text-center text-[10px] leading-relaxed text-white/25">No spam. Unsubscribe anytime. If you close this, we'll give you some space before asking again.</p>
          </div>
        </div>
      )}
    </>
  );
}
