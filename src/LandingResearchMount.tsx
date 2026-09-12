import { useEffect } from "react";
import { createRoot, Root } from "react-dom/client";
import ResearchLibrary from "./ResearchLibrary";

export default function LandingResearchMount() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    let root: Root | null = null;
    let host: HTMLElement | null = null;

    const mount = () => {
      if (document.querySelector("[data-bitbuzz-research-host]")) return;

      const flagHeading = Array.from(document.querySelectorAll("h2")).find(
        (node) => node.textContent?.trim() === "Flag It"
      );
      const flagSection = flagHeading?.closest("section");
      if (!flagSection) return;

      const faqHeading = Array.from(document.querySelectorAll("h2")).find(
        (node) => node.textContent?.trim() === "Questions? Answers."
      );
      faqHeading?.closest("section")?.remove();

      host = document.createElement("div");
      host.dataset.bitbuzzResearchHost = "true";
      host.className = "w-full";
      flagSection.insertAdjacentElement("afterend", host);
      root = createRoot(host);
      root.render(<ResearchLibrary />);
    };

    const frame = window.requestAnimationFrame(mount);
    return () => {
      window.cancelAnimationFrame(frame);
      root?.unmount();
      host?.remove();
    };
  }, []);

  return null;
}
