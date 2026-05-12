import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/system/primitives/button";
import { Pill } from "@/components/system/primitives/pill";
import {
  ExternalLink,
  FolderInput,
  GripVertical,
  MoreHorizontal,
  Trash2,
  Hash,
  Globe,
  Camera,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFaviconUrl } from "@/lib/favicon";
import { toast } from "sonner";
import {
  Expandable,
  ExpandableTrigger,
  ExpandableContent,
} from "@/components/ui/expandable";
interface SavedItemCardProps {
  item: Doc<"items">;
  onOpen?: () => void;
  onMove?: (id: Id<"items">) => void;
  className?: string;
  variant?: "grid" | "list";
  showDragHandle?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  selected?: boolean;
  onToggleSelection?: () => void;
  onLongPress?: () => void;
}

export function SavedItemCard({
  item,
  onOpen,
  onMove,
  className,
  variant = "grid",
  showDragHandle = false,
  dragHandleProps,
  selected = false,
  onToggleSelection,
  onLongPress,
}: SavedItemCardProps) {
  const [showActions, setShowActions] = useState(false);
  const removeItem = useMutation(api.items.remove).withOptimisticUpdate(
    (store, args) => {
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listInbox)) {
        if (value) {
          store.setQuery(api.items.listInbox, queryArgs, value.filter((t) => t._id !== args.itemId));
        }
      }
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listAll)) {
        if (value) {
          store.setQuery(api.items.listAll, queryArgs, value.filter((t) => t._id !== args.itemId));
        }
      }
    }
  );
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sourceDomains: Record<string, string> = {
    x: "x.com",
    reddit: "reddit.com",
    instagram: "instagram.com",
  };
  const domain = sourceDomains[item.source] ?? (() => { try { return new URL(item.url).hostname; } catch { return "link"; } })();
  const handle = extractHandle(item.url);
  const isList = variant === "list";

  const primaryLabel = item.source === "reddit"
    ? (item.authorName || "Reddit")
    : item.source === "instagram"
      ? (item.authorHandle ? `@${item.authorHandle}` : "Instagram")
      : (item.authorHandle
        ? `@${item.authorHandle}`
        : handle
          ? `@${handle}`
          : "Saved item");

  const secondaryLabel = item.source === "reddit"
    ? (item.title || item.text?.trim() || "Reddit post")
    : item.source === "instagram"
      ? (item.text?.trim() || "Instagram post")
      : (item.text?.trim() || "Content unavailable");

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(item.url, "_blank", "noopener,noreferrer");
  };

  const handleTouchStart = () => {
    if (!onLongPress) return;
    longPressTimerRef.current = setTimeout(() => {
      onLongPress();
      longPressTimerRef.current = null;
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const cardContent = (
    <>
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-sm)] bg-panel-strong dark:bg-charcoal-2 transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
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
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-panel-strong dark:bg-charcoal-2 p-2">
            {item.source === "x" ? (
              <svg
                viewBox="0 0 24 24"
                className={cn("text-foreground/80", isList ? "size-5" : "size-8")}
                fill="currentColor"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            ) : item.source === "reddit" ? (
              <svg
                viewBox="0 0 24 24"
                className={cn("text-foreground/80", isList ? "size-5" : "size-8")}
                fill="currentColor"
              >
                <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744a1.926 1.926 0 0 1 1.928 1.928 1.927 1.927 0 0 1-1.928 1.928 1.927 1.927 0 0 1-1.928-1.928 1.926 1.926 0 0 1 1.928-1.928zM6.934 7.002a1.93 1.93 0 0 1 1.928 1.928 1.93 1.93 0 0 1-1.928 1.928 1.93 1.93 0 0 1-1.928-1.928 1.93 1.93 0 0 1 1.928-1.928zm4.972 1.61a5.054 5.054 0 0 0-4.148 2.164.499.499 0 1 0 .818.572 4.053 4.053 0 0 1 6.66 0 .5.5 0 0 0 .818-.572 5.054 5.054 0 0 0-4.148-2.164zm8.02 2.513a1.26 1.26 0 0 0-1.027.477l-2.83-.916a.5.5 0 0 0-.3.953l2.828.916a1.268 1.268 0 0 0 1.329 1.266 1.268 1.268 0 0 0-.2-2.696z" />
              </svg>
            ) : item.source === "instagram" ? (
              <Camera className={cn("text-foreground/80", isList ? "size-5" : "size-8")} />
            ) : (() => {
              const faviconUrl = getFaviconUrl(item.url, isList ? 24 : 48);
              return faviconUrl ? (
                <img src={faviconUrl} alt="" className={cn("rounded-sm", isList ? "size-6" : "size-10")} />
              ) : (
                <Globe className={cn("text-foreground/80", isList ? "size-5" : "size-8")} />
              );
            })()}
            {!isList && (
              <Pill variant="default" size="sm" className="mt-1 opacity-80">
                {domain}
              </Pill>
            )}
          </div>
        )}
        <button
          onClick={handleOpenExternal}
          className="absolute bottom-1 right-1 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-background/80 text-muted-foreground/60 transition hover:bg-background hover:text-foreground"
          aria-label="Open original link"
        >
          <ExternalLink className="size-3" />
        </button>
      </div>
      <div className={cn("min-w-0 overflow-hidden", isList ? "flex-1" : "px-0.5")}>
        <p className={cn("truncate text-xs text-foreground", item.isRead ? "font-medium" : "font-bold")}>
          {!item.isRead && (
            <span className="mr-1.5 inline-block size-1.5 rounded-full bg-blue-500 align-middle" />
          )}
          {primaryLabel}
        </p>
        <p className="truncate text-[11px] text-muted-foreground">
          {secondaryLabel}
        </p>
        {item.tags && item.tags.length > 0 ? (
          <div className="mt-0.5 flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 rounded-full border border-line px-1.5 py-0 text-[10px] text-ink/70 dark:border-dark-border dark:text-dark-muted-text bg-white/50 dark:bg-charcoal/50"
              >
                <Hash className="size-2.5" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}
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
            "flex items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 ease-[var(--ease-out)] hover:bg-background/90 hover:text-foreground active:scale-[0.95] min-h-11 min-w-11",
            isList
              ? "bg-transparent"
              : "absolute right-2 top-2 bg-background/50 opacity-100 backdrop-blur-sm"
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
              className="min-h-11 justify-start gap-2 px-2 text-xs transition-colors duration-150 ease-[var(--ease-out)]"
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
              className="min-h-11 justify-start gap-2 px-2 text-xs text-destructive transition-colors duration-150 ease-[var(--ease-out)] hover:text-destructive"
              onClick={async (e) => {
                e.stopPropagation();
                e.preventDefault();
                try {
                  await removeItem({ itemId: item._id });
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
        {showDragHandle && isList && (
          <div
            {...dragHandleProps}
            className="flex shrink-0 cursor-grab items-center justify-center rounded-md text-muted-foreground/40 transition-colors duration-150 hover:text-muted-foreground active:cursor-grabbing min-h-11 min-w-6"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-4" />
          </div>
        )}
        {onToggleSelection && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection();
            }}
            className={cn(
              "flex shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-150 min-h-11 min-w-11",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-transparent hover:border-primary/50"
            )}
            aria-label={selected ? "Deselect item" : "Select item"}
          >
            <Check className="size-4" />
          </button>
        )}
        <button
        type="button"
        onClick={onOpen}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={cn(
          "flex gap-3 text-left",
          isList
            ? "min-w-0 flex-1 items-center rounded-[var(--radius-md)] border border-line bg-panel p-3 transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.99] [@media(hover:hover)]:hover:bg-surface-raised dark:border-dark-border dark:bg-charcoal dark:hover:bg-charcoal-2"
            : "flex-col"
        )}
        aria-label={
          item.authorHandle || handle
            ? `View entry by @${item.authorHandle || handle}`
            : item.authorName || `View entry`
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
