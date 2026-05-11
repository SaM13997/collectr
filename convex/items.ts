import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./helpers";
import { parseUrl, type SourceType } from "./urlParser";

export const listInbox = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    return ctx.db
      .query("items")
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
      .query("items")
      .withIndex("by_user_folder", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const listByFolder = query({
  args: { folderId: v.id("folders") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const items = await ctx.db
      .query("items")
      .withIndex("by_user_folder", (q) =>
        q.eq("userId", userId).eq("folderId", args.folderId)
      )
      .collect();
    items.sort((a, b) => (b.order ?? b.createdAt) - (a.order ?? a.createdAt));
    return items;
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

    const itemId = parsed.sourceItemId ?? parsed.canonicalUrl;

    const existing = await ctx.db
      .query("items")
      .withIndex("by_user_itemId", (q) =>
        q.eq("userId", userId).eq("itemId", itemId)
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

    return ctx.db.insert("items", {
      userId,
      itemId,
      url: parsed.canonicalUrl,
      folderId: args.folderId,
      createdAt: Date.now(),
      embedStatus: parsed.source === "x" ? (hasShareText ? "ok" : "pending") : parsed.source === "instagram" ? "ok" : "pending",
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
    itemId: v.id("items"),
    folderId: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found");
    }

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error("Folder not found");
      }
    }

    await ctx.db.patch(args.itemId, { folderId: args.folderId });
  },
});

export const reorder = mutation({
  args: {
    orderedIds: v.array(v.id("items")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const now = Date.now();
    for (let i = 0; i < args.orderedIds.length; i++) {
      const item = await ctx.db.get(args.orderedIds[i]);
      if (!item || item.userId !== userId) {
        throw new Error("Item not found");
      }
      await ctx.db.patch(args.orderedIds[i], { order: now - i });
    }
  },
});

export const remove = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found");
    }
    await ctx.db.delete(args.itemId);
  },
});

export const bulkDelete = mutation({
  args: { itemIds: v.array(v.id("items")) },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    let deleted = 0;
    for (const itemId of args.itemIds) {
      const item = await ctx.db.get(itemId);
      if (item && item.userId === userId) {
        await ctx.db.delete(itemId);
        deleted++;
      }
    }
    return { deleted };
  },
});

export const bulkMove = mutation({
  args: {
    itemIds: v.array(v.id("items")),
    folderId: v.union(v.id("folders"), v.null()),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);

    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.userId !== userId) {
        throw new Error("Folder not found");
      }
    }

    let moved = 0;
    for (const itemId of args.itemIds) {
      const item = await ctx.db.get(itemId);
      if (item && item.userId === userId) {
        await ctx.db.patch(itemId, { folderId: args.folderId });
        moved++;
      }
    }
    return { moved };
  },
});

export const getById = query({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) return null;
    return item;
  },
});

export const setMetadata = mutation({
  args: {
    itemId: v.id("items"),
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
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found");
    }
    const { itemId, status, ...fields } = args;
    await ctx.db.patch(itemId, { embedStatus: status, ...fields });
  },
});

export const markAsRead = mutation({
  args: { itemId: v.id("items") },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const item = await ctx.db.get(args.itemId);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found");
    }
    if (!item.isRead) {
      await ctx.db.patch(args.itemId, { isRead: true });
    }
  },
});

export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUserId(ctx);
    const unread = await ctx.db
      .query("items")
      .withIndex("by_user_folder", (q) => q.eq("userId", userId))
      .filter((q) => q.neq(q.field("isRead"), true))
      .collect();
    for (const item of unread) {
      await ctx.db.patch(item._id, { isRead: true });
    }
    return { count: unread.length };
  },
});

export const importItems = mutation({
  args: {
    items: v.array(
      v.object({
        url: v.string(),
        canonicalUrl: v.string(),
        source: v.union(
          v.literal("x"),
          v.literal("reddit"),
          v.literal("instagram"),
          v.literal("link")
        ),
        sourceItemId: v.optional(v.string()),
        title: v.optional(v.string()),
        description: v.optional(v.string()),
        note: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        authorName: v.optional(v.string()),
        authorHandle: v.optional(v.string()),
        text: v.optional(v.string()),
        mediaUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    let imported = 0;
    let skipped = 0;

    for (const item of args.items) {
      const itemId = item.sourceItemId ?? item.canonicalUrl;

      const existing = await ctx.db
        .query("items")
        .withIndex("by_user_itemId", (q) =>
          q.eq("userId", userId).eq("itemId", itemId)
        )
        .unique();

      if (existing) {
        skipped++;
        continue;
      }

      const normalizedTags = item.tags
        ? [...new Set(item.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))]
        : undefined;

      await ctx.db.insert("items", {
        userId,
        itemId,
        url: item.canonicalUrl,
        folderId: null,
        createdAt: Date.now(),
        embedStatus: "pending" as const,
        source: item.source,
        canonicalUrl: item.canonicalUrl,
        sourceItemId: item.sourceItemId,
        ...(item.title ? { title: item.title } : {}),
        ...(item.description ? { description: item.description } : {}),
        ...(item.note?.trim() ? { note: item.note.trim() } : {}),
        ...(item.authorName ? { authorName: item.authorName } : {}),
        ...(item.authorHandle ? { authorHandle: item.authorHandle } : {}),
        ...(item.text ? { text: item.text } : {}),
        ...(item.mediaUrl ? { mediaUrl: item.mediaUrl } : {}),
        ...(normalizedTags && normalizedTags.length > 0 ? { tags: normalizedTags } : {}),
      });

      imported++;
    }

    return { imported, skipped };
  },
});

export const importRedditItems = mutation({
  args: {
    items: v.array(
      v.object({
        url: v.string(),
        itemId: v.string(),
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
        .query("items")
        .withIndex("by_user_itemId", (q) =>
          q.eq("userId", userId).eq("itemId", item.itemId)
        )
        .unique();

      if (existing) continue;

      await ctx.db.insert("items", {
        userId,
        itemId: item.itemId,
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
