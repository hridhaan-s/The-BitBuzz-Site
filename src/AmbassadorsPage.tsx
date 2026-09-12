import UniversalNavbar from "./UniversalNavbar";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

const features = [
  ["01", "Exclusive Dashboard", "A dedicated admin space to manage your organization, stories, updates and publishing workflow."],
  ["02", "A Page for Your Organization", "A dedicated home on BitBuzz built around your identity, people, work, links and latest stories."],
  ["03", "Turn Content Into a Newsletter", "Transform your organization's stories and updates into a newsletter your community can actually follow."],
];

export default function AmbassadorsPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-white selection:text-black">
      <UniversalNavbar />
      <main>
        <section className="relative isolate min-h-[820px] overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 -z-20 bg-[#050505]" />
          <div className="absolute right-[-12%] top-[-15%] -z-10 h-[780px] w-[780px] rounded-full bg-[#ff6a1f]/12 blur-[130px]" />
          <div className="absolute left-[-10%] bottom-[-20%] -z-10 h-[620px] w-[620px] rounded-full bg-[#ff315c]/8 blur-[130px]" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-[48%] bg-gradient-to-t from-[#050505] to-transparent" />
          <div className="mx-auto flex min-h-[820px] max-w-[1480px] items-center px-5 pb-20 pt-32 sm:px-8 sm:pb-24">
            <div className="w-full">
              <div className="max-w-[1080px]">
                <p className="mb-7 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.3em] text-[#ff6a1f]"><span className="h-2 w-2 rounded-full bg-[#ff6a1f] shadow-[0_0_20px_#ff6a1f]" />BitBuzz Ambassadors</p>
                <h1 className="font-serif text-[clamp(4.4rem,10vw,10rem)] font-black leading-[.78] tracking-[-.075em]">Run your own<span className="mt-5 block text-white/75">publication.</span></h1>
                <p className="mt-10 max-w-[760px] text-base leading-7 text-white/50 sm:text-xl sm:leading-8">BitBuzz Ambassadors gives schools, clubs and organizations the infrastructure to run their own editorial presence inside a modern newsroom. Build your own blog, publish what your community is doing and turn the best of it into a newsletter that keeps people connected.</p>
                <p className="mt-5 max-w-[720px] text-sm leading-6 text-white/30 sm:text-base">You bring the stories. BitBuzz gives you the place to publish them, organize them and make your community discoverable.</p>
                <div className="mt-10"><a href="#partners" className="inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition hover:scale-[1.03] hover:bg-[#ff6a1f]">Visit Ambassador ↗</a></div>
              </div>
              <div className="mt-20 grid max-w-[1080px] grid-cols-2 border-y border-white/10 sm:grid-cols-3">
                {["Schools", "Clubs", "Organizations"].map((item, index) => <div key={item} className={`px-4 py-5 sm:px-6 ${index < 2 ? "border-r border-white/10" : "col-span-2 sm:col-span-1"}`}><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/25">Built for</p><p className="mt-2 text-sm font-semibold text-white/75">{item}</p></div>)}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-white/10 bg-[#090909] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-[1480px]">
            <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-end">
              <div><p className="text-[10px] font-bold uppercase tracking-[.27em] text-[#ff6a1f]">Your publication. Your identity.</p><h2 className="mt-4 max-w-xl font-serif text-5xl font-black leading-[.88] tracking-[-.06em] sm:text-7xl">Everything your community needs to publish.</h2></div>
              <p className="max-w-2xl text-base leading-7 text-white/40 sm:text-lg sm:leading-8">Forget trying to squeeze your school's achievements, club updates or organization news into a social feed. Ambassadors gives your community a proper editorial home, designed to grow with the work you are doing.</p>
            </div>
            <div className="mt-16 grid border-t border-white/10 md:grid-cols-3">
              {features.map(([number, title, text]) => <article key={number} className="border-b border-white/10 py-9 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"><p className="text-[10px] font-bold tracking-[.2em] text-[#ff6a1f]">{number}</p><h3 className="mt-16 max-w-sm font-serif text-3xl font-black leading-[.95] tracking-[-.04em]">{title}</h3><p className="mt-4 max-w-sm text-sm leading-6 text-white/38">{text}</p></article>)}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1480px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div><p className="text-[10px] font-bold uppercase tracking-[.27em] text-[#ff6a1f]">Built for real communities</p><h2 className="mt-4 max-w-2xl font-serif text-5xl font-black leading-[.88] tracking-[-.06em] sm:text-7xl">Your community deserves more than a link in bio.</h2><p className="mt-7 max-w-xl text-base leading-7 text-white/42 sm:text-lg sm:leading-8">Create a living record of what your community is building. Publish events, projects, achievements, interviews, announcements and the people behind them. Keep it all in one place and make it easy for your audience to come back.</p><div className="mt-8 flex flex-wrap gap-3 text-[10px] font-bold uppercase tracking-[.15em] text-white/45">{["Stories", "Updates", "Projects", "Newsletter"].map(item => <span key={item} className="rounded-full border border-white/10 px-4 py-2">{item}</span>)}</div></div>
            <div className="relative rounded-[30px] border border-white/10 bg-[#090909] p-5 shadow-[0_30px_100px_rgba(0,0,0,.35)] sm:p-7"><div className="rounded-[22px] border border-white/10 bg-[#050505] p-5 sm:p-7"><div className="flex items-center justify-between border-b border-white/10 pb-5"><div className="flex items-center gap-3"><img src={LOGO_URL} alt="BitBuzz" className="h-9 w-9 rounded-full object-cover" /><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/25">Ambassador workspace</p><p className="text-sm font-semibold">Your Organization</p></div></div><span className="rounded-full border border-white/10 px-3 py-1 text-[8px] font-bold uppercase tracking-[.16em] text-white/35">Admin</span></div><div className="grid grid-cols-2 gap-3 py-6 sm:grid-cols-3">{[["24", "Stories"], ["08", "Updates"], ["01", "Newsletter"]].map(([value, label]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="font-serif text-3xl font-black tracking-[-.04em]">{value}</p><p className="mt-2 text-[8px] font-bold uppercase tracking-[.17em] text-white/25">{label}</p></div>)}</div><div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"><p className="text-[8px] font-bold uppercase tracking-[.18em] text-[#ff6a1f]">Latest story</p><p className="mt-2 font-serif text-2xl font-bold tracking-[-.03em]">Inside our community</p><p className="mt-2 text-xs leading-5 text-white/30">A dedicated editorial home for the things your organization wants the world to know.</p></div></div></div>
          </div>
        </section>

        <section id="partners" className="border-y border-white/10 bg-[#090909] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-[1480px] text-center"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#ff6a1f]">The BitBuzz network</p><h2 className="mt-4 font-serif text-5xl font-black tracking-[-.055em] sm:text-7xl">See our partners.</h2><p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-white/38 sm:text-base">The schools, clubs and organizations that become part of the BitBuzz Ambassador network will live here with their identity and logo, creating a growing wall of communities building with us.</p><div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"><div className="col-span-2 flex min-h-[180px] items-center justify-center rounded-[26px] border border-dashed border-white/10 bg-[#050505] p-8 sm:col-span-3 lg:col-span-4"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/25">Partner wall</p><p className="mt-3 font-serif text-3xl font-black tracking-[-.04em] text-white/70 sm:text-4xl">Your logo could be here.</p><p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-white/25">Approved partner organizations will appear here as the Ambassador network grows.</p></div></div></div></div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28"><div className="mx-auto max-w-[1480px] overflow-hidden rounded-[32px] border border-[#ff6a1f]/35 bg-[#0b0b0b] px-7 py-14 text-center shadow-[0_0_100px_rgba(255,91,31,.07)] sm:px-12 sm:py-20"><p className="text-[10px] font-bold uppercase tracking-[.3em] text-[#ff6a1f]">Ambassadors</p><h2 className="mx-auto mt-5 max-w-4xl font-serif text-5xl font-black leading-[.86] tracking-[-.06em] sm:text-8xl">Make your community impossible to miss.</h2><p className="mx-auto mt-7 max-w-2xl text-sm leading-6 text-white/38 sm:text-base">A dedicated publication space. A place for your stories. A newsletter for your audience. Built on BitBuzz.</p><a href="#partners" className="mt-9 inline-flex rounded-full bg-white px-7 py-3.5 text-sm font-bold text-black transition hover:scale-[1.03] hover:bg-[#ff6a1f]">Visit Ambassador ↗</a></div></section>
      </main>
    </div>
  );
}
