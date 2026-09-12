import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function AuthNav() {
  const [auth, setAuth] = useState<{ signedIn: boolean; name: string }>({ signedIn: false, name: "" });

  useEffect(() => {
    let active = true;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) {
        setAuth({ signedIn: false, name: "" });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.user.id)
        .single();

      if (!active) return;
      setAuth({
        signedIn: true,
        name: profile?.display_name || session.user.email?.split("@")[0] || "there",
      });
    };

    load();
    const { data: listener } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (auth.signedIn) {
    return (
      <div className="fixed right-4 top-[9px] z-[60] rounded-full border border-white/10 bg-black/80 px-4 py-2.5 text-[12px] font-semibold text-white shadow-lg backdrop-blur-xl sm:right-6">
        Hello, {auth.name}
      </div>
    );
  }

  return (
    <a
      href="/signup"
      aria-label="Sign in to BitBuzz"
      className="fixed right-4 top-[9px] z-[60] rounded-full bg-white px-4 py-2.5 text-[12px] font-bold text-black shadow-lg transition hover:bg-honey hover:text-black sm:right-6"
    >
      Sign In
    </a>
  );
}
