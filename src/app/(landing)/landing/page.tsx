import Link from "next/link";

const metrics = [
  { label: "Time To First Draft", value: "< 3 min" },
  { label: "Creative Variations", value: "4x per run" },
  { label: "Supported Formats", value: "Image + Video" },
];

const featureCards = [
  {
    title: "Prompt Intelligence",
    description:
      "Transform rough ideas into production-ready prompts tuned for consistent brand output.",
  },
  {
    title: "Template System",
    description:
      "Save, filter, and reuse proven creative structures across campaigns and channels.",
  },
  {
    title: "Brand Guardrails",
    description:
      "Lock in logos, visual references, and purpose-based instructions for every generation.",
  },
  {
    title: "Video Workflow",
    description:
      "Generate short-form video creatives with reference assets and aspect-ratio control.",
  },
];

const steps = [
  "Define campaign purpose",
  "Generate multi-creative concepts",
  "Fine-tune outputs with references",
  "Export and launch to market",
];

export default function LandingPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.yellowpixel.ai";

  return (
    <main className="relative overflow-hidden px-5 pb-16 pt-10 md:px-10 md:pb-24 md:pt-14">
      <div className="pointer-events-none absolute -left-20 top-12 h-72 w-72 rounded-full bg-[color:var(--accent)]/20 blur-3xl float-a" />
      <div className="pointer-events-none absolute -right-20 top-48 h-72 w-72 rounded-full bg-[color:var(--accent-2)]/25 blur-3xl float-b" />

      <div className="mx-auto grid w-full max-w-6xl gap-8 md:gap-10">
        <section className="surface-card relative overflow-hidden rounded-[28px] border border-[color:var(--ring)] p-6 md:p-10 reveal-up">
          <div className="absolute right-0 top-0 h-44 w-44 rounded-bl-[60px] bg-[linear-gradient(135deg,var(--accent),#ffc37e)] opacity-70" />

          <div className="relative z-10 grid gap-8 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
            <div className="grid gap-5">
              <p className="w-fit rounded-full border border-[color:var(--ring)] bg-white/85 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">
                Yellow Pixel Creative Platform
              </p>

              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-6xl">
                Build high-performance campaign creatives without the chaos.
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-[color:var(--ink-muted)] md:text-lg">
                Turn strategy into image and video outputs with reusable templates, prompt refinement,
                and brand-safe generation in one production workspace.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={appUrl}
                  className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Open App
                </Link>
                <Link
                  href="#workflow"
                  className="rounded-full border border-[color:var(--ring)] bg-white px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5"
                >
                  Explore Workflow
                </Link>
              </div>
            </div>

            <div className="grid gap-2 rounded-2xl border border-[color:var(--ring)] bg-white/90 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">Live System</p>
              <p className="text-sm font-medium">Purpose-driven prompt routing</p>
              <div className="h-px bg-[color:var(--ring)]" />
              <p className="text-sm font-medium">Template + asset references</p>
              <div className="h-px bg-[color:var(--ring)]" />
              <p className="text-sm font-medium">Image and video generation</p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-3">
          {metrics.map((metric, index) => (
            <article
              key={metric.label}
              className="surface-card reveal-up rounded-2xl border border-[color:var(--ring)] p-5"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
                {metric.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em]">{metric.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-3 md:grid-cols-2" id="features">
          {featureCards.map((feature, index) => (
            <article
              key={feature.title}
              className="surface-card reveal-up rounded-2xl border border-[color:var(--ring)] p-6"
              style={{ animationDelay: `${180 + index * 80}ms` }}
            >
              <h2 className="text-xl font-semibold tracking-[-0.02em]">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-muted)] md:text-base">
                {feature.description}
              </p>
            </article>
          ))}
        </section>

        <section
          id="workflow"
          className="surface-card reveal-up rounded-[24px] border border-[color:var(--ring)] bg-[linear-gradient(155deg,#fff,rgba(241,232,220,0.95))] p-6 md:p-8"
        >
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">How Teams Use Yellow Pixel</h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
              Workflow Snapshot
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-[color:var(--ring)] bg-white/85 p-4">
                <p className="font-mono text-xs text-[color:var(--ink-muted)]">0{index + 1}</p>
                <p className="mt-2 text-sm font-medium leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card reveal-up rounded-[24px] border border-[color:var(--ring)] p-7 text-center md:p-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[color:var(--ink-muted)]">
            Ready To Scale Creative?
          </p>
          <h2 className="mx-auto mt-2 max-w-2xl text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
            Launch faster campaigns with a system your team can actually reuse.
          </h2>
          <div className="mt-6">
            <Link
              href={appUrl}
              className="inline-flex rounded-full bg-[color:var(--accent-2)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start In The App
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
