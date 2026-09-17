import { useMemo } from "react";

const logo = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
      <path d="M4 12 12 4M5 4h7v7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spark() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
      <path d="m10 1.8 1.65 6.55L18.2 10l-6.55 1.65L10 18.2l-1.65-6.55L1.8 10l6.55-1.65L10 1.8Z" fill="currentColor" />
    </svg>
  );
}

export default function TryBetaPage() {
  const betaUrl = useMemo(() => {
    const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
    return env?.VITE_BITBUZZ_ANDROID_BETA_URL?.trim() || "";
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-[#ffc48f] selection:text-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,196,143,0.11),transparent_34%),radial-gradient(circle_at_85%_70%,rgba(131,173,255,0.07),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between py-6 sm:py-8">
          <a href="/" className="group flex items-center gap-3" aria-label="BitBuzz home">
            <img src={logo} alt="BitBuzz" className="h-9 w-9 rounded-[11px] object-cover ring-1 ring-white/10 transition group-hover:scale-105" />
            <span className="text-sm font-black tracking-[-0.02em]">BitBuzz</span>
          </a>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/55 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#7ee0a1] shadow-[0_0_12px_rgba(126,224,161,.8)]" />
            Android Beta
          </div>
        </header>

        <section className="flex flex-1 items-center py-16 sm:py-24">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#ffc48f]/20 bg-[#ffc48f]/[0.07] px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#ffc48f]">
                <Spark />
                BitBuzz Mobile · V2
              </div>

              <h1 className="max-w-3xl text-[3.35rem] font-black leading-[0.91] tracking-[-0.065em] sm:text-7xl lg:text-[5.5rem]">
                Stay curious.
                <br />
                <span className="text-white/35">Everywhere.</span>
              </h1>

              <p className="mt-7 max-w-xl text-[15px] leading-7 text-white/55 sm:text-lg sm:leading-8">
                The new BitBuzz mobile experience is here. Explore science, technology, space, aviation, innovation and more — designed from the ground up for your phone.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                {betaUrl ? (
                  <a
                    href={betaUrl}
                    className="group inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-white px-7 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-[#ffc48f]"
                  >
                    Install Android beta
                    <span className="transition group-hover:translate-x-0.5"><ArrowUpRight /></span>
                  </a>
                ) : (
                  <div className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.045] px-6 text-sm font-bold text-white/65">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#ffc48f]" />
                    Beta build in progress
                  </div>
                )}
                <a
                  href="/"
                  className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/10 px-6 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white"
                >
                  Back to BitBuzz
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold text-white/35">
                <span>Android</span>
                <span>•</span>
                <span>Native V2</span>
                <span>•</span>
                <span>Early access</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[390px] lg:justify-self-end">
              <div className="absolute -inset-10 rounded-[4rem] bg-[#ffc48f]/[0.06] blur-3xl" />
              <div className="relative rounded-[3rem] border border-white/10 bg-[#0d0d0f] p-2 shadow-2xl shadow-black/60">
                <div className="rounded-[2.55rem] border border-white/10 bg-black px-5 pb-7 pt-4">
                  <div className="mx-auto mb-6 h-1.5 w-20 rounded-full bg-white/15" />
                  <div className="rounded-[2rem] border border-white/10 bg-[#111113] p-5">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
                      <span>BitBuzz</span>
                      <span>Today</span>
                    </div>
                    <div className="mt-8 text-[2.5rem] font-black leading-[0.92] tracking-[-0.06em]">
                      Stay
                      <br />
                      curious.
                    </div>
                    <div className="mt-4 h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-[#ffc48f]/30 via-white/[0.06] to-[#83adff]/20">
                      <div className="flex h-full items-end p-4">
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">Featured story</span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 w-4/5 rounded-full bg-white/10" />
                      <div className="h-3 w-3/5 rounded-full bg-white/[0.06]" />
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-2 px-2">
                    {["✦", "⌕", "↗", "⌑", "●"].map((item, index) => (
                      <div key={index} className={`flex h-9 items-center justify-center rounded-xl text-xs ${index === 0 ? "bg-white text-black" : "bg-white/[0.05] text-white/35"}`}>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/[0.08] py-10 sm:py-12">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Open the beta", "Install the APK when the build is ready."],
              ["02", "Explore BitBuzz", "Browse live stories across the BitBuzz worlds."],
              ["03", "Send feedback", "Help shape the final mobile release."],
            ].map(([number, title, body]) => (
              <div key={number} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="text-[10px] font-black tracking-[0.18em] text-white/25">{number}</div>
                <div className="mt-5 text-sm font-black">{title}</div>
                <p className="mt-2 text-xs leading-5 text-white/40">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/[0.08] py-5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <span>BitBuzz Mobile Beta</span>
          <span>Built for curious minds · Android</span>
        </footer>
      </div>
    </main>
  );
}
