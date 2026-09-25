const STARTER_HEADLINES = [
  { title: "NASA’s James Webb Telescope captures new details of the Lion Nebula", url: "https://science.nasa.gov/missions/webb/lion-nebula-roars-to-life-with-nasas-webb/", source: "science.nasa.gov", breaking: false },
  { title: "NASA delivers navigation system for commercial lunar relay", url: "https://www.nasa.gov/technology/space-comms/nasa-delivers-navigation-system-for-commercial-lunar-relay/", source: "nasa.gov", breaking: false },
  { title: "Educators and teens get hands-on with NASA TEMPO air-quality data", url: "https://science.nasa.gov/learning-resources/science-activation/educators-teens-get-hands-on-with-tempo-data-to-help-investigate-local-air-quality/", source: "science.nasa.gov", breaking: false },
  { title: "NASA tests a featherweight radar antenna for Mars helicopters", url: "https://science.nasa.gov/photojournal/antenna-testing-for-nasas-skyfall-mission/", source: "science.nasa.gov", breaking: false },
  { title: "Astronomy educators are bringing modern NASA resources into the classroom", url: "https://science.nasa.gov/learning-resources/science-activation/community-college-instructors-bring-astronomy-textbook-into-21st-century/", source: "science.nasa.gov", breaking: false },
];

const TRUSTED_HOSTS = ["nasa.gov", "science.nasa.gov", "jpl.nasa.gov", "esa.int", "noaa.gov", "oceantoday.noaa.gov", "api.nasa.gov", "images.nasa.gov"];
const BLOCKED_TERMS = /\b(?:adult|porn|sexual|sexually|explicit|graphic|gore|gruesome|murder|killed|killing|suicide|self-harm|terror|terrorist|bombing|weapon|weapons|shooting|gun|drug|cocaine|heroin|meth|fentanyl|gambling|casino|betting|politic|election|party|candidate|war|warfare|combat|military|invasion|crime|criminal)\b/i;

function isTrustedUrl(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return TRUSTED_HOSTS.some((allowed) => host === allowed || host.endsWith("." + allowed));
  } catch { return false; }
}

function isKidSafeTitle(title: string) {
  const clean = title.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return clean.length >= 12 && clean.length <= 180 && !BLOCKED_TERMS.test(clean);
}

function moderate(items: any[]) {
  return items.filter((item) => item?.title && item?.url).map((item) => ({
    title: String(item.title).trim(), url: String(item.url), source: String(item.source || "News"), breaking: Boolean(item.breaking)
  })).filter((item) => isTrustedUrl(item.url) && isKidSafeTitle(item.title));
}

function parseRss(xml: string, source: string) {
  return [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => {
    const item = match[0];
    const read = (tag: string) => {
      const found = item.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)</" + tag + ">", "i"));
      return found?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
    };
    return { title: read("title"), url: read("link"), source, breaking: false };
  });
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal, headers: { "User-Agent": "BitBuzz-Radar/1.0" } });
    if (!response.ok) return "";
    return await response.text();
  } catch { return ""; } finally { clearTimeout(timeout); }
}

async function fetchTrustedFeeds() {
  const feeds = [
    ["https://www.nasa.gov/rss/dyn/breaking_news.rss", "nasa.gov"],
    ["https://www.jpl.nasa.gov/feeds/news/", "jpl.nasa.gov"],
    ["https://www.esa.int/rssfeed/Our_Activities/Space_News", "esa.int"],
    ["https://oceanservice.noaa.gov/rss/oceanfacts.xml", "noaa.gov"],
  ] as const;
  const responses = await Promise.all(feeds.map(async ([url, source]) => parseRss(await fetchText(url), source)));
  return responses.flat();
}

async function fetchNasaImageLibrary() {
  const topics = ["space", "astronomy", "technology", "aviation"];
  const results = await Promise.all(topics.map(async (topic) => {
    const url = new URL("https://images-api.nasa.gov/search");
    url.searchParams.set("q", topic); url.searchParams.set("media_type", "image"); url.searchParams.set("page_size", "5");
    const text = await fetchText(url.toString());
    if (!text) return [];
    try {
      const data = JSON.parse(text);
      return (data?.collection?.items || []).map((item: any) => ({ title: item?.data?.[0]?.title, url: item?.links?.[0]?.href, source: "images.nasa.gov", breaking: false }));
    } catch { return []; }
  }));
  return results.flat();
}

async function fetchNasaApod() {
  const key = process.env.NASA_API_KEY || "DEMO_KEY";
  const text = await fetchText("https://api.nasa.gov/planetary/apod?api_key=" + encodeURIComponent(key));
  if (!text) return [];
  try { const item = JSON.parse(text); return [{ title: item?.title, url: item?.url || item?.hdurl, source: "api.nasa.gov", breaking: false }]; }
  catch { return []; }
}

function mergeHeadlines(...groups: any[][]) {
  const safe = moderate(groups.flat());
  const seen = new Set<string>();
  return [...safe, ...STARTER_HEADLINES].filter((item) => { if (seen.has(item.url)) return false; seen.add(item.url); return true; }).slice(0, 12);
}

export default async function handler(req: Request) {
  const apiKey = process.env.HACKCLUB_SEARCH_API_KEY;
  const searchPromise = apiKey ? (async () => {
    const url = new URL("https://search.hackclub.com/res/v1/news/search");
    url.searchParams.set("q", "space technology science aviation innovation"); url.searchParams.set("search_lang", "en"); url.searchParams.set("count", "12"); url.searchParams.set("safesearch", "strict"); url.searchParams.set("freshness", "pd");
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 3000);
    try {
      const response = await fetch(url, { headers: { Authorization: "Bearer " + apiKey }, cache: "no-store", signal: controller.signal });
      if (!response.ok) return [];
      const data = await response.json();
      return moderate((Array.isArray(data?.results) ? data.results : []).map((item: any) => ({ title: item?.title, url: item?.url, source: item?.meta_url?.hostname || "News", breaking: Boolean(item?.breaking) })));
    } catch { return []; } finally { clearTimeout(timeout); }
  })() : Promise.resolve([]);

  const [feeds, nasaImages, apod, search] = await Promise.all([fetchTrustedFeeds(), fetchNasaImageLibrary(), fetchNasaApod(), searchPromise]);
  const headlines = mergeHeadlines(search, feeds, nasaImages, apod);

  return new Response(JSON.stringify(headlines), { status: 200, headers: {
    "Content-Type": "application/json",
    "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400",
    "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=86400, stale-if-error=86400"
  }});
}