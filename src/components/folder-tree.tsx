import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Folder,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  Inbox,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderNode {
  _id: Id<"folders">;
  name: string;
  parentId: Id<"folders"> | null;
  tweetCount: number;
  createdAt: number;
}

function buildTree(folders: FolderNode[]) {
  const children = new Map<string | null, FolderNode[]>();
  for (const f of folders) {
    const key = f.parentId ?? null;
    if (!children.has(key)) children.set(key, []);
    children.get(key)!.push(f);
  }
  for (const list of children.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }
  return children;
}

function branchContainsFolder(
  tree: Map<string | null, FolderNode[]>,
  folderId: string,
  targetFolderId?: string
): boolean {
  if (!targetFolderId) {
    return false;
  }

  if (folderId === targetFolderId) {
    return true;
  }

  const children = tree.get(folderId) ?? [];
  return children.some((child) => branchContainsFolder(tree, child._id, targetFolderId));
}

export function FolderTree({
  currentFolderId,
  onNavigate,
}: {
  currentFolderId?: string;
  onNavigate?: () => void;
}) {
  const data = useQuery(api.folders.listTree);
  const createFolder = useMutation(api.folders.create);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  if (!data) {
    return (
      <div className="flex flex-col gap-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const { folders, inboxCount } = data;
  const tree = buildTree(folders);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createFolder({ name: newName.trim(), parentId: null });
    setNewName("");
    setIsCreating(false);
  };

  return (
    <nav className="flex flex-col gap-0.5">
      <Link
        to="/"
        className={cn(
          "flex h-9 items-center gap-3 rounded-lg px-2 text-sm transition",
          !currentFolderId
            ? "bg-foreground text-background font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
        onClick={onNavigate}
      >
        <Inbox className="size-4" />
        <span className="flex-1">Inbox</span>
        {inboxCount > 0 ? (
          <span className="text-xs tabular-nums opacity-60">{inboxCount}</span>
        ) : null}
      </Link>

      {tree.get(null)?.map((folder) => (
        <FolderItem
          key={folder._id}
          folder={folder}
          tree={tree}
          currentFolderId={currentFolderId}
          onNavigate={onNavigate}
          depth={0}
        />
      ))}

      {isCreating ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="flex items-center gap-1 px-2 py-1"
        >
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Folder name"
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsCreating(false);
                setNewName("");
              }
            }}
          />
          <Button type="submit" size="sm" variant="ghost" className="h-7 px-2">
            Add
          </Button>
        </form>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="flex h-9 w-full items-center gap-3 rounded-lg px-2 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-4" />
          <span>New folder</span>
        </button>
      )}
    </nav>
  );
}

function FolderItem({
  folder,
  tree,
  currentFolderId,
  onNavigate,
  depth,
}: {
  folder: FolderNode;
  tree: Map<string | null, FolderNode[]>;
  currentFolderId?: string;
  onNavigate?: () => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(folder.name);

  const renameFolder = useMutation(api.folders.rename);
  const deleteFolder = useMutation(api.folders.deleteIfEmpty);

  const children = tree.get(folder._id) ?? [];
  const isActive = currentFolderId === folder._id;
  const hasChildren = children.length > 0;
  const containsActiveChild = children.some((child) =>
    branchContainsFolder(tree, child._id, currentFolderId)
  );
  const isExpanded = expanded || containsActiveChild;

  const handleRename = async () => {
    if (!renameValue.trim() || renameValue.trim() === folder.name) {
      setIsRenaming(false);
      setRenameValue(folder.name);
      return;
    }
    await renameFolder({ folderId: folder._id, name: renameValue.trim() });
    setIsRenaming(false);
  };

  return (
    <div>
      <div
        className={cn(
          "group flex h-9 items-center gap-2 rounded-lg px-2 text-sm transition",
          isActive
            ? "bg-foreground text-background font-medium"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 opacity-60 hover:opacity-100"
          >
            {isExpanded ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
          </button>
        ) : (
          <span className="size-3 shrink-0" />
        )}

        {isActive ? (
          <FolderOpen className="size-4 shrink-0" />
        ) : (
          <Folder className="size-4 shrink-0" />
        )}

        {isRenaming ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRename();
            }}
            className="flex-1"
          >
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="h-6 text-sm"
              autoFocus
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setIsRenaming(false);
                  setRenameValue(folder.name);
                }
              }}
            />
          </form>
        ) : (
          <Link
            to="/folders/$folderId"
            params={{ folderId: folder._id }}
            className="min-w-0 flex-1 truncate"
            onClick={onNavigate}
          >
            {folder.name}
          </Link>
        )}

        <span className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {folder.tweetCount > 0 ? (
            <span className="mr-1 text-xs tabular-nums opacity-60">
              {folder.tweetCount}
            </span>
          ) : null}
          <button
            onClick={() => {
              setRenameValue(folder.name);
              setIsRenaming(true);
            }}
            className="rounded p-0.5 opacity-60 hover:opacity-100"
            title="Rename"
          >
            <Pencil className="size-3" />
          </button>
          <button
            onClick={() => deleteFolder({ folderId: folder._id })}
            className="rounded p-0.5 opacity-60 hover:text-destructive hover:opacity-100"
            title="Delete (if empty)"
          >
            <Trash2 className="size-3" />
          </button>
        </span>
      </div>

      {isExpanded && children.length > 0 ? (
        <div className="flex flex-col gap-0.5">
          {children.map((child) => (
            <FolderItem
              key={child._id}
              folder={child}
              tree={tree}
              currentFolderId={currentFolderId}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
