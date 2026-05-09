import { type ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { InspectorPanel } from "./InspectorPanel";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileAddDrawer } from "./MobileAddDrawer";

export interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  backButton?: ReactNode;
}

export function AppLayout({ children, title, backButton }: AppLayoutProps) {
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 shrink-0 border-r border-border">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header title={title} backButton={backButton} />
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
    </div>
  );
}
