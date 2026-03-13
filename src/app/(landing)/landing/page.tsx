import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
  { label: "Product", href: "#features" },
  { label: "Use Cases", href: "#features" },
  { label: "Pricing", href: "#features" },
];

const featureCards = [
  {
    title: "Generate High-Performing Ad Creatives",
    description:
      "Create conversion-focused banners and copy variants for every campaign objective in minutes.",
    image:
      "https://picsum.photos/seed/creative-ads/900/560",
    cta: "Create Ad Creative",
  },
  {
    title: "AI Product Photography Delivered in Seconds",
    description:
      "Turn product references into polished lifestyle and studio-style visuals ready for launch.",
    image:
      "https://picsum.photos/seed/product-photo/900/560",
    cta: "Generate Product Shots",
  },
  {
    title: "AI Video Ads for Products",
    description:
      "Produce short product videos with compelling hooks, scenes, and branded messaging instantly.",
    image:
      "https://picsum.photos/seed/video-ads/900/560",
    cta: "Build Video Ad",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#ffe2b8_0%,transparent_28%),radial-gradient(circle_at_100%_0%,#c2f1e4_0%,transparent_28%),var(--background)]">
      <header className="fixed top-0 right-0 left-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="size-8 rounded-md bg-black text-center text-sm leading-8 font-semibold text-white">
              Y
            </div>
            <span className="text-sm font-semibold tracking-wide">Yellow Pixel</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="https://app.yellowpixel.io/login"
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-5 pt-28 pb-14 md:px-8 md:pt-32">
        <section className="rounded-2xl border border-border bg-card/90 p-7 md:p-10">
          <div className="max-w-3xl space-y-5">
            <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-6xl">
              #1 most used AI tool for advertising
            </h1>

            <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
              Generate ad banners, texts, photoshoots, and videos that outperform those of your
              competitors.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Button type="button" variant="outline" disabled>
                Start Free with Google
              </Button>
              <Link
                href="https://app.yellowpixel.io"
                className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
              >
                Try For Free Now
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {featureCards.map((feature) => (
            <Card key={feature.title} className="overflow-hidden border-border/80 bg-card/95">
              <div className="aspect-[16/10] overflow-hidden border-b border-border">
                <img src={feature.image} alt={feature.title} className="h-full w-full object-cover" />
              </div>
              <CardHeader className="space-y-2">
                <CardTitle className="text-lg leading-tight">{feature.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link
                  href="https://app.yellowpixel.io"
                  className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground"
                >
                  {feature.cta}
                </Link>
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
