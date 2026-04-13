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

export function FolderTree({ currentFolderId }: { currentFolderId?: string }) {
  const data = useQuery(api.folders.listTree);
  const createFolder = useMutation(api.folders.create);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  if (!data) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-white/5" />
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
    <nav className="space-y-1">
      <Link
        to="/"
        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
          !currentFolderId
            ? "bg-white/10 text-white"
            : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Inbox className="size-4" />
        <span className="flex-1">Inbox</span>
        {inboxCount > 0 ? (
          <span className="text-xs tabular-nums text-zinc-500">{inboxCount}</span>
        ) : null}
      </Link>

      {tree.get(null)?.map((folder) => (
        <FolderItem
          key={folder._id}
          folder={folder}
          tree={tree}
          currentFolderId={currentFolderId}
          depth={0}
        />
      ))}

      {isCreating ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          className="flex items-center gap-1 pl-3"
        >
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Folder name"
            className="h-7 text-xs"
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
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-500 transition hover:bg-white/5 hover:text-zinc-300"
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
  depth,
}: {
  folder: FolderNode;
  tree: Map<string | null, FolderNode[]>;
  currentFolderId?: string;
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
        className={`group flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition ${
          isActive
            ? "bg-white/10 text-white"
            : "text-zinc-400 hover:bg-white/5 hover:text-white"
        }`}
        style={{ paddingLeft: `${(depth + 1) * 12 + 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-zinc-500 hover:text-white"
          >
            {expanded ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
          </button>
        ) : (
          <span className="size-3 shrink-0" />
        )}

        {isActive ? (
          <FolderOpen className="size-4 shrink-0 text-sky-400" />
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
              className="h-6 text-xs"
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
          >
            {folder.name}
          </Link>
        )}

        <span className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
          {folder.tweetCount > 0 ? (
            <span className="text-xs tabular-nums text-zinc-500">
              {folder.tweetCount}
            </span>
          ) : null}
          <button
            onClick={() => {
              setRenameValue(folder.name);
              setIsRenaming(true);
            }}
            className="text-zinc-500 hover:text-white"
            title="Rename"
          >
            <Pencil className="size-3" />
          </button>
          <button
            onClick={() => deleteFolder({ folderId: folder._id })}
            className="text-zinc-500 hover:text-red-400"
            title="Delete (if empty)"
          >
            <Trash2 className="size-3" />
          </button>
        </span>
      </div>

      {expanded && children.length > 0 ? (
        <div>
          {children.map((child) => (
            <FolderItem
              key={child._id}
              folder={child}
              tree={tree}
              currentFolderId={currentFolderId}
              depth={depth + 1}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
