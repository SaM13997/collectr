import { createServerFn } from "@tanstack/react-start";
import { isMetadataFetchEnabled } from "./feature-flags";

export interface ItemMetadata {
  authorName?: string;
  authorHandle?: string;
  authorAvatar?: string;
  title?: string;
  text?: string;
  mediaUrl?: string;
  description?: string;
}

const inflight = new Map<string, Promise<ItemMetadata | null>>();

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

function serverFlag(key: string): boolean {
  return process.env[key] === "true" || process.env[`VITE_${key}`] === "true";
}

const fetchMetadataServer = createServerFn({ method: "GET" })
  .inputValidator((input: { url: string; source: string }) => input)
  .handler(async ({ data }) => {
    if (data.source === "reddit" && !serverFlag("ENABLE_REDDIT_IMPORT")) {
      return null;
    }
    if (data.source === "instagram" && !serverFlag("ENABLE_INSTAGRAM_IMPORT")) {
      return null;
    }
    if (data.source === "x") {
      return fetchTwitterMetadata(data.url);
    }
    if (data.source === "reddit") {
      return fetchRedditMetadata(data.url);
    }
    return null;
  });

async function fetchTwitterMetadata(tweetUrl: string): Promise<ItemMetadata | null> {
  const oembed = await fetchFromOembed(tweetUrl);
  if (oembed) return oembed;

  if (serverFlag("ENABLE_PAID_SCRAPERS") && SCRAPER_API_KEY) {
    const scraped = await fetchFromScraperApi(tweetUrl);
    if (scraped) return scraped;
  }

  return null;
}

async function fetchFromOembed(tweetUrl: string): Promise<ItemMetadata | null> {
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

async function fetchFromScraperApi(tweetUrl: string): Promise<ItemMetadata | null> {
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

function extractFromHtml(html: string): ItemMetadata | null {
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

async function fetchRedditMetadata(canonicalUrl: string): Promise<ItemMetadata | null> {
  try {
    const idMatch = canonicalUrl.match(/reddit\.com\/comments\/([\w]+)/i);
    if (!idMatch) return null;

    const id = idMatch[1];
    const res = await fetch(`https://www.reddit.com/comments/${id}.json`, {
      headers: { "User-Agent": "Collectr/1.0" },
    });

    if (!res.ok) return null;

    const data = await res.json() as Array<{ data: { children: Array<{ data: Record<string, unknown> }> } }>;
    const post = data?.[0]?.data?.children?.[0]?.data;
    if (!post) return null;

    const title = typeof post.title === "string" ? post.title : undefined;
    const selftext = typeof post.selftext === "string" ? post.selftext : undefined;
    const author = typeof post.author === "string" ? post.author : undefined;
    const subreddit = typeof post.subreddit === "string" ? post.subreddit : undefined;

    let mediaUrl: string | undefined;
    const postUrl = typeof post.url_overridden_by_dest === "string" ? post.url_overridden_by_dest : undefined;
    if (postUrl && postUrl.startsWith("https://")) {
      if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(postUrl) || postUrl.includes("i.redd.it") || postUrl.includes("i.imgur.com")) {
        mediaUrl = postUrl;
      }
    }
    if (!mediaUrl) {
      const preview = post.preview as Record<string, unknown> | undefined;
      const images = preview?.images as Array<{ source: { url: string } }> | undefined;
      if (images?.[0]?.source?.url) {
        mediaUrl = images[0].source.url.replace(/&amp;/g, "&");
      }
    }

    return {
      title,
      text: selftext?.trim() || undefined,
      authorName: subreddit ? `r/${subreddit}` : undefined,
      authorHandle: author || undefined,
      mediaUrl,
    };
  } catch {
    return null;
  }
}

export async function fetchItemMetadata(url: string, source: string): Promise<ItemMetadata | null> {
  if (!isMetadataFetchEnabled(source)) {
    return null;
  }

  const key = `${source}:${url}`;
  if (inflight.has(key)) {
    return inflight.get(key)!;
  }

  const promise = fetchMetadataServer({ data: { url, source } });
  inflight.set(key, promise);

  promise.finally(() => {
    setTimeout(() => inflight.delete(key), 5000);
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