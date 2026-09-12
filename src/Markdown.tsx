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
  const lines = source.split("\n");
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: "ul" | "ol" | null = null;
  let code = false;
  let codeBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${paragraph.map(inline).join("<br />")}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (list) { html.push(`</${list}>`); list = null; }
  };
  const closeCode = () => {
    if (code) {
      html.push(`<pre><code>${escape(codeBuffer.join("\n"))}</code></pre>`);
      code = false; codeBuffer = [];
    }
  };

  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      flushParagraph(); closeList();
      if (code) closeCode(); else code = true;
      continue;
    }
    if (code) { codeBuffer.push(line); continue; }
    if (!line.trim()) { flushParagraph(); closeList(); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { flushParagraph(); closeList(); const level = heading[1].length; html.push(`<h${level}>${inline(heading[2])}</h${level}>`); continue; }
    if (/^---+$/.test(line.trim())) { flushParagraph(); closeList(); html.push("<hr />"); continue; }
    if (/^>\s?/.test(line)) { flushParagraph(); closeList(); html.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`); continue; }
    const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (bullet || ordered) {
      flushParagraph();
      const nextList = bullet ? "ul" : "ol";
      if (list !== nextList) { closeList(); html.push(`<${nextList}>`); list = nextList; }
      html.push(`<li>${inline((bullet || ordered)![1])}</li>`);
      continue;
    }
    closeList(); paragraph.push(line);
  }
  flushParagraph(); closeList(); closeCode();
  return html.join("\n");
}

export function Markdown({ value, className = "" }: { value: string; className?: string }) {
  return <div className={`bb-markdown ${className}`} dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }} />;
}
