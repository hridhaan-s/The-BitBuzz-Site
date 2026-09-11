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
  profiles?: { display_name: string } | null;
};

type Category = { id: string; name: string; slug: string };

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
  return <div className="min-h-screen bg-black text-white"><header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl"><div className="mx-auto flex h-[64px] max-w-[1280px] items-center justify-between px-5"><a href="/home" className="flex items-center gap-2.5"><img src={LOGO_URL} className="h-8 w-8 rounded-full object-cover" alt="BitBuzz"/><span className="font-serif text-xl font-semibold tracking-[-.04em]">BitBuzz</span></a><a href="/home" className="text-xs text-white/45 hover:text-white">Newsroom →</a></div></header>{children}</div>;
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <div className={`rounded-[24px] border border-white/10 bg-[#080809] ${className}`}>{children}</div>; }

export default function Blog() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from("articles").select("*, categories(name,slug), profiles(display_name)").eq("status", "published").lte("published_at", new Date().toISOString()).order("is_lead", { ascending: false }).order("published_at", { ascending: false }),
      supabase.from("categories").select("id,name,slug").order("sort_order"),
    ]).then(([a, c]) => { setArticles((a.data || []) as Article[]); setCategories((c.data || []) as Category[]); setLoading(false); });
  }, []);

  const filtered = useMemo(() => selected === "all" ? articles : articles.filter(a => a.categories?.slug === selected), [articles, selected]);
  const lead = selected === "all" ? filtered.find(a => a.is_lead) || filtered[0] : filtered[0];
  const rest = filtered.filter(a => a.id !== lead?.id);

  if (loading) return <Shell><main className="mx-auto max-w-6xl px-5 py-24 text-white/40">Loading the newsroom…</main></Shell>;
  return <Shell><main className="mx-auto max-w-6xl px-5 py-14 sm:py-20">
    <div className="max-w-3xl"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#83adff]">BitBuzz Journal</p><h1 className="mt-4 font-serif text-[clamp(3.5rem,8vw,7rem)] leading-[.88] tracking-[-.065em]">Stories worth <span className="text-[#83adff]">reading.</span></h1><p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/45">Science, technology, cybersecurity, aviation and innovation — explained without the noise.</p></div>
    <div className="mt-12 flex gap-2 overflow-x-auto pb-2"><button onClick={() => setSelected("all")} className={`shrink-0 rounded-full px-4 py-2 text-xs ${selected === "all" ? "bg-white text-black" : "bg-white/5 text-white/55"}`}>All stories</button>{categories.map(c => <button key={c.id} onClick={() => setSelected(c.slug)} className={`shrink-0 rounded-full px-4 py-2 text-xs ${selected === c.slug ? "bg-white text-black" : "bg-white/5 text-white/55"}`}>{c.name}</button>)}</div>
    {!lead ? <Card className="mt-6 p-10 text-center text-white/40">No published stories in this category yet.</Card> : <>
      <a href={`/blog/${lead.slug}`} className="group mt-6 grid overflow-hidden rounded-[28px] border border-white/10 bg-[#080809] lg:grid-cols-[1.15fr_.85fr]">{lead.cover_image_url ? <img src={lead.cover_image_url} alt={lead.cover_alt || ""} className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.02] lg:h-full"/> : <div className="min-h-72 bg-gradient-to-br from-[#0d1730] to-[#080809]"/>}<div className="p-7 sm:p-10"><span className="text-[10px] font-bold uppercase tracking-[.18em] text-[#83adff]">{lead.categories?.name || "BitBuzz"} · Lead story</span><h2 className="mt-5 font-serif text-4xl leading-[1] tracking-[-.05em] sm:text-5xl">{lead.title}</h2><p className="mt-5 leading-relaxed text-white/45">{lead.standfirst}</p><p className="mt-8 text-xs text-white/30">{lead.read_minutes || 1} min read · {lead.profiles?.display_name || "BitBuzz"}</p></div></a>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rest.map(a => <a key={a.id} href={`/blog/${a.slug}`} className="group overflow-hidden rounded-[22px] border border-white/10 bg-[#080809] transition hover:-translate-y-1 hover:border-white/20">{a.cover_image_url ? <img src={a.cover_image_url} alt={a.cover_alt || ""} className="h-48 w-full object-cover"/> : <div className="h-48 bg-gradient-to-br from-[#111827] to-[#080809]"/>}<div className="p-5"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#83adff]">{a.categories?.name || "Story"}</p><h3 className="mt-3 font-serif text-2xl leading-tight tracking-[-.04em]">{a.title}</h3><p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/40">{a.standfirst}</p><p className="mt-5 text-[11px] text-white/25">{a.read_minutes || 1} min read</p></div></a>)}</div>
    </>}
  </main></Shell>;
}

export function ArticlePage({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null); const [loading, setLoading] = useState(true); const [notFound, setNotFound] = useState(false);
  useEffect(() => { (async () => { const { data } = await supabase.from("articles").select("*, categories(name,slug), profiles(display_name)").eq("slug", slug).eq("status", "published").lte("published_at", new Date().toISOString()).single(); if (!data) setNotFound(true); else { setArticle(data as Article); await supabase.rpc("increment_article_view", { article_id: data.id }).then(() => {}); } setLoading(false); })(); }, [slug]);
  if (loading) return <Shell><main className="mx-auto max-w-4xl px-5 py-24 text-white/40">Loading story…</main></Shell>;
  if (notFound || !article) return <Shell><main className="mx-auto max-w-4xl px-5 py-24"><h1 className="font-serif text-5xl">Story not found.</h1><a href="/blog" className="mt-6 inline-block text-[#83adff]">← Back to Journal</a></main></Shell>;
  return <Shell><article className="mx-auto max-w-4xl px-5 py-14 sm:py-20"><a href="/blog" className="text-xs text-white/35 hover:text-white">← Journal</a><div className="mt-10"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#83adff]">{article.categories?.name || "BitBuzz"}</p><h1 className="mt-5 font-serif text-[clamp(3rem,7vw,6.5rem)] leading-[.9] tracking-[-.06em]">{article.title}</h1><p className="mt-7 max-w-3xl text-xl leading-relaxed text-white/50">{article.standfirst}</p><div className="mt-7 flex flex-wrap gap-4 text-xs text-white/30"><span>{article.profiles?.display_name || "BitBuzz"}</span><span>·</span><span>{article.read_minutes || 1} min read</span><span>·</span><span>{article.published_at ? new Date(article.published_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}</span></div></div>{article.cover_image_url && <img src={article.cover_image_url} alt={article.cover_alt || ""} className="mt-10 max-h-[620px] w-full rounded-[28px] object-cover"/>}<div className="prose prose-invert mt-12 max-w-none text-[17px] leading-[1.85] text-white/75" dangerouslySetInnerHTML={{ __html: renderMarkdown(article.body_md) }}/></article></Shell>;
}
