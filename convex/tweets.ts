import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./helpers";
import { parseUrl, type SourceType } from "./urlParser";

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

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return ctx.db
      .query("tweets")
      .withIndex("by_user_folder", (q) => q.eq("userId", userId))
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
    shareText: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const parsed = parseUrl(args.url.trim());
    if (!parsed) {
      throw new Error("Invalid URL");
    }

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error("Folder not found");
      }
    }

    const tweetId = parsed.sourceItemId ?? parsed.canonicalUrl;

    const existing = await ctx.db
      .query("tweets")
      .withIndex("by_user_tweetId", (q) =>
        q.eq("userId", userId).eq("tweetId", tweetId)
      )
      .unique();

    if (existing) {
      if (args.folderId !== existing.folderId) {
        await ctx.db.patch(existing._id, { folderId: args.folderId });
      }
      return existing._id;
    }

    const shareText = args.shareText?.trim();
    const hasShareText = shareText && shareText.length > 0;

    const normalizedTags = args.tags
      ? [...new Set(args.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))]
      : undefined;

    return ctx.db.insert("tweets", {
      userId,
      tweetId,
      url: parsed.canonicalUrl,
      folderId: args.folderId,
      createdAt: Date.now(),
      embedStatus: parsed.source === "x" ? (hasShareText ? "ok" : "pending") : parsed.source === "instagram" ? "unavailable" : "pending",
      source: parsed.source,
      canonicalUrl: parsed.canonicalUrl,
      sourceItemId: parsed.sourceItemId,
      ...(hasShareText ? { text: shareText } : {}),
      ...(normalizedTags && normalizedTags.length > 0 ? { tags: normalizedTags } : {}),
      ...(args.note?.trim() ? { note: args.note.trim() } : {}),
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

export const getById = query({
  args: { tweetId: v.id("tweets") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tweet = await ctx.db.get(args.tweetId);
    if (!tweet || tweet.userId !== userId) return null;
    return tweet;
  },
});

export const setMetadata = mutation({
  args: {
    tweetId: v.id("tweets"),
    status: v.union(
      v.literal("pending"),
      v.literal("ok"),
      v.literal("unavailable"),
      v.literal("failed")
    ),
    authorName: v.optional(v.string()),
    authorHandle: v.optional(v.string()),
    authorAvatar: v.optional(v.string()),
    title: v.optional(v.string()),
    text: v.optional(v.string()),
    mediaUrl: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const tweet = await ctx.db.get(args.tweetId);
    if (!tweet || tweet.userId !== userId) {
      throw new Error("Tweet not found");
    }
    const { tweetId, status, ...fields } = args;
    await ctx.db.patch(tweetId, { embedStatus: status, ...fields });
  },
});

export const importRedditItems = mutation({
  args: {
    items: v.array(
      v.object({
        url: v.string(),
        tweetId: v.string(),
        source: v.literal("reddit"),
        canonicalUrl: v.string(),
        sourceItemId: v.optional(v.string()),
        title: v.optional(v.string()),
        authorHandle: v.optional(v.string()),
        authorName: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        text: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    let imported = 0;

    for (const item of args.items) {
      const existing = await ctx.db
        .query("tweets")
        .withIndex("by_user_tweetId", (q) =>
          q.eq("userId", userId).eq("tweetId", item.tweetId)
        )
        .unique();

      if (existing) continue;

      await ctx.db.insert("tweets", {
        userId,
        tweetId: item.tweetId,
        url: item.url,
        folderId: null,
        createdAt: Date.now(),
        embedStatus: "pending" as const,
        source: item.source as SourceType,
        canonicalUrl: item.canonicalUrl,
        sourceItemId: item.sourceItemId,
        ...(item.title ? { title: item.title } : {}),
        ...(item.authorHandle ? { authorHandle: item.authorHandle } : {}),
        ...(item.authorName ? { authorName: item.authorName } : {}),
        ...(item.text ? { text: item.text } : {}),
        ...(item.tags && item.tags.length > 0 ? { tags: item.tags } : {}),
      });

      imported++;
    }

    return { imported };
  },
});
