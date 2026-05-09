import { useState, type ReactNode } from "react";
import { Search, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserButton } from "@/components/User-button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { AddTweetForm } from "@/components/add-tweet-form";
import { MobileFolderSheet } from "./MobileFolderSheet";

interface HeaderProps {
  title?: string;
  backButton?: ReactNode;
}

export function Header({ title, backButton }: HeaderProps) {
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-border bg-background flex items-center justify-between px-4 shrink-0">
        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          {backButton ? (
            backButton
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={() => setFolderSheetOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          )}
          <span className="font-semibold tracking-tight">
            {title ?? "Collectr"}
          </span>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4 flex-1">
          {backButton}
          {title ? (
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          ) : null}
          <div className="flex items-center flex-1 max-w-md ml-4">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search (Cmd+K)"
                className="h-9 w-full rounded-md border border-input bg-transparent px-9 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" className="hidden md:flex gap-2">
                <Plus className="size-4" />
                Add
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80"
              onOpenAutoFocus={(e) => e.preventDefault()}
            >
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Add Link</h4>
                  <p className="text-sm text-muted-foreground">
                    Save a new link to your collection.
                  </p>
                </div>
                <AddTweetForm onAdded={() => {}} />
              </div>
            </PopoverContent>
          </Popover>
          <UserButton className="size-8 md:size-10" />
        </div>
      </header>

      <MobileFolderSheet
        open={folderSheetOpen}
        onOpenChange={setFolderSheetOpen}
      />
    </>
  );
}
