import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { fetchTweetMetadata } from "@/lib/tweet-parser";
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
          <Button asChild size="lg" className="min-w-40 transition-colors duration-150 ease-[var(--ease-out)]">
            <Link to="/login">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-40 transition-colors duration-150 ease-[var(--ease-out)]">
            <Link to="/share-target">Try the share flow</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-10 text-left sm:grid-cols-3">
          <div className="flex flex-col gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <Inbox className="size-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-heading font-heading">Quick capture</p>
            <p className="text-body text-muted-foreground">
              Paste any link and save it instantly.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <FolderOpen className="size-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-heading font-heading">Organize by collection</p>
            <p className="text-body text-muted-foreground">
              Create collections to keep things tidy.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
              <Sparkles className="size-5 text-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-heading font-heading">Mobile-first</p>
            <p className="text-body text-muted-foreground">
              Thumb-friendly navigation on any device.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function SavedView() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [movingTweetId, setMovingTweetId] = useState<Id<"tweets"> | null>(null);

  const inboxTweets = useQuery(api.tweets.listInbox);
  const folderData = useQuery(api.folders.listTree);
  const setMetadata = useMutation(api.tweets.setMetadata);
  const attemptedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!inboxTweets) return;

    const tweetsWithoutText = inboxTweets.filter((t) => !t.text?.trim());
    const timers: ReturnType<typeof setTimeout>[] = [];

    tweetsWithoutText.forEach((tweet, index) => {
      if (attemptedRef.current.has(tweet._id)) return;
      attemptedRef.current.add(tweet._id);

      const timer = setTimeout(async () => {
        const meta = await fetchTweetMetadata(tweet.url);
        await setMetadata({
          tweetId: tweet._id,
          status: meta ? "ok" : "unavailable",
          ...meta,
        }).catch(() => {});
      }, index * 400 + Math.random() * 200);

      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [inboxTweets, setMetadata]);

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
              "shrink-0 rounded-full border px-4 py-2.5 text-body font-body transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
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
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
                <Link2 className="size-6 text-muted-foreground/40" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No links saved yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Paste a tweet URL to get started
              </p>
            </div>
          ) : (
            <AnimatedList
              items={inboxTweets.map((t) => ({ ...t, id: t._id }))}
              renderItem={(tweet) => (
                <SavedItemCard
                  item={tweet}
                  variant="list"
                  onOpen={() => navigate({ to: "/entries/$entryId", params: { entryId: tweet._id } })}
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
