import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuthSession } from "@/lib/use-auth-session";
import { AppLayout } from "@/components/layout/AppLayout";
import { CollectionCard } from "@/components/collection-card";
import { FolderOpen } from "lucide-react";
import { PageSkeleton } from "@/components/skeletons";

export const Route = createFileRoute("/collections")({
  component: CollectionsPage,
});

function CollectionsPage() {
  const { session, isPending } = useAuthSession();

  if (isPending) {
    return <PageSkeleton />;
  }

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 text-foreground">
        <div className="text-center">
          <p className="text-muted-foreground">Sign in to view your collections.</p>
          <Link to="/login" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return <CollectionsView />;
}

function CollectionsView() {
  const folderData = useQuery(api.folders.listTree);
  const collections = folderData?.folders ?? [];

  return (
    <AppLayout title="Collections">
      {folderData === undefined ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-[191.6px] animate-pulse rounded-xl border border-border bg-card"
            >
              <div className="h-[60%] w-full animate-pulse bg-muted" />
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-4 shrink-0 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
            <FolderOpen className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            No collections yet
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Save a link and organize it into a collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {collections.map((folder, i) => (
            <div key={folder._id} className="stagger-item" style={{ "--i": i } as React.CSSProperties}>
              <CollectionCard
                id={folder._id}
                name={folder.name}
                itemCount={folder.tweetCount}
              />
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
