# Ticket 06: Source-aware UI and copy cleanup

## Outcome

The product reads like a general saved-post organizer instead of a tweet saver.

## Why This Ticket Exists

Even after source support lands, the UI will still feel X-specific unless copy and small rendering decisions are cleaned up.

## Files To Read First

- `src/routes/index.tsx`
- `src/routes/entries.$entryId.tsx`
- `src/routes/share-target.tsx`
- `src/components/app-shell.tsx`
- `src/components/saved-item-card.tsx`
- `src/components/collect-button.tsx`

## Required Changes

1. Replace hard-coded `tweet` language with `link`, `post`, or `saved item` where appropriate.
2. Make action text source-aware where needed.
3. Ensure empty states and labels match the broader product.

## Copy Examples

Change examples like:

- `Save tweet` -> `Save link` or `Save item`
- `Tweet saved!` -> `Saved`
- `Tweet text unavailable` -> `Content unavailable`
- `Open on X` -> source-aware label or `Open original`

## Constraints

- do not redesign layouts in this ticket
- do not add new routes in this ticket
- avoid large component refactors unless needed for copy correctness

## Acceptance Criteria

- major user-facing strings are no longer X-only
- X items still read correctly
- Reddit and Instagram items do not show X-specific labels

## Verification Steps

1. Run `npm run build`
2. Manually inspect home, folder, entry, collect, and share-target screens
3. Check one item from X, one from Reddit, and one from Instagram if available

## Definition Of Done

This ticket is done when the app language matches the intended product scope.
