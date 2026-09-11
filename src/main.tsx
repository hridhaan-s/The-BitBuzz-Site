import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LandingPage from "./LandingPage";
import "./index.css";

const url = new URL(window.location.href);
const isLegacyNewsroom = url.searchParams.get("view") === "news";
const isHome = url.pathname === "/home";

if (isLegacyNewsroom && !isHome) {
  window.history.replaceState({}, "", "/home");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isHome || isLegacyNewsroom ? <App /> : <LandingPage />}
  </StrictMode>,
);
