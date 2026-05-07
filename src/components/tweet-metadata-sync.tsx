import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";

import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { fetchTweetMetadata } from "@/lib/tweet-parser";

export function useTweetMetadataSync(item: Doc<"tweets"> | null | undefined) {
  const setMetadata = useMutation(api.tweets.setMetadata);
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (!item) {
      attemptedRef.current = false;
      return;
    }

    if ((item.text && item.text.trim()) || attemptedRef.current) {
      return;
    }

    attemptedRef.current = true;

    const timer = setTimeout(async () => {
      const meta = await fetchTweetMetadata(item.url);
      await setMetadata({
        tweetId: item._id,
        status: meta ? "ok" : "unavailable",
        ...meta,
      }).catch(() => {});
    }, Math.random() * 1200);

    return () => clearTimeout(timer);
  }, [item, setMetadata]);
}
