"use client";

import { useState } from "react";

import { createClient } from "../../../lib/supabase/client";
import { Button } from "@/components/ui/button";

type GoogleLoginButtonProps = {
  nextPath?: string;
  label?: string;
};

export default function GoogleLoginButton({
  nextPath = "/template",
  label = "Continue with Google",
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setLoading(true);
    const supabase = createClient();
    const absoluteNext = `${window.location.origin}${nextPath}`;
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
    <Button type="button" onClick={onLogin} disabled={loading}>
      {loading ? "Redirecting..." : label}
    </Button>
  );
}
