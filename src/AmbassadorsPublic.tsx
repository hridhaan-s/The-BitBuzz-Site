import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "./lib/supabase";
import { Markdown } from "./Markdown";

/* ──────────────────────────────────────────────────────────────────────────
   BitBuzz Ambassadors — public pages
   /ambassadors                 → directory + apply modal (dark)
   /ambassadors/:slug           → a publication's front page (light)
   /ambassadors/:slug/:story    → story reader (light)
   ────────────────────────────────────────────────────────────────────────── */

const LOGO_URL = "https://cdn.hackclub.com/01a10ac6-566f-7190-9790-e4629a0822ea/bitbuzz-pixel-oxblood-mint.svg";
const ORANGE = "#ff6a1f";
const PUBLICATION_FIELDS =
  "id,slug,profile_name,school_name,description,logo_url,hero,website_url,instagram_url,linkedin_url,contact_email,organization_type,location,tags,featured,status";

type Publication = {
  id: string;
  slug: string;
  profile_name: string;
  school_name: string;
  description: string | null;
  logo_url: string | null;
  hero: any;
  website_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  contact_email: string | null;
  organization_type: string;
  location: string | null;
  tags: string[];
  featured: boolean;
  status: string;
};
type Member = {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
  bio: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
};
type Story = {
  id: string;
  slug: string;
  headline: string;
  description: string | null;
  body: string;
  author_name: string | null;
  category: string | null;
  reading_time: number | null;
  cover_url: string | null;
  published_at: string | null;
};

/* ── helpers ─────────────────────────────────────────────────────────────── */

const cleanSlug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

/** Markdown → plain text, for card excerpts. */
const plain = (md: string | null | undefined) =>
  (md || "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, "")
    .replace(/(\*\*|__|~~|`)/g, "")
    .replace(/(^|[\s(])_([^_\n]+)_(?=[\s).,!?]|$)/g, "$1$2")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Cut at a word boundary instead of mid-word. */
/** Descriptions are often a hard-cut copy of the body; fall back to the body so excerpts end cleanly. */
const summary = (s: { description: string | null; body: string }) => {
  const d = plain(s.description), b = plain(s.body);
  return !d || b.startsWith(d.slice(0, 60)) ? b : d;
};

const excerpt = (text: string, max = 160) => {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).replace(/[\s,.;:–-]+$/, "") + "…";
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "✦";

const fmtDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

/** Black or white, whichever reads better on the accent colour. */
const textOn = (hex: string) => {
  const m = hex.replace("#", "").match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return "#000";
  const [r, g, b] = m.slice(1).map((x) => {
    const c = parseInt(x, 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#000" : "#fff";
};

const storyHref = (pub: string, story: string) => `/ambassadors/${pub}/${story}`;

function usePageTitle(title: string) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}

/* ── shared bits ─────────────────────────────────────────────────────────── */

function Avatar({
  src,
  name,
  className = "",
  fallbackClass = "",
}: {
  src: string | null | undefined;
  name: string;
  className?: string;
  fallbackClass?: string;
}) {
  const [broken, setBroken] = useState(false);
  if (src && !broken)
    return <img src={src} alt="" loading="lazy" onError={() => setBroken(true)} className={`object-cover ${className}`} />;
  return (
    <span aria-hidden className={`flex items-center justify-center font-serif font-bold ${className} ${fallbackClass}`}>
      {initials(name)}
    </span>
  );
}

function Eyebrow({ children, color, className = "" }: { children: ReactNode; color?: string; className?: string }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[.16em] ${className}`} style={color ? { color } : undefined}>
      {children}
    </p>
  );
}

const ring = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/* ══════════════════════════════════════════════════════════════════════════
   Apply modal
   ══════════════════════════════════════════════════════════════════════════ */

const emptyForm = {
  profileName: "",
  schoolName: "",
  email: "",
  description: "",
  type: "School",
  location: "",
  website: "",
  instagram: "",
  linkedin: "",
  logo: "",
  tags: "",
};
const ORG_TYPES = ["School", "Club", "College", "Society", "Non-profit", "Other"];

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  multiline = false,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  type?: string;
  hint?: string;
}) {
  const cls =
    "w-full rounded-xl border border-white/12 bg-white/[.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#ff6a1f]/70 focus:bg-white/[.06]";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-white/70">
        {label}
        {required && <span className="text-[#ff6a1f]"> *</span>}
      </span>
      {multiline ? (
        <textarea
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`min-h-28 resize-y ${cls}`}
        />
      ) : (
        <input type={type} required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      )}
      {hint && <span className="mt-1.5 block text-[11px] text-white/40">{hint}</span>}
    </label>
  );
}

export function AmbassadorApplyModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const first = useRef<HTMLDivElement>(null);
  const set = (k: keyof typeof emptyForm) => (v: string) => setForm((x) => ({ ...x, [k]: v }));
  const slug = cleanSlug(form.profileName);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    first.current?.querySelector("input")?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    if (!slug) {
      setError("Choose a publication name with at least one letter or number.");
      setBusy(false);
      return;
    }
    const tags = form.tags
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 10);
    const { error } = await supabase.from("bitbuzz_publication_applications").insert({
      profile_name: form.profileName.trim(),
      school_name: form.schoolName.trim(),
      slug,
      description: form.description.trim() || null,
      super_admin_email: form.email.trim().toLowerCase(),
      contact_email: form.email.trim().toLowerCase(),
      logo_url: form.logo.trim() || null,
      website_url: form.website.trim() || null,
      instagram_url: form.instagram.trim() || null,
      linkedin_url: form.linkedin.trim() || null,
      organization_type: form.type,      location: form.location.trim() || null,
      tags,
      status: "pending",
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-title"
        className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-[#0d0d0d] shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-5 border-b border-white/10 px-6 py-5 sm:px-8">
          <div>
            <Eyebrow color={ORANGE}>Join the network</Eyebrow>
            <h2 id="apply-title" className="mt-1.5 font-serif text-3xl font-bold tracking-[-.03em] sm:text-4xl">
              Bring your publication to BitBuzz
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-lg text-white/70 hover:bg-white/10 ${ring} focus-visible:ring-white/50 focus-visible:ring-offset-black`}
          >
            ×
          </button>
        </div>

        {done ? (
          <div className="px-6 py-16 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl text-emerald-300">✓</div>
            <h3 className="mt-5 font-serif text-3xl font-bold">Application received</h3>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
              We'll review it and email <strong className="text-white">{form.email}</strong> once{" "}
              <strong className="text-white">{form.profileName}</strong> is live.
            </p>
            <button onClick={onClose} className="mt-8 rounded-full bg-white px-6 py-3 text-sm font-bold text-black">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
            <div ref={first} className="flex-1 space-y-5 overflow-y-auto px-6 py-6 sm:px-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Publication name"
                  value={form.profileName}
                  onChange={set("profileName")}
                  placeholder="The School Wire"
                  required
                  hint={slug ? `Your page: bitbuzz.app/ambassadors/${slug}` : undefined}
                />
                <Field label="School / organisation" value={form.schoolName} onChange={set("schoolName")} placeholder="Shri Ram Global School" required />
                <Field label="Your email" type="email" value={form.email} onChange={set("email")} placeholder="editor@school.edu" required />
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-white/70">Type</span>
                  <select
                    value={form.type}
                    onChange={(e) => set("type")(e.target.value)}
                    className="w-full rounded-xl border border-white/12 bg-[#151515] px-4 py-3 text-sm text-white outline-none focus:border-[#ff6a1f]/70"
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
              </div>
              <Field label="Location" value={form.location} onChange={set("location")} placeholder="Greater Noida, India" />
              <Field
                label="What do you publish?"
                value={form.description}
                onChange={set("description")}
                placeholder="School news, student research, events, creative writing…"
                multiline
              />
              <details className="group rounded-2xl border border-white/10 bg-white/[.02]">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-white/75">
                  Links, logo & tags <span className="text-xs font-normal text-white/40">optional</span>
                </summary>
                <div className="grid gap-4 border-t border-white/10 p-4 sm:grid-cols-2">
                  <Field label="Website" type="url" value={form.website} onChange={set("website")} placeholder="https://…" />
                  <Field label="Instagram" type="url" value={form.instagram} onChange={set("instagram")} placeholder="https://instagram.com/…" />
                  <Field label="LinkedIn" type="url" value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/…" />
                  <Field label="Logo URL" type="url" value={form.logo} onChange={set("logo")} placeholder="https://…/logo.png" />
                  <div className="sm:col-span-2">
                    <Field label="Tags" value={form.tags} onChange={set("tags")} placeholder="science, arts, student media" hint="Comma-separated, up to 10." />
                  </div>
                </div>
              </details>
              {error && <p className="rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-white/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <p className="text-xs text-white/45">Reviewed by the BitBuzz team before going public.</p>
              <button
                disabled={busy}
                className="rounded-full bg-[#ff6a1f] px-7 py-3 text-sm font-bold text-black transition hover:brightness-110 disabled:opacity-50"
              >
                {busy ? "Sending…" : "Submit application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   /ambassadors — directory
   ══════════════════════════════════════════════════════════════════════════ */

export default function AmbassadorsPublicHome() {
  const [items, setItems] = useState<Publication[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [apply, setApply] = useState(false);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  usePageTitle("Ambassadors · BitBuzz");

  useEffect(() => {
    let live = true;
    (async () => {
      const { data } = await supabase
        .from("bitbuzz_publications")
        .select(PUBLICATION_FIELDS)
        .eq("status", "active")
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });
      const pubs = (data || []) as Publication[];
      if (!live) return;
      setItems(pubs);
      setLoading(false);
      if (!pubs.length) return;
      const { data: arts } = await supabase
        .from("bitbuzz_articles")
        .select("publication_id")
        .in(
          "publication_id",
          pubs.map((p) => p.id),
        )
        .eq("status", "published");
      if (!live || !arts) return;
      const c: Record<string, number> = Object.fromEntries(pubs.map((p) => [p.id, 0]));
      for (const a of arts as { publication_id: string }[]) c[a.publication_id] = (c[a.publication_id] || 0) + 1;
      setCounts(c);
    })();
    return () => {
      live = false;
    };
  }, []);

  const types = ["All", ...Array.from(new Set(items.map((x) => x.organization_type).filter(Boolean)))];
  const q = query.trim().toLowerCase();
  const filtered = items.filter(
    (p) =>
      (filter === "All" || p.organization_type === filter) &&
      (!q || [p.profile_name, p.school_name, p.location, p.description, ...(p.tags || [])].join(" ").toLowerCase().includes(q)),
  );
  const totalStories = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#080808] text-white selection:bg-[#ff6a1f] selection:text-black">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080808]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <a href="/ambassadors" className={`flex items-center gap-2.5 rounded-lg ${ring} focus-visible:ring-white/40 focus-visible:ring-offset-black`}>
            <img src={LOGO_URL} alt="" className="h-8 w-8 rounded-lg" />
            <span className="text-sm font-bold tracking-tight">
              BitBuzz <span className="text-[#ff6a1f]">Ambassadors</span>
            </span>
          </a>
          <nav className="flex items-center gap-1 text-sm">
            <a href="/home" className="hidden rounded-full px-3 py-2 text-white/65 hover:text-white sm:block">
              Read BitBuzz
            </a>
            <a href="/ambassadors/dashboard" className="rounded-full px-3 py-2 text-white/65 hover:text-white">
              Sign in
            </a>
            <button onClick={() => setApply(true)} className="ml-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-[#ff6a1f]">
              Apply
            </button>
          </nav>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-[#ff6a1f]/15 blur-[110px]" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <Eyebrow color={ORANGE}>For student publications ✦</Eyebrow>
              <h1 className="mt-4 font-serif text-[clamp(2.75rem,7vw,5.5rem)] font-bold leading-[.92] tracking-[-.045em]">
                Your school's newsroom,
                <span className="text-white/45"> on BitBuzz.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-white/65 sm:text-lg">
                A free home for school and club publications: your own page, a team, stories, a magazine and subscribers.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => setApply(true)}
                  className={`rounded-full bg-[#ff6a1f] px-6 py-3 text-sm font-bold text-black transition hover:brightness-110 ${ring} focus-visible:ring-[#ff6a1f] focus-visible:ring-offset-black`}
                >
                  Become an Ambassador
                </button>
                <a href="#network" className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white/80 hover:border-white/40">
                  Browse publications
                </a>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3">
              {[
                [loading ? "–" : items.length, items.length === 1 ? "publication" : "publications"],
                [loading ? "–" : totalStories, totalStories === 1 ? "story published" : "stories published"],
              ].map(([n, l]) => (
                <div key={String(l)} className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-serif text-4xl font-bold sm:text-5xl">{n}</dd>
                  <p className="mt-1 text-xs text-white/50">{l}</p>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* directory */}
        <section id="network" className="scroll-mt-16">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Eyebrow color={ORANGE}>The network</Eyebrow>
                <h2 className="mt-2 font-serif text-4xl font-bold tracking-[-.035em] sm:text-5xl">Publications</h2>
              </div>
              <div className="flex flex-col gap-3 sm:items-end">
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, school, city…"
                  aria-label="Search publications"
                  className="w-full rounded-full border border-white/15 bg-white/[.04] px-4 py-2.5 text-sm outline-none placeholder:text-white/35 focus:border-white/40 sm:w-72"
                />
                {types.length > 2 && (
                  <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by type">
                    {types.map((t) => (
                      <button
                        key={t}                        onClick={() => setFilter(t)}
                        aria-pressed={filter === t}
                        className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                          filter === t ? "bg-white text-black" : "border border-white/15 text-white/60 hover:text-white"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[.03]" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-10 rounded-3xl border border-dashed border-white/15 p-12 text-center">
                <p className="font-serif text-2xl font-bold">{items.length ? "No publications match." : "You're early."}</p>
                <p className="mt-2 text-sm text-white/50">
                  {items.length ? "Try a different search." : "Be one of the first communities here."}
                </p>
              </div>
            ) : (
              <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
                  <PublicationCard key={p.id} publication={p} stories={counts[p.id]} />
                ))}
                <button
                  onClick={() => setApply(true)}
                  className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 p-6 text-center text-white/55 transition hover:border-[#ff6a1f]/60 hover:text-white"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full border border-current text-2xl">+</span>
                  <span className="mt-4 font-serif text-xl font-bold">Add your publication</span>
                  <span className="mt-1 text-xs">Takes about 2 minutes</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* how it works */}
        <section className="border-t border-white/10 bg-[#0c0c0c]">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
            <Eyebrow color={ORANGE}>How it works</Eyebrow>
            <h2 className="mt-2 font-serif text-4xl font-bold tracking-[-.035em] sm:text-5xl">Three steps to a front page.</h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                ["Apply", "Tell us about your school or club. It takes two minutes and costs nothing."],
                ["Set up your page", "Once approved, add your logo, accent colour, team and links from the dashboard."],
                ["Publish & grow", "Post stories, release a magazine, accept student submissions and collect subscribers."],
              ].map(([t, d], i) => (
                <li key={t} className="rounded-3xl border border-white/10 bg-white/[.02] p-6 sm:p-7">
                  <span className="font-serif text-sm font-bold text-[#ff6a1f]">0{i + 1}</span>
                  <h3 className="mt-6 font-serif text-2xl font-bold">{t}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">{d}</p>
                </li>
              ))}
            </ol>
            <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-3xl border border-[#ff6a1f]/30 bg-[#ff6a1f]/[.06] p-6 sm:flex-row sm:items-center sm:p-8">
              <p className="font-serif text-2xl font-bold sm:text-3xl">Give your community a front page.</p>
              <button onClick={() => setApply(true)} className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-bold text-black hover:bg-[#ff6a1f]">
                Start an application
              </button>
            </div>
          </div>
        </section>
      </main>
      {apply && <AmbassadorApplyModal onClose={() => setApply(false)} />}
    </div>
  );
}

function PublicationCard({ publication: p, stories }: { publication: Publication; stories?: number }) {
  const accent = p.hero?.accent_color || ORANGE;
  const meta = [p.organization_type, p.location].filter(Boolean).join(" · ");
  return (
    <a
      href={`/ambassadors/${p.slug}`}
      className={`group flex flex-col rounded-3xl border border-white/10 bg-[#0e0e0e] p-6 transition hover:-translate-y-0.5 hover:border-white/25 ${ring} focus-visible:ring-white/50 focus-visible:ring-offset-black`}
    >
      <div className="flex items-start justify-between gap-3">
        <Avatar
          src={p.logo_url}
          name={p.profile_name}
          className="h-14 w-14 rounded-2xl border border-white/10 bg-white text-lg"
          fallbackClass="!bg-white/[.06] text-white/70"
        />
        {p.featured && (
          <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.12em]" style={{ background: accent, color: textOn(accent) }}>
            Featured
          </span>
        )}
      </div>
      <h3 className="mt-5 font-serif text-2xl font-bold leading-tight tracking-[-.02em] group-hover:underline group-hover:decoration-white/30 group-hover:underline-offset-4">
        {p.profile_name}
      </h3>
      <p className="mt-1 text-sm text-white/55">{p.school_name}</p>
      {meta && <p className="mt-0.5 text-xs text-white/40">{meta}</p>}
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/60">{excerpt(plain(p.description), 180) || "A BitBuzz Ambassador publication."}</p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-xs">
        <div className="flex min-w-0 flex-wrap gap-1.5">
          {(p.tags || []).slice(0, 2).map((tag) => (
            <span key={tag} className="truncate rounded-full border border-white/12 px-2.5 py-1 text-white/50">
              {tag}
            </span>
          ))}
        </div>
        <span className="shrink-0 text-white/50">
          {stories != null ? `${stories} ${stories === 1 ? "story" : "stories"}` : ""} <span className="ml-1 text-white/70 transition group-hover:text-[#ff6a1f]">→</span>
        </span>
      </div>
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   /ambassadors/:slug(/:story) — publication front page + reader
   ══════════════════════════════════════════════════════════════════════════ */

const LIGHT_PROSE = `.amb-prose .bb-markdown{font-family:Newsreader,ui-serif,Georgia,serif;font-size:20px;line-height:1.75;color:#2a2a2a}
.amb-prose .bb-markdown p{margin:0 0 1.15em}
.amb-prose .bb-markdown h1,.amb-prose .bb-markdown h2,.amb-prose .bb-markdown h3{color:#111;font-family:Newsreader,ui-serif,Georgia,serif;letter-spacing:-.02em}
.amb-prose .bb-markdown strong{color:#111}.amb-prose .bb-markdown em{color:inherit}
.amb-prose .bb-markdown a{color:#111;text-decoration-color:rgba(0,0,0,.35)}
.amb-prose .bb-markdown blockquote{border-left-color:var(--accent);color:#555}
.amb-prose .bb-markdown hr{border-top-color:rgba(0,0,0,.12)}
.amb-prose .bb-markdown code{background:#efece6;border-color:rgba(0,0,0,.1);color:#111}
.amb-prose .bb-markdown pre{background:#efece6;border-color:rgba(0,0,0,.1)}
.amb-prose .bb-markdown img{border-radius:12px;margin:1.5em 0}
@media (max-width:640px){.amb-prose .bb-markdown{font-size:18px}}`;

type LoadState = "loading" | "missing" | "ready";

export function AmbassadorOrganizationPage({ slug, storySlug }: { slug: string; storySlug?: string }) {
  const [state, setState] = useState<LoadState>("loading");
  const [publication, setPublication] = useState<Publication | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let live = true;
    setState("loading");
    (async () => {
      const { data: p } = await supabase.from("bitbuzz_publications").select(PUBLICATION_FIELDS).eq("slug", slug).eq("status", "active").maybeSingle();
      if (!live) return;
      if (!p) {
        setPublication(null);
        setState("missing");
        return;
      }
      const [{ data: m }, { data: a }] = await Promise.all([
        supabase.rpc("bitbuzz_public_ambassadors", { target_publication: p.id }),
        supabase
          .from("bitbuzz_articles")
          .select("id,slug,headline,description,body,author_name,category,reading_time,cover_url,published_at")
          .eq("publication_id", p.id)
          .eq("status", "published")
          .order("published_at", { ascending: false }),
      ]);
      if (!live) return;
      setPublication(p as Publication);
      setMembers((m || []) as Member[]);
      setStories((a || []) as Story[]);
      setState("ready");
    })();
    return () => {
      live = false;
    };
  }, [slug]);

  const story = storySlug ? stories.find((x) => x.slug === storySlug) || null : null;
  usePageTitle(publication ? (story ? `${story.headline} · ${publication.profile_name}` : `${publication.profile_name} · BitBuzz`) : "BitBuzz Ambassadors");

  useEffect(() => {
    if (storySlug) window.scrollTo(0, 0);
  }, [storySlug]);

  if (state === "loading")
    return (
      <div className="min-h-screen bg-[#f6f4ef]">
        <div className="h-16 border-b border-black/10" />
        <div className="mx-auto max-w-6xl animate-pulse px-5 py-16 sm:px-8">
          <div className="h-4 w-32 rounded bg-black/10" />
          <div className="mt-6 h-16 w-2/3 rounded bg-black/10" />
          <div className="mt-4 h-4 w-1/3 rounded bg-black/10" />
          <div className="mt-14 h-72 rounded-3xl bg-black/[.06]" />
        </div>
      </div>
    );

  if (state === "missing" || !publication)
    return (
      <NotFound
        title="Publication not found"
        body="This page may have moved, or the publication isn't public yet."
        href="/ambassadors"
        cta="Browse all publications"
      />
    );

  const accent: string = publication.hero?.accent_color || ORANGE;
  const onAccent = textOn(accent);

  return (
    <div className="min-h-screen bg-[#f6f4ef] text-[#161616] selection:text-white" style={{ ["--accent" as any]: accent }}>
      <style>{`.amb-sel ::selection{background:${accent};color:${onAccent}}`}</style>
      <OrgHeader publication={publication} accent={accent} onAccent={onAccent} inStory={!!storySlug} />
      <div className="amb-sel">
        {storySlug ? (
          story ? (
            <StoryView publication={publication} story={story} stories={stories} accent={accent} onAccent={onAccent} />
          ) : (
            <NotFound
              light
              title="Story not found"
              body={`It may have been unpublished. There's more to read from ${publication.profile_name}.`}
              href={`/ambassadors/${publication.slug}`}
              cta={`Back to ${publication.profile_name}`}
            />
          )
        ) : (
          <FrontPage
            publication={publication}
            members={members}
            stories={stories}
            accent={accent}
            onAccent={onAccent}
            query={query}
            setQuery={setQuery}
            category={category}
            setCategory={setCategory}
          />
        )}
      </div>
      <footer className="border-t border-black/10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 px-5 py-8 text-xs text-black/55 sm:flex-row sm:px-8">
          <span>
            © {new Date().getFullYear()} {publication.profile_name} · {publication.school_name}
          </span>
          <a href="/ambassadors" className="hover:text-black">
            Part of the BitBuzz Ambassadors network ↗
          </a>
        </div>
      </footer>
    </div>
  );
}

function NotFound({ title, body, href, cta, light = false }: { title: string; body: string; href: string; cta: string; light?: boolean }) {
  return (
    <div className={`${light ? "" : "min-h-screen"} bg-[#f6f4ef] px-5 py-28 text-center text-[#161616]`}>
      <p className="font-serif text-6xl text-black/15">✦</p>
      <h1 className="mt-6 font-serif text-4xl font-bold tracking-[-.03em] sm:text-5xl">{title}</h1>      <p className="mx-auto mt-3 max-w-md text-black/60">{body}</p>
      <a href={href} className="mt-8 inline-block rounded-full bg-[#161616] px-6 py-3 text-sm font-bold text-white">
        {cta}
      </a>
    </div>
  );
}

function OrgHeader({ publication: p, accent, onAccent, inStory }: { publication: Publication; accent: string; onAccent: string; inStory: boolean }) {
  const base = `/ambassadors/${p.slug}`;
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-[#f6f4ef]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 sm:px-8">
        <a href={base} className={`flex min-w-0 items-center gap-2.5 rounded-lg ${ring} focus-visible:ring-black/40 focus-visible:ring-offset-[#f6f4ef]`}>
          <Avatar
            src={p.logo_url}
            name={p.profile_name}
            className="h-9 w-9 shrink-0 rounded-full border border-black/10 bg-white text-sm"
            fallbackClass="!bg-[#161616] text-white"
          />
          <span className="truncate font-serif text-lg font-bold tracking-[-.02em]">{p.profile_name}</span>
        </a>
        <nav className="hidden items-center gap-6 text-sm text-black/60 md:flex">
          <a className="hover:text-black" href={inStory ? `${base}#stories` : "#stories"}>
            Stories
          </a>
          <a className="hover:text-black" href={inStory ? `${base}#team` : "#team"}>
            Team
          </a>
          <a className="hover:text-black" href={`${base}/magazine`}>
            Magazine
          </a>
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          <a href={`${base}/magazine`} className="rounded-full border border-black/15 px-3.5 py-2 text-xs font-semibold md:hidden">
            Magazine
          </a>
          <a
            href={`${base}/submit`}
            className={`rounded-full px-4 py-2 text-xs font-bold transition hover:brightness-110 ${ring}`}
            style={{ background: accent, color: onAccent }}
          >
            Submit<span className="hidden sm:inline"> your work</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function FrontPage({
  publication: p,
  members,
  stories,
  accent,
  onAccent,
  query,
  setQuery,
  category,
  setCategory,
}: {
  publication: Publication;
  members: Member[];
  stories: Story[];
  accent: string;
  onAccent: string;
  query: string;
  setQuery: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
}) {
  const heroImage: string | undefined = p.hero?.header_image;
  const categories = useMemo(() => ["All", ...Array.from(new Set(stories.map((s) => s.category).filter(Boolean) as string[]))], [stories]);
  const q = query.trim().toLowerCase();
  const filtering = q !== "" || category !== "All";
  const filtered = stories.filter(
    (s) =>
      (category === "All" || s.category === category) &&
      (!q || [s.headline, s.description, s.body, s.category, s.author_name].join(" ").toLowerCase().includes(q)),
  );
  const [lead, ...rest] = filtered;
  const showTools = stories.length > 4 || categories.length > 2;

  return (
    <main>
      {/* masthead */}
      <section className="border-b border-black/10">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-14">
          {heroImage && (
            <div className="mb-8 aspect-[3/1] overflow-hidden rounded-3xl bg-black/5 sm:mb-10">
              <img src={heroImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full px-3 py-1 font-bold uppercase tracking-[.12em]" style={{ background: accent, color: onAccent }}>
              {p.organization_type || "Publication"}
            </span>
            {p.location && <span className="rounded-full border border-black/15 px-3 py-1 text-black/65">{p.location}</span>}
          </div>
          <h1 className="mt-5 max-w-4xl font-serif text-[clamp(2.6rem,7vw,5.25rem)] font-bold leading-[.95] tracking-[-.04em]">
            {p.hero?.headline || p.profile_name}
          </h1>
          <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-base text-black/60">
              {p.school_name}
              {stories[0]?.published_at && <> · Last updated {fmtDate(stories[0].published_at)}</>}
            </p>
            <dl className="flex gap-8">
              {[
                [stories.length, stories.length === 1 ? "Story" : "Stories"],
                [members.length, members.length === 1 ? "Member" : "Members"],
              ].map(([n, l]) => (
                <div key={String(l)}>
                  <dd className="font-serif text-3xl font-bold leading-none">{n}</dd>
                  <dt className="mt-1 text-xs text-black/55">{l}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* stories + sidebar */}
      <section id="stories" className="scroll-mt-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <div className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-serif text-3xl font-bold tracking-[-.03em] sm:text-4xl">Latest stories</h2>
              {showTools && (
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search stories…"
                  aria-label="Search stories"
                  className="w-full rounded-full border border-black/15 bg-white px-4 py-2 text-sm outline-none placeholder:text-black/35 focus:border-black/40 sm:w-60"
                />
              )}
            </div>
            {categories.length > 2 && (
              <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Filter by category">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    aria-pressed={category === c}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      category === c ? "bg-[#161616] text-white" : "border border-black/15 text-black/60 hover:text-black"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}

            {stories.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-dashed border-black/20 p-10 text-center">
                <p className="font-serif text-2xl font-bold">No stories yet.</p>
                <p className="mt-2 text-sm text-black/60">Got something to say? Be the first byline here.</p>
                <a
                  href={`/ambassadors/${p.slug}/submit`}
                  className="mt-6 inline-block rounded-full px-5 py-2.5 text-sm font-bold"
                  style={{ background: accent, color: onAccent }}
                >
                  Submit a story
                </a>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center text-black/55">
                No stories match.{" "}
                <button
                  onClick={() => {
                    setQuery("");
                    setCategory("All");
                  }}
                  className="font-semibold text-black underline underline-offset-4"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                {lead && <LeadStory pub={p.slug} story={lead} accent={accent} label={filtering ? "Top result" : "Latest"} />}
                {rest.length > 0 && (
                  <ul className="mt-2 divide-y divide-black/10">
                    {rest.map((s) => (
                      <li key={s.id}>
                        <StoryRow pub={p.slug} story={s} accent={accent} />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div id="about" className="scroll-mt-20 rounded-3xl border border-black/10 bg-white p-6">
              <Eyebrow color={accent}>About</Eyebrow>
              <p className="mt-3 text-[15px] leading-7 text-black/70">{p.description || "A community publication sharing news, ideas and stories."}</p>
              {(p.tags || []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-black/[.05] px-2.5 py-1 text-xs text-black/60">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {(p.website_url || p.instagram_url || p.linkedin_url || p.contact_email) && (
                <ul className="mt-5 space-y-1 border-t border-black/10 pt-4 text-sm">
                  {[
                    ["Website", p.website_url],
                    ["Instagram", p.instagram_url],
                    ["LinkedIn", p.linkedin_url],
                    ["Email", p.contact_email ? `mailto:${p.contact_email}` : null],
                  ]
                    .filter(([, href]) => href)
                    .map(([label, href]) => (
                      <li key={label}>
                        <a
                          href={href!}
                          target={label === "Email" ? undefined : "_blank"}
                          rel="noreferrer"
                          className="flex items-center justify-between rounded-lg py-1.5 text-black/70 hover:text-black"
                        >
                          {label} <span className="text-black/35">↗</span>
                        </a>
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <Subscribe publication={p} accent={accent} onAccent={onAccent} />
          </aside>
        </div>
      </section>

      {/* team */}
      {members.length > 0 && (
        <section id="team" className="scroll-mt-16 border-t border-black/10 bg-[#eeebe4]">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl font-bold tracking-[-.03em] sm:text-4xl">The team</h2>
              <span className="text-sm text-black/55">
                {members.length} {members.length === 1 ? "person" : "people"}
              </span>
            </div>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {members.map((m) => (
                <li key={m.id} className="flex flex-col rounded-2xl border border-black/10 bg-white p-5">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={m.photo_url}
                      name={m.name}
                      className="h-12 w-12 shrink-0 rounded-full text-base"
                      fallbackClass="!bg-black/[.07] text-black/70"
                    />
                    <div className="min-w-0">                      <h3 className="truncate font-semibold">{m.name}</h3>
                      <p className="text-xs capitalize text-black/55">{m.role?.toLowerCase()}</p>
                    </div>
                  </div>
                  {m.bio && <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/60">{m.bio}</p>}
                  {(m.instagram_url || m.linkedin_url || m.website_url) && (
                    <div className="mt-auto flex gap-3 pt-3 text-xs font-semibold text-black/55">
                      {m.instagram_url && (
                        <a href={m.instagram_url} target="_blank" rel="noreferrer" className="hover:text-black">
                          Instagram
                        </a>
                      )}
                      {m.linkedin_url && (
                        <a href={m.linkedin_url} target="_blank" rel="noreferrer" className="hover:text-black">
                          LinkedIn
                        </a>
                      )}
                      {m.website_url && (
                        <a href={m.website_url} target="_blank" rel="noreferrer" className="hover:text-black">
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}

function StoryMeta({ story, accent }: { story: Story; accent: string }) {
  return (
    <p className="text-xs font-semibold">
      <span className="uppercase tracking-[.12em]" style={{ color: accent }}>
        {story.category || "News"}
      </span>
      {story.published_at && <span className="text-black/50"> · {fmtDate(story.published_at)}</span>}
    </p>
  );
}

function CoverOrPlaceholder({ story, accent, className, small = false }: { story: Story; accent: string; className: string; small?: boolean }) {
  const [broken, setBroken] = useState(false);
  if (story.cover_url && !broken)
    return (
      <img
        src={story.cover_url}
        alt=""
        loading="lazy"
        onError={() => setBroken(true)}
        className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${className}`}
      />
    );
  return (
    <div
      className={`flex h-full w-full items-end font-serif font-bold leading-tight text-black/70 ${small ? "p-2.5 text-sm" : "p-5 text-2xl"} ${className}`}
      style={{ background: `linear-gradient(135deg, ${accent}26, ${accent}0d)` }}
    >
      <span className="line-clamp-3">{story.category || "Story"}</span>
    </div>
  );
}

function LeadStory({ pub, story, accent, label }: { pub: string; story: Story; accent: string; label: string }) {
  return (
    <a href={storyHref(pub, story.slug)} className={`group mt-6 block rounded-3xl ${ring} focus-visible:ring-black/40`}>
      <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-black/5">
        <CoverOrPlaceholder story={story} accent={accent} className="" />
      </div>
      <div className="mt-5">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-[.16em] text-black/45">{label}</p>
        <StoryMeta story={story} accent={accent} />
        <h3 className="mt-2 font-serif text-3xl font-bold leading-[1.05] tracking-[-.03em] group-hover:underline group-hover:decoration-black/25 group-hover:underline-offset-4 sm:text-4xl">
          {story.headline}
        </h3>
        <p className="mt-3 max-w-2xl text-base leading-7 text-black/60">{excerpt(summary(story), 220)}</p>
        <p className="mt-3 text-sm text-black/50">
          {story.author_name && <>By {story.author_name}</>}
          {story.reading_time ? <> · {story.reading_time} min read</> : null}
        </p>
      </div>
    </a>
  );
}

function StoryRow({ pub, story, accent }: { pub: string; story: Story; accent: string }) {
  return (
    <a href={storyHref(pub, story.slug)} className={`group grid grid-cols-[1fr_96px] gap-4 py-5 sm:grid-cols-[1fr_160px] sm:gap-6 ${ring} focus-visible:ring-black/40`}>
      <div className="min-w-0">
        <StoryMeta story={story} accent={accent} />
        <h3 className="mt-1.5 font-serif text-xl font-bold leading-snug tracking-[-.02em] group-hover:underline group-hover:decoration-black/25 group-hover:underline-offset-4 sm:text-2xl">
          {story.headline}
        </h3>
        <p className="mt-1.5 hidden text-sm leading-6 text-black/60 sm:block">{excerpt(summary(story), 150)}</p>
      </div>
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-black/5">
        <CoverOrPlaceholder story={story} accent={accent} className="" small />
      </div>
    </a>
  );
}

function Subscribe({ publication, accent, onAccent, dark = false }: { publication: Publication; accent: string; onAccent: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const { error } = await supabase.from("bitbuzz_newsletter_subscribers").insert({ publication_id: publication.id, email: email.trim().toLowerCase() });
    setBusy(false);
    if (error && error.code !== "23505") {
      setError(error.message);
      return;
    }
    setSubscribed(true);
    setEmail("");
  };
  return (
    <div className={`rounded-3xl p-6 ${dark ? "bg-[#161616] text-white" : "border border-black/10 bg-white"}`}>
      <p className="font-serif text-xl font-bold leading-tight">Get new stories by email</p>
      <p className={`mt-1 text-sm ${dark ? "text-white/60" : "text-black/55"}`}>From {publication.profile_name}. No spam, unsubscribe anytime.</p>
      {subscribed ? (
        <p className="mt-4 rounded-xl bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-700">You're subscribed ✓</p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className={`min-w-0 flex-1 rounded-full border px-4 py-2.5 text-sm outline-none ${
              dark ? "border-white/15 bg-white/5 placeholder:text-white/35 focus:border-white/40" : "border-black/15 bg-[#f6f4ef] placeholder:text-black/35 focus:border-black/40"
            }`}
          />
          <button disabled={busy} className="shrink-0 rounded-full px-4 py-2.5 text-sm font-bold disabled:opacity-60" style={{ background: accent, color: onAccent }}>
            {busy ? "…" : "Subscribe"}
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function StoryView({
  publication: p,
  story,
  stories,
  accent,
  onAccent,
}: {
  publication: Publication;
  story: Story;
  stories: Story[];
  accent: string;
  onAccent: string;
}) {
  const [copied, setCopied] = useState(false);
  const more = stories.filter((s) => s.id !== story.id && s.headline !== story.headline).slice(0, 3);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: story.headline, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* user cancelled */
    }
  };
  // Many stories repeat the standfirst as the first paragraph — don't show it twice.
  const standfirst = story.description && !plain(story.body).startsWith(plain(story.description).slice(0, 60)) ? plain(story.description) : "";

  return (
    <main>
      <style>{LIGHT_PROSE}</style>
      <article>
        <header className="mx-auto max-w-3xl px-5 pt-10 sm:px-8 sm:pt-14">
          <a href={`/ambassadors/${p.slug}`} className="text-sm text-black/55 hover:text-black">
            ← {p.profile_name}
          </a>
          <div className="mt-8">
            <StoryMeta story={story} accent={accent} />
          </div>
          <h1 className="mt-3 font-serif text-[clamp(2.25rem,6vw,3.75rem)] font-bold leading-[1.02] tracking-[-.035em]">{story.headline}</h1>
          {standfirst && <p className="mt-5 text-lg leading-8 text-black/60 sm:text-xl">{excerpt(standfirst, 260)}</p>}
          <div className="mt-7 flex items-center justify-between gap-4 border-y border-black/10 py-4">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                src={null}
                name={story.author_name || p.profile_name}
                className="h-10 w-10 shrink-0 rounded-full text-sm"
                fallbackClass="!bg-black/[.07] text-black/70"
              />
              <div className="min-w-0 text-sm">
                <p className="truncate font-semibold">{story.author_name || p.profile_name}</p>
                <p className="text-black/50">
                  {fmtDate(story.published_at)}
                  {story.reading_time ? ` · ${story.reading_time} min read` : ""}
                </p>
              </div>
            </div>
            <button onClick={share} className="shrink-0 rounded-full border border-black/15 px-4 py-2 text-xs font-semibold hover:border-black/40">
              {copied ? "Link copied ✓" : "Share"}
            </button>
          </div>
        </header>
        {story.cover_url && (
          <div className="mx-auto mt-8 max-w-5xl px-5 sm:px-8">
            <img src={story.cover_url} alt="" className="max-h-[620px] w-full rounded-2xl object-cover" />
          </div>
        )}
        <div className="amb-prose mx-auto max-w-[680px] px-5 py-10 sm:px-8 sm:py-14">
          <Markdown value={story.body} />
        </div>
      </article>

      <section className="border-t border-black/10 bg-[#eeebe4]">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1fr_340px]">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-[-.02em]">More from {p.profile_name}</h2>
            {more.length ? (
              <ul className="mt-4 divide-y divide-black/10">
                {more.map((s) => (
                  <li key={s.id}>
                    <StoryRow pub={p.slug} story={s} accent={accent} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-black/55">This is the only story so far.</p>
            )}
          </div>
          <div className="lg:pt-12">
            <Subscribe publication={p} accent={accent} onAccent={onAccent} dark />
          </div>
        </div>
      </section>
    </main>
  );
}