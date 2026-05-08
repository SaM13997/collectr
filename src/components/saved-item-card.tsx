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
import {
  Expandable,
  ExpandableTrigger,
  ExpandableContent,
} from "@/components/ui/expandable";
interface SavedItemCardProps {
  item: Doc<"tweets">;
  onOpen?: () => void;
  onMove?: (id: Id<"tweets">) => void;
  className?: string;
  variant?: "grid" | "list";
}

export function SavedItemCard({
  item,
  onOpen,
  onMove,
  className,
  variant = "grid",
}: SavedItemCardProps) {
  const [showActions, setShowActions] = useState(false);
  const removeTweet = useMutation(api.tweets.remove);

  const domain = "x.com";
  const handle = extractHandle(item.url);
  const isList = variant === "list";

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const cardContent = (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-muted transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
          isList ? "size-14 shrink-0" : "aspect-square"
        )}
      >
        {item.mediaUrl || item.authorAvatar ? (
          <img
            src={item.mediaUrl || item.authorAvatar}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-muted to-background p-2">
            <svg
              viewBox="0 0 24 24"
              className={cn("text-foreground/80", isList ? "size-5" : "size-8")}
              fill="currentColor"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            {!isList && (
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {domain}
              </span>
            )}
          </div>
        )}
        <button
          onClick={handleOpenExternal}
          className="absolute bottom-1 right-1 flex size-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground/60 transition hover:bg-background hover:text-foreground"
          aria-label="Open original link"
        >
          <ExternalLink className="size-3" />
        </button>
      </div>
      <div className={cn("min-w-0 overflow-hidden", isList ? "flex-1" : "px-0.5")}>
        <p className="truncate text-xs font-medium text-foreground">
          {item.authorHandle
            ? `@${item.authorHandle}`
            : handle
              ? `@${handle}`
              : `Post ${item.tweetId}`}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {item.text?.trim() || "Tweet text unavailable"}
        </p>
      </div>
    </>
  );

  const actions = (
    <div className={cn(isList ? "relative shrink-0" : "")}>
      {showActions && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowActions(false)}
        />
      )}
      <Expandable
        expanded={showActions}
        onToggle={() => setShowActions(!showActions)}
      >
          <ExpandableTrigger
          className={cn(
            "flex items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 ease-[var(--ease-out)] hover:bg-background/90 hover:text-foreground active:scale-[0.95]",
            isList
              ? "size-8 bg-transparent"
              : "absolute right-2 top-2 size-9 bg-background/50 opacity-100 backdrop-blur-sm"
          )}
        >
          <MoreHorizontal className="size-4" />
        </ExpandableTrigger>
        <ExpandableContent
          preset="scale"
          className={cn(
            "z-40",
            isList ? "absolute right-0 top-9" : "absolute right-2 top-10"
          )}
        >
          <div className="flex w-32 flex-col gap-1 rounded-xl border border-border bg-card p-1.5 shadow-lg">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 justify-start gap-2 px-2 text-xs transition-colors duration-150 ease-[var(--ease-out)]"
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
              className="h-9 justify-start gap-2 px-2 text-xs text-destructive transition-colors duration-150 ease-[var(--ease-out)] hover:text-destructive"
              onClick={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                try {
                  await removeTweet({ tweetId: item._id });
                } catch (err) {
                  toast.error("Failed to remove", {
                    description:
                      err instanceof Error
                        ? err.message
                        : "Something went wrong.",
                  });
                }
                setShowActions(false);
              }}
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          </div>
        </ExpandableContent>
      </Expandable>
    </div>
  );

  return (
    <div className={cn("group relative", isList ? "flex items-center gap-2" : "", className)}>
        <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex gap-3 text-left",
          isList
            ? "min-w-0 flex-1 items-center rounded-xl border border-border bg-card p-3 transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.99] [@media(hover:hover)]:hover:bg-accent"
            : "flex-col"
        )}
        aria-label={
          item.authorHandle || handle
            ? `View entry by @${item.authorHandle || handle}`
            : `View entry`
        }
      >
        {cardContent}
      </button>
      {actions}
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
