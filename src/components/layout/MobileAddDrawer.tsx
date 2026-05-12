import { Drawer } from "vaul";
import { AddTweetForm } from "@/components/add-tweet-form";

interface MobileAddDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileAddDrawer({ open, onOpenChange }: MobileAddDrawerProps) {
  return (
    <div className="md:hidden">
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="bg-background flex flex-col rounded-t-[32px] h-auto max-h-[85vh] mt-24 fixed bottom-0 left-0 right-0 z-50">
            <div className="p-4 bg-background rounded-t-[32px] overflow-y-auto flex flex-col">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mb-4" />
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Add Link</h2>
                <p className="text-sm text-muted-foreground">
                  Save a new link to your collection.
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AddTweetForm onAdded={() => onOpenChange(false)} />
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
