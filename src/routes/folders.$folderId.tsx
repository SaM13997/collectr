import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { AddTweetForm } from "@/components/add-tweet-form";
import { AppShell } from "@/components/app-shell";
import { TweetCard } from "@/components/tweet-card";
import { FolderPicker } from "@/components/folder-picker";
import { Button } from "@/components/ui/button";
import { FolderOpen, ChevronRight, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/folders/$folderId")({
  component: FolderPage,
});

function FolderPage() {
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
    try {
      await createSubfolder({ name: subfolderName.trim(), parentId: typedFolderId });
      setSubfolderName("");
      setShowNewSubfolder(false);
    } catch (err) {
      toast.error("Failed to create folder", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <AppShell currentFolderId={typedFolderId}>
      {/* Header Section */}
      <section className="rounded-xl border border-border bg-card p-6">
        <nav className="mb-4 flex items-center gap-2 text-sm">
          <Link to="/" className="text-muted-foreground transition hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-3 text-muted-foreground" />
          <span className="font-medium">{currentFolder?.name ?? "Folder"}</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {currentFolder?.name ?? "Loading..."}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Save tweets to this folder.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2">
            <span className="text-sm text-muted-foreground">Saved</span>
            <span className="text-lg font-semibold tabular-nums">
              {tweets?.length ?? "-"}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <AddTweetForm folderId={typedFolderId} />
        </div>
      </section>

      {/* Subfolders */}
      {childFolders.length > 0 ? (
        <section className="rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">Subfolders</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {childFolders.map((folder) => (
              <Link
                key={folder._id}
                to="/folders/$folderId"
                params={{ folderId: folder._id }}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-3 transition hover:border-foreground/20"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <FolderOpen className="size-4" />
                </div>
                <span className="truncate text-sm font-medium">{folder.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Add Subfolder */}
      <section className="rounded-xl border border-border bg-card p-6">
        {showNewSubfolder ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateSubfolder();
            }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              value={subfolderName}
              onChange={(e) => setSubfolderName(e.target.value)}
              placeholder="Subfolder name"
              className="h-10"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowNewSubfolder(false);
                  setSubfolderName("");
                }
              }}
            />
            <Button type="submit" className="h-10">
              Create
            </Button>
          </form>
        ) : (
          <button
            onClick={() => setShowNewSubfolder(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 text-sm text-muted-foreground transition hover:border-foreground/20 hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-4" />
            <span>Add subfolder</span>
          </button>
        )}
      </section>

      {/* Tweets List */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <FolderOpen className="size-4" />
          <h2 className="font-medium">Tweets</h2>
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
            <FolderOpen className="mx-auto size-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No tweets in this folder yet.
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
