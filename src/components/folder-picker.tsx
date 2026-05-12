import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Folder, Inbox, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRef } from "react";
import { useDialogFocus } from "@/lib/use-dialog-focus";
import { FolderPickerSkeleton } from "@/components/skeletons";
import { Surface } from "./system/primitives/surface";

export function FolderPicker({
  itemId,
  onClose,
}: {
  itemId: Id<"items">;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  useDialogFocus(true, containerRef);

  const data = useQuery(api.folders.listTree);
  const moveItem = useMutation(api.items.move).withOptimisticUpdate(
    (store, args) => {
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listInbox)) {
        if (value) {
          store.setQuery(api.items.listInbox, queryArgs, value.filter((t) => t._id !== args.itemId));
        }
      }
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listByFolder)) {
        if (value) {
          store.setQuery(api.items.listByFolder, queryArgs, value.filter((t) => t._id !== args.itemId));
        }
      }
    }
  );

  if (!data) {
    return <FolderPickerSkeleton />;
  }

  const handleMove = async (folderId: Id<"folders"> | null) => {
    try {
      await moveItem({ itemId, folderId });
      onClose();
    } catch (err) {
      toast.error("Failed to move", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <Surface
        variant="overlay"
        radius="lg"
        padding="md"
        ref={containerRef as any}
        className="w-full max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-label="Move link to collection"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-ink dark:text-primary">Move to collection</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-ink/50 dark:text-primary/50 transition-colors duration-150 ease-[var(--ease-out)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-ink dark:hover:text-primary active:scale-[0.95]"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          <button
            onClick={() => handleMove(null)}
            className="flex min-h-[44px] w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-ink/70 dark:text-primary/70 transition-colors duration-150 ease-[var(--ease-out)] hover:bg-butter hover:text-[#312719] active:scale-[0.99]"
          >
            <Inbox className="size-[18px] opacity-70" />
            <span>Saved</span>
          </button>

          {data.folders.map((folder) => (
            <button
              key={folder._id}
              onClick={() => handleMove(folder._id)}
              className={cn(
                "flex min-h-[44px] w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-[15px] font-medium text-ink/70 dark:text-primary/70 transition-colors duration-150 ease-[var(--ease-out)] hover:bg-butter hover:text-[#312719] active:scale-[0.99]"
              )}
            >
              <Folder className="size-[18px] opacity-70" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      </Surface>
    </div>
  );
}
