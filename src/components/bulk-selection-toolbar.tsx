import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useUiStore } from "@/store/useUiStore";
import { Button } from "@/components/ui/button";
import { FolderInput, Trash2, X, CheckSquare, Inbox, Folder } from "lucide-react";
import { toast } from "sonner";

interface BulkSelectionToolbarProps {
  totalCount: number;
  allIds: string[];
}

export function BulkSelectionToolbar({ totalCount, allIds }: BulkSelectionToolbarProps) {
  const { selectionMode, selectedIds, exitSelectionMode, selectAll, clearSelection } = useUiStore();
  const bulkDelete = useMutation(api.items.bulkDelete).withOptimisticUpdate(
    (store, args) => {
      const deleteSet = new Set(args.itemIds);
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listInbox)) {
        if (value) {
          store.setQuery(api.items.listInbox, queryArgs, value.filter((t) => !deleteSet.has(t._id)));
        }
      }
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listAll)) {
        if (value) {
          store.setQuery(api.items.listAll, queryArgs, value.filter((t) => !deleteSet.has(t._id)));
        }
      }
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listByFolder)) {
        if (value) {
          store.setQuery(api.items.listByFolder, queryArgs, value.filter((t) => !deleteSet.has(t._id)));
        }
      }
    }
  );
  const bulkMove = useMutation(api.items.bulkMove).withOptimisticUpdate(
    (store, args) => {
      const moveSet = new Set(args.itemIds);
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listInbox)) {
        if (value) {
          store.setQuery(api.items.listInbox, queryArgs, value.filter((t) => !moveSet.has(t._id)));
        }
      }
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listByFolder)) {
        if (value) {
          store.setQuery(api.items.listByFolder, queryArgs, value.filter((t) => !moveSet.has(t._id)));
        }
      }
    }
  );
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectionMode) return null;

  const count = selectedIds.size;
  const allSelected = count === totalCount && totalCount > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAll(allIds);
    }
  };

  const handleDelete = async () => {
    if (count === 0) return;
    setIsDeleting(true);
    try {
      const result = await bulkDelete({ itemIds: [...selectedIds] as Id<"items">[] });
      toast.success(`Deleted ${result.deleted} item${result.deleted !== 1 ? "s" : ""}`);
      clearSelection();
    } catch (err) {
      toast.error("Failed to delete", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMove = async (folderId: Id<"folders"> | null) => {
    if (count === 0) return;
    try {
      const result = await bulkMove({
        itemIds: [...selectedIds] as Id<"items">[],
        folderId,
      });
      toast.success(`Moved ${result.moved} item${result.moved !== 1 ? "s" : ""}`);
      clearSelection();
      setShowFolderPicker(false);
    } catch (err) {
      toast.error("Failed to move", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <>
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={exitSelectionMode}
            aria-label="Exit selection"
          >
            <X className="size-4" />
          </Button>
          <span className="text-sm font-medium text-foreground">
            {count} selected
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSelectAll}
            className="gap-1.5 text-xs"
          >
            <CheckSquare className="size-3.5" />
            {allSelected ? "Deselect all" : "Select all"}
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowFolderPicker(true)}
            disabled={count === 0}
            aria-label="Move selected"
          >
            <FolderInput className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleDelete}
            disabled={count === 0 || isDeleting}
            aria-label="Delete selected"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {showFolderPicker && (
        <BulkFolderPicker
          onSelect={handleMove}
          onClose={() => setShowFolderPicker(false)}
        />
      )}
    </>
  );
}

function BulkFolderPicker({
  onSelect,
  onClose,
}: {
  onSelect: (folderId: Id<"folders"> | null) => void;
  onClose: () => void;
}) {
  const data = useQuery(api.folders.listTree);

  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[1.5rem] border border-border/70 bg-card/92 p-4 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Move selected items to collection"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Move to collection</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          <button
            onClick={() => onSelect(null)}
            className="flex min-h-11 w-full items-center gap-2 rounded-[1rem] px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
          >
            <Inbox className="size-4 text-brand" />
            <span>Saved</span>
          </button>

          {data.folders.map((folder) => (
            <button
              key={folder._id}
              onClick={() => onSelect(folder._id)}
              className="flex min-h-11 w-full items-center gap-2 rounded-[1rem] px-3 py-2 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-foreground"
            >
              <Folder className="size-4 text-brand" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
