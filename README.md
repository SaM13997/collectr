# Collectr

Collectr is a TanStack Start + Convex + Better Auth app for saving and organizing links, posts, and social content with nested folders and installed-PWA share target support.

## Current Scaffold Status

- Better Auth is wired to Convex for email/password sign-in and sign-up.
- A PWA manifest and service worker registration foundation are in place.
- `/share-target` is scaffolded as the landing route for incoming share intents.
- The current roadmap lives in `docs/roadmap/index.md`.
- The older X-first implementation history lives in `docs/implementation-plan.md`.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Start or connect a Convex deployment:

```bash
npx convex dev
```

3. Copy `.env-example` to `.env.local` and fill in the required values.

4. Start the app:

```bash
npm run dev
```

## Useful Commands

```bash
npm run dev
npm run build
npm run test
```

## Notes

- Installed PWA share target support is primarily Chromium-based.
- The next product phase is multi-source support across X, Reddit, Instagram, and generic links.
- The cloned template still contains demo routes that can be deleted during product implementation.
