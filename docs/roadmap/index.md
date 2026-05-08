# Collectr Roadmap

This roadmap replaces the old X-only implementation plan as the primary next-steps document.

The current app already supports:

- email/password auth via Better Auth + Convex
- saving X/Twitter links into the app
- organizing saved links into folders and subfolders
- PWA share-target intake via `/share-target`
- basic metadata enrichment for X links

The next product goal is to evolve Collectr from an X-specific saver into a source-aware saved-post organizer that can handle X, Reddit, Instagram, and generic links.

## Guiding Decisions

- Prefer small, low-risk changes over a big-bang rewrite.
- Do not start by renaming the Convex `tweets` table. That is high-blast-radius and not required to unlock product value.
- Treat Instagram metadata as optional. URL save must work even when metadata is unavailable.
- Treat any paid or brittle integration as optional and disabled by default.
- Each ticket below should be executable by a weaker agent without needing to infer product direction.

## Current Code Reality

These files define most of the current behavior and should be treated as the initial map for future work:

- `convex/schema.ts`
- `convex/tweets.ts`
- `convex/folders.ts`
- `src/routes/index.tsx`
- `src/routes/folders.$folderId.tsx`
- `src/routes/entries.$entryId.tsx`
- `src/routes/share-target.tsx`
- `src/routes/search.tsx`
- `src/components/collect-button.tsx`
- `src/components/saved-item-card.tsx`
- `src/lib/tweet-parser.ts`

## Timeline

Work these tickets in order unless a ticket explicitly says it can run later.

### Phase 1: Multi-source foundation

1. [Ticket 01 - Multi-source foundation](./tickets/01-multi-source-foundation.md)
2. [Ticket 02 - Persistent tags and notes](./tickets/02-persistent-tags-and-notes.md)
3. [Ticket 03 - Share target and URL parser expansion](./tickets/03-share-target-and-url-parser-expansion.md)

### Phase 2: Source support

4. [Ticket 04 - Reddit ingestion and metadata](./tickets/04-reddit-ingestion-and-metadata.md)
5. [Ticket 05 - Instagram URL-only support](./tickets/05-instagram-url-only-support.md)

### Phase 3: Product UX cleanup

6. [Ticket 06 - Source-aware UI and copy cleanup](./tickets/06-source-aware-ui-and-copy-cleanup.md)
7. [Ticket 07 - Search, filters, and library views](./tickets/07-search-filters-and-library-views.md)

### Phase 4: Optional integrations

8. [Ticket 08 - Feature flags and paid integration controls](./tickets/08-feature-flags-and-paid-integration-controls.md)
9. [Ticket 09 - Optional Reddit OAuth native save sync](./tickets/09-optional-reddit-oauth-native-save-sync.md)

## Recommended Pace

- Ticket 01: 1 to 2 days
- Ticket 02: 1 day
- Ticket 03: 1 day
- Ticket 04: 1 to 2 days
- Ticket 05: 0.5 to 1 day
- Ticket 06: 1 day
- Ticket 07: 1 day
- Ticket 08: 1 day
- Ticket 09: 2 to 3 days

If one agent is working serially, this is roughly a 2 to 3 week implementation sequence.

## Execution Rules For Weaker Agents

- Read the ticket fully before editing.
- Only touch files named in the ticket unless the ticket says otherwise.
- Do not refactor unrelated code.
- Do not rename the Convex `tweets` table in any of these tickets.
- Do not introduce paid services as required dependencies.
- If a ticket mentions feature flags, default them to off when config is missing.
- Run the verification steps listed in the ticket before stopping.

## Product Scope After Ticket 09

At that point, Collectr should be able to:

- save X, Reddit, Instagram, and generic links into the app
- categorize items using folders, tags, and notes
- accept shared links through `/share-target`
- show source-aware cards and details
- support optional Reddit native-save integration
- keep paid or brittle enrichment paths disabled unless explicitly configured

## Explicit Non-Goals For Now

- full table rename from `tweets` to `items`
- background queue infrastructure
- Instagram native saved-post sync
- AI auto-tagging as a required part of the product
- browser-extension work

## Historical Note

The older X-specific implementation plan is still kept at `docs/implementation-plan.md` for reference, but this roadmap is the current source of truth.
