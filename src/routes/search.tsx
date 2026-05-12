import { useState, useMemo, useRef, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppLayout } from "@/components/layout/AppLayout";
import { SavedItemCard } from "@/components/saved-item-card";
import { FolderPicker } from "@/components/folder-picker";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { PageSkeleton } from "@/components/skeletons";
import { useVirtualizer } from "@tanstack/react-virtual";

type SourceFilter = "all" | "x" | "reddit" | "instagram" | "link";

const SOURCE_FILTERS: { value: SourceFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "x", label: "X" },
  { value: "reddit", label: "Reddit" },
  { value: "instagram", label: "Instagram" },
  { value: "link", label: "Links" },
];

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const { session, isPending } = useAuthSession();

  if (isPending) {
    return <PageSkeleton />;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-foreground">
        <div className="text-center">
          <p className="text-muted-foreground">Sign in to search your saved items.</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return <SearchView />;
}

function matchItem(item: Doc<"items">, q: string, folderMap: Map<string, string>): boolean {
  const handle = item.url.match(/(?:twitter\.com|x\.com)\/([^/]+)\/status\//)?.[1];
  const folderName = item.folderId ? folderMap.get(item.folderId) : undefined;
  return (
    item.url.toLowerCase().includes(q) ||
    (item.canonicalUrl?.toLowerCase().includes(q) ?? false) ||
    (item.title?.toLowerCase().includes(q) ?? false) ||
    (item.text?.toLowerCase().includes(q) ?? false) ||
    (item.description?.toLowerCase().includes(q) ?? false) ||
    (item.authorHandle?.toLowerCase().includes(q) ?? false) ||
    (item.authorName?.toLowerCase().includes(q) ?? false) ||
    (handle?.toLowerCase().includes(q) ?? false) ||
    (folderName?.toLowerCase().includes(q) ?? false) ||
    (item.tags?.some((tag) => tag.toLowerCase().includes(q)) ?? false) ||
    (item.note?.toLowerCase().includes(q) ?? false)
  );
}

function useColumnsPerRow() {
  const [cols, setCols] = useState(2);

  useEffect(() => {
    const update = () => setCols(window.innerWidth >= 640 ? 3 : 2);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return cols;
}

function SearchView() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [movingItemId, setMovingItemId] = useState<Id<"items"> | null>(null);
  const allItems = useQuery(api.items.listAll);
  const folderData = useQuery(api.folders.listTree);
  const columnsPerRow = useColumnsPerRow();
  const parentRef = useRef<HTMLDivElement>(null);

  const folderMap = useMemo(() => {
    if (!folderData?.folders) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const f of folderData.folders) {
      map.set(f._id, f.name);
    }
    return map;
  }, [folderData?.folders]);

  const filtered = useMemo(() => {
    if (!allItems) return [];
    let items = allItems;
    if (source !== "all") {
      items = items.filter((t) => t.source === source);
    }
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      items = items.filter((t) => matchItem(t, q, folderMap));
    }
    return items;
  }, [query, allItems, source, folderMap]);

  const rowCount = Math.ceil(filtered.length / columnsPerRow);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 220,
    overscan: 4,
    gap: 12,
  });

  const isLoading = allItems === undefined;
  const hasNoResults = !isLoading && filtered.length === 0;
  const isFiltering = source !== "all" || query.trim().length > 0;

  return (
    <AppLayout title="Search">
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search saved links..."
          aria-label="Search saved links"
          className="h-12 rounded-xl bg-surface-raised pl-11 text-sm"
        />
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 mb-6">
        {SOURCE_FILTERS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSource(tab.value)}
            aria-pressed={source === tab.value}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2.5 min-h-11 text-body font-body transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
              source === tab.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : hasNoResults && isFiltering ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <Link2 className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            No results found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term or filter.
          </p>
        </div>
      ) : hasNoResults ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <SearchIcon className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            Search your saved items
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Find links and posts you've saved.
          </p>
        </div>
      ) : (
        <div
          ref={parentRef}
          className="overflow-auto"
          style={{ contain: "strict" }}
        >
          <div
            className="relative w-full"
            style={{ height: `${virtualizer.getTotalSize()}px` }}
          >
            <div
              className="absolute left-0 top-0 w-full grid grid-cols-2 sm:grid-cols-3 gap-3"
              style={{
                transform: `translateY(${virtualizer.getVirtualItems()[0]?.start ?? 0}px)`,
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const rowIndex = virtualRow.index;
                const rowItems = filtered.slice(
                  rowIndex * columnsPerRow,
                  rowIndex * columnsPerRow + columnsPerRow
                );
                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={(node) => virtualizer.measureElement(node)}
                    className="contents"
                  >
                    {rowItems.map((item) => (
                      <div key={item._id}>
                        <SavedItemCard
                          item={item}
                          onOpen={() =>
                            navigate({
                              to: "/entries/$entryId",
                              params: { entryId: item._id },
                            })
                          }
                          onMove={(id) => setMovingItemId(id)}
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {movingItemId ? (
        <FolderPicker
          itemId={movingItemId}
          onClose={() => setMovingItemId(null)}
        />
      ) : null}
    </div>
    </AppLayout>
  );
}
