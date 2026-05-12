import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppLayout } from "@/components/layout/AppLayout";
import { ThemeSetting, useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { flags, isMetadataFetchEnabled } from "@/lib/feature-flags";
import {
  Download,
  FileJson,
  FileSpreadsheet,
  LogOut,
  Monitor,
  MoonStar,
  SunMedium,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRef, useState } from "react";
import { PageSkeleton } from "@/components/skeletons";
import {
  exportAsJson,
  exportAsCsv,
  parseImportJson,
  type ExportItem,
} from "@/lib/export-utils";

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
    return <PageSkeleton />;
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
    <AppLayout title="Profile">
      <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
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

      {/* Integrations */}
      <section className="slide-up mt-4 rounded-2xl bg-surface p-5" style={{ animationDelay: "100ms" }}>
        <p className="text-sm font-semibold">Integrations</p>
        <div className="mt-3 space-y-2">
          {([
            { source: "x", label: "Twitter / X" },
            { source: "reddit", label: "Reddit" },
            { source: "instagram", label: "Instagram" },
          ] as const).map(({ source, label }) => (
            <div key={source} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                isMetadataFetchEnabled(source)
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-muted text-muted-foreground"
              )}>
                {isMetadataFetchEnabled(source) ? "Active" : "Off"}
              </span>
            </div>
          ))}
        </div>

        {flags.enableRedditOAuthSync && <RedditSyncSection />}
      </section>

      {/* Export / Import */}
      <ExportImportSection />

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
      </div>
    </AppLayout>
  );
}

function RedditSyncSection() {
  const redditConnection = useQuery(api.redditSync.getRedditConnection);
  const importSaves = useAction(api.redditSync.importRedditSaves);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const isConnected = redditConnection?.connected === true;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const result = await authClient.oauth2.link({
        providerId: "reddit",
        callbackURL: `${window.location.origin}/profile`,
      });
      if (result.data?.url) {
        window.location.href = result.data.url;
      }
    } catch (err) {
      toast.error("Failed to connect Reddit", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const result = await importSaves({});
      const imported = (result as { imported: number } | null)?.imported ?? 0;
      toast.success(`Imported ${imported} Reddit saves`);
    } catch (err) {
      toast.error("Failed to import Reddit saves", {
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Reddit account</span>
        {isConnected ? (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
            Connected
          </span>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={handleConnect}
            disabled={isConnecting}
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </Button>
        )}
      </div>
      {isConnected && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 w-full text-xs"
          onClick={handleImport}
          disabled={isImporting}
        >
          {isImporting ? "Importing..." : "Import Reddit saves"}
        </Button>
      )}
    </div>
  );
}

function ExportImportSection() {
  const allItems = useQuery(api.items.listAll);
  const importItems = useMutation(api.items.importItems);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJson = () => {
    if (!allItems || allItems.length === 0) {
      toast.error("No items to export");
      return;
    }
    const items: ExportItem[] = allItems.map((item) => ({
      url: item.url,
      canonicalUrl: item.canonicalUrl,
      source: item.source,
      sourceItemId: item.sourceItemId,
      title: item.title,
      description: item.description,
      note: item.note,
      tags: item.tags,
      authorName: item.authorName,
      authorHandle: item.authorHandle,
      text: item.text,
      mediaUrl: item.mediaUrl,
    }));
    exportAsJson(items);
    toast.success(`Exported ${items.length} items as JSON`);
  };

  const handleExportCsv = () => {
    if (!allItems || allItems.length === 0) {
      toast.error("No items to export");
      return;
    }
    const items: ExportItem[] = allItems.map((item) => ({
      url: item.url,
      canonicalUrl: item.canonicalUrl,
      source: item.source,
      sourceItemId: item.sourceItemId,
      title: item.title,
      description: item.description,
      note: item.note,
      tags: item.tags,
      authorName: item.authorName,
      authorHandle: item.authorHandle,
      text: item.text,
      mediaUrl: item.mediaUrl,
    }));
    exportAsCsv(items);
    toast.success(`Exported ${items.length} items as CSV`);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const items = parseImportJson(text);

      if (items.length === 0) {
        toast.error("No valid items found in file");
        return;
      }

      const result = await importItems({ items });
      const r = result as { imported: number; skipped: number };
      toast.success(
        `Imported ${r.imported} items${r.skipped > 0 ? `, ${r.skipped} duplicates skipped` : ""}`
      );
    } catch (err) {
      toast.error("Failed to import file", {
        description: err instanceof Error ? err.message : "Invalid file format",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <section
      className="slide-up mt-4 rounded-2xl bg-surface p-5"
      style={{ animationDelay: "150ms" }}
    >
      <p className="text-sm font-semibold">Export / Import</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Export your saved items or import from a JSON file.
      </p>

      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            className="pressable h-11 justify-center gap-2 rounded-xl text-xs"
            onClick={handleExportJson}
            disabled={!allItems || allItems.length === 0}
          >
            <FileJson className="size-4" />
            <Download className="size-3.5" />
            Export JSON
          </Button>
          <Button
            type="button"
            variant="outline"
            className="pressable h-11 justify-center gap-2 rounded-xl text-xs"
            onClick={handleExportCsv}
            disabled={!allItems || allItems.length === 0}
          >
            <FileSpreadsheet className="size-4" />
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />
        <Button
          type="button"
          variant="outline"
          className="pressable h-11 w-full justify-center gap-2 rounded-xl text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
        >
          <Upload className="size-4" />
          {isImporting ? "Importing..." : "Import from JSON"}
        </Button>
      </div>

      {allItems && (
        <p className="mt-3 text-xs text-muted-foreground">
          {allItems.length} item{allItems.length !== 1 ? "s" : ""} in your collection.
        </p>
      )}
    </section>
  );
}