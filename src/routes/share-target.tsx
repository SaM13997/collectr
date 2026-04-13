import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Folder, Inbox, Check, ExternalLink } from "lucide-react";

type ShareSearch = {
  text?: string;
  title?: string;
  url?: string;
};

const tweetUrlPattern =
  /(https?:\/\/(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/[\w_]+\/status\/\d+)/i;

const normalizeSearchValue = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0 ? value : undefined;

const extractTweetUrl = ({ text, title, url }: ShareSearch) => {
  const directUrl = normalizeSearchValue(url);
  if (directUrl && tweetUrlPattern.test(directUrl)) {
    return directUrl.match(tweetUrlPattern)?.[1] ?? directUrl;
  }

  const combined = [normalizeSearchValue(text), normalizeSearchValue(title)]
    .filter(Boolean)
    .join(" ");

  return combined.match(tweetUrlPattern)?.[1];
};

export const Route = createFileRoute("/share-target")({
  validateSearch: (search): ShareSearch => ({
    title: normalizeSearchValue(search.title),
    text: normalizeSearchValue(search.text),
    url: normalizeSearchValue(search.url),
  }),
  component: ShareTargetPage,
});

function ShareTargetPage() {
  const search = Route.useSearch();
  const tweetUrl = extractTweetUrl(search);
  const { data: sessionData, isPending } = authClient.useSession();
  const session = sessionData?.session ?? null;
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
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-semibold">Shared tweet detected</h1>
          {tweetUrl ? (
            <p className="mt-2 text-sm text-muted-foreground">
              <code className="break-all">{tweetUrl}</code>
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No valid tweet URL was found in the shared content.
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

  if (!tweetUrl) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-2xl font-semibold">No tweet URL found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The shared content doesn't contain a valid tweet URL.
          </p>
          <Button asChild className="mt-6">
            <Link to="/">Go to inbox</Link>
          </Button>
        </div>
      </main>
    );
  }

  return <SaveSharedTweet tweetUrl={tweetUrl} />;
}

function SaveSharedTweet({ tweetUrl }: { tweetUrl: string }) {
  const router = useRouter();
  const data = useQuery(api.folders.listTree);
  const addTweet = useMutation(api.tweets.addFromUrl);
  const [selectedFolder, setSelectedFolder] = useState<Id<"folders"> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      await addTweet({ url: tweetUrl, folderId: selectedFolder });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tweet.");
    } finally {
      setIsSaving(false);
    }
  };

  if (saved) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
            <Check className="size-6 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold">Tweet saved!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <code className="break-all">{tweetUrl}</code>
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
              {selectedFolder ? "Go to folder" : "Go to inbox"}
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
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-semibold">Save tweet</h1>

        {/* Tweet URL */}
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10">
              <ExternalLink className="size-5 text-sky-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">Tweet link detected</p>
              <p className="mt-1 truncate text-xs text-zinc-500">{tweetUrl}</p>
            </div>
          </div>
        </div>

        {/* Folder selection */}
        <div className="mt-6">
          <h2 className="text-sm font-medium text-zinc-300">
            Choose destination
          </h2>
          <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-white/10 bg-white/[0.02] p-2">
            <button
              onClick={() => setSelectedFolder(null)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                selectedFolder === null
                  ? "bg-white/10 text-white"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Inbox className="size-4" />
              <span>Inbox</span>
            </button>

            {data?.folders.map((folder) => (
              <button
                key={folder._id}
                onClick={() => setSelectedFolder(folder._id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  selectedFolder === folder._id
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Folder className="size-4" />
                <span className="truncate">{folder.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        {error ? (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        ) : null}
        <Button
          className="mt-4 w-full"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save tweet"}
        </Button>
      </div>
    </main>
  );
}
