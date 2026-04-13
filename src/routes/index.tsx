import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { UserButton } from "@/components/User-button";
import { AddTweetForm } from "@/components/add-tweet-form";
import { FolderTree } from "@/components/folder-tree";
import { TweetCard } from "@/components/tweet-card";
import { FolderPicker } from "@/components/folder-picker";
import { Button } from "@/components/ui/button";
import { Inbox } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { data: sessionData, isPending } = authClient.useSession();
  const session = sessionData?.session ?? null;

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <InboxView />;
}

function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Collectr</h1>
        <p className="mt-3 text-muted-foreground">
          Save and organize tweet links from paste or the share sheet.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/login">Sign in to get started</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function InboxView() {
  const tweets = useQuery(api.tweets.listInbox);
  const [movingTweetId, setMovingTweetId] = useState<Id<"tweets"> | null>(null);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-white/[0.02] p-4 md:block">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Collectr</h2>
          <UserButton />
        </div>
        <div className="mt-4">
          <FolderTree />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          {/* Mobile header */}
          <div className="mb-4 flex items-center justify-between md:hidden">
            <h1 className="text-lg font-semibold">Collectr</h1>
            <UserButton />
          </div>

          {/* Mobile folder nav */}
          <div className="mb-4 md:hidden">
            <details className="rounded-lg border border-white/10 bg-white/[0.02] p-3 [&[open]]:pb-1">
              <summary className="cursor-pointer text-sm font-medium text-zinc-300">
                Folders
              </summary>
              <div className="mt-2">
                <FolderTree />
              </div>
            </details>
          </div>

          {/* Add tweet form */}
          <div className="mb-6">
            <AddTweetForm folderId={null} />
          </div>

          {/* Inbox header */}
          <div className="mb-4 flex items-center gap-2">
            <Inbox className="size-5 text-zinc-400" />
            <h2 className="text-lg font-semibold">Inbox</h2>
            {tweets ? (
              <span className="text-xs text-zinc-500">{tweets.length} tweets</span>
            ) : null}
          </div>

          {/* Tweet list */}
          {tweets === undefined ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/[0.02]"
                />
              ))}
            </div>
          ) : tweets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
              <p className="text-sm text-zinc-500">
                No tweets in your inbox yet. Paste a tweet URL above to save it.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <TweetCard
                  key={tweet._id}
                  tweet={tweet}
                  onMove={(id) => setMovingTweetId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Folder picker modal */}
      {movingTweetId ? (
        <FolderPicker
          tweetId={movingTweetId}
          onClose={() => setMovingTweetId(null)}
        />
      ) : null}
    </div>
  );
}
