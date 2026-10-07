import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import NewsletterBuilder, { Campaign, StoryOption } from "./NewsletterBuilder";
import { Brand, Edition, SITE } from "./lib/newsletterEmail";

const BRAND: Brand = { name: "The BitBuzz Brief", sub: "Student journalism on science and technology", logoUrl: "/brand/bitbuzz-mark.png", homeUrl: SITE };

async function mainPublicationId() {
  const { data, error } = await supabase.from("bitbuzz_publications").select("id").eq("slug", "srgs").eq("status", "active").maybeSingle();
  if (error || !data) throw new Error("Active BitBuzz publication not found.");
  return data.id as string;
}

export default function NewsletterDesk() {
  const [pubId, setPubId] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadError, setLoadError] = useState("");

  const defaults = useMemo<Edition>(() => ({ subject: "", preheader: "", headline: "This week on BitBuzz", intro: "", accent: "#ff6a1f", headerImage: "", blocks: [] }), []);

  const load = useCallback(async () => {
    try {
      const id = pubId || await mainPublicationId();
      if (!pubId) setPubId(id);
      const [{ count: c }, { data }] = await Promise.all([
        // Scoped to this publication. Previously this counted every publication's subscribers.
        supabase.from("bitbuzz_newsletter_subscribers").select("id", { count: "exact", head: true }).eq("publication_id", id).is("unsubscribed_at", null),
        supabase.from("bitbuzz_newsletter_campaigns").select("id,subject,preview_text,body_html,status,created_at,sent_at").eq("publication_id", id).order("created_at", { ascending: false }).limit(8),
      ]);
      setCount(c || 0);
      setCampaigns((data || []) as Campaign[]);
    } catch (e) { setLoadError(e instanceof Error ? e.message : "Could not load the newsletter desk."); }
  }, [pubId]);
  useEffect(() => { void load(); }, [load]);

  const loadStories = useCallback(async (): Promise<StoryOption[]> => {
    const { data, error } = await supabase.from("articles")
      .select("id,slug,title,standfirst,cover_image_url,published_at,categories(name)")
      .eq("status", "published").order("published_at", { ascending: false }).limit(40);
    if (error) throw error;
    return (data || []).map((a: any) => ({
      id: a.id, title: a.title || "", summary: a.standfirst || "", url: `${SITE}/blog/${a.slug}`,
      image: a.cover_image_url || "", kicker: (Array.isArray(a.categories) ? a.categories[0]?.name : a.categories?.name) || "", date: a.published_at,
    }));
  }, []);

  const onSave = useCallback(async (ed: Edition, html: string, send: boolean) => {
    const id = pubId || await mainPublicationId();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error("Please sign in to the editorial console again.");
    const { data: campaign, error } = await supabase.from("bitbuzz_newsletter_campaigns").insert({
      publication_id: id, subject: ed.subject.trim(), preview_text: ed.preheader.trim() || null, body_html: html, status: "draft", created_by: session.user.id,
    }).select("id").single();
    if (error || !campaign) throw error || new Error("Could not save newsletter.");
    let msg = "Draft saved.";
    if (send) {
      const { data, error: fnError } = await supabase.functions.invoke("bitbuzz-send-newsletter", { body: { campaign_id: campaign.id } });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      msg = `Sent: ${data?.sent || 0} delivered${data?.failed ? `, ${data.failed} failed` : ""}.`;
    }
    await load();
    return msg;
  }, [pubId, load]);

  return <section className="space-y-6 rounded-[24px] border border-white/10 bg-[#080809] p-6 sm:p-7">
    <div>
      <h1 className="font-serif text-4xl tracking-[-.04em]">Publish the BitBuzz Brief.</h1>
      <p className="mt-2 text-sm text-white/40">Pull in stories, add a note, check, send. {count.toLocaleString("en-IN")} active subscribers.</p>
      {loadError && <p className="mt-3 text-sm text-red-300">{loadError}</p>}
    </div>
    <NewsletterBuilder brand={BRAND} defaults={defaults} subscriberCount={count} campaigns={campaigns} loadStories={loadStories} onSave={onSave} />
  </section>;
}
