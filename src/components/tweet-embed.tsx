import { useEffect, useRef } from "react";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
        createTweet: (
          tweetId: string,
          el: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement | undefined>;
      };
    };
  }
}

let twitterScriptLoaded = false;
let twitterScriptPromise: Promise<void> | null = null;

function loadTwitterScript(): Promise<void> {
  if (twitterScriptLoaded) return Promise.resolve();
  if (twitterScriptPromise) return twitterScriptPromise;

  twitterScriptPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => {
      twitterScriptLoaded = true;
      resolve();
    };
    script.onerror = () => {
      twitterScriptLoaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });

  return twitterScriptPromise;
}

export function TweetEmbed({
  tweetId,
  onReady,
  onFail,
}: {
  tweetId: string;
  onReady?: () => void;
  onFail?: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function embed() {
      await loadTwitterScript();
      if (cancelled || !containerRef.current || !window.twttr?.widgets) {
        onFail?.();
        return;
      }

      containerRef.current.innerHTML = "";

      try {
        await window.twttr.widgets.createTweet(tweetId, containerRef.current, {
          theme: "dark",
          align: "center",
        });
        if (!cancelled) onReady?.();
      } catch {
        if (!cancelled) onFail?.();
      }
    }

    embed();

    return () => {
      cancelled = true;
    };
  }, [tweetId, onReady, onFail]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center [&>iframe]:mx-auto"
    />
  );
}
