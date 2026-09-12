import { createRoot, Root } from "react-dom/client";
import { useEffect, useState } from "react";
import AnalyticsPanel from "./AnalyticsPanel";
import NewsletterDesk from "./NewsletterDesk";
import SuperAdminPanel from "./SuperAdminPanel";
import AdminOpportunities from "./AdminOpportunities";
import AdminOpportunityCreate from "./AdminOpportunityCreate";
import AdminFlagIt from "./AdminFlagIt";
import { supabase } from "./lib/supabase";

export default function AdminToolsTabs() {
  useEffect(() => {
    if (window.location.pathname !== "/admin") return;
    let cleanup: (() => void) | undefined;
    const setup = () => {
      const aside = document.querySelector("main")?.parentElement?.querySelector("aside");
      const main = document.querySelector("main");
      if (!aside || !main || aside.querySelector("[data-bitbuzz-tools]") || main.querySelector("[data-bitbuzz-tools-content]")) return false;
      const toolsNav = document.createElement("div"); toolsNav.dataset.bitbuzzTools = "true"; toolsNav.className = "mt-5 border-t border-white/10 pt-4"; aside.appendChild(toolsNav);
      const mount = document.createElement("div"); mount.dataset.bitbuzzToolsContent = "true"; mount.className = "hidden"; main.appendChild(mount); const root: Root = createRoot(mount);
      const original = Array.from(main.children).filter(el => el !== mount);
      const restore = () => { original.forEach(el => { (el as HTMLElement).style.display = ""; }); mount.classList.add("hidden"); };
      const show = (kind: "analytics" | "newsletter" | "superadmin" | "opportunities" | "create-opportunity" | "flag-it") => { original.forEach(el => { (el as HTMLElement).style.display = "none"; }); mount.classList.remove("hidden"); root.render(kind === "analytics" ? <AnalyticsPanel /> : kind === "newsletter" ? <NewsletterDesk /> : kind === "superadmin" ? <SuperAdminPanel /> : kind === "create-opportunity" ? <AdminOpportunityCreate onDone={() => show("opportunities")} /> : kind === "flag-it" ? <AdminFlagIt /> : <AdminOpportunities />); };
      const Tools = () => {
        const [active, setActive] = useState<string | null>(null); const [isSuperAdmin, setIsSuperAdmin] = useState(false);
        useEffect(() => { let live = true; supabase.rpc("bitbuzz_superadmin_list_platform_admins").then(({ data, error }) => { if (live && !error && Array.isArray(data) && data.length > 0) setIsSuperAdmin(true); }); return () => { live = false; }; }, []);
        const item = (name:string, kind:"analytics"|"newsletter"|"superadmin"|"opportunities"|"create-opportunity"|"flag-it", accent=false) => <button type="button" onClick={()=>{setActive(name);show(kind)}} className={`w-full rounded-xl px-3 py-2.5 text-left text-xs ${active===name?(accent?"border border-[#ffc48f]/30 bg-[#ffc48f]/10 text-[#ffc48f]":"bg-white text-black"):(accent?"text-[#ffc48f]/70 hover:bg-[#ffc48f]/5 hover:text-[#ffc48f]":"text-white/45 hover:bg-white/5 hover:text-white")}`}>{name}</button>;
        return <div className="space-y-1"><p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-[.2em] text-white/25">Tools</p>{item("Opportunities","opportunities")}{item("Add event","create-opportunity",true)}{item("Flag It","flag-it",true)}{item("Newsletter","newsletter")}{item("Analytics","analytics")}{isSuperAdmin&&item("SuperAdmin","superadmin",true)}<button type="button" onClick={()=>{setActive(null);restore()}} className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-xs text-white/30 hover:bg-white/5 hover:text-white">Back to console</button></div>;
      };
      const navRoot = createRoot(toolsNav); navRoot.render(<Tools />); const sidebarButtons = Array.from(aside.querySelectorAll("button")).filter(b => !b.closest("[data-bitbuzz-tools]")); const onExistingClick = () => restore(); sidebarButtons.forEach(b => b.addEventListener("click", onExistingClick));
      cleanup = () => { sidebarButtons.forEach(b => b.removeEventListener("click", onExistingClick)); navRoot.unmount(); root.unmount(); toolsNav.remove(); mount.remove(); }; return true;
    };
    const observer = new MutationObserver(() => { if (setup()) observer.disconnect(); }); observer.observe(document.body, { childList: true, subtree: true }); setup(); return () => { observer.disconnect(); cleanup?.(); };
  }, []); return null;
}
