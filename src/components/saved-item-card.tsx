import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  FolderInput,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SavedItemCardProps {
  item: Doc<"tweets">;
  onMove?: (id: Id<"tweets">) => void;
  className?: string;
}

export function SavedItemCard({
  item,
  onMove,
  className,
}: SavedItemCardProps) {
  const [showActions, setShowActions] = useState(false);
  const removeTweet = useMutation(api.tweets.remove);

  const domain = "x.com";
  const handle = extractHandle(item.url);

  return (
    <div className={cn("group relative", className)}>
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-2"
        aria-label={
          handle
            ? `Open post by @${handle} on X.com (opens in new tab)`
            : `Open post on X.com (opens in new tab)`
        }
      >
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {/* Placeholder visual */}
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-background p-3">
            <svg
              viewBox="0 0 24 24"
              className="size-8 text-foreground/80"
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              {domain}
            </span>
          </div>
          <ExternalLink className="absolute bottom-2 right-2 size-3.5 text-muted-foreground/60" />
        </div>
        <div className="px-0.5">
          <p className="truncate text-xs font-medium text-foreground">
            {handle ? `@${handle}` : `Post ${item.tweetId}`}
          </p>
          <p className="truncate text-[11px] text-muted-foreground">
            {item.url}
          </p>
        </div>
      </a>

      {/* Actions */}
      <button
        className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-background/50 text-muted-foreground opacity-100 backdrop-blur-sm transition hover:bg-background/90 hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowActions(!showActions);
        }}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {showActions ? (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowActions(false)}
          />
          <div className="absolute right-2 top-10 z-40 flex flex-col gap-1 rounded-xl border border-border bg-card p-1.5 shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              className="h-10 justify-start gap-2 px-2 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onMove?.(item._id);
                setShowActions(false);
              }}
            >
              <FolderInput className="size-3.5" />
              Move
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-10 justify-start gap-2 px-2 text-xs text-destructive hover:text-destructive"
              onClick={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                try {
                  await removeTweet({ tweetId: item._id });
                } catch (err) {
                  toast.error("Failed to remove", {
                    description:
                      err instanceof Error ? err.message : "Something went wrong.",
                  });
                }
                setShowActions(false);
              }}
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function extractHandle(url: string): string | null {
  try {
    const match = url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\//);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}
