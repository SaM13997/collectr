import { useState } from "react";
import { Drawer } from "vaul";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Inbox, Library, FolderOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MobileFolderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Folder = {
  _id: string;
  name: string;
  parentId: string | null;
  tweetCount?: number;
  itemCount?: number;
};

function FolderTreeItem({
  folder,
  folders,
  level,
  onNavigate,
}: {
  folder: Folder;
  folders: Folder[];
  level: number;
  onNavigate: () => void;
}) {
  const children = folders.filter((f) => f.parentId === folder._id);

  return (
    <div>
      <Link
        to="/folders/$folderId"
        params={{ folderId: folder._id }}
        onClick={onNavigate}
        className="flex items-center justify-between py-2 rounded-md hover:bg-accent text-sm font-medium transition-colors"
        style={{ paddingLeft: `${12 + level * 16}px`, paddingRight: "12px" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <FolderOpen className="size-4 text-muted-foreground shrink-0" />
          <span className="truncate">{folder.name}</span>
        </div>
        {((folder.tweetCount ?? 0) > 0 || (folder.itemCount ?? 0) > 0) && (
          <span className="text-muted-foreground text-xs shrink-0 ml-2">
            {folder.tweetCount ?? folder.itemCount ?? 0}
          </span>
        )}
      </Link>
      {children.map((child) => (
        <FolderTreeItem
          key={child._id}
          folder={child}
          folders={folders}
          level={level + 1}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

function FolderTree({
  folders,
  onNavigate,
}: {
  folders: Folder[];
  onNavigate: () => void;
}) {
  const roots = folders.filter((f) => f.parentId === null);
  return (
    <div className="flex flex-col gap-1">
      {roots.map((folder) => (
        <FolderTreeItem
          key={folder._id}
          folder={folder}
          folders={folders}
          level={0}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}

export function MobileFolderSheet({
  open,
  onOpenChange,
}: MobileFolderSheetProps) {
  const folderData = useQuery(api.folders.listTree);
  const createFolder = useMutation(api.folders.create);
  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const folders = (folderData?.folders ?? []) as Folder[];
  const inboxCount = folderData?.inboxCount ?? 0;

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await createFolder({ name: newName.trim(), parentId: null });
      setNewName("");
    } finally {
      setIsCreating(false);
    }
  };

  const handleNavigate = () => {
    onOpenChange(false);
  };

  return (
    <div className="md:hidden">
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-hidden rounded-t-[32px] bg-background">
            <div className="rounded-t-[32px] bg-background p-4">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />
              <div className="max-h-[min(60vh,28rem)] overflow-y-auto pr-1">
                <nav className="flex flex-col gap-1 mb-4">
                  <Link
                    to="/"
                    onClick={handleNavigate}
                    className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-accent text-sm font-medium transition-colors"
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
                    onClick={handleNavigate}
                    className="flex items-center px-3 py-2 rounded-md hover:bg-accent text-sm font-medium transition-colors"
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
                  <FolderTree
                    folders={folders}
                    onNavigate={handleNavigate}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCreate();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="New collection"
                    aria-label="New collection name"
                    className="h-10"
                    disabled={isCreating}
                  />
                  <Button
                    type="submit"
                    disabled={isCreating}
                    className="size-10 min-h-0 min-w-0 shrink-0 rounded-full p-0"
                    aria-label="Create collection"
                  >
                    <Plus className="size-4" />
                  </Button>
                </form>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
