import { Link } from "@tanstack/react-router";
import { Inbox, Library, Bookmark, FolderOpen } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function Sidebar() {
  const folderData = useQuery(api.folders.listTree);
  const collections = folderData?.folders ?? [];
  const inboxCount = folderData?.inboxCount ?? 0;

  return (
    <aside className="flex flex-col h-full overflow-y-auto p-4 gap-6 bg-muted/20">
      <div className="flex items-center gap-2 px-2">
        <Bookmark className="size-5 fill-primary text-primary" />
        <span className="font-bold text-lg">Collectr</span>
      </div>

      <nav className="flex flex-col gap-1">
        <Link
          to="/"
          className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-sm font-medium transition-colors"
          activeProps={{ className: "bg-accent/50", "aria-current": "page" as const }}
        >
          <div className="flex items-center gap-3">
            <Inbox className="size-4 text-muted-foreground" />
            <span>Inbox</span>
          </div>
          {inboxCount > 0 && (
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-bold">
              {inboxCount}
            </span>
          )}
        </Link>
        <Link
          to="/search"
          className="flex items-center px-3 py-2 rounded-md hover:bg-accent text-sm font-medium transition-colors"
          activeProps={{ className: "bg-accent/50", "aria-current": "page" as const }}
        >
          <div className="flex items-center gap-3">
            <Library className="size-4 text-muted-foreground" />
            <span>All Items</span>
          </div>
        </Link>
      </nav>

      <div className="flex flex-col gap-2">
        <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Folders
        </h3>
        <nav className="flex flex-col gap-1">
          {collections.map(folder => (
            <Link
              key={folder._id}
              to="/folders/$folderId"
              params={{ folderId: folder._id }}
              className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-sm font-medium transition-colors"
              activeProps={{ className: "bg-accent/50", "aria-current": "page" as const }}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="size-4 text-muted-foreground" />
                <span className="truncate">{folder.name}</span>
              </div>
              {folder.tweetCount > 0 && (
                <span className="text-muted-foreground text-xs">{folder.tweetCount}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
