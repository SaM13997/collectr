# Ticket 03: Share target and URL parser expansion

## Outcome

The app can detect X, Reddit, Instagram, and generic URLs from manual input and `/share-target` payloads.

## Why This Ticket Exists

The app already has a PWA share flow, but it only recognizes X links. The parser logic needs to become reusable before source-specific ingestion is added.

## Files To Read First

- `src/routes/share-target.tsx`
- `src/components/collect-button.tsx`
- `convex/tweets.ts`
- `src/lib/tweet-parser.ts`

## Required Changes

1. Create a source-agnostic URL parsing utility.
2. Move source detection logic out of route-local regexes.
3. Support parsing from both direct URL and shared text.
4. Make manual save and share-target use the same parser.

## Supported Detection Rules

The parser must classify one of:

- `x`
- `reddit`
- `instagram`
- `link`

Expected URL families:

- X: `x.com`, `twitter.com`, `mobile.twitter.com`
- Reddit: `reddit.com`, `www.reddit.com`, `old.reddit.com`, `redd.it`
- Instagram: `instagram.com`, `www.instagram.com`
- Fallback: any valid HTTP or HTTPS URL

## Output Shape

Create one normalized parser result shape, for example:

- `source`
- `rawUrl`
- `canonicalUrl`
- `sourceItemId?`
- `displayUrl`

The exact type name is up to the implementer, but keep it small and in one utility file.

## Constraints

- Do not fetch metadata in this ticket.
- Do not implement Reddit API calls here.
- Do not implement Instagram oEmbed here.
- The share-target screen can still say `Save link` or `Save item`; it does not need source-specific visuals yet.

## Acceptance Criteria

- share target detects X, Reddit, Instagram, and generic links
- manual input uses the same detection logic
- unsupported junk text is rejected cleanly
- current X behavior remains intact

## Verification Steps

1. Run `npm run build`
2. Test manual input with one URL from each source
3. Test `/share-target?text=...` with each source embedded in text
4. Confirm the detected canonical URL is used for save

## Definition Of Done

This ticket is done when URL detection is reusable and no longer hard-coded to X.

## Notes For A Weaker Agent

If you are tempted to keep multiple regex copies in several files, stop and centralize them instead.
