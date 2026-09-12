import { FormEvent, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

type Mode = "signin" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
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
    setOtp("");
    setError("");
    setMessage("");
  };

  const sendCode = async (event: FormEvent) => {
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
        data: mode === "signup" ? { display_name: cleanName } : undefined,
      },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
    setMessage(mode === "signup" ? "Check your inbox to finish creating your BitBuzz account." : "Check your inbox for your BitBuzz sign in code.");
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!otp.trim()) return;
    setBusy(true);
    setError("");

    const { data, error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: "email",
    });

    if (error) {
      setBusy(false);
      return setError(error.message);
    }

    if (mode === "signup" && data.user?.id) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ display_name: name.trim(), updated_at: new Date().toISOString() })
        .eq("id", data.user.id);

      if (profileError) {
        setBusy(false);
        return setError("Your account was created, but we couldn't save your name. Please try signing in again.");
      }
    }

    setBusy(false);
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
          <p className="mt-3 text-sm leading-relaxed text-white/40">{mode === "signup" ? "Create your account with your name and email. We'll use your name to greet you around the newsroom." : "Sign in with the email connected to your BitBuzz account. No password to remember."}</p>

          <div className="mt-7 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[.025] p-1">
            <button type="button" onClick={() => switchMode("signin")} className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${mode === "signin" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>Sign In</button>
            <button type="button" onClick={() => switchMode("signup")} className={`rounded-lg px-3 py-2.5 text-xs font-bold transition ${mode === "signup" ? "bg-white text-black" : "text-white/40 hover:text-white"}`}>Create Account</button>
          </div>

          {!sent ? (
            <form onSubmit={sendCode} className="mt-6 space-y-4">
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
              <button disabled={busy} className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-[#83adff] disabled:cursor-wait disabled:opacity-50">{busy ? "Sending…" : mode === "signup" ? "Create account" : "Continue with email"}</button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-6 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[.025] p-4 text-sm text-white/60">Code sent to <strong className="text-white">{email}</strong></div>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-white/35">Verification code</span>
                <input autoFocus inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Enter your code" className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-center text-lg tracking-[.3em] text-white outline-none placeholder:text-white/20 focus:border-white/25" />
              </label>
              {message && <p className="text-xs text-emerald-300">{message}</p>}
              {error && <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-[#83adff] disabled:cursor-wait disabled:opacity-50">{busy ? "Verifying…" : mode === "signup" ? "Create & enter BitBuzz" : "Verify & enter BitBuzz"}</button>
              <button type="button" onClick={() => { setSent(false); setOtp(""); setError(""); setMessage(""); }} className="w-full py-2 text-xs text-white/35 hover:text-white">Use a different email</button>
            </form>
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
