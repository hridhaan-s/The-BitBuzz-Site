import { useEffect } from "react";

const FLAG_IT_CSS = `
.fi-wrap { font-family: 'Syne', sans-serif; padding: 1rem 0; }
.fi-banner { background: #0A0A0A; border: 2px solid #222; border-radius: 8px; overflow: hidden; display: flex; flex-direction: column; align-items: stretch; position: relative; cursor: pointer; box-shadow: 5px 5px 0 #FF2B2B; transition: transform 0.22s cubic-bezier(.22,1,.36,1), box-shadow 0.22s cubic-bezier(.22,1,.36,1); }
.fi-banner:hover { transform: translate(-3px, -3px); box-shadow: 8px 8px 0 #FF2B2B; }
.fi-banner:hover .fi-stripe { height: 8px; }
.fi-banner:hover .fi-pennant { background: #FFD600; animation-duration: 0.9s; }
.fi-banner:hover .fi-heading span { color: #FFD600; }
.fi-banner:hover .fi-stat-num { color: #FFD600; }
.fi-banner:hover .fi-sub { color: rgba(245,240,232,0.8); }
.fi-banner:hover .fi-btn { background: #B80000; transform: translate(-1px,-1px); box-shadow: 4px 4px 0 #F5F0E8; }
.fi-stripe { height: 6px; width: 100%; background: repeating-linear-gradient(90deg,#FF2B2B 0px,#FF2B2B 12px,#FFD600 12px,#FFD600 24px); flex-shrink: 0; transition: height 0.22s; }
.fi-main { display: flex; align-items: center; justify-content: center; gap: 28px; padding: 28px 32px; text-align: center; flex-wrap: wrap; }
.fi-flag-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; animation: fi-bob 3s ease-in-out infinite; }
@keyframes fi-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.fi-pole { width: 5px; height: 64px; background: #F5F0E8; border-radius: 3px; position: relative; }
.fi-pennant { position: absolute; top: 6px; left: 5px; width: 28px; height: 28px; background: #FF2B2B; clip-path: polygon(0 0,100% 50%,0 100%); animation: fi-wave 2.2s ease-in-out infinite; transform-origin: left center; transition: background 0.2s; }
@keyframes fi-wave { 0%,100% { clip-path: polygon(0 0,100% 50%,0 100%); } 50% { clip-path: polygon(0 6%,93% 50%,0 94%); } }
.fi-center { flex: 1; min-width: 220px; }
.fi-label { font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: #FFD600; margin-bottom: 8px; animation: fi-fade .6s ease forwards; }
.fi-heading { font-size: 26px; font-weight: 800; color: #F5F0E8; letter-spacing: -1px; line-height: 1.1; text-transform: uppercase; margin-bottom: 10px; animation: fi-slide .5s ease .1s both; }
.fi-heading span { color: #FF2B2B; transition: color .22s; }
.fi-tagline { font-family: 'Space Mono', monospace; font-size: 10px; color: rgba(245,240,232,.55); letter-spacing: .06em; margin-bottom: 6px; animation: fi-slide .5s ease .2s both; }
.fi-story { font-family: 'Space Mono', monospace; font-size: 9.5px; color: rgba(245,240,232,.38); letter-spacing: .04em; line-height: 1.6; max-width: 380px; margin: 0 auto; animation: fi-slide .5s ease .3s both; transition: color .22s; }
.fi-right { display: flex; flex-direction: column; align-items: center; gap: 14px; flex-shrink: 0; animation: fi-slide .5s ease .4s both; }
.fi-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,43,43,.15); border: 1px solid rgba(255,43,43,.4); border-radius: 20px; padding: 5px 12px; font-family: 'Space Mono', monospace; font-size: 9px; color: #FF2B2B; letter-spacing: .1em; text-transform: uppercase; }
.fi-dot { width: 7px; height: 7px; background: #FF2B2B; border-radius: 50%; animation: fi-pulse 1.4s ease-in-out infinite; flex-shrink: 0; }
@keyframes fi-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .4; transform: scale(.6); } }
.fi-btn { background: #FF2B2B; color: #fff; font-family: 'Syne', sans-serif; font-size: 12px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; padding: 11px 22px; border: 2px solid #F5F0E8; cursor: pointer; box-shadow: 3px 3px 0 #F5F0E8; transition: transform .15s, box-shadow .15s, background .15s; white-space: nowrap; text-decoration: none; display: inline-block; border-radius: 2px; }
.fi-built { font-family: 'Space Mono', monospace; font-size: 8.5px; color: rgba(245,240,232,.25); letter-spacing: .08em; text-align: center; }
.fi-ticker { background: #FF2B2B; overflow: hidden; white-space: nowrap; padding: 6px 0; transition: background .22s; }
.fi-banner:hover .fi-ticker { background: #B80000; }
.fi-ticker-inner { display: inline-block; animation: fi-ticker 22s linear infinite; font-family: 'Space Mono', monospace; font-size: 9px; letter-spacing: .08em; color: #fff; text-transform: uppercase; }
.fi-banner:hover .fi-ticker-inner { animation-duration: 12s; }
.fi-ticker-inner span { margin: 0 2.5rem; opacity: .9; }
.fi-ticker-inner span::before { content: '⚑ '; opacity: .6; }
@keyframes fi-ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes fi-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes fi-slide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 640px) { .fi-main { gap: 20px; padding: 24px 18px; } .fi-heading { font-size: 23px; } }
`;

function addStyles() { const style = document.createElement("style"); style.dataset.bitbuzzFlagIt = "true"; style.textContent = FLAG_IT_CSS; document.head.appendChild(style); }
function addFontLink() { if (document.querySelector('link[data-bitbuzz-flag-fonts="true"]')) return; const link = document.createElement("link"); link.rel = "stylesheet"; link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Mono&display=swap"; link.dataset.bitbuzzFlagFonts = "true"; document.head.appendChild(link); }
function removeLandingFooter() { document.querySelector(".bb footer")?.remove(); }
function replaceFlagItSection() {
  const heading = Array.from(document.querySelectorAll("h2")).find((node) => node.textContent?.trim() === "Flag It");
  const section = heading?.closest("section");
  if (!section || section.querySelector(".fi-banner")) return;
  section.innerHTML = `
    <div class="fi-wrap"><div class="fi-banner"><div class="fi-stripe"></div><div class="fi-main"><div class="fi-flag-icon"><div class="fi-pole"><div class="fi-pennant"></div></div></div><div class="fi-center"><div class="fi-label">Community Cyber Safety Intelligence</div><div class="fi-heading">Spot a scam? <span>Flag it.</span></div><div class="fi-tagline">Report frauds · protect your community · stop scammers</div><div class="fi-story">Every report you make <b>protects someone's savings, identity, and dignity.</b></div></div><div class="fi-right"><div class="fi-badge"><span class="fi-dot"></span>Now live</div><a class="fi-btn" href="/flag-it">Visit Now →</a><div class="fi-built">Built by students · Free forever</div></div></div><div class="fi-ticker"><div class="fi-ticker-inner"><span>© 2025 Flagit</span><span>Not affiliated with any government or financial body</span><span>Our aim is to educate people and volunteer towards stopping cybercrime</span><span>Built by students, for everyone</span><span>© 2025 Flagit</span><span>Not affiliated with any government or financial body</span><span>Our aim is to educate people and volunteer towards stopping cybercrime</span><span>Built by students, for everyone</span></div></div></div></div>`;
}
function updateLandingCopy() {
  const heroKicker = Array.from(document.querySelectorAll("main p")).find((node) => node.textContent?.trim() === "Written and edited by students");
  if (heroKicker) { const dot = heroKicker.querySelector("span"); heroKicker.textContent = ""; if (dot) heroKicker.appendChild(dot); heroKicker.appendChild(document.createTextNode("100% Run by Students for Students")); }
  const heroTitle = Array.from(document.querySelectorAll("h1")).find((node) => node.textContent?.includes("brighter tomorrow"));
  if (heroTitle) { const accent = heroTitle.querySelector("span"); if (heroTitle.firstChild) heroTitle.firstChild.nodeValue = "News "; if (accent) accent.textContent = "That Matters"; }
  const heroDescription = Array.from(document.querySelectorAll("main p")).find((node) => node.textContent?.includes("BitBuzz covers science, technology, cybersecurity, aviation, biology and innovation"));
  if (heroDescription) heroDescription.textContent = "BitBuzz covers science, technology, cybersecurity, aviation, biology and innovation for people who want the story underneath the headline. Curious minds writing for other curious minds. 0 Sponsorship or Politics";
  const howWorks = Array.from(document.querySelectorAll("a")).find((node) => node.textContent?.trim() === "How BitBuzz works");
  if (howWorks) { howWorks.style.backgroundColor = "rgba(255,255,255,.1)"; howWorks.style.borderColor = "rgba(255,255,255,.45)"; howWorks.style.color = "#fff"; howWorks.style.boxShadow = "0 0 0 1px rgba(255,255,255,.04) inset"; }
  const writeLink = Array.from(document.querySelectorAll("a")).find((node) => node.textContent?.trim() === "Write for BitBuzz");
  if (writeLink) { writeLink.textContent = "Sign Up now"; writeLink.setAttribute("href", "/signup"); }
}
function ensureAuthPrivacyLink() {
  document.querySelectorAll<HTMLElement>(".bb-auth-meta").forEach((meta) => {
    if (meta.querySelector('[data-bitbuzz-privacy-link="true"]')) return;
    const row = document.createElement("div");
    row.style.marginTop = ".75rem";
    const link = document.createElement("a");
    link.href = "/privacy";
    link.textContent = "Privacy Policy";
    link.dataset.bitbuzzPrivacyLink = "true";
    link.className = "bb-auth-link";
    link.setAttribute("aria-label", "Read BitBuzz Privacy Policy");
    row.appendChild(link);
    meta.appendChild(row);
  });
}
export default function LandingPageFinalizer() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    addFontLink();
    addStyles();
    const apply = () => { removeLandingFooter(); updateLandingCopy(); replaceFlagItSection(); ensureAuthPrivacyLink(); };
    const frame = window.requestAnimationFrame(apply);
    const observer = new MutationObserver(() => ensureAuthPrivacyLink());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => { window.cancelAnimationFrame(frame); observer.disconnect(); document.querySelector('style[data-bitbuzz-flag-it="true"]')?.remove(); document.querySelector('link[data-bitbuzz-flag-fonts="true"]')?.remove(); };
  }, []);
  return null;
}
