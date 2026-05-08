# Ticket 07: Search, filters, and library views

## Outcome

Users can browse and filter the full library of saved items by source and category metadata.

## Why This Ticket Exists

The current search route only searches inbox items. That is not enough once the app supports multiple sources and richer categorization.

## Files To Read First

- `src/routes/search.tsx`
- `src/routes/index.tsx`
- `convex/tweets.ts`
- `convex/folders.ts`
- `src/components/saved-item-card.tsx`

## Required Changes

1. Add a query that can return the full saved library for the user, not just inbox.
2. Update search to use that broader data source.
3. Add source filter chips somewhere sensible.
4. If practical, allow matching against:
   - URL
   - title
   - text/description
   - author handle
   - folder name
   - tags

## Suggested Filter Values

- All
- X
- Reddit
- Instagram
- Links

## Constraints

- keep this client-side if the dataset is still small
- do not build full pagination in this ticket
- do not build advanced search syntax

## Acceptance Criteria

- search covers more than inbox-only items
- source filters work
- tags contribute to search if Ticket 02 landed
- build passes

## Verification Steps

1. Run `npm run build`
2. Save items from at least two different sources
3. Move some items into folders
4. Search by source-related text and by folder/tag text

## Definition Of Done

This ticket is done when users can find items across their whole saved library instead of only the uncategorized inbox.
