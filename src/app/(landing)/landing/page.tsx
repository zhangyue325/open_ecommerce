import Link from "next/link";
import AnimatedHeroHeadline from "./animated-hero-headline";
import SectionNavLink from "./section-nav-link";

const navItems = [
  { label: "Features", targetId: "features" },
  { label: "Demo Store", targetId: "demo-store" },
];

const demoAccounts = [
  {
    brand: "Adidas",
    description: "",
    logo: "https://anoreatdtemjsoyrjlnk.supabase.co/storage/v1/object/public/logo/pazzion.png",
    image: "https://picsum.photos/seed/demo-adidas/900/560",
    href: "https://app.yellowpixel.io/login?demo=adidas",
  },
  {
    brand: "COS",
    description: "",
    logo: "https://anoreatdtemjsoyrjlnk.supabase.co/storage/v1/object/public/logo/pazzion.png",
    image: "https://picsum.photos/seed/demo-cos/900/560",
    href: "https://app.yellowpixel.io/login?demo=cos",
  },
  {
    brand: "Zara",
    description: "",
    logo: "https://anoreatdtemjsoyrjlnk.supabase.co/storage/v1/object/public/logo/pazzion.png",
    image: "https://picsum.photos/seed/demo-zara/900/560",
    href: "https://app.yellowpixel.io/login?demo=zara",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#ffe2b8_0%,transparent_28%),radial-gradient(circle_at_100%_0%,#c2f1e4_0%,transparent_28%),var(--background)]">
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
              {navItems.map((item) => (
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

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pt-3 pb-10 md:px-8 md:pt-5 md:pb-12">
        <section className="flex min-h-[calc(100vh-6rem)] items-start">
          <div className="w-full rounded-2xl border border-border/80 bg-card/90 p-7 shadow-sm md:p-12">
            <div className="mx-auto flex max-w-4xl flex-col items-start gap-6 text-left">
              <p className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Built for growth marketers
              </p>

              <AnimatedHeroHeadline />

              <p className="max-w-3xl text-base leading-relaxed text-muted-foreground md:text-lg">
                The easiest way to scale visual content using AI without losing brand integrity.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="https://app.yellowpixel.io/login"
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-medium hover:bg-muted"
                >
                  Start with Google
                </Link>
                <Link
                  href="https://app.yellowpixel.io/login"
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Try for free
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="scroll-mt-28 grid items-center gap-6 rounded-2xl border border-border/80 bg-card/90 p-7 shadow-sm md:grid-cols-2 md:gap-10 md:p-12"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] md:text-4xl">
              Generate High-Performing Ad Creatives
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Turn one idea into multiple ad-ready concepts with strong messaging, fast iteration,
              and visuals optimized for campaign performance.
            </p>
            <Link
              href="https://app.yellowpixel.io/login"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try for free
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
            <img
              src="https://picsum.photos/seed/high-performing-ad/1200/760"
              alt="Sample ad creative preview"
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section className="grid items-center gap-6 rounded-2xl border border-border/80 bg-card/90 p-7 shadow-sm md:grid-cols-2 md:gap-10 md:p-12">
          <div className="overflow-hidden rounded-xl border border-border bg-muted/40">
            <img
              src="https://picsum.photos/seed/product-photography/1200/760"
              alt="Sample AI product photography preview"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] md:text-4xl">
              AI Product Photography Delivered in Seconds
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Upload a product and instantly generate studio-quality shots with polished lighting,
              clean composition, and multiple styles for every campaign channel.
            </p>
            <Link
              href="https://app.yellowpixel.io/login"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try for free
            </Link>
          </div>
        </section>

        <section
          id="demo-store"
          className="scroll-mt-28 rounded-2xl border border-border/80 bg-card/90 p-7 shadow-sm md:p-12"
        >
          <div className="mb-6 space-y-2">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] md:text-4xl">
              Demo Accounts
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {demoAccounts.map((account) => (
              <article
                key={account.brand}
                className="overflow-hidden rounded-xl border border-border bg-background/60"
              >
                <div className="aspect-[16/10] overflow-hidden border-b border-border">
                  <img
                    src={account.image}
                    alt={`${account.brand} demo account preview`}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="space-y-4 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-md border border-border bg-white">
                      <img
                        src={account.logo}
                        alt={`${account.brand} logo`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <h3 className="text-2xl font-semibold tracking-[-0.02em]">{account.brand}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                    {account.description}
                  </p>
                  <Link
                    href={account.href}
                    className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Access {account.brand} demo
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border/80 bg-card/90 p-7 shadow-sm md:p-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] md:text-4xl">
              Scan Your Website to Generate
            </h2>

            <form
              action="https://app.yellowpixel.io/login"
              method="get"
              className="flex flex-col gap-3 md:flex-row"
            >
              <input
                type="url"
                name="website"
                placeholder="https://app.yellowpixel.io/login"
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none ring-0 placeholder:text-muted-foreground/70 focus:border-foreground/40"
                required
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                generate your creatives now
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}


