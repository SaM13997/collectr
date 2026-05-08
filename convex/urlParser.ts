export type SourceType = "x" | "reddit" | "instagram" | "link"

const X_RE = /https?:\/\/(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/([\w_]+)\/status\/(\d+)/i

const REDDIT_COM_RE = /https?:\/\/(?:www\.|old\.|new\.)?reddit\.com\/r\/[\w]+\/comments\/([\w]+)/i

const REDDIT_SHORT_RE = /https?:\/\/redd\.it\/([\w]+)/i

const INSTAGRAM_RE = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/([\w-]+)/i

export function parseUrl(url: string): {
  source: SourceType
  canonicalUrl: string
  sourceItemId?: string
} | null {
  const trimmed = url.trim()

  const xMatch = trimmed.match(X_RE)
  if (xMatch) {
    const [, handle, id] = xMatch
    return {
      source: "x",
      canonicalUrl: `https://x.com/${handle}/status/${id}`,
      sourceItemId: id,
    }
  }

  const redditMatch = trimmed.match(REDDIT_COM_RE)
  if (redditMatch) {
    const [, id] = redditMatch
    return {
      source: "reddit",
      canonicalUrl: `https://reddit.com/comments/${id}`,
      sourceItemId: id,
    }
  }

  const redditShortMatch = trimmed.match(REDDIT_SHORT_RE)
  if (redditShortMatch) {
    const [, id] = redditShortMatch
    return {
      source: "reddit",
      canonicalUrl: `https://reddit.com/comments/${id}`,
      sourceItemId: id,
    }
  }

  const instaMatch = trimmed.match(INSTAGRAM_RE)
  if (instaMatch) {
    const [, shortcode] = instaMatch
    return {
      source: "instagram",
      canonicalUrl: `https://instagram.com/p/${shortcode}`,
      sourceItemId: shortcode,
    }
  }

  try {
    const u = new URL(trimmed)
    if (u.protocol === "http:" || u.protocol === "https:") {
      u.hash = ""
      let canonical = u.toString()
      if (canonical.endsWith("/") && u.pathname !== "/") {
        canonical = canonical.slice(0, -1)
      }
      return {
        source: "link",
        canonicalUrl: canonical,
      }
    }
  } catch {}

  return null
}