"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LoginModalTrigger from "../login/login-modal-trigger";
import SiteNavBar from "../components/site-nav-bar";

const generationModes = [
  { id: "google_ads", label: "Google Ads", logo: "/logo/platform-google-ads.svg" },
  { id: "meta_ads", label: "Meta Ads", logo: "/logo/platform-meta.svg" },
  { id: "instagram", label: "Instagram", logo: "/logo/platform-instagram.svg" },
  { id: "tiktok", label: "TikTok", logo: "/logo/platform-tiktok.svg" },
] as const;

type GenerationModeId = (typeof generationModes)[number]["id"];

type FeaturedCard = {
  title: string;
  description: string;
  image: string;
  className: string;
};

const featuredCards: Record<GenerationModeId, FeaturedCard[]> = {
  google_ads: [
    {
      title: "Turn plain packshots into conversion-ready product ads",
      description: "Generate polished Google Ads creatives with clean lighting, premium composition, and space for high-performing headlines.",
      image: "/landing_page/feature1-1.png",
      className: "lg:col-span-6 hidden",
    },
    {
      title: "Performance Max layouts built for scale",
      description: "Create campaign assets that look native across Search, Display, and shopping placements without redesigning each format by hand.",
      image: "/performance_max_asset.png",
      className: "lg:col-span-3 hidden",
    },
    {
      title: "Poster-style concepts for stronger click intent",
      description: "Push beyond flat catalog visuals with bold campaign art direction that still keeps the product clear and shoppable.",
      image: "/poster_style.png",
      className: "lg:col-span-3 hidden",
    },
  ],
  meta_ads: [
    {
      title: "Launch Meta campaigns with scroll-stopping creative angles",
      description: "Generate paid social images that feel native to the feed while staying structured for product-first performance marketing.",
      image: "/scroll_stopper.png",
      className: "lg:col-span-6 hidden",
    },
    {
      title: "Lifestyle scenes that feel polished, not generic",
      description: "Blend product focus with human context so ads feel premium, believable, and ready for broad audience testing.",
      image: "/shoes_with_model_feet.png",
      className: "lg:col-span-3 hidden",
    },
    {
      title: "Hook-first ad concepts for faster iteration",
      description: "Test visual hooks, emotional framing, and offer-led compositions without booking another shoot.",
      image: "/emotional_hook.png",
      className: "lg:col-span-3 hidden",
    },
  ],
  instagram: [
    {
      title: "Create Instagram drops with one consistent visual language",
      description: "Generate feed posts, launch creatives, and hero visuals that feel cohesive across every touchpoint of the campaign.",
      image: "/poster_style.png",
      className: "lg:col-span-6 hidden",
    },
    {
      title: "Lifestyle imagery designed for saves and shares",
      description: "Build aspirational brand moments with cleaner framing, stronger product styling, and a more editorial finish.",
      image: "/shoes_with_model_feet.png",
      className: "lg:col-span-3 hidden",
    },
    {
      title: "Story-friendly compositions without manual rework",
      description: "Keep text-safe spacing, strong visual focus, and mobile-first layouts built for Instagram-native content.",
      image: "/scroll_stopper.png",
      className: "lg:col-span-3 hidden",
    },
  ],
  tiktok: [
    {
      title: "Generate TikTok ad concepts with immediate thumb-stop energy",
      description: "Start from one product image and turn it into bold, motion-ready frames built for fast-paced short-form campaigns.",
      image: "/emotional_hook.png",
      className: "lg:col-span-6 hidden",
    },
    {
      title: "UGC-inspired visuals without a full creator shoot",
      description: "Mock up creator-style product moments that feel casual, persuasive, and made for paid social testing.",
      image: "/shoes_with_model_feet.png",
      className: "lg:col-span-3 hidden",
    },
    {
      title: "9:16 compositions made for mobile performance",
      description: "Frame the product, headline area, and action cues for vertical creatives that can later expand into video workflows.",
      image: "/performance_max_asset.png",
      className: "lg:col-span-3 hidden",
    },
  ],
};

const suiteCards = [
  {
    title: "Text to Product Ad",
    description: "Generate thumb-stopping ad frames from prompts.",
    image: "https://picsum.photos/seed/opencommerce-tool-1/640/480",
  },
  {
    title: "Photo to Video",
    description: "Turn one product image into short promo videos.",
    image: "https://picsum.photos/seed/opencommerce-tool-2/640/480",
  },
  {
    title: "Brand Motion Sync",
    description: "Keep logos, colors, and tone consistent in every scene.",
    image: "https://picsum.photos/seed/opencommerce-tool-3/640/480",
  },
  {
    title: "UGC Avatar",
    description: "Create ecommerce-friendly spokesperson clips.",
    image: "https://picsum.photos/seed/opencommerce-tool-4/640/480",
  },
  {
    title: "Catalog Upscale",
    description: "Upscale old listing photos for high-density displays.",
    image: "https://picsum.photos/seed/opencommerce-tool-5/640/480",
  },
  {
    title: "Angle Control",
    description: "Switch product viewpoints with a single prompt.",
    image: "https://picsum.photos/seed/opencommerce-tool-6/640/480",
  },
  {
    title: "Creative Resize",
    description: "Auto-adapt assets for Meta, TikTok, and Amazon.",
    image: "https://picsum.photos/seed/opencommerce-tool-7/640/480",
  },
  {
    title: "Marketplace Optimizer",
    description: "Generate SEO-safe titles, tags, and product scenes.",
    image: "https://picsum.photos/seed/opencommerce-tool-8/640/480",
  },
];

const modelCards = [
  {
    title: "Merch Studio 3",
    description: "Fast product renders with natural reflections.",
    image: "https://picsum.photos/seed/opencommerce-model-1/1000/680",
  },
  {
    title: "UGC Reel 2",
    description: "Avatar-led product explainers with lip sync.",
    image: "https://picsum.photos/seed/opencommerce-model-2/1000/680",
  },
  {
    title: "Shelf Scene Pro",
    description: "Realistic supermarket and retail shelf placement.",
    image: "https://picsum.photos/seed/opencommerce-model-3/1000/680",
  },
  {
    title: "Ad Copy Vision",
    description: "Render typographic campaigns with conversion intent.",
    image: "https://picsum.photos/seed/opencommerce-model-4/1000/680",
  },
];

const inspirationCards = [
  { title: "Emotional Hook", image: "/emotional_hook.png", size: "h-135" },
  { title: "Promotion Countdown Banner", image: "/promotion_countdown_banner.png", size: "h-70" },
  { title: "Luxury Studio Spotlight", image: "/luxury_studio_spotlight.png", size: "h-65" },
  { title: "Catalog White Background", image: "/catalog_white_background.png", size: "h-45" },
  { title: "Clean Product Shot", image: "/clean_product_shot.png", size: "h-70" },
  { title: "Scroll Stopper", image: "/scroll_stopper.png", size: "h-135" },
];

const sectionVisibility = {
  featured: true,
  suite: false,
  models: false,
  inspiration: true,
  pricing: true,
  footer: true,
};

export default function LandingPage() {
  const [activeMode, setActiveMode] = useState<GenerationModeId>(generationModes[0].id);
  const activeFeaturedCards = featuredCards[activeMode];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-emerald-500/20 blur-[110px]" />
        <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />
      </div>

      <SiteNavBar mode="fluid" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="reveal-up text-center">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium tracking-[0.18em] text-zinc-300 uppercase">
            Built for e-commerce 🛍️
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] text-white md:text-6xl">
            Generate ecommerce contents that follow {" "}
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
              brand DNA
            </span>{" "}
          </h1>


          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/brand"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-400 px-5 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              <Sparkles className="size-4" />
              Generate My Brand DNA
            </Link>
            <Link
              href="/workspace"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Browse templates
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-7 mx-auto flex w-full max-w-5xl snap-x snap-mandatory justify-start gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center">
            {generationModes.map((mode) => {
              const isActive = mode.id === activeMode;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMode(mode.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "inline-flex snap-start items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                    isActive
                      ? "border-emerald-300/55 bg-emerald-300/15 text-white"
                      : "border-white/15 bg-white/5 text-zinc-200 hover:border-emerald-300/45 hover:bg-white/10"
                  )}
                >
                  <Image
                    src={mode.logo}
                    alt={`${mode.label} logo`}
                    width={16}
                    height={16}
                    className="size-4 object-contain"
                  />
                  {mode.label}
                </button>
              );
            })}
          </div>
        </section>

        {sectionVisibility.featured ? (
          <section className="mt-8 grid gap-3 lg:grid-cols-12">
            {activeFeaturedCards.map((card, index) => (
              <article
                key={`${activeMode}-${card.title}`}
                className={cn(
                  "group reveal-up relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/50",
                  card.className
                )}
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="h-60 w-full object-cover transition duration-500 group-hover:scale-105 md:h-64"
                  loading={index === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-4">
                  <p className="text-base font-semibold text-white md:text-lg">{card.title}</p>
                  <p className="mt-1 text-xs text-zinc-300 md:text-sm">{card.description}</p>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {sectionVisibility.suite ? (
          <section id="suite" className="mt-14 scroll-mt-24">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.18em] text-zinc-400 uppercase">OpenEcommerce Suite</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
                  Everything for ecommerce creative production
                </h2>
              </div>
              <a
                href="#inspiration"
                className="hidden items-center gap-1 text-sm text-zinc-300 hover:text-white md:inline-flex"
              >
                More
                <ArrowRight className="size-4" />
              </a>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {suiteCards.map((card, index) => (
                <article
                  key={card.title}
                  className="reveal-up group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60"
                  style={{ animationDelay: `${80 + index * 90}ms` }}
                >
                  <div className="relative">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-28 w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  </div>
                  <div className="space-y-1 px-3 py-3">
                    <p className="text-sm font-semibold text-white">{card.title}</p>
                    <p className="text-xs leading-5 text-zinc-400">{card.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {sectionVisibility.models ? (
          <section id="models" className="mt-14 scroll-mt-24">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.18em] text-zinc-400 uppercase">Latest AI Models</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
                  Fine-tuned for product marketing
                </h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {modelCards.map((model, index) => (
                <article
                  key={model.title}
                  className="reveal-up group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/50"
                  style={{ animationDelay: `${120 + index * 100}ms` }}
                >
                  <img
                    src={model.image}
                    alt={model.title}
                    className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="space-y-1 px-3 py-3">
                    <p className="text-sm font-semibold text-white">{model.title}</p>
                    <p className="text-xs leading-5 text-zinc-400">{model.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {sectionVisibility.inspiration ? (
          <section id="inspiration" className="mt-14 scroll-mt-24">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.18em] text-zinc-400 uppercase">Inspiration</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
                  Explore ideas from templates before you generate
                </h2>
              </div>
            </div>

            <div className="mt-5 columns-1 gap-3 sm:columns-2 lg:columns-4">
              {inspirationCards.map((card, index) => (
                <article
                  key={card.title}
                  className="reveal-up mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/60"
                  style={{ animationDelay: `${220 + index * 70}ms` }}
                >
                  <img src={card.image} alt={card.title} className={cn("w-full object-cover", card.size)} loading="lazy" />
                  <p className="px-3 py-2 text-sm font-medium text-zinc-100">{card.title}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {sectionVisibility.pricing ? (
          <section id="pricing" className="mt-14 scroll-mt-24">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-zinc-950/95 to-zinc-900/80 p-6">
              <p className="text-xs tracking-[0.18em] text-zinc-400 uppercase">Pricing</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-white md:text-3xl">
                Start free, scale when your catalog grows
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-300">
                Free tier includes core generation tools. Upgrade when you need more renders, faster queues, and team workflows.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <LoginModalTrigger
                  label="Start Free"
                  nextPath="/template"
                  className="bg-emerald-400 px-4 font-semibold text-black hover:bg-emerald-300"
                />
                {/* <a
                  href="mailto:team@opencommerce.io"
                  className="inline-flex h-8 items-center rounded-lg border border-white/15 px-4 text-sm text-white transition hover:bg-white/10"
                >
                  Contact Sales
                </a> */}
              </div>
            </div>
          </section>
        ) : null}

        {sectionVisibility.footer ? (
          <footer className="mt-12 border-t border-white/10 pt-6 text-sm text-zinc-400">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p>(c) {new Date().getFullYear()} OpenEcommerce</p>
              <p className="inline-flex items-center gap-2">
                <WandSparkles className="size-4 text-emerald-300" />
                AI creative workflow for modern ecommerce teams
              </p>
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );
}
