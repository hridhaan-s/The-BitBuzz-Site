import { ReactNode } from "react";
import UniversalNavbar from "./UniversalNavbar";

const ACCENT = "#ff7a3d";
const ACCENT_PALE = "#ffe2c9";
const REPORT_URL = "https://bitbuzz.fillout.com/flag-it";
const FEED_URL = "/categories";

const COVERAGE = [
  "Fake internship offers",
  "Phishing links",
  "UPI request scams",
  "Giveaway and lottery cons",
  "Fake job placement fees",
  "Instagram account takeovers",
  "Investment and trading groups",
  "Courier and customs calls",
  "OTP forwarding tricks",
];

type Step = { number: string; title: string; body: string; icon: ReactNode };

const glyph = {
  width: 42,
  height: 42,
  viewBox: "0 0 44 44",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const STEPS: Step[] = [
  {
    number: "01",
    title: "Tell us what happened",
    body: "The message, the link, the account, the amount. Whatever you have in front of you.",
    icon: <svg {...glyph}><path d="M7 12a4 4 0 0 1 4-4h22a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H18l-8 7v-7a3 3 0 0 1-3-3Z" /><path d="M15 17h14M15 23h9" strokeOpacity=".55" /></svg>,
  },
  {
    number: "02",
    title: "Attach the proof",
    body: "Screenshots, a link, a transaction reference or anything else that helps establish what happened.",
    icon: <svg {...glyph}><rect x="9" y="7" width="24" height="18" rx="3" strokeOpacity=".4" /><rect x="13" y="15" width="24" height="22" rx="3" /><circle cx="20" cy="22" r="2.4" strokeOpacity=".6" /><path d="m13 33 7-6 5 4 5-5 7 6" /></svg>,
  },
  {
    number: "03",
    title: "We check it",
    body: "A Flag It editor reviews the report and evidence before anything is considered for publication.",
    icon: <svg {...glyph}><path d="M11 10a3 3 0 0 1 3-3h12l7 7v13" /><path d="M26 7v7h7" strokeOpacity=".5" /><path d="M11 10v18a3 3 0 0 0 3 3h5" /><circle cx="27" cy="29" r="7" /><path d="m24 29 2 2 4-4" /></svg>,
  },
  {
    number: "04",
    title: "We warn others",
    body: "If verified and editorially suitable, the experience can become a public warning without naming the reporter.",
    icon: <svg {...glyph}><path d="M8 34V10l14-6 14 6v24l-14 6Z" /><path d="M22 13v10M22 28v.5" /></svg>,
  },
];

const CSS = `
.fi{--accent:${ACCENT};--accent-pale:${ACCENT_PALE};--line:rgba(255,255,255,.1);--surface:rgba(255,255,255,.035);--muted:rgba(255,255,255,.58);--faint:rgba(255,255,255,.38);--ease:cubic-bezier(.22,1,.36,1);min-height:100vh;background:#050505;color:#fff;-webkit-font-smoothing:antialiased}
.fi *{box-sizing:border-box}.fi-display{font-family:ui-serif,"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;font-weight:500;letter-spacing:-.05em}.fi :focus-visible{outline:2px solid var(--accent);outline-offset:4px;border-radius:10px}
.fi-btn{display:inline-flex;align-items:center;justify-content:center;gap:.55rem;border-radius:999px;padding:.88rem 1.35rem;font-size:.9rem;font-weight:650;line-height:1;transition:transform .3s var(--ease),background .3s,border-color .3s,color .3s}.fi-btn:active{transform:scale(.97)}.fi-solid{background:#fff;color:#000}.fi-solid:hover{background:var(--accent-pale)}.fi-ghost{border:1px solid rgba(255,255,255,.18);color:#fff;background:rgba(255,255,255,.025)}.fi-ghost:hover{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.07)}.fi-alarm{background:var(--accent);color:#190900}.fi-alarm:hover{background:var(--accent-pale)}
.fi-glow{position:absolute;pointer-events:none;border-radius:999px;background:radial-gradient(circle,rgba(255,122,61,.14),transparent 68%);filter:blur(10px)}
.fi-pane{position:relative;overflow:hidden;border:1px solid var(--line);background:var(--surface)}.fi-pane:before{content:"";position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);opacity:.7}
.fi-grid{background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:52px 52px;mask-image:linear-gradient(to bottom,black,transparent 80%)}
.fi-rise{animation:fi-rise .8s var(--ease) both}@keyframes fi-rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
.fi-pulse{animation:fi-pulse 3.2s ease-in-out infinite}@keyframes fi-pulse{0%,100%{opacity:.38}50%{opacity:.9}}
.fi-scan{animation:fi-scan 5.2s cubic-bezier(.5,0,.5,1) infinite}@keyframes fi-scan{0%{transform:translateY(-190px);opacity:0}12%{opacity:.8}88%{opacity:.8}100%{transform:translateY(190px);opacity:0}}
.fi-marquee{display:flex;width:max-content;gap:2.5rem;animation:fi-marquee 42s linear infinite}@keyframes fi-marquee{to{transform:translateX(-50%)}}
.fi-ticker{overflow:hidden;border-block:1px solid var(--line);mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent);-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent)}
@media(prefers-reduced-motion:reduce){.fi-rise,.fi-pulse,.fi-scan,.fi-marquee{animation:none!important}.fi-rise{opacity:1;transform:none}}
`;

function InboxScene(){
  const rows=[0,1,2,3,4];
  return <div className="relative mx-auto w-full max-w-[590px]">
    <div className="absolute -inset-10 rounded-full bg-orange-500/[.06] blur-3xl" />
    <svg className="relative block w-full" viewBox="0 0 560 470" role="img" aria-label="Messages being reviewed with one flagged scam">
      <defs>
        <linearGradient id="fiPanel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".08"/><stop offset=".65" stopColor="#fff" stopOpacity="0"/></linearGradient>
        <linearGradient id="fiScan" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#fff" stopOpacity="0"/><stop offset=".5" stopColor={ACCENT} stopOpacity=".9"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></linearGradient>
        <radialGradient id="fiFlag" cx="50%" cy="50%" r="50%"><stop stopColor={ACCENT} stopOpacity=".5"/><stop offset="1" stopColor={ACCENT} stopOpacity="0"/></radialGradient>
        <clipPath id="fiClip"><rect x="24" y="24" width="512" height="422" rx="30"/></clipPath>
      </defs>
      <rect x="24" y="24" width="512" height="422" rx="30" fill="#090909"/>
      <rect x="24" y="24" width="512" height="422" rx="30" fill="url(#fiPanel)"/>
      <rect x="24.5" y="24.5" width="511" height="421" rx="29.5" fill="none" stroke="#fff" strokeOpacity=".12"/>
      <g clipPath="url(#fiClip)">
        <text x="52" y="59" fill="#fff" fillOpacity=".32" fontSize="10" fontFamily="ui-monospace,monospace" letterSpacing="2">FLAG IT / REVIEW QUEUE</text>
        {rows.map((index)=>{const y=76+index*72;if(index===2)return <g key={index}><ellipse cx="280" cy={y+29} rx="245" ry="70" fill="url(#fiFlag)" className="fi-pulse"/><rect x="52" y={y} width="456" height="58" rx="14" fill={ACCENT} fillOpacity=".08" stroke={ACCENT} strokeOpacity=".6"/><g transform={`translate(72 ${y+14})`} stroke={ACCENT} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M2 28V3.2a.6.6 0 0 1 .4-.6C5.4 1.3 8.2 1.9 11.4 3.2c3.6 1.4 6.5 1.8 9.7.7a.6.6 0 0 1 .9.6v11.4a.6.6 0 0 1-.4.6c-3.2 1.2-6.1.7-9.7-.7-3.2-1.3-6-1.9-9-.5"/></g><rect x="106" y={y+18} width="190" height="8" rx="4" fill={ACCENT_PALE} fillOpacity=".82"/><rect x="106" y={y+34} width="124" height="8" rx="4" fill={ACCENT_PALE} fillOpacity=".35"/><rect x="400" y={y+16} width="84" height="26" rx="13" fill={ACCENT} fillOpacity=".16" stroke={ACCENT} strokeOpacity=".55"/><circle cx="416" cy={y+29} r="3.2" fill={ACCENT}/><text x="427" y={y+33} fill={ACCENT_PALE} fontSize="11" fontFamily="system-ui,sans-serif">Flagged</text></g>;
          return <g key={index}><rect x="52" y={y} width="456" height="58" rx="14" fill="#fff" fillOpacity=".035" stroke="#fff" strokeOpacity=".075"/><circle cx="81" cy={y+29} r="14" fill="#fff" fillOpacity=".06"/><rect x="108" y={y+18} width={index%2?155:190} height="8" rx="4" fill="#fff" fillOpacity=".16"/><rect x="108" y={y+34} width={index%2?105:132} height="8" rx="4" fill="#fff" fillOpacity=".08"/></g>;
        })}
        <g className="fi-scan"><rect x="24" y="205" width="512" height="50" fill="url(#fiPanel)"/><rect x="24" y="228" width="512" height="1.5" fill="url(#fiScan)"/></g>
      </g>
    </svg>
  </div>;
}

export default function FlagItPage(){
  return <div className="fi">
    <style>{CSS}</style>
    <UniversalNavbar />
    <main>
      <section className="relative isolate overflow-hidden border-b border-white/10 px-5 pb-20 pt-28 sm:px-8 lg:pb-28 lg:pt-36">
        <div className="fi-grid absolute inset-x-0 top-0 -z-20 h-[720px]" />
        <div className="fi-glow -left-40 top-0 h-[520px] w-[520px]" />
        <div className="fi-glow right-[-180px] top-20 h-[620px] w-[620px]" />
        <div className="mx-auto grid max-w-[1480px] items-center gap-14 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
          <div className="max-w-[720px]">
            <p className="fi-rise flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.25em]" style={{color:ACCENT,animationDelay:"40ms"}}><span className="h-2 w-2 rounded-full bg-[#ff7a3d] shadow-[0_0_18px_#ff7a3d]"/>Flag It · BitBuzz scam watch</p>
            <h1 className="fi-display fi-rise mt-6 text-[clamp(4rem,8.6vw,8.3rem)] leading-[.82]" style={{animationDelay:"120ms"}}>Spotted a scam?<span className="mt-4 block" style={{color:ACCENT_PALE}}>Flag it.</span></h1>
            <p className="fi-rise mt-8 max-w-[620px] text-base leading-7 text-[var(--muted)] sm:text-lg" style={{animationDelay:"220ms"}}>Someone tried it on you, or nearly did. Send us what happened and the evidence you have. We'll investigate the method and, when it can be verified, turn it into a warning others can actually use.</p>
            <div className="fi-rise mt-9 flex flex-wrap gap-3" style={{animationDelay:"320ms"}}><a href={REPORT_URL} target="_blank" rel="noopener noreferrer" className="fi-btn fi-solid">Report a scam <span aria-hidden="true">↗</span></a><a href={FEED_URL} className="fi-btn fi-ghost">See what's been flagged</a></div>
            <div className="fi-rise mt-12 grid max-w-[650px] grid-cols-3 border-t border-white/10 pt-6" style={{animationDelay:"400ms"}}><div className="pr-4"><p className="text-sm font-semibold">No account</p><p className="mt-1 text-[11px] leading-5 text-white/35">A report can start without signing up.</p></div><div className="border-l border-white/10 px-4"><p className="text-sm font-semibold">No public name</p><p className="mt-1 text-[11px] leading-5 text-white/35">Your identity isn't part of a published warning.</p></div><div className="border-l border-white/10 pl-4"><p className="text-sm font-semibold">Evidence first</p><p className="mt-1 text-[11px] leading-5 text-white/35">Reports are reviewed before publication.</p></div></div>
          </div>
          <div className="fi-rise lg:pl-4" style={{animationDelay:"480ms"}}><InboxScene/><div className="mx-auto mt-3 flex max-w-[590px] items-center justify-between px-2 text-[9px] font-bold uppercase tracking-[.2em] text-white/25"><span>Incoming experience</span><span>Editorial review</span><span>Public warning</span></div></div>
        </div>
      </section>

      <div className="fi-ticker py-3"><div className="fi-marquee text-[10px] font-semibold uppercase tracking-[.18em] text-white/35">{[...COVERAGE,...COVERAGE].map((item,i)=><span key={`${item}-${i}`} className="inline-flex items-center gap-3 whitespace-nowrap"><i className="h-1.5 w-1.5 rounded-full bg-[#ff7a3d]"/>{item}</span>)}</div></div>

      <section className="px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto max-w-[1480px]"><div className="fi-pane rounded-[28px] p-7 sm:p-10 lg:p-12"><div className="relative z-10 grid gap-10 lg:grid-cols-[.62fr_1.38fr] lg:gap-16"><div><p className="text-[10px] font-bold uppercase tracking-[.24em]" style={{color:ACCENT}}>If money has already gone</p><p className="fi-display mt-3 text-[clamp(4rem,8vw,6rem)] leading-none">1930</p><p className="mt-3 max-w-[250px] text-sm leading-6 text-white/40">India's cybercrime helpline. Toll-free, 24×7.</p><div className="mt-7 flex flex-wrap gap-2.5"><a href="tel:1930" className="fi-btn fi-alarm">Call 1930</a><a href="https://cybercrime.gov.in" target="_blank" rel="noopener noreferrer" className="fi-btn fi-ghost">cybercrime.gov.in ↗</a></div></div><div><h2 className="fi-display text-3xl leading-tight sm:text-4xl">Don't wait for the report form.</h2><ol className="mt-6 max-w-[760px]">{[{h:"Call 1930 straight away",b:"Have the transaction ID, amount, date and the bank or wallet involved ready."},{h:"File on the official cybercrime portal",b:"Complete the written complaint and keep the acknowledgement number."},{h:"Tell your bank through its official channel",b:"Block or dispute the affected payment method. Never share an OTP with anyone claiming to be the bank."}].map((item,i)=><li key={item.h} className="grid grid-cols-[2rem_1fr] gap-3 border-t border-white/10 py-5 first:border-t-0 first:pt-0"><span className="text-[10px] font-bold tracking-[.18em] text-white/25">0{i+1}</span><div><p className="text-sm font-semibold">{item.h}</p><p className="mt-1.5 text-sm leading-6 text-white/40">{item.b}</p></div></li>)}</ol></div></div></div><p className="mx-auto mt-5 max-w-[1100px] text-[11px] leading-5 text-white/25">BitBuzz is a student newsroom, not law enforcement. A Flag It report is for public awareness and editorial investigation; it does not open a case, freeze a transfer or recover money. If you are in immediate danger, call 112.</p></div></section>

      <section className="border-y border-white/10 bg-[#090909] px-5 py-16 sm:px-8 lg:py-24"><div className="mx-auto max-w-[1480px]"><div className="max-w-[650px]"><p className="text-[10px] font-bold uppercase tracking-[.25em]" style={{color:ACCENT}}>How Flag It works</p><h2 className="fi-display mt-3 text-5xl leading-[.9] sm:text-7xl">One report.<br/><span className="text-white/45">Four checks.</span></h2><p className="mt-6 text-sm leading-6 text-white/40">You don't need to know whether something is technically a scam before reporting it. Give us the facts; our editors decide whether the evidence is strong enough to publish.</p></div><div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map(step=><article key={step.number} className="fi-pane rounded-[22px] p-6 sm:p-7"><div className="text-white/50">{step.icon}</div><p className="mt-7 text-[10px] font-bold tracking-[.2em] text-white/25">{step.number}</p><h3 className="fi-display mt-2 text-2xl leading-tight">{step.title}</h3><p className="mt-3 text-sm leading-6 text-white/40">{step.body}</p></article>)}</div><div className="mt-8 border-l-2 pl-5 text-sm leading-6 text-white/40" style={{borderColor:ACCENT}}>Reports about private individuals are handled carefully. The goal is to document scam methods and protect people, not start a pile-on.</div></div></section>

      <section className="px-5 py-20 sm:px-8 lg:py-28"><div className="mx-auto max-w-[1480px]"><div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0b0b0b] px-7 py-14 sm:px-12 lg:px-16 lg:py-20"><div className="fi-glow right-[-120px] top-[-180px] h-[500px] w-[500px]"/><div className="relative grid gap-9 lg:grid-cols-[1.2fr_.8fr] lg:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.25em]" style={{color:ACCENT}}>Make the warning useful</p><h2 className="fi-display mt-4 max-w-4xl text-5xl leading-[.88] sm:text-7xl lg:text-8xl">The best scam warning is one that arrives before the next click.</h2></div><div><p className="max-w-md text-sm leading-6 text-white/40">Have an experience worth documenting? Send the details. You don't need to write it perfectly — evidence and context are what matter.</p><a href={REPORT_URL} target="_blank" rel="noopener noreferrer" className="fi-btn fi-solid mt-7">Flag an experience ↗</a></div></div></div></div></section>
    </main>
  </div>;
}
