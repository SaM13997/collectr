import { createServerFn } from "@tanstack/react-start";

export interface TweetMetadata {
  authorName: string;
  authorHandle: string;
  authorAvatar?: string;
  text: string;
  mediaUrl?: string;
}

const inflight = new Map<string, Promise<TweetMetadata | null>>();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

const fetchTweetMetadataServer = createServerFn({ method: "GET" })
  .inputValidator((input: { tweetUrl: string }) => input)
  .handler(async ({ data }) => {
    const oembed = await fetchFromOembed(data.tweetUrl);
    if (oembed) return oembed;

    if (SCRAPER_API_KEY) {
      const scraped = await fetchFromScraperApi(data.tweetUrl);
      if (scraped) return scraped;
    }

    return null;
  });

async function fetchFromOembed(tweetUrl: string): Promise<TweetMetadata | null> {
  try {
    const res = await fetch(
      `https://publish.twitter.com/oembed?omit_script=true&dnt=true&url=${encodeURIComponent(tweetUrl)}`
    );

    if (!res.ok) return null;

    const json = (await res.json()) as {
      author_name?: string;
      author_url?: string;
      html?: string;
    };

    const html = json.html ?? "";
    const textMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const handleMatch = html.match(/&mdash;\s+[^<]+\s+\(@([^\)]+)\)/i);

    const rawText = textMatch?.[1] ?? "";
    const text = decodeHtml(rawText.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")).trim();
    const authorHandle = handleMatch?.[1]?.trim() ?? extractHandleFromAuthorUrl(json.author_url);

    if (!text) return null;

    return {
      authorName: json.author_name?.trim() || authorHandle || "Unknown",
      authorHandle: authorHandle || "unknown",
      text,
    };
  } catch {
    return null;
  }
}

async function fetchFromScraperApi(tweetUrl: string): Promise<TweetMetadata | null> {
  try {
    const apiUrl = `https://api.scraperapi.com?api_key=${SCRAPER_API_KEY}&url=${encodeURIComponent(tweetUrl)}`;
    const res = await fetch(apiUrl);

    if (!res.ok) return null;

    const html = await res.text();
    return extractFromHtml(html);
  } catch {
    return null;
  }
}

function extractFromHtml(html: string): TweetMetadata | null {
  const ogDescription = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)?.[1];

  const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)?.[1];

  const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1];

  const metaDescription = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1];

  const text = decodeHtml(ogDescription || metaDescription || "").trim();
  const authorName = decodeHtml(ogTitle || "").trim();

  if (!text && !authorName) return null;

  const handleMatch = html.match(/(?:twitter\.com|x\.com)\/([^/?#"]+)/i);
  const authorHandle = handleMatch?.[1] || "unknown";

  return {
    authorName: authorName || authorHandle || "Unknown",
    authorHandle,
    text: text || authorName,
    mediaUrl: ogImage || undefined,
  };
}

export async function fetchTweetMetadata(tweetUrl: string): Promise<TweetMetadata | null> {
  if (inflight.has(tweetUrl)) {
    return inflight.get(tweetUrl)!;
  }

  const promise = fetchTweetMetadataServer({ data: { tweetUrl } });
  inflight.set(tweetUrl, promise);

  promise.finally(() => {
    setTimeout(() => inflight.delete(tweetUrl), 5000);
  });

  return promise;
}

function extractHandleFromAuthorUrl(authorUrl?: string): string | undefined {
  if (!authorUrl) return undefined;
  const match = authorUrl.match(/(?:twitter\.com|x\.com)\/([^/?#]+)/i);
  return match?.[1];
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}
