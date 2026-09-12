import React from "react";

const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
const inline = (value: string) => escape(value)
  .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)(?:\s+\"([^\"]*)\")?\)/g, '<img src="$2" alt="$1" title="$3" loading="lazy" />')
  .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/__(.+?)__/g, '<strong>$1</strong>')
  .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
  .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<em>$1</em>');

export function renderMarkdown(markdown: string) {
  const source = (markdown || "").replace(/\r\n?/g, "\n").trim();
  if (!source) return "";
  const lines = source.split("\n"); const html: string[] = []; let paragraph: string[] = [];
  let list: "ul" | "ol" | null = null; let code = false; let codeBuffer: string[] = [];
  const flushParagraph = () => { if (paragraph.length) { html.push(`<p>${paragraph.map(inline).join("<br />")}</p>`); paragraph = []; } };
  const closeList = () => { if (list) { html.push(`</${list}>`); list = null; } };
  const closeCode = () => { if (code) { html.push(`<pre><code>${escape(codeBuffer.join("\n"))}</code></pre>`); code = false; codeBuffer = []; } };
  for (const line of lines) {
    if (/^```/.test(line.trim())) { flushParagraph(); closeList(); if (code) closeCode(); else code = true; continue; }
    if (code) { codeBuffer.push(line); continue; }
    if (!line.trim()) { flushParagraph(); closeList(); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { flushParagraph(); closeList(); const level = heading[1].length; html.push(`<h${level}>${inline(heading[2])}</h${level}>`); continue; }
    if (/^---+$/.test(line.trim())) { flushParagraph(); closeList(); html.push("<hr />"); continue; }
    if (/^>\s?/.test(line)) { flushParagraph(); closeList(); html.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`); continue; }
    const bullet = line.match(/^\s*[-*+]\s+(.+)$/); const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (bullet || ordered) { flushParagraph(); const nextList = bullet ? "ul" : "ol"; if (list !== nextList) { closeList(); html.push(`<${nextList}>`); list = nextList; } html.push(`<li>${inline((bullet || ordered)![1])}</li>`); continue; }
    closeList(); paragraph.push(line);
  }
  flushParagraph(); closeList(); closeCode(); return html.join("\n");
}

export function Markdown({ value, className = "" }: { value: string; className?: string }) {
  return <div className={`bb-markdown ${className}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}><style>{`\n.bb-markdown{font-size:17px;line-height:1.85;color:rgba(255,255,255,.72);word-break:break-word}.bb-markdown p{margin:0 0 1.35em}.bb-markdown h1,.bb-markdown h2,.bb-markdown h3{font-family:ui-serif,Georgia,serif;color:#fff;letter-spacing:-.045em;line-height:.98;margin:1.8em 0 .65em}.bb-markdown h1{font-size:2.5rem}.bb-markdown h2{font-size:2rem}.bb-markdown h3{font-size:1.45rem}.bb-markdown strong{color:#fff;font-weight:650}.bb-markdown em{color:rgba(255,255,255,.86)}.bb-markdown a{color:#fff;text-decoration:underline;text-decoration-color:rgba(255,255,255,.3);text-underline-offset:3px}.bb-markdown a:hover{text-decoration-color:#fff}.bb-markdown ul,.bb-markdown ol{margin:0 0 1.4em;padding-left:1.5em}.bb-markdown li{margin:.45em 0;padding-left:.25em}.bb-markdown blockquote{margin:1.8em 0;padding:.15em 0 .15em 1.2em;border-left:2px solid rgba(255,255,255,.25);color:rgba(255,255,255,.5);font-family:ui-serif,Georgia,serif;font-size:1.15em}.bb-markdown hr{border:0;border-top:1px solid rgba(255,255,255,.1);margin:2.5em 0}.bb-markdown code{border:1px solid rgba(255,255,255,.1);background:#090909;border-radius:5px;padding:.15em .35em;font-size:.88em;color:#fff}.bb-markdown pre{overflow:auto;margin:1.6em 0;padding:1.2em;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#070707}.bb-markdown pre code{border:0;background:none;padding:0}.bb-markdown img{display:block;width:100%;height:auto;margin:2em 0;border-radius:8px}.bb-markdown img+br{display:none}@media(max-width:640px){.bb-markdown{font-size:16px;line-height:1.8}.bb-markdown h1{font-size:2rem}.bb-markdown h2{font-size:1.65rem}}\n`}</style></div>;
}
