import { useEffect, useRef } from "react";
import { useMutation, useAction } from "convex/react";

import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { fetchItemMetadata } from "@/lib/item-metadata";
import { isMetadataFetchEnabled, flags } from "@/lib/feature-flags";

export function useTweetMetadataSync(item: Doc<"items"> | null | undefined) {
  const setMetadata = useMutation(api.items.setMetadata);
  const enrichItem = useAction(api.aiEnrichment.enrichItem);
  const attemptedRef = useRef(false);
  const enrichmentAttemptedRef = useRef(false);

  useEffect(() => {
    if (!item) {
      attemptedRef.current = false;
      enrichmentAttemptedRef.current = false;
      return;
    }

    if (item.embedStatus !== "pending") {
      // Metadata already loaded — trigger enrichment if enabled and not done
      if (
        flags.enableAiEnrichment &&
        !item.summary &&
        !enrichmentAttemptedRef.current &&
        (item.text || item.title)
      ) {
        enrichmentAttemptedRef.current = true;
        enrichItem({
          itemId: item._id,
          url: item.url,
          title: item.title,
          text: item.text,
          source: item.source,
        }).catch(() => {});
      }
      return;
    }

    if ((item.text && item.text.trim()) || (item.title && item.title.trim()) || attemptedRef.current) {
      return;
    }

    if (!isMetadataFetchEnabled(item.source)) {
      return;
    }

    attemptedRef.current = true;

    const timer = setTimeout(async () => {
      const meta = await fetchItemMetadata(item.url, item.source);
      await setMetadata({
        itemId: item._id,
        status: meta ? "ok" : "unavailable",
        ...meta,
      }).catch(() => {});
    }, Math.random() * 1200);

    return () => clearTimeout(timer);
  }, [item, setMetadata, enrichItem]);
}