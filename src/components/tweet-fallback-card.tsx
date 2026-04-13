import { ExternalLink } from "lucide-react";

export function TweetFallbackCard({ url, tweetId }: { url: string; tweetId: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-[1.2rem] border border-border/70 bg-background/70 p-4 transition hover:border-brand/25 hover:bg-accent"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/12">
        <ExternalLink className="size-5 text-brand" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">
          Tweet {tweetId}
        </p>
        <p className="truncate text-xs text-muted-foreground">{url}</p>
      </div>
    </a>
  );
}
