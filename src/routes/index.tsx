import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { useAuthSession } from "@/lib/use-auth-session";
import { fetchItemMetadata } from "@/lib/item-metadata";
import { isMetadataFetchEnabled } from "@/lib/feature-flags";
import { AppLayout } from "@/components/layout/AppLayout";
import { CollectionCard } from "@/components/collection-card";
import { SavedItemCard } from "@/components/saved-item-card";
import { FolderPicker } from "@/components/folder-picker";
import { BulkSelectionToolbar } from "@/components/bulk-selection-toolbar";
import { Button } from "@/components/ui/button";
import { Bookmark, FolderOpen, Globe, Layers, Link2, Search, Share2, Shield, Smartphone, WifiOff, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { VirtualizedList } from "@/components/virtualized-list";
import { useUiStore } from "@/store/useUiStore";
import { PageSkeleton } from "@/components/skeletons";

// Keep previous query results across route remounts to prevent skeleton flashing on navigation
type FolderData = { folders: (Doc<"folders"> & { itemCount: number })[]; inboxCount: number };
let cachedInboxItems: Doc<"items">[] | undefined = undefined;
let cachedFolderData: FolderData | undefined = undefined;

export const Route = createFileRoute("/")({
  component: HomePage,
});

type FilterTab = "all" | "collections" | "links";

function HomePage() {
  const { session, isPending } = useAuthSession();

  if (isPending) {
    return <PageSkeleton />;
  }

  if (!session) {
    return <LandingPage />;
  }

  return <SavedView />;
}

function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center bg-primary rounded-none shadow-[3px_3px_0px_0px_var(--color-foreground)]">
              <Bookmark className="size-4.5 text-primary-foreground fill-current" />
            </div>
            <span className="font-heading font-black text-lg tracking-tight uppercase">Collectr.</span>
          </div>
          <Button asChild size="sm" className="rounded-none font-bold uppercase tracking-wider bg-foreground text-background hover:bg-primary hover:text-primary-foreground shadow-[3px_3px_0px_0px_var(--color-primary)] hover:shadow-[5px_5px_0px_0px_var(--color-foreground)] transition-all duration-200 hover:-translate-y-0.5">
            <Link to="/login">Sign in</Link>
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="px-6 pt-20 pb-24 sm:pt-28 sm:pb-32 md:px-20 lg:px-32">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <h1 className="text-balance text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-title font-black tracking-tighter leading-[0.85] uppercase text-foreground">
              Save <span className="text-primary italic">Links.</span>
              <br />
              Organize <span className="text-muted-foreground">Later.</span>
            </h1>

            <p className="mt-8 sm:mt-10 max-w-xl text-lg sm:text-xl text-pretty font-body text-foreground font-medium border-l-4 border-primary pl-5 py-1">
              Capture posts from X, Reddit, Instagram, and any website. Sort them into collections whenever you have a moment.
            </p>

            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row">
              <Button asChild size="lg" className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold uppercase tracking-wider rounded-none bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 ease-[var(--ease-out)] shadow-[4px_4px_0px_0px_var(--color-primary)] hover:shadow-[8px_8px_0px_0px_var(--color-foreground)] hover:-translate-y-1">
                <Link to="/login">Get Started Free</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold uppercase tracking-wider rounded-none border-2 border-foreground bg-transparent text-foreground hover:bg-muted transition-all duration-300 ease-[var(--ease-out)] shadow-[4px_4px_0px_0px_var(--color-muted-foreground)] hover:shadow-[8px_8px_0px_0px_var(--color-foreground)] hover:-translate-y-1">
                <a href="#how-it-works">See How It Works</a>
              </Button>
            </div>
          </div>

          {/* App mockup */}
          <div className="mt-16 sm:mt-20">
            <div className="rounded-none border-2 border-foreground bg-card shadow-[8px_8px_0px_0px_var(--color-foreground)] overflow-hidden">
              {/* Mock titlebar */}
              <div className="flex items-center gap-2 border-b-2 border-foreground bg-foreground px-4 py-3">
                <span className="size-3 rounded-full bg-primary" />
                <span className="size-3 rounded-full bg-muted-foreground/50" />
                <span className="size-3 rounded-full bg-muted-foreground/50" />
                <span className="ml-4 text-xs font-mono font-medium text-background/70 uppercase tracking-wider">Collectr</span>
              </div>
              {/* Mock content — card grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-6">
                {[
                  { title: "Design Inspiration", count: 24, color: "bg-primary/10" },
                  { title: "Read Later", count: 18, color: "bg-blue-500/10" },
                  { title: "Recipes", count: 9, color: "bg-green-500/10" },
                  { title: "Dev Resources", count: 31, color: "bg-purple-500/10" },
                  { title: "Travel Ideas", count: 7, color: "bg-amber-500/10" },
                  { title: "Music", count: 14, color: "bg-pink-500/10" },
                ].map((card) => (
                  <div key={card.title} className={`${card.color} border border-border rounded-none p-4 space-y-2`}>
                    <div className="h-2 w-16 bg-foreground/20 rounded-none" />
                    <div className="h-1.5 w-10 bg-muted-foreground/30 rounded-none" />
                    <p className="text-xs font-mono text-muted-foreground pt-1">{card.count} items</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20 sm:py-24 md:px-20 lg:px-32 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3 font-heading">Features</p>
          <h2 className="text-4xl sm:text-5xl font-title font-black tracking-tight uppercase text-foreground mb-12">
            Everything you need
          </h2>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Globe,
                title: "Save from Anywhere",
                desc: "X, Reddit, Instagram, YouTube, or any website. One tap and it's saved.",
              },
              {
                icon: FolderOpen,
                title: "Organize Your Way",
                desc: "Folders, tags, and notes. Build a system that makes sense to you.",
              },
              {
                icon: Search,
                title: "Find Anything",
                desc: "Full-text search and filters. Your saved links are always a keystroke away.",
              },
              {
                icon: Smartphone,
                title: "Works Everywhere",
                desc: "Install as a PWA. Share from any app on any device.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-5 p-6 border-2 border-foreground bg-card shadow-[6px_6px_0px_0px_var(--color-foreground)] hover:-translate-y-1.5 hover:shadow-[10px_10px_0px_0px_var(--color-primary)] transition-all duration-300"
              >
                <div className="flex size-12 items-center justify-center bg-foreground rounded-none">
                  <f.icon className="size-5 text-background" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-lg font-heading font-bold uppercase tracking-tight mb-1.5">{f.title}</p>
                  <p className="text-sm text-muted-foreground font-body font-medium leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="px-6 py-20 sm:py-24 md:px-20 lg:px-32">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3 font-heading">How It Works</p>
          <h2 className="text-4xl sm:text-5xl font-title font-black tracking-tight uppercase text-foreground mb-16">
            Three steps. That's it.
          </h2>

          <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
            {[
              {
                step: "01",
                icon: Share2,
                title: "Share",
                desc: "See something you like? Share it to Collectr from any app, or paste a link directly.",
              },
              {
                step: "02",
                icon: Layers,
                title: "Organize",
                desc: "Drag links into collections, add tags and notes. Do it now or later — no pressure.",
              },
              {
                step: "03",
                icon: Search,
                title: "Find",
                desc: "Search across everything you've saved. Filter by source, tag, or collection.",
              },
            ].map((s) => (
              <div key={s.step} className="relative">
                <span className="absolute -top-3 -left-1 text-7xl sm:text-8xl font-title font-black text-muted-foreground/10 select-none pointer-events-none">
                  {s.step}
                </span>
                <div className="relative pt-8">
                  <div className="flex size-14 items-center justify-center bg-primary rounded-none shadow-[4px_4px_0px_0px_var(--color-foreground)] mb-5">
                    <s.icon className="size-6 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-heading font-bold uppercase tracking-tight mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground font-body font-medium leading-relaxed max-w-xs">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Social Proof / Trust ── */}
      <section className="px-6 py-20 sm:py-24 md:px-20 lg:px-32 bg-muted/50">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-bold uppercase tracking-widest text-primary mb-3 font-heading">Why Collectr</p>
          <h2 className="text-4xl sm:text-5xl font-title font-black tracking-tight uppercase text-foreground mb-12">
            Free & open.
          </h2>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Your Data Stays Yours",
                desc: "No tracking. No ads. No selling your data. Your links are yours, period.",
              },
              {
                icon: WifiOff,
                title: "Works Offline",
                desc: "Install as a PWA and access your collections anywhere — even without internet.",
              },
              {
                icon: Zap,
                title: "Blazing Fast",
                desc: "Built with modern tech. Instant search, instant save. No waiting around.",
              },
            ].map((t) => (
              <div
                key={t.title}
                className="flex flex-col gap-5 p-6 border-2 border-foreground bg-card shadow-[6px_6px_0px_0px_var(--color-foreground)] hover:-translate-y-1.5 hover:shadow-[10px_10px_0px_0px_var(--color-primary)] transition-all duration-300"
              >
                <div className="flex size-12 items-center justify-center bg-foreground rounded-none">
                  <t.icon className="size-5 text-background" strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-lg font-heading font-bold uppercase tracking-tight mb-1.5">{t.title}</p>
                  <p className="text-sm text-muted-foreground font-body font-medium leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Footer ── */}
      <section className="px-6 py-20 sm:py-28 md:px-20 lg:px-32">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-title font-black tracking-tight uppercase text-foreground mb-6">
            Start saving today.
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground font-body font-medium mb-10 max-w-lg mx-auto">
            Free to use. No account required to try. Sign up when you're ready.
          </p>
          <Button asChild size="lg" className="h-14 sm:h-16 px-10 sm:px-12 text-base sm:text-lg font-bold uppercase tracking-wider rounded-none bg-foreground text-background hover:bg-primary hover:text-primary-foreground transition-all duration-300 ease-[var(--ease-out)] shadow-[4px_4px_0px_0px_var(--color-primary)] hover:shadow-[8px_8px_0px_0px_var(--color-foreground)] hover:-translate-y-1">
            <Link to="/login">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t-2 border-foreground px-6 py-8 md:px-20 lg:px-32">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center bg-primary rounded-none shadow-[2px_2px_0px_0px_var(--color-foreground)]">
              <Bookmark className="size-3.5 text-primary-foreground fill-current" />
            </div>
            <span className="font-heading font-black text-sm tracking-tight uppercase">Collectr.</span>
          </div>
          <p className="text-xs text-muted-foreground font-body">
            Built with care. Your links, your way.
          </p>
        </div>
      </footer>
    </main>
  );
}

function SavedView() {
  const { openInspector, selectionMode, selectedIds, enterSelectionMode, toggleSelection } = useUiStore();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [movingItemId, setMovingItemId] = useState<Id<"items"> | null>(null);

  const inboxItems = useQuery(api.items.listInbox);
  const folderData = useQuery(api.folders.listTree);

  // Cache results so remounts after navigation don't flash skeletons
  if (inboxItems !== undefined) cachedInboxItems = inboxItems;
  if (folderData !== undefined) cachedFolderData = folderData;

  const displayInboxItems = inboxItems ?? cachedInboxItems;
  const displayFolderData = folderData ?? cachedFolderData;

  const setMetadata = useMutation(api.items.setMetadata);
  const markAllAsRead = useMutation(api.items.markAllAsRead).withOptimisticUpdate(
    (store) => {
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listInbox)) {
        if (value) {
          store.setQuery(api.items.listInbox, queryArgs, value.map((t) => ({ ...t, isRead: true })));
        }
      }
      for (const { args: queryArgs, value } of store.getAllQueries(api.items.listAll)) {
        if (value) {
          store.setQuery(api.items.listAll, queryArgs, value.map((t) => ({ ...t, isRead: true })));
        }
      }
    }
  );
  const attemptedRef = useRef<Set<string>>(new Set());

  const unreadCount = displayInboxItems?.filter((t) => !t.isRead).length ?? 0;

  useEffect(() => {
    if (!inboxItems) return;

    const itemsWithoutContent = inboxItems.filter((t) => !(t.text?.trim() || t.title?.trim()));
    const fetchable = itemsWithoutContent.filter((t) => isMetadataFetchEnabled(t.source));
    const timers: ReturnType<typeof setTimeout>[] = [];

    fetchable.forEach((item, index) => {
      if (attemptedRef.current.has(item._id)) return;
      attemptedRef.current.add(item._id);

      const timer = setTimeout(async () => {
        const meta = await fetchItemMetadata(item.url, item.source);
        await setMetadata({
          itemId: item._id,
          status: meta ? "ok" : "unavailable",
          ...meta,
        }).catch(() => {});
      }, index * 400 + Math.random() * 200);

      timers.push(timer);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [inboxItems, setMetadata]);

  const collections = displayFolderData?.folders ?? [];
  const inboxCount = displayFolderData?.inboxCount ?? 0;

  const showCollections = filter === "all" || filter === "collections";
  const showLinks = filter === "all" || filter === "links";

  const filterTabs: { value: FilterTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "collections", label: "Collections" },
    { value: "links", label: "Links" },
  ];

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        {/* Collections Section */}
      {showCollections ? (
        <section className="-mx-4 md:-mx-8">
          <div className="no-scrollbar flex overflow-x-auto gap-3 pb-4 snap-x snap-mandatory px-4 md:px-8 [scroll-padding-inline:1rem] md:[scroll-padding-inline:2rem]">
            {folderData === undefined && cachedFolderData === undefined
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[191.6px] w-[40%] min-w-[160px] shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-card"
                  >
                    <div className="h-[60%] w-full animate-pulse bg-muted" />
                    <div className="flex items-center justify-between gap-2 p-3">
                      <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                      <div className="h-2.5 w-4 shrink-0 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))
              : collections.map((folder) => (
                  <CollectionCard
                    key={folder._id}
                    id={folder._id}
                    name={folder.name}
                    itemCount={folder.itemCount}
                    className="w-[40%] min-w-[160px] snap-start"
                  />
                ))}
          </div>
        </section>
      ) : null}

      {/* Filter Chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2 mb-8 mt-4">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            aria-pressed={filter === tab.value}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2.5 text-body font-body transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.97]",
              filter === tab.value
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Links Section */}
      {showLinks ? (
        <section className="mt-section">
          {selectionMode ? (
            <BulkSelectionToolbar
              totalCount={displayInboxItems?.length ?? 0}
              allIds={displayInboxItems?.map((t) => t._id) ?? []}
            />
          ) : (
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-heading font-heading tracking-tight">
                {filter === "links" ? "All links" : "Recent links"}
              </h2>
              <div className="flex items-center gap-2">
                {displayInboxItems && displayInboxItems.length > 0 ? (
                  <button
                    onClick={enterSelectionMode}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    Select
                  </button>
                ) : null}
                {unreadCount > 0 ? (
                  <button
                    onClick={() => markAllAsRead().catch(() => {})}
                    className="text-xs font-medium text-blue-500 hover:text-blue-400 transition-colors duration-150"
                  >
                    Mark all read
                  </button>
                ) : null}
                {inboxCount > 0 ? (
                  <span className="text-body text-muted-foreground">
                    {inboxCount} saved
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {displayInboxItems === undefined ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 animate-pulse rounded-xl bg-muted"
                />
              ))}
            </div>
          ) : displayInboxItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-card-padding text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted">
                <Link2 className="size-6 text-muted-foreground/40" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No links saved yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Paste a link to get started
              </p>
            </div>
          ) : (
            <VirtualizedList
              items={displayInboxItems.map((t) => ({ ...t, id: t._id }))}
              renderItem={(item) => (
                <SavedItemCard
                  item={item}
                  variant="list"
                  selected={selectedIds.has(item._id)}
                  onToggleSelection={
                    selectionMode
                      ? () => toggleSelection(item._id)
                      : undefined
                  }
                  onLongPress={
                    !selectionMode
                      ? () => {
                          enterSelectionMode();
                          toggleSelection(item._id);
                        }
                      : undefined
                  }
                  onOpen={
                    selectionMode
                      ? () => toggleSelection(item._id)
                      : () => openInspector(item._id)
                  }
                  onMove={
                    selectionMode
                      ? undefined
                      : (id) => setMovingItemId(id)
                  }
                />
              )}
              estimateSize={72}
              gap={8}
              animation="scale"
            />
          )}
        </section>
      ) : null}

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
