import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppShell, BackButton } from "@/components/app-shell";
import { SavedItemCard } from "@/components/saved-item-card";
import { CollectionCard } from "@/components/collection-card";
import { FolderPicker } from "@/components/folder-picker";
import { Button } from "@/components/ui/button";
import { Plus, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AnimatedList } from "@/components/unlumen-ui/animated-list";

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
          <p className="text-muted-foreground">Please sign in to view collections.</p>
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
  const navigate = useNavigate();
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
      await createSubfolder({
        name: subfolderName.trim(),
        parentId: typedFolderId,
      });
      setSubfolderName("");
      setShowNewSubfolder(false);
    } catch (err) {
      toast.error("Failed to create collection", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <AppShell
      title={currentFolder?.name ?? "Collection"}
      backButton={<BackButton onClick={() => window.history.back()} />}
    >
      {/* Subcollections */}
      {childFolders.length > 0 || showNewSubfolder ? (
        <section>
          <h2 className="mb-3 text-heading font-heading tracking-tight">
            Subcollections
          </h2>
          <div className="grid grid-cols-1 gap-card-gap sm:grid-cols-2">
            {childFolders.map((folder) => (
              <CollectionCard
                key={folder._id}
                id={folder._id}
                name={folder.name}
                itemCount={folder.tweetCount}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Add Subcollection */}
      {!showNewSubfolder ? (
        <button
          onClick={() => setShowNewSubfolder(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition hover:border-foreground/20 hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-4" />
          <span>New subcollection</span>
        </button>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateSubfolder();
          }}
          className="flex gap-2"
        >
          <Input
            value={subfolderName}
            onChange={(e) => setSubfolderName(e.target.value)}
            placeholder="Collection name"
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
      )}

      {/* Links */}
      <section className="mt-section">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-heading font-heading tracking-tight">Links</h2>
          {tweets ? (
            <span className="text-body text-muted-foreground">
              {tweets.length} saved
            </span>
          ) : null}
        </div>

        {tweets === undefined ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : tweets.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-card-padding text-center">
            <Link2 className="mx-auto size-7 text-muted-foreground/50" />
            <p className="mt-2 text-body text-muted-foreground">
              No links in this collection yet.
            </p>
          </div>
        ) : (
          <AnimatedList
            items={tweets.map((t) => ({ ...t, id: t._id }))}
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

      {movingTweetId ? (
        <FolderPicker
          tweetId={movingTweetId}
          onClose={() => setMovingTweetId(null)}
        />
      ) : null}
    </AppShell>
  );
}
