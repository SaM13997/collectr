import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";

const TWEET_URL_RE =
  /(https?:\/\/(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/[\w_]+\/status\/\d+)/i;

export function AddTweetForm({
  folderId,
  onAdded,
}: {
  folderId?: Id<"folders"> | null;
  onAdded?: () => void;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const addTweet = useMutation(api.tweets.addFromUrl);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a tweet URL.");
      return;
    }

    if (!TWEET_URL_RE.test(trimmed)) {
      setError("That doesn't look like a tweet URL.");
      return;
    }

    try {
      setIsSaving(true);
      await addTweet({ url: trimmed, folderId: folderId ?? null });
      setUrl("");
      onAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save tweet.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="https://x.com/user/status/..."
          className="h-10 pl-9"
          disabled={isSaving}
        />
      </div>
      <Button type="submit" disabled={isSaving} className="h-10">
        {isSaving ? "Saving..." : "Save tweet"}
      </Button>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </form>
  );
}
