import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

type Staff = { email: string; role: string; boards: string[] };
type PlatformAdmin = { email: string; created_at: string };
const BOARDS = [
  ["space", "Space"],
  ["cybersecurity", "Cybersecurity"],
  ["tech", "Tech"],
  ["aviation", "Aviation"],
  ["innovation", "Innovation"],
  ["biobuzz", "BioBuzz"],
] as const;

export default function SuperAdminPanel() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [platformAdmins, setPlatformAdmins] = useState<PlatformAdmin[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | "writer">("editor");
  const [boards, setBoards] = useState<string[]>(["cybersecurity"]);
  const [platformEmail, setPlatformEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setError("");
    const [s, p] = await Promise.all([
      supabase.rpc("bitbuzz_superadmin_list_staff"),
      supabase.rpc("bitbuzz_superadmin_list_platform_admins"),
    ]);
    if (s.error) setError(s.error.message);
    else setStaff((s.data || []) as Staff[]);
    if (p.error) setError(p.error.message);
    else setPlatformAdmins((p.data || []) as PlatformAdmin[]);
  };

  useEffect(() => { void load(); }, []);

  const toggleBoard = (slug: string) => setBoards(current => current.includes(slug) ? current.filter(v => v !== slug) : [...current, slug]);

  const saveStaff = async () => {
    if (!email.trim()) return setError("Email is required.");
    setBusy(true); setMessage(""); setError("");
    const { error: e } = await supabase.rpc("bitbuzz_superadmin_upsert_staff", { target_email: email.trim(), target_role: role, board_slugs: role === "writer" ? [] : boards });
    if (e) setError(e.message);
    else { setMessage(`${email.trim()} updated.`); setEmail(""); await load(); }
    setBusy(false);
  };

  const revoke = async (targetEmail: string) => {
    if (!confirm(`Remove editorial access for ${targetEmail}?`)) return;
    setBusy(true); setMessage(""); setError("");
    const { error: e } = await supabase.rpc("bitbuzz_superadmin_revoke_staff", { target_email: targetEmail });
    if (e) setError(e.message); else { setMessage(`${targetEmail} revoked.`); await load(); }
    setBusy(false);
  };

  const setPlatform = async (enabled: boolean, targetEmail: string) => {
    setBusy(true); setMessage(""); setError("");
    const { error: e } = await supabase.rpc("bitbuzz_superadmin_set_platform_admin", { target_email: targetEmail, enabled });
    if (e) setError(e.message); else { setMessage(enabled ? `${targetEmail} is now a SuperAdmin.` : `${targetEmail} is no longer a SuperAdmin.`); setPlatformEmail(""); await load(); }
    setBusy(false);
  };

  const assignedCount = useMemo(() => staff.filter(s => s.boards.length > 0).length, [staff]);

  return <section className="rounded-[24px] border border-white/10 bg-[#080809] overflow-hidden">
    <div className="border-b border-white/10 p-6 sm:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ff6a1f]">SuperAdmin</p>
      <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="font-serif text-4xl tracking-[-.045em]">Control the newsroom.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">Manage staff, assign editorial boards, and control the platform-level administrators. These controls are database-authorized, not just frontend permissions.</p></div>
        <div className="rounded-full border border-white/10 bg-white/[.03] px-3 py-2 text-[9px] font-bold uppercase tracking-[.14em] text-white/35">{assignedCount} assigned staff</div>
      </div>
    </div>

    <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.05fr_.95fr]">
      <div className="rounded-2xl border border-white/10 bg-black p-5">
        <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/30">Staff access</p>
        <h2 className="mt-2 font-serif text-2xl">Add or update staff</h2>
        <div className="mt-5 space-y-4">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="staff@example.com" type="email" className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm text-white outline-none focus:border-white/25" />
          <select value={role} onChange={e => setRole(e.target.value as typeof role)} className="w-full rounded-xl border border-white/10 bg-[#0b0b0c] px-4 py-3 text-sm text-white outline-none focus:border-white/25">
            <option value="editor">Editor</option><option value="admin">Board Admin</option><option value="writer">Writer / no board</option>
          </select>
          {role !== "writer" && <div><p className="mb-2 text-[9px] font-bold uppercase tracking-[.16em] text-white/30">Editorial boards</p><div className="grid grid-cols-2 gap-2">{BOARDS.map(([slug, label]) => <button key={slug} type="button" onClick={() => toggleBoard(slug)} className={`rounded-xl border px-3 py-2.5 text-left text-xs transition ${boards.includes(slug) ? "border-white bg-white text-black" : "border-white/10 bg-white/[.025] text-white/45 hover:text-white"}`}>{boards.includes(slug) ? "✓ " : ""}{label}</button>)}</div></div>}
          <button disabled={busy} onClick={() => void saveStaff()} className="w-full rounded-xl bg-white px-4 py-3 text-xs font-bold text-black transition hover:bg-[#ff6a1f] disabled:opacity-40">{busy ? "Saving…" : "Save staff access"}</button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black p-5">
        <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/30">Platform control</p>
        <h2 className="mt-2 font-serif text-2xl">SuperAdmins</h2>
        <p className="mt-2 text-xs leading-5 text-white/35">SuperAdmins have unrestricted access to every editorial board and the Flag-It queue.</p>
        <div className="mt-5 space-y-2">{platformAdmins.map(a => <div key={a.email} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.025] p-3"><div className="min-w-0"><p className="truncate text-xs text-white/75">{a.email}</p><p className="mt-1 text-[8px] uppercase tracking-[.13em] text-white/25">SuperAdmin</p></div><button disabled={busy} onClick={() => void setPlatform(false, a.email)} className="rounded-lg border border-red-400/20 bg-red-400/5 px-3 py-2 text-[9px] font-bold text-red-300 hover:bg-red-400/10">Remove</button></div>)}</div>
        <div className="mt-4 flex gap-2"><input value={platformEmail} onChange={e => setPlatformEmail(e.target.value)} placeholder="admin@example.com" type="email" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[.035] px-3 py-3 text-xs text-white outline-none focus:border-white/25"/><button disabled={busy || !platformEmail.trim()} onClick={() => void setPlatform(true, platformEmail.trim())} className="rounded-xl bg-white px-4 py-3 text-[9px] font-bold text-black disabled:opacity-40">Grant</button></div>
      </div>
    </div>

    <div className="border-t border-white/10 p-6 sm:p-8">
      <div className="flex items-end justify-between gap-4"><div><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/30">Current staff</p><h2 className="mt-2 font-serif text-2xl">Board assignments.</h2></div><span className="text-[9px] uppercase tracking-[.14em] text-white/20">{staff.length} accounts</span></div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">{staff.map(s => <div key={s.email} className="grid gap-3 border-b border-white/10 p-4 last:border-0 sm:grid-cols-[1.2fr_.6fr_1.8fr_auto] sm:items-center"><div className="min-w-0"><p className="truncate text-xs font-semibold text-white/80">{s.email}</p></div><span className="w-fit rounded-full bg-white/[.06] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[.12em] text-white/40">{s.role}</span><div className="flex flex-wrap gap-1.5">{s.boards.length ? s.boards.map(b => <span key={b} className="rounded-full border border-white/10 px-2 py-1 text-[8px] uppercase tracking-[.1em] text-white/35">{b}</span>) : <span className="text-[9px] text-white/20">No boards</span>}</div><button disabled={busy} onClick={() => void revoke(s.email)} className="rounded-lg border border-white/10 px-3 py-2 text-[9px] font-bold text-white/35 hover:border-red-400/20 hover:text-red-300">Revoke</button></div>)}{!staff.length && <p className="p-6 text-center text-xs text-white/25">No staff assignments yet.</p>}</div>
    </div>

    {(message || error) && <div className="border-t border-white/10 px-6 py-4 sm:px-8">{message && <p className="text-xs text-emerald-300">{message}</p>}{error && <p className="text-xs text-red-300">{error}</p>}</div>}
  </section>;
}
