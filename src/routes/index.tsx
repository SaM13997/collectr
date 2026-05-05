import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppShell } from "@/components/app-shell";
import { CollectionCard } from "@/components/collection-card";
import { SavedItemCard } from "@/components/saved-item-card";
import { FolderPicker } from "@/components/folder-picker";
import { Button } from "@/components/ui/button";
import { Bookmark, FolderOpen, Inbox, Link2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: HomePage,
});

type FilterTab = "all" | "collections" | "links";

function HomePage() {
  const { session, isPending } = useAuthSession();

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

  return <SavedView />;
}

function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground">
            <Bookmark className="size-6 text-background" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Save links now, organize them later
        </h1>

        <p className="mx-auto mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
          Capture tweets, posts, and links from anywhere. Sort them into
          collections whenever you have a moment.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="min-w-40">
            <Link to="/login">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-40">
            <Link to="/share-target">Try the share flow</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-6 text-left sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
              <Inbox className="size-4 text-foreground" />
            </div>
            <p className="text-sm font-medium">Quick capture</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste any link and save it instantly.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
              <FolderOpen className="size-4 text-foreground" />
            </div>
            <p className="text-sm font-medium">Organize by collection</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create collections to keep things tidy.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
              <Sparkles className="size-4 text-foreground" />
            </div>
            <p className="text-sm font-medium">Mobile-first</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Thumb-friendly navigation on any device.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function SavedView() {
  const [filter, setFilter] = useState<FilterTab>("all");
  const [movingTweetId, setMovingTweetId] = useState<Id<"tweets"> | null>(null);

  const inboxTweets = useQuery(api.tweets.listInbox);
  const folderData = useQuery(api.folders.listTree);

  const collections = folderData?.folders ?? [];
  const inboxCount = folderData?.inboxCount ?? 0;

  const showCollections = filter === "all" || filter === "collections";
  const showLinks = filter === "all" || filter === "links";

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "collections", label: "Collections" },
    { value: "links", label: "Links" },
  ];

  return (
    <AppShell>
      {/* Filter Chips */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            aria-pressed={filter === tab.value}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition",
              filter === tab.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collections Section */}
      {showCollections ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">
              Collections
            </h2>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("collections")}
                className="text-sm font-medium text-brand hover:underline"
              >
                See all
              </button>
            )}
          </div>

          {collections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-10 text-center">
              <FolderOpen className="mx-auto size-7 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No collections yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {collections.map((folder) => (
                <CollectionCard
                  key={folder._id}
                  id={folder._id}
                  name={folder.name}
                  itemCount={folder.tweetCount}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {/* Links Section */}
      {showLinks ? (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight">
              {filter === "links" ? "All links" : "Recent links"}
            </h2>
            {inboxCount > 0 ? (
              <span className="text-sm text-muted-foreground">
                {inboxCount} saved
              </span>
            ) : null}
          </div>

          {inboxTweets === undefined ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : inboxTweets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border py-10 text-center">
              <Link2 className="mx-auto size-7 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                No links saved yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {inboxTweets.map((tweet) => (
                <SavedItemCard
                  key={tweet._id}
                  item={tweet}
                  onMove={(id) => setMovingTweetId(id)}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}

      {movingTweetId ? (
        <FolderPicker
          tweetId={movingTweetId}
          onClose={() => setMovingTweetId(null)}
        />
      ) : null}
    </AppShell>
  );
}
