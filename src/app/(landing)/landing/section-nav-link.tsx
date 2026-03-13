"use client";

import { type ReactNode } from "react";

type SectionNavLinkProps = {
  targetId: string;
  className?: string;
  children: ReactNode;
};

export default function SectionNavLink({ targetId, className, children }: SectionNavLinkProps) {
  const href = `#${targetId}`;

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        event.preventDefault();

        const section = document.getElementById(targetId);
        if (!section) return;

        section.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.replaceState(null, "", href);
      }}
    >
      {children}
    </a>
  );
}
