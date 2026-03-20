"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import GoogleLoginButton from "./google-login-button";

type LoginModalTriggerProps = {
  label: ReactNode;
  nextPath?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  className?: string;
};

export default function LoginModalTrigger({
  label,
  nextPath = "/template",
  variant = "default",
  size = "default",
  className,
}: LoginModalTriggerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const safeNextPath = useMemo(() => {
    return nextPath.startsWith("/") ? nextPath : "/template";
  }, [nextPath]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>

      {open && mounted
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm md:p-5"
              role="dialog"
              aria-modal="true"
              aria-label="Sign in to Yellow Pixel"
              onClick={() => setOpen(false)}
            >
              <div
                className={cn(
                  "relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border/70 bg-white shadow-2xl",
                  "md:grid md:grid-cols-[minmax(260px,1fr)_minmax(360px,1.2fr)]"
                )}
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute right-4 top-4 z-10 rounded-full p-1 text-gray-400 transition-colors hover:text-gray-700"
                  aria-label="Close login popup"
                >
                  <X className="size-5" />
                </button>

                <div className="relative hidden min-h-[460px] overflow-hidden bg-[#070d1b] p-7 text-white md:flex">
                  <div className="absolute -left-20 top-16 h-[460px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(61,139,255,0.6)_0%,_rgba(61,139,255,0)_70%)] blur-2xl" />
                  <div className="absolute bottom-0 left-8 h-[360px] w-[220px] rounded-[120px] border border-[#69abff]/40 bg-[linear-gradient(180deg,rgba(50,126,255,0.18),rgba(20,70,170,0.28))] shadow-[0_0_48px_rgba(42,126,255,0.45)]" />
                  <div className="relative mt-10 max-w-[260px] space-y-4">
                    <p className="text-2xl leading-none text-white/65">&ldquo;</p>
                    <p className="text-[29px] font-semibold leading-tight">
                      Meet your dedicated AI design assistant for e-commerce.
                    </p>
                    <p className="text-sm leading-relaxed text-white/78">
                      Crafted for professionals who seek faster launches, stronger presentation, and higher
                      profitability.
                    </p>
                  </div>
                </div>

                <div className="flex min-h-[460px] flex-col justify-center bg-[#f7f7f8] px-6 py-12 md:px-16">
                  <div className="mx-auto w-full max-w-sm space-y-5">
                    <div className="space-y-2">
                      <h3 className="text-3xl font-bold leading-tight text-[#10111a]">
                        Create stunning designs for Free
                      </h3>
                      <p className="text-sm text-[#545768]">Sign up or log in to keep designing. Start now!</p>
                    </div>

                    <GoogleLoginButton
                      nextPath={safeNextPath}
                      label="Continue with Google"
                      variant="outline"
                      size="lg"
                      className="h-11 w-full justify-center border-[#d6dae3] bg-white text-[#141826] hover:bg-[#f7f9fc]"
                    />

                    <p className="pt-16 text-center text-xs leading-relaxed text-[#666a79]">
                      By continuing, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
