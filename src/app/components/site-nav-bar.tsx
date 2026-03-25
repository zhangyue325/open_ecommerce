"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import LoginModalTrigger from "../login/login-modal-trigger";
import { cn } from "@/lib/utils";
import { createClient } from "../../../lib/supabase/client";

const navItems = [
  { label: "Home", href: "/landing" },
  { label: "Workspace", href: "/workspace" },
  { label: "My Brand", href: "/setting" },
];

let cachedAuthUser: User | null | undefined = undefined;

type SiteNavBarProps = {
  mode?: "contained" | "fluid";
};

export default function SiteNavBar({ mode = "contained" }: SiteNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [authUser, setAuthUser] = useState<User | null | undefined>(cachedAuthUser);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (active) {
          const nextUser = !error ? user : null;
          cachedAuthUser = nextUser;
          setAuthUser(nextUser);
        }

        const { data } = supabase.auth.onAuthStateChange(
          (_event: AuthChangeEvent, session: Session | null) => {
            if (!active) return;
            const nextUser = session?.user ?? null;
            cachedAuthUser = nextUser;
            setAuthUser(nextUser);
          }
        );

        unsubscribe = () => data.subscription.unsubscribe();
      } catch {
        if (active) {
          cachedAuthUser = null;
          setAuthUser(null);
        }
      }
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  const avatarUrl = useMemo(() => {
    if (!authUser) return "";
    const metadata = authUser.user_metadata as Record<string, unknown> | undefined;
    const picture = metadata?.picture;
    const avatar = metadata?.avatar_url;
    if (typeof picture === "string" && picture.trim()) return picture;
    if (typeof avatar === "string" && avatar.trim()) return avatar;
    return "";
  }, [authUser]);

  const avatarFallback = useMemo(() => {
    if (!authUser) return "U";
    const metadata = authUser.user_metadata as Record<string, unknown> | undefined;
    const fullName = typeof metadata?.full_name === "string" ? metadata.full_name.trim() : "";
    if (fullName) {
      const tokens = fullName.split(/\s+/).slice(0, 2);
      return tokens.map((item) => item[0]?.toUpperCase() ?? "").join("") || "U";
    }
    return authUser.email?.[0]?.toUpperCase() ?? "U";
  }, [authUser]);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const onMouseDown = (event: MouseEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

  const onLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      cachedAuthUser = null;
      setAuthUser(null);
      setAccountMenuOpen(false);
      router.replace("/landing");
      router.refresh();
    } catch {
      setAccountMenuOpen(false);
    }
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div
          className={cn(
            "flex h-16 w-full items-center justify-between",
            mode === "contained" && "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
            mode === "fluid" && "px-3 sm:px-4 lg:px-4"
          )}
        >
          <Link href="/landing" className="flex items-center gap-2.5">
            <span className="inline-flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 text-sm font-black text-black">
              OE
            </span>
            <span className="text-sm font-semibold tracking-wide text-white">Open Ecommerce</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm text-zinc-400 md:flex">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("transition-colors hover:text-white", active && "text-white")}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {authUser ? (
              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((open) => !open)}
                  className="inline-flex size-8 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 text-xs font-semibold text-white"
                  aria-label="Open account menu"
                  title={authUser.email ?? "Account"}
                  aria-expanded={accountMenuOpen}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="User avatar" className="size-full object-cover" />
                  ) : (
                    <span>{avatarFallback}</span>
                  )}
                </button>

                {accountMenuOpen ? (
                  <div className="absolute right-0 top-full z-[60] mt-2 w-52 rounded-xl border border-white/15 bg-[#0a0d12] p-2 shadow-2xl">
                    <div className="flex flex-col gap-2">
                      <Link
                        href="/setting"
                        onClick={() => setAccountMenuOpen(false)}
                        className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs font-medium text-zinc-100 transition hover:bg-white/10"
                      >
                        My Brand
                      </Link>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs font-medium text-zinc-100 transition hover:bg-white/10"
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : authUser === undefined ? (
              <div className="h-8 w-28" aria-hidden />
            ) : (
              <>
                <LoginModalTrigger
                  label="Login"
                  variant="outline"
                  size="sm"
                  className="border-white/20 bg-white/0 text-white hover:bg-white/10"
                />
                <LoginModalTrigger
                  label="Start for Free"
                  nextPath="/workspace"
                  size="sm"
                  className="bg-emerald-400 px-3 font-semibold text-black hover:bg-emerald-300"
                />
              </>
            )}
          </div>
        </div>
      </header>
      <div aria-hidden className="h-16" />
    </>
  );
}
