import { AppLayout } from "@/components/layout/AppLayout";

export function PageSkeleton() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

export function InspectorSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="flex items-center gap-2">
          <div className="size-8 animate-pulse rounded bg-muted" />
          <div className="size-8 animate-pulse rounded bg-muted md:hidden" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-8 space-y-4">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function FolderPickerSkeleton() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-[1.5rem] border border-border/70 bg-card/90 p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          <div className="size-8 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-11 w-full animate-pulse rounded-[1rem] bg-muted"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
