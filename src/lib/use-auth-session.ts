import { useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type Session = NonNullable<ReturnType<typeof authClient.useSession>["data"]>["session"];

let hasResolvedSession = false;
let lastResolvedSession: Session | null = null;

export function useAuthSession() {
  const { data: sessionData, isPending, error } = authClient.useSession();
  const hadSession = useRef(false);
  const resolvedSession = sessionData?.session ?? null;

  useEffect(() => {
    if (isPending) return;

    hasResolvedSession = true;
    lastResolvedSession = resolvedSession;
  }, [isPending, resolvedSession]);

  const session = isPending && hasResolvedSession ? lastResolvedSession : resolvedSession;
  const shouldShowPending = isPending && !hasResolvedSession;

  useEffect(() => {
    if (resolvedSession) {
      hadSession.current = true;
    }
  }, [resolvedSession]);

  useEffect(() => {
    if (isPending) return;

    if (!resolvedSession && hadSession.current) {
      toast.error("Session expired", {
        description: "Please sign in again to continue.",
      });
      hadSession.current = false;
    }
  }, [isPending, resolvedSession]);

  useEffect(() => {
    if (error && hadSession.current) {
      toast.error("Auth error", {
        description: error.message ?? "Failed to verify your session.",
      });
    }
  }, [error]);

  return { session, isPending: shouldShowPending };
}
