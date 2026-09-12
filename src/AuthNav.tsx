import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function AuthNav() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(!!session));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (signedIn !== false) return null;

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
