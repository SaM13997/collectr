import { MoonStar, SunMedium } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

interface UserButtonProps {
  className?: string;
}

export function UserButton({ className }: UserButtonProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { resolvedTheme, setTheme } = useTheme();

  if (isPending) {
    return (
      <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
    );
  }

  if (!session) {
    return null;
  }

  const user = session.user;
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleSignOut = async () => {
    await authClient.signOut();
    router.navigate({ to: "/" });
  };

  const isDark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative rounded-full border border-border/70 bg-background/70 p-0 shadow-sm transition-colors duration-150 ease-[var(--ease-out)] active:scale-[0.95]",
            className
          )}
        >
          <Avatar className={cn("h-10 w-10", className)}>
            <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
            <AvatarFallback className="bg-brand/12 text-brand">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="cursor-pointer"
        >
          {isDark ? (
            <SunMedium className="mr-2 size-4" />
          ) : (
            <MoonStar className="mr-2 size-4" />
          )}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          variant="destructive"
          className="cursor-pointer"
        >
          <LogOut className="mr-2 size-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
