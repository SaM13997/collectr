import { useEffect } from "react";
import { useUiStore } from "@/store/useUiStore";
import { Drawer } from "vaul";
import { X, ExternalLink, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { InspectorSkeleton } from "@/components/skeletons";

export function InspectorPanel() {
  const { inspectorOpen, selectedItemId, closeInspector } = useUiStore();
  
  // Try to query the item if we have an ID
  const item = useQuery(api.items.getById, selectedItemId ? { itemId: selectedItemId as Id<"items"> } : "skip");
  const markAsRead = useMutation(api.items.markAsRead);

  useEffect(() => {
    if (item && !item.isRead) {
      markAsRead({ itemId: item._id }).catch(() => {});
    }
  }, [item, markAsRead]);

  const Content = () => {
    if (!item) return <InspectorSkeleton />;

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium hover:underline text-foreground"
          >
            <ExternalLink className="size-4" />
            Original Link
          </a>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="size-8 min-h-11 min-w-11" aria-label="More options">
              <MoreVertical className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" className="size-8 min-h-11 min-w-11 md:hidden" onClick={closeInspector} aria-label="Close inspector">
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {item.title && <h2 className="text-xl font-bold mb-4">{item.title}</h2>}
          {item.text && <p className="text-body text-muted-foreground whitespace-pre-wrap">{item.text}</p>}
          
          <div className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Notes</label>
              <textarea 
                className="w-full mt-1 p-2 rounded-md border border-border bg-transparent focus:outline-none focus:ring-2 focus:ring-primary" 
                rows={4}
                placeholder="Add some notes..."
                aria-label="Notes"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Panel */}
      {inspectorOpen && (
        <aside className="hidden md:flex w-80 lg:w-96 flex-col border-l border-border bg-background h-screen sticky top-0 shrink-0">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Inspector</h3>
            <Button variant="ghost" size="icon" onClick={closeInspector} className="size-8 min-h-11 min-w-11" aria-label="Close inspector">
              <X className="size-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Content />
          </div>
        </aside>
      )}

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        <Drawer.Root open={inspectorOpen} onOpenChange={(open) => !open && closeInspector()}>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
            <Drawer.Content className="bg-background flex flex-col rounded-t-[10px] h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50">
              <div className="p-4 bg-background rounded-t-[10px] flex-1 overflow-hidden flex flex-col">
                <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />
                <div className="flex-1 overflow-hidden">
                  <Content />
                </div>
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </div>
    </>
  );
}
