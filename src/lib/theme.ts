export type Theme = "light" | "dark" | "system";

export function getInitialTheme(): "light" | "dark" {
  const saved = localStorage.getItem("bitbuzz_theme") as Theme | null;
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("bitbuzz_theme", theme);
}
