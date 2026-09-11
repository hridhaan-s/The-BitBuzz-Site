import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LandingPage from "./LandingPage";
import SubmitPage from "./SubmitPage";
import "./index.css";

const url = new URL(window.location.href);
const isLegacyNewsroom = url.searchParams.get("view") === "news";
const isHome = url.pathname === "/home";
const isSubmit = url.pathname === "/submit";

if (isLegacyNewsroom && !isHome) {
  window.history.replaceState({}, "", "/home");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isSubmit ? <SubmitPage /> : isHome || isLegacyNewsroom ? <App /> : <LandingPage />}
  </StrictMode>,
);
