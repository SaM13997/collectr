import { useState, useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppShell } from "@/components/app-shell";
import { SavedItemCard } from "@/components/saved-item-card";
import { FolderPicker } from "@/components/folder-picker";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Link2 } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
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
      <main className="flex min-h-screen items-center justify-center px-4 text-foreground">
        <div className="text-center">
          <p className="text-muted-foreground">Sign in to search your saved items.</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return <SearchView />;
}

function SearchView() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [movingTweetId, setMovingTweetId] = useState<Id<"tweets"> | null>(null);
  const inboxTweets = useQuery(api.tweets.listInbox);
  const folderData = useQuery(api.folders.listTree);

  const allTweets = useMemo(() => {
    if (!inboxTweets) return [];
    return inboxTweets;
  }, [inboxTweets]);

  const folderMap = useMemo(() => {
    if (!folderData?.folders) return new Map();
    const map = new Map<string, string>();
    for (const f of folderData.folders) {
      map.set(f._id, f.name);
    }
    return map;
  }, [folderData?.folders]);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return allTweets.filter((t) => {
      const handle = t.url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\//)?.[1];
      return (
        t.url.toLowerCase().includes(q) ||
        handle?.toLowerCase().includes(q) ||
        (t.folderId && folderMap.get(t.folderId)?.toLowerCase().includes(q))
      );
    });
  }, [query, allTweets, folderMap]);

  const showResults = query.trim().length > 0;

  return (
    <AppShell title="Search">
      <div className="relative mb-6">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved links..."
          aria-label="Search saved links"
          className="h-12 rounded-xl bg-surface-raised pl-11 text-sm"
          autoFocus
        />
      </div>

      {!showResults ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <SearchIcon className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            Search your saved items
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Find tweets, links, and posts you've saved.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <Link2 className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            No results found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((tweet, i) => (
            <div key={tweet._id} className="stagger-item" style={{ "--i": i } as React.CSSProperties}>
              <SavedItemCard
                item={tweet}
                onOpen={() => navigate({ to: "/entries/$entryId", params: { entryId: tweet._id } })}
                onMove={(id) => setMovingTweetId(id)}
              />
            </div>
          ))}
        </div>
      )}

      {movingTweetId ? (
        <FolderPicker
          tweetId={movingTweetId}
          onClose={() => setMovingTweetId(null)}
        />
      ) : null}
    </AppShell>
  );
}
