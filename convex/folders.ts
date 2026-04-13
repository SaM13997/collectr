import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./helpers";

export const listTree = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const folders = await ctx.db
      .query("folders")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("asc")
      .collect();

    const tweets = await ctx.db
      .query("tweets")
      .withIndex("by_user_folder", (q) => q.eq("userId", userId))
      .collect();

    const tweetCountByFolder = new Map<string, number>();
    for (const tweet of tweets) {
      const key = tweet.folderId ?? "__inbox__";
      tweetCountByFolder.set(key, (tweetCountByFolder.get(key) ?? 0) + 1);
    }

    return {
      folders: folders.map((f) => ({
        ...f,
        tweetCount: tweetCountByFolder.get(f._id) ?? 0,
      })),
      inboxCount: tweetCountByFolder.get("__inbox__") ?? 0,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    parentId: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (!parent || parent.userId !== userId) {
        throw new Error("Parent folder not found");
      }
    }

    return ctx.db.insert("folders", {
      userId,
      name: args.name.trim(),
      parentId: args.parentId,
      createdAt: Date.now(),
    });
  },
});

export const rename = mutation({
  args: {
    folderId: v.id("folders"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found");
    }
    await ctx.db.patch(args.folderId, { name: args.name.trim() });
  },
});

export const deleteIfEmpty = mutation({
  args: {
    folderId: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const folder = await ctx.db.get(args.folderId);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found");
    }

    const childFolders = await ctx.db
      .query("folders")
      .withIndex("by_user_parent", (q) =>
        q.eq("userId", userId).eq("parentId", args.folderId)
      )
      .collect();

    if (childFolders.length > 0) {
      throw new Error("Folder contains subfolders");
    }

    const tweets = await ctx.db
      .query("tweets")
      .withIndex("by_user_folder", (q) =>
        q.eq("userId", userId).eq("folderId", args.folderId)
      )
      .collect();

    if (tweets.length > 0) {
      throw new Error("Folder contains tweets");
    }

    await ctx.db.delete(args.folderId);
  },
});
