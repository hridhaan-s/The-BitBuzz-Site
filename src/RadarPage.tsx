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
  { title: "ISRO space missions and research updates", url: "https://www.isro.gov.in/", source: "ISRO", category: "SPACE", summary: "Official updates from India's space programme." },
  { title: "JAXA mission and space science updates", url: "https://www.jaxa.jp/", source: "JAXA", category: "SPACE", summary: "Official updates from Japan's space and exploration programme." },
  { title: "Microsoft Research AI and technology updates", url: "https://www.microsoft.com/en-us/research/blog/", source: "Microsoft Research", category: "TECH", summary: "Research stories covering AI, computing and emerging technology." }
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

function StoryCard({ item, liked, onLike, index, total }: { item: Headline; liked: boolean; onLike: () => void; index: number; total: number }) {
  return <article className="group relative h-[calc(100svh-132px)] min-h-[620px] snap-start snap-always overflow-hidden rounded-[30px] bg-[#080808] shadow-[0_30px_100px_rgba(0,0,0,.65)] ring-1 ring-white/10">
    <div className="absolute inset-0">
      {item.imageUrl ? <img src={item.imageUrl} alt="" loading={index < 2 ? "eager" : "lazy"} className="h-full w-full object-cover scale-[1.015] transition-transform duration-[1400ms] ease-out group-hover:scale-105" /> : <div className="h-full w-full bg-[radial-gradient(circle_at_65%_25%,rgba(255,154,112,.22),transparent_28%),radial-gradient(circle_at_25%_80%,rgba(120,100,255,.18),transparent_32%),#080808]" />}
      <div className="absolute inset-0 bg-black/15" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.58)_0%,rgba(0,0,0,.08)_30%,rgba(0,0,0,.18)_52%,rgba(0,0,0,.96)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/70 to-transparent" />
    </div>

    <div className="relative z-10 flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-7">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[9px] font-black uppercase tracking-[.18em] text-white/90 backdrop-blur-xl">{laneFor(item)}</span>
          {item.breaking && <span className="rounded-full bg-[#ff9a70] px-3 py-1.5 text-[9px] font-black uppercase tracking-[.18em] text-black shadow-lg shadow-[#ff9a70]/20">LIVE</span>}
        </div>
        <span className="text-[9px] font-bold tracking-[.18em] text-white/45">{String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
      </div>

      <div className="mt-auto flex items-end gap-4 px-5 pb-7 sm:px-7 sm:pb-9">
        <div className="min-w-0 flex-1 max-w-3xl">
          <p className="mb-3 text-[9px] font-black uppercase tracking-[.2em] text-white/55">{item.source || "BitBuzz Radar"} · {formatDate(item.publishedAt)}</p>
          <h2 className="font-serif text-[clamp(2.35rem,6vw,4.8rem)] font-medium leading-[.92] tracking-[-.055em] text-white drop-shadow-[0_4px_25px_rgba(0,0,0,.55)]">{item.title}</h2>
          {item.summary && <div className="mt-5 max-w-2xl rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl sm:p-5">
            <p className="mb-1 text-[9px] font-black uppercase tracking-[.2em] text-[#ffb596]">QUICK TAKE</p>
            <p className="line-clamp-3 text-sm leading-6 text-white/78 sm:text-[15px]">{item.summary}</p>
          </div>}
          <div className="mt-5 flex items-center gap-2">
            <a href={item.url} target="_blank" rel="noreferrer" className="rounded-full bg-white px-5 py-3 text-[10px] font-black uppercase tracking-[.15em] text-black transition hover:scale-[1.02] hover:bg-[#ffddd0] active:scale-[.98]">Read source ↗</a>
            <ShareButton item={item} />
          </div>
        </div>

        <div className="mb-1 flex shrink-0 flex-col items-center gap-3">
          <button aria-label={liked ? "Unlike story" : "Like story"} aria-pressed={liked} onClick={onLike} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35 text-xl backdrop-blur-xl transition hover:scale-105 hover:border-white/30 active:scale-95">
            <span className={liked ? "text-[#ff9a70]" : "text-white"}>{liked ? "♥" : "♡"}</span>
          </button>
          <button aria-label="Share story" onClick={async () => {
            const payload = { title: item.title, text: `Read this on BitBuzz: ${item.title}`, url: item.url };
            if (navigator.share) { try { await navigator.share(payload); return; } catch {} }
            try { await navigator.clipboard.writeText(item.url); } catch {}
          }} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35 text-sm text-white backdrop-blur-xl transition hover:scale-105 hover:border-white/30 active:scale-95">↗</button>
          <button aria-label="Save story" onClick={onLike} className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35 text-sm text-white backdrop-blur-xl transition hover:scale-105 hover:border-white/30 active:scale-95">⌑</button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-white/10">
        <div className="h-full bg-white/80 transition-all duration-500" style={{ width: `${((index + 1) / Math.max(total, 1)) * 100}%` }} />
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/75 px-4 py-3 backdrop-blur-2xl sm:px-6">
      <div className="mx-auto flex max-w-[1100px] items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ff9a70]">BITBUZZ RADAR</p>
          <p className="truncate text-xs text-white/45">Swipe through the world's smartest stories.</p>
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
        {feed.map(({ item, key }, index) => <StoryCard key={key} item={item} index={index} total={feed.length} liked={likes.includes(item.url)} onLike={() => toggleLike(item.url)} />)}
        <div ref={sentinelRef} className="h-32 snap-start" aria-hidden="true">{loadingMore && <p className="pt-8 text-center text-[9px] uppercase tracking-[.18em] text-white/25">Finding more stories…</p>}</div>
      </section>}
    </div>
  </main>;
}
