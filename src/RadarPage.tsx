import { useEffect, useMemo, useState } from "react";

type Headline = {
  title: string;
  url: string;
  source?: string;
  category?: string;
  summary?: string;
  publishedAt?: string;
  breaking?: boolean;
};

const FILTERS = ["ALL", "SPACE", "TECH", "SCIENCE", "AVIATION", "LIKED"] as const;
type Filter = typeof FILTERS[number];

const fallbackItems: Headline[] = [
  { title: "ISRO completes the GSLV-F17 mission and places EOS-05 into orbit", url: "https://www.isro.gov.in/", source: "ISRO", category: "SPACE", summary: "India's space agency reports the successful completion of its latest GSLV mission." },
  { title: "JAXA prepares the MMX mission to explore the moons of Mars", url: "https://www.jaxa.jp/", source: "JAXA", category: "SPACE", summary: "Japan's MMX mission is being prepared to study Phobos and Deimos." },
  { title: "Microsoft Research explores smarter AI for physical robots", url: "https://www.microsoft.com/en-us/research/blog/", source: "Microsoft Research", category: "TECH", summary: "Research into making AI systems more efficient and useful in real-world robotics." }
];

function laneFor(item: Headline) {
  return item.category || "SCIENCE";
}

function formatDate(value?: string) {
  if (!value) return "RECENT";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "RECENT";
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function ShareButton({ item }: { item: Headline }) {
  const share = async () => {
    const payload = { title: item.title, text: `Read this on BitBuzz: ${item.title}`, url: item.url };
    if (navigator.share) {
      try { await navigator.share(payload); return; } catch {}
    }
    try { await navigator.clipboard.writeText(item.url); } catch {}
  };
  return <button onClick={share} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-white/25 hover:text-white">Share</button>;
}

function LikeButton({ liked, onClick }: { liked: boolean; onClick: () => void }) {
  return <button aria-label={liked ? "Unlike story" : "Like story"} aria-pressed={liked} onClick={onClick} className={`rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition ${liked ? "border-[#ff9a70]/40 bg-[#ff9a70]/10 text-[#ff9a70]" : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"}`}>
    {liked ? "♥ Liked" : "♡ Like"}
  </button>;
}

export default function RadarPage() {
  const [items, setItems] = useState<Headline[]>(fallbackItems);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [likes, setLikes] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bitbuzz:radar:likes") || "[]");
      if (Array.isArray(saved)) setLikes(saved.filter((value) => typeof value === "string"));
    } catch {}
  }, []);

  useEffect(() => {
    let active = true;
    const cacheKey = "bitbuzz:radar:headlines";

    const readCache = () => {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;
        const parsed = JSON.parse(cached);
        return Array.isArray(parsed) ? parsed.filter((item) => item?.title && item?.url).slice(0, 30) : null;
      } catch { return null; }
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
        const timeout = window.setTimeout(() => controller.abort(), 3200);
        const response = await fetch("/api/news", { cache: "default", signal: controller.signal });
        window.clearTimeout(timeout);
        if (!response.ok) throw new Error("feed unavailable");
        const data = await response.json();
        if (active && Array.isArray(data) && data.length) {
          setItems(data.filter((item) => item?.title && item?.url).slice(0, 30));
          try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
          setUpdated(new Date());
        }
      } catch {
        // Starter/cache content remains visible.
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

  const toggleLike = (url: string) => {
    setLikes((current) => {
      const next = current.includes(url) ? current.filter((value) => value !== url) : [...current, url];
      try { localStorage.setItem("bitbuzz:radar:likes", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const visible = useMemo(() => {
    if (filter === "LIKED") return items.filter((item) => likes.includes(item.url));
    if (filter === "ALL") return items;
    return items.filter((item) => (item.category || laneFor(item)) === filter);
  }, [filter, items, likes]);

  const featured = visible.slice(0, 2);
  const stream = visible.slice(2);

  return <main className="min-h-screen bg-black px-5 pb-24 pt-28 text-white sm:px-8">
    <div className="mx-auto max-w-[1200px]">
      <header className="border-b border-white/10 pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[.22em] text-[#ff9a70]">BITBUZZ RADAR · LIVE DISCOVERY</p>
            <h1 className="mt-3 font-serif text-5xl tracking-[-.05em] sm:text-7xl">What’s happening.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">A fast, curated stream of space, science, technology and aviation stories from trusted sources around the world.</p>
          </div>
          <div className="text-left text-[10px] uppercase tracking-[.16em] text-white/30 lg:text-right">
            {updated ? `UPDATED ${updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "LIVE · LOADING"}
          </div>
        </div>

        <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((value) => <button key={value} onClick={() => setFilter(value)} className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-bold tracking-[.12em] transition ${filter === value ? "border-white bg-white text-black" : "border-white/10 text-white/45 hover:border-white/25 hover:text-white"}`}>
            {value}
          </button>)}
        </div>
      </header>

      <div className="mt-8 flex items-center justify-between text-[10px] uppercase tracking-[.16em] text-white/25">
        <span>{visible.length} stories</span>
        <span>{loading ? "refreshing…" : "auto-refresh · 5 min"}</span>
      </div>

      {visible.length === 0 && <div className="py-20 text-center text-sm text-white/35">No stories match this filter yet.</div>}

      {featured.length > 0 && <section className="mt-5 grid gap-4 md:grid-cols-2">
        {featured.map((item, index) => {
          const liked = likes.includes(item.url);
          return <article key={item.url} className="group rounded-3xl border border-white/10 bg-white/[.035] p-6 transition hover:border-white/20 sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold tracking-[.18em] text-[#ff9a70]">{laneFor(item)}</span>
              <span className="text-[10px] text-white/25">0{index + 1}</span>
            </div>
            <h2 className="mt-8 font-serif text-3xl leading-tight tracking-[-.03em] sm:text-4xl">{item.title}</h2>
            {item.summary && <p className="mt-5 text-sm leading-6 text-white/45">{item.summary}</p>}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              <a href={item.url} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-black transition hover:bg-[#ffdccb]">Read source ↗</a>
              <LikeButton liked={liked} onClick={() => toggleLike(item.url)} />
              <ShareButton item={item} />
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-[10px] uppercase tracking-[.12em] text-white/25">
              <span>{item.source || "BitBuzz Radar"}</span><span>{formatDate(item.publishedAt)}</span>
            </div>
          </article>;
        })}
      </section>}

      {stream.length > 0 && <section className="mt-14">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-[10px] font-bold tracking-[.2em] text-white/45">THE STREAM</h2>
          <span className="text-[10px] text-white/20">SCROLL</span>
        </div>
        <div className="divide-y divide-white/10">
          {stream.map((item) => {
            const liked = likes.includes(item.url);
            return <article key={item.url} className="py-6 sm:py-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.14em]">
                    <span className="text-[#ff9a70]">{laneFor(item)}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/30">{item.source || "Source"}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/25">{formatDate(item.publishedAt)}</span>
                  </div>
                  <h3 className="mt-2 font-serif text-2xl leading-snug tracking-[-.02em] sm:text-3xl">{item.title}</h3>
                  {item.summary && <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">{item.summary}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <LikeButton liked={liked} onClick={() => toggleLike(item.url)} />
                  <a href={item.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white/50 transition hover:border-white/25 hover:text-white">Read ↗</a>
                </div>
              </div>
            </article>;
          })}
        </div>
      </section>}

      <div className="mt-16 rounded-3xl border border-[#ff9a70]/20 bg-[#ff9a70]/[.04] p-6 sm:p-8">
        <p className="text-[10px] font-bold tracking-[.18em] text-[#ff9a70]">BITBUZZ · DISCOVERY</p>
        <h2 className="mt-2 font-serif text-2xl">Know something worth knowing?</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">Radar filters noisy feeds through trusted sources and a kid-safe title and summary check before stories reach the page.</p>
        <a href="/submit" className="mt-5 inline-flex rounded-full bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-[#ffdccb]">Submit to BitBuzz</a>
      </div>
    </div>
  </main>;
}
