import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

type Profile = { display_name: string; bio: string | null; school: string | null; avatar_url: string | null; role: string };
type Submission = { id: string; headline: string; status: "pending" | "approved" | "rejected"; created_at: string };
type Article = { id: string; title: string; status: "draft" | "published"; created_at: string; view_count: number };

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [tab, setTab] = useState<"activity" | "settings">("activity");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [school, setSchool] = useState("");
  const [bio, setBio] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async (userId: string) => {
    const [{ data: p }, { data: s }, { data: a }] = await Promise.all([
      supabase.from("profiles").select("display_name,bio,school,avatar_url,role").eq("id", userId).single(),
      supabase.from("bitbuzz_submissions").select("id,headline,status,created_at").eq("author_id", userId).order("created_at", { ascending: false }),
      supabase.from("articles").select("id,title,status,created_at,view_count").eq("author_id", userId).order("created_at", { ascending: false }),
    ]);
    if (p) {
      setProfile(p as Profile); setName(p.display_name || ""); setAvatar(p.avatar_url || ""); setSchool(p.school || ""); setBio(p.bio || "");
    }
    setSubmissions((s || []) as Submission[]); setArticles((a || []) as Article[]);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (!data.session) window.location.href = "/signup"; else { setSession(data.session); load(data.session.user.id); } });
  }, []);

  const approved = useMemo(() => submissions.filter(s => s.status === "approved").length, [submissions]);
  const pending = useMemo(() => submissions.filter(s => s.status === "pending").length, [submissions]);
  const published = useMemo(() => articles.filter(a => a.status === "published").length, [articles]);

  const saveProfile = async () => {
    if (!session) return;
    setBusy(true); setMessage(""); setError("");
    const { error: e } = await supabase.from("profiles").update({ display_name: name.trim(), avatar_url: avatar.trim() || null, school: school.trim() || null, bio: bio.trim() || null, updated_at: new Date().toISOString() }).eq("id", session.user.id);
    if (e) setError(e.message); else { setMessage("Profile updated."); await load(session.user.id); }
    setBusy(false);
  };

  const changeEmail = async () => {
    if (!newEmail.trim()) return;
    setBusy(true); setMessage(""); setError("");
    const { error: e } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (e) setError(e.message); else { setMessage("Check your new email for the confirmation link."); setNewEmail(""); }
    setBusy(false);
  };

  const changePassword = async () => {
    if (newPassword.length < 8) return setError("Use at least 8 characters for your new password.");
    setBusy(true); setMessage(""); setError("");
    const { error: e } = await supabase.auth.updateUser({ password: newPassword });
    if (e) setError(e.message); else { setMessage("Password changed."); setNewPassword(""); }
    setBusy(false);
  };

  const signOut = async () => { await supabase.auth.signOut(); window.location.href = "/home"; };
  if (!session || !profile) return <div className="min-h-screen bg-black text-white" />;

  return <div className="min-h-screen bg-black text-white">
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[62px] max-w-[980px] items-center justify-between px-5">
        <a href="/home" className="flex items-center gap-2.5"><img src={LOGO_URL} className="h-8 w-8 rounded-full object-cover"/><span className="font-serif text-xl">BitBuzz</span></a>
        <a href="/home" className="text-xs font-semibold text-white/45 hover:text-white">Back to newsroom</a>
      </div>
    </header>

    <main className="mx-auto max-w-[760px] px-5 py-10 sm:py-14">
      <section className="border-b border-white/10 pb-8">
        <div className="flex items-center gap-5 sm:gap-8">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[.06] text-2xl font-bold sm:h-32 sm:w-32">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="Profile" className="h-full w-full object-cover"/> : (profile.display_name?.[0] || "B").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3"><h1 className="font-serif text-3xl tracking-[-.04em] sm:text-4xl">{profile.display_name}</h1><span className="rounded-full bg-white/[.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-white/45">{profile.role}</span></div>
            <p className="mt-1 text-sm text-white/35">{session.user.email}</p>
            {profile.bio && <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/65">{profile.bio}</p>}
            {profile.school && <p className="mt-2 text-xs text-white/35">{profile.school}</p>}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-white/[.025] p-2">
          <Stat value={articles.length + submissions.length} label="contributions"/><Stat value={published + approved} label="published"/><Stat value={pending} label="pending"/><Stat value={submissions.filter(s => s.status === "rejected").length} label="rejected"/>
        </div>
      </section>

      <div className="mt-6 flex border-b border-white/10"><Tab active={tab === "activity"} onClick={() => setTab("activity")}>Activity</Tab><Tab active={tab === "settings"} onClick={() => setTab("settings")}>Settings</Tab></div>

      {message && <div className="mt-5 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs text-white/65">{message}</div>}
      {error && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-xs text-red-300">{error}</div>}

      {tab === "activity" ? <Activity submissions={submissions} articles={articles} /> : <Settings name={name} setName={setName} avatar={avatar} setAvatar={setAvatar} school={school} setSchool={setSchool} bio={bio} setBio={setBio} newEmail={newEmail} setNewEmail={setNewEmail} newPassword={newPassword} setNewPassword={setNewPassword} saveProfile={saveProfile} changeEmail={changeEmail} changePassword={changePassword} busy={busy} signOut={signOut}/>} 
    </main>
  </div>;
}

function Stat({ value, label }: { value: number; label: string }) { return <div className="py-2 text-center"><p className="font-serif text-xl sm:text-2xl">{value}</p><p className="mt-1 text-[9px] uppercase tracking-[.12em] text-white/30">{label}</p></div>; }
function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button onClick={onClick} className={`flex-1 border-b-2 py-3 text-[10px] font-bold uppercase tracking-[.16em] transition ${active ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"}`}>{children}</button>; }

function Activity({ submissions, articles }: { submissions: Submission[]; articles: Article[] }) {
  return <div className="mt-7 space-y-7">
    <section><div className="flex items-end justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#f5c84b]">Your contributions</p><h2 className="mt-2 font-serif text-3xl">The newsroom.</h2></div><a href="/submit" className="rounded-full bg-white px-4 py-2 text-[10px] font-bold text-black hover:bg-[#f5c84b]">Submit story</a></div>
      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[.025]">
        {articles.length === 0 ? <Empty text="No editorial stories yet."/> : articles.map(a => <div key={a.id} className="flex items-center justify-between gap-4 border-b border-white/10 p-4 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-semibold">{a.title}</p><p className="mt-1 text-[10px] text-white/30">{a.status === "published" ? "Published" : "Draft"} · {a.view_count || 0} views</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold ${a.status === "published" ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-white/35"}`}>{a.status}</span></div>)}
      </div>
    </section>
    <section><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#f5c84b]">Submission review</p><h2 className="mt-2 font-serif text-3xl">Your stories.</h2>
      <div className="mt-4 space-y-2">{submissions.length === 0 ? <Empty text="No submissions yet."/> : submissions.map(s => <div key={s.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{s.headline}</p><p className="mt-1 text-[10px] text-white/30">Submitted {new Date(s.created_at).toLocaleDateString()}</p></div><Status status={s.status}/></div>)}</div>
    </section>
  </div>;
}
function Status({ status }: { status: Submission["status"] }) { const styles = { pending: "bg-amber-400/10 text-amber-300", approved: "bg-emerald-400/10 text-emerald-300", rejected: "bg-red-400/10 text-red-300" }; return <span className={`shrink-0 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.08em] ${styles[status]}`}>{status}</span>; }
function Empty({ text }: { text: string }) { return <div className="p-6 text-center text-xs text-white/30">{text}</div>; }

function Settings(props: any) {
  return <div className="mt-7 space-y-8">
    <section><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#f5c84b]">Profile</p><h2 className="mt-2 font-serif text-3xl">Make it yours.</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Username / name" value={props.name} onChange={props.setName}/><Field label="Profile picture URL" value={props.avatar} onChange={props.setAvatar} placeholder="https://…"/><Field label="School" value={props.school} onChange={props.setSchool}/><Field label="Bio" value={props.bio} onChange={props.setBio}/></div><button disabled={props.busy} onClick={props.saveProfile} className="mt-4 rounded-xl bg-white px-5 py-3 text-xs font-bold text-black hover:bg-[#f5c84b] disabled:opacity-40">Save profile</button></section>
    <section className="border-t border-white/10 pt-8"><p className="text-[9px] font-bold uppercase tracking-[.18em] text-[#f5c84b]">Account</p><h2 className="mt-2 font-serif text-3xl">Security.</h2><div className="mt-5 space-y-4"><Field label="Change email" type="email" value={props.newEmail} onChange={props.setNewEmail} placeholder={"Current: " + "your@email.com"}/><button disabled={props.busy || !props.newEmail} onClick={props.changeEmail} className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-xs font-bold hover:bg-white/10 disabled:opacity-30">Change email</button><Field label="New password" type="password" value={props.newPassword} onChange={props.setNewPassword} placeholder="At least 8 characters"/><button disabled={props.busy || !props.newPassword} onClick={props.changePassword} className="rounded-xl border border-white/10 bg-white/[.05] px-4 py-3 text-xs font-bold hover:bg-white/10 disabled:opacity-30">Change password</button></div></section>
    <section className="border-t border-white/10 pt-8"><button onClick={props.signOut} className="w-full rounded-xl border border-red-400/20 bg-red-400/[.05] px-4 py-3.5 text-xs font-bold text-red-300 transition hover:bg-red-400/10">Sign out</button></section>
  </div>;
}
function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) { return <label className="block"><span className="mb-2 block text-[9px] font-bold uppercase tracking-[.14em] text-white/35">{label}</span><input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-white/[.035] px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-white/25"/></label>; }
