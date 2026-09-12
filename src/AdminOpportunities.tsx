import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

type Status = "pending" | "approved" | "rejected";
type Opportunity = {
  id: string;
  title: string;
  slug: string;
  description: string;
  organiser: string | null;
  organizer_email: string | null;
  url: string | null;
  logo_url: string | null;
  event_type: string | null;
  format: string | null;
  location: string | null;
  start_at: string | null;
  deadline: string | null;
  status: Status;
  featured: boolean;
  created_at: string;
};

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value))
    : "TBA";

const timeAgo = (value: string) => {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

function Icon({ name }: { name: "check" | "close" | "star" | "external" | "calendar" | "location" }) {
  const paths: Record<string, React.ReactNode> = {
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 18.3 6.4 21.2l1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
    external: <><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M19 13v6H5V5h6" /></>,
    calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M8 3v4M16 3v4M4 10h16" /></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">{paths[name]}</svg>;
}

function StatusPill({ status }: { status: Status }) {
  const copy = { pending: "Awaiting review", approved: "Live", rejected: "Rejected" }[status];
  const classes = {
    pending: "border-[#ffc48f]/20 bg-[#ffc48f]/8 text-[#ffc48f]",
    approved: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
    rejected: "border-red-400/20 bg-red-400/8 text-red-300",
  }[status];
  return <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] ${classes}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{copy}</span>;
}

export default function AdminOpportunities() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<Status>("pending");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("opportunities")
      .select("id,title,slug,description,organiser,organizer_email,url,logo_url,event_type,format,location,start_at,deadline,status,featured,created_at")
      .eq("status", filter)
      .order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    setItems((data || []) as Opportunity[]);
  };

  useEffect(() => { load(); }, [filter]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter(item => `${item.title} ${item.organiser || ""} ${item.event_type || ""} ${item.location || ""}`.toLowerCase().includes(needle));
  }, [items, query]);

  const review = async (id: string, status: "approved" | "rejected") => {
    setBusy(id);
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("opportunities").update({ status, reviewed_by: user?.id || null, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) setMessage(error.message);
    await load();
    setBusy(null);
  };

  const feature = async (item: Opportunity) => {
    setBusy(item.id);
    setMessage("");
    const { error } = await supabase.from("opportunities").update({ featured: !item.featured }).eq("id", item.id);
    if (error) setMessage(error.message);
    await load();
    setBusy(null);
  };

  return (
    <section className="min-h-[calc(100vh-64px)] bg-[#050505] px-4 py-7 text-white sm:px-6 lg:px-8">
      <style>{`.bb-op-card{transition:transform .3s cubic-bezier(.22,1,.36,1),border-color .3s,background-color .3s,box-shadow .3s}.bb-op-card:hover{transform:translateY(-2px);border-color:rgba(255,255,255,.18);background:rgba(255,255,255,.035);box-shadow:0 18px 55px rgba(0,0,0,.28)}.bb-op-action{transition:transform .2s,background-color .2s,border-color .2s}.bb-op-action:active{transform:scale(.97)}`}</style>
      <div className="mx-auto max-w-[1180px]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.24em] text-[#ffc48f]"><span className="h-1.5 w-1.5 rounded-full bg-[#ffc48f] shadow-[0_0_14px_#ffc48f]" />Community directory</div>
            <h1 className="mt-3 font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[.9] tracking-[-.055em]">Opportunities.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/38">Review student opportunities before they enter the public BitBuzz directory. Keep the good stuff moving and the junk out.</p>
          </div>
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[.025]">
            {(["pending", "approved", "rejected"] as const).map((status, index) => (
              <button key={status} type="button" onClick={() => setFilter(status)} className={`min-w-[105px] px-4 py-4 text-left transition sm:min-w-[125px] ${filter === status ? "bg-white text-black" : "text-white/38 hover:bg-white/[.04] hover:text-white"} ${index > 0 ? "border-l border-white/10" : ""}`}>
                <span className="block text-[9px] font-bold uppercase tracking-[.16em]">{status}</span>
                <span className="mt-1 block text-xl font-semibold tracking-[-.03em]">{items.length && filter === status ? items.length : ""}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-y border-white/10 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-white/25"><span className="h-2 w-2 rounded-full bg-emerald-400" />Live moderation queue</div>
          <label className="relative block sm:w-72"><span className="sr-only">Search opportunities</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search submissions" className="w-full rounded-xl border border-white/10 bg-white/[.025] px-4 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-white/25" /></label>
        </div>

        {message && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/[.05] px-4 py-3 text-xs text-red-300">{message}</div>}

        <div className="mt-6 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[.015] px-6 py-20 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[.03] text-white/25"><Icon name="calendar" /></div>
              <h2 className="mt-5 font-serif text-2xl tracking-[-.03em]">Nothing here yet.</h2>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-white/30">There are no {filter} submissions matching this queue.</p>
            </div>
          ) : filtered.map(item => (
            <article key={item.id} className="bb-op-card overflow-hidden rounded-[24px] border border-white/10 bg-white/[.018]">
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row">
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c0d] sm:h-32 sm:w-44 lg:h-28 lg:w-40">
                    {item.logo_url ? <img src={item.logo_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,.1),transparent_60%)] font-serif text-5xl text-white/10">B</div>}
                    {item.featured && <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[.13em] text-[#ffc48f] backdrop-blur"><Icon name="star" /> Featured</span>}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={item.status} />
                      <span className="text-[9px] font-bold uppercase tracking-[.14em] text-white/25">{item.event_type || "Event"}</span>
                      <span className="text-white/15">•</span>
                      <span className="text-[9px] font-bold uppercase tracking-[.14em] text-white/25">{item.format || "Online"}</span>
                    </div>
                    <h2 className="mt-3 font-serif text-[clamp(1.6rem,3vw,2.25rem)] leading-[.95] tracking-[-.04em]">{item.title}</h2>
                    <p className="mt-2 text-xs text-white/38">{item.organiser || "Unknown organizer"}{item.organizer_email ? ` · ${item.organizer_email}` : ""}</p>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-white/48">{item.description || "No description supplied."}</p>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-white/28">
                      {item.start_at && <span className="inline-flex items-center gap-1.5"><Icon name="calendar" />{date(item.start_at)}</span>}
                      {item.location && <span className="inline-flex items-center gap-1.5"><Icon name="location" />{item.location}</span>}
                      <span>Submitted {timeAgo(item.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-white/42 transition hover:text-white">Open website <Icon name="external" /></a>}
                    <span className="hidden text-[9px] text-white/18 sm:inline">/{item.slug}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {filter === "approved" && <button disabled={busy === item.id} onClick={() => feature(item)} className="bb-op-action inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2.5 text-[10px] font-semibold text-white/55 hover:border-[#ffc48f]/30 hover:bg-[#ffc48f]/[.05] hover:text-[#ffc48f]"><Icon name="star" />{item.featured ? "Unfeature" : "Feature"}</button>}
                    {filter === "pending" && <>
                      <button disabled={busy === item.id} onClick={() => review(item.id, "rejected")} className="bb-op-action inline-flex items-center gap-2 rounded-xl border border-red-400/15 px-3.5 py-2.5 text-[10px] font-semibold text-red-300/70 hover:border-red-400/30 hover:bg-red-400/[.05] hover:text-red-200"><Icon name="close" />Reject</button>
                      <button disabled={busy === item.id} onClick={() => review(item.id, "approved")} className="bb-op-action inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[10px] font-bold text-black hover:bg-[#ffc48f]"><Icon name="check" />Approve</button>
                    </>}
                    {filter !== "pending" && <span className="rounded-xl bg-white/[.04] px-3.5 py-2.5 text-[10px] text-white/25">Reviewed queue</span>}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
