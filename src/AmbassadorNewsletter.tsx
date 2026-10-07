import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";
import NewsletterBuilder, { Campaign, StoryOption } from "./NewsletterBuilder";
import { Brand, Edition, SITE } from "./lib/newsletterEmail";

type Publication = { id: string; slug?: string | null; profile_name: string; school_name: string; logo_url: string | null; contact_email?: string | null; hero: any };

export default function AmbassadorNewsletter({ publication }: { publication: Publication }) {
  const hero = publication.hero || {};
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [count, setCount] = useState(0);

  const pubUrl = publication.slug ? `${SITE}/ambassadors/${publication.slug}` : SITE;
  const brand = useMemo<Brand>(() => ({ name: publication.profile_name, sub: publication.school_name, logoUrl: publication.logo_url, homeUrl: pubUrl }), [publication.profile_name, publication.school_name, publication.logo_url, pubUrl]);
  const defaults = useMemo<Edition>(() => ({
    subject: "This week at " + publication.profile_name,
    preheader: "",
    headline: "What's happening in our community.",
    intro: "",
    accent: hero.accent_color || "#ff6a1f",
    headerImage: hero.header_image || "",
    blocks: [],
  }), [publication.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback(async () => {
    const [{ count: c }, { data }] = await Promise.all([
      supabase.from("bitbuzz_newsletter_subscribers").select("id", { count: "exact", head: true }).eq("publication_id", publication.id).is("unsubscribed_at", null),
      supabase.from("bitbuzz_newsletter_campaigns").select("id,subject,preview_text,body_html,status,created_at,sent_at").eq("publication_id", publication.id).order("created_at", { ascending: false }).limit(10),
    ]);
    setCount(c || 0);
    setCampaigns((data || []) as Campaign[]);
  }, [publication.id]);
  useEffect(() => { void load(); }, [load]);

  // Publication stories don't have their own public pages yet, so they link to the publication page.
  const loadStories = useCallback(async (): Promise<StoryOption[]> => {
    const { data, error } = await supabase.from("bitbuzz_articles")
      .select("id,headline,description,category,cover_url,published_at")
      .eq("publication_id", publication.id).eq("status", "published")
      .order("published_at", { ascending: false }).limit(30);
    if (error) throw error;
    return (data || []).map((a: any) => ({ id: a.id, title: a.headline || "", summary: a.description || "", url: pubUrl, image: a.cover_url || "", kicker: a.category || "", date: a.published_at }));
  }, [publication.id, pubUrl]);

  const onSave = useCallback(async (ed: Edition, html: string, send: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.id) throw new Error("Please sign in again.");
    const { data: campaign, error } = await supabase.from("bitbuzz_newsletter_campaigns").insert({
      publication_id: publication.id, subject: ed.subject.trim(), preview_text: ed.preheader.trim() || null, body_html: html, created_by: session.user.id, status: "draft",
    }).select("id").single();
    if (error || !campaign) throw error || new Error("Could not save campaign.");
    let msg = "Draft saved.";
    if (send) {
      const { data, error: fnError } = await supabase.functions.invoke("bitbuzz-send-newsletter", { body: { campaign_id: campaign.id } });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      msg = `Sent to ${data?.sent || 0} subscribers${data?.failed ? `, ${data.failed} failed` : ""}.`;
    }
    await load();
    return msg;
  }, [publication.id, load]);

  return <div className="space-y-6">
    <div>
      <h2 className="font-serif text-4xl font-black tracking-[-.04em]">Your newsletter.</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">Build an edition from your published stories. {count.toLocaleString("en-IN")} active readers.</p>
    </div>
    <NewsletterBuilder brand={brand} defaults={defaults} subscriberCount={count} campaigns={campaigns} loadStories={loadStories} onSave={onSave} />
  </div>;
}
