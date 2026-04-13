import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./helpers";

const TWEET_URL_RE =
  /(https?:\/\/(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+))/i;

function extractTweetId(url: string): { cleanUrl: string; tweetId: string } | null {
  const match = url.match(TWEET_URL_RE);
  if (!match) return null;
  return { cleanUrl: match[1], tweetId: match[3] };
}

export const listInbox = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return ctx.db
      .query("tweets")
      .withIndex("by_user_folder", (q) =>
        q.eq("userId", userId).eq("folderId", null)
      )
      .order("desc")
      .collect();
  },
});

export const listByFolder = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    return ctx.db
      .query("tweets")
      .withIndex("by_user_folder", (q) =>
        q.eq("userId", userId).eq("folderId", args.folderId)
      )
      .order("desc")
      .collect();
  },
});

export const addFromUrl = mutation({
  args: {
    url: v.string(),
    folderId: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const parsed = extractTweetId(args.url.trim());
    if (!parsed) {
      throw new Error("Invalid tweet URL");
    }

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error("Folder not found");
      }
    }

    const existing = await ctx.db
      .query("tweets")
      .withIndex("by_user_tweetId", (q) =>
        q.eq("userId", userId).eq("tweetId", parsed.tweetId)
      )
      .unique();

    if (existing) {
      if (args.folderId !== existing.folderId) {
        await ctx.db.patch(existing._id, { folderId: args.folderId });
      }
      return existing._id;
    }

    return ctx.db.insert("tweets", {
      userId,
      tweetId: parsed.tweetId,
      url: parsed.cleanUrl,
      folderId: args.folderId,
      createdAt: Date.now(),
      embedStatus: "pending",
    });
  },
});

export const move = mutation({
  args: {
    tweetId: v.id("tweets"),
    folderId: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tweet = await ctx.db.get(args.tweetId);
    if (!tweet || tweet.userId !== userId) {
      throw new Error("Tweet not found");
    }

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error("Folder not found");
      }
    }

    await ctx.db.patch(args.tweetId, { folderId: args.folderId });
  },
});

export const remove = mutation({
  args: { tweetId: v.id("tweets") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tweet = await ctx.db.get(args.tweetId);
    if (!tweet || tweet.userId !== userId) {
      throw new Error("Tweet not found");
    }
    await ctx.db.delete(args.tweetId);
  },
});
