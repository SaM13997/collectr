import { action, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./helpers";
import { internal } from "./_generated/api";

export const enrichItem = action({
  args: {
    itemId: v.id("items"),
    url: v.string(),
    title: v.optional(v.string()),
    text: v.optional(v.string()),
    source: v.union(
      v.literal("x"),
      v.literal("reddit"),
      v.literal("instagram"),
      v.literal("link")
    ),
  },
  handler: async (ctx, args) => {
    await requireUserId(ctx as any);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return;

    const content = [args.title, args.text].filter(Boolean).join("\n\n");
    if (!content.trim()) return;

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                'You are a helpful assistant that analyzes saved web content. Respond with JSON only: {"summary": "<1-2 sentence summary>", "tags": ["<tag1>", "<tag2>", ...]}. Generate 2-5 lowercase tags that describe the content topics. Keep the summary concise and informative.',
            },
            {
              role: "user",
              content: `Analyze this ${args.source} post:\n\nURL: ${args.url}\n\n${content}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 300,
        }),
      });

      if (!response.ok) return;

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const raw = data.choices?.[0]?.message?.content;
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        summary?: string;
        tags?: string[];
      };

      const summary = parsed.summary?.trim();
      const tags = parsed.tags
        ?.map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 5);

      if (!summary && (!tags || tags.length === 0)) return;

      await ctx.runMutation(internal.aiEnrichment.applyEnrichment, {
        itemId: args.itemId,
        summary,
        tags,
      });
    } catch {
      // Silently skip on any error
    }
  },
});

export const applyEnrichment = internalMutation({
  args: {
    itemId: v.id("items"),
    summary: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { itemId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    if (fields.summary) updates.summary = fields.summary;
    if (fields.tags && fields.tags.length > 0) updates.tags = fields.tags;
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(itemId, updates);
    }
  },
});
