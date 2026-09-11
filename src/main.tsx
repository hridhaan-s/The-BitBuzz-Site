import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LandingPage from "./LandingPage";
import MobileAppSection from "./MobileAppSection";
import SubmitPage from "./SubmitPage";
import InfoPage from "./InfoPage";
import "./index.css";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

const isLegacyNewsroom = new URL(window.location.href).searchParams.get("view") === "news";

if (isLegacyNewsroom && path === "/") {
  window.history.replaceState({}, "", "/home");
}

const landingRoutes: Record<string, string> = {
  "#explore": "/explore",
  "#categories": "/categories",
  "#opportunities": "/opportunities",
  "#about": "/about",
};

if (path === "/") {
  window.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest("a") as HTMLAnchorElement | null;
    if (!anchor) return;
    const route = landingRoutes[anchor.getAttribute("href") || ""];
    if (!route) return;
    event.preventDefault();
    window.location.href = route;
  });
}

let page;

if (path === "/") {
  page = <><LandingPage /><MobileAppSection /></>;
} else if (path === "/home") {
  page = <App />;
} else if (path === "/explore") {
  page = <InfoPage kind="explore" />;
} else if (path === "/categories") {
  page = <InfoPage kind="categories" />;
} else if (path === "/opportunities") {
  page = <InfoPage kind="opportunities" />;
} else if (path === "/about") {
  page = <InfoPage kind="about" />;
} else if (path === "/submit") {
  page = <SubmitPage />;
} else {
  page = <iframe src="/404.html" title="BitBuzz 404" className="fixed inset-0 h-full w-full border-0" />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>{page}</StrictMode>,
);
