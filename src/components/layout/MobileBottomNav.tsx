import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, Plus, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onAddClick: () => void;
}

export function MobileBottomNav({ onAddClick }: MobileBottomNavProps) {
  const { location } = useRouterState();
  const pathname = location.pathname;

  const tabs = [
    { to: "/" as const, icon: Home, label: "Home" },
    { to: "/search" as const, icon: Search, label: "Search" },
    { to: null, icon: Plus, label: "Add", onClick: onAddClick },
    { to: "/collections" as const, icon: FolderOpen, label: "Collections" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const isActive = tab.to && pathname === tab.to;

          if (tab.to === null) {
            return (
              <button
                key={tab.label}
                onClick={tab.onClick}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-muted-foreground"
              >
                <tab.icon className="size-5" />
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <tab.icon className="size-5" />
              <span className="text-[10px]">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
