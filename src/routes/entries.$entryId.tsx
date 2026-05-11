import { useEffect, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppLayout } from "@/components/layout/AppLayout";

import { FolderPicker } from "@/components/folder-picker";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ExternalLink,
  FolderInput,
  Trash2,
  Copy,
  Check,
  Hash,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFaviconUrl } from "@/lib/favicon";
import { toast } from "sonner";
import { useTweetMetadataSync } from "@/components/tweet-metadata-sync";
import { PageSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/entries/$entryId")({
  component: EntryPage,
});

function EntryPage() {
  const { session, isPending } = useAuthSession();

  if (isPending) {
    return <PageSkeleton />;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to view entries.</p>
          <Button asChild className="mt-4">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </main>
    );
  }

  return <EntryView />;
}

function EntryView() {
  const { entryId } = Route.useParams();
  const typedEntryId = entryId as Id<"items">;
  const router = useRouter();
  const item = useQuery(api.items.getById, { itemId: typedEntryId });
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
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listByFolder)) {
        if (value) {
          store.setQuery(api.items.listByFolder, queryArgs, value.filter((t) => t._id !== args.itemId));
        }
      }
    }
  );
  const markAsRead = useMutation(api.items.markAsRead).withOptimisticUpdate(
    (store, args) => {
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listInbox)) {
        if (value) {
          store.setQuery(api.items.listInbox, queryArgs, value.map((t) =>
            t._id === args.itemId ? { ...t, isRead: true } : t
          ));
        }
      }
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listAll)) {
        if (value) {
          store.setQuery(api.items.listAll, queryArgs, value.map((t) =>
            t._id === args.itemId ? { ...t, isRead: true } : t
          ));
        }
      }
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listByFolder)) {
        if (value) {
          store.setQuery(api.items.listByFolder, queryArgs, value.map((t) =>
            t._id === args.itemId ? { ...t, isRead: true } : t
          ));
        }
      }
    }
  );
  useTweetMetadataSync(item);

  useEffect(() => {
    if (item && !item.isRead) {
      markAsRead({ itemId: item._id }).catch(() => {});
    }
  }, [item, markAsRead]);

  const [movingItemId, setMovingItemId] = useState<Id<"items"> | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    try {
      await removeItem({ itemId: item._id });
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error("Failed to remove", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  if (item === undefined) {
    return (
      <AppLayout backButton={<BackButton onClick={() => router.history.back()} />}>
        <div className="flex flex-col gap-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          </div>
          <div className="h-24 rounded-xl bg-muted" />
          <div className="h-48 rounded-xl bg-muted" />
        </div>
      </AppLayout>
    );
  }

  if (item === null) {
    return (
      <AppLayout title="Not found" backButton={<BackButton onClick={() => router.history.back()} />}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold">Entry not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This entry may have been deleted or you don't have access.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">Go back</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handle = extractHandle(item.url);
  const displayName = item.source === "instagram"
    ? (item.authorName || "Instagram")
    : (item.authorName || handle || "Unknown");
  const displayHandle = item.authorHandle || handle;

  const sourceLabels: Record<string, string> = {
    x: "Open on X",
    reddit: "Open on Reddit",
    instagram: "Open on Instagram",
    link: "Open link",
  };
  const openLabel = sourceLabels[item.source] || "Open link";

  const fallbackText = item.source === "reddit"
    ? "No post content."
    : item.source === "instagram"
      ? "Instagram post"
      : "Content unavailable.";

  return (
    <AppLayout
      title={displayHandle ? `@${displayHandle}` : item.source === "instagram" ? "Instagram" : "Entry"}
      backButton={<BackButton onClick={() => router.history.back()} />}
    >
      {/* Author header */}
        <div className="flex items-center gap-3">
        {item.authorAvatar ? (
          <img
            src={item.authorAvatar}
            alt={displayName}
            className="size-12 shrink-0 rounded-full object-cover transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]">
            {item.source === "instagram" && !item.authorName ? (
              <Camera className="size-6 text-muted-foreground" />
            ) : (() => {
              const faviconUrl = item.source !== "x" && item.source !== "reddit" && item.source !== "instagram"
                ? getFaviconUrl(item.url, 48)
                : null;
              return faviconUrl ? (
                <img src={faviconUrl} alt="" className="size-7 rounded-sm" />
              ) : (
                <span className="text-lg font-semibold text-muted-foreground">
                  {displayName[0]?.toUpperCase()}
                </span>
              );
            })()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {displayName}
          </p>
          {displayHandle ? (
            <p className="truncate text-xs text-muted-foreground">
              @{displayHandle}
            </p>
          ) : null}
        </div>
      </div>

      {item.title?.trim() && (
        <h2 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h2>
      )}

      {item.text?.trim() ? (
        <div className={cn("rounded-xl border border-border bg-card p-card-padding", item.title?.trim() ? "mt-2" : "mt-4")}>
          <p className="whitespace-pre-wrap text-body text-foreground leading-relaxed">
            {item.text}
          </p>
        </div>
      ) : !item.title?.trim() ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-card-padding">
          <p className="text-body text-muted-foreground">
            {fallbackText}
          </p>
        </div>
      ) : null}

      {/* Media preview */}
      {item.mediaUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <img
            src={item.mediaUrl}
            alt=""
            className="w-full object-cover transition-transform duration-300 ease-[var(--ease-out)] hover:scale-[1.01]"
            loading="lazy"
          />
        </div>
      ) : null}

      {/* Summary */}
      {item.summary?.trim() ? (
        <div className="mt-4 rounded-xl border border-border bg-card p-card-padding">
          <p className="text-xs font-medium text-muted-foreground mb-1">Summary</p>
          <p className="whitespace-pre-wrap text-body text-foreground leading-relaxed">
            {item.summary}
          </p>
        </div>
      ) : null}

      {/* Note */}
      {item.note?.trim() ? (
        <div className="mt-4 rounded-xl border border-border bg-card p-card-padding">
          <p className="text-xs font-medium text-muted-foreground mb-1">Note</p>
          <p className="whitespace-pre-wrap text-body text-foreground leading-relaxed">
            {item.note}
          </p>
        </div>
      ) : null}

      {/* Tags */}
      {item.tags && item.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground"
            >
              <Hash className="size-3" />
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-2">
        {/* Open original */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors duration-150 ease-[var(--ease-out)] hover:bg-accent active:scale-[0.99]"
        >
          <ExternalLink className="size-4" />
          {openLabel}
        </a>

        {/* Secondary actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 transition-colors duration-150 ease-[var(--ease-out)]"
            onClick={handleCopyUrl}
          >
            {copied ? (
              <Check className="size-4 text-green-500" />
            ) : (
              <Copy className="size-4" />
            )}
            {copied ? "Copied" : "Copy URL"}
          </Button>

          <Button
            variant="outline"
            className="flex-1 gap-2 transition-colors duration-150 ease-[var(--ease-out)]"
            onClick={() => setMovingItemId(item._id)}
          >
            <FolderInput className="size-4" />
            Move
          </Button>

          <Button
            variant="outline"
            className="gap-2 text-destructive transition-colors duration-150 ease-[var(--ease-out)] hover:bg-destructive/10 hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 rounded-xl border border-border bg-card p-card-padding">
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Added</span>
            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className={cn(
              item.embedStatus === "ok" ? "text-green-500" :
              item.embedStatus === "pending" ? "text-yellow-500" :
              "text-muted-foreground"
            )}>
              {item.embedStatus === "ok" ? "Loaded" :
               item.embedStatus === "pending" ? "Loading..." :
               item.embedStatus === "unavailable" ? "Unavailable" :
               "Failed"}
            </span>
          </div>
        </div>
      </div>

      {/* Folder picker modal */}
      {movingItemId ? (
        <FolderPicker
          itemId={movingItemId}
          onClose={() => setMovingItemId(null)}
        />
      ) : null}
    </AppLayout>
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

function BackButton({
  onClick,
  "aria-label": ariaLabel = "Go back",
}: {
  onClick: () => void;
  "aria-label"?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11 transition-colors duration-150 ease-[var(--ease-out)]"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <ChevronLeft className="size-5" />
    </Button>
  );
}
