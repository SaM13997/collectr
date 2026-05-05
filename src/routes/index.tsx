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
import { AnimatedList } from "@/components/unlumen-ui/animated-list";

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
    <main className="flex min-h-screen flex-col items-center justify-center px-page-x py-section">
      <div className="w-full max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground">
            <Bookmark className="size-6 text-background" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-balance text-title font-title tracking-tight sm:text-4xl">
          Save links now, organize them later
        </h1>

        <p className="mx-auto mt-6 max-w-md text-pretty text-body text-muted-foreground">
          Capture tweets, posts, and links from anywhere. Sort them into
          collections whenever you have a moment.
        </p>

        {/* CTA */}
        <div className="mt-section flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="min-w-40">
            <Link to="/login">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-40">
            <Link to="/share-target">Try the share flow</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-card-gap text-left sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-card-padding">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
              <Inbox className="size-4 text-foreground" />
            </div>
            <p className="text-heading font-heading">Quick capture</p>
            <p className="mt-1 text-body text-muted-foreground">
              Paste any link and save it instantly.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-card-padding">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
              <FolderOpen className="size-4 text-foreground" />
            </div>
            <p className="text-heading font-heading">Organize by collection</p>
            <p className="mt-1 text-body text-muted-foreground">
              Create collections to keep things tidy.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-card-padding">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
              <Sparkles className="size-4 text-foreground" />
            </div>
            <p className="text-heading font-heading">Mobile-first</p>
            <p className="mt-1 text-body text-muted-foreground">
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
      {/* Collections Section */}
      {showCollections ? (
        <section>
          <div className="no-scrollbar flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory [scroll-padding-inline:var(--spacing-page-x)]">
            {folderData === undefined
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[191.6px] w-[40%] min-w-[160px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="h-[60%] w-full animate-pulse bg-muted" />
                    <div className="flex items-center justify-between gap-2 p-3">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="h-2.5 w-4 shrink-0 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))
              : collections.map((folder) => (
                  <CollectionCard
                    key={folder._id}
                    id={folder._id}
                    name={folder.name}
                    itemCount={folder.tweetCount}
                    className="w-[40%] min-w-[160px] snap-start"
                  />
                ))}
          </div>
        </section>
      ) : null}

      {/* Filter Chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 mb-8 mt-4">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            aria-pressed={filter === tab.value}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2.5 text-body font-body transition",
              filter === tab.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Links Section */}
      {showLinks ? (
        <section className="mt-section">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-heading font-heading tracking-tight">
              {filter === "links" ? "All links" : "Recent links"}
            </h2>
            {inboxCount > 0 ? (
              <span className="text-body text-muted-foreground">
                {inboxCount} saved
              </span>
            ) : null}
          </div>

          {inboxTweets === undefined ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : inboxTweets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-card-padding text-center">
              <Link2 className="mx-auto size-7 text-muted-foreground/50" />
              <p className="mt-2 text-body text-muted-foreground">
                No links saved yet.
              </p>
            </div>
          ) : (
            <AnimatedList
              items={inboxTweets.map((t) => ({ ...t, id: t._id }))}
              renderItem={(tweet) => (
                <SavedItemCard
                  item={tweet}
                  variant="list"
                  onMove={(id) => setMovingTweetId(id)}
                />
              )}
              gap={8}
              animation="scale"
            />
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
