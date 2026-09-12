const dispatches = [
  {
    number: "01",
    kicker: "PROPULSION",
    title: "India Just Pushed Its CE20 Cryogenic Engine Harder",
    dek: "ISRO's upgraded CE20 engine has cleared a critical hot test at 220 kN, another step toward India's heavier launch capability and the Gaganyaan programme.",
    body: [
      "India's next generation of human spaceflight and heavy launch missions depends on something most people never see: the engine.",
      "ISRO successfully completed a flight acceptance hot test of its upgraded CE20 cryogenic engine at the ISRO Propulsion Complex in Mahendragiri, Tamil Nadu. The engine was tested at an uprated thrust of 220 kilonewtons and is intended for the C32 upper stage of the LVM3.",
      "Cryogenic engines use extremely cold propellants, primarily liquid hydrogen and liquid oxygen. Their high efficiency makes them valuable during upper-stage flight, where every increase in performance can expand what a launch vehicle can carry into orbit.",
      "The latest test also validated the LOX Tank Pressurisation Module, a system designed to support reliable propellant delivery under demanding flight conditions. That matters even more when the technology is being developed for a human spaceflight programme such as Gaganyaan.",
    ],
    image: "https://images.unsplash.com/photo-1517976547714-720226b864c1?auto=format&fit=crop&fm=jpg&q=88&w=1800",
    stat: "220 kN",
    statLabel: "uprated CE20 thrust",
  },
  {
    number: "02",
    kicker: "EARTH OBSERVATION",
    title: "From Orbit, ISRO Is Watching an El Niño Take Shape",
    dek: "EOS-06 is using ocean colour and wind measurements to observe environmental changes across the tropical Pacific.",
    body: [
      "Some of the earliest signs of a changing climate pattern don't appear on land. They appear in the ocean.",
      "ISRO's EOS-06, also known as Oceansat-3, is designed to observe the tropical Pacific using instruments including the Ocean Colour Monitor and the Scatterometer. The supplied observations point to changes in surface chlorophyll-a and ocean winds associated with a developing El Niño pattern.",
      "Chlorophyll-a is associated with phytoplankton, microscopic organisms that form the foundation of many marine food webs. During El Niño conditions, the normal upwelling of cold, nutrient-rich water can weaken, changing the biological activity visible at the surface.",
      "Satellite observations of ocean biology and surface winds can help researchers understand large-scale climate behaviour and its potential links to weather and monsoon patterns.",
    ],
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&fm=jpg&q=88&w=1800",
    stat: "EOS-06",
    statLabel: "ocean monitoring satellite",
  },
  {
    number: "03",
    kicker: "LAUNCH ECONOMY",
    title: "India's Small Rocket Is Moving Into Commercial Hands",
    dek: "The SSLV was designed for rapid small satellite launches. Its technology transfer marks another step toward a larger private space industry in India.",
    body: [
      "India's space sector is changing. For decades, launch infrastructure was overwhelmingly associated with the national space programme. Now, more of that capability is beginning to move toward commercial industry.",
      "The Small Satellite Launch Vehicle, or SSLV, was designed around smaller payloads and rapid launch requirements. The supplied material describes it as capable of placing payloads up to 500 kilograms into low Earth orbit.",
      "ISRO and IN-SPACe have finalized a technology transfer arrangement involving the SSLV and Hindustan Aeronautics Limited. The shift is part of a wider move toward industrializing India's small-launch capability.",
      "A national space agency has finite resources. Moving more routine manufacturing and launch operations toward commercial companies can allow ISRO to focus more heavily on scientific and exploration missions while industry develops the ability to serve a growing satellite market.",
    ],
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&fm=jpg&q=88&w=1800",
    stat: "500 kg",
    statLabel: "stated SSLV payload capacity",
  },
  {
    number: "04",
    kicker: "INDUSTRY",
    title: "India's Space Industry Is Getting Bigger Than ISRO",
    dek: "From government-built launch vehicles to private companies, India's space ecosystem is entering a new phase.",
    body: [
      "India's space story used to be easy to summarize. There was ISRO, then there were rockets, satellites and missions. That picture is changing.",
      "The country's space ecosystem is increasingly being built around a combination of government research, private companies and commercial launch services. The SSLV is one example of technology moving from national development toward wider industrial use.",
      "The supplied material places India's expanding ecosystem at more than 400 active private space startups. That growth means India's space story is increasingly about the companies, engineers and infrastructure being built around its national programme.",
      "The next chapter may therefore not be defined only by how many rockets ISRO launches. It could also be defined by how many companies India can build around those rockets.",
    ],
    image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&fm=jpg&q=88&w=1800",
    stat: "400+",
    statLabel: "private space startups cited",
  },
] as const;

const sources = [
  ["ISRO Official Mission & Launch Galleries", "https://www.isro.gov.in/Gallery.html"],
  ["ISSDC Planetary Science Data Gallery", "https://www.issdc.gov.in/all_in_one_gallery.html"],
  ["Wikimedia Commons ISRO archive", "https://commons.wikimedia.org/wiki/Category:Indian_Space_Research_Organisation"],
] as const;

export default function SpaceDispatches() {
  return (
    <section className="border-t border-white/10 bg-[#050505] px-5 py-16 text-white sm:px-8 sm:py-24">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-12 max-w-4xl">
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[.28em] text-[#ff6a1f]">
            <span className="h-2 w-2 rounded-full bg-[#ff5a1f] shadow-[0_0_16px_#ff5a1f]" />
            Special Dispatch
          </div>
          <h2 className="mt-4 font-serif text-5xl font-black leading-[.9] tracking-[-.055em] sm:text-7xl">India's next chapter in space.</h2>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">Exploring the frontiers of Indian aerospace, planetary science and next-generation propulsion through four newsroom-style dispatches.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {dispatches.map((story) => (
            <article key={story.number} className="group overflow-hidden rounded-[24px] border border-white/10 bg-[#0a0a0a]">
              <div className="relative aspect-[16/8] overflow-hidden">
                <img src={story.image} alt="" className="h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute left-5 top-5 flex items-center gap-3">
                  <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[9px] font-bold tracking-[.2em] text-white/75 backdrop-blur">{story.number}</span>
                  <span className="text-[9px] font-bold tracking-[.2em] text-white/55">{story.kicker}</span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-5">
                  <div>
                    <p className="text-3xl font-black tracking-[-.04em]">{story.stat}</p>
                    <p className="mt-1 text-[9px] uppercase tracking-[.18em] text-white/45">{story.statLabel}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 text-lg backdrop-blur">↗</span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <h3 className="font-serif text-3xl font-black leading-[.98] tracking-[-.04em] sm:text-4xl">{story.title}</h3>
                <p className="mt-4 text-sm font-medium leading-6 text-white/65">{story.dek}</p>
                <div className="mt-6 space-y-4 border-t border-white/10 pt-6 text-sm leading-7 text-white/45">
                  {story.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
          <p className="text-[10px] font-bold uppercase tracking-[.25em] text-white/35">Image and reference archive</p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/45">For publication artwork and primary mission material, BitBuzz can draw from the following official and open archives supplied for this dispatch.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {sources.map(([label, href]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/65 transition hover:border-white/30 hover:bg-white hover:text-black">{label} ↗</a>)}
          </div>
        </div>
      </div>
    </section>
  );
}
