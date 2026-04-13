import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { TweetEmbed } from "./tweet-embed";
import { TweetFallbackCard } from "./tweet-fallback-card";
import { Button } from "@/components/ui/button";
import { Trash2, FolderInput } from "lucide-react";

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
    <div className="group relative overflow-hidden rounded-[1.5rem] border border-border/70 bg-card/78 p-4 shadow-sm">
      <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full border border-border/70 bg-background/80"
          onClick={() => onMove(tweet._id)}
          title="Move to folder"
        >
          <FolderInput className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full border border-border/70 bg-background/80 text-destructive hover:text-destructive"
          onClick={() => removeTweet({ tweetId: tweet._id })}
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
