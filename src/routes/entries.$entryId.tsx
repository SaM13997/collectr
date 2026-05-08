import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppShell, BackButton } from "@/components/app-shell";
import { FolderPicker } from "@/components/folder-picker";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  FolderInput,
  Trash2,
  Copy,
  Check,
  Hash,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTweetMetadataSync } from "@/components/tweet-metadata-sync";

export const Route = createFileRoute("/entries/$entryId")({
  component: EntryPage,
});

function EntryPage() {
  const { session, isPending } = useAuthSession();

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
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
  const typedEntryId = entryId as Id<"tweets">;
  const router = useRouter();
  const tweet = useQuery(api.tweets.getById, { tweetId: typedEntryId });
  const removeTweet = useMutation(api.tweets.remove);
  useTweetMetadataSync(tweet);

  const [movingTweetId, setMovingTweetId] = useState<Id<"tweets"> | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = async () => {
    if (!tweet) return;
    try {
      await navigator.clipboard.writeText(tweet.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleDelete = async () => {
    if (!tweet) return;
    try {
      await removeTweet({ tweetId: tweet._id });
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error("Failed to remove", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  if (tweet === undefined) {
    return (
      <AppShell backButton={<BackButton onClick={() => router.history.back()} />}>
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
      </AppShell>
    );
  }

  if (tweet === null) {
    return (
      <AppShell title="Not found" backButton={<BackButton onClick={() => router.history.back()} />}>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold">Entry not found</p>
          <p className="mt-2 text-sm text-muted-foreground">
            This entry may have been deleted or you don't have access.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/">Go back</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const handle = extractHandle(tweet.url);
  const displayName = tweet.source === "instagram"
    ? (tweet.authorName || "Instagram")
    : (tweet.authorName || handle || "Unknown");
  const displayHandle = tweet.authorHandle || handle;

  const sourceLabels: Record<string, string> = {
    x: "Open original",
    reddit: "Open on Reddit",
    instagram: "Open on Instagram",
    link: "Open link",
  };
  const openLabel = sourceLabels[tweet.source] || "Open link";

  const fallbackText = tweet.source === "reddit"
    ? "No post content."
    : tweet.source === "instagram"
      ? "Instagram post"
      : "Content unavailable.";

  return (
    <AppShell
      title={displayHandle ? `@${displayHandle}` : tweet.source === "instagram" ? "Instagram" : "Entry"}
      backButton={<BackButton onClick={() => router.history.back()} />}
    >
      {/* Author header */}
        <div className="flex items-center gap-3">
        {tweet.authorAvatar ? (
          <img
            src={tweet.authorAvatar}
            alt={displayName}
            className="size-12 shrink-0 rounded-full object-cover transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]"
          />
        ) : (
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted transition-transform duration-150 ease-[var(--ease-out)] active:scale-[0.97]">
            {tweet.source === "instagram" && !tweet.authorName ? (
              <Camera className="size-6 text-muted-foreground" />
            ) : (
              <span className="text-lg font-semibold text-muted-foreground">
                {displayName[0]?.toUpperCase()}
              </span>
            )}
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

      {tweet.title?.trim() && (
        <h2 className="mt-4 text-lg font-semibold text-foreground">{tweet.title}</h2>
      )}

      {tweet.text?.trim() ? (
        <div className={cn("rounded-xl border border-border bg-card p-card-padding", tweet.title?.trim() ? "mt-2" : "mt-4")}>
          <p className="whitespace-pre-wrap text-body text-foreground leading-relaxed">
            {tweet.text}
          </p>
        </div>
      ) : !tweet.title?.trim() ? (
        <div className="mt-4 rounded-xl border border-dashed border-border bg-card p-card-padding">
          <p className="text-body text-muted-foreground">
            {fallbackText}
          </p>
        </div>
      ) : null}

      {/* Media preview */}
      {tweet.mediaUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <img
            src={tweet.mediaUrl}
            alt=""
            className="w-full object-cover transition-transform duration-300 ease-[var(--ease-out)] hover:scale-[1.01]"
            loading="lazy"
          />
        </div>
      ) : null}

      {/* Tags */}
      {tweet.tags && tweet.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tweet.tags.map((tag) => (
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
          href={tweet.url}
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
            onClick={() => setMovingTweetId(tweet._id)}
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
            <span>{new Date(tweet.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className={cn(
              tweet.embedStatus === "ok" ? "text-green-500" :
              tweet.embedStatus === "pending" ? "text-yellow-500" :
              "text-muted-foreground"
            )}>
              {tweet.embedStatus === "ok" ? "Loaded" :
               tweet.embedStatus === "pending" ? "Loading..." :
               tweet.embedStatus === "unavailable" ? "Unavailable" :
               "Failed"}
            </span>
          </div>
        </div>
      </div>

      {/* Folder picker modal */}
      {movingTweetId ? (
        <FolderPicker
          tweetId={movingTweetId}
          onClose={() => setMovingTweetId(null)}
        />
      ) : null}
    </AppShell>
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
