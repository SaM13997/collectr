import { Link } from "@tanstack/react-router";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import Grainient from "@/components/Grainient";

/* Token values mirror --gradient-1/2/3 in styles.css */
const GRADIENT_1 = "#ffd6fa";
const GRADIENT_2 = "#c5b6ff";
const GRADIENT_3 = "#d4a6ff";

interface CollectionCardProps {
  id: Id<"folders">;
  name: string;
  itemCount: number;
  thumbnailUrl?: string | null;
  className?: string;
}

export function CollectionCard({
  id,
  name,
  itemCount,
  thumbnailUrl,
  className,
}: CollectionCardProps) {
  return (
    <Link
      to="/folders/$folderId"
      params={{ folderId: id }}
      className={cn(
        "group flex shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors duration-150 ease-[var(--ease-out)]",
        "active:scale-[0.99] [@media(hover:hover)]:hover:border-foreground/15",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 size-full object-cover"
            loading="lazy"
          />
        ) : (
          <Grainient
            color1={GRADIENT_1}
            color2={GRADIENT_2}
            color3={GRADIENT_3}
            className="absolute inset-0"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <p className="min-w-0 truncate text-body font-body text-foreground">{name}</p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {itemCount}
        </p>
      </div>
    </Link>
  );
}
