export default function OpportunitiesPromo({ variant = "landing" }: { variant?: "landing" | "categories" }) {
  const categories = variant === "categories" ? "border-y border-white/10 bg-[#090909]" : "border-y border-white/10 bg-black";
  return (
    <section className={`${categories} px-5 py-16 sm:px-8 sm:py-24`} aria-labelledby={`opportunities-heading-${variant}`}>
      <div className="mx-auto max-w-[1480px]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0b0b0c] px-7 py-12 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#ff7a3d]/10 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff7a3d]">BitBuzz Opportunities</p>
              <h2 id={`opportunities-heading-${variant}`} className="mt-4 max-w-4xl font-serif text-5xl font-black leading-[.9] tracking-[-.055em] sm:text-7xl">
                Find something worth showing up for.
              </h2>
              <p className="mt-6 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
                Discover student events, hackathons, workshops, competitions and programs. Hosting something? Anyone can submit an event for the BitBuzz team to review.
              </p>
            </div>
            <div className="lg:justify-self-end">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <a href="/opportunities" className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:scale-[1.02] hover:bg-[#ffe2c9]">
                  Explore opportunities ↗
                </a>
                <a href="/opportunities#add-event" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:border-white/35 hover:bg-white/[.08]">
                  Add your event
                </a>
              </div>
              <p className="mt-4 text-center text-[10px] uppercase tracking-[.16em] text-white/25 lg:text-right">Every listing is reviewed before it goes public.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
