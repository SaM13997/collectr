import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Folder, Inbox, X } from "lucide-react";

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900 p-4">
          <p className="text-sm text-zinc-400">Loading folders...</p>
        </div>
      </div>
    );
  }

  const handleMove = async (folderId: Id<"folders"> | null) => {
    await moveTweet({ tweetId, folderId });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-xl border border-white/10 bg-zinc-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">Move to...</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          <button
            onClick={() => handleMove(null)}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
          >
            <Inbox className="size-4" />
            <span>Inbox</span>
          </button>

          {data.folders.map((folder) => (
            <button
              key={folder._id}
              onClick={() => handleMove(folder._id)}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              <Folder className="size-4" />
              <span className="truncate">{folder.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
