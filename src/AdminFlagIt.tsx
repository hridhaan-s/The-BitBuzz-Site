import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

type Status = "pending" | "in_review" | "approved" | "rejected" | "archived";
type Report = {
  id: string;
  created_at: string;
  updated_at: string;
  status: Status;
  category_id: string;
  title: string;
  story: string;
  scam_type: string | null;
  platform: string | null;
  occurred_at: string | null;
  evidence: Array<{ url?: string } | string>;
  reporter_note: string | null;
  published_article_id: string | null;
  reviewed_at: string | null;
  review_note: string | null;
};

type DirectPost = {
  title: string;
  standfirst: string;
  body: string;
  scamType: string;
  platform: string;
  occurredAt: string;
  evidence: string;
};

const emptyPost: DirectPost = { title: "", standfirst: "", body: "", scamType: "", platform: "", occurredAt: "", evidence: "" };
const date = (value: string | null) => value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "Not supplied";
const shortDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const slugify = (value: string) => `${value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 78)}-${crypto.randomUUID().slice(0, 8)}`;

function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status,string> = { pending:"border-[#ffc48f]/20 bg-[#ffc48f]/10 text-[#ffc48f]", in_review:"border-blue-400/20 bg-blue-400/10 text-blue-300", approved:"border-emerald-400/20 bg-emerald-400/10 text-emerald-300", rejected:"border-red-400/20 bg-red-400/10 text-red-300", archived:"border-white/10 bg-white/[.04] text-white/35" };
  const labels: Record<Status,string> = { pending:"Pending", in_review:"In review", approved:"Published", rejected:"Rejected", archived:"Archived" };
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.15em] ${styles[status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{labels[status]}</span>;
}

const inputClass = "mt-2 w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#ff7a3d]/50";

export default function AdminFlagIt() {
  const [items,setItems] = useState<Report[]>([]);
  const [filter,setFilter] = useState<Status>("pending");
  const [query,setQuery] = useState("");
  const [selected,setSelected] = useState<Report|null>(null);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  const [reviewNote,setReviewNote] = useState("");
  const [showDirectPost,setShowDirectPost] = useState(false);
  const [directPost,setDirectPost] = useState<DirectPost>(emptyPost);
  const [directBusy,setDirectBusy] = useState(false);

  const load = async () => {
    const { data,error } = await supabase.from("bitbuzz_flag_it_reports").select("*").eq("status",filter).order("created_at",{ascending:false});
    if(error) setMessage(error.message); else setItems((data||[]) as Report[]);
  };
  useEffect(()=>{ load(); },[filter]);

  const filtered = useMemo(()=>{
    const q=query.trim().toLowerCase();
    if(!q) return items;
    return items.filter(x=>`${x.title} ${x.story} ${x.scam_type||""} ${x.platform||""}`.toLowerCase().includes(q));
  },[items,query]);

  const review = async (status: Status) => {
    if(!selected) return;
    setBusy(true); setMessage("");
    const { error } = await supabase.rpc("bitbuzz_review_flag_it_report", { p_report_id:selected.id, p_status:status, p_review_note:reviewNote.trim()||null });
    if(error) setMessage(error.message); else { setSelected(null); setReviewNote(""); await load(); }
    setBusy(false);
  };

  const publishDirectly = async () => {
    if(!directPost.title.trim() || !directPost.body.trim()) { setMessage("Add a headline and article body before publishing."); return; }
    setDirectBusy(true); setMessage("");
    try {
      const [{ data: authData, error: authError }, { data: category, error: categoryError }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("categories").select("id").eq("slug","flagit").maybeSingle()
      ]);
      if(authError) throw authError;
      if(categoryError) throw categoryError;
      if(!authData.user) throw new Error("You must be signed in to publish directly.");
      if(!category?.id) throw new Error("The Flag It category could not be found.");

      const evidence = directPost.evidence.split("\n").map(x=>x.trim()).filter(Boolean).map(url=>({url}));
      const context = [
        directPost.scamType.trim() ? `**Scam type:** ${directPost.scamType.trim()}` : "",
        directPost.platform.trim() ? `**Platform:** ${directPost.platform.trim()}` : "",
        directPost.occurredAt ? `**Reported date:** ${new Intl.DateTimeFormat("en-IN", { day:"numeric", month:"long", year:"numeric" }).format(new Date(directPost.occurredAt))}` : "",
        evidence.length ? `**Evidence:**\n${evidence.map(x=>`- ${x.url}`).join("\n")}` : ""
      ].filter(Boolean).join("\n\n");
      const body = [directPost.body.trim(), context].filter(Boolean).join("\n\n");
      const slug = slugify(directPost.title);
      const { error } = await supabase.from("articles").insert({
        slug,
        title: directPost.title.trim(),
        standfirst: directPost.standfirst.trim() || null,
        body_md: body,
        category_id: category.id,
        author_id: authData.user.id,
        read_minutes: 3,
        status: "published",
        published_at: new Date().toISOString(),
        is_lead: false,
        view_count: 0,
        seo_title: directPost.title.trim(),
        seo_description: directPost.standfirst.trim() || directPost.body.trim().slice(0, 155)
      });
      if(error) throw error;
      setDirectPost(emptyPost);
      setShowDirectPost(false);
      setMessage("Flag It article published successfully.");
    } catch(error) {
      setMessage(error instanceof Error ? error.message : "Could not publish the Flag It article.");
    } finally {
      setDirectBusy(false);
    }
  };

  return <section className="min-h-[calc(100vh-64px)] bg-[#050505] px-4 py-7 text-white sm:px-6 lg:px-8">
    <div className="mx-auto max-w-[1180px]">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div><div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.24em] text-[#ff7a3d]"><span className="h-1.5 w-1.5 rounded-full bg-[#ff7a3d] shadow-[0_0_14px_#ff7a3d]"/>Scam watch</div><h1 className="mt-3 font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[.9] tracking-[-.055em]">Flag It.</h1><p className="mt-4 max-w-xl text-sm leading-6 text-white/38">Review community reports, verify the evidence, and publish approved reports as real BitBuzz articles.</p></div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={()=>{setMessage("");setShowDirectPost(true)}} className="rounded-2xl bg-[#ff7a3d] px-5 py-3 text-[10px] font-bold uppercase tracking-[.14em] text-black transition hover:bg-[#ff9867]">+ Post directly</button>
          <div className="grid grid-cols-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[.025]">
            {(["pending","in_review","approved","rejected"] as Status[]).map((status,i)=><button key={status} type="button" onClick={()=>setFilter(status)} className={`min-w-[92px] px-3 py-4 text-left transition sm:min-w-[112px] ${filter===status?"bg-white text-black":"text-white/38 hover:bg-white/[.04] hover:text-white"} ${i?"border-l border-white/10":""}`}><span className="block text-[8px] font-bold uppercase tracking-[.14em]">{status.replace("_"," ")}</span><span className="mt-1 block text-xl font-semibold">{filter===status?items.length:""}</span></button>)}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 border-y border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="text-[10px] font-bold uppercase tracking-[.16em] text-white/25">Editorial review queue</div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search reports" className="w-full rounded-xl border border-white/10 bg-white/[.025] px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-white/25 sm:w-80"/></div>
      {message&&<div className="mt-5 rounded-xl border border-[#ff7a3d]/20 bg-[#ff7a3d]/[.05] px-4 py-3 text-xs text-[#ffb18b]">{message}</div>}

      <div className="mt-6 space-y-3">
        {filtered.length===0?<div className="rounded-[24px] border border-dashed border-white/10 bg-white/[.015] px-6 py-20 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-[#ff7a3d]">⚑</div><h2 className="mt-5 font-serif text-2xl">No reports here.</h2><p className="mt-2 text-xs text-white/30">The {filter.replace("_"," ")} queue is currently empty.</p></div>:filtered.map(item=><article key={item.id} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[.018] transition hover:border-white/20 hover:bg-white/[.03]"><div className="p-5 sm:p-6"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><StatusPill status={item.status}/>{item.scam_type&&<span className="text-[9px] font-bold uppercase tracking-[.14em] text-white/25">{item.scam_type}</span>}{item.platform&&<span className="text-[9px] font-bold uppercase tracking-[.14em] text-white/25">{item.platform}</span>}</div><h2 className="mt-3 font-serif text-[clamp(1.6rem,3vw,2.25rem)] leading-[.95] tracking-[-.04em]">{item.title}</h2><p className="mt-3 line-clamp-4 text-sm leading-6 text-white/45">{item.story}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-white/25"><span>Submitted {shortDate(item.created_at)}</span><span>Occurred {date(item.occurred_at)}</span>{item.evidence?.length>0&&<span>{item.evidence.length} evidence item{item.evidence.length===1?"":"s"}</span>}</div></div><button type="button" onClick={()=>{setSelected(item);setReviewNote(item.review_note||"")}} className="shrink-0 rounded-xl bg-white px-4 py-2.5 text-[10px] font-bold text-black hover:bg-[#ffe2c9]">Review report</button></div></div></article>)}
      </div>
    </div>

    {selected&&<div className="fixed inset-0 z-[200] overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-md" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0b] shadow-[0_30px_120px_rgba(0,0,0,.75)]"><div className="flex items-start justify-between border-b border-white/10 px-6 py-5 sm:px-8"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#ff7a3d]">Flag It review</p><h2 className="mt-2 font-serif text-3xl tracking-[-.04em]">{selected.title}</h2></div><button type="button" onClick={()=>setSelected(null)} className="h-9 w-9 rounded-full border border-white/10 text-white/50 hover:bg-white/10 hover:text-white">×</button></div><div className="space-y-6 p-6 sm:p-8"><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/25">Scam type</p><p className="mt-1 text-sm text-white/70">{selected.scam_type||"Not supplied"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/25">Platform</p><p className="mt-1 text-sm text-white/70">{selected.platform||"Not supplied"}</p></div><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/25">Occurred</p><p className="mt-1 text-sm text-white/70">{date(selected.occurred_at)}</p></div></div><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/25">Report</p><p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-white/65">{selected.story}</p></div>{selected.reporter_note&&<div className="rounded-2xl border border-white/10 bg-white/[.025] p-4"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/25">Reporter note</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/50">{selected.reporter_note}</p></div>}{selected.evidence?.length>0&&<div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/25">Evidence</p><div className="mt-2 space-y-2">{selected.evidence.map((e,i)=>{const url=typeof e==="string"?e:e.url||"";return <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block truncate rounded-xl border border-white/10 bg-white/[.025] px-4 py-3 text-xs text-white/55 hover:border-white/25 hover:text-white">{url||"Evidence item"} ↗</a>})}</div></div>}<div><label className="text-[9px] font-bold uppercase tracking-[.16em] text-white/25">Internal review note</label><textarea value={reviewNote} onChange={e=>setReviewNote(e.target.value)} placeholder="Optional note for the editorial record" className="mt-2 min-h-24 w-full resize-y rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#ff7a3d]/50"/></div><div className="flex flex-wrap justify-end gap-2 border-t border-white/10 pt-5"><button disabled={busy} onClick={()=>review("in_review")} className="rounded-xl border border-blue-400/20 px-4 py-2.5 text-[10px] font-semibold text-blue-300 hover:bg-blue-400/[.05]">Mark in review</button><button disabled={busy} onClick={()=>review("rejected")} className="rounded-xl border border-red-400/20 px-4 py-2.5 text-[10px] font-semibold text-red-300 hover:bg-red-400/[.05]">Reject</button><button disabled={busy} onClick={()=>review("approved")} className="rounded-xl bg-white px-5 py-2.5 text-[10px] font-bold text-black hover:bg-[#ffe2c9]">{busy?"Publishing…":"Approve and publish article"}</button></div></div></div></div>}

    {showDirectPost&&<div className="fixed inset-0 z-[210] overflow-y-auto bg-black/85 px-4 py-6 backdrop-blur-md" onMouseDown={e=>{if(e.target===e.currentTarget&&!directBusy)setShowDirectPost(false)}}><div className="mx-auto max-w-3xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0b] shadow-[0_30px_120px_rgba(0,0,0,.8)]"><div className="flex items-start justify-between border-b border-white/10 px-6 py-5 sm:px-8"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-[#ff7a3d]">Editor publishing</p><h2 className="mt-2 font-serif text-3xl tracking-[-.04em]">Post Flag It directly.</h2><p className="mt-2 max-w-xl text-xs leading-5 text-white/35">This bypasses the community review queue and publishes immediately under the Flag It category.</p></div><button type="button" disabled={directBusy} onClick={()=>setShowDirectPost(false)} className="h-9 w-9 rounded-full border border-white/10 text-white/50 hover:bg-white/10 hover:text-white">×</button></div><div className="space-y-5 p-6 sm:p-8"><div><label className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Headline *</label><input value={directPost.title} onChange={e=>setDirectPost(p=>({...p,title:e.target.value}))} placeholder="Write the Flag It headline" className={inputClass}/></div><div><label className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Standfirst</label><textarea value={directPost.standfirst} onChange={e=>setDirectPost(p=>({...p,standfirst:e.target.value}))} placeholder="Short summary shown on cards and SEO" className={`${inputClass} min-h-20 resize-y`}/></div><div><label className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Article body *</label><textarea value={directPost.body} onChange={e=>setDirectPost(p=>({...p,body:e.target.value}))} placeholder="Write the full report. Markdown is supported." className={`${inputClass} min-h-56 resize-y`}/></div><div className="grid gap-5 sm:grid-cols-2"><div><label className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Scam type</label><input value={directPost.scamType} onChange={e=>setDirectPost(p=>({...p,scamType:e.target.value}))} placeholder="Phishing, impersonation, fake offer…" className={inputClass}/></div><div><label className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Platform</label><input value={directPost.platform} onChange={e=>setDirectPost(p=>({...p,platform:e.target.value}))} placeholder="Instagram, email, website…" className={inputClass}/></div></div><div><label className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Occurred / reported date</label><input type="datetime-local" value={directPost.occurredAt} onChange={e=>setDirectPost(p=>({...p,occurredAt:e.target.value}))} className={inputClass}/></div><div><label className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Evidence links</label><textarea value={directPost.evidence} onChange={e=>setDirectPost(p=>({...p,evidence:e.target.value}))} placeholder="One URL per line" className={`${inputClass} min-h-24 resize-y`}/></div><div className="flex items-center justify-end gap-2 border-t border-white/10 pt-5"><button type="button" disabled={directBusy} onClick={()=>setShowDirectPost(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-[10px] font-semibold text-white/50 hover:bg-white/[.04] hover:text-white">Cancel</button><button type="button" disabled={directBusy} onClick={publishDirectly} className="rounded-xl bg-[#ff7a3d] px-5 py-2.5 text-[10px] font-bold text-black hover:bg-[#ff9867]">{directBusy?"Publishing…":"Publish directly"}</button></div></div></div></div>}
  </section>;
}
