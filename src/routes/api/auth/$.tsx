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
  headers.delete("referer");
  return headers;
};

export const getConvexSiteUrl = (env: NodeJS.ProcessEnv) => {
  const explicitSiteUrl = env.CONVEX_SITE_URL ?? env.VITE_CONVEX_SITE_URL;

  if (explicitSiteUrl) {
    return explicitSiteUrl;
  }

  const convexUrl = env.CONVEX_URL ?? env.VITE_CONVEX_URL;

  if (!convexUrl) {
    return undefined;
  }

  return convexUrl.replace(/\.convex\.cloud$/u, ".convex.site");
};

const proxyAuthRequest = async (request: Request) => {
  const requestUrl = new URL(request.url);
  const convexSiteUrl = getConvexSiteUrl(process.env);

  if (!convexSiteUrl) {
    return new Response(
      JSON.stringify({ message: "Auth service is not configured." }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
  const headers = getProxyHeaders(request.headers);

  try {
    const response = await fetch(nextUrl, {
      method: request.method,
      headers,
      redirect: "manual",
      body: request.body,
      // @ts-expect-error undici-specific fetch option for dev TLS workaround
      dispatcher: process.env.NODE_ENV === "production" ? undefined : insecureDevAgent,
      duplex: "half",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (err) {
    console.error("[auth-proxy] Failed to reach auth service:", err);
    return new Response(
      JSON.stringify({ message: "Unable to reach the auth service. Please try again later." }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
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
