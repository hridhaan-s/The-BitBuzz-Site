import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type Recent = { id: number; prompt: string; category: string | null; web_search_used: boolean; fact_check_used: boolean; image_used: boolean; model: string | null; latency_ms: number | null; created_at: string };
type Summary = { total_prompts: number; web_searches: number; fact_checks: number; image_requests: number; sessions: number; top_categories: { category: string; count: number }[]; recent: Recent[] };

export default function ChanakyaAnalytics() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPrompts, setShowPrompts] = useState(true);

  const load = async () => {
    setLoading(true); setError("");
    const { data: result, error: rpcError } = await supabase.rpc("chanakya_analytics_summary");
    if (rpcError) setError(rpcError.message);
    else if (!result) setError("Super-admin access required.");
    else setData(result as Summary);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  if (loading) return <div className="rounded-2xl border border-white/10 bg-white/[.035] p-8 text-sm text-white/45">Loading Chanakya analytics…</div>;
  if (error || !data) return <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-sm text-red-200">{error || "Analytics unavailable."}</div>;

  const cards = [["Prompts", data.total_prompts], ["Sessions", data.sessions], ["Web searches", data.web_searches], ["Fact checks", data.fact_checks]];
  return <section className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ffc48f]">Super-admin</p><h1 className="mt-2 font-serif text-4xl tracking-[-.04em]">Chanakya Analytics.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">Understand how people use Chanakya. Raw prompts are visible here only to authorized super-admins.</p></div><button onClick={load} className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black hover:bg-[#83adff]">Refresh</button></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value])=><div key={label} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/30">{label}</p><p className="mt-3 font-serif text-3xl">{value}</p></div>)}</div>
    <div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Top topics</h2><span className="text-[9px] uppercase tracking-[.15em] text-white/25">All time</span></div><div className="mt-5 space-y-3">{data.top_categories.length ? data.top_categories.map(x=><div key={x.category}><div className="flex justify-between text-xs"><span className="capitalize text-white/70">{x.category}</span><span className="text-white/30">{x.count}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full bg-white/50" style={{width:`${Math.max(5, Math.round(x.count / Math.max(...data.top_categories.map(c=>c.count)) * 100))}%`}}/></div></div>) : <p className="text-sm text-white/30">No categorized prompts yet.</p>}</div></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-serif text-2xl">Recent prompts</h2><p className="mt-1 text-xs text-white/30">Limited operational history for product improvement.</p></div><button onClick={()=>setShowPrompts(v=>!v)} className="rounded-lg bg-white/5 px-3 py-2 text-[10px] font-bold text-white/55 hover:bg-white/10">{showPrompts ? "Hide prompts" : "Show prompts"}</button></div>{showPrompts&&<div className="mt-5 space-y-2">{data.recent.map(r=><div key={r.id} className="rounded-xl border border-white/5 bg-black/20 p-3"><p className="text-sm leading-6 text-white/75">{r.prompt}</p><div className="mt-2 flex flex-wrap gap-2 text-[9px] font-bold uppercase tracking-[.12em] text-white/25"><span>{r.category || "general"}</span>{r.web_search_used&&<span>web</span>}{r.fact_check_used&&<span>fact-check</span>}<span>{new Date(r.created_at).toLocaleString()}</span></div></div>)}{!data.recent.length&&<p className="text-sm text-white/30">No prompts yet.</p>}</div>}</div>
    </div>
    <div className="rounded-2xl border border-[#ffc48f]/15 bg-[#ffc48f]/5 p-4 text-xs leading-5 text-[#ffc48f]/70"><strong className="text-[#ffc48f]">Privacy guardrail:</strong> don't use this view to inspect sensitive information. The public Chanakya page explicitly tells users that prompts are logged and advises them not to submit passwords, private secrets, or sensitive information.</div>
  </section>;
}
