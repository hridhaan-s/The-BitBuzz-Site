import { FormEvent, useState } from "react";
import { supabase } from "./lib/supabase";

const HERO_IMAGE = "https://cdn.hackclub.com/01a08fae-80b9-7d9e-99e4-72a22146ff1c/02ac03955d0a3a2cf64e0a388e23b10fe919f71c";
const genres = ["Space", "Cybersecurity", "Tech", "Aviation", "Innovations"];

function Mark() {
  return <svg width="31" height="31" viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="16" r="5.5" fill="currentColor"/><ellipse cx="16" cy="16" rx="14" ry="6.5" transform="rotate(-25 16 16)" stroke="currentColor" strokeWidth="2.2"/><circle cx="26.2" cy="10.4" r="1.7" fill="currentColor"/></svg>;
}

function Arrow() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13"/><path d="m13 6 6 6-6 6"/></svg>;
}

function SearchIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg>;
}

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const openLogin = () => { setError(""); setLoginOpen(true); setMenuOpen(false); };
  const closeLogin = () => { if (!loading) setLoginOpen(false); };

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    window.location.href = "/?view=news";
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="landing-nav fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-5 lg:px-8">
          <a href="#top" className="flex shrink-0 items-center gap-2.5 font-serif text-[24px] font-semibold tracking-[-0.05em]"><Mark /><span>BitBuzz</span></a>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Landing navigation">
            <a href="#top" className="landing-nav-link landing-active">Home</a>
            <a href="#explore" className="landing-nav-link">Explore</a>
            <a href="#categories" className="landing-nav-link">Categories</a>
            <a href="#opportunities" className="landing-nav-link">Opportunities</a>
            <a href="#about" className="landing-nav-link">About</a>
          </nav>
          <div className="hidden items-center gap-2 lg:flex">
            <button type="button" aria-label="Search" className="landing-icon-button"><SearchIcon /></button>
            <button type="button" onClick={openLogin} className="landing-login">Login</button>
            <button type="button" onClick={openLogin} className="landing-primary">Get Started <Arrow /></button>
          </div>
          <button type="button" onClick={() => setMenuOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 lg:hidden" aria-label="Open menu">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
        </div>
      </header>

      <main id="top">
        <section className="landing-hero relative min-h-[760px] overflow-hidden lg:min-h-[850px]">
          <img src={HERO_IMAGE} alt="Earth viewed from space" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.94)_0%,rgba(0,0,0,.75)_36%,rgba(0,0,0,.28)_68%,rgba(0,0,0,.52)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_55%,rgba(47,126,255,.25),transparent_34%)]" />
          <div className="relative mx-auto flex min-h-[760px] max-w-[1480px] items-center px-5 pb-20 pt-28 lg:min-h-[850px] lg:px-8">
            <div className="max-w-[760px]">
              <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75 backdrop-blur-md"><span className="h-1.5 w-1.5 rounded-full bg-[#4d8dff] shadow-[0_0_14px_#4d8dff]"/> Student run <span className="text-white/25">•</span> Global impact</div>
              <h1 className="font-serif text-[clamp(4rem,8vw,8rem)] font-medium leading-[.86] tracking-[-.065em]">News for a <span className="block text-[#5d98ff]">brighter tomorrow.</span></h1>
              <p className="mt-8 max-w-[650px] text-[clamp(1.05rem,1.5vw,1.3rem)] leading-[1.45] text-white/65">BitBuzz is a student run news and awareness platform covering science, technology, cybersecurity, aviation, biology and innovation, made for curious minds by curious minds.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <button type="button" onClick={openLogin} className="landing-primary landing-primary-large">Get Started <Arrow /></button>
                <a href="?view=news" className="landing-secondary">Enter the newsroom</a>
              </div>
              <div className="mt-14 flex flex-wrap gap-8 border-t border-white/15 pt-7">
                <div><strong className="block text-[27px] font-semibold tracking-[-.04em]">24K+</strong><span className="text-[12px] text-white/50">Monthly visitors</span></div>
                <div className="border-l border-white/15 pl-8"><strong className="block text-[27px] font-semibold tracking-[-.04em]">50+</strong><span className="text-[12px] text-white/50">Countries</span></div>
                <div className="border-l border-white/15 pl-8"><strong className="block text-[27px] font-semibold tracking-[-.04em]">100%</strong><span className="text-[12px] text-white/50">Student run</span></div>
              </div>
            </div>
            <div className="absolute bottom-20 right-8 hidden max-w-[230px] text-right xl:block"><p className="font-serif text-[31px] italic leading-[1.05] text-white/70">A more informed generation.</p><div className="ml-auto mt-4 h-px w-28 rotate-[-7deg] bg-white/45"/><p className="mt-5 text-[9px] font-bold uppercase tracking-[0.25em] text-white/45">Real news. Brighter minds.</p></div>
          </div>
          <a href="#explore" className="absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[9px] font-bold uppercase tracking-[0.24em] text-white/45"><span className="h-9 w-5 rounded-full border border-white/35 p-1"><span className="block h-2 w-1 rounded-full bg-white/70"/></span>Scroll to explore</a>
        </section>

        <section id="explore" className="landing-light px-5 py-24 text-black lg:px-8 lg:py-32">
          <div className="mx-auto grid max-w-[1280px] gap-16 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div><p className="mb-6 text-[10px] font-bold uppercase tracking-[0.22em] text-[#246cf2]">01 / Why BitBuzz</p><h2 className="max-w-4xl font-serif text-[clamp(3.2rem,6vw,6.5rem)] font-medium leading-[.88] tracking-[-.06em]">A more informed <em>generation.</em></h2><p className="mt-8 max-w-[610px] text-[18px] leading-[1.55] text-black/55">The internet is full of noise. We build a place where students can find stories worth understanding, opportunities worth chasing and ideas worth sharing.</p><a href="?view=news" className="mt-9 inline-flex items-center gap-3 border-b border-black pb-2 text-[13px] font-semibold">Explore the newsroom <Arrow /></a></div>
            <div className="landing-blue-card relative overflow-hidden rounded-[28px] p-8 sm:p-10"><div className="absolute right-[-20%] top-[-25%] h-72 w-72 rounded-full border border-white/20"/><div className="absolute bottom-[-25%] left-[-10%] h-64 w-64 rounded-full border border-white/15"/><p className="relative text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">Built differently</p><div className="relative mt-20 grid grid-cols-2 gap-y-10"><div><strong className="block text-4xl font-semibold">5</strong><span className="text-sm text-white/60">core genres</span></div><div><strong className="block text-4xl font-semibold">1</strong><span className="text-sm text-white/60">student newsroom</span></div><div><strong className="block text-4xl font-semibold">∞</strong><span className="text-sm text-white/60">ideas to discover</span></div><div><strong className="block text-4xl font-semibold">24K+</strong><span className="text-sm text-white/60">visitors reached</span></div></div></div>
          </div>
        </section>

        <section id="categories" className="bg-[#f4f4f2] px-5 py-20 text-black lg:px-8 lg:py-28"><div className="mx-auto max-w-[1280px]"><div className="flex flex-col justify-between gap-5 border-b border-black/10 pb-7 sm:flex-row sm:items-end"><div><p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#246cf2]">02 / Categories</p><h2 className="font-serif text-[clamp(2.8rem,5vw,5.2rem)] leading-none tracking-[-.055em]">Find your signal.</h2></div><a href="?view=news" className="inline-flex items-center gap-2 text-sm font-semibold">Browse all <Arrow /></a></div><div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-2 lg:grid-cols-5">{genres.map((genre, index) => <a key={genre} href={`?view=news#${genre.toLowerCase()}`} className="group bg-[#f4f4f2] p-7 transition hover:bg-black hover:text-white lg:min-h-[220px]"><span className="text-[10px] font-bold text-black/35 group-hover:text-white/35">0{index + 1}</span><strong className="mt-20 block font-serif text-2xl tracking-[-.03em]">{genre}</strong><span className="mt-2 inline-flex text-black/35 transition group-hover:translate-x-1 group-hover:text-white/60"><Arrow /></span></a>)}</div></div></section>

        <section id="opportunities" className="bg-black px-5 py-24 text-white lg:px-8 lg:py-32"><div className="mx-auto grid max-w-[1280px] gap-14 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><p className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#5d98ff]">03 / Opportunities</p><h2 className="font-serif text-[clamp(3rem,6vw,6rem)] leading-[.88] tracking-[-.06em]">Do more than <em>read.</em></h2></div><div><p className="max-w-[620px] text-xl leading-[1.5] text-white/55">Discover competitions, grants, programs, events and ways to build something that matters.</p><a href="?view=news" className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-black">See opportunities <Arrow /></a></div></div></section>

        <section id="about" className="landing-light px-5 py-24 text-black lg:px-8 lg:py-32"><div className="mx-auto max-w-[1280px] border-t border-black/10 pt-10"><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#246cf2]">04 / About BitBuzz</p><div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1fr]"><h2 className="font-serif text-[clamp(3rem,6vw,6rem)] leading-[.9] tracking-[-.06em]">News by students. <span className="text-black/35">For everyone.</span></h2><div><p className="text-lg leading-[1.6] text-black/55">BitBuzz started with a simple idea: students deserve journalism that respects their curiosity. We cover the worlds that shape tomorrow and give young people a place to participate in them.</p><a href="?view=news" className="mt-8 inline-flex items-center gap-3 rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white">Enter BitBuzz <Arrow /></a></div></div></div></section>
      </main>

      <footer className="border-t border-white/10 bg-black px-5 py-10 text-white lg:px-8"><div className="mx-auto flex max-w-[1280px] flex-col gap-8 sm:flex-row sm:items-center sm:justify-between"><a href="#top" className="flex items-center gap-2.5 font-serif text-2xl font-semibold"><Mark />BitBuzz</a><p className="text-xs text-white/35">News, ideas and opportunities worth knowing.</p><button type="button" onClick={openLogin} className="inline-flex items-center gap-2 text-sm font-semibold">Login <Arrow /></button></div></footer>

      {menuOpen && <div className="fixed inset-0 z-[100] bg-black px-6 py-6 text-white lg:hidden"><div className="flex items-center justify-between"><a href="#top" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 font-serif text-2xl font-semibold"><Mark />BitBuzz</a><button type="button" onClick={() => setMenuOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10" aria-label="Close menu"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div><nav className="mt-16 flex flex-col gap-2 text-3xl font-serif">{["Home", "Explore", "Categories", "Opportunities", "About"].map((item) => <a key={item} href={`#${item === "Home" ? "top" : item.toLowerCase()}`} onClick={() => setMenuOpen(false)} className="border-b border-white/10 py-4">{item}</a>)}<button type="button" onClick={openLogin} className="mt-6 rounded-full bg-white px-6 py-4 text-base font-semibold text-black">Login</button></nav></div>}

      {loginOpen && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 px-5 backdrop-blur-md" onMouseDown={closeLogin}><div className="w-full max-w-[430px] rounded-[28px] border border-white/10 bg-[#111] p-7 text-white shadow-2xl sm:p-9" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between"><div><div className="mb-5 flex items-center gap-2 font-serif text-2xl font-semibold"><Mark />BitBuzz</div><h2 className="font-serif text-4xl tracking-[-.04em]">Welcome back.</h2><p className="mt-2 text-sm text-white/45">Sign in to continue to BitBuzz.</p></div><button type="button" onClick={closeLogin} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/60" aria-label="Close login">×</button></div><form onSubmit={login} className="mt-8 space-y-4"><label className="block text-xs font-medium text-white/55">Email<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm outline-none transition focus:border-[#5d98ff]" placeholder="you@example.com" /></label><label className="block text-xs font-medium text-white/55">Password<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm outline-none transition focus:border-[#5d98ff]" placeholder="Your password" /></label>{error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}<button disabled={loading} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-semibold text-black transition hover:bg-[#5d98ff] disabled:cursor-wait disabled:opacity-60">{loading ? "Signing in" : "Sign in"} <Arrow /></button></form><p className="mt-5 text-center text-[11px] text-white/30">Your account is handled securely through BitBuzz authentication.</p></div></div>}
    </div>
  );
}

export default LandingPage;
