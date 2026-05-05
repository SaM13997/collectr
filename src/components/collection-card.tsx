import { Link } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";
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
        "group flex items-center gap-3 rounded-xl bg-card p-3 transition",
        "border border-border hover:border-foreground/15 hover:bg-accent",
        className
      )}
    >
      <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <FolderOpen className="size-6 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {itemCount === 1 ? "1 item" : `${itemCount} items`}
        </p>
      </div>
    </Link>
  );
}
