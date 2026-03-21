import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AnimatedHeroHeadline from "./animated-hero-headline";
import LandingFooter from "./landing-footer";
import LoginModalTrigger from "../login/login-modal-trigger";
import LandingNaviBar from "./landing-navi-bar";
import WebsiteScanWizard from "./website-scan-wizard";

type FeatureSection = {
  id?: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
};

type PricingPlan = {
  name: string;
  originalPrice: string;
  betaPrice: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

const featureSections: FeatureSection[] = [
  {
    id: "features",
    title: "Pre-built AI templates to create high-performing ad creatives in seconds",
    description:
      "Turn one idea into multiple ad-ready concepts with strong messaging, fast iteration, and visuals optimized for campaign performance.",
    image: "/feature1.png",
    imageAlt: "Sample ad creative preview",
    reverse: false,
  },
  {
    title: "Generate creatives that follow with your brand guidance",
    description:
      "Turn one idea into multiple ad-ready concepts with strong messaging, fast iteration, and visuals optimized for campaign performance.",
    image: "/feature1.png",
    imageAlt: "Sample ad creative preview",
    reverse: true,
  },
  {
    title: "Manage your prompts and AI templates in one place",
    description:
      "Upload a product and instantly generate studio-quality shots with polished lighting, clean composition, and multiple styles for every campaign channel.",
    image: "/feature2.png",
    imageAlt: "Sample AI product photography preview",
    reverse: false,
  },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    originalPrice: "$29/mo",
    betaPrice: "$0",
    description: "For founders validating product visuals and ad concepts.",
    features: ["Generate product photos", "Create ad-ready images", "Save reusable templates"],
  },
  {
    name: "Growth",
    originalPrice: "$79/mo",
    betaPrice: "$0",
    description: "For small ecommerce teams shipping creatives every week.",
    features: ["Everything in Starter", "Brand-guided generations", "Faster campaign iteration"],
    highlighted: true,
  },
  {
    name: "Scale",
    originalPrice: "$199/mo",
    betaPrice: "$0",
    description: "For operators managing multiple products and campaigns.",
    features: ["Everything in Growth", "Team workflow support", "Priority beta feedback access"],
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#ffe2b8_0%,transparent_28%),radial-gradient(circle_at_100%_0%,#c2f1e4_0%,transparent_28%),var(--background)]">
      <LandingNaviBar />

      <section className="min-h-[100dvh] w-full overflow-hidden border-y border-border/70">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src="/banner-background.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.78),rgba(255,255,255,0.7))]" />
        <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-6xl items-center justify-center px-5 py-10 md:px-8 md:py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
            <p className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Built for e-commerce startups
            </p>
            <AnimatedHeroHeadline />
            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <LoginModalTrigger
                label={
                  <span className="inline-flex items-center gap-3">
                    <span>Start Free with Google</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-4 shrink-0"
                    >
                      <path
                        fill="#4285F4"
                        d="M21.64 12.2c0-.7-.06-1.37-.18-2.02H12v3.82h5.4a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.75 3-4.34 3-7.35Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 22c2.7 0 4.96-.9 6.62-2.45l-3.24-2.52c-.9.6-2.06.97-3.38.97-2.6 0-4.8-1.75-5.58-4.1H3.08v2.6A10 10 0 0 0 12 22Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M6.42 13.9A5.98 5.98 0 0 1 6.1 12c0-.66.12-1.3.32-1.9V7.5H3.08A10 10 0 0 0 2 12c0 1.6.38 3.12 1.08 4.5l3.34-2.6Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.98c1.46 0 2.78.5 3.82 1.47l2.86-2.86C16.95 2.98 14.7 2 12 2a10 10 0 0 0-8.92 5.5l3.34 2.6c.78-2.35 2.98-4.12 5.58-4.12Z"
                      />
                    </svg>
                  </span>
                }
                nextPath="/template"
                variant="outline"
                size="lg"
                className="px-5"
              />
              <LoginModalTrigger
                label="Try with My Product"
                nextPath="/generation"
                size="lg"
                className="px-5"
              />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-10 pt-8 md:px-8 md:pb-12">
        {featureSections.map((feature) => (
          <section key={feature.title} id={feature.id} className="scroll-mt-28">
            <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm">
              <CardContent className="p-7 md:p-12">
                <article className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
                  <div className={cn("space-y-4", feature.reverse ? "md:order-2" : "")}>
                    <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] md:text-4xl">
                      {feature.title}
                    </h2>
                    <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                      {feature.description}
                    </p>
                    <LoginModalTrigger label="Try for free" nextPath="/template" size="lg" className="px-5" />
                  </div>

                  <div
                    className={cn(
                      "overflow-hidden rounded-xl border border-border bg-muted/40",
                      feature.reverse ? "md:order-1" : ""
                    )}
                  >
                    <img src={feature.image} alt={feature.imageAlt} className="h-full w-full object-cover" />
                  </div>
                </article>
              </CardContent>
            </Card>
          </section>
        ))}

        <section id="pricing" className="scroll-mt-28">
          <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-sm">
            <CardContent className="space-y-8 p-7 md:p-12">
              <div className="mx-auto max-w-2xl space-y-3 text-center">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Pricing</p>
                <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] md:text-4xl">
                  Beta access is currently free for every plan
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  We&apos;re waiving all pricing during beta, so you can test image and video generation before paid
                  plans go live.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-3">
                {pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className={cn(
                      "flex h-full flex-col rounded-2xl border border-border/80 bg-background/80 p-6 shadow-sm",
                      plan.highlighted && "border-yellow-400 bg-yellow-50/60"
                    )}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-2xl font-semibold">{plan.name}</h3>
                        {plan.highlighted ? (
                          <span className="rounded-full bg-yellow-400/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-yellow-700">
                            Most popular
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">{plan.description}</p>
                      <div className="flex items-end gap-3">
                        <span className="text-4xl font-semibold tracking-[-0.03em]">{plan.betaPrice}</span>
                        <div className="pb-1 text-sm text-muted-foreground">
                          <span className="line-through">{plan.originalPrice}</span>
                          <span className="ml-2 font-medium text-yellow-700">Beta discount</span>
                        </div>
                      </div>
                    </div>

                    <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                          <span className="mt-1 size-2 rounded-full bg-yellow-500" aria-hidden />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <LoginModalTrigger
                      label="Join Beta Free"
                      nextPath="/template"
                      size="lg"
                      className="mt-8 w-full"
                    />
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <WebsiteScanWizard />

      </main>

      <LandingFooter />
    </div>
  );
}
