import { FormEvent, useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

type Campaign={id:string;subject:string;preview_text:string|null;body_html:string;status:string;created_at:string;sent_at:string|null};
type Publication={id:string;profile_name:string;school_name:string;logo_url:string|null;contact_email:string|null;hero:any};
type Article={id:string;slug:string;title:string;standfirst:string|null;cover_image_url:string|null;published_at:string|null;categories?:{name:string;slug:string}|null};
type Block=
  | {id:string;type:"story";articleId:string}
  | {id:string;type:"text";text:string}
  | {id:string;type:"image";url:string;alt:string}
  | {id:string;type:"divider"}
  | {id:string;type:"cta";text:string;url:string};

const esc=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const safeUrl=(s:string)=>/^https?:\/\//i.test(s.trim())?s.trim():"";
const contrastText=(hex:string)=>{
 const h=hex.replace("#",""); if(!/^[0-9a-f]{6}$/i.test(h)) return "#111111";
 const rgb=[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));
 return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]>.52?"#111111":"#ffffff";
};
const uid=()=>Math.random().toString(36).slice(2,10);

const buildEmail=(p:Publication,subject:string,preview:string,header:string,accent:string,headline:string,blocks:Block[])=>{
 const accentText=contrastText(accent);
 const logo=p.logo_url?'<img src="'+esc(p.logo_url)+'" width="48" height="48" alt="'+esc(p.profile_name)+'" style="display:block;width:48px;height:48px;border-radius:12px;object-fit:cover">':"";
 const hero=header?'<img src="'+esc(header)+'" alt="" width="624" style="display:block;width:100%;max-width:624px;height:auto;border-radius:16px;margin:0 0 28px">':"";
 const content=blocks.map(b=>{
   if(b.type==="story") return "";
   if(b.type==="text") return '<p style="margin:0 0 22px;font-size:15px;line-height:1.75;color:#4b4b4b">'+esc(b.text).replace(/\n/g,"<br>")+"</p>";
   if(b.type==="image"){const u=safeUrl(b.url);return u?'<img src="'+esc(u)+'" alt="'+esc(b.alt)+'" width="624" style="display:block;width:100%;height:auto;border-radius:16px;margin:4px 0 26px">':"";}
   if(b.type==="divider") return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 26px"><tr><td style="border-top:1px solid #e8e8e8;font-size:0;line-height:0">&nbsp;</td></tr></table>';
   const u=safeUrl(b.url);return u?'<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 26px"><tr><td bgcolor="'+esc(accent)+'" style="border-radius:999px"><a href="'+esc(u)+'" style="display:inline-block;padding:13px 20px;color:'+accentText+';text-decoration:none;font-weight:800;font-size:13px">'+esc(b.text)+' ↗</a></td></tr></table>':"";
 }).join("");
 const storyIds=blocks.filter((b):b is Extract<Block,{type:"story"}>=>b.type==="story").map(b=>b.articleId);
 const stories=(p as any).__newsletterArticles as Article[]|undefined;
 const storyContent=storyIds.map(id=>stories?.find(a=>a.id===id)).filter(Boolean).map(a=>{
   const u=safeUrl(window.location.origin+"/blog/"+a!.slug);
   return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;border:1px solid #e9e9e9;border-radius:16px"><tr><td style="padding:0">'+(a!.cover_image_url?'<img src="'+esc(a!.cover_image_url)+'" alt="" width="624" style="display:block;width:100%;height:auto;border-radius:16px 16px 0 0">':"")+'<div style="padding:20px"><div style="font-size:10px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:'+esc(accent)+'">'+esc(a!.categories?.name||"BitBuzz")+'</div><div style="font-family:Georgia,serif;font-size:27px;line-height:1.05;font-weight:700;margin:8px 0 9px;color:#171717">'+esc(a!.title)+'</div>'+(a!.standfirst?'<div style="font-size:13px;line-height:1.65;color:#666;margin-bottom:14px">'+esc(a!.standfirst)+'</div>':"")+'<a href="'+esc(u)+'" style="font-size:12px;font-weight:800;color:#171717;text-decoration:underline">Read story ↗</a></div></td></tr></table>';
 }).join("");
 const preheader=esc(preview||"Latest from "+p.profile_name);
 return '<!doctype html><html><head><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"></head><body style="margin:0;padding:0;background:#f2f0ec;font-family:Arial,Helvetica,sans-serif;color:#171717"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">'+preheader+'&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f2f0ec"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden"><tr><td style="padding:22px 26px;border-bottom:1px solid #eeeeee"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td valign="middle">'+logo+'</td><td style="padding-left:13px"><div style="font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;color:'+esc(accent)+'">'+esc(p.profile_name)+'</div><div style="font-size:12px;color:#777;margin-top:3px">'+esc(p.school_name)+'</div></td></tr></table></td></tr><tr><td style="padding:28px">'+hero+'<div style="font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase;color:'+esc(accent)+'">NEWSLETTER</div><h1 style="font-family:Georgia,serif;font-size:42px;line-height:1;letter-spacing:-.04em;margin:10px 0 26px;color:#171717">'+esc(headline||subject)+'</h1>'+storyContent+content+'</td></tr><tr><td style="padding:18px 28px;border-top:1px solid #eeeeee;font-size:11px;line-height:1.6;color:#888">Published by '+esc(p.profile_name)+'. You are receiving this because you subscribed to this publication.</td></tr></table></td></tr></table></body></html>';
};

const defaultBlocks=():Block[]=>[
 {id:uid(),type:"text",text:"Share your latest stories, achievements, events and ideas with your readers."}
];

export default function AmbassadorNewsletter({publication}:{publication:Publication}){
 const hero=publication.hero||{};
 const [subject,setSubject]=useState("The latest from "+publication.profile_name);
 const [previewText,setPreviewText]=useState("A fresh update from your community.");
 const [headline,setHeadline]=useState("What’s happening in our community.");
 const [blocks,setBlocks]=useState<Block[]>(defaultBlocks);
 const [header,setHeader]=useState(hero.header_image||"");
 const [accent,setAccent]=useState(hero.accent_color||"#ff6a1f");
 const [articles,setArticles]=useState<Article[]>([]);
 const [campaigns,setCampaigns]=useState<Campaign[]>([]);
 const [count,setCount]=useState(0);
 const [preview,setPreview]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");

 const load=async()=>{
   const [{count:c},{data:campaignData},{data:articleData}] = await Promise.all([
     supabase.from("bitbuzz_newsletter_subscribers").select("id",{count:"exact",head:true}).eq("publication_id",publication.id).is("unsubscribed_at",null),
     supabase.from("bitbuzz_newsletter_campaigns").select("id,subject,preview_text,body_html,status,created_at,sent_at").eq("publication_id",publication.id).order("created_at",{ascending:false}).limit(10),
     supabase.from("articles").select("id,slug,title,standfirst,cover_image_url,published_at,categories(name,slug)").eq("status","published").order("published_at",{ascending:false}).limit(30)
   ]);
   setCount(c||0);setCampaigns((campaignData||[]) as Campaign[]);setArticles((articleData||[]).map((a:any)=>({...a,categories:Array.isArray(a.categories)?(a.categories[0]||null):a.categories})) as Article[]);
 };
 useEffect(()=>{void load()},[publication.id]);

 const html=useMemo(()=>{
   const pub={...publication,__newsletterArticles:articles} as Publication;
   return buildEmail(pub,subject,previewText,header,accent,headline,blocks);
 },[publication,articles,subject,previewText,header,accent,headline,blocks]);

 const addBlock=(type:Block["type"])=>{
   if(type==="text")setBlocks(b=>[...b,{id:uid(),type,text:"Write your paragraph here."}]);
   if(type==="image")setBlocks(b=>[...b,{id:uid(),type,url:"",alt:""}]);
   if(type==="divider")setBlocks(b=>[...b,{id:uid(),type}]);
   if(type==="cta")setBlocks(b=>[...b,{id:uid(),type,text:"Read more",url:""}]);
 };
 const addStory=(id:string)=>{if(id)setBlocks(b=>[...b,{id:uid(),type:"story",articleId:id}]);};
 const patch=(id:string,patch:Partial<Block>)=>setBlocks(b=>b.map(x=>x.id===id?({...x,...patch} as Block):x));
 const remove=(id:string)=>setBlocks(b=>b.filter(x=>x.id!==id));
 const move=(id:string,dir:-1|1)=>setBlocks(b=>{const i=b.findIndex(x=>x.id===id),j=i+dir;if(i<0||j<0||j>=b.length)return b;const n=[...b];[n[i],n[j]]=[n[j],n[i]];return n;});

 const save=async(send=false)=>{
   if(!subject.trim()||!headline.trim()||!blocks.length){setMessage("Add a subject, headline and at least one block.");return;}
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
     <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ff6a1f]">Audience studio</p><h2 className="mt-2 font-serif text-4xl font-black tracking-[-.05em]">Your newsletter.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/35">Build an edition from reusable story, text, image, divider and CTA blocks. No raw HTML.</p></div>
     <div className="rounded-2xl border border-white/10 bg-white/[.03] px-5 py-4"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Active readers</p><p className="mt-1 font-serif text-3xl font-black">{count.toLocaleString("en-IN")}</p></div>
   </div>
   {message&&<div className="rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs text-white/60">{message}</div>}
   <form onSubmit={onSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
     <div className="rounded-[28px] border border-white/10 bg-[#090909] p-6 sm:p-7">
       <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/25">Compose</p><h3 className="mt-2 font-serif text-2xl font-black">Build an edition.</h3></div><button type="button" onClick={()=>setPreview(v=>!v)} className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold text-white/55">{preview?"Editor":"Preview"}</button></div>
       {!preview?<div className="mt-7 space-y-5">
         <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Subject</span><input value={subject} onChange={e=>setSubject(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm outline-none focus:border-[#ff6a1f]/40"/></label>
         <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Inbox preview</span><input value={previewText} onChange={e=>setPreviewText(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm outline-none"/><span className="mt-1 block text-[9px] text-white/20">Rendered as a hidden email preheader.</span></label>
         <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Edition headline</span><input value={headline} onChange={e=>setHeadline(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm outline-none"/></label>
         <div className="flex flex-wrap gap-2">
           <select onChange={e=>{addStory(e.target.value);e.currentTarget.value=""}} defaultValue="" className="rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-[10px] font-bold text-white/60"><option value="" disabled>+ Pull published story</option>{articles.map(a=><option key={a.id} value={a.id}>{a.title}</option>)}</select>
           <button type="button" onClick={()=>addBlock("text")} className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold text-white/60">+ Text</button>
           <button type="button" onClick={()=>addBlock("image")} className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold text-white/60">+ Image</button>
           <button type="button" onClick={()=>addBlock("divider")} className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold text-white/60">+ Divider</button>
           <button type="button" onClick={()=>addBlock("cta")} className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-bold text-white/60">+ CTA</button>
         </div>
         <div className="space-y-3">
           {blocks.map((b,i)=><div key={b.id} className="rounded-2xl border border-white/10 bg-white/[.025] p-4">
             <div className="mb-3 flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-[.15em] text-[#ff6a1f]">{b.type} block</span><div className="flex gap-1"><button type="button" onClick={()=>move(b.id,-1)} className="rounded-lg px-2 py-1 text-white/30 hover:bg-white/5">↑</button><button type="button" onClick={()=>move(b.id,1)} className="rounded-lg px-2 py-1 text-white/30 hover:bg-white/5">↓</button><button type="button" onClick={()=>remove(b.id)} className="rounded-lg px-2 py-1 text-red-300/50 hover:bg-red-400/10">×</button></div></div>
             {b.type==="story"&&<div><p className="text-sm font-semibold">{articles.find(a=>a.id===b.articleId)?.title||"Published story"}</p><p className="mt-1 text-[10px] text-white/25">Pulled from the newsroom. Changes to the article will appear in a newly generated edition.</p></div>}
             {b.type==="text"&&<textarea value={b.text} onChange={e=>patch(b.id,{text:e.target.value})} className="min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 outline-none"/>}
             {b.type==="image"&&<div className="grid gap-3 sm:grid-cols-2"><input value={b.url} onChange={e=>patch(b.id,{url:e.target.value})} placeholder="https://image..." className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs outline-none"/><input value={b.alt} onChange={e=>patch(b.id,{alt:e.target.value})} placeholder="Image alt text" className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs outline-none"/></div>}
             {b.type==="cta"&&<div className="grid gap-3 sm:grid-cols-2"><input value={b.text} onChange={e=>patch(b.id,{text:e.target.value})} placeholder="Button text" className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs outline-none"/><input value={b.url} onChange={e=>patch(b.id,{url:e.target.value})} placeholder="https://..." className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-xs outline-none"/></div>}
           </div>)}
         </div>
         <div className="flex flex-wrap gap-2 pt-2"><button disabled={busy} className="rounded-full bg-white px-6 py-3 text-xs font-bold text-black">{busy?"Saving…":"Save draft"}</button><button type="button" disabled={busy} onClick={()=>void save(true)} className="rounded-full bg-[#ff6a1f] px-6 py-3 text-xs font-black text-black disabled:opacity-50">Send to {count} readers</button></div>
       </div>:<div className="mt-7 overflow-hidden rounded-2xl bg-[#f2f0ec]"><iframe title="Newsletter preview" sandbox="" srcDoc={html} className="h-[720px] w-full"/></div>}
     </div>
     <aside className="space-y-5">
       <div className="rounded-[28px] border border-white/10 bg-[#090909] p-6">
         <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/25">Visual identity</p>
         <div className="mt-5 space-y-4">
           <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Header photo URL</span><input value={header} onChange={e=>setHeader(e.target.value)} placeholder="https://..." className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs outline-none"/></label>
           <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Accent color</span><div className="flex gap-2"><input type="color" value={accent} onChange={e=>setAccent(e.target.value)} className="h-11 w-14 rounded-xl border border-white/10 bg-transparent"/><input value={accent} onChange={e=>setAccent(e.target.value)} onBlur={()=>{if(!/^#[0-9a-f]{6}$/i.test(accent))setAccent("#ff6a1f")}} className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs uppercase outline-none"/></div><span className="mt-1 block text-[9px] text-white/20">Button text automatically switches for contrast.</span></label>
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
