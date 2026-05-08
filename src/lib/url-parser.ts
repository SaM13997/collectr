export type SourceType = "x" | "reddit" | "instagram" | "link"

export type ParsedUrl = {
  source: SourceType
  rawUrl: string
  canonicalUrl: string
  sourceItemId?: string
  displayUrl: string
}

const X_RE = /https?:\/\/(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/([\w_]+)\/status\/(\d+)/i

const REDDIT_COM_RE = /https?:\/\/(?:www\.|old\.|new\.)?reddit\.com\/r\/[\w]+\/comments\/([\w]+)/i

const REDDIT_SHORT_RE = /https?:\/\/redd\.it\/([\w]+)/i

const INSTAGRAM_RE = /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/([\w-]+)/i

const URL_RE = /https?:\/\/[^\s]+/i

function cleanUrl(url: string): string {
  try {
    const u = new URL(url)
    u.hash = ""
    const result = u.toString()
    return result.endsWith("/") && u.pathname !== "/"
      ? result.slice(0, -1)
      : result
  } catch {
    return url
  }
}

function makeDisplayUrl(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname === "/" ? "" : u.pathname.replace(/\/+$/, "")
    return path ? `${u.host}${path}` : u.host
  } catch {
    return url
  }
}

export function parseUrl(url: string): ParsedUrl | null {
  const trimmed = url.trim()

  const xMatch = trimmed.match(X_RE)
  if (xMatch) {
    const [, handle, id] = xMatch
    const canonical = `https://x.com/${handle}/status/${id}`
    return {
      source: "x",
      rawUrl: trimmed,
      canonicalUrl: canonical,
      sourceItemId: id,
      displayUrl: makeDisplayUrl(canonical),
    }
  }

  const redditMatch = trimmed.match(REDDIT_COM_RE)
  if (redditMatch) {
    const [, id] = redditMatch
    const canonical = `https://reddit.com/comments/${id}`
    return {
      source: "reddit",
      rawUrl: trimmed,
      canonicalUrl: canonical,
      sourceItemId: id,
      displayUrl: makeDisplayUrl(canonical),
    }
  }

  const redditShortMatch = trimmed.match(REDDIT_SHORT_RE)
  if (redditShortMatch) {
    const [, id] = redditShortMatch
    const canonical = `https://reddit.com/comments/${id}`
    return {
      source: "reddit",
      rawUrl: trimmed,
      canonicalUrl: canonical,
      sourceItemId: id,
      displayUrl: makeDisplayUrl(canonical),
    }
  }

  const instaMatch = trimmed.match(INSTAGRAM_RE)
  if (instaMatch) {
    const [, shortcode] = instaMatch
    const canonical = `https://instagram.com/p/${shortcode}`
    return {
      source: "instagram",
      rawUrl: trimmed,
      canonicalUrl: canonical,
      sourceItemId: shortcode,
      displayUrl: makeDisplayUrl(canonical),
    }
  }

  try {
    const u = new URL(trimmed)
    if (u.protocol === "http:" || u.protocol === "https:") {
      const canonical = cleanUrl(trimmed)
      return {
        source: "link",
        rawUrl: trimmed,
        canonicalUrl: canonical,
        displayUrl: makeDisplayUrl(canonical),
      }
    }
  } catch {}

  return null
}

export function extractUrlFromText(text: string): string | null {
  const match = text.match(URL_RE)
  if (!match) return null
  return match[0].replace(/[.,;!?)\]>'"]+$/, "")
}

export function parseSharedContent(params: {
  text?: string
  title?: string
  url?: string
}): ParsedUrl | null {
  const normalize = (v: unknown): string | undefined =>
    typeof v === "string" && v.trim().length > 0 ? v.trim() : undefined

  const directUrl = normalize(params.url)
  if (directUrl) {
    const parsed = parseUrl(directUrl)
    if (parsed) return parsed
  }

  const combined = [normalize(params.text), normalize(params.title)]
    .filter((v): v is string => v !== undefined)
    .join(" ")

  const extracted = extractUrlFromText(combined)
  if (extracted) {
    return parseUrl(extracted)
  }

  return null
}