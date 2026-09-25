export default async function handler(req: Request) {
  const apiKey = process.env.HACKCLUB_SEARCH_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "News service is not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  const url = new URL("https://search.hackclub.com/res/v1/news/search");
  url.searchParams.set("q", "space OR cybersecurity OR technology OR aviation OR innovation");
  url.searchParams.set("country", "IN");
  url.searchParams.set("search_lang", "en");
  url.searchParams.set("count", "12");
  url.searchParams.set("safesearch", "strict");
  url.searchParams.set("freshness", "pd");

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });

    if (!response.ok) {
      return new Response(JSON.stringify({ error: "News provider unavailable" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const results = Array.isArray(data?.results) ? data.results : [];

    const headlines = results
      .filter((item: any) => item?.title && item?.url)
      .map((item: any) => ({
        title: String(item.title).trim(),
        url: String(item.url),
        source: String(item.meta_url?.hostname || "News"),
        breaking: Boolean(item.breaking),
      }))
      .slice(0, 10);

    return new Response(JSON.stringify(headlines), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400",
        "CDN-Cache-Control": "public, max-age=300, stale-while-revalidate=86400, stale-if-error=86400",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Unable to fetch news" }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
