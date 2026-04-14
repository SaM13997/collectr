import { describe, expect, it } from "vitest";

import { getProxyHeaders } from "./$.tsx";

describe("getProxyHeaders", () => {
  it("removes browser host and origin before proxying upstream", () => {
    const headers = getProxyHeaders(
      new Headers({
        host: "localhost:3000",
        origin: "http://localhost:3000",
        cookie: "foo=bar",
      })
    );

    expect(headers.get("host")).toBeNull();
    expect(headers.get("origin")).toBeNull();
    expect(headers.get("cookie")).toBe("foo=bar");
    expect(headers.get("accept-encoding")).toBe("application/json");
  });
});
