const STARTER_HEADLINES = [
  {
    title: "NASA’s James Webb Telescope captures new details of the Lion Nebula",
    url: "https://science.nasa.gov/missions/webb/lion-nebula-roars-to-life-with-nasas-webb/",
    source: "science.nasa.gov",
    breaking: false,
  },
  {
    title: "NASA delivers navigation system for commercial lunar relay",
    url: "https://www.nasa.gov/technology/space-comms/nasa-delivers-navigation-system-for-commercial-lunar-relay/",
    source: "nasa.gov",
    breaking: false,
  },
  {
    title: "Educators and teens get hands-on with NASA TEMPO air-quality data",
    url: "https://science.nasa.gov/learning-resources/science-activation/educators-teens-get-hands-on-with-tempo-data-to-help-investigate-local-air-quality/",
    source: "science.nasa.gov",
    breaking: false,
  },
  {
    title: "NASA tests a featherweight radar antenna for SkyFall Mars helicopters",
    url: "https://science.nasa.gov/photojournal/antenna-testing-for-nasas-skyfall-mission/",
    source: "science.nasa.gov",
    breaking: false,
  },
  {
    title: "Astronomy educators are bringing modern NASA resources into the classroom",
    url: "https://science.nasa.gov/learning-resources/science-activation/community-college-instructors-bring-astronomy-textbook-into-21st-century/",
    source: "science.nasa.gov",
    breaking: false,
  },
];

function mergeHeadlines(live: any[]) {
  const valid = live
    .filter((item: any) => item?.title && item?.url)
    .map((item: any) => ({
      title: String(item.title).trim(),
      url: String(item.url),
      source: String(item.meta_url?.hostname || "News"),
      breaking: Boolean(item.breaking),
    }));

  const seen = new Set(valid.map((item) => item.url));
  return [...valid, ...STARTER_HEADLINES.filter((item) => !seen.has(item.url))].slice(0, 10);
}

export default async function handler(req: Request) {
  const apiKey = process.env.HACKCLUB_SEARCH_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify(STARTER_HEADLINES), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400",
      },
    });
  }

  const url = new URL("https://search.hackclub.com/res/v1/news/search");
  url.searchParams.set("q", "space technology science aviation innovation");
  url.searchParams.set("search_lang", "en");
  url.searchParams.set("count", "12");
  url.searchParams.set("safesearch", "strict");
  url.searchParams.set("freshness", "pd");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return new Response(JSON.stringify(STARTER_HEADLINES), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400",
        },
      });
    }

    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    const headlines = mergeHeadlines(results);

    return new Response(JSON.stringify(headlines), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400",
        "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=86400, stale-if-error=86400",
      },
    });
  } catch {
    return new Response(JSON.stringify(STARTER_HEADLINES), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400",
      },
    });
  }
}
