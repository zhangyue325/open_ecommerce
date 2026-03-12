import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen w-full px-5 py-8 md:px-10 md:py-10">
      <section className="surface-card mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-6xl items-center rounded-[28px] border border-[color:var(--ring)] p-6 md:p-12">
        <div className="grid max-w-4xl gap-6">
          <p className="w-fit rounded-full border border-[color:var(--ring)] bg-white/85 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">
            Yellow Pixel Creative Platform
          </p>

          <h1 className="text-4xl font-semibold leading-[1.02] tracking-[-0.04em] md:text-6xl">
            #1 most used AI tool for advertising
          </h1>

          <p className="max-w-3xl text-base leading-relaxed text-[color:var(--ink-muted)] md:text-lg">
            Generate ad banners, texts, photoshoots, and videos that outperform those of your
            competitors.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              disabled
              className="rounded-full border border-[color:var(--ring)] bg-white px-5 py-2.5 text-sm font-semibold text-[color:var(--ink-muted)] opacity-70"
            >
              Start Free with Google
            </button>
            <Link
              href="https://app.yellowpixel.io"
              className="rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Try For Free Now
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
