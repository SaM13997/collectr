import { Link } from "@tanstack/react-router";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

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
        "group flex shrink-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-line bg-panel transition-colors duration-150 ease-[var(--ease-out)] dark:border-dark-border dark:bg-charcoal",
        "active:scale-[0.99] [@media(hover:hover)]:hover:bg-surface-raised dark:[@media(hover:hover)]:hover:bg-charcoal-2",
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
          <div
            className="absolute inset-0 bg-violet/20 dark:bg-violet/10"
          />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <p className="min-w-0 truncate text-body font-body text-ink dark:text-dark-text">{name}</p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {itemCount}
        </p>
      </div>
    </Link>
  );
}
