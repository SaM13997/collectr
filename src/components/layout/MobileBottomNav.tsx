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
    <nav className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-sm -translate-x-1/2 md:hidden">
      <div className="flex h-16 items-center justify-around rounded-full border border-line bg-panel/78 px-2 shadow-strong backdrop-blur-xl dark:border-line-strong dark:bg-charcoal/78">
        {tabs.map((tab, index) => {
          const isActive = tab.to && pathname === tab.to;
          
          // Assign unique colors to tabs
          const colors = [
            "text-coral group-hover:text-coral/80", 
            "text-sky group-hover:text-sky/80", 
            "text-butter group-hover:text-butter/80", 
            "text-sage group-hover:text-sage/80"
          ];
          const colorClass = colors[index % colors.length];

          if (tab.to === null) {
            return (
              <button
                key={tab.label}
                onClick={tab.onClick}
                className="group flex flex-col items-center justify-center gap-1 flex-1 h-full text-muted-foreground transition-transform active:scale-95"
              >
                <div className="flex items-center justify-center size-10 rounded-full transition-colors bg-ink dark:bg-panel text-panel dark:text-ink">
                  <tab.icon className="size-5" />
                </div>
              </button>
            );
          }

          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all active:scale-95",
                isActive ? colorClass : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center size-10 rounded-full transition-colors",
                isActive ? "bg-ink/5 dark:bg-white/10" : "hover:bg-ink/5 dark:hover:bg-white/5"
              )}>
                <tab.icon className="size-5" />
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
