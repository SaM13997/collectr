import { useState, useCallback, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppLayout } from "@/components/layout/AppLayout";
import { SavedItemCard } from "@/components/saved-item-card";
import { CollectionCard } from "@/components/collection-card";
import { FolderPicker } from "@/components/folder-picker";
import { BulkSelectionToolbar } from "@/components/bulk-selection-toolbar";
import { Button } from "@/components/ui/button";
import { Plus, Link2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/useUiStore";

export const Route = createFileRoute("/folders/$folderId")({
  component: FolderPage,
});

function FolderPage() {
  const { session, isPending } = useAuthSession();

  if (isPending) {
    return <PageSkeleton />;
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
  const { selectionMode, selectedIds, enterSelectionMode, toggleSelection } = useUiStore();
  const typedFolderId = folderId as Id<"folders">;
  const items = useQuery(api.items.listByFolder, { folderId: typedFolderId });
  const folderData = useQuery(api.folders.listTree);
  const createSubfolder = useMutation(api.folders.create).withOptimisticUpdate(
    (store, args) => {
      for (const { args: queryArgs, value } of store.getAllQueries(api.folders.listTree)) {
        if (value) {
          const tempId = `temp_${Date.now()}` as Id<"folders">;
          const newFolder = {
            _id: tempId,
            _creationTime: Date.now(),
            userId: "",
            name: args.name.trim(),
            parentId: args.parentId,
            createdAt: Date.now(),
            itemCount: 0,
          };
          store.setQuery(api.folders.listTree, queryArgs, {
            ...value,
            folders: [...value.folders, newFolder],
          });
        }
      }
    }
  );
  const reorderItems = useMutation(api.items.reorder).withOptimisticUpdate(
    (store, args) => {
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listByFolder)) {
        if (value) {
          const idToItem = new Map(value.map((t) => [t._id, t]));
          const reordered = args.orderedIds
            .map((id) => idToItem.get(id))
            .filter(Boolean) as typeof value;
          if (reordered.length === args.orderedIds.length) {
            store.setQuery(api.items.listByFolder, queryArgs, reordered);
          }
        }
      }
    }
  );

  const [movingItemId, setMovingItemId] = useState<Id<"items"> | null>(null);
  const [showNewSubfolder, setShowNewSubfolder] = useState(false);
  const [subfolderName, setSubfolderName] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

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

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
    dragCounter.current = 0;
  }, []);

  const handleDragEnter = useCallback((index: number) => {
    dragCounter.current++;
    setOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(async (dropIdx: number) => {
    if (dragIndex === null || dragIndex === dropIdx || !items) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }

    const ids = items.map((t) => t._id);
    const [moved] = ids.splice(dragIndex, 1);
    ids.splice(dropIdx, 0, moved);

    setDragIndex(null);
    setOverIndex(null);

    try {
      await reorderItems({ orderedIds: ids });
    } catch {
      toast.error("Failed to reorder");
    }
  }, [dragIndex, items, reorderItems]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
    dragCounter.current = 0;
  }, []);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
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
                    itemCount={folder.itemCount}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Add Subcollection */}
        {!showNewSubfolder ? (
          <button
            onClick={() => setShowNewSubfolder(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted-foreground transition-colors duration-150 ease-[var(--ease-out)] hover:border-foreground/20 hover:bg-accent hover:text-foreground active:scale-[0.99]"
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
          {selectionMode ? (
            <BulkSelectionToolbar
              totalCount={items?.length ?? 0}
              allIds={items?.map((t) => t._id) ?? []}
            />
          ) : (
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-heading font-heading tracking-tight">Links</h2>
              <div className="flex items-center gap-2">
                {items && items.length > 0 ? (
                  <button
                    onClick={enterSelectionMode}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    Select
                  </button>
                ) : null}
                {items ? (
                  <span className="text-body text-muted-foreground">
                    {items.length} saved
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {items === undefined ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-card-padding text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
                <Link2 className="size-6 text-muted-foreground/40" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No links in this collection yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Add links to organize them here
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <div
                  key={item._id}
                  draggable={!selectionMode}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(index));
                    handleDragStart(index);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDragEnter={() => handleDragEnter(index)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(index);
                  }}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "transition-opacity duration-150",
                    dragIndex === index && "opacity-40",
                    overIndex === index && dragIndex !== index && "border-t-2 border-primary"
                  )}
                >
                  <SavedItemCard
                    item={item}
                    variant="list"
                    showDragHandle={!selectionMode}
                    selected={selectedIds.has(item._id)}
                    onToggleSelection={
                      selectionMode
                        ? () => toggleSelection(item._id)
                        : undefined
                    }
                    onLongPress={
                      !selectionMode
                        ? () => {
                            enterSelectionMode();
                            toggleSelection(item._id);
                          }
                        : undefined
                    }
                    onOpen={
                      selectionMode
                        ? () => toggleSelection(item._id)
                        : () => navigate({ to: "/entries/$entryId", params: { entryId: item._id } })
                    }
                    onMove={
                      selectionMode
                        ? undefined
                        : (id) => setMovingItemId(id)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {movingItemId ? (
          <FolderPicker
            itemId={movingItemId}
            onClose={() => setMovingItemId(null)}
          />
        ) : null}
      </div>
    </AppLayout>
  );
}
