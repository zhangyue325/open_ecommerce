import { landingNavItems } from "./landing-nav-items";
import SectionNavLink from "./section-nav-link";

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full px-5 pb-8 md:px-8 md:pb-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 border-t border-border/80 py-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tracking-wide">Yellow Pixel</span>
          </div>
          <p className="text-xs text-muted-foreground">(c) {currentYear} Yellow Pixel. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
