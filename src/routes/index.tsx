import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { AddTweetForm } from "@/components/add-tweet-form";
import { AppShell } from "@/components/app-shell";
import { TweetCard } from "@/components/tweet-card";
import { FolderPicker } from "@/components/folder-picker";
import { Button } from "@/components/ui/button";
import { Inbox, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

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

  return <InboxView />;
}

function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 text-foreground">
      <div className="w-full max-w-4xl rounded-[2rem] border border-border/70 bg-card/70 p-6 shadow-[0_24px_80px_color-mix(in_oklch,var(--foreground)_10%,transparent)] backdrop-blur sm:p-10">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
              <Sparkles className="size-4 text-brand" />
              Save first, sort later
            </div>
            <h1 className="mt-5 max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              A warmer home for the tweet links you want to keep.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Capture from paste or the share sheet, then sweep links into folders
              from a thumb-friendly dock on mobile or a pinned library rail on
              desktop.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full px-6">
                <Link to="/login">Sign in to get started</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link to="/share-target">Try the share flow</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[1.6rem] border border-border/70 bg-surface-raised p-5">
              <p className="text-sm font-medium text-foreground">Thumb-accessible on mobile</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Folders, inbox, and settings stay anchored near the bottom edge.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-border/70 bg-surface-raised p-5">
              <p className="text-sm font-medium text-foreground">Light and dark built in</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Switch on demand or follow the device setting without losing the
                color treatment.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-border/70 bg-brand p-5 text-brand-foreground sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-medium">Folders that stay close</p>
              <p className="mt-2 text-sm leading-6 text-brand-foreground/80">
                Collectr now keeps your library one gesture away instead of hiding
                it behind a top-heavy menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InboxView() {
  const tweets = useQuery(api.tweets.listInbox);
  const [movingTweetId, setMovingTweetId] = useState<Id<"tweets"> | null>(null);

  return (
    <AppShell>
      <section className="app-panel overflow-hidden rounded-[1.85rem] p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-brand">Inbox</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Save now. Organize when you have a minute.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Paste any tweet link below and Collectr will keep it nearby until you
              move it into the right folder.
            </p>
          </div>

          <div className="rounded-[1.3rem] bg-accent/80 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Queue
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {tweets?.length ?? "..."}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-background/70 p-3 sm:p-4">
          <AddTweetForm folderId={null} />
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-border/70 bg-card/70 p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Inbox className="size-5 text-brand" />
          <h2 className="text-lg font-semibold">Inbox</h2>
          {tweets ? (
            <span className="text-xs text-muted-foreground">{tweets.length} tweets</span>
          ) : null}
        </div>

        {tweets === undefined ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-[1.35rem] border border-border/70 bg-surface-soft"
              />
            ))}
          </div>
        ) : tweets.length === 0 ? (
          <div className="rounded-[1.4rem] border border-dashed border-border/90 bg-background/50 p-8 text-center">
            <p className="text-sm text-muted-foreground">
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
      </section>

      {movingTweetId ? (
        <FolderPicker
          tweetId={movingTweetId}
          onClose={() => setMovingTweetId(null)}
        />
      ) : null}
    </AppShell>
  );
}
