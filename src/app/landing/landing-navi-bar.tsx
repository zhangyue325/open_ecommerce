import Link from "next/link";
import { Card } from "@/components/ui/card";
import LoginModalTrigger from "../login/login-modal-trigger";
import { landingNavItems, type LandingNavItem } from "./landing-nav-items";
import SectionNavLink from "./section-nav-link";

type LandingNaviBarProps = {
  currentPage?: "landing" | "solution";
};

function isPageLink(item: LandingNavItem): item is Extract<LandingNavItem, { href: string }> {
  return "href" in item;
}

export default function LandingNaviBar({ currentPage = "landing" }: LandingNaviBarProps) {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto w-full max-w-6xl px-5 pt-4 md:px-8">
          <Card className="rounded-2xl border border-border/80 bg-card/90 px-4 py-3 shadow-sm backdrop-blur-xl md:px-6">
            <div className="flex items-center justify-between">
              <Link href="/landing" className="flex items-center gap-3">
                <div className="size-8 rounded-md bg-black text-center text-sm font-semibold leading-8 text-white">
                  Y
                </div>
                <span className="text-sm font-semibold tracking-wide">Yellow Pixel</span>
              </Link>

              <nav className="hidden items-center gap-6 md:flex">
                {landingNavItems.map((item) => (
                  isPageLink(item) ? (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={
                        item.href === "/solution" && currentPage === "solution"
                          ? "text-sm font-semibold text-foreground"
                          : "text-sm text-muted-foreground transition-colors hover:text-foreground"
                      }
                    >
                      {item.label}
                    </Link>
                  ) : (
                    currentPage === "landing" ? (
                      <SectionNavLink
                        key={item.label}
                        targetId={item.targetId}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </SectionNavLink>
                    ) : (
                      <Link
                        key={item.label}
                        href={`/landing#${item.targetId}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    )
                  )
                ))}
              </nav>

              <LoginModalTrigger label="Login" variant="outline" size="sm" className="px-3" />
            </div>
          </Card>
        </div>
      </header>

      <div aria-hidden className="h-20" />
    </>
  );
}
