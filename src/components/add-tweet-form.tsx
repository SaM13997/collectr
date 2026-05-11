import { useState, type FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2 } from "lucide-react";
import { fetchItemMetadata } from "@/lib/item-metadata";
import { isMetadataFetchEnabled } from "@/lib/feature-flags";
import { parseUrl, extractUrlFromText } from "@/lib/url-parser";

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
  const addItem = useMutation(api.items.addFromUrl);
  const setMetadata = useMutation(api.items.setMetadata);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a link URL.");
      return;
    }

    let parsed = parseUrl(trimmed);
    if (!parsed) {
      const extracted = extractUrlFromText(trimmed);
      if (extracted) parsed = parseUrl(extracted);
    }
    if (!parsed) {
      setError("That doesn't look like a valid link.");
      return;
    }

    try {
      setIsSaving(true);
      const docId = await addItem({ url: parsed.rawUrl, folderId: folderId ?? null });

      if (isMetadataFetchEnabled(parsed.source) && parsed.sourceItemId) {
        const meta = await fetchItemMetadata(parsed.canonicalUrl, parsed.source);
        await setMetadata({
          itemId: docId,
          status: meta ? "ok" : "unavailable",
          ...meta,
        });
      }

      setUrl("");
      onAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="Paste a link URL..."
            aria-label="Paste a link URL"
            className="h-10 pl-9"
            disabled={isSaving}
          />
        </div>
        <Button type="submit" disabled={isSaving} className="h-10">
          {isSaving ? "Saving..." : "Save link"}
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
    </form>
  );
}
