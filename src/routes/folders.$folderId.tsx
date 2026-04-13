import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { AddTweetForm } from "@/components/add-tweet-form";
import { AppShell } from "@/components/app-shell";
import { TweetCard } from "@/components/tweet-card";
import { FolderPicker } from "@/components/folder-picker";
import { Button } from "@/components/ui/button";
import { FolderOpen, ChevronRight, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/folders/$folderId")({
  component: FolderPage,
});

function FolderPage() {
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
        <div className="text-center">
          <p className="text-muted-foreground">Please sign in to view folders.</p>
          <Button asChild className="mt-4">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </main>
    );
  }

  return <FolderView />;
}

function FolderView() {
  const { folderId } = Route.useParams();
  const typedFolderId = folderId as Id<"folders">;
  const tweets = useQuery(api.tweets.listByFolder, { folderId: typedFolderId });
  const folderData = useQuery(api.folders.listTree);
  const createSubfolder = useMutation(api.folders.create);
  const [movingTweetId, setMovingTweetId] = useState<Id<"tweets"> | null>(null);
  const [showNewSubfolder, setShowNewSubfolder] = useState(false);
  const [subfolderName, setSubfolderName] = useState("");

  const currentFolder = folderData?.folders.find((f) => f._id === typedFolderId);
  const childFolders =
    folderData?.folders.filter((f) => f.parentId === typedFolderId) ?? [];

  const handleCreateSubfolder = async () => {
    if (!subfolderName.trim()) return;
    await createSubfolder({ name: subfolderName.trim(), parentId: typedFolderId });
    setSubfolderName("");
    setShowNewSubfolder(false);
  };

  return (
    <AppShell currentFolderId={typedFolderId}>
      <section className="app-panel overflow-hidden rounded-[1.85rem] p-4 sm:p-5">
        <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="transition hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-foreground">{currentFolder?.name ?? "Folder"}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FolderOpen className="size-5 text-brand" />
              <p className="text-sm font-medium text-brand">Folder</p>
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {currentFolder?.name ?? "Loading..."}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Add fresh tweet links here, then branch into subfolders when this
              collection grows legs.
            </p>
          </div>

          <div className="rounded-[1.3rem] bg-accent/80 px-4 py-3 text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Saved here
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {tweets?.length ?? "..."}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-[1.5rem] border border-border/70 bg-background/70 p-3 sm:p-4">
          <AddTweetForm folderId={typedFolderId} />
        </div>
      </section>

      {childFolders.length > 0 ? (
        <section className="rounded-[1.7rem] border border-border/70 bg-card/70 p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-medium text-muted-foreground">Subfolders</h2>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {childFolders.map((folder) => (
              <Link
                key={folder._id}
                to="/folders/$folderId"
                params={{ folderId: folder._id }}
                className="flex min-h-14 items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/65 p-3 text-sm transition hover:border-brand/25 hover:bg-accent"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[0.95rem] bg-brand/12 text-brand">
                  <FolderOpen className="size-4" />
                </span>
                <span className="truncate font-medium">{folder.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[1.7rem] border border-border/70 bg-card/70 p-4 shadow-sm sm:p-5">
        {showNewSubfolder ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateSubfolder();
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <Input
              value={subfolderName}
              onChange={(e) => setSubfolderName(e.target.value)}
              placeholder="Subfolder name"
              className="h-11 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowNewSubfolder(false);
                  setSubfolderName("");
                }
              }}
            />
            <Button type="submit" className="rounded-full px-5">
              Create
            </Button>
          </form>
        ) : (
          <button
            onClick={() => setShowNewSubfolder(true)}
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.25rem] border border-dashed border-border bg-background/40 p-3 text-sm text-muted-foreground transition hover:border-brand/25 hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-4" />
            <span>Add subfolder</span>
          </button>
        )}
      </section>

      <section className="rounded-[1.7rem] border border-border/70 bg-card/70 p-4 shadow-sm sm:p-5">
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
              No tweets in this folder yet. Paste a tweet URL above to save it here.
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
