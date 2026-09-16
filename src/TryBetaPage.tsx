import { useMemo } from "react";

const logo = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

export default function TryBetaPage() {
  const betaUrl = useMemo(() => {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    return env?.VITE_BITBUZZ_ANDROID_BETA_URL?.trim() || "";
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto flex min-h-[85vh] max-w-5xl flex-col justify-between">
        <header className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3" aria-label="BitBuzz home">
            <img src={logo} alt="BitBuzz" className="h-9 w-9 rounded-xl object-cover" />
            <span className="text-sm font-black">BitBuzz</span>
          </a>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
            Android Beta
          </span>
        </header>

        <section className="py-20 sm:py-28">
          <p className="mb-5 text-[11px] font-black uppercase tracking-[0.28em] text-white/40">BitBuzz Mobile</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.055em] sm:text-7xl">
            News, built for your pocket.
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/55 sm:text-lg">
            Try the early BitBuzz mobile experience. This is a beta build, so expect rough edges while we finish the final V2 interface.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            {betaUrl ? (
              <a href={betaUrl} className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-black text-black">
                Get the Android beta ↗
              </a>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-white/60">
                The Android beta build is being prepared. Check back shortly.
              </div>
            )}
            <a href="/" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 px-7 text-sm font-bold text-white/70">
              Back to BitBuzz
            </a>
          </div>

          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            {["Supabase connected", "Live BitBuzz stories", "Beta build"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-4 text-xs font-bold text-white/55">
                <span className="mr-2 text-white">•</span>{item}
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 pt-5 text-xs text-white/35">
          BitBuzz Mobile Beta · Android · Early access
        </footer>
      </div>
    </main>
  );
}
