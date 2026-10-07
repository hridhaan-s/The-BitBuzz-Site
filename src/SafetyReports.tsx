import { FormEvent, ReactNode, useCallback, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

/* ──────────────────────────────────────────────────────────────────────────
   Speak up — anonymous safety reports for Ambassador schools
   /ambassadors/:slug/report   → SafetyReportPage (public, anonymous)
   /ambassadors/safety         → SafetyInbox (safety contacts only)
   Dashboard "Safety" tab      → SafetyPanel (counts for the team, contacts
                                 manager for admins, inbox link for contacts)
   Access rules live in supabase/migrations/20261007120000_ambassador_safety_reports.sql
   ────────────────────────────────────────────────────────────────────────── */

export const SAFETY_CATEGORIES: { value: string; label: string; hint: string }[] = [
  { value: "bullying", label: "Bullying", hint: "Being picked on, excluded, hit, threatened or humiliated" },
  { value: "cyberbullying", label: "Cyberbullying", hint: "On WhatsApp, Instagram, games or anywhere online" },
  { value: "harassment", label: "Harassment", hint: "Unwanted comments, touching, messages or attention" },
  { value: "discrimination", label: "Discrimination", hint: "Treated badly because of who you are" },
  { value: "threat_or_violence", label: "Threat or violence", hint: "Fights, weapons, or someone threatening to hurt others" },
  { value: "self_harm_concern", label: "Worried about someone", hint: "You think a student might hurt themselves" },
  { value: "substance", label: "Drugs, alcohol or vaping", hint: "Use or selling on or around campus" },
  { value: "other", label: "Something else", hint: "Anything else that doesn't feel safe or right" },
];
const categoryLabel = (v: string) => SAFETY_CATEGORIES.find((c) => c.value === v)?.label || v;

const STATUS: Record<string, { label: string; tone: string; studentText: string }> = {
  new: { label: "New", tone: "bg-sky-400/15 text-sky-300", studentText: "Received — waiting for a staff member to read it." },
  reviewing: { label: "Reviewing", tone: "bg-amber-400/15 text-amber-300", studentText: "A staff member is looking into it." },
  action_taken: { label: "Action taken", tone: "bg-emerald-400/15 text-emerald-300", studentText: "Staff have taken action." },
  closed: { label: "Closed", tone: "bg-white/10 text-white/60", studentText: "This report has been closed." },
};

const notify = (kind: "report" | "contact", id: string) =>
  fetch("/api/safety-notify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, id }),
    keepalive: true,
  }).catch((e) => console.error("safety-notify failed", e));

const fmt = (d: string) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });

function Helplines({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-2xl border border-red-900/15 bg-red-50 ${compact ? "p-4" : "p-5"} text-[#3b1111]`}>
      <p className="font-semibold">In danger right now? Don't wait for this form.</p>
      <p className="mt-1 text-sm leading-6 text-[#3b1111]/80">
        Tell a teacher or adult you trust, or call{" "}
        <a href="tel:112" className="font-bold underline">
          112
        </a>{" "}
        (emergency) ·{" "}
        <a href="tel:1098" className="font-bold underline">
          1098
        </a>{" "}
        (child helpline) ·{" "}
        <a href="tel:14416" className="font-bold underline">
          14416
        </a>{" "}
        (Tele-MANAS, free mental-health support).
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Public report form
   ══════════════════════════════════════════════════════════════════════════ */

type ReportingStatus = { publication_id: string; profile_name: string; school_name: string; enabled: boolean };

export function SafetyReportPage({ slug }: { slug: string }) {
  const [info, setInfo] = useState<ReportingStatus | null | undefined>(undefined);
  const [mode, setMode] = useState<"report" | "check">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("check") ? "check" : "report",
  );

  useEffect(() => {
    document.title = "Report a concern · BitBuzz";
    supabase.rpc("bitbuzz_safety_reporting_status", { p_slug: slug }).then(({ data, error }) => {
      if (error) return setInfo(null);
      setInfo(((data || []) as ReportingStatus[])[0] || null);
    });
  }, [slug]);

  const quickExit = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#161616]">
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f6f4ef]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-5 sm:px-8">
          <a href={`/ambassadors/${slug}`} className="truncate text-sm text-black/60 hover:text-black">
            ← {info?.profile_name || "Back"}
          </a>
          <button onClick={quickExit} className="shrink-0 rounded-full bg-[#161616] px-4 py-2 text-xs font-bold text-white" title="Leaves this page immediately">
            Quick exit ✕
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-black/50">Speak up · {info?.school_name || "…"}</p>
        <h1 className="mt-3 font-serif text-[clamp(2.4rem,6vw,3.75rem)] font-bold leading-[1] tracking-[-.035em]">Report a concern</h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-black/65">
          Being bullied, or seen something that isn't okay? Tell us. You don't need to give your name.
        </p>

        <div className="mt-8 inline-flex rounded-full border border-black/15 bg-white p-1 text-sm" role="tablist">
          {(["report", "check"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-full px-4 py-2 font-semibold transition ${mode === m ? "bg-[#161616] text-white" : "text-black/60 hover:text-black"}`}
            >
              {m === "report" ? "Make a report" : "Check on a report"}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {info === undefined ? (
            <div className="h-64 animate-pulse rounded-3xl bg-black/[.05]" />
          ) : info === null ? (
            <Notice title="Page not found" body="This publication doesn't exist or isn't public." />
          ) : mode === "check" ? (
            <StatusCheck />
          ) : !info.enabled ? (
            <>
              <Notice
                title="Reporting isn't set up here yet"
                body={`${info.school_name} hasn't added a trusted adult to receive reports, so we can't take one yet — we won't collect a report nobody will read. Please talk to a teacher or counsellor you trust.`}
              />
              <div className="mt-5">
                <Helplines />
              </div>
            </>
          ) : (
            <ReportForm slug={slug} schoolName={info.school_name} />
          )}
        </div>
      </main>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-8">
      <h2 className="font-serif text-2xl font-bold">{title}</h2>
      <p className="mt-2 leading-7 text-black/65">{body}</p>
    </div>
  );
}

function Label({ children, hint, required }: { children: ReactNode; hint?: string; required?: boolean }) {
  return (
    <span className="mb-2 block">
      <span className="text-sm font-semibold">
        {children}
        {required && <span className="text-red-700"> *</span>}
      </span>
      {hint && <span className="mt-0.5 block text-xs text-black/50">{hint}</span>}
    </span>
  );
}

const inputCls =
  "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-black/35 focus:border-black/50 focus:ring-2 focus:ring-black/10";

function ReportForm({ slug, schoolName }: { slug: string; schoolName: string }) {
  const [category, setCategory] = useState("");
  const [details, setDetails] = useState("");
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState("");
  const [ongoing, setOngoing] = useState(false);
  const [urgent, setUrgent] = useState(false);
  const [wantsContact, setWantsContact] = useState(false);
  const [contact, setContact] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!category) return setError("Choose what kind of concern this is.");
    if (details.trim().length < 20) return setError("Tell us a little more — at least a sentence or two.");
    if (website) {
      setCode("XXXX-XXXX-XXXX");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("bitbuzz_submit_safety_report", {
      p_slug: slug,
      p_category: category,
      p_details: details,
      p_location: location || null,
      p_when: when || null,
      p_ongoing: ongoing,
      p_urgent: urgent,
      p_contact: wantsContact ? contact || null : null,
    });
    setBusy(false);
    if (error) return setError(error.message);
    const row = ((data || []) as { report_id: string; tracking_code: string }[])[0];
    if (!row) return setError("Something went wrong. Please try again.");
    notify("report", row.report_id);
    setCode(row.tracking_code);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (code)
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-6 sm:p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-xl text-emerald-700">✓</div>
        <h2 className="mt-5 font-serif text-3xl font-bold">Thank you for speaking up.</h2>
        <p className="mt-3 leading-7 text-black/65">
          Your report has gone privately to the trusted staff at {schoolName}. Only they can read it — not the students who run this publication.
        </p>
        <div className="mt-6 rounded-2xl bg-[#161616] p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-[.14em] text-white/60">Your private tracking code</p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-[.08em]">{code}</p>
          <p className="mt-2 text-sm text-white/65">Save it somewhere private. It's the only way to check on your report — we can't recover it.</p>
          <button
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(code);
                setCopied(true);
              } catch {
                /* ignore */
              }
            }}
            className="mt-4 rounded-full bg-white px-4 py-2 text-xs font-bold text-black"
          >
            {copied ? "Copied ✓" : "Copy code"}
          </button>
        </div>
        <div className="mt-6">
          <Helplines compact />
        </div>
      </div>
    );

  return (
    <form onSubmit={submit} className="space-y-7" noValidate>
      <Helplines />

      <fieldset>
        <legend>
          <Label required>What's this about?</Label>
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {SAFETY_CATEGORIES.map((c) => (
            <label
              key={c.value}
              className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                category === c.value ? "border-black bg-white ring-2 ring-black/10" : "border-black/12 bg-white/60 hover:border-black/30"
              }`}
            >
              <input type="radio" name="category" value={c.value} checked={category === c.value} onChange={() => setCategory(c.value)} className="mt-1 accent-black" />
              <span>
                <span className="block text-sm font-semibold">{c.label}</span>
                <span className="mt-0.5 block text-xs leading-5 text-black/55">{c.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {category === "self_harm_concern" && (
          <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            If you think someone might hurt themselves soon, please also tell a teacher or adult <strong>today</strong>, or call 112. You did the right
            thing by speaking up.
          </p>
        )}
      </fieldset>

      <label className="block">
        <Label required hint="What happened, who was involved (if you're comfortable), and how often. Write as much or as little as you like.">
          Tell us what happened
        </Label>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} maxLength={5000} rows={7} className={`${inputCls} resize-y`} />
        <span className="mt-1 block text-right text-xs text-black/40">{details.length}/5000</span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <Label hint="e.g. bus, canteen, Class 9B group chat">Where?</Label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={200} className={inputCls} />
        </label>
        <label className="block">
          <Label hint="e.g. yesterday, every day since August">When?</Label>
          <input value={when} onChange={(e) => setWhen(e.target.value)} maxLength={120} className={inputCls} />
        </label>
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={ongoing} onChange={(e) => setOngoing(e.target.checked)} className="mt-0.5 h-4 w-4 accent-black" />
          <span>It's still happening</span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="mt-0.5 h-4 w-4 accent-black" />
          <span>
            <strong>This is urgent</strong> — someone could get hurt soon
          </span>
        </label>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-5">
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" checked={wantsContact} onChange={(e) => setWantsContact(e.target.checked)} className="mt-0.5 h-4 w-4 accent-black" />
          <span>
            <strong>I'd like someone to follow up with me</strong>
            <span className="mt-0.5 block text-black/55">Optional. Leave this off to stay completely anonymous.</span>
          </span>
        </label>
        {wantsContact && (
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={200}
            placeholder="Your name and class, or an email"
            className={`${inputCls} mt-4`}
          />
        )}
      </div>

      {/* honeypot: hidden from people, bots fill it */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
        name="website"
      />

      {error && <p className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <div className="flex flex-col gap-3 border-t border-black/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-5 text-black/55">
          Only trusted staff at {schoolName} can read this. We don't record your name, account or device with the report.
        </p>
        <button disabled={busy} className="rounded-full bg-[#161616] px-7 py-3.5 text-sm font-bold text-white disabled:opacity-50">
          {busy ? "Sending…" : "Send report privately"}
        </button>
      </div>
    </form>
  );
}

function StatusCheck() {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ status: string; reporter_message: string | null; created_at: string; updated_at: string } | null | undefined>(
    undefined,
  );
  const check = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { data } = await supabase.rpc("bitbuzz_safety_report_status", { p_code: code.trim() });
    setBusy(false);
    setResult(((data || []) as any[])[0] || null);
  };
  const s = result ? STATUS[result.status] : null;
  return (
    <div className="space-y-5">
      <form onSubmit={check} className="flex flex-col gap-3 rounded-3xl border border-black/10 bg-white p-6 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <Label>Tracking code</Label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX-XXXX"
            autoComplete="off"
            spellCheck={false}
            className={`${inputCls} font-mono tracking-[.08em]`}
          />
        </label>
        <button disabled={busy || code.trim().length < 12} className="rounded-full bg-[#161616] px-6 py-3.5 text-sm font-bold text-white disabled:opacity-40">
          {busy ? "Checking…" : "Check"}
        </button>
      </form>
      {result === null && <Notice title="No report found" body="Check the code and try again. Codes look like 7F3A-91C2-0B4E." />}
      {result && s && (
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <p className="text-xs text-black/50">Sent {fmt(result.created_at)}</p>
          <p className="mt-2 font-serif text-2xl font-bold">{s.label}</p>
          <p className="mt-1 text-black/65">{s.studentText}</p>
          {result.reporter_message && (
            <div className="mt-5 rounded-2xl bg-[#f6f4ef] p-4">
              <p className="text-xs font-semibold uppercase tracking-[.12em] text-black/50">Message from staff</p>
              <p className="mt-2 whitespace-pre-wrap leading-7">{result.reporter_message}</p>
            </div>
          )}
          <p className="mt-4 text-xs text-black/45">Last updated {fmt(result.updated_at)}</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Staff inbox (dark, matches the ambassador dashboard)
   ══════════════════════════════════════════════════════════════════════════ */

type Report = {
  id: string;
  category: string;
  details: string;
  location: string | null;
  happened_when: string | null;
  is_ongoing: boolean;
  is_urgent: boolean;
  reporter_contact: string | null;
  status: string;
  staff_notes: string | null;
  reporter_message: string | null;
  handled_by_email: string | null;
  created_at: string;
  updated_at: string;
};
type SafetyPub = { id: string; slug: string; profile_name: string; school_name: string; open_reports: number };

/** Full-page inbox for safety contacts. Works for staff who aren't on the student team. */
export function SafetyInbox() {
  const [session, setSession] = useState<any>(undefined);
  const [pubs, setPubs] = useState<SafetyPub[] | null>(null);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    document.title = "Safety inbox · BitBuzz";
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase.rpc("bitbuzz_my_safety_publications").then(({ data }) => {
      const list = (data || []) as SafetyPub[];
      setPubs(list);
      setActive((a) => a || list[0]?.id || "");
    });
  }, [session]);

  const pub = pubs?.find((p) => p.id === active);

  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <a href="/ambassadors" className="text-sm font-bold">
            BitBuzz <span className="text-[#ff6a1f]">Safety inbox</span>
          </a>
          {session && (
            <span className="truncate text-xs text-white/50">
              Signed in as <span className="text-white/80">{session.user?.email}</span>
            </span>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        {session === undefined ? null : !session ? (
          <Gate title="Sign in to view reports" body="Use the email address your school registered as a safety contact.">
            <a href="/signup" className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-bold text-black">
              Sign in
            </a>
          </Gate>
        ) : pubs === null ? (
          <div className="h-64 animate-pulse rounded-3xl bg-white/[.04]" />
        ) : pubs.length === 0 ? (
          <Gate
            title="No access"
            body={`${session.user?.email} isn't a safety contact for any school. Reports are only visible to the trusted adults a school has designated — ask the school's BitBuzz admin to add you.`}
          />
        ) : (
          <>
            {pubs.length > 1 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {pubs.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p.id)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold ${active === p.id ? "bg-white text-black" : "border border-white/15 text-white/60"}`}
                  >
                    {p.profile_name} {p.open_reports > 0 && <span className="ml-1 text-[#ff6a1f]">{p.open_reports}</span>}
                  </button>
                ))}
              </div>
            )}
            {pub && <ReportsInbox publicationId={pub.id} title={pub.school_name} slug={pub.slug} />}
          </>
        )}
      </main>
    </div>
  );
}

function Gate({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-serif text-4xl font-bold">{title}</h1>
      <p className="mt-3 leading-7 text-white/60">{body}</p>
      {children}
    </div>
  );
}

const darkInput = "w-full rounded-xl border border-white/12 bg-white/[.04] px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/35";

export function ReportsInbox({ publicationId, title, slug, canManage = false }: { publicationId: string; title: string; slug?: string; canManage?: boolean }) {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "all">("open");

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("bitbuzz_list_safety_reports", { p_publication_id: publicationId });
    if (error) {
      setError(error.message);
      setReports([]);
      return;
    }
    setReports((data || []) as Report[]);
  }, [publicationId]);

  useEffect(() => {
    setReports(null);
    setOpenId(null);
    load();
  }, [load]);

  const visible = (reports || []).filter((r) => filter === "all" || r.status === "new" || r.status === "reviewing");
  const open = reports?.find((r) => r.id === openId) || null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#ff6a1f]">Confidential</p>
          <h2 className="mt-1 font-serif text-3xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-white/55">Only designated safety contacts can see this page.</p>
        </div>
        <div className="flex gap-2">
          {(["open", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-xs font-semibold ${filter === f ? "bg-white text-black" : "border border-white/15 text-white/60"}`}
            >
              {f === "open" ? "Open" : "All"}
            </button>
          ))}
          <button onClick={load} className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/60 hover:text-white">
            Refresh
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <ul className="space-y-2">
          {reports === null ? (
            <li className="h-40 animate-pulse rounded-2xl bg-white/[.04]" />
          ) : visible.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/55">
              {filter === "open" ? "No open reports." : "No reports yet."}
              {slug && (
                <span className="mt-2 block text-xs text-white/40">
                  Students report at bitbuzz.app/ambassadors/{slug}/report
                </span>
              )}
            </li>
          ) : (
            visible.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setOpenId(r.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    openId === r.id ? "border-white/40 bg-white/[.06]" : "border-white/10 bg-white/[.02] hover:border-white/25"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {r.is_urgent && r.status !== "closed" && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Urgent</span>}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS[r.status]?.tone}`}>{STATUS[r.status]?.label}</span>
                    <span className="text-sm font-semibold">{categoryLabel(r.category)}</span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-white/60">{r.details}</p>
                  <p className="mt-2 text-xs text-white/40">{fmt(r.created_at)}</p>
                </button>
              </li>
            ))
          )}
        </ul>
        <div className="lg:sticky lg:top-6 lg:self-start">
          {open ? (
            <ReportDetail key={open.id} report={open} onSaved={load} />
          ) : (
            <div className="hidden rounded-2xl border border-white/10 p-10 text-center text-sm text-white/45 lg:block">Select a report to read it.</div>
          )}
        </div>
      </div>

      <ContactsManager publicationId={publicationId} canManage={canManage} />
    </div>
  );
}

function ReportDetail({ report: r, onSaved }: { report: Report; onSaved: () => void }) {
  const [status, setStatus] = useState(r.status);
  const [notes, setNotes] = useState(r.staff_notes || "");
  const [message, setMessage] = useState(r.reporter_message || "");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState("");
  const save = async () => {
    setBusy(true);
    setSaved("");
    const { error } = await supabase.rpc("bitbuzz_update_safety_report", {
      p_report_id: r.id,
      p_status: status,
      p_staff_notes: notes,
      p_reporter_message: message,
    });
    setBusy(false);
    setSaved(error ? error.message : "Saved ✓");
    if (!error) onSaved();
  };
  return (
    <article className="rounded-2xl border border-white/15 bg-[#0e0e0e] p-6">
      <div className="flex flex-wrap items-center gap-2">
        {r.is_urgent && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Urgent</span>}
        {r.is_ongoing && <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">Ongoing</span>}
        <span className="text-xs text-white/50">{fmt(r.created_at)}</span>
      </div>
      <h3 className="mt-3 font-serif text-2xl font-bold">{categoryLabel(r.category)}</h3>
      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-white/85">{r.details}</p>
      <dl className="mt-5 grid gap-3 border-t border-white/10 pt-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-white/45">Where</dt>
          <dd>{r.location || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-white/45">When</dt>
          <dd>{r.happened_when || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-white/45">Student contact</dt>
          <dd>{r.reporter_contact || "Anonymous — no follow-up details given"}</dd>
        </div>
      </dl>

      <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-white/70">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`${darkInput} bg-[#151515]`}>
            {Object.entries(STATUS).map(([v, s]) => (
              <option key={v} value={v}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-white/70">Internal notes · only safety contacts see these</span>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={5000} className={`${darkInput} resize-y`} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-white/70">Message to the student · shown when they check their tracking code</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="e.g. Thank you for telling us. We're looking into this — you can also come see Ms. Sharma in Room 12."
            className={`${darkInput} resize-y`}
          />
        </label>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-white/45">{r.handled_by_email ? `Last updated by ${r.handled_by_email}` : ""}</span>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-white/60">{saved}</span>}
            <button onClick={save} disabled={busy} className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black disabled:opacity-50">
              {busy ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   Contacts manager + dashboard panel
   ══════════════════════════════════════════════════════════════════════════ */

type Contact = { id: string; email: string; name: string | null; added_by_email: string | null; created_at: string };
type LogRow = { id: string; action: string; contact_email: string; actor_email: string | null; created_at: string };

function ContactsManager({ publicationId, canManage }: { publicationId: string; canManage: boolean }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [log, setLog] = useState<LogRow[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [{ data: c }, { data: l }] = await Promise.all([
      supabase.rpc("bitbuzz_list_safety_contacts", { p_publication_id: publicationId }),
      supabase.rpc("bitbuzz_safety_contact_history", { p_publication_id: publicationId }),
    ]);
    setContacts((c || []) as Contact[]);
    setLog((l || []) as LogRow[]);
  }, [publicationId]);
  useEffect(() => {
    load();
  }, [load]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { data, error } = await supabase.rpc("bitbuzz_add_safety_contact", { p_publication_id: publicationId, p_email: email, p_name: name || null });
    setBusy(false);
    if (error) return setMsg(error.message);
    if (data) notify("contact", data as string);
    setEmail("");
    setName("");
    setConfirm(false);
    setMsg("Added. They've been emailed instructions.");
    load();
  };
  const remove = async (c: Contact) => {
    if (!window.confirm(`Remove ${c.email} as a safety contact? They'll lose access to all reports.`)) return;
    const { data, error } = await supabase.rpc("bitbuzz_remove_safety_contact", { p_contact_id: c.id });
    if (error) return setMsg(error.message);
    if (data) notify("contact", data as string);
    load();
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[.02] p-6">
      <h3 className="font-serif text-xl font-bold">Safety contacts</h3>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-white/55">
        Trusted adults — a counsellor, teacher or principal — who can read reports. Max 5. Every change is logged and emailed to all contacts.
      </p>
      <ul className="mt-4 divide-y divide-white/10 border-y border-white/10">
        {contacts.length === 0 ? (
          <li className="py-4 text-sm text-amber-300">No contacts yet — students can't report until you add one.</li>
        ) : (
          contacts.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="min-w-0">
                <span className="block truncate font-semibold">{c.name || c.email}</span>
                {c.name && <span className="block truncate text-xs text-white/50">{c.email}</span>}
              </span>
              {canManage && (
                <button onClick={() => remove(c)} className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/60 hover:border-red-400/50 hover:text-red-300">
                  Remove
                </button>
              )}
            </li>
          ))
        )}
      </ul>
      {canManage && contacts.length < 5 && (
        <form onSubmit={add} className="mt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Ms. Sharma, Counsellor)" className={darkInput} />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff email" className={darkInput} />
          </div>
          <label className="flex items-start gap-2.5 text-xs leading-5 text-white/65">
            <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-0.5 accent-[#ff6a1f]" />
            This person is an adult staff member, not a student, and the school has agreed they should handle safety reports.
          </label>
          <button disabled={busy || !confirm} className="rounded-full bg-white px-5 py-2.5 text-xs font-bold text-black disabled:opacity-40">
            {busy ? "Adding…" : "Add safety contact"}
          </button>
        </form>
      )}
      {msg && <p className="mt-3 text-xs text-white/70">{msg}</p>}
      {log.length > 0 && (
        <details className="mt-5">
          <summary className="cursor-pointer text-xs font-semibold text-white/55">Change history ({log.length})</summary>
          <ul className="mt-3 space-y-1.5 text-xs text-white/55">
            {log.map((l) => (
              <li key={l.id}>
                {fmt(l.created_at)} — {l.actor_email || "admin"} {l.action} <span className="text-white/80">{l.contact_email}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

type Summary = { total: number; open: number; urgent_open: number; last_30_days: number; contacts: number; is_contact: boolean; can_manage: boolean };

/** Dashboard tab. Students see counts only; admins manage contacts; contacts get the inbox. */
export function SafetyPanel({ publication }: { publication: { id: string; slug: string; school_name: string } }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("bitbuzz_safety_summary", { p_publication_id: publication.id });
    if (error) return setError(error.message);
    setSummary(((data || []) as Summary[])[0] || null);
  }, [publication.id]);
  useEffect(() => {
    setSummary(null);
    setError("");
    load();
  }, [load]);

  const link = `bitbuzz.app/ambassadors/${publication.slug}/report`;

  if (error) return <p className="rounded-2xl border border-white/10 bg-white/[.03] p-4 text-sm text-white/60">Safety reports aren't available yet: {error}</p>;
  if (!summary) return <div className="h-40 animate-pulse rounded-2xl bg-white/[.04]" />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#ff6a1f]">Speak up</p>
        <h2 className="mt-1 font-serif text-3xl font-bold">Safety reports</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
          Students can anonymously report bullying and other concerns. Reports go only to your school's designated safety contacts — the student team sees
          counts, never contents.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          [summary.open, "Open"],
          [summary.urgent_open, "Urgent & open"],
          [summary.last_30_days, "Last 30 days"],
          [summary.total, "All time"],
        ].map(([n, l]) => (
          <div key={String(l)} className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
            <p className="font-serif text-4xl font-bold">{n}</p>
            <p className="mt-1 text-xs text-white/55">{l}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[.02] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Reporting link</p>
          <p className="truncate font-mono text-xs text-white/60">{summary.contacts ? link : "Disabled until a safety contact is added"}</p>
        </div>
        {summary.contacts > 0 && (
          <button
            onClick={() => navigator.clipboard?.writeText(`https://www.${link}`)}
            className="shrink-0 rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/75 hover:text-white"
          >
            Copy link
          </button>
        )}
      </div>

      {summary.is_contact ? (
        <ReportsInbox publicationId={publication.id} title={publication.school_name} slug={publication.slug} canManage={summary.can_manage} />
      ) : summary.can_manage ? (
        <ContactsManager publicationId={publication.id} canManage />
      ) : (
        <p className="rounded-2xl border border-white/10 p-5 text-sm text-white/55">
          {summary.contacts
            ? `${summary.contacts} trusted ${summary.contacts === 1 ? "adult handles" : "adults handle"} these reports.`
            : "Ask your publication's Super Admin to add a counsellor or teacher as a safety contact to switch reporting on."}
        </p>
      )}
    </div>
  );
}