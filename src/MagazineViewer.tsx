import { useEffect, useMemo, useRef, useState } from "react";
import UniversalNavbar from "./UniversalNavbar";
import { supabase } from "./lib/supabase";
import { MAGAZINE_CSS, MagazinePage, PAGE_COLS, PrintIssue, type Article, type MagPage, type Magazine, type Publication } from "./MagazineShared";

function useMedia(q: string) {
  const [m, setM] = useState(() => window.matchMedia(q).matches);
  useEffect(() => { const mq = window.matchMedia(q); const on = () => setM(mq.matches); mq.addEventListener("change", on); return () => mq.removeEventListener("change", on); }, [q]);
  return m;
}

// On phones a fixed A4 page is unreadable, so template pages reflow into a scrolling article.
// Free-design pages (.mz-fixed) keep their exact layout, since moving elements would break the design.
const READER_CSS = `
.mz-reader .mz-paper:not(.mz-fixed){--fs-kick:10px;--fs-h1:46px;--fs-h2:38px;--fs-h3:17px;--fs-h4:20px;--fs-body:16.5px;--fs-quote:40px;--fs-pull:22px;--fs-small:11px;--pad:26px;aspect-ratio:auto;container-type:normal;width:100%;box-shadow:none}
.mz-reader .mz-paper:not(.mz-fixed) .mz-pad{height:auto;overflow:visible;clip-path:none;padding-bottom:60px}
.mz-reader .mz-t-cover{aspect-ratio:3/4}
.mz-reader .mz-cover-copy h1{font-size:52px}.mz-reader .mz-cover-copy p{font-size:15px}.mz-reader .mz-mast{font-size:22px;top:22px;left:22px;right:22px;padding-bottom:12px}.mz-reader .mz-logo{width:30px;height:30px;border-radius:7px}
.mz-reader .mz-hero{height:auto;aspect-ratio:16/10;margin-bottom:18px}
.mz-reader .mz-cols,.mz-reader .mz-grid{grid-template-columns:1fr;gap:22px}
.mz-reader .mz-paper hr{border-top-width:2px;width:60px;margin:18px 0}
.mz-reader .mz-close{min-height:70vh}
.mz-reader .mz-folio{bottom:22px}
.mz-reader .mz-body{text-align:left}`;

export default function MagazineViewer({ slug, id }: { slug: string; id?: string }) {
  const [pub, setPub] = useState<Publication | null>(null);
  const [mag, setMag] = useState<Magazine | null>(null);
  const [issues, setIssues] = useState<Magazine[]>([]);
  const [pages, setPages] = useState<MagPage[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
