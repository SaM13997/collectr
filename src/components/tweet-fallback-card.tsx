import { ExternalLink } from "lucide-react";

export function TweetFallbackCard({ url, tweetId }: { url: string; tweetId: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-500/10">
        <ExternalLink className="size-5 text-sky-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-zinc-300">
          Tweet {tweetId}
        </p>
        <p className="truncate text-xs text-zinc-500">{url}</p>
      </div>
    </a>
  );
}
