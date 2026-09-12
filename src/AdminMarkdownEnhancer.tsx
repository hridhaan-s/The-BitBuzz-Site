import { useEffect } from "react";
import { renderMarkdown } from "./Markdown";

const button = (label: string, title: string) => {
  const el = document.createElement("button");
  el.type = "button"; el.textContent = label; el.title = title;
  el.style.cssText = "border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.65);border-radius:7px;padding:5px 8px;font:600 10px/1 ui-sans-serif;cursor:pointer";
  return el;
};

function enhance(textarea: HTMLTextAreaElement) {
  if (textarea.dataset.markdownEnhanced === "true") return;
  textarea.dataset.markdownEnhanced = "true";
  const parent = textarea.parentElement;
  if (!parent) return;
  const toolbar = document.createElement("div");
  toolbar.style.cssText = "display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px";
  const preview = document.createElement("div");
  preview.style.cssText = "display:none;margin-top:10px;min-height:160px;overflow:auto;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#050505;padding:18px;color:rgba(255,255,255,.72);font:15px/1.8 ui-sans-serif";
  const updatePreview = () => {
    preview.innerHTML = renderMarkdown(textarea.value) || '<p style="color:rgba(255,255,255,.25)">Markdown preview will appear here.</p>';
  };
  const setValue = (value: string, start: number, end: number) => {
    const proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
    proto?.call(textarea, value);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus(); textarea.setSelectionRange(start, end);
    updatePreview();
  };
  const wrap = (before: string, after = before, placeholder = "text") => {
    const start = textarea.selectionStart; const end = textarea.selectionEnd;
    const selected = textarea.value.slice(start, end) || placeholder;
    setValue(textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end), start + before.length, start + before.length + selected.length);
  };
  const linePrefix = (prefix: string) => {
    const start = textarea.selectionStart; const lineStart = textarea.value.lastIndexOf("\n", start - 1) + 1;
    setValue(textarea.value.slice(0, lineStart) + prefix + textarea.value.slice(lineStart), start + prefix.length, textarea.selectionEnd + prefix.length);
  };
  const tools = [
    ["B", "Bold", () => wrap("**")], ["I", "Italic", () => wrap("*")], ["H2", "Heading", () => linePrefix("## ")],
    ["•", "Bullet list", () => linePrefix("- ")], ["1.", "Numbered list", () => linePrefix("1. ")], [">", "Quote", () => linePrefix("> ")],
    ["`", "Inline code", () => wrap("`")], ["Link", "Markdown link", () => wrap("[", "](https://example.com)", "link text")],
  ] as const;
  tools.forEach(([label, title, action]) => { const el = button(label, title); el.onclick = action; toolbar.appendChild(el); });
  const edit = button("Edit", "Edit Markdown"); const prev = button("Preview", "Preview rendered Markdown");
  edit.onclick = () => { textarea.style.display = "block"; preview.style.display = "none"; };
  prev.onclick = () => { updatePreview(); textarea.style.display = "none"; preview.style.display = "block"; };
  toolbar.append(edit, prev);
  parent.insertBefore(toolbar, textarea);
  parent.appendChild(preview);
  textarea.addEventListener("input", updatePreview);
  updatePreview();
}

export default function AdminMarkdownEnhancer() {
  useEffect(() => {
    let observer: MutationObserver | null = null;
    const scan = () => {
      const labels = Array.from(document.querySelectorAll("label"));
      const label = labels.find(node => node.querySelector("span")?.textContent?.trim().toLowerCase() === "article body");
      const textarea = label?.querySelector("textarea") as HTMLTextAreaElement | null;
      if (textarea) enhance(textarea);
    };
    const timer = window.setTimeout(scan, 50);
    observer = new MutationObserver(scan); observer.observe(document.body, { childList: true, subtree: true });
    return () => { window.clearTimeout(timer); observer?.disconnect(); };
  }, []);
  return null;
}
