import { FormEvent, useRef, useState } from "react";

const LOGO_URL =
  "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";

const categories = [
  ["tech", "Tech & AI"],
  ["space", "Space"],
  ["cybersecurity", "Cybersecurity"],
  ["culture", "Culture & Life"],
  ["startups", "Startups & Business"],
  ["opinion", "Opinion"],
];

function formatSelection(value: string, selected: string, fallback: string) {
  if (!selected) return fallback;
  const start = value.indexOf(" ");
  if (start === -1) return value;
  return `${value.slice(0, start)} ${value.slice(start + 1)}`;
}

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertMarkdown = (command: string) => {
    const start = document.activeElement === document.getElementById("article-content")
      ? (document.getElementById("article-content") as HTMLTextAreaElement).selectionStart
      : content.length;
    const end = document.activeElement === document.getElementById("article-content")
      ? (document.getElementById("article-content") as HTMLTextAreaElement).selectionEnd
      : content.length;
    const selected = content.slice(start, end);
    const replacements: Record<string, string> = {
      bold: `**${selected || "bold text"}**`,
      italic: `*${selected || "italic text"}*`,
      strike: `~~${selected || "strikethrough"}~~`,
      quote: `\n> ${selected || "quote"}\n`,
      code: `\`${selected || "code"}\``,
      link: `[${selected || "link text"}](https://)`,
    };
    const replacement = replacements[command] || "";
    const next = content.slice(0, start) + replacement + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      const textarea = document.getElementById("article-content") as HTMLTextAreaElement | null;
      textarea?.focus();
      const cursor = start + replacement.length;
      textarea?.setSelectionRange(cursor, cursor);
    });
  };

  const chooseFile = (file?: File) => {
    if (file) setFileName(file.name);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[62px] max-w-[980px] items-center justify-between px-5 sm:px-8">
          <a href="/home" className="flex items-center gap-2.5" aria-label="Back to BitBuzz home">
            <img src={LOGO_URL} alt="BitBuzz" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/20" />
            <span className="font-serif text-[21px] font-semibold tracking-[-0.04em]">BitBuzz</span>
          </a>
          <a href="/home" className="text-xs font-semibold text-white/55 transition hover:text-white">Back to newsroom</a>
        </div>
      </header>

      <main className="px-4 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-[680px]">
          <div className="mb-8">
            <p className="mb-3 text-[10px] font-bold tracking-[0.18em] text-[#f5c84b]">BITBUZZ EDITORIAL</p>
            <h1 className="font-serif text-5xl font-medium tracking-[-0.05em] sm:text-6xl">Share your story.</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/45">Fill in the details below to submit your draft directly to the editorial team.</p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 shadow-2xl sm:p-8">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#f5c84b]/30 bg-[#f5c84b]/10 text-[#f5c84b]">✓</div>
                <h2 className="mt-5 font-serif text-3xl">Story received.</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-white/45">Thanks for sharing your work with BitBuzz. Our editorial team can review your submission from here.</p>
                <button type="button" onClick={() => setSubmitted(false)} className="mt-7 rounded-full bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-[#f5c84b]">Submit another story</button>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
                  <Field label="Your Name" required value={name} onChange={setName} placeholder="e.g. Alex Rivera" />
                  <Field label="Age" type="number" value={age} onChange={setAge} placeholder="e.g. 16" min="13" max="120" />
                </div>

                <Field label="Your Email" required type="email" value={email} onChange={setEmail} placeholder="you@domain.com" />
                <Field label="Article Title" required value={title} onChange={setTitle} placeholder="Something that makes people stop scrolling" />

                <div>
                  <label htmlFor="category" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Category</label>
                  <select id="category" required value={category} onChange={(event) => setCategory(event.target.value)} className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-sm text-white outline-none transition focus:border-[#f5c84b]/60">
                    <option value="" disabled>Select a category...</option>
                    {categories.map(([value, label]) => <option key={value} value={value} className="bg-black">{formatSelection(label, category, label)}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="article-content" className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Article <span className="text-[#93c5fd]">*</span></label>
                  <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.045] transition focus-within:border-[#f5c84b]/60">
                    <div className="flex flex-wrap gap-1 border-b border-white/10 bg-black/30 p-2">
                      {[["bold", "B"], ["italic", "I"], ["strike", "S"], ["quote", "❝"], ["code", "</>"], ["link", "↗"]].map(([command, label]) => <button key={command} type="button" onClick={() => insertMarkdown(command)} className="rounded-md px-2.5 py-1.5 text-xs text-white/45 transition hover:bg-white/10 hover:text-white" title={command}>{label}</button>)}
                    </div>
                    <textarea id="article-content" required value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write your story here. Be real, be specific, be you." className="min-h-[220px] w-full resize-y border-0 bg-transparent px-4 py-3.5 text-sm leading-relaxed text-white outline-none placeholder:text-white/20" />
                  </div>
                  <p className="mt-2 text-[11px] text-white/30">Markdown formatting is supported.</p>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">Select Media <span className="normal-case tracking-normal text-white/25">(Optional)</span></label>
                  <div onClick={() => fileInputRef.current?.click()} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }} className={`relative cursor-pointer rounded-xl border border-dashed px-4 py-7 text-center transition ${dragging ? "border-[#f5c84b] bg-[#f5c84b]/5" : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"}`}>
                    <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} />
                    <svg className="mx-auto mb-2 h-5 w-5 text-white/30" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" /></svg>
                    <p className="text-xs text-white/40">{fileName ? <><span className="text-white/75">Selected:</span> {fileName}</> : <>Drag and drop a file or <span className="text-[#93c5fd] underline underline-offset-2">browse</span></>}</p>
                  </div>
                </div>

                <button type="submit" className="mt-2 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-bold uppercase tracking-[0.08em] text-black transition hover:bg-[#f5c84b]">Submit Your Story <span aria-hidden="true">→</span></button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, required, type = "text", value, onChange, placeholder, min, max }: { label: string; required?: boolean; type?: string; value: string; onChange: (value: string) => void; placeholder: string; min?: string; max?: string }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">{label}{required && <span className="ml-1 text-[#93c5fd]">*</span>}</label>
      <input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} min={min} max={max} className="w-full rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#f5c84b]/60" />
    </div>
  );
}
