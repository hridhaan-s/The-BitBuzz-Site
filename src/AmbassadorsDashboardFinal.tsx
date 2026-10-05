import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import UniversalNavbar from "./UniversalNavbar";
import { supabase } from "./lib/supabase";
import AmbassadorNewsletter from "./AmbassadorNewsletter";
import ChanakyaAssist from "./ChanakyaAssist";

type Publication={id:string;slug:string;profile_name:string;school_name:string;description:string|null;logo_url:string|null;hero:any;organization_type:string;location:string|null;tags:string[];website_url:string|null;instagram_url:string|null;linkedin_url:string|null;contact_email:string|null};
type Article={id:string;slug:string;headline:string;description:string|null;body:string;author_name:string|null;category:string|null;status:string;created_at:string;published_at:string|null};
type Submission={id:string;author_name:string;headline:string;body:string;section:string|null;status:string;created_at:string;media?:{url:string;type?:string;name?:string;mime_type?:string;size?:number}[]};
type Member={id:string;name:string;email:string|null;role:string;photo_url:string|null;is_active:boolean;display_order?:number;user_id?:string|null;bio?:string|null;instagram_url?:string|null;linkedin_url?:string|null;website_url?:string|null;second_pass_enabled?:boolean;second_pass_status?:string;second_pass_data?:any};
const blank={headline:"",description:"",body:"",category:"News",cover_url:""};
const slugify=(s:string)=>s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"");
const date=(v:string)=>new Intl.DateTimeFormat("en-IN",{dateStyle:"medium"}).format(new Date(v));
function Field({label,value,onChange,multiline=false}:{label:string;value:string;onChange:(v:string)=>void;multiline?:boolean}){return <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/35">{label}</span>{multiline?<textarea value={value} onChange={e=>onChange(e.target.value)} className="min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm outline-none focus:border-[#ff6a1f]/40"/>:<input value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm outline-none focus:border-[#ff6a1f]/40"/>}</label>}
function Stat({value,label}:{value:number;label:string}){return <div className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="font-serif text-3xl font-black">{value}</p><p className="mt-2 text-[9px] font-bold uppercase tracking-[.17em] text-white/25">{label}</p></div>}

export default function AmbassadorsDashboardFinal(){
 const[session,setSession]=useState<any>(null),[publications,setPublications]=useState<Publication[]>([]),[publication,setPublication]=useState<Publication|null>(null),[articles,setArticles]=useState<Article[]>([]),[submissions,setSubmissions]=useState<Submission[]>([]),[members,setMembers]=useState<Member[]>([]),[tab,setTab]=useState("overview"),[editing,setEditing]=useState(blank),[creating,setCreating]=useState(false),[message,setMessage]=useState(""),[profileForm,setProfileForm]=useState<any>(null),[busy,setBusy]=useState(false),[memberOpen,setMemberOpen]=useState(false),[editingMember,setEditingMember]=useState<Member|null>(null),[memberForm,setMemberForm]=useState({name:"",email:"",role:"Ambassador",photo:"",bio:"",instagram:"",linkedin:"",website:"",active:true}),[editingSubmissionId,setEditingSubmissionId]=useState<string|null>(null),[submissionEdit,setSubmissionEdit]=useState({headline:"",body:"",section:"News",media:[] as any[]}),[secondPassForm,setSecondPassForm]=useState({bio:"",photo_url:"",instagram_url:"",linkedin_url:"",website_url:""}),[storyQuery,setStoryQuery]=useState(""),[storyCategory,setStoryCategory]=useState("All"),[storyYear,setStoryYear]=useState("All");

 const load=useCallback(async(id:string)=>{
   const[{data:a,error:ae},{data:s,error:se},{data:m,error:me}]=await Promise.all([
     supabase.from("bitbuzz_articles").select("id,slug,headline,description,body,author_name,category,status,created_at,published_at").eq("publication_id",id).order("created_at",{ascending:false}),
     supabase.rpc("bitbuzz_list_publication_submissions",{p_publication_id:id}),
     supabase.from("bitbuzz_publication_members").select("id,user_id,name,email,role,photo_url,is_active,display_order,bio,instagram_url,linkedin_url,website_url,second_pass_enabled,second_pass_status,second_pass_data").eq("publication_id",id).order("created_at")
   ]);
   if(ae||se||me){setMessage(ae?.message||se?.message||me?.message||"Could not load publication data.");return false;}
   setArticles((a||[]) as Article[]);setSubmissions((s||[]) as Submission[]);setMembers((m||[]) as Member[]);return true;
 },[]);

 const refreshPublication=useCallback(async(id:string)=>{
   const{data,error}=await supabase.rpc("bitbuzz_my_publications");
   if(error){setMessage(error.message);return;}
   const p=(data||[]).find((x:any)=>x.id===id) as Publication|undefined;
   if(p){setPublication(p);setProfileForm({...p,tags:(p.tags||[]).join(", "),hero_header_image:p.hero?.header_image||"",hero_headline:p.hero?.headline||"",hero_accent_color:p.hero?.accent_color||"#ff6a1f",hero_overlay:p.hero?.overlay||"dark"});}
 },[]);

 useEffect(()=>{
   let live=true;
   const boot=async()=>{
     const{data}=await supabase.auth.getSession();
     if(!live)return;
     setSession(data.session);
     if(!data.session)return;
     const{data:pubs,error}=await supabase.rpc("bitbuzz_my_publications");
     if(error){setMessage(error.message);return;}
     const available=(pubs||[]) as Publication[];
     setPublications(available);
     const p=available[0];
     if(!p)return;
     await supabase.rpc("bitbuzz_claim_publication_membership",{p_publication_id:p.id});
     if(!live)return;
     setPublication(p);setProfileForm({...p,tags:(p.tags||[]).join(", "),hero_header_image:p.hero?.header_image||"",hero_headline:p.hero?.headline||"",hero_accent_color:p.hero?.accent_color||"#ff6a1f",hero_overlay:p.hero?.overlay||"dark"});await load(p.id);
   };
   boot();
   const{data:l}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
   return()=>{live=false;l.subscription.unsubscribe()};
 },[load]);

 useEffect(()=>{
   if(!publication?.id)return;
   const id=publication.id;
   const channel=supabase.channel(`ambassador-dashboard-${id}`)
     .on("postgres_changes",{event:"*",schema:"public",table:"bitbuzz_publications",filter:`id=eq.${id}`},async()=>{await refreshPublication(id);await load(id)})
     .on("postgres_changes",{event:"*",schema:"public",table:"bitbuzz_submissions",filter:`publication_id=eq.${id}`},()=>load(id))
     .on("postgres_changes",{event:"*",schema:"public",table:"bitbuzz_articles",filter:`publication_id=eq.${id}`},()=>load(id))
     .on("postgres_changes",{event:"*",schema:"public",table:"bitbuzz_publication_members",filter:`publication_id=eq.${id}`},()=>load(id))
     .subscribe();
   return()=>{supabase.removeChannel(channel)};
 },[publication?.id,load,refreshPublication]);

 const stats=useMemo(()=>({published:articles.filter(a=>a.status==="published").length,drafts:articles.filter(a=>a.status==="draft").length,pending:submissions.filter(s=>s.status==="pending").length,team:members.filter(m=>m.is_active).length}),[articles,submissions,members]);

 const uploadAsset=async(file:File,kind:string)=>{if(!publication)return null;if(!file.type.startsWith("image/")){setMessage("Please choose an image file.");return null;}if(file.size>15*1024*1024){setMessage("Images must be 15 MB or smaller.");return null;}setBusy(true);const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");const path=`${publication.id}/${kind}-${crypto.randomUUID()}-${safe}`;const{error}=await supabase.storage.from("ambassador-submissions").upload(path,file,{contentType:file.type,upsert:false});if(error){setBusy(false);setMessage(error.message);return null;}const{data}=supabase.storage.from("ambassador-submissions").getPublicUrl(path);setBusy(false);return data.publicUrl;};
 const uploadProfileImage=async(file:File,field:"logo_url"|"hero_header_image",kind:string)=>{const url=await uploadAsset(file,kind);if(url)setProfileForm((x:any)=>({...x,[field]:url}));};
 const saveProfile=async()=>{
   if(!publication||!profileForm)return;
   const profile_name=profileForm.profile_name.trim(),school_name=profileForm.school_name.trim();
   if(profile_name.length<2||school_name.length<2){setMessage("Publication name and school / organization are required.");return;}
   setBusy(true);setMessage("");
   const{data,error}=await supabase.rpc("bitbuzz_update_publication_profile",{
     p_publication_id:publication.id,p_profile_name:profile_name,p_school_name:school_name,
     p_description:profileForm.description?.trim()||null,p_logo_url:profileForm.logo_url?.trim()||null,
     p_website_url:profileForm.website_url?.trim()||null,p_instagram_url:profileForm.instagram_url?.trim()||null,
     p_linkedin_url:profileForm.linkedin_url?.trim()||null,p_contact_email:profileForm.contact_email?.trim().toLowerCase()||null,
     p_organization_type:profileForm.organization_type?.trim()||"Organization",p_location:profileForm.location?.trim()||null,
     p_tags:(profileForm.tags||"").split(",").map((x:string)=>x.trim()).filter(Boolean).slice(0,10),
     p_hero:{header_image:profileForm.hero_header_image?.trim()||"",headline:profileForm.hero_headline?.trim()||"",accent_color:profileForm.hero_accent_color||"#ff6a1f",overlay:profileForm.hero_overlay||"dark"}
   });
   setBusy(false);
   if(error){setMessage(`Could not save profile: ${error.message}`);return;}
   const saved=(data&&((Array.isArray(data)?data[0]:data))) as Publication|undefined;
   if(saved){setPublication(saved);setProfileForm({...saved,tags:(saved.tags||[]).join(", ")});}
   else await refreshPublication(publication.id);
   setMessage("Profile saved successfully.");
 };

 const saveDraft=async()=>{if(!publication||editing.headline.trim().length<3||editing.body.trim().length<20){setMessage("Add a headline and at least 20 characters to the story.");return;}setBusy(true);const{error}=await supabase.from("bitbuzz_articles").insert({publication_id:publication.id,slug:`${slugify(editing.headline)}-${crypto.randomUUID().slice(0,8)}`,headline:editing.headline.trim(),description:editing.description.trim()||null,body:editing.body.trim(),author_name:session.user.email?.split("@")[0]||"Ambassador",category:editing.category.trim()||"News",reading_time:Math.max(1,Math.ceil(editing.body.trim().split(/\s+/).length/220)),cover_url:editing.cover_url.trim()||null,status:"draft",created_by:session.user.id});setBusy(false);if(error){setMessage(error.message);return;}setMessage("Draft saved.");setEditing(blank);setCreating(false);load(publication.id)};
 const submitStory=async()=>{if(!publication||editing.headline.trim().length<3||editing.body.trim().length<20){setMessage("Add a headline and at least 20 characters to the story.");return;}setBusy(true);const{error}=await supabase.from("bitbuzz_submissions").insert({publication_id:publication.id,author_id:session.user.id,author_name:session.user.email?.split("@")[0]||"Ambassador",author_email:session.user.email,headline:editing.headline.trim(),body:editing.body.trim(),section:editing.category.trim()||"News",media:editing.cover_url.trim()?[{url:editing.cover_url.trim(),type:"image"}]:[],status:"pending"});setBusy(false);if(error){setMessage(error.message);return;}setMessage("Story submitted for review.");setEditing(blank);setCreating(false);load(publication.id)};
 const publish=async(a:Article)=>{const{error}=await supabase.from("bitbuzz_articles").update({status:"published",published_at:a.published_at||new Date().toISOString()}).eq("id",a.id);setMessage(error?error.message:"Story published.");if(!error&&publication)load(publication.id)};
 const deleteArticle=async(a:Article)=>{if(!window.confirm(`Delete “${a.headline}” permanently? This cannot be undone.`))return;setBusy(true);const{error}=await supabase.from("bitbuzz_articles").delete().eq("id",a.id).eq("publication_id",publication?.id||"");setBusy(false);if(error){setMessage(error.message);return;}setArticles(current=>current.filter(item=>item.id!==a.id));setMessage("Story deleted.");if(publication)await load(publication.id);};
 const review=async(s:Submission,status:"approved"|"rejected")=>{setBusy(true);const{data,error}=await supabase.rpc("bitbuzz_review_publication_submission",{p_submission_id:s.id,p_status:status,p_review_note:null});setBusy(false);if(error){setMessage(error.message);return;}setSubmissions(current=>current.filter(item=>item.id!==s.id));if(publication)await load(publication.id);if(status==="approved"){setTab("stories");setMessage(data?"Approved — the submission has moved to Second Pass.":"Approved — the submission has moved to Second Pass.");}else{setMessage("Submission rejected and removed from the review queue.");}};
 const beginSubmissionEdit=(s:Submission)=>{setEditingSubmissionId(s.id);setSubmissionEdit({headline:s.headline,body:s.body,section:s.section||"News",media:Array.isArray(s.media)?s.media:[]});};
 const saveSubmissionEdit=async()=>{if(!editingSubmissionId)return;if(submissionEdit.headline.trim().length<3||submissionEdit.body.trim().length<20){setMessage("Add a headline and at least 20 characters.");return;}setBusy(true);const{error}=await supabase.rpc("bitbuzz_admin_edit_submission",{p_submission_id:editingSubmissionId,p_headline:submissionEdit.headline.trim(),p_body:submissionEdit.body.trim(),p_section:submissionEdit.section.trim()||"News",p_media:submissionEdit.media});setBusy(false);if(error){setMessage(error.message);return;}setMessage("Submission updated.");setEditingSubmissionId(null);if(publication)await load(publication.id);};
 const addSubmissionImageUrl=()=>{const url=window.prompt("Image URL");if(!url?.trim())return;setSubmissionEdit(x=>({...x,media:[...x.media,{url:url.trim(),type:"image"}]}));};
 const uploadSubmissionImage=async(file:File)=>{if(!publication||!editingSubmissionId)return;if(file.size>15*1024*1024){setMessage("Files must be 15 MB or smaller.");return;}setBusy(true);const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");const p=`${publication.id}/reviewer-${crypto.randomUUID()}-${safe}`;const{error}=await supabase.storage.from("ambassador-submissions").upload(p,file,{contentType:file.type||"image/*",upsert:false});if(error){setBusy(false);setMessage(error.message);return;}const{data}=supabase.storage.from("ambassador-submissions").getPublicUrl(p);setSubmissionEdit(x=>({...x,media:[...x.media,{url:data.publicUrl,type:"file",name:file.name,mime_type:file.type||"application/octet-stream",size:file.size}]}));setBusy(false);setMessage("Image added. Save changes to keep it.");};
 const removeSubmissionMedia=(i:number)=>setSubmissionEdit(x=>({...x,media:x.media.filter((_,n)=>n!==i)}));
 const deleteApproved=async(s:Submission)=>{if(s.status!=="approved")return;if(!window.confirm(`Delete approved submission “${s.headline}”? This cannot be undone.`))return;setBusy(true);const{error}=await supabase.rpc("bitbuzz_admin_delete_ambassador_submission",{p_submission_id:s.id});setBusy(false);if(error){setMessage(error.message);return;}setMessage("Approved submission deleted.");if(publication)await load(publication.id);};
 const openMemberEditor=(m?:Member)=>{
   if(m){
     setEditingMember(m);
     setMemberForm({name:m.name,email:m.email||"",role:m.role,photo:m.photo_url||"",bio:m.bio||"",instagram:m.instagram_url||"",linkedin:m.linkedin_url||"",website:m.website_url||"",active:m.is_active});
   }else{
     setEditingMember(null);
     setMemberForm({name:"",email:"",role:"Ambassador",photo:"",bio:"",instagram:"",linkedin:"",website:"",active:true});
   }
   setMemberOpen(true);
 };
 const saveMember=async(e:FormEvent)=>{
   e.preventDefault();
   if(!publication)return;
   const name=memberForm.name.trim(),email=memberForm.email.trim().toLowerCase(),role=memberForm.role.trim(),photo=memberForm.photo.trim(),bio=memberForm.bio.trim(),instagram=memberForm.instagram.trim(),linkedin=memberForm.linkedin.trim(),website=memberForm.website.trim();
   if(name.length<2||!email){setMessage("Name and email are required.");return;}
   if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){setMessage("Enter a valid email address.");return;}
   if(!["Admin","Editor","Ambassador"].includes(role)){setMessage("Choose Admin, Editor or Ambassador.");return;}
   setBusy(true);setMessage("");
   let error:any=null;
   if(editingMember){
     const changedEmail=email!==((editingMember.email||"").trim().toLowerCase());
     const result=await supabase.from("bitbuzz_publication_members").update({
       name,email,role,photo_url:photo||null,is_active:memberForm.active,bio:bio||null,instagram_url:instagram||null,linkedin_url:linkedin||null,website_url:website||null,
       ...(changedEmail?{user_id:null}:{}),
       updated_at:new Date().toISOString()
     }).eq("id",editingMember.id).eq("publication_id",publication.id);
     error=result.error;
   }else{
     const result=await supabase.from("bitbuzz_publication_members").insert({
       publication_id:publication.id,user_id:null,name,email,role,photo_url:photo||null,is_active:memberForm.active,bio:bio||null,instagram_url:instagram||null,linkedin_url:linkedin||null,website_url:website||null,display_order:members.length
     });
     error=result.error;
   }
   setBusy(false);
   if(error){setMessage(error.message);return;}
   setMessage(editingMember?"Ambassador updated successfully.":"Ambassador added successfully.");
   setMemberOpen(false);setEditingMember(null);
   setMemberForm({name:"",email:"",role:"Ambassador",photo:"",bio:"",instagram:"",linkedin:"",website:"",active:true});
   await load(publication.id);
 };
 const storyCategories=useMemo(()=>["All",...Array.from(new Set(articles.map(a=>a.category).filter(Boolean)))],[articles]);
 const storyYears=useMemo(()=>["All",...Array.from(new Set(articles.map(a=>new Date(a.published_at||a.created_at).getFullYear().toString()).filter(Boolean)))],[articles]);
 const filteredArticles=useMemo(()=>articles.filter(a=>{const stamp=a.published_at||a.created_at;const text=[a.headline,a.description,a.body,a.category,a.author_name].join(" ").toLowerCase();return (storyCategory==="All"||a.category===storyCategory)&&(storyYear==="All"||new Date(stamp).getFullYear().toString()===storyYear)&&(!storyQuery.trim()||text.includes(storyQuery.trim().toLowerCase()));}),[articles,storyCategory,storyYear,storyQuery]);
 const resetStoryFilters=()=>{setStoryQuery("");setStoryCategory("All");setStoryYear("All");};
 const secondPassSubmissions=useMemo(()=>submissions.filter(s=>s.status==="approved"),[submissions]);
 const openSecondPass=()=>{setEditingSubmissionId(null);setTab("second-pass");};
 const finalReview=async(s:Submission,status:"published"|"rejected")=>{
   setBusy(true);
   const{data,error}=await supabase.rpc("bitbuzz_review_publication_submission",{p_submission_id:s.id,p_status:status,p_review_note:null});
   setBusy(false);
   if(error){setMessage(error.message);return;}
   setSubmissions(current=>current.filter(item=>item.id!==s.id));
   if(publication)await load(publication.id);
   setMessage(status==="published"?(data?"Final approval complete — the story is published and live.":"Final approval complete — the story is now live."):"Submission rejected from Second Pass.");
 };
 const switchTeam=async(id:string)=>{
   const next=publications.find(p=>p.id===id);
   if(!next||next.id===publication?.id)return;
   setBusy(true);setMessage("");
   await supabase.rpc("bitbuzz_claim_publication_membership",{p_publication_id:next.id});
   setPublication(next);
   setProfileForm({...next,tags:(next.tags||[]).join(", "),hero_header_image:next.hero?.header_image||"",hero_headline:next.hero?.headline||"",hero_accent_color:next.hero?.accent_color||"#ff6a1f",hero_overlay:next.hero?.overlay||"dark"});
   setTab("overview");setCreating(false);setEditing(blank);setEditingSubmissionId(null);setMemberOpen(false);setEditingMember(null);
   const ok=await load(next.id);
   setBusy(false);
   if(!ok)setMessage("Could not switch teams.");
 };
 const toggleMember=async(m:Member)=>{if(!publication)return;setBusy(true);const{error}=await supabase.from("bitbuzz_publication_members").update({is_active:!m.is_active,updated_at:new Date().toISOString()}).eq("id",m.id).eq("publication_id",publication.id);setBusy(false);if(error){setMessage(error.message);return;}setMessage(m.is_active?"Member hidden from public team.":"Member shown on public team.");await load(publication.id);};
 const moveMember=async(m:Member,direction:-1|1)=>{if(!publication)return;const ordered=[...members].sort((a,b)=>(a.display_order??0)-(b.display_order??0));const index=ordered.findIndex(x=>x.id===m.id);const target=index+direction;if(index<0||target<0||target>=ordered.length)return;const other=ordered[target];setBusy(true);const{error}=await supabase.from("bitbuzz_publication_members").update({display_order:other.display_order??target}).eq("id",m.id).eq("publication_id",publication.id);if(!error){const second=await supabase.from("bitbuzz_publication_members").update({display_order:m.display_order??index}).eq("id",other.id).eq("publication_id",publication.id);if(second.error){setBusy(false);setMessage(second.error.message);return;}}setBusy(false);if(error){setMessage(error.message);return;}await load(publication.id);};
 const deleteMember=async(m:Member)=>{
   if(!publication)return;
   if(!window.confirm(`Delete ${m.name} from this Ambassador team?`))return;
   setBusy(true);setMessage("");
   const{error}=await supabase.from("bitbuzz_publication_members").delete().eq("id",m.id).eq("publication_id",publication.id);
   setBusy(false);
   if(error){setMessage(error.message);return;}
   setMessage("Ambassador deleted.");
   await load(publication.id);
 };

 if(!session)return <div className="min-h-screen bg-black text-white"><UniversalNavbar/><div className="mx-auto max-w-xl px-5 pb-24 pt-40 text-center"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">Ambassador workspace</p><h1 className="mt-4 font-serif text-6xl font-black">Sign in to continue.</h1><a href="/signup" className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-xs font-bold text-black">Sign in / create account</a></div></div>;
 if(!publication)return <div className="min-h-screen bg-black text-white"><UniversalNavbar/><div className="mx-auto max-w-2xl px-5 pb-24 pt-40 text-center"><p className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">Ambassador workspace</p><h1 className="mt-4 font-serif text-6xl font-black">No publication yet.</h1><p className="mt-5 text-sm leading-6 text-white/35">Your account is not connected to an approved Ambassador publication.</p><a href="/ambassadors" className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-xs font-bold text-black">Back to Ambassadors</a></div></div>;
 return <div className="min-h-screen bg-black text-white"><UniversalNavbar/><header className="border-b border-white/10 bg-[#080808]"><div className="mx-auto max-w-[1480px] px-5 pb-4 pt-16 sm:px-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold uppercase tracking-[.25em] text-[#ff6a1f]">Ambassador workspace</span>{publications.length>1&&<span className="rounded-full border border-white/10 bg-white/[.03] px-2 py-1 text-[8px] font-bold uppercase tracking-[.14em] text-white/35">{publications.length} teams</span>}</div><h1 className="mt-2 truncate font-serif text-4xl font-black tracking-[-.06em] sm:text-5xl">{publication.profile_name}</h1><p className="mt-1 text-xs text-white/30">{publication.school_name} · {publication.organization_type}</p></div><div className="flex flex-col gap-2 sm:flex-row sm:items-center"><div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.03] px-3 py-1.5"><div className="min-w-0"><p className="text-[7px] font-bold uppercase tracking-[.18em] text-white/25">Active team</p><select value={publication.id} onChange={e=>switchTeam(e.target.value)} disabled={busy} className="mt-0.5 max-w-[220px] cursor-pointer truncate bg-transparent pr-7 text-[11px] font-bold text-white outline-none disabled:opacity-50">{publications.map(p=><option key={p.id} value={p.id} className="bg-[#111] text-white">{p.profile_name} · {p.school_name}</option>)}</select></div><span className="text-white/25">⌄</span></div><a href={`/ambassadors/${publication.slug}`} className="rounded-full border border-white/10 px-3.5 py-2 text-[9px] font-bold text-white/55 hover:border-white/20 hover:text-white">View page ↗</a><button onClick={async()=>{await supabase.auth.signOut();window.location.href="/home"}} className="rounded-full border border-white/10 px-3.5 py-2 text-[9px] text-white/35 hover:text-white/60">Sign out</button></div></div></div></header><div className="mx-auto grid max-w-[1480px] lg:grid-cols-[220px_1fr]"><aside className="border-b border-white/10 p-4 lg:border-b-0 lg:border-r"><p className="px-3 pb-3 text-[9px] font-bold uppercase tracking-[.2em] text-white/25">Workspace</p>{["overview","profile","stories","submissions","newsletter","team","second-pass"].map(x=><button key={x} onClick={()=>x==="second-pass"?openSecondPass():setTab(x)} className={`mb-1 w-full rounded-xl px-3 py-2.5 text-left text-xs capitalize ${tab===x?"bg-white text-black":"text-white/45 hover:bg-white/5 hover:text-white"}`}>{x}{x==="submissions"&&stats.pending>0?<span className="float-right rounded-full bg-[#ff6a1f] px-1.5 py-0.5 text-[8px] text-black">{stats.pending}</span>:null}</button>)}</aside><main className="min-w-0 p-5 sm:p-8">{message&&<div className="mb-6 rounded-2xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs text-white/55">{message}</div>}{tab==="overview"&&<><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Stat value={stats.published} label="Published"/><Stat value={stats.drafts} label="Drafts"/><Stat value={stats.pending} label="Pending review"/><Stat value={stats.team} label="Active team"/></div><div className="mt-8 grid gap-5 lg:grid-cols-2"><div className="rounded-[28px] border border-white/10 bg-[#090909] p-7"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ff6a1f]">Quick start</p><h2 className="mt-3 font-serif text-3xl font-black">Build the publication.</h2><div className="mt-7 grid gap-2"><button onClick={()=>{setTab("stories");setCreating(true);setEditing(blank)}} className="rounded-2xl bg-white px-4 py-3 text-left text-xs font-bold text-black">Write a story</button><button onClick={()=>setTab("profile")} className="rounded-2xl border border-white/10 px-4 py-3 text-left text-xs font-bold text-white/65">Edit profile</button><button onClick={()=>setTab("submissions")} className="rounded-2xl border border-white/10 px-4 py-3 text-left text-xs font-bold text-white/65">Review submissions</button></div></div><div className="rounded-[28px] border border-white/10 bg-[#090909] p-7"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ff6a1f]">Public page</p><h2 className="mt-3 font-serif text-3xl font-black">{publication.profile_name}</h2><p className="mt-3 text-sm leading-6 text-white/35">{publication.description||"Add a description to tell readers what your community is building."}</p><a href={`/ambassadors/${publication.slug}`} className="mt-7 inline-block text-xs font-bold text-white/55">Open public publication ↗</a></div></div></>}{tab==="profile"&&profileForm&&<div className="max-w-4xl space-y-5"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ff6a1f]">Publication settings</p><h2 className="font-serif text-4xl font-black">Edit profile.</h2><div className="grid gap-5 sm:grid-cols-2">{[["Publication name","profile_name"],["School / organization","school_name"],["Type","organization_type"],["Location","location"],["Website","website_url"],["Instagram","instagram_url"],["LinkedIn","linkedin_url"],["Logo URL","logo_url"],["Contact email","contact_email"],["Tags","tags"]].map(([label,key])=><Field key={key} label={label} value={profileForm[key]||""} onChange={v=>setProfileForm((x:any)=>({...x,[key]:v}))}/>)}</div><Field label="Description" value={profileForm.description||""} onChange={v=>setProfileForm((x:any)=>({...x,description:v}))} multiline/><div className="rounded-[26px] border border-white/10 bg-[#090909] p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/25">Image studio</p><h3 className="mt-2 font-serif text-2xl font-black">Publication imagery.</h3><p className="mt-2 text-xs leading-5 text-white/35">Upload the logo and hero artwork directly from the workspace, or keep using URLs.</p></div><span className="text-[9px] uppercase tracking-[.15em] text-white/20">15 MB / image</span></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="overflow-hidden rounded-2xl border border-white/10 bg-black">{profileForm.logo_url?<img src={profileForm.logo_url} alt="" className="h-36 w-full object-cover"/>:<div className="flex h-36 items-center justify-center text-xs text-white/20">No logo</div>}<div className="border-t border-white/10 p-3"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Logo</p><label className="mt-2 inline-flex cursor-pointer rounded-full bg-white px-3 py-2 text-[9px] font-bold text-black">Replace logo<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)uploadProfileImage(f,"logo_url","logo");e.currentTarget.value=""}}/></label></div></div><div className="overflow-hidden rounded-2xl border border-white/10 bg-black">{profileForm.hero_header_image?<img src={profileForm.hero_header_image} alt="" className="h-36 w-full object-cover"/>:<div className="flex h-36 items-center justify-center text-xs text-white/20">No hero image</div>}<div className="border-t border-white/10 p-3"><p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Hero image</p><label className="mt-2 inline-flex cursor-pointer rounded-full bg-white px-3 py-2 text-[9px] font-bold text-black">Replace hero<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)uploadProfileImage(f,"hero_header_image","hero");e.currentTarget.value=""}}/></label></div></div></div></div><div className="rounded-[26px] border border-[#ff6a1f]/20 bg-[#ff6a1f]/[.035] p-5"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#ff9d6d]">Brand studio</p><h3 className="mt-2 font-serif text-2xl font-black">Own the front page.</h3><p className="mt-2 text-xs leading-5 text-white/35">This header also powers your newsletter identity.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><Field label="Header photo URL" value={profileForm.hero_header_image||""} onChange={v=>setProfileForm((x:any)=>({...x,hero_header_image:v}))}/><label className="mt-2 inline-flex cursor-pointer rounded-full border border-white/10 px-3 py-2 text-[9px] font-bold text-white/50">Upload hero image<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)uploadProfileImage(f,"hero_header_image","hero");e.currentTarget.value=""}}/></label></div><Field label="Hero headline" value={profileForm.hero_headline||""} onChange={v=>setProfileForm((x:any)=>({...x,hero_headline:v}))}/><label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.16em] text-white/35">Accent color</span><input type="color" value={profileForm.hero_accent_color||"#ff6a1f"} onChange={e=>setProfileForm((x:any)=>({...x,hero_accent_color:e.target.value}))} className="h-11 w-20 rounded-xl border border-white/10 bg-transparent"/></label><Field label="Overlay" value={profileForm.hero_overlay||"dark"} onChange={v=>setProfileForm((x:any)=>({...x,hero_overlay:v}))}/></div></div><button onClick={saveProfile} disabled={busy} className="rounded-full bg-white px-7 py-3.5 text-xs font-bold text-black">{busy?"Saving…":"Save profile"}</button></div>}{tab==="stories"&&<div><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ff6a1f]">Editorial</p><h2 className="mt-2 font-serif text-4xl font-black">Stories.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/35">Manage the publication archive, draft queue and published newsroom from one place.</p></div>{!creating&&<button onClick={()=>{setCreating(true);setEditing(blank)}} className="shrink-0 rounded-full bg-white px-5 py-3 text-xs font-bold text-black">New story</button>}</div>{creating?<div className="mt-8 max-w-4xl space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field label="Headline" value={editing.headline} onChange={v=>setEditing(x=>({...x,headline:v}))}/><Field label="Category" value={editing.category} onChange={v=>setEditing(x=>({...x,category:v}))}/><Field label="Description" value={editing.description} onChange={v=>setEditing(x=>({...x,description:v}))}/><div><Field label="Cover image URL" value={editing.cover_url} onChange={v=>setEditing(x=>({...x,cover_url:v}))}/><label className="mt-2 inline-flex cursor-pointer rounded-full border border-white/10 px-3 py-2 text-[9px] font-bold text-white/50">Upload cover<input type="file" accept="image/*" className="hidden" onChange={async e=>{const f=e.target.files?.[0];if(f){const url=await uploadAsset(f,"story-cover");if(url)setEditing(x=>({...x,cover_url:url}))}e.currentTarget.value=""}}/></label></div></div><Field label="Story" value={editing.body} onChange={v=>setEditing(x=>({...x,body:v}))} multiline/>
<div className="rounded-[22px] border border-[#83adff]/20 bg-[#83adff]/[.035] p-4">
  <p className="mb-3 text-[9px] font-bold uppercase tracking-[.18em] text-[#83adff]">AI editorial desk</p>
  <ChanakyaAssist
    article={{title:editing.headline,standfirst:editing.description,body_md:editing.body,cover_image_url:editing.cover_url}}
    onChange={next=>setEditing(x=>({...x,headline:next.title??x.headline,description:next.standfirst??x.description,body:next.body_md??x.body,cover_url:next.cover_image_url??x.cover_url}))}
  />
</div>
<div className="flex flex-wrap gap-2"><button onClick={saveDraft} disabled={busy} className="rounded-full bg-white px-6 py-3 text-xs font-bold text-black">Save draft</button><button onClick={submitStory} disabled={busy} className="rounded-full border border-[#ff6a1f]/30 px-6 py-3 text-xs font-bold text-[#ff9d6d]">Submit for review</button><button onClick={()=>setCreating(false)} className="rounded-full border border-white/10 px-6 py-3 text-xs text-white/45">Cancel</button></div></div>:<><div className="mt-8 border-y border-white/10 py-5"><div className="flex flex-col gap-4 lg:flex-row lg:items-center"><span className="shrink-0 text-[10px] font-bold uppercase tracking-[.2em] text-white/35">Filter news</span><select value={storyYear} onChange={e=>setStoryYear(e.target.value)} className="rounded-none border-0 border-b border-white/15 bg-transparent px-1 py-2 text-xs font-semibold text-white outline-none"><option value="All" className="bg-[#111]">Archive: All years</option>{storyYears.slice(1).map(y=><option key={y} value={y} className="bg-[#111]">{y}</option>)}</select><select value={storyCategory} onChange={e=>setStoryCategory(e.target.value)} className="rounded-none border-0 border-b border-white/15 bg-transparent px-1 py-2 text-xs font-semibold text-white outline-none"><option value="All" className="bg-[#111]">Category: All</option>{storyCategories.slice(1).map(cat=><option key={cat} value={cat} className="bg-[#111]">{cat}</option>)}</select><input value={storyQuery} onChange={e=>setStoryQuery(e.target.value)} placeholder="Search stories" className="min-w-0 flex-1 border-0 border-b border-white/15 bg-transparent px-1 py-2 text-xs text-white outline-none placeholder:text-white/25 lg:max-w-[280px]"/><span className="text-[10px] text-white/30 lg:ml-auto">{filteredArticles.length} of {articles.length} stories</span>{(storyQuery||storyCategory!=="All"||storyYear!=="All")&&<button type="button" onClick={resetStoryFilters} className="text-[9px] font-bold uppercase tracking-[.14em] text-white/40 hover:text-white">Clear</button>}</div></div><div className="mt-6 grid gap-3">{filteredArticles.map(a=><div key={a.id} className="rounded-2xl border border-white/10 bg-[#090909] p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><span className="rounded-full border border-white/10 px-2 py-1 text-[8px] uppercase tracking-[.14em] text-white/30">{a.status}</span><span className="ml-2 text-[9px] text-white/25">{a.category||"News"}</span><h3 className="mt-3 font-serif text-2xl font-black">{a.headline}</h3><p className="mt-1 text-xs text-white/25">{a.author_name||"Ambassador"} · {date(a.published_at||a.created_at)}</p></div><div className="flex flex-wrap gap-2">{a.status==="draft"&&<button onClick={()=>publish(a)} disabled={busy} className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-black">Publish</button>}<button onClick={()=>deleteArticle(a)} disabled={busy} className="rounded-full border border-red-400/20 bg-red-400/[.03] px-4 py-2.5 text-xs font-bold text-red-300 hover:bg-red-400/[.08]">Delete</button></div></div></div>)}{filteredArticles.length===0&&<div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/25">{articles.length===0?"No stories yet.":"No stories match these filters."}</div>}</div></>}</div>}{tab==="submissions"&&<div>
  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ff6a1f]">Community inbox</p>
      <h2 className="mt-2 font-serif text-4xl font-black">Review submissions.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/35">Review the submission first. Approving it moves it to Second Pass for final approval before publication.</p>
    </div>
    {stats.pending>0&&<div className="shrink-0 rounded-2xl border border-[#ff6a1f]/20 bg-[#ff6a1f]/5 px-4 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#ff9d6d]">Needs review</p>
      <p className="mt-1 text-2xl font-black">{stats.pending}</p>
    </div>}
  </div>
  <div className="mt-8 space-y-5">
    {submissions.filter(s=>s.status==="pending").map(s=><article key={s.id} className="overflow-hidden rounded-[26px] border border-white/10 bg-[#090909]">
      <div className="border-b border-white/10 px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#ff6a1f]/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.14em] text-[#ff9d6d]">Pending review</span>
              <span className="text-[9px] text-white/30">{s.section||"Community"}</span>
            </div>
            {editingSubmissionId===s.id?<div className="mt-3 max-w-4xl"><Field label="Headline" value={submissionEdit.headline} onChange={v=>setSubmissionEdit(x=>({...x,headline:v}))}/></div>:<h3 className="mt-3 max-w-4xl font-serif text-2xl font-black leading-tight sm:text-3xl">{s.headline}</h3>}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/30">
              <span><strong className="font-semibold text-white/50">Submitted by:</strong> {s.author_name||"Unknown"}</span>
              <span><strong className="font-semibold text-white/50">Received:</strong> {date(s.created_at)}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 lg:w-44">
            <button disabled={busy} onClick={()=>review(s,"approved")} className="w-full rounded-xl bg-white px-4 py-3 text-xs font-bold text-black transition hover:bg-white/90 disabled:opacity-50">Approve & publish</button>
            <button disabled={busy} onClick={()=>review(s,"rejected")} className="w-full rounded-xl border border-red-400/20 bg-red-400/[.04] px-4 py-3 text-xs font-bold text-red-300 transition hover:bg-red-400/[.08] disabled:opacity-50">Reject submission</button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="min-w-0 px-5 py-6 sm:px-7">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[.18em] text-white/25">Story</span>
            <span className="h-px flex-1 bg-white/10"/>
          </div>
          {editingSubmissionId===s.id?<div className="mt-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Section" value={submissionEdit.section} onChange={v=>setSubmissionEdit(x=>({...x,section:v}))}/>
              <div className="hidden sm:block"/>
            </div>
            <Field label="Story" value={submissionEdit.body} onChange={v=>setSubmissionEdit(x=>({...x,body:v}))} multiline/>
            <div>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[.16em] text-white/35">Images & attachments</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {submissionEdit.media.map((m:any,i:number)=><div key={i} className="relative overflow-hidden rounded-xl border border-white/10 bg-black">
                  {m?.url&&<img src={m.url} alt={m.name||"Submission image"} className="aspect-video w-full object-cover" onError={e=>{e.currentTarget.style.display="none"}}/>}
                  <div className="truncate px-3 py-2 text-[9px] text-white/35">{m.name||m.url}</div>
                  <button type="button" onClick={()=>removeSubmissionMedia(i)} className="absolute right-2 top-2 rounded-full bg-black/80 px-2 py-1 text-[9px] text-red-300">Remove</button>
                </div>)}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <label className="cursor-pointer rounded-full bg-white px-4 py-2 text-[10px] font-bold text-black">Add file<input type="file"  className="hidden" onChange={e=>{const f=e.target.files?.[0];if(f)uploadSubmissionImage(f);e.currentTarget.value=""}}/></label>
                <button type="button" onClick={addSubmissionImageUrl} className="rounded-full border border-white/10 px-4 py-2 text-[10px] text-white/55">Add image URL</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
              <button type="button" onClick={saveSubmissionEdit} disabled={busy} className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black">{busy?"Saving…":"Save changes"}</button>
              <button type="button" onClick={()=>setEditingSubmissionId(null)} className="rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/45">Cancel</button>
            </div>
          </div>:<>
            <div className="max-w-4xl whitespace-pre-wrap text-[15px] leading-7 text-white/70">{s.body}</div>
            {Array.isArray(s.media)&&s.media.length>0&&<details className="mt-7 rounded-2xl border border-white/10 bg-white/[.02]">
              <summary className="cursor-pointer list-none px-4 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-white/45">
                Attachments <span className="ml-1 text-white/20">({s.media.length})</span>
              </summary>
              <div className="border-t border-white/10 p-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {s.media.map((m,i)=>m?.url&&((m.type||"").startsWith("image")||(m.mime_type||"").startsWith("image/")||/\.(png|jpe?g|webp|gif)(\?|$)/i.test(m.url))?
                    <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-black">
                      <img src={m.url} alt={m.name||`Submission image ${i+1}`} className="aspect-video w-full object-cover"/>
                      <a href={m.url} target="_blank" rel="noreferrer" className="block truncate px-3 py-2 text-[9px] text-white/35 hover:text-white/60">Open image ↗</a>
                    </div>:
                    <a key={i} href={m.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 px-3 py-3 text-xs text-white/45 hover:text-white/70">Open attachment ↗</a>
                  )}
                </div>
              </div>
            </details>}
          </>}        </div>

        <aside className="border-t border-white/10 bg-[#0b0b0d] lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto lg:border-l lg:border-t-0">
          <div className="p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/25">Review</p>
                <p className="mt-1 text-xs font-semibold text-white/65">Submission decision</p>
              </div>
              <span className="rounded-full border border-[#ffb84d]/20 bg-[#ffb84d]/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.12em] text-[#ffd27a]">Pending</span>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-4">
              <p className="text-[9px] font-bold uppercase tracking-[.16em] text-white/25">Submitted by</p>
              <p className="mt-2 text-sm font-semibold text-white/80">{s.author_name||"Unknown"}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[8px] font-bold uppercase tracking-[.14em] text-white/20">Section</p>
                  <p className="mt-1 truncate text-[10px] text-white/55">{s.section||"Community"}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[8px] font-bold uppercase tracking-[.14em] text-white/20">Received</p>
                  <p className="mt-1 text-[10px] text-white/55">{date(s.created_at)}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#83adff]/20 bg-[#83adff]/[.035] p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#83adff]">Chanakya</p>
                  <p className="mt-1 text-[10px] text-white/30">Editorial review assistant</p>
                </div>
                <span className="rounded-full border border-[#83adff]/20 px-2 py-1 text-[7px] font-bold uppercase tracking-[.12em] text-[#9fc0ff]">AI</span>
              </div>
              <ChanakyaAssist
                article={{
                  title:s.headline,
                  standfirst:"",
                  body_md:s.body,
                  cover_image_url:(Array.isArray(s.media)?s.media.find((m:any)=>m?.type==="image"||m?.mime_type?.startsWith("image"))?.url:"")||""
                }}
                onChange={next=>setSubmissionEdit(x=>({
                  ...x,
                  headline:next.title??x.headline,
                  body:next.body_md??x.body,
                  media:next.cover_image_url && !x.media.some((m:any)=>m?.url===next.cover_image_url)
                    ? [...x.media,{url:next.cover_image_url,type:"image"}]
                    : x.media
                }))}
              />
            </div>

            <div className="mt-5 space-y-2">
              <button disabled={busy} type="button" onClick={()=>review(s,"approved")} className="w-full rounded-xl bg-white px-4 py-3 text-xs font-bold text-black transition hover:bg-white/90 disabled:opacity-50">Approve & publish</button>
              <button disabled={busy} type="button" onClick={()=>review(s,"rejected")} className="w-full rounded-xl border border-red-400/20 bg-red-400/[.04] px-4 py-3 text-xs font-bold text-red-300 transition hover:bg-red-400/[.08] disabled:opacity-50">Reject submission</button>
              <button disabled={busy} type="button" onClick={()=>beginSubmissionEdit(s)} className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-[10px] font-bold text-white/55 hover:text-white">Edit submission</button>
            </div>

            <div className="mt-5 border-t border-white/10 pt-5">
              <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/25">Reviewer flow</p>
              <div className="mt-3 space-y-2">
                <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-[9px] font-bold text-white/30">01</span><p className="text-[10px] leading-4 text-white/45">Read the full submission.</p></div>
                <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-[9px] font-bold text-white/30">02</span><p className="text-[10px] leading-4 text-white/45">Use Chanakya for editorial checks.</p></div>
                <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-3"><span className="text-[9px] font-bold text-white/30">03</span><p className="text-[10px] leading-4 text-white/45">Approve, reject, or edit before publishing.</p></div>
              </div>
            </div>
          </div>
        </aside>     </div>
    </article>)}
    {submissions.filter(s=>s.status==="pending").length===0&&<div className="rounded-[26px] border border-dashed border-white/10 p-12 text-center"><p className="font-serif text-2xl font-black">No pending submissions.</p><p className="mt-2 text-sm text-white/25">You’re all caught up.</p></div>}
  </div>
</div>}{tab==="newsletter"&&<AmbassadorNewsletter publication={publication}/>}{tab==="second-pass"&&<div>
  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#83adff]">Final review</p>
      <h2 className="mt-2 font-serif text-4xl font-black">Second Pass.</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/35">Submissions approved in the first review queue land here. Give the final approval to publish them, or reject them before they go live.</p>
    </div>
    <div className="shrink-0 rounded-2xl border border-[#83adff]/20 bg-[#83adff]/[.05] px-4 py-3">
      <p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#9fc0ff]">Awaiting final approval</p>
      <p className="mt-1 text-2xl font-black">{secondPassSubmissions.length}</p>
    </div>
  </div>

  <div className="mt-8 space-y-5">
    {secondPassSubmissions.map(s=><article key={s.id} className="overflow-hidden rounded-[26px] border border-white/10 bg-[#090909]">
      <div className="border-b border-white/10 px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#83adff]/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.14em] text-[#9fc0ff]">Approved · Final review</span>
              <span className="text-[9px] text-white/30">{s.section||"Community"}</span>
            </div>
            <h3 className="mt-3 max-w-4xl font-serif text-2xl font-black leading-tight sm:text-3xl">{s.headline}</h3>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/30">
              <span><strong className="font-semibold text-white/50">Submitted by:</strong> {s.author_name||"Unknown"}</span>
              <span><strong className="font-semibold text-white/50">Approved by queue:</strong> {date(s.created_at)}</span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col gap-2 lg:w-48">
            <button disabled={busy} onClick={()=>finalReview(s,"published")} className="w-full rounded-xl bg-white px-4 py-3 text-xs font-bold text-black transition hover:bg-white/90 disabled:opacity-50">Final approve & publish</button>
            <button disabled={busy} onClick={()=>finalReview(s,"rejected")} className="w-full rounded-xl border border-red-400/20 bg-red-400/[.04] px-4 py-3 text-xs font-bold text-red-300 transition hover:bg-red-400/[.08] disabled:opacity-50">Reject</button>
            <button type="button" onClick={()=>beginSubmissionEdit(s)} className="w-full rounded-xl border border-white/10 px-4 py-2.5 text-[10px] font-bold text-white/55 hover:text-white">Edit submission</button>
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 p-5 sm:p-7">
          {editingSubmissionId===s.id?<div className="space-y-5">
            <Field label="Headline" value={submissionEdit.headline} onChange={v=>setSubmissionEdit(x=>({...x,headline:v}))}/>
            <Field label="Section" value={submissionEdit.section} onChange={v=>setSubmissionEdit(x=>({...x,section:v}))}/>
            <Field label="Story" value={submissionEdit.body} onChange={v=>setSubmissionEdit(x=>({...x,body:v}))} multiline/>
            <div className="flex flex-wrap gap-2 border-t border-white/10 pt-5">
              <button type="button" onClick={saveSubmissionEdit} disabled={busy} className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black">{busy?"Saving…":"Save changes"}</button>
              <button type="button" onClick={()=>setEditingSubmissionId(null)} className="rounded-full border border-white/10 px-5 py-2.5 text-xs text-white/45">Cancel</button>
            </div>
          </div>:<div className="max-w-4xl whitespace-pre-wrap text-[15px] leading-7 text-white/70">{s.body}</div>}
          {Array.isArray(s.media)&&s.media.length>0&&<details className="mt-7 rounded-2xl border border-white/10 bg-white/[.02]">
            <summary className="cursor-pointer list-none px-4 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-white/45">Attachments <span className="ml-1 text-white/20">({s.media.length})</span></summary>
            <div className="border-t border-white/10 p-4"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {s.media.map((m,i)=>m?.url&&((m.type||"").startsWith("image")||(m.mime_type||"").startsWith("image/")||/\.(png|jpe?g|webp|gif)(\?|$)/i.test(m.url))?<div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-black"><img src={m.url} alt={m.name||`Submission image ${i+1}`} className="aspect-video w-full object-cover"/><a href={m.url} target="_blank" rel="noreferrer" className="block truncate px-3 py-2 text-[9px] text-white/35">Open image ↗</a></div>:<a key={i} href={m.url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 px-3 py-3 text-xs text-white/45">Open attachment ↗</a>)}
            </div></div>
          </details>}
        </div>
        <aside className="border-t border-white/10 bg-[#0b0b0d] p-5 lg:border-l lg:border-t-0 sm:p-6">
          <p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#83adff]">Chanakya</p>
          <p className="mt-1 text-[10px] text-white/30">Final editorial check before publication.</p>
          <div className="mt-4 rounded-2xl border border-[#83adff]/20 bg-[#83adff]/[.035] p-4">
            <ChanakyaAssist
              article={{title:editingSubmissionId===s.id?submissionEdit.headline:s.headline,standfirst:"",body_md:editingSubmissionId===s.id?submissionEdit.body:s.body,cover_image_url:(Array.isArray(s.media)?s.media.find((m:any)=>m?.type==="image"||m?.mime_type?.startsWith("image"))?.url:"")||""}}
              onChange={next=>setSubmissionEdit(x=>({...x,headline:next.title??x.headline,body:next.body_md??x.body,media:next.cover_image_url&&!x.media.some((m:any)=>m?.url===next.cover_image_url)?[...x.media,{url:next.cover_image_url,type:"image"}]:x.media}))}
            />
          </div>
        </aside>
      </div>
    </article>)}
    {secondPassSubmissions.length===0&&<div className="rounded-[26px] border border-dashed border-white/10 p-12 text-center"><p className="font-serif text-2xl font-black">Second Pass is clear.</p><p className="mt-2 text-sm text-white/25">Approved submissions will appear here for final approval.</p></div>}
  </div>
</div>}{tab==="team"&&<div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ff6a1f]">People</p><h2 className="mt-2 font-serif text-4xl font-black">Ambassadors.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/35">Add, edit and remove people who can work on this publication. If the email already has a BitBuzz account, access is linked automatically; otherwise it activates when they sign in with this email.</p></div><button onClick={()=>openMemberEditor()} className="rounded-full bg-white px-5 py-3 text-xs font-bold text-black">Add Ambassador</button></div><div className="mt-8 grid gap-3 sm:grid-cols-2">{[...members].sort((a,b)=>(a.display_order??0)-(b.display_order??0)).map(m=><div key={m.id} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#090909] p-5"><div className="shrink-0">{m.photo_url?<img src={m.photo_url} alt="" className="h-12 w-12 rounded-full object-cover"/>:<div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white/35">{m.name.slice(0,1).toUpperCase()}</div>}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{m.name}</p><p className="mt-1 text-[9px] uppercase tracking-[.15em] text-white/25">{m.role}{!m.is_active?" · Inactive":""}</p><p className="mt-1 truncate text-xs text-white/25">{m.email||"No email"}</p>{m.second_pass_enabled&&<p className="mt-2 text-[9px] font-bold uppercase tracking-[.14em] text-[#83adff]">Second Pass · {m.second_pass_status}</p>}</div><div className="flex shrink-0 flex-wrap justify-end gap-2"><button disabled={busy} onClick={()=>moveMember(m,-1)} className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold text-white/45">↑</button><button disabled={busy} onClick={()=>moveMember(m,1)} className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold text-white/45">↓</button><button disabled={busy} onClick={()=>toggleMember(m)} className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold text-white/55">{m.is_active?"Hide":"Show"}</button><button disabled={busy} onClick={()=>setSecondPassAccess(m)} className={m.second_pass_enabled?"rounded-full border border-[#83adff]/30 px-3 py-2 text-[10px] font-bold text-[#9fc0ff]":"rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold text-white/50"}>{m.second_pass_enabled?"Lock Second Pass":"Grant Second Pass"}</button>{m.second_pass_status==="submitted"&&<><button disabled={busy} onClick={()=>reviewSecondPass(m,"approved")} className="rounded-full bg-white px-3 py-2 text-[10px] font-bold text-black">Approve</button><button disabled={busy} onClick={()=>reviewSecondPass(m,"changes_requested")} className="rounded-full border border-white/10 px-3 py-2 text-[10px] text-white/50">Changes</button></>}<button disabled={busy} onClick={()=>openMemberEditor(m)} className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold text-white/60 hover:text-white">Edit</button><button disabled={busy} onClick={()=>deleteMember(m)} className="rounded-full border border-red-400/20 px-3 py-2 text-[10px] font-bold text-red-300">Delete</button></div></div>)}{members.length===0&&<div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/25 sm:col-span-2">No ambassadors yet. Add the first one.</div>}</div>{memberOpen&&<div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/75 p-5 backdrop-blur-md sm:items-center"><form onSubmit={saveMember} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#0a0a0a] p-6 sm:p-8"><div className="flex items-start justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ff6a1f]">Team access</p><h3 className="mt-2 font-serif text-3xl font-black">{editingMember?"Edit Ambassador.":"Add Ambassador."}</h3></div><button type="button" onClick={()=>{setMemberOpen(false);setEditingMember(null)}} className="text-xs text-white/35">Close</button></div><div className="mt-7 grid gap-4 sm:grid-cols-2"><Field label="Name" value={memberForm.name} onChange={v=>setMemberForm(x=>({...x,name:v}))}/><Field label="Email" value={memberForm.email} onChange={v=>setMemberForm(x=>({...x,email:v}))}/><Field label="Position / role" value={memberForm.role} onChange={v=>setMemberForm(x=>({...x,role:v}))}/><div><Field label="Photo URL" value={memberForm.photo} onChange={v=>setMemberForm(x=>({...x,photo:v}))}/><label className="mt-2 inline-flex cursor-pointer rounded-full border border-white/10 px-3 py-2 text-[9px] font-bold text-white/50">Upload photo<input type="file" accept="image/*" className="hidden" onChange={async e=>{const f=e.target.files?.[0];if(f){const url=await uploadAsset(f,"team-photo");if(url)setMemberForm(x=>({...x,photo:url}))}e.currentTarget.value=""}}/></label></div><Field label="Instagram" value={memberForm.instagram} onChange={v=>setMemberForm(x=>({...x,instagram:v}))}/><Field label="LinkedIn" value={memberForm.linkedin} onChange={v=>setMemberForm(x=>({...x,linkedin:v}))}/><Field label="Website" value={memberForm.website} onChange={v=>setMemberForm(x=>({...x,website:v}))}/><label className="sm:col-span-2 flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-xs text-white/60"><input type="checkbox" checked={memberForm.active} onChange={e=>setMemberForm(x=>({...x,active:e.target.checked}))}/> Show this person on the public team page</label></div><div className="mt-4"><Field label="Bio" value={memberForm.bio} onChange={v=>setMemberForm(x=>({...x,bio:v}))} multiline/></div><p className="mt-4 text-[11px] leading-5 text-white/25">Positions supported: Admin, Editor and Ambassador. The email is the access identity, so double-check it before saving.</p><div className="mt-6 flex gap-2"><button type="submit" disabled={busy} className="rounded-full bg-white px-6 py-3 text-xs font-bold text-black">{busy?"Saving…":editingMember?"Save changes":"Add Ambassador"}</button><button type="button" onClick={()=>{setMemberOpen(false);setEditingMember(null)}} className="rounded-full border border-white/10 px-6 py-3 text-xs text-white/45">Cancel</button></div></form></div>}</div>}</main></div></div>;
}
