import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import LandingPage from "./LandingPage";
import "./index.css";

const isNewsroom = new URLSearchParams(window.location.search).get("view") === "news";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isNewsroom ? <App /> : <LandingPage />}
  </StrictMode>,
);
