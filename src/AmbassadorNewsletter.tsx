import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

type Campaign={id:string;subject:string;preview_text:string|null;body_html:string;status:string;created_at:string;sent_at:string|null};
type Publication={id:string;profile_name:string;school_name:string;logo_url:string|null;contact_email:string|null;hero:any};

const esc=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const buildEmail=(p:Publication,subject:string,preview:string,header:string,accent:string,headline:string,body:string,ctaText:string,ctaUrl:string)=>{
 const logo=p.logo_url?'<img src="'+esc(p.logo_url)+'" alt="'+esc(p.profile_name)+'" style="height:48px;width:48px;border-radius:14px;object-fit:cover;display:block">':"";
 const hero=header?'<img src="'+esc(header)+'" alt="" style="display:block;width:100%;height:260px;object-fit:cover;border-radius:18px;margin:0 0 28px">':"";
 const cta=ctaText&&ctaUrl?'<p style="margin:28px 0 0"><a href="'+esc(ctaUrl)+'" style="display:inline-block;background:'+esc(accent)+';color:#111;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:800;font-size:13px">'+esc(ctaText)+' ↗</a></p>':"";
 return '<!doctype html><html><body style="margin:0;background:#f2f0ec;font-family:Arial,Helvetica,sans-serif;color:#171717"><div style="max-width:680px;margin:30px auto;padding:0 14px"><div style="background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 12px 40px rgba(0,0,0,.08)"><div style="padding:24px 26px;border-bottom:1px solid #eee;display:flex;align-items:center;gap:14px">'+logo+'<div><div style="font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:'+esc(accent)+'">'+esc(p.profile_name)+'</div><div style="font-size:12px;color:#777;margin-top:3px">'+esc(p.school_name)+'</div></div></div><div style="padding:28px">'+hero+'<div style="font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:'+esc(accent)+'">NEWSLETTER</div><h1 style="font-family:Georgia,serif;font-size:42px;line-height:.98;letter-spacing:-.04em;margin:10px 0 14px">'+esc(headline||subject)+'</h1><p style="font-size:14px;line-height:1.7;color:#555;white-space:pre-wrap">'+esc(body)+'</p>'+cta+'</div><div style="padding:18px 28px;border-top:1px solid #eee;font-size:11px;line-height:1.6;color:#888">Published by '+esc(p.profile_name)+'. You are receiving this because you subscribed to this publication.</div></div></div></body></html>';
};

export default function AmbassadorNewsletter({publication}:{publication:Publication}){
 const hero=publication.hero||{};
 const [subject,setSubject]=useState("The latest from "+publication.profile_name);
 const [previewText,setPreviewText]=useState("A fresh update from your community.");
 const [headline,setHeadline]=useState("What’s happening in our community.");
 const [body,setBody]=useState("Share your latest stories, achievements, events and ideas with your readers.");
 const [header,setHeader]=useState(hero.header_image||"");
 const [accent,setAccent]=useState(hero.accent_color||"#ff6a1f");
 const [ctaText,setCtaText]=useState("Visit our publication");
 const [ctaUrl,setCtaUrl]=useState("");
 const [campaigns,setCampaigns]=useState<Campaign[]>([]);
 const [count,setCount]=useState(0);
 const [preview,setPreview]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");

 const html=useMemo(()=>buildEmail(publication,subject,previewText,header,accent,headline,body,ctaText,ctaUrl),[publication,subject,previewText,header,accent,headline,body,ctaText,ctaUrl]);

 const load=async()=>{
   const [{count:c},{data}] = await Promise.all([
     supabase.from("bitbuzz_newsletter_subscribers").select("id",{count:"exact",head:true}).eq("publication_id",publication.id).is("unsubscribed_at",null),
     supabase.from("bitbuzz_newsletter_campaigns").select("id,subject,preview_text,body_html,status,created_at,sent_at").eq("publication_id",publication.id).order("created_at",{ascending:false}).limit(10)
   ]);
   setCount(c||0);setCampaigns((data||[]) as Campaign[]);
 };
 useEffect(()=>{void load()},[publication.id]);

 const save=async(send=false)=>{
   if(!subject.trim()||!headline.trim()||!body.trim()){setMessage("Subject, headline and content are required.");return;}
   if(send&&!count){setMessage("There are no active subscribers yet.");return;}
   setBusy(true);setMessage("");
   try{
     const {data:{session}}=await supabase.auth.getSession();
     if(!session?.user?.id) throw new Error("Please sign in again.");
     const {data:campaign,error}=await supabase.from("bitbuzz_newsletter_campaigns").insert({
       publication_id:publication.id,subject:subject.trim(),preview_text:previewText.trim()||null,body_html:html,created_by:session.user.id,status:"draft"
     }).select("id").single();
     if(error||!campaign) throw error||new Error("Could not save campaign.");
     if(send){
       const {data,error:fnError}=await supabase.functions.invoke("bitbuzz-send-newsletter",{body:{campaign_id:campaign.id}});
       if(fnError)throw fnError;if(data?.error)throw new Error(data.error);
       setMessage("Newsletter sent to "+(data?.sent||0)+" subscribers"+(data?.failed?"; "+data.failed+" failed.":".")); 
     } else setMessage("Newsletter draft saved.");
     await load();
   }catch(e){setMessage(e instanceof Error?e.message:"Newsletter action failed.");}
   finally{setBusy(false);}
 };

 const onSubmit=(e:FormEvent)=>{e.preventDefault();void save(false)};

 return <div className="space-y-7">
   <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
     <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ff6a1f]">Audience studio</p><h2 className="mt-2 font-serif text-4xl font-black tracking-[-.05em]">Your newsletter.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/35">Design every edition around your publication identity. Header image, accent, headline, CTA and content are yours.</p></div>
     <div className="rounded-2xl border border-white/10 bg-white/[.03] px-5 py-4"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Active readers</p><p className="mt-1 font-serif text-3xl font-black">{count.toLocaleString("en-IN")}</p></div>
   </div>
   {message&&<div className="rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs text-white/60">{message}</div>}
   <form onSubmit={onSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
     <div className="rounded-[28px] border border-white/10 bg-[#090909] p-6 sm:p-7">
       <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/25">Compose</p><h3 className="mt-2 font-serif text-2xl font-black">Build an edition.</h3></div><button type="button" onClick={()=>setPreview(v=>!v)} className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold text-white/55">{preview?"Editor":"Preview"}</button></div>
       {!preview?<div className="mt-7 space-y-4">
         <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Subject</span><input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm outline-none focus:border-[#ff6a1f]/40"/></label>
         <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Preview text</span><input value={previewText} onChange={e=>setPreviewText(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm outline-none"/></label>
         <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Edition headline</span><input value={headline} onChange={e=>setHeadline(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm outline-none"/></label>
         <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Content</span><textarea value={body} onChange={e=>setBody(e.target.value)} className="min-h-48 w-full resize-y rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm leading-6 outline-none"/></label>
         <div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">CTA text</span><input value={ctaText} onChange={e=>setCtaText(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm outline-none"/></label><label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">CTA URL</span><input value={ctaUrl} onChange={e=>setCtaUrl(e.target.value)} placeholder="https://..." className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm outline-none"/></label></div>
         <div className="flex flex-wrap gap-2 pt-2"><button disabled={busy} className="rounded-full bg-white px-6 py-3 text-xs font-bold text-black">{busy?"Saving…":"Save draft"}</button><button type="button" disabled={busy} onClick={()=>void save(true)} className="rounded-full bg-[#ff6a1f] px-6 py-3 text-xs font-black text-black disabled:opacity-50">Send to {count} readers</button></div>
       </div>:<div className="mt-7 overflow-hidden rounded-2xl bg-[#f2f0ec]"><iframe title="Newsletter preview" sandbox="" srcDoc={html} className="h-[720px] w-full"/></div>}
     </div>
     <aside className="space-y-5">
       <div className="rounded-[28px] border border-white/10 bg-[#090909] p-6">
         <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/25">Visual identity</p>
         <div className="mt-5 space-y-4">
           <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Header photo URL</span><input value={header} onChange={e=>setHeader(e.target.value)} placeholder="https://..." className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs outline-none"/></label>
           <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Accent color</span><div className="flex gap-2"><input type="color" value={accent} onChange={e=>setAccent(e.target.value)} className="h-11 w-14 rounded-xl border border-white/10 bg-transparent"/><input value={accent} onChange={e=>setAccent(e.target.value)} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs uppercase outline-none"/></div></label>
         </div>
         <p className="mt-5 text-[10px] leading-5 text-white/25">Your logo and publication name are pulled automatically from your profile.</p>
       </div>
       <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/[.06] to-transparent p-6">
         <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/25">Delivery</p>
         <p className="mt-3 text-sm leading-6 text-white/40">Every edition is sent only to active subscribers of this publication. Unsubscribe remains available in the delivery footer.</p>
       </div>
     </aside>
   </form>
   <section className="rounded-[28px] border border-white/10 bg-[#090909] p-6">
     <div className="flex items-end justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/25">Archive</p><h3 className="mt-2 font-serif text-2xl font-black">Recent editions.</h3></div><span className="text-[9px] text-white/20">Last 10</span></div>
     <div className="mt-5 grid gap-2">{campaigns.map(c=><div key={c.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold">{c.subject}</p><p className="mt-1 text-[9px] uppercase tracking-[.13em] text-white/25">{new Date(c.created_at).toLocaleString("en-IN")} · {c.status}</p></div>{c.sent_at&&<span className="text-[9px] text-emerald-300/70">Sent {new Date(c.sent_at).toLocaleString("en-IN")}</span>}</div>)}{!campaigns.length&&<p className="py-8 text-center text-xs text-white/25">No editions yet.</p>}</div>
   </section>
 </div>;
}
