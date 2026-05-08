import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth";
import { genericOAuth } from "better-auth/plugins";

const siteUrl =
  process.env.BETTER_AUTH_URL ?? process.env.SITE_URL ?? "http://localhost:3000";
const trustedOrigins = [
  siteUrl,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];
const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redditClientId = process.env.REDDIT_CLIENT_ID;
const redditClientSecret = process.env.REDDIT_CLIENT_SECRET;

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (
  ctx: GenericCtx<DataModel>,
  { optionsOnly } = { optionsOnly: false }
) => {
  const socialProviders =
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          },
        }
      : undefined;

  const redditOAuthConfig =
    redditClientId && redditClientSecret
      ? [
          {
            providerId: "reddit" as const,
            clientId: redditClientId,
            clientSecret: redditClientSecret,
            authorizationUrl: "https://www.reddit.com/api/v1/authorize",
            tokenUrl: "https://www.reddit.com/api/v1/access_token",
            userInfoUrl: "https://oauth.reddit.com/api/v1/me",
            scopes: ["identity", "history"],
            accessType: "offline",
            authorizationUrlParams: { duration: "permanent" },
            authentication: "basic" as const,
          },
        ]
      : [];

  return betterAuth({
    logger: {
      disabled: optionsOnly,
    },
    appName: "Collectr",
    baseURL: siteUrl,
    trustedOrigins,
    ...(betterAuthSecret ? { secret: betterAuthSecret } : {}),
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    ...(socialProviders ? { socialProviders } : {}),
    plugins: [convex(), genericOAuth({ config: redditOAuthConfig })],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
