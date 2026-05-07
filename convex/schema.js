"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = require("convex/server");
var values_1 = require("convex/values");
exports.default = (0, server_1.defineSchema)({
    folders: (0, server_1.defineTable)({
        userId: values_1.v.string(),
        name: values_1.v.string(),
        parentId: values_1.v.union(values_1.v.id("folders"), values_1.v.null()),
        createdAt: values_1.v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_user_parent", ["userId", "parentId"]),
    tweets: (0, server_1.defineTable)({
        userId: values_1.v.string(),
        tweetId: values_1.v.string(),
        url: values_1.v.string(),
        folderId: values_1.v.union(values_1.v.id("folders"), values_1.v.null()),
        createdAt: values_1.v.number(),
        embedStatus: values_1.v.union(values_1.v.literal("pending"), values_1.v.literal("ok"), values_1.v.literal("unavailable"), values_1.v.literal("failed")),
        authorName: values_1.v.optional(values_1.v.string()),
        authorHandle: values_1.v.optional(values_1.v.string()),
        authorAvatar: values_1.v.optional(values_1.v.string()),
        text: values_1.v.optional(values_1.v.string()),
        mediaUrl: values_1.v.optional(values_1.v.string()),
    })
        .index("by_user_folder", ["userId", "folderId"])
        .index("by_user_tweetId", ["userId", "tweetId"]),
});
