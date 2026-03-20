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
  nextPath = "/generation",
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
    const absoluteNext = `${window.location.origin}${safeNextPath}`;
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(
      absoluteNext
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
      {loading ? "Redirecting..." : label}
    </Button>
  );
}
