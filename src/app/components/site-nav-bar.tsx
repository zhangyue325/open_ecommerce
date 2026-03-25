"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LoginModalTrigger from "../login/login-modal-trigger";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/landing" },
  { label: "Workspace", href: "/workspace" },
  { label: "Templates", href: "/template" },
];

export default function SiteNavBar() {
  const pathname = usePathname();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
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
          </div>
        </div>
      </header>
      <div aria-hidden className="h-16" />
    </>
  );
}
