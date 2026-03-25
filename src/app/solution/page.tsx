import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import LoginModalTrigger from "../login/login-modal-trigger";

const solutionPillars = [
  {
    title: "Launch Product Visuals Faster",
    description:
      "Turn a raw product idea into polished ecommerce images and short-form video without waiting on a full creative production cycle.",
  },
  {
    title: "Keep Brand Direction Consistent",
    description:
      "Generate creative variations that still follow your visual identity, campaign tone, and product positioning.",
  },
  {
    title: "Ship More Tests Per Week",
    description:
      "Create more ad concepts, landing visuals, and retention assets so your team can learn faster and iterate on what converts.",
  },
];

const workflowSteps = [
  {
    label: "01",
    title: "Upload your product or reference",
    description: "Start with a product image, a brief, or a website so the system has real context to work from.",
  },
  {
    label: "02",
    title: "Generate ecommerce-ready assets",
    description: "Create still images and video concepts tailored for paid social, landing pages, and lifecycle marketing.",
  },
  {
    label: "03",
    title: "Refine and scale winning concepts",
    description: "Save prompts, reuse templates, and expand the versions that match your brand and performance goals.",
  },
];

const useCases = [
  "Paid social ads",
  "Product page hero images",
  "Email campaign creatives",
  "Seasonal launch campaigns",
  "Brand-guided template systems",
  "Rapid concept testing",
];

export default function SolutionPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_0%_0%,#ffe2b8_0%,transparent_28%),radial-gradient(circle_at_100%_0%,#c2f1e4_0%,transparent_28%),var(--background)]">

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 pb-12 pt-8 md:px-8 md:pb-16">
        <section className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/90 shadow-sm">
          <div className="grid gap-10 px-7 py-10 md:px-10 md:py-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Solution</p>
              <div className="space-y-4">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-6xl">
                  AI creative workflow for ecommerce teams that need output, not overhead
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Yellow Pixel helps startups generate product images and video concepts faster, keep creative quality
                  aligned with the brand, and test more campaigns without building a large production process.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <LoginModalTrigger label="Try with My Product" nextPath="/generation" size="lg" className="px-5" />
                <Link
                  href="/landing#pricing"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  View Beta Pricing
                </Link>
              </div>
            </div>

            <Card className="rounded-[1.75rem] border border-border/80 bg-[linear-gradient(135deg,#111827,#2b1f12_55%,#f6d7a8)] text-white shadow-none">
              <CardContent className="space-y-6 p-7 md:p-8">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/70">What this solves</p>
                  <h2 className="text-2xl font-semibold tracking-[-0.02em]">One system for high-speed creative production</h2>
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-white/75">Before</p>
                    <p className="mt-1 text-base font-medium">Manual briefs, slow revisions, and inconsistent outputs.</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-white/75">After</p>
                    <p className="mt-1 text-base font-medium">Repeatable prompt workflows that produce launch-ready assets in minutes.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {solutionPillars.map((pillar) => (
            <Card key={pillar.title} className="rounded-2xl border border-border/80 bg-card/90 shadow-sm">
              <CardContent className="space-y-3 p-7">
                <h2 className="text-2xl font-semibold tracking-[-0.02em]">{pillar.title}</h2>
                <p className="text-sm leading-6 text-muted-foreground md:text-base">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="rounded-[2rem] border border-border/80 bg-card/90 shadow-sm">
          <div className="grid gap-8 px-7 py-10 md:px-10 md:py-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Workflow</p>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] md:text-4xl">
                Built for lean teams shipping every week
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                The workflow is simple enough for founders and flexible enough for small marketing teams that need a
                repeatable production loop.
              </p>
            </div>

            <div className="space-y-4">
              {workflowSteps.map((step) => (
                <div key={step.label} className="rounded-2xl border border-border/80 bg-background/80 p-5">
                  <div className="flex items-start gap-4">
                    <span className="inline-flex size-10 items-center justify-center rounded-full bg-yellow-400/20 text-sm font-semibold text-yellow-700">
                      {step.label}
                    </span>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{step.title}</h3>
                      <p className="text-sm leading-6 text-muted-foreground md:text-base">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border/80 bg-card/90 shadow-sm">
          <div className="grid gap-8 px-7 py-10 md:px-10 md:py-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Use cases</p>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.02em] md:text-4xl">
                Designed around the assets ecommerce teams actually need
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Use Yellow Pixel to fill creative gaps across acquisition, conversion, and retention without spinning
                up a different workflow for every channel.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {useCases.map((useCase) => (
                <div key={useCase} className="rounded-2xl border border-border/80 bg-background/80 px-4 py-5 text-sm font-medium">
                  {useCase}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
