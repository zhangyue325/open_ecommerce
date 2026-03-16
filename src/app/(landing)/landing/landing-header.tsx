import Link from "next/link";
import { landingNavItems } from "./landing-nav-items";
import SectionNavLink from "./section-nav-link";

export default function LandingHeader() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto w-full max-w-6xl px-5 pt-4 md:px-8">
          <div className="flex h-16 items-center justify-between rounded-2xl border border-border/80 bg-card/90 px-4 shadow-sm backdrop-blur-xl md:px-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="size-8 rounded-md bg-black text-center text-sm leading-8 font-semibold text-white">
                Y
              </div>
              <span className="text-sm font-semibold tracking-wide">Yellow Pixel</span>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              {landingNavItems.map((item) => (
                <SectionNavLink
                  key={item.label}
                  targetId={item.targetId}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {item.label}
                </SectionNavLink>
              ))}
            </nav>

            <Link
              href="https://app.yellowpixel.io/login"
              className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <div aria-hidden className="h-20" />
    </>
  );
}
