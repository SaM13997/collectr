import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppShell } from "@/components/app-shell";
import { ThemeSetting, useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { LogOut, Monitor, MoonStar, SunMedium, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
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

function ProfilePage() {
  const { session, isPending } = useAuthSession();

  if (isPending) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-foreground">
        <div className="text-center">
          <p className="text-muted-foreground">Sign in to view your profile.</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return <ProfileView />;
}

function ProfileView() {
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
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error("Failed to sign out", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <AppShell title="Profile">
      {/* User Info */}
      <div className="slide-up flex items-center gap-4 rounded-2xl bg-surface p-5">
        <Avatar className="size-14">
          <AvatarImage src={user?.image ?? ""} alt={user?.name ?? "User"} />
          <AvatarFallback className="bg-brand/12 text-sm font-semibold text-brand">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold">{user?.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      {/* Theme */}
      <section className="slide-up mt-4 rounded-2xl bg-surface p-5" style={{ animationDelay: "50ms" }}>
        <p className="text-sm font-semibold">Appearance</p>
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

      {/* Sign Out */}
      <div className="slide-up mt-4" style={{ animationDelay: "100ms" }}>
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
    </AppShell>
  );
}
