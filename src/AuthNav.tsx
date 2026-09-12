import { useEffect, useRef, useState } from "react";
import { supabase } from "./lib/supabase";

export default function AuthNav() {
  const [auth, setAuth] = useState<{ signedIn: boolean; name: string; avatar: string | null }>({ signedIn: false, name: "", avatar: null });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) { setAuth({ signedIn: false, name: "", avatar: null }); setOpen(false); return; }
      const { data: profile } = await supabase.from("profiles").select("display_name,avatar_url").eq("id", session.user.id).single();
      if (!active) return;
      setAuth({ signedIn: true, name: profile?.display_name || session.user.email?.split("@")[0] || "there", avatar: profile?.avatar_url || null });
    };
    load();
    const { data: listener } = supabase.auth.onAuthStateChange(() => load());
    const outside = (event: MouseEvent) => { if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", outside);
    return () => { active = false; listener.subscription.unsubscribe(); document.removeEventListener("mousedown", outside); };
  }, []);

  if (!auth.signedIn) return <a href="/signup" aria-label="Sign in to BitBuzz" className="fixed right-[105px] top-[9px] z-[60] rounded-full border border-white/10 bg-black px-4 py-2.5 text-[12px] font-bold text-white shadow-lg transition hover:border-white/20 hover:bg-white/10 sm:right-[118px]">Sign In</a>;

  return <div ref={ref} className="fixed right-[105px] top-[8px] z-[70] sm:right-[118px]">
    <button onClick={() => setOpen(v => !v)} aria-expanded={open} className="flex items-center gap-2 rounded-full border border-white/10 bg-black/90 px-3 py-2 text-[12px] font-semibold text-white shadow-lg backdrop-blur-xl transition hover:border-white/20">
      <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white/[.08] text-[10px] font-bold text-white/80">{auth.avatar ? <img src={auth.avatar} alt="" className="h-full w-full object-cover"/> : auth.name.slice(0,1).toUpperCase()}</span>
      <span className="hidden max-w-[110px] truncate sm:inline">Hello, {auth.name}</span><span className={`text-white/35 transition ${open ? "rotate-180" : ""}`}>⌄</span>
    </button>
    {open && <div className="absolute right-0 mt-2 w-[230px] overflow-hidden rounded-2xl border border-white/10 bg-[#090909]/95 p-1.5 shadow-2xl backdrop-blur-2xl">
      <a href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-white/[.07]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[.07]">◎</span><span><span className="block text-xs font-semibold text-white">Profile & settings</span><span className="mt-0.5 block text-[10px] text-white/30">Account, contributions & reviews</span></span></a>
      <div className="my-1 border-t border-white/10" />
      <button onClick={async () => { await supabase.auth.signOut(); window.location.href = "/home"; }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-red-400/[.07]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-400/[.08] text-red-300">↪</span><span className="text-xs font-semibold text-red-300">Sign out</span></button>
    </div>}
  </div>;
}
