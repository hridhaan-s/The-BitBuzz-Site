import type { ReactNode } from "react";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";
const genres = ["Space", "Cybersecurity", "Tech", "Aviation", "Innovations"];

export type InfoPageKind = "explore" | "categories" | "opportunities" | "about";

const pageData: Record<InfoPageKind, { eyebrow: string; title: ReactNode; description: string }> = {
  explore: {
    eyebrow: "Explore BitBuzz",
    title: <>Ideas worth <span className="text-[#6f9fff]">exploring.</span></>,
    description: "Discover stories, explainers and ideas across the subjects shaping tomorrow.",
  },
  categories: {
    eyebrow: "BitBuzz categories",
    title: <>Find your <span className="text-[#6f9fff]">signal.</span></>,
    description: "Go straight to the subjects you care about, from space missions to cybersecurity and emerging technology.",
  },
  opportunities: {
    eyebrow: "Opportunities",
    title: <>Build what comes <span className="text-[#6f9fff]">next.</span></>,
    description: "A dedicated place for student opportunities, competitions, programs, events and ways to get involved.",
  },
  about: {
    eyebrow: "About BitBuzz",
    title: <>Curiosity, <span className="text-[#6f9fff]">published.</span></>,
    description: "BitBuzz is a student-run news and awareness platform built for curious minds by curious minds.",
  },
};

export default function InfoPage({ kind }: { kind: InfoPageKind }) {
  const data = pageData[kind];
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-5 sm:px-8">
          <a href="/" className="flex items-center gap-2.5" aria-label="BitBuzz home"><img src={LOGO_URL} alt="BitBuzz" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/15" /><span className="font-serif text-xl font-semibold tracking-[-.04em]">BitBuzz</span></a>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Page navigation">
            {[["Home", "/home"], ["Explore", "/explore"], ["Categories", "/categories"], ["Opportunities", "/opportunities"], ["About", "/about"]].map(([label, href]) => <a key={label} href={href} className={`rounded-full px-4 py-2.5 text-[13px] transition ${label.toLowerCase() === kind ? "text-white bg-white/[0.06]" : "text-white/55 hover:bg-white/[0.05] hover:text-white"}`}>{label}</a>)}
          </nav>
          <a href="/home" className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black transition hover:bg-[#6f9fff]">Open newsroom</a>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#376bd1]/10 blur-[130px]" />
        <section className="relative mx-auto max-w-[1200px] px-5 pb-24 pt-24 sm:px-8 sm:pt-32">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#83adff]">{data.eyebrow}</p>
          <h1 className="mt-5 max-w-4xl font-serif text-[clamp(3.5rem,8vw,7.5rem)] font-medium leading-[.88] tracking-[-.065em]">{data.title}</h1>
          <p className="mt-8 max-w-2xl text-lg leading-[1.6] text-white/55">{data.description}</p>

          {kind === "explore" && <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{["Latest stories", "Deep dives", "Student voices", "Explainers", "Innovation", "The big picture"].map((item, i) => <a key={item} href="/home" className="group rounded-[24px] border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045]"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-white/30">0{i + 1}</span><h2 className="mt-10 font-serif text-3xl tracking-[-.04em]">{item}</h2><span className="mt-5 block text-xs text-white/35 transition group-hover:text-[#83adff]">Explore →</span></a>)}</div>}

          {kind === "categories" && <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{genres.map((genre, i) => <a key={genre} href={`/home#${genre.toLowerCase()}`} className="group flex min-h-[180px] flex-col justify-between rounded-[24px] border border-white/10 bg-[#080809] p-6 transition hover:-translate-y-1 hover:border-[#5d98ff]/30"><span className="text-xs text-white/25">0{i + 1}</span><div><h2 className="font-serif text-3xl tracking-[-.04em]">{genre}</h2><p className="mt-2 text-xs text-white/35">Stories, discoveries and ideas.</p></div></a>)}</div>}

          {kind === "opportunities" && <div className="mt-14 grid gap-4 lg:grid-cols-3">{[["Competitions", "Find challenges that put your skills to work."], ["Programs", "Discover student programs, communities and learning opportunities."], ["Events", "Keep up with events worth showing up for."]].map(([title, text]) => <article key={title} className="rounded-[24px] border border-white/10 bg-[#080809] p-7"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-[#83adff]">✦</div><h2 className="mt-12 font-serif text-3xl tracking-[-.04em]">{title}</h2><p className="mt-3 text-sm leading-relaxed text-white/40">{text}</p><a href="/home" className="mt-7 inline-block text-xs font-semibold text-white hover:text-[#83adff]">Explore opportunities →</a></article>)}</div>}

          {kind === "about" && <div className="mt-14 grid gap-4 lg:grid-cols-[1.4fr_.8fr]"><article className="rounded-[28px] border border-white/10 bg-[#080809] p-7 sm:p-10"><p className="max-w-3xl font-serif text-3xl leading-[1.15] tracking-[-.04em] text-white/90 sm:text-4xl">We believe the best stories do more than inform you. They make you want to understand more.</p><p className="mt-8 max-w-2xl text-sm leading-[1.8] text-white/40">BitBuzz covers science, technology, cybersecurity, aviation, biology and innovation through a student-first lens. The goal is simple: make important ideas understandable, interesting and worth your attention.</p></article><aside className="rounded-[28px] border border-white/10 bg-white/[0.025] p-7"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/30">The standard</p><div className="mt-8 space-y-5">{["Curious, not clickbait", "Student-first", "Science & technology focused", "Built for the next generation"].map((item) => <div key={item} className="border-b border-white/10 pb-5 text-sm text-white/65">{item}</div>)}</div></aside></div>}
        </section>
      </main>
    </div>
  );
}
