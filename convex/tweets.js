"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setMetadata = exports.getById = exports.remove = exports.move = exports.addFromUrl = exports.listByFolder = exports.listInbox = void 0;
var server_1 = require("./_generated/server");
var values_1 = require("convex/values");
var helpers_1 = require("./helpers");
var TWEET_URL_RE = /(https?:\/\/(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/(\w+)\/status\/(\d+))/i;
function extractTweetId(url) {
    var match = url.match(TWEET_URL_RE);
    if (!match)
        return null;
    return { cleanUrl: match[1], tweetId: match[3] };
}
exports.listInbox = (0, server_1.query)({
    args: {},
    handler: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var userId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    return [2 /*return*/, ctx.db
                            .query("tweets")
                            .withIndex("by_user_folder", function (q) {
                            return q.eq("userId", userId).eq("folderId", null);
                        })
                            .order("desc")
                            .collect()];
            }
        });
    }); },
});
exports.listByFolder = (0, server_1.query)({
    args: { folderId: values_1.v.id("folders") },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    return [2 /*return*/, ctx.db
                            .query("tweets")
                            .withIndex("by_user_folder", function (q) {
                            return q.eq("userId", userId).eq("folderId", args.folderId);
                        })
                            .order("desc")
                            .collect()];
            }
        });
    }); },
});
exports.addFromUrl = (0, server_1.mutation)({
    args: {
        url: values_1.v.string(),
        folderId: values_1.v.union(values_1.v.id("folders"), values_1.v.null()),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, parsed, folder, existing;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    parsed = extractTweetId(args.url.trim());
                    if (!parsed) {
                        throw new Error("Invalid tweet URL");
                    }
                    if (!args.folderId) return [3 /*break*/, 3];
                    return [4 /*yield*/, ctx.db.get(args.folderId)];
                case 2:
                    folder = _a.sent();
                    if (!folder || folder.userId !== userId) {
                        throw new Error("Folder not found");
                    }
                    _a.label = 3;
                case 3: return [4 /*yield*/, ctx.db
                        .query("tweets")
                        .withIndex("by_user_tweetId", function (q) {
                        return q.eq("userId", userId).eq("tweetId", parsed.tweetId);
                    })
                        .unique()];
                case 4:
                    existing = _a.sent();
                    if (!existing) return [3 /*break*/, 7];
                    if (!(args.folderId !== existing.folderId)) return [3 /*break*/, 6];
                    return [4 /*yield*/, ctx.db.patch(existing._id, { folderId: args.folderId })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, existing._id];
                case 7: return [2 /*return*/, ctx.db.insert("tweets", {
                        userId: userId,
                        tweetId: parsed.tweetId,
                        url: parsed.cleanUrl,
                        folderId: args.folderId,
                        createdAt: Date.now(),
                        embedStatus: "pending",
                    })];
            }
        });
    }); },
});
exports.move = (0, server_1.mutation)({
    args: {
        tweetId: values_1.v.id("tweets"),
        folderId: values_1.v.union(values_1.v.id("folders"), values_1.v.null()),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, tweet, folder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    return [4 /*yield*/, ctx.db.get(args.tweetId)];
                case 2:
                    tweet = _a.sent();
                    if (!tweet || tweet.userId !== userId) {
                        throw new Error("Tweet not found");
                    }
                    if (!args.folderId) return [3 /*break*/, 4];
                    return [4 /*yield*/, ctx.db.get(args.folderId)];
                case 3:
                    folder = _a.sent();
                    if (!folder || folder.userId !== userId) {
                        throw new Error("Folder not found");
                    }
                    _a.label = 4;
                case 4: return [4 /*yield*/, ctx.db.patch(args.tweetId, { folderId: args.folderId })];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
});
exports.remove = (0, server_1.mutation)({
    args: { tweetId: values_1.v.id("tweets") },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, tweet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    return [4 /*yield*/, ctx.db.get(args.tweetId)];
                case 2:
                    tweet = _a.sent();
                    if (!tweet || tweet.userId !== userId) {
                        throw new Error("Tweet not found");
                    }
                    return [4 /*yield*/, ctx.db.delete(args.tweetId)];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
});
exports.getById = (0, server_1.query)({
    args: { tweetId: values_1.v.id("tweets") },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, tweet;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    return [4 /*yield*/, ctx.db.get(args.tweetId)];
                case 2:
                    tweet = _a.sent();
                    if (!tweet || tweet.userId !== userId)
                        return [2 /*return*/, null];
                    return [2 /*return*/, tweet];
            }
        });
    }); },
});
exports.setMetadata = (0, server_1.mutation)({
    args: {
        tweetId: values_1.v.id("tweets"),
        status: values_1.v.union(values_1.v.literal("pending"), values_1.v.literal("ok"), values_1.v.literal("unavailable"), values_1.v.literal("failed")),
        authorName: values_1.v.optional(values_1.v.string()),
        authorHandle: values_1.v.optional(values_1.v.string()),
        authorAvatar: values_1.v.optional(values_1.v.string()),
        text: values_1.v.optional(values_1.v.string()),
        mediaUrl: values_1.v.optional(values_1.v.string()),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, tweet, tweetId, status, fields;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    return [4 /*yield*/, ctx.db.get(args.tweetId)];
                case 2:
                    tweet = _a.sent();
                    if (!tweet || tweet.userId !== userId) {
                        throw new Error("Tweet not found");
                    }
                    tweetId = args.tweetId, status = args.status, fields = __rest(args, ["tweetId", "status"]);
                    return [4 /*yield*/, ctx.db.patch(tweetId, __assign({ embedStatus: status }, fields))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
});
