import { FormEvent, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";
const AUTH_REDIRECT = `${window.location.origin}/home`;

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = "/home";
    });
  }, []);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setSent(false);
    setError("");
    setMessage("");
  };

  const sendMagicLink = async (event: FormEvent) => {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    if (!cleanEmail) return;
    if (mode === "signup" && !cleanName) {
      setError("Please enter your name to create your BitBuzz account.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: mode === "signup",
        emailRedirectTo: AUTH_REDIRECT,
        data: mode === "signup" ? { full_name: cleanName, display_name: cleanName } : undefined,
      },
    });

    setBusy(false);
    if (error) return setError(error.message);

    setSent(true);
    setMessage(
      mode === "signup"
        ? "Check your inbox and click the secure link to finish creating your BitBuzz account."
        : "Check your inbox and click the secure BitBuzz sign-in link."
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] max-w-[980px] items-center justify-between px-5 sm:px-8">
          <a href="/home" className="flex items-center gap-2.5" aria-label="Back to BitBuzz home">
            <img src={LOGO_URL} alt="BitBuzz" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" />
            <span className="font-serif text-[21px] font-semibold tracking-[-0.04em]">BitBuzz</span>
          </a>
          <a href="/privacy" className="text-xs font-semibold text-white/50 transition hover:text-white">Privacy</a>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-62px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#080809] p-7 shadow-2xl sm:p-9">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#83adff]">BitBuzz account</p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-.05em]">{mode === "signup" ? "Join BitBuzz." : "Welcome back."}</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/40">{mode === "signup" ? "Create your account with your name and email. We'll send you a secure sign-in link instead of a password." : "Sign in with the email connected to your BitBuzz account. No password or code to remember."}</p>

          <div className="mt-7 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[.025] p-1">
            <button type="button" onClick={() => switchMode("signin")} className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${mode === "signin" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>Sign In</button>
            <button type="button" onClick={() => switchMode("signup")} className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${mode === "signup" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>Create Account</button>
          </div>

          {!sent ? (
            <form onSubmit={sendMagicLink} className="mt-6 space-y-4">
              {mode === "signup" && (
                <label className="block">
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-white/35">Your name</span>
                  <input autoFocus type="text" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Hridhaan Sahay" maxLength={80} className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25" />
                </label>
              )}
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-white/35">Email</span>
                <input autoFocus={mode === "signin"} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25" />
              </label>
              {error && <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-[#83adff] disabled:cursor-wait disabled:opacity-50">{busy ? "Sending…" : mode === "signup" ? "Send sign-up link" : "Send magic link"}</button>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[.025] p-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[.04] text-xl">✉</div>
                <h2 className="mt-4 text-lg font-bold">Check your inbox</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/45">
                  We sent a secure BitBuzz link to <strong className="text-white">{email}</strong>.
                </p>
                <p className="mt-3 text-xs leading-relaxed text-emerald-300">{message}</p>
              </div>
              <button type="button" onClick={() => { setSent(false); setError(""); setMessage(""); }} className="w-full py-2 text-xs text-white/35 hover:text-white">Use a different email</button>
            </div>
          )}

          <p className="mt-8 border-t border-white/10 pt-5 text-center text-[11px] leading-relaxed text-white/30">
            By continuing, you agree to BitBuzz's terms and {" "}
            <a href="/privacy" className="font-semibold text-[#ffe600] underline decoration-[#ffe600]/60 underline-offset-2 transition hover:text-[#fff27a]">privacy notice</a>.
            {" "}We only use account information for authentication and the features described in our privacy notice.
          </p>

          <footer className="mt-5 flex items-center justify-center gap-2 border-t border-white/10 pt-5 text-[11px] text-white/25">
            <span>BitBuzz</span>
            <span aria-hidden="true">•</span>
            <a href="/privacy" className="font-semibold text-[#ffe600] transition hover:text-[#fff27a]">Privacy Policy</a>
          </footer>
        </div>
      </main>
    </div>
  );
}
