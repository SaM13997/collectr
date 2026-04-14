import { createFileRoute } from "@tanstack/react-router";
import { Agent } from "undici";

const insecureDevAgent = new Agent({
  connect: {
    rejectUnauthorized: false,
  },
});

export const getProxyHeaders = (requestHeaders: Headers) => {
  const headers = new Headers(requestHeaders);
  headers.set("accept-encoding", "application/json");
  headers.delete("host");
  headers.delete("origin");
  return headers;
};

const proxyAuthRequest = (request: Request) => {
  const requestUrl = new URL(request.url);
  const convexSiteUrl = process.env.VITE_CONVEX_SITE_URL;

  if (!convexSiteUrl) {
    throw new Error("VITE_CONVEX_SITE_URL is not set");
  }

  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const headers = getProxyHeaders(request.headers);

  return fetch(nextUrl, {
    method: request.method,
    headers,
    redirect: "manual",
    body: request.body,
    // @ts-expect-error undici-specific fetch option for dev TLS workaround
    dispatcher: process.env.NODE_ENV === "production" ? undefined : insecureDevAgent,
    // @ts-expect-error duplex is required for streaming request bodies in modern fetch
    duplex: "half",
  }).then(async (response) => {
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  });
};

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        return proxyAuthRequest(request);
      },
      POST: ({ request }) => {
        return proxyAuthRequest(request);
      },
    },
  },
});
