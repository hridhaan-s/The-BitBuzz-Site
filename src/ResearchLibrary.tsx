import { useMemo } from "react";
import { createRoot, type Root } from "react-dom/client";

const ACCENT = "#ff7a3d";
const ACCENT_PALE = "#ffe2c9";

const PAPERS = [
  { id: "black-hole", category: "Space and astrophysics", title: "What actually happens inside a black hole", blurb: "Singularities, bent spacetime, Hawking radiation, and the point where our physics stops producing answers.", href: "https://docs.google.com/document/d/1vtL-EkJ8zl-XDAqSD2GMGwpP6Hw6tGu1/preview", image: "https://cdn.hackclub.com/019e32dd-14ba-722f-a20b-c22631755295/image.png", alt: "A black hole rendered against deep space.", featured: true },
  { id: "stealth", category: "Military and aviation", title: "The stealth jet that outsmarts radar", blurb: "Radar evasion, the plasma myth, absorbent coatings, and where air combat goes next.", href: "https://docs.google.com/document/d/1pfyGnUnyX__5pWrQ6JvZJfvqRcI-vvQ8/preview", image: "https://images.unsplash.com/photo-1544016768-982d1554f0b9?q=80&w=1600&auto=format&fit=crop", alt: "A military jet in flight against an overcast sky." },
  { id: "flight", category: "Physics and aviation", title: "Why airplanes don't fall from the sky", blurb: "Lift, drag, thrust, and why the Bernoulli explanation you were taught is incomplete.", href: "https://docs.google.com/document/d/1-Pr6EIHOc-Fx-0Wx1l3xUXPVyHiYc1xr/preview", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1600&auto=format&fit=crop", alt: "An airliner seen from below as it climbs." },
  { id: "hypersonic", category: "Defence and missiles", title: "The science behind hypersonic missiles", blurb: "Mach 5 and up, thermal shielding, and why interception is close to impossible.", href: "https://docs.google.com/document/d/1Ag1jXH1Tbob0oIvvFatizrFqVxQ7hiau/preview", image: "https://cdn.hackclub.com/019e32ec-15b0-7a03-8dfa-7c0517a3bc5d/image.png", alt: "A missile climbing through the upper atmosphere." }
];

const CSS = `
.rl{background:#000;color:#fff;-webkit-font-smoothing:antialiased}.rl-display{font-family:ui-serif,"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-weight:500;letter-spacing:-.045em}.rl-num{font-variant-numeric:tabular-nums}.rl :focus-visible{outline:2px solid ${ACCENT};outline-offset:4px;border-radius:14px}.rl-dot{animation:rl-pulse 2.6s ease-in-out infinite}@keyframes rl-pulse{0%,100%{opacity:1}50%{opacity:.28}}.rl-feature{position:relative;display:block;overflow:hidden;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.035);border-radius:22px;transition:border-color .5s cubic-bezier(.22,1,.36,1)}.rl-feature:hover{border-color:rgba(255,255,255,.26)}.rl-feature img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s cubic-bezier(.22,1,.36,1)}.rl-feature:hover img{transform:scale(1.04)}.rl-arrow{transition:transform .4s cubic-bezier(.22,1,.36,1)}.rl-feature:hover .rl-arrow,.rl-row:hover .rl-arrow{transform:translateX(4px)}.rl-row{display:grid;align-items:center;gap:1rem;grid-template-columns:56px 1fr 20px;padding:1.15rem .25rem;border-top:1px solid rgba(255,255,255,.1);transition:background-color .35s,padding-left .35s}.rl-row:last-of-type{border-bottom:1px solid rgba(255,255,255,.1)}.rl-row:hover{background:rgba(255,255,255,.04);padding-left:.85rem}.rl-thumb{width:56px;height:56px;border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.1);background:#0a0a0a}.rl-thumb img{width:100%;height:100%;object-fit:cover}@media(min-width:640px){.rl-feature{border-radius:28px}.rl-row{grid-template-columns:72px 1fr 24px;padding-block:1.4rem}.rl-thumb{width:72px;height:72px;border-radius:12px}}@media(prefers-reduced-motion:reduce){.rl *,.rl *:before{animation:none!important;transition-duration:.01ms!important}}
`;

function Arrow({ size = 16 }: { size?: number }) {
  return <svg className="rl-arrow" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>;
}

export default function ResearchLibrary() {
  const { feature, rest } = useMemo(() => { const featured = PAPERS.find(p => p.featured) ?? PAPERS[0]; return { feature: featured, rest: PAPERS.filter(p => p.id !== featured.id) }; }, []);
  return <section className="rl px-5 py-24 lg:px-8 lg:py-32"><style>{CSS}</style><div className="mx-auto max-w-[1080px]">
    <header className="max-w-[22ch]"><p className="flex items-center gap-2.5 text-[.82rem] text-white/40"><span className="rl-dot h-[7px] w-[7px] rounded-full" style={{background:ACCENT}} aria-hidden="true"/>BitBuzz Research</p><h2 className="rl-display mt-6 text-[clamp(2.4rem,6.4vw,4.4rem)] leading-[.98]">Deep dives into <span style={{color:ACCENT_PALE}}>the tech that sounds impossible.</span></h2></header>
    <p className="mt-6 max-w-[58ch] text-[clamp(1rem,1.3vw,1.15rem)] leading-[1.62] text-white/70">Black holes, stealth aircraft, hypersonic weapons and the physics of flight, written out properly and without the hand-waving. Free to read, no account.</p>
    <div className="mt-16 flex items-baseline justify-between gap-6 border-b border-white/10 pb-4"><h3 className="text-[.85rem] text-white/70">On display</h3><p className="rl-num text-[.8rem] text-white/40">{PAPERS.length} papers</p></div>
    <a href={feature.href} target="_blank" rel="noopener noreferrer" className="rl-feature mt-6 lg:grid lg:grid-cols-[1fr_1.05fr]"><div className="relative z-[2] flex flex-col justify-center p-7 sm:p-10 lg:p-12"><p className="text-[.75rem] text-white/40">{feature.category}</p><h3 className="rl-display mt-4 text-[clamp(1.75rem,4vw,2.7rem)] leading-[1.04]">{feature.title}</h3><p className="mt-5 max-w-[44ch] text-[.97rem] leading-[1.6] text-white/70">{feature.blurb}</p><span className="mt-8 inline-flex items-center gap-2 text-[.9rem] font-medium">Read the paper <Arrow/></span></div><div className="relative order-first aspect-[16/10] overflow-hidden lg:order-last lg:aspect-auto lg:h-full"><img src={feature.image} alt={feature.alt} loading="lazy" decoding="async"/><div className="pointer-events-none absolute inset-0" style={{background:"linear-gradient(90deg,rgba(0,0,0,.55),rgba(0,0,0,0) 45%)"}}/></div></a>
    <div className="mt-16 flex items-baseline justify-between gap-6 border-b border-white/10 pb-4"><h3 className="text-[.85rem] text-white/70">The catalogue</h3><p className="text-[.8rem] text-white/40">Newest first</p></div>
    <div>{rest.map(p => <a key={p.id} href={p.href} target="_blank" rel="noopener noreferrer" className="rl-row"><span className="rl-thumb block"><img src={p.image} alt={p.alt} loading="lazy" decoding="async"/></span><span className="block min-w-0"><span className="flex flex-wrap items-baseline gap-x-3 text-[.74rem] text-white/40"><span>{p.category}</span></span><span className="rl-display mt-1.5 block text-[clamp(1.1rem,2vw,1.4rem)] leading-[1.12]">{p.title}</span><span className="mt-1.5 block truncate text-[.86rem] text-white/40">{p.blurb}</span></span><span className="text-white/40"><Arrow size={18}/></span></a>)}</div>
    <p className="mt-8 text-[.82rem] text-white/40">New papers are added as they're finished. Opens in Google Docs, read-only.</p>
  </div></section>;
}

let researchRoot: Root | null = null;
let researchHost: HTMLDivElement | null = null;

export function mountResearchLibrary() {
  if (window.location.pathname !== "/" || researchRoot) return;

  // LandingPageFinalizer replaces the original Flag It section contents,
  // including its h2. The finished Flag It banner is therefore the stable
  // insertion point for Research.
  const flagBanner = document.querySelector(".fi-banner");
  const flagSection = flagBanner?.closest("section");
  if (!flagSection) return;

  researchHost = document.createElement("div");
  researchHost.dataset.bitbuzzResearchLibrary = "true";
  flagSection.insertAdjacentElement("afterend", researchHost);
  researchRoot = createRoot(researchHost);
  researchRoot.render(<ResearchLibrary />);
}

export function unmountResearchLibrary() {
  researchRoot?.unmount();
  researchRoot = null;
  researchHost?.remove();
  researchHost = null;
}
