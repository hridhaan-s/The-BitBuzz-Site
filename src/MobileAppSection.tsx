const features = [
  { icon: "✦", title: "Personalized feed", text: "Get the stories that match your interests, from space and tech to cybersecurity and innovation." },
  { icon: "⌕", title: "Explore every topic", text: "Jump between genres, discover new ideas, and search the BitBuzz newsroom from anywhere." },
  { icon: "♡", title: "Save for later", text: "Bookmark stories you want to read, revisit, or share when you have more time." },
  { icon: "◉", title: "Breaking alerts", text: "Stay ahead with timely notifications for important stories and major developments." },
  { icon: "⌁", title: "School Buzz", text: "Follow school-specific news, opportunities, events, and updates built for students." },
  { icon: "↗", title: "Submit & report", text: "Send stories, ideas, tips, and scam reports directly to the BitBuzz team." },
];

function AppIcon({ store }: { store: "apple" | "play" }) {
  if (store === "apple") return <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M17.05 12.5c-.02-2.08 1.7-3.08 1.78-3.13a3.82 3.82 0 0 0-3.01-1.63c-1.27-.13-2.5.76-3.15.76-.66 0-1.67-.74-2.74-.72a4.04 4.04 0 0 0-3.4 2.07c-1.46 2.54-.37 6.28 1.05 8.34.71 1.01 1.55 2.14 2.65 2.1 1.07-.04 1.47-.68 2.76-.68 1.29 0 1.65.68 2.77.66 1.15-.02 1.88-1.03 2.59-2.04a8.34 8.34 0 0 0 1.18-2.36 3.65 3.65 0 0 1-2.2-3.37ZM14.97 6.36c.58-.7.97-1.67.86-2.64-.84.03-1.86.56-2.46 1.26-.54.62-1.02 1.62-.89 2.57.94.07 1.91-.48 2.49-1.19Z"/></svg>;
  return <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true"><path d="M3.3 2.8a1.4 1.4 0 0 0-.3.95v16.5c0 .36.1.69.3.95L12.55 12 3.3 2.8Zm10.17 10.08 2.36 2.36-9.98 5.68 7.62-8.04Zm1.41-1.41 2.25-2.25-11.28-6.4 9.03 8.65Zm.95.95 4.03 2.29c.57.32.57.86 0 1.19l-4.03 2.29-2.56-2.56 2.56-3.21Z"/></svg>;
}

export default function MobileAppSection() {
  return (
    <section id="app" className="relative overflow-hidden border-t border-white/[0.08] bg-[#000000] text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#5d98ff]/[0.07] blur-[120px]" />
      <div className="relative mx-auto max-w-[1480px] px-5 py-20 sm:px-8 sm:py-24 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,1.1fr)] lg:gap-20">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#5d98ff]/30 bg-[#5d98ff]/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#a9c7ff]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5d98ff] shadow-[0_0_12px_rgba(93,152,255,.9)]" /> Coming soon
            </div>
            <h2 className="max-w-[720px] font-serif text-[clamp(3rem,6vw,6.4rem)] font-medium leading-[0.9] tracking-[-.06em]">BitBuzz,<br /><span className="text-[#6f9fff]">in your pocket.</span></h2>
            <p className="mt-7 max-w-[620px] text-[clamp(1rem,1.5vw,1.2rem)] leading-[1.6] text-white/60">The BitBuzz mobile app is being built to make the newsroom faster, more personal, and always within reach. Until then, the full experience continues on the web.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="flex min-w-[170px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0a0c] px-4 py-3.5 text-left opacity-90">
                <AppIcon store="apple" /><span><span className="block text-[9px] uppercase tracking-[0.14em] text-white/35">Coming soon on</span><span className="text-sm font-semibold">App Store</span></span>
              </div>
              <div className="flex min-w-[170px] items-center gap-3 rounded-2xl border border-white/10 bg-[#0a0a0c] px-4 py-3.5 text-left opacity-90">
                <AppIcon store="play" /><span><span className="block text-[9px] uppercase tracking-[0.14em] text-white/35">Coming soon on</span><span className="text-sm font-semibold">Google Play</span></span>
              </div>
            </div>
            <a href="/home" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#8db5ff]">Continue on the website <span aria-hidden="true">↗</span></a>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[40px] bg-[#5d98ff]/[0.035] blur-2xl" />
            <div className="relative grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <article key={feature.title} className="group rounded-[22px] border border-white/[0.09] bg-[#080809] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#0b0b0d] sm:p-6">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-lg text-[#83adff]">{feature.icon}</div>
                  <h3 className="text-[15px] font-semibold tracking-[-.01em]">{feature.title}</h3>
                  <p className="mt-2 text-[12px] leading-[1.55] text-white/42">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-white/[0.08] pt-6 text-[10px] uppercase tracking-[0.18em] text-white/25">One BitBuzz. Web today. Mobile soon.</div>
      </div>
    </section>
  );
}
