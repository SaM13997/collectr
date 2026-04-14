import { useRef, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function useAuthSession() {
  const { data: sessionData, isPending, error } = authClient.useSession();
  const hadSession = useRef(false);
  const session = sessionData?.session ?? null;

  useEffect(() => {
    if (session) {
      hadSession.current = true;
    }
  }, [session]);

  useEffect(() => {
    if (isPending) return;

    if (!session && hadSession.current) {
      toast.error("Session expired", {
        description: "Please sign in again to continue.",
      });
      hadSession.current = false;
    }
  }, [isPending, session]);

  useEffect(() => {
    if (error && hadSession.current) {
      toast.error("Auth error", {
        description: error.message ?? "Failed to verify your session.",
      });
    }
  }, [error]);

  return { session, isPending };
}
