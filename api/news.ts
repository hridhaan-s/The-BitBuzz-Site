const STARTER_HEADLINES = [
  { title: "ISRO completes the GSLV-F17 mission and places EOS-05 into orbit", url: "https://www.isro.gov.in/", source: "ISRO", category: "SPACE", summary: "India's space agency reports the successful completion of its latest GSLV mission.", publishedAt: "2026-09-04T00:00:00Z" },
  { title: "ISRO reports new Aditya-L1 observations of the Sun", url: "https://www.isro.gov.in/", source: "ISRO", category: "SCIENCE", summary: "New observations from India's solar mission are adding to scientists' understanding of solar activity.", publishedAt: "2026-08-01T00:00:00Z" },
  { title: "JAXA prepares the MMX mission to explore the moons of Mars", url: "https://www.jaxa.jp/", source: "JAXA", category: "SPACE", summary: "Japan's MMX mission is being prepared to study Phobos and Deimos, the two small moons of Mars.", publishedAt: "2026-08-20T00:00:00Z" },
  { title: "China's space agency reports a series of successful satellite launches", url: "https://www.cnsa.gov.cn/", source: "CNSA", category: "SPACE", summary: "CNSA continues reporting new orbital missions and satellite launches from China.", publishedAt: "2026-09-20T00:00:00Z" },
  { title: "DLR highlights new European launch and spacecraft technology", url: "https://www.dlr.de/en/latest", source: "DLR", category: "TECH", summary: "Germany's aerospace research agency is tracking new launch and space technology developments.", publishedAt: "2026-09-06T00:00:00Z" },
  { title: "Microsoft Research explores smarter AI for physical robots", url: "https://www.microsoft.com/en-us/research/blog/", source: "Microsoft Research", category: "TECH", summary: "Researchers are exploring ways to make AI systems more efficient and useful in real-world robotics.", publishedAt: "2026-09-23T00:00:00Z" },
];

const TRUSTED_HOSTS = [
  "nasa.gov", "science.nasa.gov", "jpl.nasa.gov", "esa.int", "noaa.gov", "oceantoday.noaa.gov",
  "api.nasa.gov", "images.nasa.gov", "images-api.nasa.gov", "isro.gov.in", "jaxa.jp", "isas.jaxa.jp",
  "cnsa.gov.cn", "roscosmos.ru", "cnes.fr", "dlr.de", "gov.uk", "microsoft.com", "blog.google",
  "research.google", "spectrum.ieee.org", "arstechnica.com", "technologyreview.com"
];

const BLOCKED_TERMS = /\b(?:adult|porn|sexual|sexually|explicit|graphic|gore|gruesome|murder|killed|killing|suicide|self-harm|terror|terrorist|bombing|weapon|weapons|shooting|gun|drug|cocaine|heroin|meth|fentanyl|gambling|casino|betting|politic|election|party|candidate|war|warfare|combat|military|invasion|crime|criminal)\b/i;

type RadarItem = {
  title: string;
  url: string;
  source?: string;
  category?: string;
  summary?: string;
  publishedAt?: string;
  breaking?: boolean;
};

function isTrustedUrl(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return TRUSTED_HOSTS.some((allowed) => host === allowed || host.endsWith("." + allowed));
  } catch { return false; }
}

function clean(value: unknown) {
  return String(value || "").replace(/<[^>]+>/g, " ").replace(/<!\[CDATA\[|\]\]>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

function categoryFor(title: string, source = "") {
  const text = title + " " + source;
  if (/rocket|launch|space|nasa|isro|jaxa|cnsa|roscosmos|esa|cnes|dlr|orbit|moon|mars|satellite|astronomy|spacecraft/i.test(text)) return "SPACE";
  if (/aviation|aircraft|airline|flight|boeing|airbus|drone/i.test(text)) return "AVIATION";
  if (/ai|robot|chip|semiconductor|software|quantum|comput|cyber|technology|tech|machine learning/i.test(text)) return "TECH";
  return "SCIENCE";
}

function isKidSafe(item: RadarItem) {
  const title = clean(item.title);
  const summary = clean(item.summary);
  return title.length >= 12 && title.length <= 220 && !BLOCKED_TERMS.test(title + " " + summary);
}

function moderate(items: RadarItem[]) {
  return items
    .filter((item) => item?.title && item?.url)
    .map((item) => ({
      title: clean(item.title),
      url: String(item.url),
      source: clean(item.source || "News"),
      category: item.category || categoryFor(clean(item.title), clean(item.source)),
      summary: clean(item.summary).slice(0, 320),
      publishedAt: item.publishedAt || undefined,
      breaking: Boolean(item.breaking)
    }))
    .filter((item) => isTrustedUrl(item.url) && isKidSafe(item));
}

function parseRss(xml: string, source: string, category?: string) {
  return [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => {
    const item = match[0];
    const read = (tag: string) => {
      const found = item.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i"));
      return found ? clean(found[1]) : "";
    };
    return {
      title: read("title"),
      url: read("link"),
      source,
      category: category || categoryFor(read("title"), source),
      summary: read("description"),
      publishedAt: read("pubDate") || read("published") || read("updated")
    };
  });
}

async function fetchText(url: string, timeoutMs = 2200) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { "User-Agent": "BitBuzz-Radar/2.0" }
    });
    if (!response.ok) return "";
    return await response.text();
  } catch { return ""; } finally { clearTimeout(timeout); }
}

async function fetchTrustedFeeds() {
  const feeds = [
    ["https://www.nasa.gov/rss/dyn/breaking_news.rss", "NASA", "SPACE"],
    ["https://www.jpl.nasa.gov/feeds/news/", "JPL", "SPACE"],
    ["https://www.esa.int/rssfeed/Our_Activities/Space_News", "ESA", "SPACE"],
    ["https://oceanservice.noaa.gov/rss/oceanfacts.xml", "NOAA", "SCIENCE"],
    ["https://www.dlr.de/en/latest", "DLR", "SPACE"],
  ] as const;
  const responses = await Promise.all(feeds.map(async ([url, source, category]) => parseRss(await fetchText(url), source, category)));
  return responses.flat();
}

async function fetchNasaImageLibrary() {
  const topics = ["space", "astronomy", "technology", "aviation"];
  const results = await Promise.all(topics.map(async (topic) => {
    const url = new URL("https://images-api.nasa.gov/search");
    url.searchParams.set("q", topic);
    url.searchParams.set("media_type", "image");
    url.searchParams.set("page_size", "5");
    const text = await fetchText(url.toString());
    if (!text) return [];
    try {
      const data = JSON.parse(text);
      return (data?.collection?.items || []).map((item: any) => ({
        title: item?.data?.[0]?.title,
        url: item?.links?.[0]?.href,
        source: "NASA Image Library",
        category: categoryFor(item?.data?.[0]?.title, topic),
        summary: item?.data?.[0]?.description,
        publishedAt: item?.data?.[0]?.date_created
      }));
    } catch { return []; }
  }));
  return results.flat();
}

async function fetchNasaApod() {
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  const text = await fetchText("https://api.nasa.gov/planetary/apod?api_key=" + encodeURIComponent(key));
  if (!text) return [];
  try {
    const item = JSON.parse(text);
    return [{
      title: item?.title,
      url: item?.url || item?.hdurl,
      source: "NASA APOD",
      category: "SPACE",
      summary: item?.explanation,
      publishedAt: item?.date
    }];
  } catch { return []; }
}

async function fetchSearch() {
  const apiKey = process.env.HACKCLUB_SEARCH_API_KEY;
  if (!apiKey) return [];

  const queries = [
    "space ISRO JAXA CNSA Roscosmos ESA CNES DLR NASA",
    "AI robotics semiconductors quantum computing engineering technology science"
  ];

  const results = await Promise.all(queries.map(async (query) => {
    const url = new URL("https://search.hackclub.com/res/v1/news/search");
    url.searchParams.set("q", query);
    url.searchParams.set("search_lang", "en");
    url.searchParams.set("count", "12");
    url.searchParams.set("safesearch", "strict");
    url.searchParams.set("freshness", "pd");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2200);
    try {
      const response = await fetch(url, {
        headers: { Authorization: "Bearer " + apiKey },
        cache: "no-store",
        signal: controller.signal
      });
      if (!response.ok) return [];
      const data = await response.json();
      return (Array.isArray(data?.results) ? data.results : []).map((item: any) => ({
        title: item?.title,
        url: item?.url,
        source: item?.meta_url?.hostname || "News",
        category: categoryFor(item?.title, item?.meta_url?.hostname),
        summary: item?.description,
        publishedAt: item?.published || item?.age
      }));
    } catch { return []; } finally { clearTimeout(timeout); }
  }));

  return results.flat();
}

function mergeHeadlines(...groups: RadarItem[][]) {
  const safe = moderate(groups.flat());
  const seen = new Set<string>();
  const ranked = [...safe, ...STARTER_HEADLINES]
    .filter((item) => {
      const key = item.url.replace(/\/$/, "").toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => {
      const at = a.publishedAt ? Date.parse(a.publishedAt) : 0;
      const bt = b.publishedAt ? Date.parse(b.publishedAt) : 0;
      return bt - at;
    });
  return ranked.slice(0, 30);
}

export default async function handler(_req: Request) {
  const [feeds, nasaImages, apod, search] = await Promise.all([
    fetchTrustedFeeds(),
    fetchNasaImageLibrary(),
    fetchNasaApod(),
    fetchSearch()
  ]);

  const headlines = mergeHeadlines(feeds, nasaImages, apod, search);

  return new Response(JSON.stringify(headlines), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400",
      "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=86400, stale-if-error=86400"
    }
  });
}
