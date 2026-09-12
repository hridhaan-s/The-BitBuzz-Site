import UniversalNavbar from "./UniversalNavbar";

const categories = [
  {
    name: "Space",
    route: "/space",
    kicker: "THE FINAL FRONTIER",
    description: "Missions, black holes, rockets, planets and the science pushing humanity beyond Earth.",
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&fm=jpg&q=88&w=1800",
    accent: "from-[#ff7a18] via-[#ff3d00] to-transparent",
  },
  {
    name: "Cybersecurity",
    route: "/cybersecurity",
    kicker: "STAY AHEAD",
    description: "Threats, privacy, digital safety and the technologies defending the internet.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&fm=jpg&q=88&w=1800",
    accent: "from-[#ff3355] via-[#8b1e3f] to-transparent",
  },
  {
    name: "Tech",
    route: "/tech",
    kicker: "WHAT'S NEXT",
    description: "AI, computing, software and the products changing how people build and live.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&fm=jpg&q=88&w=1800",
    accent: "from-[#4f8cff] via-[#3156ff] to-transparent",
  },
  {
    name: "Aviation",
    route: "/aviation",
    kicker: "ABOVE THE CLOUDS",
    description: "Aircraft, air mobility, aerospace engineering and the future of flight.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&fm=jpg&q=88&w=1800",
    accent: "from-[#ffb347] via-[#ff6a00] to-transparent",
  },
  {
    name: "Biology",
    route: "/biobuzz",
    kicker: "LIFE, DECODED",
    description: "Biology, medicine, ecosystems and discoveries that explain the living world.",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&fm=jpg&q=88&w=1800",
    accent: "from-[#44d483] via-[#0e8f67] to-transparent",
  },
  {
    name: "Innovation",
    route: "/innovation",
    kicker: "IDEAS IN ACTION",
    description: "Inventions, research and ambitious ideas turning into things people can actually use.",
    image: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&fm=jpg&q=88&w=1800",
    accent: "from-[#b26cff] via-[#7c3aed] to-transparent",
  },
];

const featuredStories = [
  {
    category: "Cybersecurity",
    title: "The Security Shift: Post Quantum Cryptography, Agent Security and the New Rules of Computing",
    description: "A look at the security changes arriving across cryptography, autonomous agents, memory safety, identity and software supply chains.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&fm=jpg&q=88&w=2200",
    route: "/blog/post-quantum-cryptography-agent-security-memory-safety-zero-trust",
  },
  {
    category: "Aviation",
    title: "Electric Air Taxis Move Closer to UK Skies",
    description: "What the UK aviation push means for electric air taxis and the companies trying to make a new kind of short distance flight real.",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&fm=jpg&q=88&w=2200",
    route: "/blog/electric-air-taxis-move-closer-to-uk-skies",
  },
];

const research = [
  ["01", "Black holes", "What happens when gravity wins?", "/space"],
  ["02", "Stealth aircraft", "How engineers make aircraft harder to see.", "/aviation"],
  ["03", "Flight physics", "Why airplanes stay in the sky.", "/aviation"],
  ["04", "Hypersonic weapons", "The science behind flight at extreme speed.", "/innovation"],
] as const;

function Arrow() {
  return <span aria-hidden="true" className="text-lg transition-transform duration-300 group-hover:translate-x-1">↗</span>;
}

export default function CategoriesPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-white selection:text-black">
      <UniversalNavbar />

      <main>
        <section className="relative isolate min-h-[680px] border-b border-white/10">
          <div className="absolute inset-0 -z-20 bg-[#050505]" />
          <div className="absolute inset-y-0 right-0 -z-10 w-full lg:w-[72%]">
            <img
              src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&fm=jpg&q=92&w=2400"
              alt="Earth from space"
              className="h-full w-full object-cover object-center opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/75 to-[#050505]/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/20" />
          </div>

          <div className="mx-auto flex min-h-[680px] max-w-[1480px] items-end px-5 pb-16 pt-28 sm:px-8 sm:pb-20">
            <div className="max-w-[800px]">
              <p className="mb-5 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[.24em] text-white/55">
                <span className="h-2 w-2 rounded-full bg-[#ff5a1f] shadow-[0_0_18px_#ff5a1f]" />
                Explore what matters
              </p>
              <h1 className="font-serif text-[clamp(4rem,9vw,8.8rem)] font-black leading-[.82] tracking-[-.065em]">
                Different minds.
                <span className="mt-5 block text-white/85">A brighter tomorrow.</span>
              </h1>
              <p className="mt-8 max-w-[650px] text-base leading-7 text-white/60 sm:text-lg">
                Six worlds. One newsroom. Dive into the subjects that make you stop scrolling and start wondering.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#categories" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.03] hover:bg-[#ff6a1f]">
                  Browse categories
                </a>
                <a href="/home" className="rounded-full border border-white/20 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10">
                  Open newsroom
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="mx-auto max-w-[1480px] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">Choose your rabbit hole</p>
              <h2 className="mt-3 font-serif text-4xl font-black tracking-[-.04em] sm:text-6xl">Pick a world.</h2>
            </div>
            <p className="hidden max-w-sm text-right text-sm leading-6 text-white/40 md:block">No algorithms deciding what you should care about. Just categories worth getting lost in.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:gap-4">
            {categories.map((category, index) => (
              <a
                key={category.name}
                href={category.route}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] ${index === 0 ? "md:col-span-2 lg:col-span-2" : ""} ${index === 3 ? "lg:col-span-1" : ""}`}
              >
                <div className={`relative ${index === 0 ? "aspect-[16/8]" : "aspect-[4/5]"}`}>
                  <img src={category.image} alt={category.name} className="h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-95" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.accent} opacity-35`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                    <p className="text-[9px] font-bold uppercase tracking-[.22em] text-white/55">{category.kicker}</p>
                    <div className="mt-2 flex items-end justify-between gap-3">
                      <h3 className="font-serif text-2xl font-black tracking-[-.035em] sm:text-4xl">{category.name}</h3>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur transition duration-300 group-hover:border-white/60 group-hover:bg-white group-hover:text-black">↗</span>
                    </div>
                    <p className="mt-2 max-w-[520px] text-xs leading-5 text-white/55 sm:text-sm">{category.description}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="border-y border-white/10 bg-[#090909] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1480px]">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">From the newsroom</p>
                <h2 className="mt-3 font-serif text-4xl font-black tracking-[-.04em] sm:text-6xl">What’s buzzing?</h2>
              </div>
              <a href="/home" className="hidden text-xs font-bold text-white/55 transition hover:text-white sm:block">View newsroom ↗</a>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.55fr_1fr]">
              {featuredStories.map((story, index) => (
                <a key={story.route} href={story.route} className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-black ${index === 0 ? "min-h-[440px]" : "min-h-[440px]"}`}>
                  <img src={story.image} alt={story.title} className="absolute inset-0 h-full w-full object-cover opacity-65 transition duration-700 group-hover:scale-105 group-hover:opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <span className="rounded-full border border-white/15 bg-white/[0.07] px-3 py-1 text-[9px] font-bold uppercase tracking-[.18em] text-white/70 backdrop-blur">{story.category}</span>
                    <h3 className="mt-4 max-w-3xl font-serif text-3xl font-black leading-[.98] tracking-[-.04em] sm:text-5xl">{story.title}</h3>
                    <div className="mt-4 flex items-end justify-between gap-5">
                      <p className="max-w-2xl text-sm leading-6 text-white/50">{story.description}</p>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-black transition duration-300 group-hover:scale-110"><Arrow /></span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1480px] px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.5fr] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">Research Library</p>
              <h2 className="mt-3 font-serif text-4xl font-black tracking-[-.04em] sm:text-6xl">Go deeper.</h2>
              <p className="mt-5 max-w-md text-sm leading-6 text-white/45">The stories are the beginning. BitBuzz Research goes underneath them and asks the harder questions.</p>
              <a href="/space" className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/20 px-5 py-3 text-xs font-bold transition hover:border-white/50 hover:bg-white hover:text-black">Explore research <Arrow /></a>
            </div>
            <div className="grid border-t border-white/10">
              {research.map(([number, title, text, route]) => (
                <a key={number} href={route} className="group grid grid-cols-[48px_1fr_auto] items-center gap-4 border-b border-white/10 py-5 transition hover:px-3">
                  <span className="text-[10px] font-bold tracking-[.2em] text-white/25">{number}</span>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.2em] text-white/35">{title}</p>
                    <h3 className="mt-1 font-serif text-xl font-bold tracking-[-.02em]">{text}</h3>
                  </div>
                  <Arrow />
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 sm:px-8 sm:pb-24">
          <div className="relative mx-auto max-w-[1480px] overflow-hidden rounded-[28px] border border-[#ff6a1f]/50 bg-[#0b0b0b] px-7 py-14 shadow-[0_0_80px_rgba(255,91,31,.08)] sm:px-12 sm:py-20">
            <div className="absolute right-[-10%] top-[-60%] h-[500px] w-[500px] rounded-full bg-[#ff5a1f]/10 blur-[100px]" />
            <div className="relative grid gap-10 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">Stay curious</p>
                <h2 className="mt-4 max-w-4xl font-serif text-5xl font-black leading-[.9] tracking-[-.055em] sm:text-7xl">Curious minds build a better world.</h2>
              </div>
              <div>
                <p className="max-w-md text-sm leading-6 text-white/45">Read. Question. Contribute. BitBuzz is a student newsroom built for people who would rather understand something than just scroll past it.</p>
                <a href="/signup" className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.03] hover:bg-[#ff6a1f]">Join BitBuzz ↗</a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
