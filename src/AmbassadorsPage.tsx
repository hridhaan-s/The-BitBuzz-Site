import { FormEvent, useState } from "react";
import UniversalNavbar from "./UniversalNavbar";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

export default function AmbassadorsPage() {
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const subject = `BitBuzz Ambassador Application | ${String(data.get("organization") || "New organization")}`;
    const body = [
      `Organization: ${data.get("organization") || ""}`,
      `Type: ${data.get("type") || ""}`,
      `City / Country: ${data.get("location") || ""}`,
      `Website: ${data.get("website") || ""}`,
      `Contact name: ${data.get("contact") || ""}`,
      `Contact email: ${data.get("email") || ""}`,
      "",
      "About the organization:",
      String(data.get("about") || ""),
      "",
      "What would you publish on BitBuzz:",
      String(data.get("content") || ""),
    ].join("\n");
    window.location.href = `mailto:Hridhaan@bitbuzz.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#050505] text-white selection:bg-white selection:text-black">
      <UniversalNavbar />

      <main>
        <section className="relative isolate min-h-[760px] overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 -z-20 bg-[#050505]" />
          <div className="absolute right-[-18%] top-[-10%] -z-10 h-[720px] w-[720px] rounded-full bg-[#ff6a1f]/10 blur-[120px]" />
          <div className="absolute left-[8%] top-[22%] -z-10 h-[360px] w-[360px] rounded-full bg-[#ff2d55]/8 blur-[100px]" />
          <div className="absolute inset-y-0 right-0 -z-10 hidden w-[58%] lg:block">
            <img src={LOGO_URL} alt="BitBuzz" className="h-full w-full object-cover opacity-[0.07] grayscale" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/80 to-transparent" />
          </div>

          <div className="mx-auto flex min-h-[760px] max-w-[1480px] items-center px-5 pb-20 pt-32 sm:px-8">
            <div className="grid w-full gap-14 lg:grid-cols-[1.15fr_.85fr] lg:items-center">
              <div>
                <p className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.28em] text-[#ff6a1f]">
                  <span className="h-2 w-2 rounded-full bg-[#ff6a1f] shadow-[0_0_18px_#ff6a1f]" />
                  BitBuzz Ambassadors
                </p>
                <h1 className="max-w-[920px] font-serif text-[clamp(4rem,9vw,8.8rem)] font-black leading-[.82] tracking-[-.07em]">
                  Your community.
                  <span className="mt-5 block text-white/75">Your voice.</span>
                </h1>
                <p className="mt-9 max-w-[680px] text-base leading-7 text-white/55 sm:text-xl sm:leading-8">
                  Clubs, schools and organizations can build a home inside BitBuzz. Get approved, create your own page and share the work, people and ideas making your community worth knowing.
                </p>
                <div className="mt-9 flex flex-wrap gap-3">
                  <a href="#apply" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.03] hover:bg-[#ff6a1f]">Apply to become an Ambassador</a>
                  <a href="#how-it-works" className="rounded-full border border-white/20 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10">How it works</a>
                </div>
              </div>

              <div className="relative lg:justify-self-end">
                <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl sm:p-7">
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div className="flex items-center gap-3">
                      <img src={LOGO_URL} alt="BitBuzz" className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/30">BitBuzz</p>
                        <p className="text-sm font-semibold">Ambassador network</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-[#ff6a1f]/30 bg-[#ff6a1f]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[.16em] text-[#ff8b52]">Open</span>
                  </div>
                  <div className="py-8">
                    <p className="text-[10px] font-bold uppercase tracking-[.22em] text-white/30">One platform</p>
                    <p className="mt-3 font-serif text-4xl font-black leading-[.95] tracking-[-.045em]">Give your community a page people remember.</p>
                    <div className="mt-7 grid grid-cols-3 gap-2">
                      {["Profile", "Stories", "Updates"].map((item, index) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-black/30 px-3 py-4">
                          <p className="text-[8px] uppercase tracking-[.18em] text-white/30">0{index + 1}</p>
                          <p className="mt-2 text-xs font-semibold text-white/75">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs leading-5 text-white/40">
                    Approved ambassadors get a dedicated community presence on BitBuzz and a way to publish approved content about their organization.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-b border-white/10 bg-[#090909] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-[1480px]">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">The idea</p>
                <h2 className="mt-3 font-serif text-5xl font-black leading-[.9] tracking-[-.055em] sm:text-7xl">A platform for the people building things.</h2>
              </div>
              <p className="max-w-2xl text-base leading-7 text-white/45 sm:text-lg sm:leading-8">
                BitBuzz Ambassadors gives communities their own corner of the newsroom. We review applications first, then work with approved organizations to create a useful, credible presence instead of another empty social profile.
              </p>
            </div>

            <div className="mt-14 grid border-t border-white/10 md:grid-cols-3">
              {[
                ["01", "Apply", "Tell us who you are, what your community does and what you want to share."],
                ["02", "Get approved", "Our team reviews the application and reaches out if the organization is a good fit."],
                ["03", "Build your page", "Approved ambassadors get a dedicated BitBuzz page for their organization and its stories."],
              ].map(([number, title, text]) => (
                <div key={number} className="border-b border-white/10 py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
                  <p className="text-[10px] font-bold tracking-[.2em] text-white/25">{number}</p>
                  <h3 className="mt-7 font-serif text-3xl font-black tracking-[-.035em]">{title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/40">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1480px] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mb-10">
            <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">For ambassadors</p>
            <h2 className="mt-3 font-serif text-5xl font-black tracking-[-.05em] sm:text-7xl">What your page can become.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Your identity", "Logo, description, links and the story behind your club, school or organization."],
              ["02", "Your updates", "Publish approved news, announcements, projects, achievements and community stories."],
              ["03", "Your archive", "Keep your important work discoverable instead of letting it disappear in a feed."],
              ["04", "Your audience", "Give students, members, parents and curious readers one place to understand what you do."],
            ].map(([number, title, text]) => (
              <article key={number} className="group rounded-[24px] border border-white/10 bg-[#090909] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#0d0d0d] sm:p-7">
                <p className="text-[10px] font-bold tracking-[.2em] text-[#ff6a1f]">{number}</p>
                <h3 className="mt-14 font-serif text-2xl font-black tracking-[-.035em]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/40">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="apply" className="border-t border-white/10 bg-[#090909] px-5 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-[1480px] gap-12 lg:grid-cols-[.75fr_1.25fr]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">Applications</p>
              <h2 className="mt-3 font-serif text-5xl font-black leading-[.9] tracking-[-.055em] sm:text-7xl">Bring your community to BitBuzz.</h2>
              <p className="mt-6 max-w-md text-sm leading-6 text-white/45">Applications are reviewed by the BitBuzz team. Tell us enough to understand your organization, then we will take it from there.</p>
              <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 text-xs leading-5 text-white/35">
                <span className="font-semibold text-white/65">What we look for:</span> genuine communities, useful work, responsible publishing and a clear reason for being on BitBuzz.
              </div>
            </div>

            <form onSubmit={submit} className="rounded-[28px] border border-white/10 bg-[#050505] p-5 sm:p-8">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block sm:col-span-2"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.2em] text-white/35">Organization name</span><input required name="organization" placeholder="Your club, school or organization" className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30" /></label>
                <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.2em] text-white/35">Organization type</span><select required name="type" defaultValue="" className="w-full rounded-2xl border border-white/10 bg-[#0d0d0d] px-4 py-3 text-sm text-white outline-none focus:border-white/30"><option value="" disabled>Select one</option><option>School</option><option>Club</option><option>Organization</option></select></label>
                <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.2em] text-white/35">City / country</span><input required name="location" placeholder="Greater Noida, India" className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30" /></label>
                <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.2em] text-white/35">Contact name</span><input required name="contact" placeholder="Your name" className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30" /></label>
                <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.2em] text-white/35">Contact email</span><input required type="email" name="email" placeholder="you@example.com" className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.2em] text-white/35">Website or social link</span><input name="website" placeholder="https://" className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/30" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.2em] text-white/35">Tell us about your organization</span><textarea required name="about" rows={4} placeholder="What do you do? Who is your community?" className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-white/30" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.2em] text-white/35">What would you publish?</span><textarea required name="content" rows={4} placeholder="Projects, events, achievements, announcements, student stories..." className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-white/30" /></label>
              </div>
              <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[10px] leading-4 text-white/25">Your application will open your email client with the details ready to send to the BitBuzz team.</p>
                <button type="submit" className="rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.02] hover:bg-[#ff6a1f]">{submitted ? "Application ready ↗" : "Start application ↗"}</button>
              </div>
            </form>
          </div>
        </section>

        <section className="px-5 pb-16 pt-2 sm:px-8 sm:pb-24">
          <div className="mx-auto max-w-[1480px] rounded-[28px] border border-[#ff6a1f]/40 bg-[#0b0b0b] px-7 py-14 sm:px-12 sm:py-20">
            <p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">Ready?</p>
            <div className="mt-4 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <h2 className="max-w-4xl font-serif text-5xl font-black leading-[.9] tracking-[-.055em] sm:text-7xl">The next great story could come from your school.</h2>
              <a href="#apply" className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:scale-[1.03] hover:bg-[#ff6a1f]">Apply now ↗</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
