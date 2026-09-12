import { createRoot, Root } from "react-dom/client";
import { useEffect, useState } from "react";
import AnalyticsPanel from "./AnalyticsPanel";
import NewsletterDesk from "./NewsletterDesk";
import SuperAdminPanel from "./SuperAdminPanel";
import { supabase } from "./lib/supabase";

export default function AdminToolsTabs() {
  useEffect(() => {
    if (window.location.pathname !== "/admin") return;
    let cleanup: (() => void) | undefined;
    const setup = () => {
      const aside = document.querySelector("main")?.parentElement?.querySelector("aside");
      const main = document.querySelector("main");
      if (!aside || !main || aside.querySelector("[data-bitbuzz-tools]") || main.querySelector("[data-bitbuzz-tools-content]")) return false;
      const toolsNav = document.createElement("div");
      toolsNav.dataset.bitbuzzTools = "true";
      toolsNav.className = "mt-5 border-t border-white/10 pt-4";
      aside.appendChild(toolsNav);
      const mount = document.createElement("div");
      mount.dataset.bitbuzzToolsContent = "true";
      mount.className = "hidden";
      main.appendChild(mount);
      const root: Root = createRoot(mount);
      const original = Array.from(main.children).filter(el => el !== mount);
      const restore = () => { original.forEach(el => { (el as HTMLElement).style.display = ""; }); mount.classList.add("hidden"); };
      const show = (kind: "analytics" | "newsletter" | "superadmin") => {
        original.forEach(el => { (el as HTMLElement).style.display = "none"; });
        mount.classList.remove("hidden");
        root.render(kind === "analytics" ? <AnalyticsPanel /> : kind === "newsletter" ? <NewsletterDesk /> : <SuperAdminPanel />);
      };
      const Tools = () => {
        const [active, setActive] = useState<string | null>(null);
        const [isSuperAdmin, setIsSuperAdmin] = useState(false);
        useEffect(() => {
          let activeRequest = true;
          supabase.rpc("bitbuzz_superadmin_list_platform_admins").then(({ data, error }) => {
            if (activeRequest && !error && Array.isArray(data) && data.length > 0) setIsSuperAdmin(true);
          });
          return () => { activeRequest = false; };
        }, []);
        return <div className="space-y-1"><p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[.2em] text-white/25">Tools</p><button type="button" onClick={()=>{setActive("newsletter");show("newsletter")}} className={`w-full rounded-xl px-3 py-2.5 text-left text-xs ${active==="newsletter"?"bg-white text-black":"text-white/45 hover:bg-white/5 hover:text-white"}`}>Newsletter</button><button type="button" onClick={()=>{setActive("analytics");show("analytics")}} className={`w-full rounded-xl px-3 py-2.5 text-left text-xs ${active==="analytics"?"bg-white text-black":"text-white/45 hover:bg-white/5 hover:text-white"}`}>Analytics</button>{isSuperAdmin&&<button type="button" onClick={()=>{setActive("superadmin");show("superadmin")}} className={`w-full rounded-xl px-3 py-2.5 text-left text-xs ${active==="superadmin"?"border border-[#ff6a1f]/30 bg-[#ff6a1f]/10 text-white":"text-white/45 hover:bg-white/5 hover:text-white"}`}>SuperAdmin</button>}<button type="button" onClick={()=>{setActive(null);restore()}} className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-xs text-white/30 hover:bg-white/5 hover:text-white">Back to console</button></div>;
      };
      const navRoot = createRoot(toolsNav); navRoot.render(<Tools />);
      const sidebarButtons = Array.from(aside.querySelectorAll("button")).filter(b => !b.closest("[data-bitbuzz-tools]"));
      const onExistingClick = () => restore();
      sidebarButtons.forEach(b => b.addEventListener("click", onExistingClick));
      cleanup = () => { sidebarButtons.forEach(b => b.removeEventListener("click", onExistingClick)); navRoot.unmount(); root.unmount(); toolsNav.remove(); mount.remove(); };
      return true;
    };
    const observer = new MutationObserver(() => { if (setup()) observer.disconnect(); });
    observer.observe(document.body, { childList: true, subtree: true });
    setup();
    return () => { observer.disconnect(); cleanup?.(); };
  }, []);
  return null;
}
