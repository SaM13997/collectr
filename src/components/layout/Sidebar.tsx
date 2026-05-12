import { Link } from "@tanstack/react-router";
import { Inbox, Library, Bookmark, FolderOpen } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function Sidebar() {
  const folderData = useQuery(api.folders.listTree);
  const collections = folderData?.folders ?? [];
  const inboxCount = folderData?.inboxCount ?? 0;

  return (
    <aside className="flex flex-col h-full overflow-y-auto p-4 gap-6 bg-background border-r border-line">
      <div className="flex items-center gap-3 px-2 mt-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky text-ink font-bold text-lg">
          C
        </div>
        <span className="font-bold text-lg tracking-tight text-ink dark:text-primary">Collectr</span>
      </div>

      <nav className="flex flex-col gap-1 mt-2">
        <Link
          to="/"
          className="flex items-center justify-between px-3 py-2.5 rounded-full hover:bg-white/50 dark:hover:bg-charcoal/50 text-sm font-semibold transition-colors text-muted-foreground hover:text-ink dark:hover:text-primary"
          activeProps={{ className: "bg-white dark:bg-charcoal text-ink dark:text-primary shadow-sm", "aria-current": "page" as const }}
        >
          <div className="flex items-center gap-3">
            <Inbox className="size-4" />
            <span>Inbox</span>
          </div>
          {inboxCount > 0 && (
            <span className="bg-coral text-[#2a1714] text-[10px] px-2 py-0.5 rounded-full font-bold">
              {inboxCount}
            </span>
          )}
        </Link>
        <Link
          to="/search"
          className="flex items-center px-3 py-2.5 rounded-full hover:bg-white/50 dark:hover:bg-charcoal/50 text-sm font-semibold transition-colors text-muted-foreground hover:text-ink dark:hover:text-primary"
          activeProps={{ className: "bg-white dark:bg-charcoal text-ink dark:text-primary shadow-sm", "aria-current": "page" as const }}
        >
          <div className="flex items-center gap-3">
            <Library className="size-4" />
            <span>All Items</span>
          </div>
        </Link>
      </nav>

      <div className="flex flex-col gap-2 mt-2">
        <h3 className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
          Folders
        </h3>
        <nav className="flex flex-col gap-1">
          {collections.map(folder => (
            <Link
              key={folder._id}
              to="/folders/$folderId"
              params={{ folderId: folder._id }}
              className="flex items-center justify-between px-3 py-2.5 rounded-full hover:bg-white/50 dark:hover:bg-charcoal/50 text-sm font-semibold transition-colors text-muted-foreground hover:text-ink dark:hover:text-primary"
              activeProps={{ className: "bg-white dark:bg-charcoal text-ink dark:text-primary shadow-sm", "aria-current": "page" as const }}
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="size-4" />
                <span className="truncate">{folder.name}</span>
              </div>
              {folder.itemCount > 0 && (
                <span className="text-muted-foreground text-xs bg-white/50 dark:bg-charcoal/50 px-1.5 rounded-full">{folder.itemCount}</span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
