import { useEffect, useMemo, useState } from "react";

type Headline = { title: string; url: string; source?: string; breaking?: boolean };

const lanes = [
  { label: "SPACE", match: /space|nasa|rocket|launch|moon|mars|orbit|satellite|astronomy/i },
  { label: "TECH", match: /tech|ai|apple|google|microsoft|chip|software|robot|cyber/i },
  { label: "SCIENCE", match: /science|research|biology|physics|climate|discovery|health/i },
  { label: "AVIATION", match: /aviation|aircraft|airline|flight|boeing|airbus/i },
];

function laneFor(item: Headline) {
  const text = `${item.title} ${item.source ?? ""}`;
  return lanes.find((lane) => lane.match.test(text))?.label ?? "NOW";
}

function ShareButton({ item }: { item: Headline }) {
  const share = async () => {
    const payload = { title: item.title, text: `Read this on BitBuzz: ${item.title}`, url: item.url };
    if (navigator.share) {
      try { await navigator.share(payload); return; } catch { return; }
    }
    try { await navigator.clipboard.writeText(window.location.origin + "/radar"); } catch {}
  };
  return <button onClick={share} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-white/25 hover:text-white">Share</button>;
}

export default function RadarPage() {
  const [items, setItems] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    const cacheKey = "bitbuzz:radar:headlines";

    const readCache = () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? parsed.filter((item) => item?.title && item?.url).slice(0, 24) : null;
      } catch {
        return null;
      }
    };

    const load = async () => {
      const cached = readCache();

      if (active && cached?.length) {
        setItems(cached);
        setUpdated(new Date());
        setLoading(false);
      }

      try {
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 4500);
        const response = await fetch("/api/news", { cache: "default", signal: controller.signal });
        window.clearTimeout(timeout);

        if (!response.ok) throw new Error("feed unavailable");

        const data = await response.json();
        if (active && Array.isArray(data)) {
          const next = data.filter((item) => item?.title && item?.url).slice(0, 24);
          if (next.length) {
            setItems(next);
            try { localStorage.setItem(cacheKey, JSON.stringify(next)); } catch {}
            setUpdated(new Date());
          }
        }
      } catch {
        // Keep cached headlines visible if the refresh fails or times out.
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    const timer = window.setInterval(load, 5 * 60 * 1000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const grouped = useMemo(() => lanes.map((lane) => ({ ...lane, items: items.filter((item) => lane.match.test(`${item.title} ${item.source ?? ""}`)).slice(0, 3) })).filter((lane) => lane.items.length), [items]);

  return <main className="min-h-screen bg-black px-5 pb-24 pt-28 text-white sm:px-8">
    <div className="mx-auto max-w-[1200px]">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[.22em] text-[#ff9a70]">BITBUZZ RADAR · LIVE FEED</p>
          <h1 className="mt-3 font-serif text-5xl tracking-[-.05em] sm:text-7xl">What’s happening.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">A fast-moving layer over the BitBuzz newsroom. Headlines refresh automatically, while the strongest stories stay easy to discover and share.</p>
        </div>
        <div className="text-left text-[10px] uppercase tracking-[.16em] text-white/30 sm:text-right">{updated ? `Updated ${updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "Connecting to live feed"}</div>
      </div>

      {loading && <div className="animate-pulse" aria-label="Loading Radar feed" role="status">
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[0, 1].map((index) => <div key={index} className="rounded-3xl border border-white/10 bg-white/[.035] p-6 sm:p-8">
            <div className="flex items-center justify-between"><div className="h-2.5 w-16 rounded-full bg-white/10" /><div className="h-2.5 w-4 rounded-full bg-white/5" /></div>
            <div className="mt-10 space-y-3"><div className="h-7 w-[88%] rounded-lg bg-white/10" /><div className="h-7 w-[64%] rounded-lg bg-white/10" /></div>
            <div className="mt-8 flex items-center justify-between"><div className="h-3 w-24 rounded-full bg-white/5" /><div className="h-7 w-14 rounded-full bg-white/5" /></div>
          </div>)}
        </div>
        <div className="mt-14">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3"><div className="h-2.5 w-14 rounded-full bg-white/10" /><div className="h-2.5 w-8 rounded-full bg-white/5" /></div>
          <div className="grid gap-x-8 md:grid-cols-3">{[0, 1, 2].map((index) => <div key={index} className="border-b border-white/10 py-6">
            <div className="h-2.5 w-20 rounded-full bg-white/5" /><div className="mt-3 space-y-2"><div className="h-5 w-full rounded-md bg-white/10" /><div className="h-5 w-3/4 rounded-md bg-white/10" /></div><div className="mt-5 h-2.5 w-12 rounded-full bg-white/5" />
          </div>)}</div>
        </div>
        <span className="sr-only">Tuning into the live feed…</span>
      </div>}
      {!loading && !items.length && <div className="py-16 text-sm text-white/35">Radar is quiet right now. The newsroom feed will appear here when it is available.</div>}

      <section className="mt-10 grid gap-4 md:grid-cols-2">
        {items.slice(0, 2).map((item, index) => <article key={`${item.url}-hero`} className="group rounded-3xl border border-white/10 bg-white/[.035] p-6 transition hover:border-white/20 sm:p-8">
          <div className="flex items-center justify-between gap-3"><span className="text-[10px] font-bold tracking-[.18em] text-[#ff9a70]">{item.breaking ? "BREAKING" : laneFor(item)}</span><span className="text-[10px] text-white/25">0{index + 1}</span></div>
          <h2 className="mt-10 font-serif text-3xl leading-tight tracking-[-.03em] sm:text-4xl">{item.title}</h2>
          <div className="mt-7 flex items-center justify-between gap-3"><a href={item.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-white/65 hover:text-white">{item.source ?? "Read source"} ↗</a><ShareButton item={item}/></div>
        </article>)}
      </section>

      {grouped.map((lane) => <section key={lane.label} className="mt-14">
        <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3"><h2 className="text-[10px] font-bold tracking-[.2em] text-white/45">{lane.label}</h2><span className="text-[10px] text-white/20">LIVE</span></div>
        <div className="grid gap-x-8 md:grid-cols-3">{lane.items.map((item) => <article key={item.url} className="border-b border-white/10 py-6">
          <p className="text-[10px] font-semibold text-white/30">{item.source ?? "BitBuzz Radar"}</p>
          <h3 className="mt-2 font-serif text-xl leading-snug">{item.title}</h3>
          <div className="mt-4 flex items-center justify-between"><a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold uppercase tracking-wider text-white/45 hover:text-white">Open ↗</a><ShareButton item={item}/></div>
        </article>)}</div>
      </section>)}

      <div className="mt-16 rounded-3xl border border-[#ff9a70]/20 bg-[#ff9a70]/[.04] p-6 sm:p-8">
        <p className="text-[10px] font-bold tracking-[.18em] text-[#ff9a70]">BUILT FOR DISCOVERY</p>
        <h2 className="mt-2 font-serif text-2xl">See something worth knowing? Send it.</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">Radar is intentionally lightweight: it reuses the newsroom’s existing live feed instead of introducing another database or editorial workflow.</p>
        <a href="/submit" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-[#ffdccb]">Submit to BitBuzz</a>
      </div>
    </div>
  </main>;
}
