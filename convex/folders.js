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
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteIfEmpty = exports.rename = exports.create = exports.listTree = void 0;
var server_1 = require("./_generated/server");
var values_1 = require("convex/values");
var helpers_1 = require("./helpers");
exports.listTree = (0, server_1.query)({
    args: {},
    handler: function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, folders, tweets, tweetCountByFolder, _i, tweets_1, tweet, key;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _d.sent();
                    return [4 /*yield*/, ctx.db
                            .query("folders")
                            .withIndex("by_user", function (q) { return q.eq("userId", userId); })
                            .order("asc")
                            .collect()];
                case 2:
                    folders = _d.sent();
                    return [4 /*yield*/, ctx.db
                            .query("tweets")
                            .withIndex("by_user_folder", function (q) { return q.eq("userId", userId); })
                            .collect()];
                case 3:
                    tweets = _d.sent();
                    tweetCountByFolder = new Map();
                    for (_i = 0, tweets_1 = tweets; _i < tweets_1.length; _i++) {
                        tweet = tweets_1[_i];
                        key = (_a = tweet.folderId) !== null && _a !== void 0 ? _a : "__inbox__";
                        tweetCountByFolder.set(key, ((_b = tweetCountByFolder.get(key)) !== null && _b !== void 0 ? _b : 0) + 1);
                    }
                    return [2 /*return*/, {
                            folders: folders.map(function (f) {
                                var _a;
                                return (__assign(__assign({}, f), { tweetCount: (_a = tweetCountByFolder.get(f._id)) !== null && _a !== void 0 ? _a : 0 }));
                            }),
                            inboxCount: (_c = tweetCountByFolder.get("__inbox__")) !== null && _c !== void 0 ? _c : 0,
                        }];
            }
        });
    }); },
});
exports.create = (0, server_1.mutation)({
    args: {
        name: values_1.v.string(),
        parentId: values_1.v.union(values_1.v.id("folders"), values_1.v.null()),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, parent_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    if (!args.parentId) return [3 /*break*/, 3];
                    return [4 /*yield*/, ctx.db.get(args.parentId)];
                case 2:
                    parent_1 = _a.sent();
                    if (!parent_1 || parent_1.userId !== userId) {
                        throw new Error("Parent folder not found");
                    }
                    _a.label = 3;
                case 3: return [2 /*return*/, ctx.db.insert("folders", {
                        userId: userId,
                        name: args.name.trim(),
                        parentId: args.parentId,
                        createdAt: Date.now(),
                    })];
            }
        });
    }); },
});
exports.rename = (0, server_1.mutation)({
    args: {
        folderId: values_1.v.id("folders"),
        name: values_1.v.string(),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, folder;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    return [4 /*yield*/, ctx.db.get(args.folderId)];
                case 2:
                    folder = _a.sent();
                    if (!folder || folder.userId !== userId) {
                        throw new Error("Folder not found");
                    }
                    return [4 /*yield*/, ctx.db.patch(args.folderId, { name: args.name.trim() })];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
});
exports.deleteIfEmpty = (0, server_1.mutation)({
    args: {
        folderId: values_1.v.id("folders"),
    },
    handler: function (ctx, args) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, folder, childFolders, tweets;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, helpers_1.requireUserId)(ctx)];
                case 1:
                    userId = _a.sent();
                    return [4 /*yield*/, ctx.db.get(args.folderId)];
                case 2:
                    folder = _a.sent();
                    if (!folder || folder.userId !== userId) {
                        throw new Error("Folder not found");
                    }
                    return [4 /*yield*/, ctx.db
                            .query("folders")
                            .withIndex("by_user_parent", function (q) {
                            return q.eq("userId", userId).eq("parentId", args.folderId);
                        })
                            .collect()];
                case 3:
                    childFolders = _a.sent();
                    if (childFolders.length > 0) {
                        throw new Error("Folder contains subfolders");
                    }
                    return [4 /*yield*/, ctx.db
                            .query("tweets")
                            .withIndex("by_user_folder", function (q) {
                            return q.eq("userId", userId).eq("folderId", args.folderId);
                        })
                            .collect()];
                case 4:
                    tweets = _a.sent();
                    if (tweets.length > 0) {
                        throw new Error("Folder contains tweets");
                    }
                    return [4 /*yield*/, ctx.db.delete(args.folderId)];
                case 5:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); },
});
