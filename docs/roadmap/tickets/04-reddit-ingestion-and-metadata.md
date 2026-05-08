# Ticket 04: Reddit ingestion and metadata

## Outcome

Reddit posts can be saved into Collectr and display useful metadata for public links.

## Why This Ticket Exists

Reddit is the most realistic next source after X because:

- the URLs are stable
- public content is often accessible without paid scraping
- Reddit has native save APIs later if OAuth is added

## Files To Read First

- `convex/tweets.ts`
- `convex/schema.ts`
- `src/routes/share-target.tsx`
- `src/components/saved-item-card.tsx`
- `src/routes/entries.$entryId.tsx`
- `src/lib/tweet-parser.ts`

## Implementation Strategy

Keep the X metadata logic working, but split source-specific metadata into separate code paths.

Create or rename utility code so it no longer implies X-only behavior. A new file name like `src/lib/item-metadata.ts` is acceptable if the change stays focused.

## Required Metadata For Reddit

For public Reddit links, try to populate:

- `title`
- `description` or `text`
- `authorHandle`
- subreddit name, if you have a reasonable field to store it
- `mediaUrl` when available

If full metadata is unavailable, the item must still save and render as a plain link card.

## Save Behavior

- a Reddit URL should save with `source: "reddit"`
- `canonicalUrl` should be normalized
- `sourceItemId` should be stored when it can be parsed reliably

## UI Scope

Required:

- home/list cards should look acceptable for Reddit items
- entry view should not say `Tweet text unavailable` for Reddit items
- link action copy should avoid saying `Open on X` for Reddit items

If needed, you may add tiny source-aware branches in the card/detail components.

## Constraints

- do not add Reddit OAuth in this ticket
- do not add native Reddit save categories sync in this ticket
- do not require a paid scraper

## Acceptance Criteria

- pasted or shared Reddit links save successfully
- public Reddit links show some metadata when available
- metadata failure falls back to a plain saved link experience
- build passes

## Verification Steps

1. Run `npm run build`
2. Save at least one public Reddit post URL manually
3. Save at least one Reddit URL through `/share-target`
4. Confirm cards and entry page render without X-specific copy bugs

## Definition Of Done

This ticket is done when Reddit is a first-class source inside Collectr, even if native Reddit account integration does not exist yet.
