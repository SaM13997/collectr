import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { fetchItemMetadata } from "@/lib/item-metadata";
import { isMetadataFetchEnabled } from "@/lib/feature-flags";
import { AppLayout } from "@/components/layout/AppLayout";
import { CollectionCard } from "@/components/collection-card";
import { SavedItemCard } from "@/components/saved-item-card";
import { FolderPicker } from "@/components/folder-picker";
import { Button } from "@/components/ui/button";
import { Bookmark, FolderOpen, Inbox, Link2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/unlumen-ui/animated-list";
import { useUiStore } from "@/store/useUiStore";

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
    <main className="flex min-h-screen flex-col px-6 py-12 sm:px-12 md:px-20 lg:px-32 justify-center">
      <div className="w-full max-w-7xl mx-auto relative">
        {/* Brand / Logo */}
        <div className="mb-16 sm:mb-24 flex items-center gap-3">
          <div className="flex size-12 sm:size-16 items-center justify-center bg-primary rounded-none shadow-[4px_4px_0px_0px_var(--color-foreground)] sm:shadow-[8px_8px_0px_0px_var(--color-foreground)]">
            <Bookmark className="size-6 sm:size-8 text-primary-foreground fill-current" />
          </div>
          <span className="font-heading font-black text-2xl tracking-tight uppercase">Collectr.</span>
        </div>

        {/* Hero Typography - BOLD and ASYMMETRIC */}
        <div className="max-w-4xl">
          <h1 className="text-balance text-6xl sm:text-8xl md:text-9xl font-title font-black tracking-tighter leading-[0.85] uppercase text-foreground">
            Save <br />
            <span className="text-primary italic pr-2">Links.</span><br />
            Organize <br />
            <span className="text-muted-foreground">Later.</span>
          </h1>

          <p className="mt-8 sm:mt-12 max-w-xl text-xl sm:text-2xl text-pretty font-body text-foreground font-medium border-l-4 border-primary pl-6 py-2">
            Capture posts, videos, and links from anywhere. We give you the space to sort them into collections whenever you have a moment.
          </p>
        </div>

        {/* CTA - Brutalist buttons */}
        <div className="mt-12 sm:mt-20 flex flex-col items-start gap-4 sm:flex-row">
          <Button asChild size="lg" className="h-16 sm:h-20 px-8 sm:px-12 text-lg sm:text-xl font-bold uppercase tracking-wider rounded-none bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 ease-[var(--ease-out)] shadow-[4px_4px_0px_0px_var(--color-primary)] hover:shadow-[8px_8px_0px_0px_var(--color-foreground)] hover:-translate-y-1">
            <Link to="/login">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-16 sm:h-20 px-8 sm:px-12 text-lg sm:text-xl font-bold uppercase tracking-wider rounded-none border-2 border-foreground bg-transparent text-foreground hover:bg-muted transition-all duration-300 ease-[var(--ease-out)] shadow-[4px_4px_0px_0px_var(--color-muted-foreground)] hover:shadow-[8px_8px_0px_0px_var(--color-foreground)] hover:-translate-y-1">
            <Link to="/share-target">Try the flow</Link>
          </Button>
        </div>

        {/* Features - High Contrast Cards */}
        <div className="mt-32 grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3">
          <div className="flex flex-col gap-6 p-8 border-4 border-foreground bg-card shadow-[8px_8px_0px_0px_var(--color-foreground)] hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_var(--color-primary)] transition-all duration-300">
            <div className="flex size-14 items-center justify-center bg-foreground rounded-full">
              <Inbox className="size-6 text-background" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold uppercase tracking-tight mb-2">Quick capture</p>
              <p className="text-lg text-muted-foreground font-body font-medium">
                Paste any link. We save it instantly. No questions asked.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-8 border-4 border-foreground bg-card shadow-[8px_8px_0px_0px_var(--color-foreground)] hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_var(--color-primary)] transition-all duration-300">
            <div className="flex size-14 items-center justify-center bg-foreground rounded-full">
              <FolderOpen className="size-6 text-background" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold uppercase tracking-tight mb-2">Collections</p>
              <p className="text-lg text-muted-foreground font-body font-medium">
                Create dedicated folders to keep your chaos totally organized.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-8 border-4 border-foreground bg-primary shadow-[8px_8px_0px_0px_var(--color-foreground)] hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_var(--color-foreground)] transition-all duration-300 text-primary-foreground">
            <div className="flex size-14 items-center justify-center bg-background rounded-full">
              <Sparkles className="size-6 text-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold uppercase tracking-tight mb-2 text-background">Mobile-first</p>
              <p className="text-lg font-body font-medium text-background/90">
                Thumb-friendly navigation built perfectly for any device you own.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SavedView() {
  const { openInspector } = useUiStore();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [movingTweetId, setMovingTweetId] = useState<Id<"tweets"> | null>(null);

  const inboxTweets = useQuery(api.tweets.listInbox);
  const folderData = useQuery(api.folders.listTree);
  const setMetadata = useMutation(api.tweets.setMetadata);
  const attemptedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!inboxTweets) return;

    const tweetsWithoutContent = inboxTweets.filter((t) => !(t.text?.trim() || t.title?.trim()));
    const fetchable = tweetsWithoutContent.filter((t) => isMetadataFetchEnabled(t.source));
    const timers: ReturnType<typeof setTimeout>[] = [];

    fetchable.forEach((tweet, index) => {
      if (attemptedRef.current.has(tweet._id)) return;
      attemptedRef.current.add(tweet._id);

      const timer = setTimeout(async () => {
        const meta = await fetchItemMetadata(tweet.url, tweet.source);
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
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
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
                Paste a link to get started
              </p>
            </div>
          ) : (
            <AnimatedList
              items={inboxTweets.map((t) => ({ ...t, id: t._id }))}
              renderItem={(tweet) => (
                <SavedItemCard
                  item={tweet}
                  variant="list"
                  onOpen={() => openInspector(tweet._id)}
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
        </div>
    </AppLayout>
  );
}
