"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Generation", href: "/generation" },
  { label: "Template", href: "/template" },
  { label: "Setting", href: "/setting" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="surface-card px-5 py-3 flex flex-wrap items-center gap-3 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">Pazzion Creative Studio</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:ml-6">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                active ? "bg-black text-white" : "bg-[color:var(--surface-2)]"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* <div className="ml-auto flex items-center gap-3 text-xs text-[color:var(--ink-muted)]">
        <button className="rounded-full border border-(--ring) px-3 py-1 text-xs font-semibold">
          Login
        </button>
      </div> */}
    </nav>
  );
}
