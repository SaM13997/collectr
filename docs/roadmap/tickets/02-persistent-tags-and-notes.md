# Ticket 02: Persistent tags and notes

## Outcome

Saved items can be categorized with persisted tags and optional notes.

## Why This Ticket Exists

The current mobile collect flow has local tag UI in `src/components/collect-button.tsx`, but those tags are not stored anywhere. This means a user can pretend to tag something and lose that data immediately.

## Files To Read First

- `src/components/collect-button.tsx`
- `convex/schema.ts`
- `convex/tweets.ts`
- `src/routes/entries.$entryId.tsx`
- `src/components/saved-item-card.tsx`

## Required Changes

1. Add persistent tags to the schema.
2. Add note support to the schema if Ticket 01 did not already add `note`.
3. Pass tags from the collect UI into the save mutation.
4. Render tags and note in at least one detail view.

## Schema Shape

Add:

- `tags?: string[]`

Use this normalization rule:

- trim whitespace
- lowercase tags
- dedupe tags before saving

## Mutation Work

Update the save mutation to accept:

- `tags?: string[]`
- `note?: string`

Do not create a separate tags table. Keep this simple.

## UI Scope

Required:

- persist tags created in `collect-button.tsx`
- show tags on `entries.$entryId.tsx`

Optional if easy:

- show first 1 to 3 tags on `saved-item-card.tsx`

## Constraints

- Do not build tag editing UI across the whole app in this ticket.
- Do not add filtering by tag yet. That belongs to Ticket 07.
- Keep note optional. No required note input.

## Acceptance Criteria

- a user can add tags during save
- tags persist after reload
- tags are visible on the entry detail screen
- invalid duplicate tags are not stored twice

## Verification Steps

1. Run `npm run build`
2. Save an X link with two tags
3. Reload the app
4. Open the item detail screen and confirm both tags are present
5. Try duplicate tags with different casing and confirm only one stored value remains

## Definition Of Done

This ticket is done when tags are real data, not local UI state.
