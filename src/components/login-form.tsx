import { FolderTree } from "lucide-react";

import { useState, type ComponentProps, type FormEvent } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Wrong email or password.",
  INVALID_PASSWORD: "Wrong email or password.",
  INVALID_EMAIL: "Wrong email or password.",
  USER_NOT_FOUND: "Wrong email or password.",
  FAILED_TO_CREATE_USER: "Could not create your account. Please try again.",
  FAILED_TO_CREATE_SESSION: "Could not create a session. Please try again.",
  INVALID_TOKEN: "Your session is invalid. Please sign in again.",
  EMAIL_NOT_VERIFIED: "Please verify your email before signing in.",
  USER_ALREADY_EXISTS: "An account with this email already exists.",
};

const AUTH_MESSAGE_MAP: Record<string, string> = {
  "Invalid email or password": "Wrong email or password.",
  "Invalid password": "Wrong email or password.",
  "Invalid email": "Wrong email or password.",
  "User not found": "Wrong email or password.",
  "User already exists": "An account with this email already exists.",
  "Failed to create session": "Could not create a session. Please try again.",
  "Failed to create user": "Could not create your account. Please try again.",
};

function getAuthErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.length > 0) {
    return AUTH_MESSAGE_MAP[error] ?? error;
  }

  if (error && typeof error === "object") {
    if ("code" in error && typeof error.code === "string" && error.code in AUTH_ERROR_MESSAGES) {
      return AUTH_ERROR_MESSAGES[error.code];
    }

    if (
      "message" in error &&
      typeof error.message === "string" &&
      error.message.length > 0
    ) {
      return AUTH_MESSAGE_MAP[error.message] ?? error.message;
    }

    if ("error" in error && error.error !== error) {
      const nestedMessage = getAuthErrorMessage(error.error);
      if (nestedMessage !== "Authentication failed.") {
        return nestedMessage;
      }
    }

    if ("cause" in error && error.cause !== error) {
      const nestedMessage = getAuthErrorMessage(error.cause);
      if (nestedMessage !== "Authentication failed.") {
        return nestedMessage;
      }
    }

    if ("status" in error && typeof error.status === "number") {
      if (error.status === 401 || error.status === 403) {
        return "Wrong email or password.";
      }
      if (error.status === 502 || error.status === 503) {
        return "Unable to reach the auth service. Please try again.";
      }
    }

    if (
      "statusText" in error &&
      typeof error.statusText === "string" &&
      error.statusText.length > 0
    ) {
      return error.statusText;
    }
  }

  return "Authentication failed.";
}

export function LoginForm({
  className,
  ...props
}: ComponentProps<"div">) {
  const router = useRouter();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const navigateAfterAuth = () => {
    const search = router.state.location.search as
      | { redirect?: unknown }
      | undefined;
    const redirect =
      typeof search?.redirect === "string" && search.redirect.length > 0
        ? search.redirect
        : undefined;

    if (redirect) {
      router.history.push(redirect);
    } else {
      router.navigate({ to: "/" });
    }
  };

  const handleEmailSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    const name = formData.get("name");

    if (typeof email !== "string" || email.length === 0) {
      setErrorMessage("Email is required.");
      return;
    }

    if (typeof password !== "string" || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const result =
        mode === "signUp"
          ? await authClient.signUp.email({
              name:
                typeof name === "string" && name.trim().length > 0 ? name : email,
              email,
              password,
            })
          : await authClient.signIn.email({
              email,
              password,
            });

      if (result?.error) {
        throw new Error(getAuthErrorMessage(result.error));
      }

      navigateAfterAuth();
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(
        mode === "signIn" ? "Sign in failed" : "Sign up failed",
        { description: message }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleEmailSignIn}>
        <FieldGroup>
          {/* Logo & Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-foreground">
              <FolderTree className="size-5 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">
                {mode === "signIn" ? "Welcome back" : "Create account"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signIn"
                  ? "Sign in to your account"
                  : "Get started with Collectr"}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          {mode === "signUp" ? (
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" name="name" placeholder="Your name" required />
            </Field>
          ) : null}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </Field>

          {errorMessage ? (
            <p className="text-center text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <Button type="submit" disabled={isSubmitting} className="w-full transition-colors duration-150 ease-[var(--ease-out)]">
            {isSubmitting
              ? "Working..."
              : mode === "signIn"
                ? "Sign in"
                : "Create account"}
          </Button>

          <FieldSeparator />

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signIn" ? "Need an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-foreground underline-offset-2 transition-colors duration-150 ease-[var(--ease-out)] hover:underline active:opacity-70"
              onClick={() => {
                setMode(mode === "signIn" ? "signUp" : "signIn");
                setErrorMessage(null);
              }}
            >
              {mode === "signIn" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </FieldGroup>
      </form>
    </div>
  );
}
