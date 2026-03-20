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

const featureSections: FeatureSection[] = [
  {
    id: "features",
    title: "Control Brand Guidance for AI-Generated Creatives",
    description:
      "Turn one idea into multiple ad-ready concepts with strong messaging, fast iteration, and visuals optimized for campaign performance.",
    image: "/feature1.png",
    imageAlt: "Sample ad creative preview",
  },
  {
    title: "Manage your prompts and AI templates in one place",
    description:
      "Upload a product and instantly generate studio-quality shots with polished lighting, clean composition, and multiple styles for every campaign channel.",
    image: "/feature2.png",
    imageAlt: "Sample AI product photography preview",
    reverse: true,
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
                label="Start Free with Google"
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

      </main>

      <LandingFooter />
    </div>
  );
}
