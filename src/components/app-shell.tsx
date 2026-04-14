import { type ReactNode, useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  FolderOpen,
  Inbox,
  LogOut,
  Monitor,
  MoonStar,
  Settings,
  Sparkles,
  SunMedium,
  X,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FolderTree } from "@/components/folder-tree";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { ThemeSetting, useTheme } from "@/components/theme-provider";
import { UserButton } from "@/components/User-button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AppShellProps = {
  currentFolderId?: string;
  children: ReactNode;
};

type ActivePanel = "folders" | "settings" | null;

type AppSheetProps = {
  title: string;
  description: string;
  mobileOnly?: boolean;
  onClose: () => void;
  children: ReactNode;
};

type ThemeOption = {
  value: ThemeSetting;
  label: string;
  description: string;
  icon: LucideIcon;
};

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    description: "Warm paper and bright cards.",
    icon: SunMedium,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Night mode for late sorting.",
    icon: MoonStar,
  },
  {
    value: "system",
    label: "System",
    description: "Follow the device theme.",
    icon: Monitor,
  },
];

export function AppShell({ currentFolderId, children }: AppShellProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl gap-8 px-4 pb-24 pt-6 md:px-8 md:pb-8">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <div className="sticky top-6 flex flex-col gap-6">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 px-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-foreground">
                <FolderOpen className="size-4 text-background" />
              </div>
              <span className="text-lg font-semibold tracking-tight">Collectr</span>
            </Link>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
              <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Library
              </p>
              <FolderTree currentFolderId={currentFolderId} />
            </nav>

            {/* Bottom Actions */}
            <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="ghost"
                className="h-10 justify-start gap-3 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => setActivePanel("settings")}
              >
                <Settings className="size-4" />
                <span>Settings</span>
              </Button>
              <div className="flex items-center gap-2 px-2">
                <ThemeToggleButton />
                <UserButton />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <div className="flex flex-col gap-6">
            {/* Mobile Header */}
            <header className="flex items-center justify-between md:hidden">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-foreground">
                  <FolderOpen className="size-4 text-background" />
                </div>
                <span className="text-lg font-semibold tracking-tight">Collectr</span>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggleButton />
                <UserButton />
              </div>
            </header>

            {children}
          </div>
        </main>
      </div>

      {/* Mobile Dock */}
      <div className="fixed inset-x-0 bottom-0 z-30 p-4 md:hidden">
        <div className="app-dock mx-auto flex w-full max-w-sm items-center gap-1 rounded-2xl p-1.5">
          <Button
            asChild
            variant="ghost"
            className={cn(
              "h-12 flex-1 gap-2 rounded-xl text-sm font-medium text-muted-foreground",
              !currentFolderId && "bg-foreground text-background hover:bg-foreground hover:text-background"
            )}
          >
            <Link to="/" onClick={() => setActivePanel(null)}>
              <Inbox className="size-4" />
              <span>Inbox</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-12 flex-1 gap-2 rounded-xl text-sm font-medium text-muted-foreground",
              (Boolean(currentFolderId) || activePanel === "folders") &&
                "bg-foreground text-background hover:bg-foreground hover:text-background"
            )}
            onClick={() => setActivePanel("folders")}
          >
            <FolderOpen className="size-4" />
            <span>Folders</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            className={cn(
              "h-12 flex-1 gap-2 rounded-xl text-sm font-medium text-muted-foreground",
              activePanel === "settings" &&
                "bg-foreground text-background hover:bg-foreground hover:text-background"
            )}
            onClick={() => setActivePanel("settings")}
          >
            <Settings className="size-4" />
            <span>Settings</span>
          </Button>
        </div>
      </div>

      {activePanel === "folders" ? (
        <AppSheet
          title="Folders"
          description="Jump between collections without reaching for the top of the screen."
          mobileOnly
          onClose={() => setActivePanel(null)}
        >
          <div className="max-h-[62vh] overflow-y-auto pr-1">
            <FolderTree
              currentFolderId={currentFolderId}
              onNavigate={() => setActivePanel(null)}
            />
          </div>
        </AppSheet>
      ) : null}

      {activePanel === "settings" ? (
        <AppSheet
          title="Settings"
          description="Tune the workspace and keep the app comfortable in any light."
          onClose={() => setActivePanel(null)}
        >
          <SettingsPanel onClose={() => setActivePanel(null)} />
        </AppSheet>
      ) : null}
    </div>
  );
}

function AppSheet({
  title,
  description,
  mobileOnly,
  onClose,
  children,
}: AppSheetProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex items-end bg-foreground/20 backdrop-blur-sm",
        mobileOnly ? "md:hidden" : "md:items-stretch md:justify-end"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "app-sheet w-full rounded-t-2xl border border-border p-6 shadow-xl",
          mobileOnly
            ? "max-h-[80vh]"
            : "max-h-[80vh] md:h-full md:max-h-none md:max-w-md md:rounded-none md:rounded-l-2xl"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}

function SettingsPanel({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { data: sessionData } = authClient.useSession();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const user = sessionData?.user;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      onClose();
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error("Failed to sign out", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Appearance */}
      <section className="rounded-xl border border-border bg-background p-4">
        <p className="text-sm font-medium">Appearance</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your preferred theme.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition",
                theme === option.value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground/20 hover:bg-accent"
              )}
              onClick={() => setTheme(option.value)}
            >
              <option.icon className="size-4" />
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Currently using {resolvedTheme} mode.
        </p>
      </section>

      {/* Account */}
      <section className="rounded-xl border border-border bg-background p-4">
        <p className="text-sm font-medium">Account</p>

        {user ? (
          <div className="mt-3 flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
              <AvatarFallback className="bg-muted text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to="/" onClick={onClose}>
              <Inbox className="size-4" />
              <span>Inbox</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            <span>Log out</span>
          </Button>
        </div>
      </section>
    </div>
  );
}
