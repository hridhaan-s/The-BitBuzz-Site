import type { ReactNode } from "react";
import UniversalNavbar from "./UniversalNavbar";

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
    title: <>A student newsroom for the students <span className="text-[#6f9fff]">nobody sends the memo to.</span></>,
    description: "BitBuzz is an independent student newsroom founded in 2025 in Noida, India. We publish news worth reading, opportunities worth applying to, and a scam-watch desk so students can find the things they should have been told about in the first place.",
  },
};

const team = [
  {
    name: "Hridhaan Sahay",
    role: "Founder & Editor",
    where: "India",
    bio: "Started BitBuzz in Grade 9 after noticing the students who knew about the best opportunities were almost always the ones who already had every other advantage. Writes, edits, and builds the tools, Flag It and Chanakya AI included.",
    image: "https://media.licdn.com/dms/image/v2/D5603AQExpjaBXgwMdg/profile-displayphoto-crop_800_800/B56Z3cq6wyGgAI-/0/1777523734456?e=1790812800&v=beta&t=HgAtquYcGso00ThLZVy8Dqsop_U3g7SxyirAAhNqdq0",
    email: "Hridhaan@bitbuzz.app",
    link: "https://hridhaan.bitbuzz.club",
    linkLabel: "Website",
  },
  {
    name: "Ritvik Sahay",
    role: "Content Advisor",
    where: "India",
    bio: "Shapes how BitBuzz sounds. Reads everything before it goes out, cuts the parts that don't earn their place, and pushes headlines until they say something true instead of something loud.",
    image: "https://i.ibb.co/MxWQdmVd/0565-BBC1-BF4-D-4-EEC-93-B1-7541-CDC0163-A.jpg",
    email: "Ritvik@bitbuzz.app",
    link: "https://www.bio.site/ritviksahay",
    linkLabel: "Website",
  },
];

const alumni = [
  ["FY", "Freddie Yershon", "London, UK", "Advisor & Software Engineer", "Advised on architecture and systems design in the early build, the decisions that stopped the platform painting itself into a corner later."],
  ["DP", "Dwait Pandhi", "Canada", "Finance Lead & Software Engineer", "Kept the numbers honest while writing code alongside everyone else. Ran the books back when the books mattered most, at zero revenue."],
  ["EL", "Elias", "Sweden", "Server & Infrastructure Lead", "Ran the infrastructure through the first traffic spikes. The site stayed up on the days it would have hurt most to go down."],
  ["IW", "Ingo Wolf", "Australia", "Frontend Developer", "Built the interfaces students actually touch: fast, accessible, and readable on the cheap phone that most of the audience is holding."],
  ["YA", "Yashika", "India", "Community Advisor & Outreach", "Grew the community from the inside, finding the students who needed the platform and making sure they knew it existed."],
  ["ND", "Nikunj Doke", "India", "Web Development Intern", "Turned designs into shipped pages. A lot of what you're scrolling through started as work he closed out."],
  ["AS", "Aditya Singh", "India", "Summer Intern & Creative Advisor", "Pushed the visual identity somewhere it wasn't going to get on its own."],
  ["AT", "Abhimanyu Tyagi", "India", "Offline Experience Lead", "Ran everything that happened in a room instead of a browser: workshops, live events, and the tech that held them together."],
  ["DK", "Diksha", "India", "Social Media & Events Intern", "Made the stories land on the screens they needed to land on: posts, reels, and the reach that came with them."],
  ["YS", "Yukti Sharma", "India", "Community & Outreach Lead", "Connected BitBuzz to the people who needed it, through events and direct outreach rather than algorithms."],
  ["AA", "Aaina", "India", "Social Media & Events Intern", "Hosted events and carried the energy in front of the crowd, the reason people stopped and paid attention."],
] as const;

const timeline = [
  ["Early 2025", "The idea, and the first version", "Mapped where opportunity information actually breaks down for students outside well-connected schools. Built the first site and started publishing."],
  ["Mid 2025", "Original writing finds readers", "Technical explainers and opportunity briefings go out weekly. Readership grows entirely by word of mouth and search, with no ad spend, then or since."],
  ["Late 2025", "Flag It launches", "The scam-watch desk opens after too many students report fake scholarship portals. Cases get investigated, documented and published in the open."],
  ["Winter 2025", "The Opportunity Feed scales", "The verified directory passes 400 entries across scholarships, grants, olympiads, hackathons and fellowships, spanning dozens of countries."],
  ["Early 2026", "Chanakya AI", "A guided navigator built on top of the verified directory, so a student can describe their situation in plain words and get pointed at things they're actually eligible for."],
  ["Mid 2026", "32,400 students, 50+ countries", "The platform crosses 32,400 readers across more than fifty countries, with 100+ published pieces and the first annual report released publicly."],
] as const;

function Header() {
  return <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 text-white backdrop-blur-xl"><div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-5 sm:px-8"><a href="/" className="flex items-center gap-2.5" aria-label="BitBuzz home"><img src={LOGO_URL} alt="BitBuzz" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/15" /><span className="font-serif text-xl font-semibold tracking-[-.04em]">BitBuzz</span></a><nav className="hidden items-center gap-1 md:flex" aria-label="Page navigation">{[["Home", "/home"], ["Explore", "/explore"], ["Categories", "/categories"], ["Opportunities", "/opportunities"], ["About", "/about"]].map(([label, href]) => <a key={label} href={href} className={`rounded-full px-4 py-2.5 text-[13px] transition ${label === "About" ? "bg-white/[0.07] text-white" : "text-white/55 hover:bg-white/[0.05] hover:text-white"}`}>{label}</a>)}</nav><a href="/home" className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black transition hover:bg-[#6f9fff]">Open newsroom</a></div></header>;
}

function AboutPage() {
  return <div className="min-h-screen bg-[#f7f5f0] text-[#14110f]">
    <UniversalNavbar />
    <main>
      <section className="border-b border-[#ded9d0] px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-32"><div className="mx-auto max-w-[1080px]"><div className="flex flex-wrap gap-x-5 gap-y-2 border-b border-[#eae6de] pb-4 text-xs text-[#6f6a64]"><b className="text-[#b4121f]">Founded 2025</b><span>Noida, India</span><span>Independent · no sponsors, no ads</span><span>bitbuzz.club · bitbuzz.app</span></div><h1 className="mt-8 max-w-5xl font-serif text-[clamp(4rem,9.5vw,7.4rem)] font-black leading-[.88] tracking-[-.055em]">BitBuzz <span className="block mt-4 text-[.42em] font-normal italic leading-tight text-[#6f6a64]">A student newsroom for the students nobody sends the memo to.</span></h1><p className="mt-9 max-w-[680px] font-serif text-[clamp(1.2rem,2.4vw,1.45rem)] leading-[1.6]">Every year, scholarships close unfilled and competitions run under-entered, not because students can't do the work, but because they never heard it existed. BitBuzz was built to close that gap: news worth reading, opportunities worth applying to, and a scam-watch desk so nobody gets robbed on the way there.</p><div className="mt-12 grid grid-cols-2 border-t border-[#ded9d0] sm:grid-cols-4">{[["32,400+", "Students reached"], ["50+", "Countries"], ["400+", "Opportunities verified"], ["₹16.5L", "Scam losses prevented (~$19,870)"]].map(([n,l]) => <div key={l} className="border-b border-r border-[#eae6de] py-5 pr-4 sm:border-b-0"><strong className="block font-serif text-3xl font-black tracking-[-.03em]">{n}</strong><span className="mt-2 block text-xs leading-snug text-[#6f6a64]">{l}</span></div>)}</div></div></section>

      <section className="px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-[1080px]"><div className="mb-10"><h2 className="font-serif text-4xl font-black tracking-[-.03em] sm:text-5xl">Who runs it today</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6f6a64]">BitBuzz is two people. It has been bigger, and it will be again. Right now the masthead is short on purpose, and everything published passes through it.</p></div><div className="grid gap-px border border-[#ded9d0] bg-[#ded9d0] md:grid-cols-2">{team.map((person) => <article key={person.name} className="bg-[#fffdfa] p-7 sm:p-9"><div className="flex items-center gap-4"><img src={person.image} alt={person.name} className="h-20 w-20 shrink-0 rounded-full object-cover object-top ring-1 ring-[#ded9d0]" /><div><h3 className="font-serif text-2xl font-bold">{person.name}</h3><p className="mt-1 text-xs font-semibold text-[#b4121f]">{person.role}</p><p className="mt-1 text-xs text-[#6f6a64]">{person.where}</p></div></div><p className="mt-6 text-sm leading-[1.75] text-[#35312d]">{person.bio}</p><div className="mt-6 flex flex-wrap gap-2"><a href={`mailto:${person.email}`} className="inline-flex items-center gap-2 rounded-full bg-[#14110f] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#b4121f]">{person.email}</a><a href={person.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center rounded-full border border-[#ded9d0] bg-[#f7f5f0] px-4 py-2 text-xs font-medium transition hover:border-[#b4121f] hover:text-[#b4121f]">{person.linkLabel}</a></div></article>)}</div></div></section>

      <section className="border-y border-[#ded9d0] bg-[#fffdfa] px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-[1080px]"><h2 className="font-serif text-4xl font-black tracking-[-.03em] sm:text-5xl">Our story</h2><p className="mt-3 text-sm text-[#6f6a64]">How a school-time side project turned into something 32,000 students use.</p><div className="mt-12 max-w-[680px] font-serif text-[18px] leading-[1.78] text-[#26221f]"><p className="mb-6">The opportunities were never the problem. Scholarships, research programmes, olympiads, developer grants and fellowships all exist, most of them are free to enter, and a lot of them go under-subscribed every single year. What's missing is the memo. It travels through counsellors, alumni networks and family friends, and if you aren't standing near one of those, you find out after the deadline.</p><p className="mb-6">BitBuzz started in Grade 9, in Noida, as a reaction to exactly that. Not a blog, not a content platform. A distribution fix. The premise was narrow and it hasn't changed: collect the things worth knowing about, check they're real, explain them in language a fifteen-year-old can act on, and publish them where students already are.</p><h3 className="mb-4 mt-12 text-2xl font-bold">What we actually do</h3><p className="mb-6">Three things, and deliberately not a fourth. <strong>We write:</strong> original breakdowns of space, aviation, biotech, AI and the rest, written so you don't need a degree to follow them. <strong>We curate:</strong> the Opportunity Feed, a hand-checked directory of scholarships, hackathons, grants and fellowships, where every entry is verified before it goes up and deadlines are checked, not scraped. <strong>We defend:</strong> Flag It, a scam-watch desk that documents the fake scholarship portals, cloned application pages and fee-first programmes that hunt students specifically.</p><p className="mb-6">Flag It has published 34 investigated cases so far, totalling roughly ₹16.5 lakh (about $19,870) in losses students didn't take. It is also, by a distance, the most-read thing on the site, which tells you how badly it was needed.</p><blockquote className="my-10 border-l-[3px] border-[#b4121f] pl-6"><p className="text-2xl italic leading-[1.5]">The student who gets the fellowship usually isn't the most talented one. They're the best-informed one. That gap is fixable, and it shouldn't take an institution to fix it.</p><cite className="mt-3 block font-sans text-xs not-italic text-[#6f6a64]">Hridhaan Sahay, founder</cite></blockquote><h3 className="mb-4 mt-12 text-2xl font-bold">What we refuse to do</h3><p className="mb-6">No sponsored placements. No paid listings. No engagement-farmed feed engineered to keep anyone scrolling. No auto-scraped listings dumped in unchecked. Those four refusals cost us revenue and reach, and they are the reason a BitBuzz listing means something. An entry is there because it's worth your time, not because someone bought the slot.</p><h3 className="mb-4 mt-12 text-2xl font-bold">How it grew</h3><div className="mt-8 border-l border-[#ded9d0]">{timeline.map(([when,what,text], i) => <div key={when} className="relative pb-8 pl-12 last:pb-0"><span className="absolute -left-[15px] top-0 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-[#ded9d0] bg-[#fffdfa] font-sans text-[10px] font-bold text-[#b4121f]">{String(i + 1).padStart(2,"0")}</span><div className="font-sans text-xs font-semibold text-[#6f6a64]">{when}</div><div className="mt-1 text-lg font-bold">{what}</div><p className="mt-2 font-sans text-sm leading-[1.7] text-[#3b3630]">{text}</p></div>)}</div><h3 className="mb-4 mt-12 text-2xl font-bold">Where it goes next</h3><p className="mb-6">Chanakya AI gets sharper at matching a student's real profile to live openings rather than listing everything at once. Flag It moves from published case notes toward something students can query before they hand over money. And the alumni network, meaning the people below plus everyone the platform has helped, becomes a route for students who've been through a programme to guide the ones applying to it.</p><p>None of this needed funding, an institution, or permission. It needed someone to decide the problem was worth solving and then keep publishing. That part is still the whole strategy.</p></div></div></section>

      <section className="px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-[1080px]"><h2 className="font-serif text-4xl font-black tracking-[-.03em] sm:text-5xl">Past interns & staff</h2><p className="mt-3 max-w-xl text-sm leading-relaxed text-[#6f6a64]">Eleven people, five countries. They built pieces of BitBuzz that are still running, then moved on to their own things. The work stayed.</p><div className="mt-10 border-t border-[#ded9d0]">{alumni.map(([initials,name,where,role,bio]) => <div key={name} className="grid gap-4 border-b border-[#eae6de] py-6 md:grid-cols-[46px_1.15fr_.85fr_1.6fr] md:items-start md:gap-6"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f7f5f0] font-serif text-sm font-bold text-[#9a938b] ring-1 ring-[#ded9d0]">{initials}</div><div><h3 className="font-serif text-xl font-bold">{name}</h3><p className="mt-1 text-xs text-[#6f6a64]">{where}</p></div><div><p className="text-sm font-medium text-[#413c37]">{role}</p><p className="mt-1 text-xs text-[#6f6a64]">Former</p></div><p className="text-sm leading-[1.7] text-[#4a453f]">{bio}</p></div>)}</div></div></section>

      <section className="relative overflow-hidden bg-[#0d0c0b] px-5 py-24 text-center text-[#f7f5f0] sm:px-8"><div className="mx-auto max-w-3xl"><p className="font-serif text-[clamp(4rem,10vw,8rem)] font-black leading-[.88] tracking-[-.04em]"><span className="block text-[.28em] font-normal italic text-white/40">We are</span><span className="block">BITBUZZ</span><span className="block text-[.8em] tracking-[.05em] text-transparent" style={{ WebkitTextStroke: "1.4px #b4121f" }}>SQUAD</span></p><p className="mx-auto mt-10 max-w-xl font-serif text-lg leading-[1.7] text-white/60">Two on the masthead, eleven in the alumni roll, and thirty-two thousand students who read it. We post the news that has to reach you, and we don't ask permission first.</p></div></section>

      <div className="grid md:grid-cols-2"><a href="/home" className="bg-[#fffdfa] p-9 transition hover:bg-[#f0ede6] sm:p-12"><h3 className="font-serif text-2xl font-bold">Read the newsroom</h3><p className="mt-3 max-w-md text-sm leading-[1.7] text-[#4a453f]">Space, aviation, biotech, AI and the rest, written to be understood, not to impress.</p><span className="mt-5 inline-block text-sm font-semibold text-[#b4121f]">Open BitBuzz →</span></a><a href="/home#flag-it" className="border-t border-[#ded9d0] bg-[#fffdfa] p-9 transition hover:bg-[#f0ede6] md:border-l md:border-t-0 sm:p-12"><h3 className="font-serif text-2xl font-bold">Report a scam to Flag It</h3><p className="mt-3 max-w-md text-sm leading-[1.7] text-[#4a453f]">Seen a fake scholarship portal or a fee-first programme? Send it in. We investigate and publish so the next student doesn't fall for it.</p><span className="mt-5 inline-block text-sm font-semibold text-[#b4121f]">Go to Flag It →</span></a></div>
    </main>
  </div>;
}

export default function InfoPage({ kind }: { kind: InfoPageKind }) {
  if (kind === "about") return <AboutPage />;
  const data = pageData[kind];
  return <div className="min-h-screen bg-black text-white"><Header /><main className="relative overflow-hidden"><div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#376bd1]/10 blur-[130px]" /><section className="relative mx-auto max-w-[1200px] px-5 pb-24 pt-24 sm:px-8 sm:pt-32"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#83adff]">{data.eyebrow}</p><h1 className="mt-5 max-w-4xl font-serif text-[clamp(3.5rem,8vw,7.5rem)] font-medium leading-[.88] tracking-[-.065em]">{data.title}</h1><p className="mt-8 max-w-2xl text-lg leading-[1.6] text-white/55">{data.description}</p>{kind === "explore" && <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{["Latest stories", "Deep dives", "Student voices", "Explainers", "Innovation", "The big picture"].map((item, i) => <a key={item} href="/home" className="group rounded-[24px] border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.045]"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-white/30">0{i + 1}</span><h2 className="mt-10 font-serif text-3xl tracking-[-.04em]">{item}</h2><span className="mt-5 block text-xs text-white/35 transition group-hover:text-[#83adff]">Explore →</span></a>)}</div>}{kind === "categories" && <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{genres.map((genre, i) => <a key={genre} href={`/home#${genre.toLowerCase()}`} className="group flex min-h-[180px] flex-col justify-between rounded-[24px] border border-white/10 bg-[#080809] p-6 transition hover:-translate-y-1 hover:border-[#5d98ff]/30"><span className="text-xs text-white/25">0{i + 1}</span><div><h2 className="font-serif text-3xl tracking-[-.04em]">{genre}</h2><p className="mt-2 text-xs text-white/35">Stories, discoveries and ideas.</p></div></a>)}</div>}{kind === "opportunities" && <div className="mt-14 grid gap-4 lg:grid-cols-3">{[["Competitions", "Find challenges that put your skills to work."], ["Programs", "Discover student programs, communities and learning opportunities."], ["Events", "Keep up with events worth showing up for."]].map(([title, text]) => <article key={title} className="rounded-[24px] border border-white/10 bg-[#080809] p-7"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-[#83adff]">✦</div><h2 className="mt-12 font-serif text-3xl tracking-[-.04em]">{title}</h2><p className="mt-3 text-sm leading-relaxed text-white/40">{text}</p><a href="/home" className="mt-7 inline-block text-xs font-semibold text-white hover:text-[#83adff]">Explore opportunities →</a></article>)}</div>}</section></main></div>;
}
