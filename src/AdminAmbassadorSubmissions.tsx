import { useCallback, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

type Submission = {
  id: string;
  publication_id: string;
  publication_slug: string | null;
  publication_name: string | null;
  author_name: string;
  author_email: string | null;
  class_name: string | null;
  submission_type: string | null;
  headline: string;
  body: string;
  media: unknown;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

const date = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function AdminAmbassadorSubmissions() {
  const [items, setItems] = useState<Submission[]>([]);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("bitbuzz_admin_list_ambassador_submissions");
    if (error) {
      setMessage(error.message);
      return;
    }
    setItems((data || []) as Submission[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const review = async (item: Submission, status: "approved" | "rejected" | "pending") => {
    setBusy(true);
    setMessage("");
    const { error } = await supabase.rpc("bitbuzz_admin_review_ambassador_submission", {
      p_submission_id: item.id,
      p_status: status,
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setSelected(null);
    setMessage(`Submission ${status}.`);
    await load();
  };

  const filtered = items.filter(item => {
    const matchesStatus = filter === "all" || item.status === filter;
    const haystack = `${item.headline} ${item.author_name} ${item.author_email || ""} ${item.publication_name || ""} ${item.publication_slug || ""}`.toLowerCase();
    return matchesStatus && haystack.includes(search.toLowerCase());
  });

  const pending = items.filter(item => item.status === "pending").length;

  return (
    <div className="min-h-[600px] text-white">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ff6a1f]">Ambassador network</p>
          <h1 className="mt-2 font-serif text-4xl font-black tracking-[-.05em]">Community submissions.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">Every submission made through an Ambassador publication appears here. Review it without touching the existing newsroom workflow.</p>
        </div>
        <a href="/admin" className="rounded-full border border-white/10 px-5 py-3 text-xs font-bold text-white/60 hover:bg-white/5">← Back to console</a>
      </div>

      {message && <div className="mt-6 rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs text-white/60">{message}</div>}

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {[["All", items.length, "all"], ["Pending", pending, "pending"], ["Reviewed", items.length - pending, "reviewed"]].map(([label, count, key]) => (
          <button key={String(key)} onClick={() => setFilter(key === "reviewed" ? "reviewed" : String(key))} className={`rounded-2xl border p-4 text-left ${filter === key || (key === "reviewed" && filter === "reviewed") ? "border-white/25 bg-white/10" : "border-white/10 bg-white/[.025]"}`}>
            <p className="text-[9px] font-bold uppercase tracking-[.18em] text-white/30">{label}</p>
            <p className="mt-2 font-serif text-3xl font-black">{count}</p>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search submissions, publication, author…" className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-xs outline-none placeholder:text-white/20 focus:border-white/25" />
        <select value={filter} onChange={e => setFilter(e.target.value)} className="rounded-xl border border-white/10 bg-[#090909] px-4 py-3 text-xs text-white outline-none sm:w-44">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="mt-5 grid gap-3">
        {filtered.map(item => (
          <article key={item.id} className="rounded-2xl border border-white/10 bg-[#090909] p-5">
            <div className="flex flex-col justify-between gap-5 lg:flex-row">
              <button onClick={() => setSelected(item)} className="min-w-0 text-left">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.15em] text-white/35">{item.status}</span>
                  {item.submission_type && <span className="rounded-full border border-white/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.15em] text-white/25">{item.submission_type}</span>}
                </div>
                <h2 className="mt-3 font-serif text-2xl font-black">{item.headline}</h2>
                <p className="mt-1 text-xs text-white/35">{item.publication_name || item.publication_slug || "Ambassador publication"} · {item.author_name}{item.author_email ? ` · ${item.author_email}` : ""}</p>
                <p className="mt-3 line-clamp-2 max-w-3xl text-sm leading-6 text-white/35">{item.body}</p>
                <p className="mt-4 text-[10px] text-white/20">Submitted {date(item.created_at)}</p>
              </button>
              <div className="flex shrink-0 items-center gap-2 lg:self-center">
                {item.status === "pending" ? <>
                  <button disabled={busy} onClick={() => review(item, "approved")} className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black disabled:opacity-50">Approve</button>
                  <button disabled={busy} onClick={() => review(item, "rejected")} className="rounded-full border border-red-400/20 px-5 py-2.5 text-xs font-bold text-red-300 disabled:opacity-50">Reject</button>
                </> : <button disabled={busy} onClick={() => review(item, "pending")} className="rounded-full border border-white/10 px-4 py-2.5 text-xs font-bold text-white/45">Reopen</button>}
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-sm text-white/25">No Ambassador submissions found.</div>}
      </div>

      {selected && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/80 p-5 backdrop-blur-md sm:items-center" onMouseDown={e => { if (e.target === e.currentTarget) setSelected(null); }}>
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-white/10 bg-[#090909] p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#ff6a1f]">Submission review</p>
              <h2 className="mt-2 font-serif text-3xl font-black">{selected.headline}</h2>
              <p className="mt-2 text-xs text-white/35">{selected.publication_name || selected.publication_slug} · {selected.author_name} · {selected.author_email || "No email"}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-white/35">Close</button>
          </div>
          <div className="mt-7 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/[.025] p-5 text-sm leading-7 text-white/70">{selected.body}</div>
          {!!selected.media && <pre className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-black p-4 text-xs text-white/40">{JSON.stringify(selected.media, null, 2)}</pre>}
          <div className="mt-6 flex flex-wrap gap-2">
            {selected.status === "pending" && <>
              <button disabled={busy} onClick={() => review(selected, "approved")} className="rounded-full bg-white px-6 py-3 text-xs font-bold text-black">Approve</button>
              <button disabled={busy} onClick={() => review(selected, "rejected")} className="rounded-full border border-red-400/20 px-6 py-3 text-xs font-bold text-red-300">Reject</button>
            </>}
            {selected.status !== "pending" && <button disabled={busy} onClick={() => review(selected, "pending")} className="rounded-full border border-white/10 px-6 py-3 text-xs font-bold text-white/55">Reopen for review</button>}
            <a href={`/ambassadors/${selected.publication_slug || ""}`} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-6 py-3 text-xs font-bold text-white/45">Open publication ↗</a>
          </div>
        </div>
      </div>}
    </div>
  );
}
