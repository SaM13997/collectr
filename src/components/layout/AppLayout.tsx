import { type ReactNode, useState, useEffect, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { InspectorPanel } from "./InspectorPanel";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileAddDrawer } from "./MobileAddDrawer";
import { CommandPalette } from "@/components/command-palette";
import { useOnline } from "@/lib/use-online";

export interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  backButton?: ReactNode;
}

export function AppLayout({ children, title, backButton }: AppLayoutProps) {
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const isOnline = useOnline();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setPaletteOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 border-r border-border">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header
          title={title}
          backButton={backButton}
          onSearchClick={() => setPaletteOpen(true)}
        />
        {!isOnline && (
          <div className="bg-muted px-4 py-2 text-center text-sm text-muted-foreground border-b border-border">
            You're offline. Showing cached data.
          </div>
        )}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Right Panel / Inspector */}
      <InspectorPanel />

      {/* Mobile Bottom Nav */}
      <MobileBottomNav onAddClick={() => setAddDrawerOpen(true)} />

      {/* Mobile Add Drawer */}
      <MobileAddDrawer open={addDrawerOpen} onOpenChange={setAddDrawerOpen} />

      {/* Command Palette */}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
