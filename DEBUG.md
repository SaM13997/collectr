## Observations

- Bug reproduced locally in dev at `http://localhost:3000`.
- `RootComponent` mounts `ConvexBetterAuthProvider`, which triggers `authClient.useSession()` and immediately requests `GET /api/auth/get-session`.
- Current browser-visible failure is `403 Forbidden` for:
  - `GET http://localhost:3000/api/auth/get-session`
  - `POST http://localhost:3000/api/auth/sign-in/email`
- Earlier failures were transport-layer, not auth-layer:
  - TLS verification failure when local server proxied to `https://polite-chickadee-52.convex.site`
  - CORS failure when the browser called `https://polite-chickadee-52.convex.site/api/auth/*` directly
- Current local auth route is `src/routes/api/auth/$.tsx`, which proxies same-origin auth requests to `process.env.VITE_CONVEX_SITE_URL` using `fetch()` with a dev-only undici agent that disables TLS verification.
- Current Better Auth config is in `convex/auth.ts`.
- `convex/auth.ts` sets:
  - `baseURL` to `process.env.BETTER_AUTH_URL ?? process.env.SITE_URL ?? "http://localhost:3000"`
  - `trustedOrigins` to `[siteUrl, "http://localhost:3000", "http://127.0.0.1:3000"]`
- `.env.local` defines only:
  - `CONVEX_DEPLOYMENT=dev:polite-chickadee-52`
  - `VITE_CONVEX_URL=https://polite-chickadee-52.convex.cloud`
  - `VITE_CONVEX_SITE_URL=https://polite-chickadee-52.convex.site`
- `.env.local` does not define `BETTER_AUTH_URL`, `SITE_URL`, `BETTER_AUTH_SECRET`, or `CONVEX_SITE_URL`.
- The live remote endpoint `POST https://polite-chickadee-52.convex.site/api/auth/sign-in/email` previously returned a real Better Auth error for a bad credential probe:
  - `401 INVALID_EMAIL_OR_PASSWORD`
- That implies the remote Better Auth service is reachable and can return normal auth responses.
- What still works:
  - browser -> local `/api/auth/*` requests are issued
  - local proxy -> remote Convex site no longer fails TLS
  - remote auth service responds
- Boundary between broken and working:
  - transport path works now
  - app-level auth policy/config returns `403` before normal session/auth handling completes

## Hypotheses

### H1: The proxied request is missing or forwarding the wrong origin/host headers, so Better Auth rejects it as an untrusted origin (ROOT HYPOTHESIS)
- Supports:
  - failure is `403 Forbidden`, which is consistent with origin/CSRF policy rejection
  - requests are proxied through a custom local route, which forwards request headers directly
  - remote auth backend likely sees `Origin: http://localhost:3000` while running at `https://polite-chickadee-52.convex.site`
  - remote deployment may not include the new local `trustedOrigins` config yet
- Conflicts:
  - local `convex/auth.ts` now includes localhost in `trustedOrigins`, but that only helps if the remote deployment is using the updated config
- Test:
  - remove the forwarded `origin` header in the local proxy request and see whether `403` changes to a normal auth response

### H2: The remote Convex deployment is still running older Better Auth config, so local code changes in `convex/auth.ts` are not affecting the live auth service
- Supports:
  - auth routes are ultimately served by `https://polite-chickadee-52.convex.site`
  - changing local app files would not update the remote Convex deployment unless Convex dev/deploy has picked them up
  - previous direct-browser call failed CORS, suggesting the remote auth service still lacks updated route config
- Conflicts:
  - none yet
- Test:
  - make a proxy-only header experiment that should change behavior even if remote config is stale; if behavior changes, this hypothesis weakens

### H3: Better Auth `baseURL` is misconfigured to `http://localhost:3000`, and the remote service rejects session/sign-in flows because runtime URL checks or generated callback/origin logic do not match the actual Convex site host
- Supports:
  - `baseURL` falls back to localhost because `.env.local` lacks `BETTER_AUTH_URL` and `SITE_URL`
  - earlier OIDC metadata from the remote service exposed localhost URLs
- Conflicts:
  - a bad `baseURL` often causes bad redirects/metadata, but it does not always cause immediate `403` on `get-session`
- Test:
  - inspect whether stripping `origin` changes the error first; if not, re-rank and test baseURL-related behavior next

## Experiments

### Planned E1
- Change: remove `origin` from forwarded headers in `src/routes/api/auth/$.tsx`
- Confirmation result: `403` becomes a normal auth response such as `200 null` for get-session and `401 INVALID_EMAIL_OR_PASSWORD` for bad sign-in
- Rejection result: `403` persists unchanged

### E1 Result
- Change made: removed forwarded `origin` header in `src/routes/api/auth/$.tsx`
- Additional direct reproduction performed against the remote Convex site with custom headers
- Result: partially inconclusive for origin alone, but decisive new evidence found
  - `GET https://polite-chickadee-52.convex.site/api/auth/get-session` returns `200 null`
  - same request with `Origin: http://localhost:3000` still returns `200 null`
  - same request with `Host: localhost:3000` returns HTML `403 Forbidden` from Cloudflare
- Conclusion: the upstream rejection is caused by forwarding the local `Host` header, not by the `Origin` header

## Root Cause

- The local `/api/auth/*` proxy forwarded the browser's `Host: localhost:3000` header to `https://polite-chickadee-52.convex.site`, and Cloudflare rejected that mismatched host before the request reached Better Auth.

## Fix

- Sanitize proxied auth headers by removing `host` and `origin` before forwarding to the Convex site.
- Added a regression test for proxy header sanitization.
- Preserve upstream auth HTTP responses by returning a fresh `Response` from the local proxy so non-2xx auth results pass through instead of being wrapped as local `HTTPError` 500s.
