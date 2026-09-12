import { FormEvent, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

export default function AuthPage() {
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

  const sendCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setError("");
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (error) return setError(error.message);
    setSent(true);
    setMessage("Check your inbox for your BitBuzz sign-in code.");
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    if (!otp.trim()) return;
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: otp.trim(),
      type: "email",
    });
    setBusy(false);
    if (error) return setError(error.message);
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
          <a href="/home" className="text-xs font-semibold text-white/50 transition hover:text-white">Back to newsroom</a>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-62px)] items-center justify-center px-5 py-12">
        <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#080809] p-7 shadow-2xl sm:p-9">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#83adff]">BitBuzz account</p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-.05em]">Sign in.</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/40">Sign in or create your BitBuzz account with your email. No password to remember.</p>

          {!sent ? (
            <form onSubmit={sendCode} className="mt-8 space-y-4">
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-white/35">Email</span>
                <input autoFocus type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25" />
              </label>
              {error && <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-[#83adff] disabled:cursor-wait disabled:opacity-50">{busy ? "Sending…" : "Continue with email"}</button>
            </form>
          ) : (
            <form onSubmit={verifyCode} className="mt-8 space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[.025] p-4 text-sm text-white/60">Code sent to <strong className="text-white">{email}</strong></div>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.16em] text-white/35">Verification code</span>
                <input autoFocus inputMode="numeric" autoComplete="one-time-code" required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="Enter your code" className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3.5 text-center text-lg tracking-[.3em] text-white outline-none placeholder:text-white/20 focus:border-white/25" />
              </label>
              {message && <p className="text-xs text-emerald-300">{message}</p>}
              {error && <p className="rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-xs text-red-300">{error}</p>}
              <button disabled={busy} className="w-full rounded-xl bg-white py-3.5 text-sm font-bold text-black transition hover:bg-[#83adff] disabled:cursor-wait disabled:opacity-50">{busy ? "Verifying…" : "Verify & enter BitBuzz"}</button>
              <button type="button" onClick={() => { setSent(false); setOtp(""); setError(""); setMessage(""); }} className="w-full py-2 text-xs text-white/35 hover:text-white">Use a different email</button>
            </form>
          )}

          <p className="mt-8 border-t border-white/10 pt-5 text-center text-[11px] leading-relaxed text-white/25">By continuing, you agree to use BitBuzz responsibly. We only use your email for your account and authentication.</p>
        </div>
      </main>
    </div>
  );
}
