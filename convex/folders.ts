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

    const items = await ctx.db
      .query("items")
      .withIndex("by_user_folder", (q) => q.eq("userId", userId))
      .collect();

    const itemCountByFolder = new Map<string, number>();
    for (const item of items) {
      const key = item.folderId ?? "__inbox__";
      itemCountByFolder.set(key, (itemCountByFolder.get(key) ?? 0) + 1);
    }

    return {
      folders: folders.map((f) => ({
        ...f,
        itemCount: itemCountByFolder.get(f._id) ?? 0,
      })),
      inboxCount: itemCountByFolder.get("__inbox__") ?? 0,
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

    const items = await ctx.db
      .query("items")
      .withIndex("by_user_folder", (q) =>
        q.eq("userId", userId).eq("folderId", args.folderId)
      )
      .collect();

    if (items.length > 0) {
      throw new Error("Folder contains items");
    }

    await ctx.db.delete(args.folderId);
  },
});
