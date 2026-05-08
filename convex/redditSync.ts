import { query, action } from "./_generated/server";
import { requireUserId } from "./helpers";
import { components, api } from "./_generated/api";
import { parseUrl } from "./urlParser";

export const getRedditConnection = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);

    const account = (await ctx.runQuery(
      components.betterAuth.adapter.findOne,
      {
        model: "account" as any,
        where: [
          { field: "userId" as any, value: userId },
          { field: "providerId" as any, value: "reddit" },
        ],
      }
    )) as Record<string, unknown> | null;

    if (!account) return null;

    return { connected: true };
  },
});

export const importRedditSaves = action({
  args: {},
  handler: async (ctx): Promise<{ imported: number }> => {
    const userId = await requireUserId(ctx as any);

    const account = (await ctx.runQuery(
      components.betterAuth.adapter.findOne,
      {
        model: "account" as any,
        where: [
          { field: "userId" as any, value: userId },
          { field: "providerId" as any, value: "reddit" },
        ],
      }
    )) as Record<string, unknown> | null;

    if (!account) {
      throw new Error("Reddit account not connected");
    }

    let accessToken = account.accessToken as string | undefined;
    const refreshToken = account.refreshToken as string | null;
    const expiresAt = account.accessTokenExpiresAt as number | null;

    if (!accessToken) {
      throw new Error("Reddit access token not available");
    }

    if (expiresAt && expiresAt < Date.now() && refreshToken) {
      const refreshed = await refreshRedditToken(refreshToken);
      if (refreshed) {
        accessToken = refreshed.accessToken;
        await ctx.runMutation(components.betterAuth.adapter.updateOne, {
          input: {
            model: "account" as any,
            where: [{ field: "_id" as any, value: account._id as string }],
            update: {
              accessToken: refreshed.accessToken,
              accessTokenExpiresAt: refreshed.expiresAt,
              ...(refreshed.refreshToken
                ? { refreshToken: refreshed.refreshToken }
                : {}),
            },
          },
        });
      }
    }

    const response = await fetch(
      "https://oauth.reddit.com/user/me/saved?limit=100",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "Collectr/1.0",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Reddit token expired. Please reconnect your Reddit account."
        );
      }
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      data?: {
        children?: Array<{ kind: string; data: Record<string, unknown> }>;
      };
    };
    const children = data?.data?.children ?? [];

    const items: Array<{
      url: string;
      tweetId: string;
      source: "reddit";
      canonicalUrl: string;
      sourceItemId?: string;
      title?: string;
      authorHandle?: string;
      authorName?: string;
      tags?: string[];
      text?: string;
    }> = [];

    for (const item of children) {
      if (item.kind !== "t3") continue;

      const post = item.data;
      const permalink = post.permalink as string | undefined;
      if (!permalink) continue;

      const url = `https://www.reddit.com${permalink}`;
      const parsed = parseUrl(url);
      if (!parsed || parsed.source !== "reddit") continue;

      const subreddit = post.subreddit as string | undefined;
      const tags = subreddit ? [subreddit.toLowerCase()] : undefined;

      items.push({
        url: parsed.canonicalUrl,
        tweetId: parsed.sourceItemId ?? parsed.canonicalUrl,
        source: "reddit",
        canonicalUrl: parsed.canonicalUrl,
        sourceItemId: parsed.sourceItemId,
        title: (post.title as string) || undefined,
        authorHandle: (post.author as string) || undefined,
        authorName: subreddit ? `r/${subreddit}` : undefined,
        tags,
        text: (post.selftext as string) || undefined,
      });
    }

    const result = await ctx.runMutation(api.tweets.importRedditItems, {
      items,
    });

    return result;
  },
});

async function refreshRedditToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresAt: number; refreshToken?: string } | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await fetch(
      "https://www.reddit.com/api/v1/access_token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Collectr/1.0",
        },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`,
      }
    );

    if (!response.ok) return null;

    const data = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
    };
    if (!data.access_token) return null;

    return {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
      refreshToken: data.refresh_token,
    };
  } catch {
    return null;
  }
}