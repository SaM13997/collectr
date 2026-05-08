# Ticket 05: Instagram URL-only support

## Outcome

Instagram links can be saved and categorized in Collectr even when metadata is not available.

## Why This Ticket Exists

Instagram is important for the product, but API and metadata access are much less reliable than Reddit. The correct MVP is URL save first, enrichment later.

## Files To Read First

- `src/routes/share-target.tsx`
- `src/components/collect-button.tsx`
- `convex/tweets.ts`
- `src/components/saved-item-card.tsx`
- `src/routes/entries.$entryId.tsx`

## Required Changes

1. Accept Instagram post or reel URLs in the parser and save path.
2. Save them with `source: "instagram"`.
3. Render a graceful fallback card and detail screen when metadata is missing.

## MVP Rules

- URL save must work with no external API key
- metadata is optional
- no native Instagram collection sync
- no assumption that every Instagram URL is publicly readable

## UI Expectations

Required:

- cards do not show X branding for Instagram items
- entry page action text is generic enough for Instagram
- missing metadata state reads as normal fallback, not as an error-heavy broken state

## Constraints

- do not add Meta app setup requirements in this ticket
- do not add paid scraping in this ticket
- do not block save on metadata success

## Acceptance Criteria

- Instagram URLs can be saved manually
- Instagram URLs can be saved via share target
- items can be placed into inbox or folders
- app still builds and existing X/Reddit behavior still works

## Verification Steps

1. Run `npm run build`
2. Save one Instagram post URL manually
3. Save one Instagram URL through `/share-target`
4. Confirm the item can be opened, moved, and deleted

## Definition Of Done

This ticket is done when Instagram works as a categorized saved link source, even with URL-only rendering.
