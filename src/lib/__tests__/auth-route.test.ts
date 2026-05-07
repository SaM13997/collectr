import { describe, expect, it } from "vitest";

import { getConvexSiteUrl, getProxyHeaders } from "../../routes/api/auth/$.tsx";

describe("getProxyHeaders", () => {
  it("removes browser host and origin before proxying upstream", () => {
    const headers = getProxyHeaders(
      new Headers({
        host: "localhost:3000",
        origin: "http://localhost:3000",
        referer: "http://localhost:3000/login",
        cookie: "foo=bar",
      })
    );

    expect(headers.get("host")).toBeNull();
    expect(headers.get("origin")).toBeNull();
    expect(headers.get("referer")).toBeNull();
    expect(headers.get("cookie")).toBe("foo=bar");
    expect(headers.get("accept-encoding")).toBe("application/json");
  });
});

describe("getConvexSiteUrl", () => {
  it("prefers an explicit site url when configured", () => {
    expect(
      getConvexSiteUrl({
        CONVEX_SITE_URL: "https://example.convex.site",
        VITE_CONVEX_URL: "https://example.convex.cloud",
      })
    ).toBe("https://example.convex.site");
  });

  it("derives the site url from the convex cloud url", () => {
    expect(
      getConvexSiteUrl({
        VITE_CONVEX_URL: "https://polite-chickadee-52.convex.cloud",
      })
    ).toBe("https://polite-chickadee-52.convex.site");
  });

  it("returns undefined when no convex env is configured", () => {
    expect(getConvexSiteUrl({})).toBeUndefined();
  });
});
