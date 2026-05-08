import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";

import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { fetchItemMetadata } from "@/lib/item-metadata";
import { isMetadataFetchEnabled } from "@/lib/feature-flags";

export function useTweetMetadataSync(item: Doc<"tweets"> | null | undefined) {
  const setMetadata = useMutation(api.tweets.setMetadata);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!item) {
      attemptedRef.current = false;
      return;
    }

    if (item.embedStatus !== "pending") {
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
        tweetId: item._id,
        status: meta ? "ok" : "unavailable",
        ...meta,
      }).catch(() => {});
    }, Math.random() * 1200);

    return () => clearTimeout(timer);
  }, [item, setMetadata]);
}