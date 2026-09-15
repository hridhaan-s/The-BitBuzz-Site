import { useEffect, useMemo, useState } from "react";

const LOGO_URL = "https://cdn.hackclub.com/019eb6cc-8925-7919-8d68-9add6a3d295f/bitbuzz_kids_logo.jpg";
const SESSION_KEY = "bitbuzz_chanakya_session";

type Source = { title: string; url: string; snippet?: string; source?: string };
type Message = { role: "user" | "assistant"; content: string; sources?: Source[]; factCheck?: boolean };

function sessionId() {
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

export default function ChanakyaAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"ask" | "fact-check">("ask");
  const [error, setError] = useState("");
  const sid = useMemo(() => sessionId(), []);

  useEffect(() => {
    document.title = "Chanakya AI · BitBuzz";
    return () => { document.title = "BitBuzz"; };
  }, []);

  const ask = async (preset?: string) => {
    const prompt = (preset ?? input).trim();
    if (!prompt || loading) return;
    setInput("");
    setError("");
    setMessages(prev => [...prev, { role: "user", content: prompt }]);
    setLoading(true);
    try {
      const res = await fetch("https://cjywdvaitaasxtmgpwas.supabase.co/functions/v1/chanakya-public", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, prompt, mode, history: messages.slice(-8) }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Chanakya could not answer right now.");
      setMessages(prev => [...prev, { role: "assistant", content: data.answer, sources: data.sources || [], factCheck: mode === "fact-check" }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chanakya could not answer right now.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="min-h-screen bg-[#f7f5f0] text-[#171411]">
    <header className="sticky top-0 z-50 border-b border-[#ded9d0] bg-[#f7f5f0]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between px-5 sm:px-8">
        <a href="/home" className="flex items-center gap-2.5"><img src={LOGO_URL} alt="BitBuzz" className="h-8 w-8 rounded-full object-cover"/><span className="font-serif text-xl font-semibold tracking-[-.04em]">BitBuzz</span></a>
        <a href="/home" className="text-xs font-bold text-[#6f6a64] transition hover:text-black">Back to newsroom ↗</a>
      </div>
    </header>

    <main className="mx-auto max-w-[1180px] px-5 py-10 sm:px-8 sm:py-16">
      <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
        <section className="lg:sticky lg:top-28">
          <p className="text-[10px] font-black uppercase tracking-[.22em] text-[#b4121f]">BitBuzz intelligence</p>
          <h1 className="mt-3 font-serif text-[clamp(3.4rem,8vw,6.5rem)] font-black leading-[.86] tracking-[-.06em]">Meet<br/>Chanakya.</h1>
          <p className="mt-7 max-w-md text-base leading-7 text-[#5f5953]">Ask questions, explore fresh information, or challenge a claim. Chanakya can use live web sources when a question needs current context.</p>
          <div className="mt-7 rounded-2xl border border-[#ded9d0] bg-white/60 p-4 text-xs leading-5 text-[#6f6a64]">
            <strong className="text-[#302b27]">Privacy, clearly stated.</strong> Your prompts are logged so BitBuzz can understand how Chanakya is used and improve the service. Raw prompts are intended for authorized BitBuzz super-admin analytics and are retained only for a limited period. Don't enter passwords, private secrets, or other sensitive information.
            <a href="/privacy" className="mt-2 block font-bold text-[#b4121f] underline underline-offset-4">Read the full privacy policy →</a>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-[#ded9d0] bg-white shadow-[0_24px_80px_rgba(30,24,18,.08)]">
          <div className="border-b border-[#ece7df] px-5 py-4 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-[10px] font-black uppercase tracking-[.18em] text-[#b4121f]">AI assistant</p><h2 className="mt-1 font-serif text-2xl font-bold">Ask Chanakya.</h2></div>
              <div className="flex rounded-full border border-[#ded9d0] bg-[#f7f5f0] p-1 text-[10px] font-black uppercase tracking-[.12em]">
                <button onClick={() => setMode("ask")} className={`rounded-full px-3 py-2 ${mode === "ask" ? "bg-black text-white" : "text-[#6f6a64]"}`}>Ask</button>
                <button onClick={() => setMode("fact-check")} className={`rounded-full px-3 py-2 ${mode === "fact-check" ? "bg-black text-white" : "text-[#6f6a64]"}`}>Fact-check</button>
              </div>
            </div>
          </div>

          <div className="min-h-[460px] max-h-[62vh] space-y-5 overflow-y-auto px-5 py-6 sm:px-7">
            {messages.length === 0 && <div className="flex min-h-[390px] flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-black text-2xl text-white shadow-xl">C</div><h3 className="mt-5 font-serif text-3xl font-bold">What are you curious about?</h3><p className="mt-2 max-w-md text-sm leading-6 text-[#7a746e]">Try a current question, ask about a BitBuzz topic, or switch to Fact-check for a source-backed claim review.</p><div className="mt-6 flex flex-wrap justify-center gap-2"><button onClick={() => ask("What are the biggest cybersecurity stories right now?")} className="rounded-full border border-[#ded9d0] px-4 py-2 text-xs font-bold hover:bg-[#f7f5f0]">Cybersecurity right now</button><button onClick={() => ask("What is happening in space this week?")} className="rounded-full border border-[#ded9d0] px-4 py-2 text-xs font-bold hover:bg-[#f7f5f0]">Space this week</button></div></div>}
            {messages.map((m, i) => <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}><div className={m.role === "user" ? "max-w-[86%] rounded-2xl rounded-br-md bg-black px-4 py-3 text-sm leading-6 text-white" : "max-w-[92%] rounded-2xl rounded-bl-md bg-[#f7f5f0] px-4 py-4 text-sm leading-7 text-[#302b27]"}><p className="whitespace-pre-wrap">{m.content}</p>{m.sources?.length ? <div className="mt-4 border-t border-black/10 pt-3"><p className="mb-2 text-[9px] font-black uppercase tracking-[.16em] text-[#8b837c]">Sources checked</p><div className="space-y-2">{m.sources.slice(0,6).map((s,j)=><a key={j} href={s.url} target="_blank" rel="noreferrer" className="block rounded-xl border border-black/10 bg-white/60 px-3 py-2 transition hover:bg-white"><span className="block text-xs font-bold">{s.title}</span><span className="mt-0.5 block truncate text-[10px] text-[#8b837c]">{s.source || s.url}</span></a>)}</div></div> : null}</div></div>)}
            {loading && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-[#f7f5f0] px-4 py-3 text-xs font-bold text-[#6f6a64]">Chanakya is researching fresh sources…</div></div>}
          </div>

          {error && <div className="mx-5 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 sm:mx-7">{error}</div>}
          <div className="border-t border-[#ece7df] p-4 sm:p-5"><div className="rounded-2xl border border-[#d9d3ca] bg-[#f7f5f0] p-2 focus-within:border-black"><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }} placeholder={mode === "fact-check" ? "Paste a claim to fact-check…" : "Ask Chanakya anything…"} rows={3} className="w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#9b948d]"/><div className="flex items-center justify-between px-2 pb-1"><span className="text-[10px] text-[#958e87]">Enter to send · Shift + Enter for a new line</span><button disabled={!input.trim() || loading} onClick={() => ask()} className="rounded-xl bg-black px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#b4121f] disabled:cursor-not-allowed disabled:opacity-30">{loading ? "Thinking…" : "Send ↗"}</button></div></div><p className="mt-3 px-1 text-[9px] leading-4 text-[#9a938c]">Chanakya can make mistakes. Verify important information. Web results may be incomplete or delayed.</p></div>
        </section>
      </div>
    </main>
  </div>;
}
