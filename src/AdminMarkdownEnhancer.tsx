import { useEffect } from "react";
import { renderMarkdown } from "./Markdown";

const button = (label: string, title: string) => {
  const el = document.createElement("button");
  el.type = "button"; el.textContent = label; el.title = title;
  el.style.cssText = "border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.72);border-radius:7px;padding:6px 9px;font:600 10px/1 ui-sans-serif;cursor:pointer;min-width:30px";
  el.onmouseenter = () => { el.style.background = "rgba(255,255,255,.09)"; el.style.color = "#fff"; };
  el.onmouseleave = () => { el.style.background = "rgba(255,255,255,.04)"; el.style.color = "rgba(255,255,255,.72)"; };
  return el;
};

const select = (title: string) => {
  const el = document.createElement("select");
  el.title = title;
  el.style.cssText = "border:1px solid rgba(255,255,255,.1);background:#0a0a0a;color:rgba(255,255,255,.72);border-radius:7px;padding:6px 8px;font:600 10px/1 ui-sans-serif;cursor:pointer;outline:none";
  return el;
};

function enhance(textarea: HTMLTextAreaElement) {
  if (textarea.dataset.markdownEnhanced === "true") return;
  textarea.dataset.markdownEnhanced = "true";
  const parent = textarea.parentElement;
  if (!parent) return;

  const shell = document.createElement("div");
  shell.style.cssText = "border:1px solid rgba(255,255,255,.1);border-radius:12px;overflow:hidden;background:#030303";
  const toolbar = document.createElement("div");
  toolbar.style.cssText = "display:flex;align-items:center;flex-wrap:wrap;gap:5px;padding:8px;border-bottom:1px solid rgba(255,255,255,.1);background:#080808";
  const preview = document.createElement("div");
  preview.style.cssText = "display:none;margin:0;min-height:260px;max-height:650px;overflow:auto;background:#050505;padding:24px;color:rgba(255,255,255,.72);font:16px/1.8 ui-sans-serif";
  textarea.style.cssText += ";border:0!important;border-radius:0!important;background:#020202!important;min-height:360px!important;padding:20px!important;outline:none!important";

  const updatePreview = () => {
    preview.innerHTML = renderMarkdown(textarea.value) || '<p style="color:rgba(255,255,255,.25)">Your published article preview will appear here.</p>';
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
    const next = textarea.value.slice(0, start) + before + selected + after + textarea.value.slice(end);
    setValue(next, start + before.length, start + before.length + selected.length);
  };
  const linePrefix = (prefix: string) => {
    const start = textarea.selectionStart; const end = textarea.selectionEnd;
    const lineStart = textarea.value.lastIndexOf("\n", start - 1) + 1;
    setValue(textarea.value.slice(0, lineStart) + prefix + textarea.value.slice(lineStart), start + prefix.length, end + prefix.length);
  };
  const insert = (value: string) => {
    const start = textarea.selectionStart; const end = textarea.selectionEnd;
    const next = textarea.value.slice(0, start) + value + textarea.value.slice(end);
    setValue(next, start + value.length, start + value.length);
  };

  const separator = () => {
    const el = document.createElement("span"); el.style.cssText = "width:1px;height:22px;background:rgba(255,255,255,.1);margin:0 2px"; return el;
  };

  const add = (label: string, title: string, action: () => void) => {
    const el = button(label, title); el.onclick = action; toolbar.appendChild(el);
  };

  add("B", "Bold", () => wrap("**"));
  add("I", "Italic", () => wrap("*"));
  add("U", "Underline", () => wrap("<u>", "</u>"));
  add("S", "Strikethrough", () => wrap("~~"));
  add("H1", "Heading 1", () => linePrefix("# "));
  add("H2", "Heading 2", () => linePrefix("## "));
  add("H3", "Heading 3", () => linePrefix("### "));
  toolbar.appendChild(separator());
  add("•", "Bullet list", () => linePrefix("- "));
  add("1.", "Numbered list", () => linePrefix("1. "));
  add(">", "Quote", () => linePrefix("> "));
  add("—", "Divider", () => insert("\n\n---\n\n"));
  toolbar.appendChild(separator());
  add("Code", "Inline code", () => wrap("`"));
  add("Code block", "Code block", () => wrap("\n```\n", "\n```\n", "code"));
  add("Link", "Link", () => wrap("[", "](https://example.com)", "link text"));
  add("Image", "Image URL", () => wrap("![", "](https://example.com/image.jpg)", "image alt text"));
  toolbar.appendChild(separator());

  const font = select("Font family");
  [["Sans", "sans"], ["Serif", "serif"], ["Mono", "mono"], ["Editorial", "editorial"]].forEach(([label, value]) => {
    const option = document.createElement("option"); option.textContent = label; option.value = value; font.appendChild(option);
  });
  font.onchange = () => {
    const value = font.value;
    const classes: Record<string, string> = { sans: "bb-font-sans", serif: "bb-font-serif", mono: "bb-font-mono", editorial: "bb-font-editorial" };
    wrap(`<span class=\"${classes[value]}\">`, "</span>");
    font.value = "sans";
  };
  toolbar.appendChild(font);

  const size = select("Text size");
  [["Small", "sm"], ["Normal", "md"], ["Large", "lg"], ["XL", "xl"]].forEach(([label, value]) => {
    const option = document.createElement("option"); option.textContent = label; option.value = value; size.appendChild(option);
  });
  size.onchange = () => {
    const classes: Record<string, string> = { sm: "bb-size-sm", md: "bb-size-md", lg: "bb-size-lg", xl: "bb-size-xl" };
    wrap(`<span class=\"${classes[size.value]}\">`, "</span>"); size.value = "md";
  };
  toolbar.appendChild(size);

  const align = select("Text alignment");
  [["Left", "left"], ["Center", "center"], ["Right", "right"]].forEach(([label, value]) => {
    const option = document.createElement("option"); option.textContent = label; option.value = value; align.appendChild(option);
  });
  align.onchange = () => {
    wrap(`<div class=\"bb-align-${align.value}\">`, "</div>"); align.value = "left";
  };
  toolbar.appendChild(align);

  toolbar.appendChild(separator());
  add("↶", "Undo", () => document.execCommand("undo"));
  add("↷", "Redo", () => document.execCommand("redo"));
  add("Clear", "Remove basic formatting", () => {
    const start = textarea.selectionStart; const end = textarea.selectionEnd; const selected = textarea.value.slice(start, end);
    const clean = selected.replace(/\*\*|__|\*|_|~~|`/g, "").replace(/<\/?(?:u|span|div)(?: class=\"[^\"]+\")?>/g, "");
    setValue(textarea.value.slice(0, start) + clean + textarea.value.slice(end), start, start + clean.length);
  });

  const edit = button("Edit", "Edit article"); const prev = button("Preview", "Preview published article");
  edit.onclick = () => { textarea.style.display = "block"; preview.style.display = "none"; edit.style.background = "rgba(255,255,255,.1)"; prev.style.background = "rgba(255,255,255,.04)"; };
  prev.onclick = () => { updatePreview(); textarea.style.display = "none"; preview.style.display = "block"; prev.style.background = "rgba(255,255,255,.1)"; edit.style.background = "rgba(255,255,255,.04)"; };
  toolbar.append(edit, prev);

  shell.appendChild(toolbar);
  parent.insertBefore(shell, textarea);
  shell.appendChild(textarea);
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
