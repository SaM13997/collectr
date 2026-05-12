# Collectr Visual Uplift Agent Breakdown

This file breaks down `public/progress/visual-uplift.html` into parallel workstreams that multiple agents can pick up at once.

## Merge Order

1. `T1` first
2. `T2` next
3. `T3` to `T7` in parallel after `T1` and `T2`
4. `T8` after the visual pieces land
5. `T9` last to harden and lock the system

## [x] T1. Brand Token Layer

- Goal: turn the HTML art direction into the canonical token system.
- Files: `src/styles.css`
- Deliver:
  - color tokens for sage, charcoal, coral, violet, butter, and sky
  - radius, shadow, border, spacing, and motion timing tokens
  - reduced-motion-safe motion variables
  - semantic source and accent tokens, not just raw color names
- Why this is isolated: one file, unblocks the rest.
- Verify: app still builds, existing UI still renders, reduced motion remains respected.

## [x] T2. Internal System Scaffold

- Goal: create the new Collectr-owned wrapper layer so routes stop depending on raw building blocks.
- Files:
  - new `src/components/system/foundations/*`
  - new `src/components/system/primitives/*`
  - new `src/components/system/patterns/*`
  - optional new `src/components/system/motion/*`
- Deliver:
  - minimal wrappers for button, input, surface, and pill or chip
  - a shared surface or card API
  - one place for motion presets
- Why this is isolated: mostly new files with low conflict against route work.
- Depends on: `T1`
- Verify: typecheck and imports pass, no route changes required yet.

## [x] T3. Desktop Shell Refresh

- Goal: make the signed-in desktop shell read like the branded command deck.
- Files:
  - `src/components/layout/AppLayout.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/Header.tsx`
- Deliver:
  - command-band feel
  - stronger sidebar hierarchy
  - branded search and header treatment
  - token-based surfaces and spacing
- Depends on: `T1`, ideally `T2`
- Verify: desktop navigation and header work across core routes.

## T4. Mobile Shell Refresh

- Goal: make mobile the visual reference point.
- Files:
  - `src/components/layout/MobileBottomNav.tsx`
  - `src/components/layout/MobileAddDrawer.tsx`
  - `src/components/layout/MobileFolderSheet.tsx`
- Deliver:
  - poster-like bottom dock
  - branded mobile drawer and sheet surfaces
  - motion and glide behavior aligned with the mock
- Depends on: `T1`, ideally `T2`
- Verify: mobile nav and drawers remain usable and keyboard-safe.

## T5. Signal Card Family

- Goal: stop cards from looking interchangeable.
- Files:
  - `src/components/saved-item-card.tsx`
  - `src/components/collection-card.tsx`
  - `src/components/bulk-selection-toolbar.tsx`
- Deliver:
  - shared signal-card language
  - clearer intent via type, accent, and metadata grouping
  - source badge and utility chip treatment
- Depends on: `T1`, ideally `T2`
- Verify: cards still support current states and actions, visual distinction is obvious.

## T6. Search And Capture Surfaces

- Goal: make search and add flows feel like branded product moments, not utility modals.
- Files:
  - `src/components/command-palette.tsx`
  - `src/components/folder-picker.tsx`
- Deliver:
  - branded command surface
  - tokenized pills, filters, and results
  - clearer default pathways for search, add, and triage
- Depends on: `T1`, ideally `T2`
- Verify: keyboard interactions still work and the command flow stays fast.

## T7. Demo Or Gallery Route

- Goal: create the proving ground described in the HTML.
- Files:
  - likely a new route under `src/routes/` for demo or gallery
  - may consume new `system/scenes/*` files if useful
- Deliver:
  - one internal route showing shell, cards, collections, detail treatment, and motion
  - a stable place for design review before broad migration
- Depends on: `T1`
- Benefits from: `T2` to `T6`
- Verify: route loads without app-specific regressions and showcases new primitives consistently.

## T8. High-Traffic Route Adoption

- Goal: apply the new system to the main product paths.
- Files:
  - `src/routes/index.tsx`
  - `src/routes/search.tsx`
  - `src/routes/folders.$folderId.tsx`
  - `src/routes/entries.$entryId.tsx`
- Deliver:
  - route-level migration onto new shell, cards, and search patterns
  - no raw one-off styling where system components exist
- Depends on: `T3` to `T6`
- Verify: route behavior stays the same except for presentation.

## T9. Motion, Accessibility, And Guardrails

- Goal: lock the uplift so it survives future work.
- Files:
  - shared motion wrappers
  - token files
  - lint rules or docs if present for component usage rules
- Deliver:
  - named motion presets
  - reduced-motion coverage
  - focus visibility checks
  - a rule or process to prevent direct raw kit imports in routes
- Depends on: `T2` to `T8`
- Verify: keyboard, focus, and reduced-motion behavior pass on updated surfaces.

## Suggested Agent Assignment

1. Agent A: `T1`
2. Agent B: `T2`
3. Agent C: `T3`
4. Agent D: `T4`
5. Agent E: `T5`
6. Agent F: `T6`
7. Agent G: `T7`
8. Agent H: `T8`
9. Agent I: `T9`

## Conflict Notes

- Highest-conflict files: `src/styles.css`, `src/components/layout/AppLayout.tsx`, and anything under new `src/components/system/*`.
- Lowest-conflict path: `T7` if it builds mostly from new scene files.
- If true parallel pickup is the priority, freeze token names in `T1` before others start coding.

## Repo-Specific Notes

- `src/components/system/*` does not exist yet, so `T2` is greenfield.
- `src/components/ui/*` already exists, so wrappers should sit on top of that layer instead of replacing it immediately.
