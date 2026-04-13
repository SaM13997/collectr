import { createFileRoute } from "@tanstack/react-router";
import { LoginForm } from "@/components/login-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 text-foreground">
      <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card/75 p-6 shadow-[0_24px_80px_color-mix(in_oklch,var(--foreground)_10%,transparent)] backdrop-blur sm:p-8">
        <LoginForm />
      </div>
    </main>
  );
}
