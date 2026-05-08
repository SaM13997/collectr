import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { Button } from "@/components/ui/button";
import { Folder, Inbox, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchItemMetadata } from "@/lib/item-metadata";
import { isMetadataFetchEnabled } from "@/lib/feature-flags";
import { parseSharedContent, type ParsedUrl } from "@/lib/url-parser";

type ShareSearch = {
  text?: string;
  title?: string;
  url?: string;
};

export const Route = createFileRoute("/share-target")({
  validateSearch: (search): ShareSearch => {
    const normalize = (v: unknown) =>
      typeof v === "string" && v.trim().length > 0 ? v : undefined;
    return {
      title: normalize(search.title),
      text: normalize(search.text),
      url: normalize(search.url),
    };
  },
  component: ShareTargetPage,
});

function ShareTargetPage() {
  const search = Route.useSearch();
  const parsed = parseSharedContent(search);
  const { session, isPending } = useAuthSession();
  const redirectParams = new URLSearchParams();

  if (search.title) redirectParams.set("title", search.title);
  if (search.text) redirectParams.set("text", search.text);
  if (search.url) redirectParams.set("url", search.url);

  const redirectTarget = redirectParams.size
    ? `/share-target?${redirectParams.toString()}`
    : "/share-target";

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-foreground">
        <div className="mx-auto max-w-md rounded-xl bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">Shared link detected</h1>
          {parsed ? (
            <p className="mt-2 text-sm text-muted-foreground">
              <code className="break-all">{parsed.displayUrl}</code>
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No valid URL was found in the shared content.
            </p>
          )}
          <Button asChild className="mt-6">
            <Link to="/login" search={{ redirect: redirectTarget }}>
              Sign in to save
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  if (!parsed) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-foreground">
        <div className="mx-auto max-w-md rounded-xl bg-card p-6 text-center">
          <h1 className="text-2xl font-semibold">No valid URL found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The shared content doesn&apos;t contain a valid URL.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Go to Saved</Link>
          </Button>
        </div>
      </main>
    );
  }

  return <SaveSharedItem parsed={parsed} shareText={search.text || search.title} />;
}

function SaveSharedItem({ parsed, shareText }: { parsed: ParsedUrl; shareText?: string }) {
  const router = useRouter();
  const data = useQuery(api.folders.listTree);
  const addTweet = useMutation(api.tweets.addFromUrl);
  const setMetadata = useMutation(api.tweets.setMetadata);
  const [selectedFolder, setSelectedFolder] = useState<Id<"folders"> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const id = await addTweet({ url: parsed.rawUrl, folderId: selectedFolder, shareText });
      setSaved(true);

      if (isMetadataFetchEnabled(parsed.source) && parsed.sourceItemId) {
        (async () => {
          try {
            const meta = await fetchItemMetadata(parsed.canonicalUrl, parsed.source);
            await setMetadata({
              tweetId: id,
              status: meta ? "ok" : "unavailable",
              ...meta,
            });
          } catch {
          }
        })();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-foreground">
        <div className="mx-auto max-w-md rounded-xl bg-card p-6 text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-highlight/15">
            <Check className="size-6 text-highlight" />
          </div>
          <h1 className="text-2xl font-semibold">Saved!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <code className="break-all">{parsed.displayUrl}</code>
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Button
              onClick={() => {
                if (selectedFolder) {
                  router.navigate({
                    to: "/folders/$folderId",
                    params: { folderId: selectedFolder },
                  });
                } else {
                  router.navigate({ to: "/" });
                }
              }}
            >
              {selectedFolder ? "Go to collection" : "Go to Saved"}
            </Button>
            <Button variant="outline" onClick={() => router.navigate({ to: "/" })}>
              Back to home
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-md rounded-xl bg-card p-6">
        <h1 className="text-2xl font-semibold">Save item</h1>

        {/* URL */}
        <div className="mt-4 rounded-lg bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/12">
              <ExternalLink className="size-5 text-brand" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">Link detected</p>
              <p className="mt-1 truncate text-xs text-muted-foreground">{parsed.displayUrl}</p>
            </div>
          </div>
        </div>

        {/* Folder selection */}
        <div className="mt-6">
          <h2 className="text-sm font-medium text-muted-foreground">Choose destination</h2>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-lg bg-muted/30 p-2">
            <button
              onClick={() => setSelectedFolder(null)}
              className={cn(
                "flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                selectedFolder === null
                  ? "bg-brand text-brand-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Inbox className="size-4" />
              <span>Inbox</span>
            </button>

            {data?.folders.map((folder) => (
              <button
                key={folder._id}
                onClick={() => setSelectedFolder(folder._id)}
                className={cn(
                  "flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                  selectedFolder === folder._id
                    ? "bg-brand text-brand-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Folder className="size-4" />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        {error ? (
          <p className="mt-3 text-sm text-destructive">{error}</p>
        ) : null}
        <Button
          className="mt-4 w-full rounded-full"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save item"}
        </Button>
      </div>
    </main>
  );
}
