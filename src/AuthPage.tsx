import { FormEvent, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
    setPassword("");
    setConfirmPassword("");
    setError("");
    setMessage("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) return;

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            display_name: cleanEmail.split("@")[0],
            full_name: cleanEmail.split("@")[0],
          },
        },
      });

      setBusy(false);

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      if (!data.session) {
        setError("Your account was created, but email confirmation is still enabled in Supabase. Turn off email confirmations to use instant login.");
        return;
      }

      window.location.href = "/home";
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    setBusy(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    window.location.href = "/home";
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
          <p className="mt-3 text-sm leading-relaxed text-white/40">{mode === "signup" ? "Create your account to write, edit and publish." : "Sign in to write, edit and publish."}</p>

          <div className="mt-7 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[.025] p-1">
            <button type="button" onClick={() => switchMode("signin")} className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${mode === "signin" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>Sign In</button>
            <button type="button" onClick={() => switchMode("signup")} className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${mode === "signup" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>Create Account</button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-white/35">Email</span>
              <input autoFocus type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25" />
            </label>

            <label className="block">
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-white/35">Password</span>
              <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" minLength={6} autoComplete={mode === "signup" ? "new-password" : "current-password"} className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25" />
            </label>

            {mode === "signup" && (
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-white/35">Confirm password</span>
                <input type="password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="••••••••" minLength={6} autoComplete="new-password" className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25" />
              </label>
            )}

            {error && <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs leading-relaxed text-red-300">{error}</p>}
            {message && <p className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-emerald-300">{message}</p>}

            <button type="submit" disabled={busy} className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-[#83adff] disabled:cursor-wait disabled:opacity-50">
              {busy ? (mode === "signup" ? "Creating account…" : "Signing in…") : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          {mode === "signin" && (
            <div className="mt-7 flex items-center gap-3 text-[12px] text-white/30">
              <span className="h-px flex-1 bg-white/10" />
              <span>No account?</span>
              <a href="/signup" className="font-semibold text-[#ffe600] underline decoration-[#ffe600]/50 underline-offset-4 transition hover:text-[#fff27a]">Sign up now</a>
              <span className="h-px flex-1 bg-white/10" />
            </div>
          )}

          <p className="mt-4 text-center text-[11px] text-white/25">
            {mode === "signin" ? "Password reset will be added soon." : "You can sign in again anytime with the same email and password."}
          </p>

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
