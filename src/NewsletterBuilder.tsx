import { ReactNode, useEffect, useMemo, useState } from "react";
import {
  Block, BlockType, Brand, Edition, blankBlock, checkEdition, normalizeAccent, renderEmail, unpackEdition, uid,
} from "./lib/newsletterEmail";

export type StoryOption = { id: string; title: string; summary: string; url: string; image: string; kicker: string; date: string | null };
export type Campaign = { id: string; subject: string; preview_text: string | null; body_html: string; status: string; created_at: string; sent_at: string | null };

type Props = {
  brand: Brand;
  defaults: Edition;
  subscriberCount: number;
  campaigns: Campaign[];
  loadStories: () => Promise<StoryOption[]>;
  /** Persist the edition. Return a status message for the user. */
  onSave: (edition: Edition, html: string, send: boolean) => Promise<string>;
  lockAccent?: boolean;
};

const field = "w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/35";
const label = "mb-1.5 block text-xs font-semibold text-white/50";
const ghost = "rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/70 hover:border-white/30 hover:text-white disabled:opacity-30";

const NAMES: Record<BlockType, string> = { story: "Story", text: "Text", image: "Image", cta: "Button", divider: "Divider" };

function Field({ name, children }: { name: string; children: ReactNode }) {
  return <label className="block"><span className={label}>{name}</span>{children}</label>;
}

function BlockEditor({ block, set }: { block: Block; set: (b: Block) => void }) {
  switch (block.type) {
    case "story":
      return <div className="grid gap-3">
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <Field name="Kicker"><input className={field} value={block.kicker} onChange={e => set({ ...block, kicker: e.target.value })} placeholder="Space" /></Field>
          <Field name="Title"><input className={field} value={block.title} onChange={e => set({ ...block, title: e.target.value })} /></Field>
        </div>
        <Field name="Summary"><textarea className={field + " min-h-20 resize-y"} value={block.summary} onChange={e => set({ ...block, summary: e.target.value })} /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field name="Link"><input className={field} value={block.url} onChange={e => set({ ...block, url: e.target.value })} placeholder="https://" /></Field>
          <Field name="Image URL"><input className={field} value={block.image} onChange={e => set({ ...block, image: e.target.value })} placeholder="optional" /></Field>
        </div>
      </div>;
    case "text":
      return <Field name="Text">
        <textarea className={field + " min-h-32 resize-y leading-6"} value={block.text} onChange={e => set({ ...block, text: e.target.value })} />
        <span className="mt-1.5 block text-[11px] text-white/30">Blank line = new paragraph. **bold** and [link text](https://…) work.</span>
      </Field>;
    case "image":
      return <div className="grid gap-3 sm:grid-cols-2">
        <Field name="Image URL"><input className={field} value={block.src} onChange={e => set({ ...block, src: e.target.value })} placeholder="https://" /></Field>
        <Field name="Alt text"><input className={field} value={block.alt} onChange={e => set({ ...block, alt: e.target.value })} placeholder="What the image shows" /></Field>
        <Field name="Caption"><input className={field} value={block.caption} onChange={e => set({ ...block, caption: e.target.value })} /></Field>
        <Field name="Link (optional)"><input className={field} value={block.href} onChange={e => set({ ...block, href: e.target.value })} /></Field>
      </div>;
    case "cta":
      return <div className="grid gap-3 sm:grid-cols-2">
        <Field name="Button label"><input className={field} value={block.label} onChange={e => set({ ...block, label: e.target.value })} /></Field>
        <Field name="Button link"><input className={field} value={block.url} onChange={e => set({ ...block, url: e.target.value })} placeholder="https://" /></Field>
      </div>;
    case "divider":
      return <p className="text-xs text-white/30">A thin rule between sections.</p>;
  }
}

function StoryPicker({ load, pick, close }: { load: () => Promise<StoryOption[]>; pick: (s: StoryOption) => void; close: () => void }) {
  const [items, setItems] = useState<StoryOption[] | null>(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { load().then(setItems).catch(e => { setErr(e instanceof Error ? e.message : "Could not load stories."); setItems([]); }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = (items || []).filter(s => s.title.toLowerCase().includes(q.toLowerCase()));
  return <div className="fixed inset-0 z-[300] overflow-y-auto bg-black/80 px-4 py-10 backdrop-blur" onMouseDown={e => { if (e.target === e.currentTarget) close(); }}>
    <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[#0c0c0d] p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-serif text-2xl">Pull in a published story</h3>
        <button type="button" onClick={close} className={ghost} aria-label="Close">Close</button>
      </div>
      <input autoFocus className={field + " mt-4"} placeholder="Search by title" value={q} onChange={e => setQ(e.target.value)} />
      <div className="mt-3 max-h-[60vh] space-y-1.5 overflow-y-auto">
        {items === null && <p className="py-8 text-center text-xs text-white/40">Loading…</p>}
        {err && <p className="py-4 text-xs text-red-300">{err}</p>}
        {items && !shown.length && !err && <p className="py-8 text-center text-xs text-white/40">No published stories found.</p>}
        {shown.map(s => <button type="button" key={s.id} onClick={() => pick(s)} className="flex w-full items-center gap-3 rounded-xl border border-white/5 p-2.5 text-left hover:border-white/25 hover:bg-white/[.04]">
          {s.image ? <img src={s.image} alt="" className="h-12 w-16 flex-none rounded-md object-cover" /> : <span className="h-12 w-16 flex-none rounded-md bg-white/5" />}
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{s.title}</span>
            <span className="block truncate text-xs text-white/40">{[s.kicker, s.date ? new Date(s.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""].filter(Boolean).join(", ")}</span>
          </span>
        </button>)}
      </div>
    </div>
  </div>;
}

export default function NewsletterBuilder({ brand, defaults, subscriberCount, campaigns, loadStories, onSave, lockAccent }: Props) {
  const [ed, setEd] = useState<Edition>(defaults);
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  const html = useMemo(() => renderEmail(brand, ed), [brand, ed]);
  const checks = useMemo(() => checkEdition(ed), [ed]);
  const errors = checks.filter(c => c.level === "error");

  const set = <K extends keyof Edition>(k: K, v: Edition[K]) => { setConfirming(false); setEd(e => ({ ...e, [k]: v })); };
  const setBlock = (b: Block) => set("blocks", ed.blocks.map(x => (x.id === b.id ? b : x)));
  const add = (t: BlockType) => set("blocks", [...ed.blocks, blankBlock(t)]);
  const remove = (id: string) => set("blocks", ed.blocks.filter(b => b.id !== id));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d; if (j < 0 || j >= ed.blocks.length) return;
    const next = [...ed.blocks]; [next[i], next[j]] = [next[j], next[i]]; set("blocks", next);
  };
  const pickStory = (s: StoryOption) => {
    set("blocks", [...ed.blocks, { id: uid(), type: "story", kicker: s.kicker, title: s.title, summary: s.summary, url: s.url, image: s.image }]);
    setPicker(false);
  };
  const reopen = (c: Campaign) => {
    const restored = unpackEdition(c.body_html);
    if (!restored) { setMessage("That edition was made with the old editor and can't be reopened as blocks."); return; }
    if (ed.blocks.length && !window.confirm("Replace what's in the editor with this edition?")) return;
    setEd({ ...defaults, ...restored, blocks: restored.blocks.map(b => ({ ...b, id: uid() })) });
    setMessage(`Opened “${c.subject}” as a new draft.`);
  };

  const run = async (send: boolean) => {
    if (errors.length) { setMessage("Fix the errors in the checklist first."); return; }
    if (send && !subscriberCount) { setMessage("There are no active subscribers yet."); return; }
    setBusy(true); setMessage(""); setConfirming(false);
    try { setMessage(await onSave(ed, html, send)); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Newsletter action failed."); }
    finally { setBusy(false); }
  };

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <div className="space-y-5">
      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#090909] p-5">
        <h3 className="font-serif text-xl">Envelope</h3>
        <Field name={`Subject (${ed.subject.length})`}><input className={field} value={ed.subject} onChange={e => set("subject", e.target.value)} /></Field>
        <Field name="Preview text, shown next to the subject in the inbox"><input className={field} value={ed.preheader} onChange={e => set("preheader", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <Field name="Header image URL"><input className={field} value={ed.headerImage} onChange={e => set("headerImage", e.target.value)} placeholder="optional" /></Field>
          {!lockAccent && <Field name="Accent">
            <div className="flex gap-2">
              <input type="color" value={normalizeAccent(ed.accent)} onChange={e => set("accent", e.target.value)} className="h-[42px] w-12 rounded-lg border border-white/10 bg-transparent" />
              <input className={field + " w-28 uppercase"} value={ed.accent} onChange={e => set("accent", e.target.value)} />
            </div>
          </Field>}
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-[#090909] p-5">
        <h3 className="font-serif text-xl">Opening</h3>
        <Field name="Edition headline"><input className={field} value={ed.headline} onChange={e => set("headline", e.target.value)} /></Field>
        <Field name="Intro note"><textarea className={field + " min-h-24 resize-y leading-6"} value={ed.intro} onChange={e => set("intro", e.target.value)} placeholder="Two or three lines on what's in this edition." /></Field>
      </section>

      {ed.blocks.map((b, i) => <section key={b.id} className="rounded-2xl border border-white/10 bg-[#090909] p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-white/80">{i + 1}. {NAMES[b.type]}</h3>
          <div className="flex gap-1.5">
            <button type="button" className={ghost} onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
            <button type="button" className={ghost} onClick={() => move(i, 1)} disabled={i === ed.blocks.length - 1} aria-label="Move down">↓</button>
            <button type="button" className={ghost + " hover:!border-red-400/50 hover:!text-red-300"} onClick={() => remove(b.id)}>Remove</button>
          </div>
        </div>
        <BlockEditor block={b} set={setBlock} />
      </section>)}

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-white/15 p-4">
        <span className="mr-1 text-xs text-white/40">Add</span>
        <button type="button" onClick={() => setPicker(true)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-black">Published story</button>
        {(["story", "text", "image", "cta", "divider"] as BlockType[]).map(t =>
          <button type="button" key={t} onClick={() => add(t)} className={ghost}>{t === "story" ? "Blank story" : NAMES[t]}</button>)}
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#090909] p-5">
        <h3 className="font-serif text-xl">Before you send</h3>
        {checks.length === 0
          ? <p className="mt-3 text-sm text-emerald-300/80">All checks pass.</p>
          : <ul className="mt-3 space-y-1.5">{checks.map((c, i) =>
            <li key={i} className={"text-sm " + (c.level === "error" ? "text-red-300" : "text-amber-200/80")}>{c.level === "error" ? "Fix: " : "Heads up: "}{c.msg}</li>)}</ul>}
        {message && <p role="status" className="mt-4 rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-xs text-white/70">{message}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void run(false)} className="rounded-lg border border-white/20 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40">{busy ? "Working…" : "Save draft"}</button>
          {!confirming
            ? <button type="button" disabled={busy || errors.length > 0 || !subscriberCount} onClick={() => setConfirming(true)} className="rounded-lg bg-white px-4 py-2.5 text-xs font-bold text-black disabled:opacity-40">Send to {subscriberCount.toLocaleString("en-IN")} readers</button>
            : <>
              <button type="button" disabled={busy} onClick={() => void run(true)} className="rounded-lg bg-red-500 px-4 py-2.5 text-xs font-bold text-white">Yes, send it now</button>
              <button type="button" onClick={() => setConfirming(false)} className={ghost}>Cancel</button>
            </>}
        </div>
        {confirming && <p className="mt-3 text-xs text-white/50">This emails “{ed.subject}” to {subscriberCount.toLocaleString("en-IN")} people. It can't be unsent.</p>}
      </section>

      {campaigns.length > 0 && <section className="rounded-2xl border border-white/10 bg-[#090909] p-5">
        <h3 className="font-serif text-xl">Recent editions</h3>
        <div className="mt-3 space-y-1.5">{campaigns.map(c =>
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm">{c.subject}</p>
              <p className="text-[11px] text-white/35">{c.sent_at ? "Sent " + new Date(c.sent_at).toLocaleString("en-IN") : "Draft, " + new Date(c.created_at).toLocaleString("en-IN")}</p>
            </div>
            <button type="button" className={ghost} onClick={() => reopen(c)}>Open as draft</button>
          </div>)}</div>
      </section>}
    </div>

    <div className="xl:sticky xl:top-6 xl:self-start">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{ed.subject || "No subject yet"}</p>
          <p className="truncate text-xs text-white/40">{ed.preheader || "No preview text"}</p>
        </div>
        <div className="flex flex-none rounded-lg border border-white/10 p-0.5" role="group" aria-label="Preview width">
          {(["desktop", "mobile"] as const).map(w =>
            <button type="button" key={w} onClick={() => setWidth(w)} aria-pressed={width === w}
              className={"rounded-md px-3 py-1 text-xs font-semibold " + (width === w ? "bg-white text-black" : "text-white/50")}>{w === "desktop" ? "Desktop" : "Phone"}</button>)}
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl bg-[#f3f1ec]">
        <iframe title="Newsletter preview" sandbox="" srcDoc={html}
          className="mx-auto block h-[78vh] border-0 bg-white transition-[width] duration-300"
          style={{ width: width === "desktop" ? "100%" : 375 }} />
      </div>
    </div>

    {picker && <StoryPicker load={loadStories} pick={pickStory} close={() => setPicker(false)} />}
  </div>;
}
