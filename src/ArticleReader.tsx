import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { Markdown } from "./Markdown";

type Article = {
  id: string; slug: string; title: string; standfirst: string | null; body_md: string;
  cover_image_url: string | null; cover_alt: string | null; read_minutes: number | null;
  published_at: string | null; view_count: number; seo_title: string | null; seo_description: string | null;
  categories?: { name: string; slug: string } | null;
  profiles?: { display_name: string; avatar_url?: string | null } | null;
};

const date = (v: string | null) => v ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(v)) : "";

export default function ArticleReader({ slug }: { slug: string }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true); setError("");
      const { data, error: articleError } = await supabase.from("articles").select("*,categories(name,slug),profiles(display_name,avatar_url)").eq("slug", slug).eq("status", "published").maybeSingle();
      if (!active) return;
      if (articleError || !data) { setError(articleError?.message || "Story not found."); setLoading(false); return; }
      setArticle(data as Article);
      const category = (data.categories as { slug?: string } | null)?.slug;
      const { data: relatedData } = await supabase.from("articles").select("id,slug,title,standfirst,cover_image_url,cover_alt,read_minutes,published_at,view_count,categories(name,slug),profiles(display_name)").eq("status", "published").neq("id", data.id).order("published_at", { ascending: false }).limit(8);
      if (active) setRelated(((relatedData || []) as Article[]).filter(a => !category || a.categories?.slug === category).slice(0, 3));
      setLoading(false);
      await supabase.rpc("increment_article_view", { article_id: data.id }).catch(() => undefined);
    })();
    return () => { active = false; };
  }, [slug]);

  if (loading) return <main className="min-h-screen bg-black px-5 pt-[120px] text-center text-[10px] uppercase tracking-[.2em] text-white/25">Loading story…</main>;
  if (error || !article) return <main className="min-h-screen bg-black px-5 pt-[150px] text-center text-white"><p className="text-[10px] uppercase tracking-[.2em] text-white/30">404 · Story</p><h1 className="mt-4 font-serif text-5xl">{error || "Story not found."}</h1><a href="/home" className="mt-8 inline-flex rounded-full bg-white px-5 py-3 text-xs font-bold text-black">Back to newsroom</a></main>;

  return <main className="min-h-screen overflow-x-hidden bg-black text-white pt-[70px]">
    <article>
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-[1040px] px-5 pb-10 pt-14 sm:pt-20 lg:px-8 lg:pb-14">
          <a href={article.categories?.slug ? `/${article.categories.slug}` : "/home"} className="text-[9px] font-bold uppercase tracking-[.22em] text-white/40 hover:text-white">{article.categories?.name || "BitBuzz"}</a>
          <h1 className="mt-6 max-w-[1000px] font-serif text-[clamp(3.2rem,8vw,7.5rem)] leading-[.84] tracking-[-.07em]">{article.title}</h1>
          {article.standfirst && <p className="mt-7 max-w-3xl text-[17px] leading-7 text-white/45 sm:text-[19px]">{article.standfirst}</p>}
          <div className="mt-8 flex flex-wrap items-center gap-3 text-[9px] uppercase tracking-[.14em] text-white/25">
            {article.profiles?.avatar_url ? <img src={article.profiles.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover"/> : <span className="h-7 w-7 rounded-full bg-white/10"/>}
            <span>{article.profiles?.display_name || "BitBuzz"}</span><span>·</span><span>{article.published_at ? date(article.published_at) : ""}</span><span>·</span><span>{article.read_minutes || 1} min read</span><span>·</span><span>{article.view_count || 0} views</span>
          </div>
        </div>
      </header>

      {article.cover_image_url && <div className="mx-auto max-w-[1320px] px-0 sm:px-5 lg:px-8"><img src={article.cover_image_url} alt={article.cover_alt || ""} className="aspect-[16/8] w-full object-cover sm:rounded-b-[2px]"/></div>}

      <div className="mx-auto grid max-w-[1120px] gap-12 px-5 py-12 sm:py-16 lg:grid-cols-[minmax(0,760px)_220px] lg:px-8 lg:py-20">
        <Markdown value={article.body_md} />
        <aside className="hidden border-l border-white/10 pl-6 lg:block"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/25">About this story</p><p className="mt-4 text-xs leading-5 text-white/35">Published by the BitBuzz student newsroom.</p><a href="/submit" className="mt-6 inline-flex rounded-full border border-white/15 px-4 py-2 text-[10px] font-semibold text-white/70 hover:border-white/30 hover:text-white">Write for BitBuzz</a></aside>
      </div>
    </article>

    {related.length > 0 && <section className="border-t border-white/10"><div className="mx-auto max-w-[1120px] px-5 py-12 lg:px-8 lg:py-16"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/30">Keep reading</p><div className="mt-6 grid gap-6 md:grid-cols-3">{related.map(a => <a key={a.id} href={`/blog/${a.slug}`} className="group"><div className="overflow-hidden rounded bg-[#080808]">{a.cover_image_url ? <img src={a.cover_image_url} alt={a.cover_alt || ""} className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-[1.025]"/> : <div className="aspect-[16/10]"/>}</div><p className="mt-4 font-serif text-2xl leading-none tracking-[-.04em] group-hover:text-white/70">{a.title}</p><p className="mt-3 text-[9px] uppercase tracking-[.12em] text-white/25">{a.read_minutes || 1} min read</p></a>)}</div></div></section>}
  </main>;
}
