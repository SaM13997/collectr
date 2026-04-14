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
    <div className="relative min-h-screen text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] gap-4 px-3 pb-24 pt-3 sm:px-4 md:gap-6 md:px-6 md:pb-6 md:pt-4">
        <aside className="hidden w-[308px] shrink-0 md:block">
          <div className="app-panel sticky top-4 flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[1.75rem] p-4">
            <div className="mb-5 flex items-start justify-between gap-3">
              <Link
                to="/"
                className="flex min-w-0 items-center gap-3 rounded-[1.25rem] p-2 transition hover:bg-accent/70"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-brand text-brand-foreground shadow-sm">
                  <FolderOpen className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold tracking-tight">
                    Collectr
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    Pocket archive for sharp links.
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggleButton />
                <UserButton />
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between px-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Library
              </p>
              <p className="text-xs text-muted-foreground">One tap away</p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
              <FolderTree currentFolderId={currentFolderId} />
            </div>

            <div className="mt-4 grid gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 justify-start rounded-[1rem] border-border/70 bg-background/70"
                onClick={() => setActivePanel("settings")}
              >
                <Settings className="size-4 text-brand" />
                <span>Settings</span>
              </Button>

              <div className="rounded-[1.25rem] bg-accent/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-highlight/20 text-highlight">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Built for quick triage
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Desktop keeps folders pinned on the left. Mobile slides them up
                      from the thumb zone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-3xl space-y-4 sm:space-y-5">
            <div className="flex items-center justify-between gap-3 px-1 md:hidden">
              <Link to="/" className="flex min-w-0 items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-[1.1rem] bg-brand text-brand-foreground shadow-sm">
                  <FolderOpen className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-semibold tracking-tight">
                    Collectr
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    Sort links before they disappear.
                  </span>
                </span>
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggleButton />
                <UserButton />
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-30 px-3 md:hidden">
        <div className="app-dock mx-auto flex w-full max-w-md items-center gap-2 rounded-[1.6rem] p-2">
          <Button
            asChild
            variant="ghost"
            className={cn(
              "h-14 flex-1 rounded-[1.15rem] px-4 text-muted-foreground",
              !currentFolderId &&
                "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90 hover:text-brand-foreground"
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
              "h-14 flex-1 rounded-[1.15rem] px-4 text-muted-foreground",
              (Boolean(currentFolderId) || activePanel === "folders") &&
                "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90 hover:text-brand-foreground"
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
              "h-14 flex-1 rounded-[1.15rem] px-4 text-muted-foreground",
              activePanel === "settings" &&
                "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90 hover:text-brand-foreground"
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
        "fixed inset-0 z-40 flex items-end bg-black/25 backdrop-blur-[2px]",
        mobileOnly ? "md:hidden" : "md:items-stretch md:justify-end"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "app-sheet w-full rounded-t-[1.75rem] border border-border/70 px-4 pb-8 pt-4 shadow-2xl",
          mobileOnly
            ? "max-h-[78vh]"
            : "max-h-[78vh] md:h-full md:max-h-none md:max-w-md md:rounded-none md:rounded-l-[1.75rem] md:px-6 md:py-6"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {description}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full"
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
    <div className="space-y-4 md:space-y-5">
      <section className="rounded-[1.5rem] border border-border/70 bg-card/70 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Appearance</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Switch between warm daylight, deep evening, or let the device decide.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "rounded-[1.2rem] border p-3 text-left transition",
                theme === option.value
                  ? "border-brand bg-brand text-brand-foreground shadow-sm"
                  : "border-border bg-background/70 hover:border-brand/25 hover:bg-accent"
              )}
              onClick={() => setTheme(option.value)}
            >
              <option.icon
                className={cn(
                  "size-4",
                  theme === option.value ? "text-brand-foreground" : "text-brand"
                )}
              />
              <p className="mt-3 text-sm font-medium">{option.label}</p>
              <p
                className={cn(
                  "mt-1 text-xs leading-5",
                  theme === option.value
                    ? "text-brand-foreground/80"
                    : "text-muted-foreground"
                )}
              >
                {option.description}
              </p>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          The interface is currently showing in {resolvedTheme} mode.
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-border/70 bg-card/70 p-4">
        <p className="text-sm font-medium">Navigation</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The mobile dock keeps inbox, folders, and settings inside your thumb arc.
        </p>
      </section>

      <section className="rounded-[1.5rem] border border-border/70 bg-card/70 p-4">
        <p className="text-sm font-medium">Account</p>

        {user ? (
          <div className="mt-4 flex items-center gap-3">
            <Avatar className="h-11 w-11 ring-1 ring-border/70">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="flex-1 rounded-full">
            <Link to="/" onClick={onClose}>
              <Inbox className="size-4" />
              <span>Open inbox</span>
            </Link>
          </Button>

          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-full border-destructive/25 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
