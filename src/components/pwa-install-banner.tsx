import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/lib/use-pwa-install";

export function PwaInstallBanner() {
  const { isInstallable, promptInstall, dismiss } = usePwaInstall();

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 shadow-lg md:bottom-4 md:left-auto md:right-4 md:w-96 md:rounded-2xl md:border">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium">Install Collectr</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Add to your home screen for quick access and offline support.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            className="h-8 rounded-full bg-ink text-sage-deep hover:bg-ink/90 dark:bg-primary dark:text-primary-foreground font-semibold text-xs"
            onClick={promptInstall}
          >
            <Download className="mr-1 size-3.5" />
            Install
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={dismiss}
            aria-label="Dismiss"
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
