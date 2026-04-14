import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { TweetEmbed } from "./tweet-embed";
import { TweetFallbackCard } from "./tweet-fallback-card";
import { Button } from "@/components/ui/button";
import { Trash2, FolderInput } from "lucide-react";
import { toast } from "sonner";

export function TweetCard({
  tweet,
  onMove,
}: {
  tweet: Doc<"tweets">;
  onMove: (tweetId: Id<"tweets">) => void;
}) {
  const [embedFailed, setEmbedFailed] = useState(false);
  const removeTweet = useMutation(api.tweets.remove);

  return (
    <div className="group relative rounded-lg border border-border bg-background p-4 transition hover:border-foreground/20">
      {/* Actions */}
      <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition group-hover:opacity-100">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={() => onMove(tweet._id)}
          title="Move to folder"
        >
          <FolderInput className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={async () => {
            try {
              await removeTweet({ tweetId: tweet._id });
            } catch (err) {
              toast.error("Failed to remove tweet", {
                description:
                  err instanceof Error ? err.message : "Something went wrong.",
              });
            }
          }}
          title="Remove"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {!embedFailed ? (
        <TweetEmbed
          tweetId={tweet.tweetId}
          onFail={() => setEmbedFailed(true)}
        />
      ) : (
        <TweetFallbackCard url={tweet.url} tweetId={tweet.tweetId} />
      )}
    </div>
  );
}
