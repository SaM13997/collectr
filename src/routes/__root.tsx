/// <reference types="vite/client" />
import * as React from "react";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  useRouteContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createServerFn } from "@tanstack/react-start";
import { QueryClient } from "@tanstack/react-query";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexReactClient } from "convex/react";
import { getCookie, getRequest } from "@tanstack/react-start/server";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import {
  fetchSession,
  getCookieName,
} from "@convex-dev/better-auth/react-start";
import { ThemeProvider, themeScript } from "@/components/theme-provider";
import { authClient } from "@/lib/auth-client";
import appCss from "../styles.css?url";
import { PwaRegistrar } from "@/components/pwa-registrar";
import { Toaster } from "sonner";

// Get auth information for SSR using available cookies
const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { createAuth } = await import("../../convex/auth");
    const { session } = await fetchSession(getRequest());
    const sessionCookieName = getCookieName(createAuth);
    const token = getCookie(sessionCookieName);
    return {
      userId: session?.user.id,
      token,
    };
  } catch {
    return { userId: undefined, token: undefined };
  }
});

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
  convexQueryClient: ConvexQueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Collectr — Save Links. Organize Later." },
      {
        name: "description",
        content:
          "Save links from X, Reddit, Instagram, and the web. Organize into collections with tags and notes. Free PWA.",
      },
      { name: "theme-color", content: "#e11d48" },
      { property: "og:title", content: "Collectr — Save Links. Organize Later." },
      { property: "og:description", content: "Save links from X, Reddit, Instagram, and the web. Organize into collections with tags and notes." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://collectr.app" },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Collectr — Save Links. Organize Later." },
      { name: "twitter:description", content: "Save links from X, Reddit, Instagram, and the web. Organize into collections." },
    ],
    links: [
      { rel: "preconnect", href: "https://api.fontshare.com" },
      { rel: "stylesheet", href: "https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@400,500,700,800,900&f[]=satoshi@400,500,700&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/logo192.png" },
      { rel: "canonical", href: "https://collectr.app" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Collectr",
          url: "https://collectr.app",
          description:
            "Save links from X, Reddit, Instagram, and the web. Organize into collections with tags and notes.",
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  beforeLoad: async (ctx) => {
    // all queries, mutations and action made with TanStack Query will be
    // authenticated by an identity token.
    const { userId, token } = await fetchAuth();

    // During SSR only (the only time serverHttpClient exists),
    // set the auth token to make HTTP queries with.
    if (token) {
      ctx.context.convexQueryClient.serverHttpClient?.setAuth(token);
    }

    return { userId, token };
  },
  notFoundComponent: () => (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <p className="text-lg font-semibold">Page not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </main>
  ),
  component: RootComponent,
});

function RootComponent() {
  const context = useRouteContext({ from: Route.id });
  return (
    <ConvexBetterAuthProvider
      client={context.convexClient}
      authClient={authClient}
    >
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ConvexBetterAuthProvider>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-screen w-full flex-col overflow-x-clip antialiased">
        <ThemeProvider>
          <div className="flex flex-1 flex-col">{children}</div>
          <PwaRegistrar />
          <Toaster richColors closeButton position="bottom-right" />
          {import.meta.env.DEV && (
            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "Tanstack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
          )}
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  );
}
