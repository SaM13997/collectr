import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Folder, Inbox, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function FolderPicker({
  tweetId,
  onClose,
}: {
  tweetId: Id<"tweets">;
  onClose: () => void;
}) {
  const data = useQuery(api.folders.listTree);
  const moveTweet = useMutation(api.tweets.move);

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-border/70 bg-card/90 p-4 shadow-xl">
          <p className="text-sm text-muted-foreground">Loading folders...</p>
        </div>
      </div>
    );
  }

  const handleMove = async (folderId: Id<"folders"> | null) => {
    try {
      await moveTweet({ tweetId, folderId });
      onClose();
    } catch (err) {
      toast.error("Failed to move tweet", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-[1.5rem] border border-border/70 bg-card/92 p-4 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Move tweet to folder"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Move to...</h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          <button
            onClick={() => handleMove(null)}
            className="flex min-h-11 w-full items-center gap-2 rounded-[1rem] px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
          >
            <Inbox className="size-4 text-brand" />
            <span>Inbox</span>
          </button>

          {data.folders.map((folder) => (
            <button
              key={folder._id}
              onClick={() => handleMove(folder._id)}
              className={cn(
                "flex min-h-11 w-full items-center gap-2 rounded-[1rem] px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
              )}
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
