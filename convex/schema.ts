import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  folders: defineTable({
    userId: v.string(),
    name: v.string(),
    parentId: v.union(v.id("folders"), v.null()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_parent", ["userId", "parentId"]),

  tweets: defineTable({
    userId: v.string(),
    tweetId: v.string(),
    url: v.string(),
    folderId: v.union(v.id("folders"), v.null()),
    createdAt: v.number(),
    embedStatus: v.union(
      v.literal("pending"),
      v.literal("ok"),
      v.literal("unavailable"),
      v.literal("failed")
    ),
  })
    .index("by_user_folder", ["userId", "folderId"])
    .index("by_user_tweetId", ["userId", "tweetId"]),
});
