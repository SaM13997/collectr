import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import {
  Search,
  Inbox,
  Library,
  FolderOpen,
  Plus,
  Moon,
  Sun,
  Link2,
  ArrowRight,
  Command,
} from "lucide-react";
import type { Doc } from "../../convex/_generated/dataModel";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ActionItem = {
  id: string;
  type: "navigation" | "action" | "result";
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  shortcut?: string;
  onSelect: () => void;
};

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const allItems = useQuery(api.items.listAll);
  const folderData = useQuery(api.folders.listTree);

  const folderMap = useMemo(() => {
    if (!folderData?.folders) return new Map<string, string>();
    const map = new Map<string, string>();
    for (const f of folderData.folders) {
      map.set(f._id, f.name);
    }
    return map;
  }, [folderData?.folders]);

  const matchItem = useCallback(
    (item: Doc<"items">, q: string): boolean => {
      const handle = item.url.match(
        /(?:twitter\.com|x\.com)\/([^/]+)\/status\//
      )?.[1];
      const folderName = item.folderId
        ? folderMap.get(item.folderId)
        : undefined;
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
    },
    [folderMap]
  );

  const navigationItems: ActionItem[] = [
    {
      id: "nav-home",
      type: "navigation",
      icon: <Inbox className="size-4" />,
      label: "Go to Inbox",
      shortcut: "G H",
      onSelect: () => {
        navigate({ to: "/" });
        onOpenChange(false);
      },
    },
    {
      id: "nav-all",
      type: "navigation",
      icon: <Library className="size-4" />,
      label: "Go to All Items",
      shortcut: "G A",
      onSelect: () => {
        navigate({ to: "/search" });
        onOpenChange(false);
      },
    },
    {
      id: "nav-collections",
      type: "navigation",
      icon: <FolderOpen className="size-4" />,
      label: "Go to Collections",
      shortcut: "G C",
      onSelect: () => {
        navigate({ to: "/collections" });
        onOpenChange(false);
      },
    },
    {
      id: "nav-profile",
      type: "navigation",
      icon: <Command className="size-4" />,
      label: "Go to Profile",
      shortcut: "G P",
      onSelect: () => {
        navigate({ to: "/profile" });
        onOpenChange(false);
      },
    },
  ];

  const actionItems: ActionItem[] = [
    {
      id: "action-add",
      type: "action",
      icon: <Plus className="size-4" />,
      label: "Add new link",
      shortcut: "N",
      onSelect: () => {
        navigate({ to: "/" });
        onOpenChange(false);
      },
    },
    {
      id: "action-theme",
      type: "action",
      icon:
        resolvedTheme === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        ),
      label: `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`,
      shortcut: "T",
      onSelect: () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
        onOpenChange(false);
      },
    },
  ];

  const searchResults: ActionItem[] = useMemo(() => {
    if (!query.trim() || !allItems) return [];
    const q = query.toLowerCase().trim();
    return allItems
      .filter((item) => matchItem(item, q))
      .slice(0, 8)
      .map((item) => ({
        id: `result-${item._id}`,
        type: "result" as const,
        icon: <Link2 className="size-4" />,
        label: item.title || item.url,
        subtitle: item.text || item.authorName || item.canonicalUrl,
        onSelect: () => {
          navigate({
            to: "/entries/$entryId",
            params: { entryId: item._id },
          });
          onOpenChange(false);
        },
      }));
  }, [query, allItems, matchItem, navigate, onOpenChange]);

  const commandItems: ActionItem[] = useMemo(() => {
    if (query.trim()) {
      return searchResults.length > 0
        ? searchResults
        : [
            {
              id: "no-results",
              type: "result",
              icon: <Search className="size-4 text-muted-foreground" />,
              label: "No results found",
              subtitle: "Try a different search term",
              onSelect: () => {},
            },
          ];
    }
    return [...navigationItems, ...actionItems];
  }, [query, searchResults, navigationItems, actionItems]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const el = listRef.current?.querySelector(
      `[data-index="${activeIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % commandItems.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + commandItems.length) % commandItems.length);
        break;
      case "Enter":
        e.preventDefault();
        commandItems[activeIndex]?.onSelect();
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onKeyDown={handleKeyDown}
    >
      <div
        className="fixed inset-0 bg-background/60 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-xl mx-4 rounded-xl border border-border bg-popover shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150"
      >
        <div className="flex items-center border-b border-border px-4">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items, navigate, or run actions..."
            aria-label="Search command palette"
            className="flex h-12 w-full bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground shrink-0">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="max-h-80 overflow-y-auto p-1.5">
          {!query.trim() && (
            <>
              <div className="px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Navigation
              </div>
              {navigationItems.map((item, i) => (
                <CommandItem
                  key={item.id}
                  item={item}
                  index={i}
                  active={activeIndex === i}
                  onHover={() => setActiveIndex(i)}
                />
              ))}
              <div className="px-2.5 py-1.5 mt-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </div>
              {actionItems.map((item, i) => {
                const idx = navigationItems.length + i;
                return (
                  <CommandItem
                    key={item.id}
                    item={item}
                    index={idx}
                    active={activeIndex === idx}
                    onHover={() => setActiveIndex(idx)}
                  />
                );
              })}
            </>
          )}

          {query.trim() && (
            <>
              {searchResults.length > 0 && (
                <div className="px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  Results
                </div>
              )}
              {commandItems.map((item, i) => (
                <CommandItem
                  key={item.id}
                  item={item}
                  index={i}
                  active={activeIndex === i}
                  onHover={() => setActiveIndex(i)}
                />
              ))}
            </>
          )}
        </div>

        <div className="border-t border-border px-4 py-2 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px]">
              ↑↓
            </kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px]">
              ↵
            </kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="inline-flex h-4 items-center rounded border border-border bg-muted px-1 font-mono text-[10px]">
              esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}

function CommandItem({
  item,
  index,
  active,
  onHover,
}: {
  item: ActionItem;
  index: number;
  active: boolean;
  onHover: () => void;
}) {
  return (
    <button
      data-index={index}
      onClick={item.onSelect}
      onMouseEnter={onHover}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors duration-75 text-left",
        active
          ? "bg-accent text-accent-foreground"
          : "text-foreground hover:bg-accent/50"
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {item.icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{item.label}</div>
        {item.subtitle && (
          <div className="text-xs text-muted-foreground truncate">
            {item.subtitle}
          </div>
        )}
      </div>
      {item.shortcut && (
        <span className="flex items-center gap-1 shrink-0">
          {item.shortcut.split(" ").map((key, i) => (
            <kbd
              key={i}
              className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground"
            >
              {key}
            </kbd>
          ))}
        </span>
      )}
      {active && (
        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}
