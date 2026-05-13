const fs = require('fs');

const code = `import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { AnimatePresence, motion } from "framer-motion";
import { AddTweetForm } from "@/components/add-tweet-form";
import { Folder, Hash, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";

interface MobileAddDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewState = 'main' | 'collections' | 'tags';

export function MobileAddDrawer({ open, onOpenChange }: MobileAddDrawerProps) {
  const [view, setView] = useState<ViewState>('main');
  const [folderId, setFolderId] = useState<Id<"folders"> | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  
  const foldersData = useQuery(api.folders.listTree);

  useEffect(() => {
    if (open) {
      setView('main');
      setFolderId(null);
      setTags([]);
    }
  }, [open]);

  return (
    <div className="md:hidden">
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="bg-background flex flex-col rounded-t-[32px] h-auto max-h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50 outline-none">
            <div className="p-4 bg-background rounded-t-[32px] overflow-hidden flex flex-col">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />
              
              <AnimatePresence mode="wait" initial={false}>
                {view === 'main' && (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mb-4">
                      <h2 className="text-lg font-semibold">Add Link</h2>
                      <p className="text-sm text-muted-foreground">
                        Save a new link to your collection.
                      </p>
                    </div>
                    <div className="flex-1 overflow-visible p-1">
                      <AddTweetForm 
                        onAdded={() => onOpenChange(false)} 
                        folderId={folderId}
                        tags={tags}
                      />
                    </div>
                    
                    <div className="mt-8 mb-6 flex gap-3 px-1">
                      <Button 
                        variant="outline" 
                        className="flex-1 flex gap-2 items-center" 
                        onClick={() => setView('collections')}
                      >
                        <Folder className="size-4" />
                        <span className="truncate">
                          {folderId && foldersData?.folders 
                            ? foldersData.folders.find(f => f._id === folderId)?.name || 'Collection'
                            : 'Collection'}
                        </span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 flex gap-2 items-center" 
                        onClick={() => setView('tags')}
                      >
                        <Hash className="size-4" />
                        <span className="truncate">
                          {tags.length > 0 ? tags.join(', ') : 'Tags'}
                        </span>
                      </Button>
                    </div>
                  </motion.div>
                )}

                {view === 'collections' && (
                  <motion.div
                    key="collections"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col max-h-[50vh]"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Button variant="ghost" size="icon" className="size-8 -ml-2" onClick={() => setView('main')}>
                        <ChevronLeft className="size-5" />
                      </Button>
                      <h2 className="text-lg font-semibold">Select Collection</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-1 pb-4">
                      <button
                        onClick={() => {
                          setFolderId(null);
                          setView('main');
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                          folderId === null ? "bg-muted text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <Folder className="size-4" />
                        Saved (Inbox)
                      </button>
                      {foldersData?.folders.map((folder) => (
                        <button
                          key={folder._id}
                          onClick={() => {
                            setFolderId(folder._id);
                            setView('main');
                          }}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
                            folderId === folder._id ? "bg-muted text-foreground" : "text-muted-foreground"
                          )}
                        >
                          <Folder className="size-4" />
                          <span className="truncate">{folder.name}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {view === 'tags' && (
                  <motion.div
                    key="tags"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Button variant="ghost" size="icon" className="size-8 -ml-2" onClick={() => setView('main')}>
                        <ChevronLeft className="size-5" />
                      </Button>
                      <h2 className="text-lg font-semibold">Add Tags</h2>
                    </div>
                    <div className="pb-4 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Enter tags separated by commas.
                      </p>
                      <input
                        type="text"
                        placeholder="design, inspiration, tool"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={tags.join(', ')}
                        onChange={(e) => {
                          const newTags = e.target.value
                            .split(',')
                            .map(t => t.trim())
                            .filter(t => t.length > 0);
                          setTags(newTags);
                        }}
                      />
                      <Button className="w-full" onClick={() => setView('main')}>
                        Done
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
`;

fs.writeFileSync('src/components/layout/MobileAddDrawer.tsx', code);
