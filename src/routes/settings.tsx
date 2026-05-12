import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeSetting, useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { usePwaInstall } from "@/lib/use-pwa-install";
import {
  ArrowLeft,
  Download,
  LogOut,
  Monitor,
  MoonStar,
  Settings,
  SunMedium,
  User,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

type ThemeOption = {
  value: ThemeSetting;
  label: string;
  icon: LucideIcon;
};

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light", icon: SunMedium },
  { value: "dark", label: "Dark", icon: MoonStar },
  { value: "system", label: "System", icon: Monitor },
];

function SettingsPage() {
  const { session, isPending } = useAuthSession();
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { isInstallable, isInstalled, promptInstall } = usePwaInstall();

  if (isPending) {
    return <PageSkeleton />;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-foreground">
        <div className="text-center">
          <p className="text-muted-foreground">Sign in to view settings.</p>
          <Link
            to="/login"
            className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error("Failed to sign out", {
        description:
          err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <AppLayout
      title="Settings"
      backButton={
        <Link
          to="/profile"
          className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      }
    >
      <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
        {/* Appearance */}
        <section className="slide-up rounded-2xl bg-surface p-5">
          <div className="flex items-center gap-2">
            <Settings className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Appearance</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose your preferred theme.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "pressable flex flex-col items-center gap-2 rounded-xl border p-3.5 text-center transition-colors",
                  theme === option.value
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border text-muted-foreground hover:border-foreground/20 hover:bg-accent hover:text-foreground"
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

        {/* App Install */}
        <section
          className="slide-up mt-4 rounded-2xl bg-surface p-5"
          style={{ animationDelay: "50ms" }}
        >
          <div className="flex items-center gap-2">
            <Download className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold">App</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Install Collectr as an app on your device.
          </p>

          <div className="mt-4">
            {isInstallable ? (
              <Button
                type="button"
                className="pressable h-11 w-full justify-center gap-2 rounded-xl bg-ink text-sage-deep hover:bg-ink/90 dark:bg-primary dark:text-primary-foreground font-semibold"
                onClick={promptInstall}
              >
                <Download className="size-4" />
                Install Collectr
              </Button>
            ) : isInstalled ? (
              <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm text-muted-foreground">
                <Download className="size-4" />
                App installed
              </div>
            ) : (
              <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm text-muted-foreground">
                <Download className="size-4" />
                Installation unavailable in this browser
              </div>
            )}
          </div>
        </section>

        {/* Profile Link */}
        <section
          className="slide-up mt-4 rounded-2xl bg-surface p-5"
          style={{ animationDelay: "100ms" }}
        >
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <p className="text-sm font-semibold">Account</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, exports, and integrations.
          </p>

          <div className="mt-4">
            <Link to="/profile">
              <Button
                type="button"
                variant="outline"
                className="pressable h-11 w-full justify-center gap-2 rounded-xl text-xs"
              >
                <User className="size-4" />
                Go to Profile
              </Button>
            </Link>
          </div>
        </section>

        {/* Sign Out */}
        <div className="slide-up mt-4" style={{ animationDelay: "150ms" }}>
          <Button
            type="button"
            variant="outline"
            className="pressable h-12 w-full justify-center gap-2 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            <span>Sign out</span>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
