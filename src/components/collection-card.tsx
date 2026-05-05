import { Link } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import Grainient from "@/components/Grainient";

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
        "group flex shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card transition",
        "hover:border-foreground/15",
        className
      )}
    >
      <div className="relative w-[101%] overflow-hidden border-b">
        <Grainient
          color1="#ffd6fa"
          color2="#c5b6ff"
          color3="#d4a6ff"
          className=""
        />
        {/* {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 z-10 size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <FolderOpen className="size-8 text-foreground/60" />
          </div>
        )} */}
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <p className="min-w-0 truncate text-body font-body text-foreground">{name}</p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {itemCount}
        </p>
      </div>
    </Link>
  );
}
