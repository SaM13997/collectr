# Ticket 09: Optional Reddit OAuth native save sync

## Outcome

Users can optionally connect Reddit and mirror native Reddit saved items or categories into Collectr.

## Why This Ticket Exists

Reddit is the one platform in this roadmap where native save behavior is realistic enough to consider.

This is intentionally late in the sequence because the core app must already work well without it.

## Files To Read First

- Better Auth setup files under `src/lib/`
- `convex/auth.ts`
- `convex/http.ts`
- `convex/tweets.ts`
- `docs/roadmap/tickets/08-feature-flags-and-paid-integration-controls.md`

## Product Scope

Optional capabilities:

- connect a Reddit account
- import user-saved Reddit posts into Collectr
- optionally map Reddit save categories into Collectr tags or notes

Keep all of this behind a feature flag from Ticket 08.

## Important Constraint

Do not make Reddit OAuth required for saving Reddit URLs into Collectr. Manual save must remain the default and simplest path.

## Recommended Implementation Order

1. Add provider/account plumbing
2. Add a one-time import path for saved Reddit posts
3. Only after that, consider recurring sync

## Mapping Guidance

Reddit concepts can map into Collectr like this:

- saved Reddit post -> Collectr saved item with `source: "reddit"`
- Reddit save category -> Collectr tag, prefixed only if needed

Prefer plain tag names unless collisions become a real issue.

## Constraints

- no background worker requirement in the first pass
- no silent recurring sync unless the app already has a safe place to trigger it
- no work on Instagram native sync here

## Acceptance Criteria

- the feature can be fully disabled
- with the feature enabled, a user can connect Reddit
- at least one import path for saved Reddit posts works
- imported posts land in Collectr without duplicating existing canonical URLs

## Verification Steps

1. Verify the feature is hidden or disabled when the flag is off
2. Enable the flag in a local dev environment
3. Connect a Reddit account
4. Import saved posts
5. Confirm imported items render like normal Reddit items in Collectr

## Definition Of Done

This ticket is done when Reddit native save integration exists as an optional enhancement rather than a core dependency.
