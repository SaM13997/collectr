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
import { FolderOpen, Inbox, Sparkles } from "lucide-react";

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
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground">
            <FolderOpen className="size-6 text-background" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Save tweets now, organize them later
        </h1>

        <p className="mx-auto mt-6 max-w-md text-pretty text-lg leading-relaxed text-muted-foreground">
          Capture links from paste or share sheet, then sort them into folders whenever you have a moment.
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
              Paste any tweet URL and save it instantly.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-muted">
              <FolderOpen className="size-4 text-foreground" />
            </div>
            <p className="text-sm font-medium">Organize by folder</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create folders and subfolders to keep things tidy.
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

function InboxView() {
  const tweets = useQuery(api.tweets.listInbox);
  const [movingTweetId, setMovingTweetId] = useState<Id<"tweets"> | null>(null);

  return (
    <AppShell>
      {/* Header Section */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Inbox</h1>
            <p className="mt-1 text-muted-foreground">
              Save tweet links now, organize them later.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
            <span className="text-sm text-muted-foreground">Queue</span>
            <span className="text-lg font-semibold tabular-nums">
              {tweets?.length ?? "-"}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <AddTweetForm folderId={null} />
        </div>
      </section>

      {/* Tweets List */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <Inbox className="size-4" />
          <h2 className="font-medium">Saved tweets</h2>
          {tweets ? (
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {tweets.length}
            </span>
          ) : null}
        </div>

        {tweets === undefined ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : tweets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-12 text-center">
            <Inbox className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No tweets saved yet. Paste a URL above to get started.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
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
