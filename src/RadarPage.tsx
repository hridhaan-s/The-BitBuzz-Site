import { useEffect, useMemo, useRef, useState } from "react";

type Headline = {
  title: string;
  url: string;
  source?: string;
  category?: string;
  summary?: string;
  publishedAt?: string;
  imageUrl?: string;
  breaking?: boolean;
};

const FILTERS = ["ALL", "SPACE", "TECH", "SCIENCE", "AVIATION", "LIKED"] as const;
type Filter = typeof FILTERS[number];

const fallbackItems: Headline[] = [
  { title: "ISRO space missions and research updates", url: "https://www.isro.gov.in/", source: "ISRO", category: "SPACE", summary: "Official updates from India's space programme.", imageUrl: "https://images-assets.nasa.gov/image/PIA12348/PIA12348~large.jpg" },
  { title: "JAXA mission and space science updates", url: "https://www.jaxa.jp/", source: "JAXA", category: "SPACE", summary: "Official updates from Japan's space and exploration programme.", imageUrl: "https://images-assets.nasa.gov/image/PIA12348/PIA12348~large.jpg" },
  { title: "Microsoft Research AI and technology updates", url: "https://www.microsoft.com/en-us/research/blog/", source: "Microsoft Research", category: "TECH", summary: "Research stories covering AI, computing and emerging technology.", imageUrl: "https://images-assets.nasa.gov/image/PIA12348/PIA12348~large.jpg" }
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
  return <button onClick={share} className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-white/65 transition hover:border-white/25 hover:text-white">Share</button>;
}

function LikeButton({ liked, onClick }: { liked: boolean; onClick: () => void }) {
  return <button aria-label={liked ? "Unlike story" : "Like story"} aria-pressed={liked} onClick={onClick} className={`rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-wider transition ${liked ? "border-[#ff9a70]/40 bg-[#ff9a70]/10 text-[#ff9a70]" : "border-white/15 bg-black/30 text-white/65 hover:border-white/30 hover:text-white"}`}>
    {liked ? "♥ Liked" : "♡ Like"}
  </button>;
}

function StoryCard({ item, liked, onLike }: { item: Headline; liked: boolean; onLike: () => void }) {
  return <article className="relative flex h-[calc(100svh-92px)] min-h-[620px] snap-start snap-always overflow-hidden rounded-[28px] border border-white/10 bg-[#101010] shadow-2xl">
    <div className="absolute inset-0">
      {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700" /> : <div className="h-full w-full bg-gradient-to-br from-[#1b1b1b] via-[#090909] to-[#17110e]" />}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/90" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
    </div>

    <div className="relative z-10 flex w-full flex-col justify-between p-5 sm:p-7">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white/85 backdrop-blur">{laneFor(item)}</span>
        {item.breaking && <span className="rounded-full bg-[#ff9a70] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-black">LIVE</span>}
      </div>

      <div className="max-w-3xl">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[.16em] text-white/55">{item.source || "BitBuzz Radar"} · {formatDate(item.publishedAt)}</p>
        <h2 className="font-serif text-4xl leading-[.98] tracking-[-.045em] text-white drop-shadow-lg sm:text-6xl">{item.title}</h2>
        {item.summary && <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 drop-shadow sm:text-base">{item.summary}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          <a href={item.url} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-black transition hover:bg-[#ffdccb]">Read source ↗</a>
          <LikeButton liked={liked} onClick={onLike} />
          <ShareButton item={item} />
        </div>
      </div>
    </div>
  </article>;
}

export default function RadarPage() {
  const [items, setItems] = useState<Headline[]>(fallbackItems);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [likes, setLikes] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(async (entries) => {
      if (!entries.some((entry) => entry.isIntersecting) || loadingMore) return;
      setLoadingMore(true);
      try {
        const nextPage = page + 1;
        const response = await fetch(`/api/news?page=${nextPage}`, { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data) && data.length) {
          setItems((current) => {
            const seen = new Set(current.map((item) => item.url));
            return [...current, ...data.filter((item) => item?.title && item?.url && !seen.has(item.url))].slice(0, 150);
          });
          setPage(nextPage);
        }
      } catch {} finally {
        setLoadingMore(false);
      }
    }, { rootMargin: "1200px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [page, loadingMore]);

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

  const feed = useMemo(() => visible.map((item, index) => ({ item, key: `${item.url}-${index}` })), [visible]);

  return <main className="min-h-screen bg-black text-white">
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-[1100px] items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ff9a70]">BITBUZZ RADAR</p>
          <p className="truncate text-xs text-white/45">Scroll. Discover. Go deeper.</p>
        </div>
        <div className="hidden text-right text-[10px] uppercase tracking-[.14em] text-white/30 sm:block">{updated ? `UPDATED ${updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "LIVE · LOADING"}</div>
      </div>
      <div className="mx-auto mt-3 flex max-w-[1100px] gap-2 overflow-x-auto pb-0.5">
        {FILTERS.map((value) => <button key={value} onClick={() => setFilter(value)} className={`shrink-0 rounded-full border px-3 py-1.5 text-[9px] font-bold tracking-[.12em] transition ${filter === value ? "border-white bg-white text-black" : "border-white/10 text-white/45 hover:border-white/25 hover:text-white"}`}>{value}</button>)}
      </div>
    </header>

    <div className="mx-auto max-w-[1100px] px-3 py-3 sm:px-6 sm:py-5">
      {loading && <div className="mb-3 text-[9px] uppercase tracking-[.16em] text-white/25">Refreshing the feed…</div>}
      {visible.length === 0 && <div className="flex min-h-[60svh] items-center justify-center text-sm text-white/35">No stories match this filter yet.</div>}

      {visible.length > 0 && <section className="snap-y snap-mandatory space-y-3 overflow-visible">
        {feed.map(({ item, key }) => <StoryCard key={key} item={item} liked={likes.includes(item.url)} onLike={() => toggleLike(item.url)} />)}
        <div ref={sentinelRef} className="h-32 snap-start" aria-hidden="true">{loadingMore && <p className="pt-8 text-center text-[9px] uppercase tracking-[.18em] text-white/25">Finding more stories…</p>}</div>
      </section>}
    </div>
  </main>;
}
