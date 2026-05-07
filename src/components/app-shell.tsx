import { type ReactNode, useEffect, useRef, useState, lazy, Suspense } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Bookmark,
  ChevronLeft,
  LogOut,
  Monitor,
  MoonStar,
  Plus,
  Settings,
  SunMedium,
  X,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { ThemeSetting, useTheme } from "@/components/theme-provider";
import { UserButton } from "@/components/User-button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useDialogFocus } from "@/lib/use-dialog-focus";
const AddTweetForm = lazy(() =>
  import("./add-tweet-form").then((m) => ({ default: m.AddTweetForm }))
);
const FamilyDrawerRoot = lazy(() =>
  import("@/components/ui/family-drawer").then((m) => ({
    default: m.FamilyDrawerRoot,
  }))
);
const FamilyDrawerPortal = lazy(() =>
  import("@/components/ui/family-drawer").then((m) => ({
    default: m.FamilyDrawerPortal,
  }))
);
const FamilyDrawerOverlay = lazy(() =>
  import("@/components/ui/family-drawer").then((m) => ({
    default: m.FamilyDrawerOverlay,
  }))
);
const FamilyDrawerContent = lazy(() =>
  import("@/components/ui/family-drawer").then((m) => ({
    default: m.FamilyDrawerContent,
  }))
);
const FamilyDrawerAnimatedWrapper = lazy(() =>
  import("@/components/ui/family-drawer").then((m) => ({
    default: m.FamilyDrawerAnimatedWrapper,
  }))
);
const FamilyDrawerAnimatedContent = lazy(() =>
  import("@/components/ui/family-drawer").then((m) => ({
    default: m.FamilyDrawerAnimatedContent,
  }))
);
const CollectButton = lazy(() =>
  import("@/components/collect-button").then((m) => ({
    default: m.CollectButton,
  }))
);

type AppShellProps = {
  children: ReactNode;
  title?: string;
  backButton?: ReactNode;
};

type ActivePanel = "settings" | "add" | null;

type AppSheetProps = {
  title: string;
  description?: string;
  variant?: "mobile-only" | "responsive";
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

export function AppShell({
  children,
  title,
  backButton,
}: AppShellProps) {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  return (
    <>
      <div className="min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="fixed left-0 top-0 hidden h-full w-56 flex-col border-r border-border bg-background md:flex">
          <div className="flex flex-1 flex-col gap-6 p-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 px-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-foreground">
                <Bookmark className="size-4 text-background" />
              </div>
              <span className="text-lg font-semibold tracking-tight">
                Collectr
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex flex-col gap-1">
              <Link
                to="/"
                className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-foreground transition hover:bg-accent"
              >
                <Bookmark className="size-4" />
                <span>Saved</span>
              </Link>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-2 border-t border-border p-4">
            <Button
              type="button"
              variant="ghost"
              className="h-10 justify-start gap-3 px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setActivePanel("settings")}
            >
              <Settings className="size-4" />
              <span>Settings</span>
            </Button>
            <div className="flex items-center gap-2 px-3">
              <ThemeToggleButton />
              <UserButton />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 md:pl-56">
          <div className="mx-auto max-w-3xl px-4 pb-28 pt-4 md:px-8 md:pb-8 md:pt-8">
            {/* Mobile Header */}
            <header className="mb-6 flex items-center justify-between md:hidden">
              <div className="flex items-center gap-3">
                {backButton}
                <h1 className="text-xl font-semibold tracking-tight">
                  {title ?? "Saved"}
                </h1>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-11"
                onClick={() => setActivePanel("settings")}
                aria-label="Settings"
              >
                <Settings className="size-5" />
              </Button>
            </header>

            {/* Desktop Header */}
            <header className="mb-6 hidden items-center justify-between md:flex">
              <h1 className="text-2xl font-semibold tracking-tight">
                {title ?? "Saved"}
              </h1>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setActivePanel("add")}
              >
                <Plus className="size-4" />
                <span>Add link</span>
              </Button>
            </header>

            {children}
          </div>
        </main>

        {/* Desktop Add Drawer */}
        {activePanel === "add" ? (
          <Suspense fallback={null}>
            <div className="hidden md:block">
              <FamilyDrawerRoot
                open={activePanel === "add"}
                onOpenChange={(open) => {
                  if (!open) setActivePanel(null);
                }}
              >
                <AddLinkDrawer onClose={() => setActivePanel(null)} />
              </FamilyDrawerRoot>
            </div>
          </Suspense>
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
      <Suspense fallback={null}>
        <CollectButton />
      </Suspense>
    </>
  );
}

function AddLinkDrawer({ onClose }: { onClose: () => void }) {
  return (
    <FamilyDrawerPortal>
      <FamilyDrawerOverlay onClick={onClose} className="z-40" />
      <FamilyDrawerContent className="z-40 bg-card md:right-4 md:left-auto md:mx-0 md:max-w-md md:rounded-[24px]">
        <FamilyDrawerAnimatedWrapper>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Add link</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste a tweet or X post URL to save it.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
          <FamilyDrawerAnimatedContent>
            <div className="pb-4">
              <AddTweetForm folderId={null} onAdded={onClose} />
            </div>
          </FamilyDrawerAnimatedContent>
        </FamilyDrawerAnimatedWrapper>
      </FamilyDrawerContent>
    </FamilyDrawerPortal>
  );
}

function AppSheet({
  title,
  description,
  variant = "responsive",
  onClose,
  children,
}: AppSheetProps) {
  const isMobileOnly = variant === "mobile-only";
  const containerRef = useRef<HTMLDivElement>(null);
  useDialogFocus(true, containerRef);

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
        isMobileOnly ? "md:hidden" : "md:items-stretch md:justify-end"
      )}
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className={cn(
          "app-sheet w-full rounded-t-2xl border border-border p-6 shadow-xl",
          isMobileOnly
            ? "max-h-[80vh]"
            : "max-h-[80vh] md:h-full md:max-h-none md:max-w-md md:rounded-none md:rounded-l-2xl"
        )}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 rounded-lg"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function BackButton({
  onClick,
  "aria-label": ariaLabel = "Go back",
}: {
  onClick: () => void;
  "aria-label"?: string;
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-11"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      <ChevronLeft className="size-5" />
    </Button>
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
        description:
          err instanceof Error ? err.message : "Something went wrong.",
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
              aria-pressed={theme === option.value}
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
              <AvatarFallback className="bg-muted text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to="/" onClick={onClose}>
              <Bookmark className="size-4" />
              <span>Saved</span>
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
