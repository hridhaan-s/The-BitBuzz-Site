import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LandingPage from "./LandingPage";
import SubmitPage from "./SubmitPage";
import InfoPage from "./InfoPage";
import Blog, { ArticlePage } from "./Blog";
import Admin from "./Admin";
import AuthPage from "./AuthPage";
import AuthNav from "./AuthNav";
import PrivacyPage from "./PrivacyPage";
import ProfilePage from "./ProfilePage";
import SiteFooter from "./SiteFooter";
import { supabase } from "./lib/supabase";
import "./index.css";

const path = window.location.pathname.replace(/\/+$/, "") || "/";
const isLegacyNewsroom = new URL(window.location.href).searchParams.get("view") === "news";
if (isLegacyNewsroom && path === "/") window.history.replaceState({}, "", "/home");

const landingRoutes: Record<string, string> = { "#explore": "/explore", "#categories": "/categories", "#opportunities": "/opportunities", "#about": "/about" };
if (path === "/") window.addEventListener("click", (event) => { const anchor = (event.target as HTMLElement | null)?.closest("a") as HTMLAnchorElement | null; const route = anchor ? landingRoutes[anchor.getAttribute("href") || ""] : undefined; if (route) { event.preventDefault(); window.location.href = route; } });

window.addEventListener("click", (event) => {
  const anchor = (event.target as HTMLElement | null)?.closest("a") as HTMLAnchorElement | null;
  const href = anchor?.getAttribute("href") || "";
  if (href === "#about" || href === "/home#about") { event.preventDefault(); window.location.href = "/about"; }
});

function AdminGreeting() {
  useEffect(() => {
    if (path !== "/admin") return;
    let active = true; let observer: MutationObserver | null = null;
    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active || !session?.user?.id) return;
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", session.user.id).single();
      if (!active) return;
      const name = profile?.display_name || session.user.email?.split("@")[0] || "Editor";
      const updateGreeting = () => { const heading = Array.from(document.querySelectorAll("h1")).find((element) => element.textContent?.trim() === "Good morning."); if (heading) heading.textContent = `Good morning, ${name}.`; };
      updateGreeting(); observer = new MutationObserver(updateGreeting); observer.observe(document.body, { childList: true, subtree: true });
    };
    setup(); return () => { active = false; observer?.disconnect(); };
  }, []); return null;
}

const genreRoutes: Record<string, string> = {
  "/space": "space",
  "/cybersecurity": "cybersecurity",
  "/tech": "tech",
  "/aviation": "aviation",
  "/innovations": "innovation",
  "/innovation": "innovation",
  "/biobuzz": "biobuzz",
};

let page;
let pageHasFooter = false;
if (path === "/") { page = <LandingPage />; pageHasFooter = true; }
else if (path === "/home") { page = <><App /><AuthNav /></>; pageHasFooter = true; }
else if (path === "/signup") { page = <AuthPage />; pageHasFooter = true; }
else if (path === "/privacy") page = <PrivacyPage />;
else if (path === "/profile") page = <ProfilePage />;
else if (path === "/blog") page = <Blog />;
else if (genreRoutes[path]) page = <Blog initialCategory={genreRoutes[path]} />;
else if (path.startsWith("/blog/")) page = <ArticlePage slug={decodeURIComponent(path.slice("/blog/".length))} />;
else if (path === "/admin") page = <><Admin /><AdminGreeting /></>;
else if (path === "/explore") page = <InfoPage kind="explore" />;
else if (path === "/categories") page = <InfoPage kind="categories" />;
else if (path === "/opportunities") page = <InfoPage kind="opportunities" />;
else if (path === "/about") page = <InfoPage kind="about" />;
else if (path === "/submit") page = <SubmitPage />;
else page = <iframe src="/404.html" title="BitBuzz 404" className="fixed inset-0 h-full w-full border-0" />;

createRoot(document.getElementById("root")!).render(<StrictMode>{pageHasFooter ? page : <>{page}<SiteFooter /></>}</StrictMode>);
