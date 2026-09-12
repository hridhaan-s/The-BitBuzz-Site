import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

type Article = {
  id: string; slug: string; title: string; standfirst: string | null; body_md: string;
  category_id: string | null; author_id: string | null; cover_image_url: string | null;
  cover_alt: string | null; read_minutes: number | null; status: "draft" | "published";
  published_at: string | null; is_lead: boolean; view_count: number; seo_title: string | null; seo_description: string | null;
  created_at: string; updated_at: string;
  categories?: { name: string; slug: string } | null;
  profiles?: { display_name: string; avatar_url?: string | null } | null;
};

type Category = { id: string; name: string; slug: string };

const NAV_GENRES = [
  { label: "Space", slug: "space" },
  { label: "Cybersecurity", slug: "cybersecurity" },
  { label: "Tech", slug: "tech" },
  { label: "Aviation", slug: "aviation" },
  { label: "Innovation", slug: "innovation" },
  { label: "BioBuzz", slug: "biobuzz" },
] as const;

function renderMarkdown(md: string) {
  const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escape(md)
    .replace(/^### (.*)$/gm, "<h3>$1</h3>").replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>").replace(/^- (.*)$/gm, "<li>$1</li>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .split(/\n\n+/).map(block => /^<h[123]>|^<blockquote>|^<li>/.test(block) ? block : `<p>${block.replace(/\n/g, "<br />")}</p>`).join("\n");
}

function Shell({ children }: { children: React.ReactNode }) {
  const current = window.location.pathname.replace(/^\//, "") || "home";
  const [menuOpen, setMenuOpen] = useState(false);

  return <div className="min-h-screen bg-black text-white">
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[66px] max-w-[1480px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={() => setMenuOpen(true)} aria-label="Open navigation" aria-expanded={menuOpen} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white lg:hidden">
          <span className="text-lg leading-none">☰</span>
        </button>
        <a href="/home" className="flex shrink-0 items-center gap-2.5" aria-label="BitBuzz Home">
          <img src={LOGO_URL} className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20" alt="BitBuzz" />
          <span className="font-serif text-xl font-semibold tracking-[-.04em]">BitBuzz</span>
        </a>
        <nav className="ml-auto hidden items-center gap-0.5 lg:flex" aria-label="BitBuzz navigation">
          <a href="/home" className={`rounded-lg px-3 py-2.5 text-[12px] font-medium transition hover:bg-white/5 ${current === "home" ? "bg-white/10 text-white" : "text-white/55 hover:text-white"}`}>Home</a>
          {NAV_GENRES.map(genre => <a key={genre.slug} href={`/${genre.slug}`} className={`rounded-lg px-3 py-2.5 text-[12px] font-medium transition hover:bg-white/5 ${current === genre.slug || (genre.slug === "innovation" && current === "innovations") ? "bg-white/10 text-white" : "text-white/55 hover:text-white"}`}>{genre.label}</a>)}
          <a href="/about" className="ml-1 rounded-lg px-3 py-2.5 text-[12px] font-medium text-white/55 transition hover:bg-white/5 hover:text-white">About</a>
          <a href="/submit" className="ml-2 rounded-full bg-white px-4 py-2.5 text-[11px] font-bold text-black transition hover:bg-[#ffe600]">Submit</a>
        </nav>
        <a href="/submit" className="ml-auto rounded-full bg-white px-4 py-2.5 text-[11px] font-bold text-black transition hover:bg-[#ffe600] lg:hidden">Submit</a>
      </div>
    </header>

    {menuOpen && <div className="fixed inset-0 z-[100] bg-black text-white lg:hidden" role="dialog" aria-modal="true" aria-label="BitBuzz navigation">
      <div className="flex h-[66px] items-center justify-between border-b border-white/10 px-4 sm:px-6">
        <a href="/home" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}><img src={LOGO_URL} className="h-9 w-9 rounded-full object-cover" alt="BitBuzz" /><span className="font-serif text-xl font-semibold">BitBuzz</span></a>
        <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-xl text-white/70">×</button>
      </div>
      <nav className="mx-auto max-w-xl px-5 py-8 sm:px-8" aria-label="Mobile BitBuzz navigation">
        <a href="/home" onClick={() => setMenuOpen(false)} className={`block rounded-xl px-4 py-3.5 text-base ${current === "home" ? "bg-white/10 font-semibold text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>Home</a>
        <p className="mt-7 px-4 pb-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/30">Explore</p>
        {NAV_GENRES.map(genre => <a key={genre.slug} href={`/${genre.slug}`} onClick={() => setMenuOpen(false)} className={`block rounded-xl px-4 py-3 text-[15px] ${current === genre.slug || (genre.slug === "innovation" && current === "innovations") ? "bg-white/10 font-semibold text-white" : "text-white/65 hover:bg-white/5 hover:text-white"}`}>{genre.label}</a>)}
        <div className="my-6 border-t border-white/10" />
        <a href="/about" onClick={() => setMenuOpen(false)} className="block rounded-xl px-4 py-3 text-[15px] text-white/65 hover:bg-white/5 hover:text-white">About BitBuzz</a>
        <a href="/submit" onClick={() => setMenuOpen(false)} className="mt-5 block rounded-full bg-white px-5 py-3 text-center text-[13px] font-bold text-black">Submit an Article</a>
      </nav>
    </div>}

    {children}
  </div>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`rounded-[24px] border border-white/10 bg-[#080809] ${className}`}>{children}</div>; }

export default function Blog({ initialCategory = "all" }: { initialCategory?: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState(initialCategory);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const [a, c] = await Promise.all([
        supabase.from("articles").select("*, categories(name,slug), profiles(display_name,avatar_url)").eq("status", "published").order("is_lead", { ascending: false }).order("published_at", { ascending: false }),
        supabase.from("categories").select("id,name,slug").order("sort_order"),
      ]);
      if (!active) return;
      if (a.error) setError(a.error.message);
      setArticles((a.data || []) as Article[]);
      setCategories((c.data || []) as Category[]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => selected === "all" ? articles : articles.filter(a => a.categories?.slug === selected || (selected === "innovation" && a.categories?.slug === "innovations")), [articles, selected]);
  const lead = selected === "all" ? filtered.find(a => a.is_lead) || filtered[0] : filtered[0];
  const rest = filtered.filter(a => a.id !== lead?.id);
  const activeCategory = NAV_GENRES.find(g => g.slug === selected) || (selected === "innovations" ? NAV_GENRES.find(g => g.slug === "innovation") : undefined);
  const accent = activeCategory ? "#ffe600" : "#83adff";

  if (loading) return <Shell><main className="mx-auto max-w-6xl px-5 py-24 text-white/40">Loading the newsroom…</main></Shell>;
  if (error) return <Shell><main className="mx-auto max-w-6xl px-5 py-24"><Card className="p-10 text-center"><p className="font-serif text-2xl text-white/75">The newsroom could not load.</p><p className="mt-2 text-sm text-red-300/80">{error}</p><button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black">Try again</button></Card></main></Shell>;
  return <Shell><main className="mx-auto max-w-6xl px-5 py-12 sm:py-16 lg:py-20">
    <div className="flex flex-col gap-8 border-b border-white/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-[.22em]" style={{ color: accent }}>{activeCategory ? `${activeCategory.label} Desk` : "BitBuzz"}</p>
        <h1 className="mt-4 font-serif text-[clamp(3.25rem,8vw,7rem)] leading-[.88] tracking-[-.065em]">{activeCategory ? <>Stories from <span style={{ color: accent }}>{activeCategory.label}.</span></> : <>Stories worth <span className="text-[#83adff]">reading.</span></>}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/45">{activeCategory ? `The latest ${activeCategory.label.toLowerCase()} stories, explainers and ideas from BitBuzz.` : "Science, technology, cybersecurity, aviation and innovation, explained without the noise."}</p>
      </div>
      <div className="hidden shrink-0 text-right sm:block"><p className="text-[10px] uppercase tracking-[.18em] text-white/25">Independent student newsroom</p><p className="mt-2 text-xs text-white/40">Updated as stories are published</p></div>
    </div>
    <div className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Story categories">
      <button onClick={() => setSelected("all")} className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${selected === "all" ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-white/55 hover:text-white"}`}>All stories</button>
      {categories.map(c => <button key={c.id} onClick={() => setSelected(c.slug)} className={`shrink-0 rounded-full border px-4 py-2 text-xs transition ${selected === c.slug ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-white/55 hover:text-white"}`}>{c.name}</button>)}
    </div>
    {!lead ? <Card className="mt-6 p-10 text-center"><p className="font-serif text-2xl text-white/75">No stories here yet.</p><p className="mt-2 text-sm text-white/35">New {activeCategory?.label.toLowerCase() || "BitBuzz"} stories will appear here as they are published.</p></Card> : <>
      <a href={`/blog/${lead.slug}`} className="group mt-6 grid overflow-hidden rounded-[28px] border border-white/10 bg-[#080809] transition hover:border-white/20 lg:grid-cols-[1.15fr_.85fr]">{lead.cover_image_url ? <img src={lead.cover_image_url} alt={lead.cover_alt || ""} className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.02] lg:h-full"/> : <div className="min-h-72 bg-gradient-to-br from-[#0d1730] to-[#080809]"/>}<div className="p-7 sm:p-10"><span className="text-[10px] font-bold uppercase tracking-[.18em]" style={{ color: accent }}>{lead.categories?.name || activeCategory?.label || "BitBuzz"} · Lead story</span><h2 className="mt-5 font-serif text-4xl leading-[1] tracking-[-.05em] sm:text-5xl">{lead.title}</h2><p className="mt-5 leading-relaxed text-white/45">{lead.standfirst}</p><div className="mt-8 flex items-center gap-3 text-xs text-white/30">{lead.profiles?.avatar_url ? <img src={lead.profiles.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover ring-1 ring-white/15"/> : <div className="h-7 w-7 rounded-full bg-white/10"/>}<span>{lead.profiles?.display_name || "BitBuzz"}</span><span>·</span><span>{lead.read_minutes || 1} min read</span></div></div></a>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rest.map(a => <a key={a.id} href={`/blog/${a.slug}`} className="group overflow-hidden rounded-[22px] border border-white/10 bg-[#080809] transition hover:-translate-y-1 hover:border-white/20">{a.cover_image_url ? <img src={a.cover_image_url} alt={a.cover_alt || ""} className="h-48 w-full object-cover"/> : <div className="h-48 bg-gradient-to-br from-[#111827] to-[#080809]"/>}<div className="p-5"><p className="text-[9px] font-bold uppercase tracking-[.16em]" style={{ color: accent }}>{a.categories?.name || "Story"}</p><h3 className="mt-3 font-serif text-2xl leading-tight tracking-[-.04em]">{a.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/40">{a.standfirst}</p><div className="mt-5 flex items-center gap-2 text-[11px] text-white/25">{a.profiles?.avatar_url ? <img src={a.profiles.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover"/> : null}<span>{a.read_minutes || 1} min read</span></div></div></a>)}</div>
    </>}
  </main></Shell>;
}

function ArticleActionButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} aria-label={label} title={label} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] text-white/55 transition hover:border-white/30 hover:bg-white/10 hover:text-white">{children}</button>;
}

export function ArticlePage({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("articles").select("*, categories(name,slug), profiles(display_name,avatar_url)").eq("slug", slug).eq("status", "published").single();
      if (!data) setNotFound(true);
      else {
        setArticle(data as Article);
        await supabase.rpc("increment_article_view", { article_id: data.id }).then(() => {});
      }
      setLoading(false);
    })();
  }, [slug]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const shareArticle = async () => {
    if (navigator.share && article) {
      try { await navigator.share({ title: article.title, text: article.standfirst || article.title, url: window.location.href }); } catch {}
    } else {
      await copyLink();
    }
  };

  if (loading) return <Shell><main className="mx-auto max-w-4xl px-5 py-24 text-white/40">Loading story…</main></Shell>;
  if (notFound || !article) return <Shell><main className="mx-auto max-w-4xl px-5 py-24"><h1 className="font-serif text-5xl">Story not found.</h1><a href="/home" className="mt-6 inline-block text-[#83adff]">Back to Home</a></main></Shell>;

  const category = article.categories?.name || "BitBuzz";
  const author = article.profiles?.display_name || "BitBuzz";
  const date = article.published_at ? new Date(article.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";

  return <Shell>
    <article className="bg-black">
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-12 lg:pt-14">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[12px] text-white/35 sm:gap-3 sm:text-[13px]">
          <a href="/home" className="transition hover:text-white">Home</a>
          <span aria-hidden="true" className="text-white/20">›</span>
          <a href="/home" className="transition hover:text-white">Newsroom</a>
          <span aria-hidden="true" className="text-white/20">›</span>
          <a href={`/${article.categories?.slug || ""}`} className="transition hover:text-white">{category}</a>
          <span aria-hidden="true" className="text-white/20">›</span>
          <span className="text-white/70">{article.title}</span>
        </nav>

        <div className="mt-10 max-w-[1220px] sm:mt-14">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-white/20 bg-white/[0.03] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/80">{category}</span>
            {article.is_lead && <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/55">Featured</span>}
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/45">{article.read_minutes || 1} min read</span>
          </div>

          <h1 className="mt-7 max-w-[1180px] font-serif text-[clamp(3rem,7.4vw,7.6rem)] font-semibold leading-[.9] tracking-[-.065em] text-white">{article.title}</h1>
          {article.standfirst && <p className="mt-8 max-w-[1080px] text-[clamp(1.05rem,2vw,1.65rem)] leading-[1.45] tracking-[-.015em] text-white/45">{article.standfirst}</p>}

          <div className="mt-10 flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {article.profiles?.avatar_url ? <img src={article.profiles.avatar_url} alt={author} className="h-12 w-12 rounded-full object-cover ring-1 ring-white/20"/> : <div className="h-12 w-12 rounded-full bg-white/10 ring-1 ring-white/10"/>}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/45">
                <span className="font-medium text-white/85">{author}</span>
                {date && <><span aria-hidden="true" className="text-white/20">·</span><span>{date}</span></>}
                <span aria-hidden="true" className="text-white/20">·</span>
                <span>{article.read_minutes || 1} min read</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ArticleActionButton label="Bookmark story" onClick={() => {}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M6.5 4.75A1.75 1.75 0 0 1 8.25 3h7.5a1.75 1.75 0 0 1 1.75 1.75v16l-5.5-3.4-5.5 3.4z"/></svg>
              </ArticleActionButton>
              <ArticleActionButton label="Share story" onClick={shareArticle}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.9 7.6-4.8M8.2 13.1l7.6 4.8"/></svg>
              </ArticleActionButton>
              <ArticleActionButton label={copied ? "Link copied" : "Copy story link"} onClick={copyLink}>
                {copied ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="m5 12 4.5 4.5L19 7"/></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path d="M10 13.8a4 4 0 0 0 5.7 0l2.1-2.1a4 4 0 0 0-5.7-5.7l-1.2 1.2"/><path d="M14 10.2a4 4 0 0 0-5.7 0l-2.1 2.1a4 4 0 0 0 5.7 5.7l1.2-1.2"/></svg>}
              </ArticleActionButton>
            </div>
          </div>
        </div>

        {article.cover_image_url && <img src={article.cover_image_url} alt={article.cover_alt || ""} className="mt-10 max-h-[720px] w-full rounded-[28px] object-cover"/>}

        <div className="mx-auto mt-14 max-w-[860px] prose prose-invert prose-headings:font-serif prose-headings:tracking-[-.04em] prose-h2:mt-14 prose-h2:text-4xl prose-h3:mt-10 prose-h3:text-2xl prose-p:my-6 prose-p:text-white/70 prose-p:leading-[1.85] prose-li:text-white/70 prose-strong:text-white prose-a:text-[#ffe600] prose-blockquote:border-white/20 prose-blockquote:text-white/55 text-[17px] sm:text-[18px]" dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body_md) }}/>
      </div>
    </article>
  </Shell>;
}
