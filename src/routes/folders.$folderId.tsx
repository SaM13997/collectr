import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { authClient } from "@/lib/auth-client";
import { UserButton } from "@/components/User-button";
import { AddTweetForm } from "@/components/add-tweet-form";
import { FolderTree } from "@/components/folder-tree";
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
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-white/[0.02] p-4 md:block">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-white hover:text-zinc-300">
            Collectr
          </Link>
          <UserButton />
        </div>
        <div className="mt-4">
          <FolderTree currentFolderId={typedFolderId} />
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
                <FolderTree currentFolderId={typedFolderId} />
              </div>
            </details>
          </div>

          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1 text-sm text-zinc-500">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-white">
              {currentFolder?.name ?? "Folder"}
            </span>
          </nav>

          {/* Folder header */}
          <div className="mb-4 flex items-center gap-2">
            <FolderOpen className="size-5 text-sky-400" />
            <h2 className="text-lg font-semibold">
              {currentFolder?.name ?? "Loading..."}
            </h2>
            {tweets ? (
              <span className="text-xs text-zinc-500">{tweets.length} tweets</span>
            ) : null}
          </div>

          {/* Add tweet form */}
          <div className="mb-6">
            <AddTweetForm folderId={typedFolderId} />
          </div>

          {/* Child folders */}
          {childFolders.length > 0 ? (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium text-zinc-400">Subfolders</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {childFolders.map((folder) => (
                  <Link
                    key={folder._id}
                    to="/folders/$folderId"
                    params={{ folderId: folder._id }}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-3 text-sm transition hover:bg-white/5"
                  >
                    <FolderOpen className="size-4 text-sky-400" />
                    <span className="truncate">{folder.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* New subfolder */}
          {showNewSubfolder ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateSubfolder();
              }}
              className="mb-4 flex items-center gap-2"
            >
              <Input
                value={subfolderName}
                onChange={(e) => setSubfolderName(e.target.value)}
                placeholder="Subfolder name"
                className="h-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowNewSubfolder(false);
                    setSubfolderName("");
                  }
                }}
              />
              <Button type="submit" size="sm" variant="ghost">
                Create
              </Button>
            </form>
          ) : (
            <button
              onClick={() => setShowNewSubfolder(true)}
              className="mb-4 flex w-full items-center gap-2 rounded-lg border border-dashed border-white/10 p-3 text-sm text-zinc-500 transition hover:border-white/20 hover:text-zinc-300"
            >
              <Plus className="size-4" />
              <span>Add subfolder</span>
            </button>
          )}

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
                No tweets in this folder yet. Paste a tweet URL above to save it
                here.
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
