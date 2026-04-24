"use client";

import { useState } from "react";

import { createClient } from "../../../lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GoogleLoginButtonProps = {
  nextPath?: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
};

export default function GoogleLoginButton({
  nextPath = "/workspace",
  label = "Continue with Google",
  className,
  variant = "default",
  size = "default",
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const safeNextPath = nextPath.startsWith("/") ? nextPath : "/generation";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      safeNextPath
    )}`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={onLogin}
      disabled={loading}
      variant={variant}
      size={size}
      className={cn(className)}
    >
      {loading ? (
        "Redirecting..."
      ) : (
        <span className="inline-flex items-center gap-3">
          <span>{label}</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 shrink-0">
            <path
              fill="#4285F4"
              d="M21.64 12.2c0-.7-.06-1.37-.18-2.02H12v3.82h5.4a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.75 3-4.34 3-7.35Z"
            />
            <path
              fill="#34A853"
              d="M12 22c2.7 0 4.96-.9 6.62-2.45l-3.24-2.52c-.9.6-2.06.97-3.38.97-2.6 0-4.8-1.75-5.58-4.1H3.08v2.6A10 10 0 0 0 12 22Z"
            />
            <path
              fill="#FBBC05"
              d="M6.42 13.9A5.98 5.98 0 0 1 6.1 12c0-.66.12-1.3.32-1.9V7.5H3.08A10 10 0 0 0 2 12c0 1.6.38 3.12 1.08 4.5l3.34-2.6Z"
            />
            <path
              fill="#EA4335"
              d="M12 5.98c1.46 0 2.78.5 3.82 1.47l2.86-2.86C16.95 2.98 14.7 2 12 2a10 10 0 0 0-8.92 5.5l3.34 2.6c.78-2.35 2.98-4.12 5.58-4.12Z"
            />
          </svg>
        </span>
      )}
    </Button>
  );
}
