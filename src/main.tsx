import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LandingPage from "./LandingPage";
import SubmitPage from "./SubmitPage";
import "./index.css";

const path = window.location.pathname.replace(/\/+$/, "") || "/";

const isLegacyNewsroom = new URL(window.location.href).searchParams.get("view") === "news";

if (isLegacyNewsroom && path === "/") {
  window.history.replaceState({}, "", "/home");
}

let page;

if (path === "/") {
  page = <LandingPage />;
} else if (path === "/home") {
  page = <App />;
} else if (path === "/submit") {
  page = <SubmitPage />;
} else {
  page = (
    <iframe
      src="/404.html"
      title="BitBuzz 404"
      className="fixed inset-0 h-full w-full border-0"
    />
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {page}
  </StrictMode>,
);
