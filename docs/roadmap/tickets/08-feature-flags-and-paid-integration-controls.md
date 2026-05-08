# Ticket 08: Feature flags and paid integration controls

## Outcome

Every optional paid or brittle integration can be disabled cleanly, and the app still works.

## Why This Ticket Exists

The product direction includes possible paid or fragile features:

- scraper APIs
- optional Instagram metadata paths
- optional Reddit OAuth sync
- future AI enrichment

None of these should be required for the core app.

## Files To Read First

- `src/lib/tweet-parser.ts`
- `src/routes/share-target.tsx`
- `src/components/app-shell.tsx`
- any env/config files already used by the app

## Required Changes

1. Create one small integration config module.
2. Centralize env-based feature toggles there.
3. Make optional metadata paths check the toggle before running.
4. Make disabled state fall back to URL-only save behavior.
5. Add a simple settings surface or developer-visible indicator only if it is cheap.

## Flag Set

Use explicit flags similar to these:

- `ENABLE_REDDIT_IMPORT`
- `ENABLE_INSTAGRAM_IMPORT`
- `ENABLE_PAID_SCRAPERS`
- `ENABLE_REDDIT_OAUTH_SYNC`
- `ENABLE_INSTAGRAM_METADATA`
- `ENABLE_AI_ENRICHMENT`

Exact names may vary, but keep them obvious.

## Rules

- default missing flags to disabled
- do not throw if a premium key is missing
- save path must still succeed in URL-only mode

## Constraints

- do not add AI features in this ticket
- do not implement OAuth flows in this ticket
- keep the config layer small and boring

## Acceptance Criteria

- app works with all optional flags disabled
- metadata/enrichment paths are skipped cleanly when disabled
- no required premium key is needed for core save flows

## Verification Steps

1. Run `npm run build` with no optional env vars set
2. Save X, Reddit, and Instagram URLs
3. Confirm the app still behaves correctly in fallback mode

## Definition Of Done

This ticket is done when disabling optional integrations does not break the app.
