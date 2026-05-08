# Ticket 01: Multi-source foundation

## Outcome

Collectr can store source-aware saved items without breaking existing X behavior.

This ticket does not rename the `tweets` table. Keep the existing table name and evolve its shape.

## Why This Ticket Exists

The app is currently hard-coded around X/Twitter:

- `convex/tweets.ts` only accepts X URLs
- `src/routes/share-target.tsx` only extracts tweet links
- many UI strings say `tweet`
- metadata code is X-specific

Before adding Reddit and Instagram, the stored record needs a source-aware shape.

## Files To Read First

- `convex/schema.ts`
- `convex/tweets.ts`
- `src/routes/index.tsx`
- `src/routes/entries.$entryId.tsx`
- `src/components/saved-item-card.tsx`

## Required Changes

1. Expand the existing `tweets` table schema with generic fields.
2. Keep existing X fields working so the current UI does not break.
3. Add a normalized source enum.
4. Add a normalized canonical URL field.
5. Add a generic source item id field.

## Schema Shape To Add

Add the following fields to the `tweets` table:

- `source: "x" | "reddit" | "instagram" | "link"`
- `canonicalUrl: string`
- `sourceItemId?: string`
- `title?: string`
- `description?: string`
- `note?: string`

Keep these existing fields for compatibility:

- `tweetId`
- `url`
- `embedStatus`
- `authorName`
- `authorHandle`
- `authorAvatar`
- `text`
- `mediaUrl`

## API Work

In `convex/tweets.ts`:

- keep existing queries/mutations working
- update insert logic to populate `source` and `canonicalUrl`
- for existing X saves:
  - `source` should be `"x"`
  - `canonicalUrl` should equal the cleaned X URL
  - `sourceItemId` should equal the extracted tweet id

Do not try to support Reddit or Instagram in this ticket. Only lay the storage foundation.

## Constraints

- Do not rename files yet.
- Do not rename the route path `/entries/$entryId`.
- Do not refactor the metadata fetcher in this ticket.
- Do not add tags here. Tags belong to Ticket 02.

## Acceptance Criteria

- existing X save flow still works
- newly saved X items include `source` and `canonicalUrl`
- existing list and entry screens still render
- app build passes

## Verification Steps

1. Run `npm run build`
2. Save an X link manually
3. Confirm the saved record includes `source: "x"`
4. Open the saved item from home view

## Definition Of Done

This ticket is done when the schema and write path are source-aware, but the app still behaves the same for X.

## Common Failure Modes

- breaking generated Convex types by changing schema but not updating usages
- trying to generalize all UI copy too early
- trying to add Reddit parsing before the storage shape exists
