"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clapperboard,
  ImageIcon,
  Shirt,
  Sparkles,
  Store,
  WandSparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import LoginModalTrigger from "../login/login-modal-trigger";
import SiteNavBar from "../components/site-nav-bar";

const generationModes = [
  { id: "product_listing_images", label: "Product Listing Images", icon: Sparkles },
  { id: "paid_ads", label: "Paid Ads", icon: Clapperboard },
  { id: "instagram", label: "Instagram", icon: ImageIcon },
  { id: "tiktok", label: "TikTok", icon: Shirt },
  { id: "email_marketing", label: "Email Marketing", icon: Store },
] as const;

type GenerationModeId = (typeof generationModes)[number]["id"];

type FeaturedCard = {
  title: string;
  description: string;
  image: string;
  className: string;
};

const featuredCards: Record<GenerationModeId, FeaturedCard[]> = {
  product_listing_images: [
    {
      title: "Studio level product images",
      description: "convert your raw product image to studio level product images for Amazon, Shopee, Lazada, and so on.",
      image: "https://picsum.photos/seed/opencommerce-feature-product-listing-1/1400/900",
      className: "lg:col-span-6",
    },
    {
      title: "Packshot variants by angle and colorway",
      description: "",
      image: "https://picsum.photos/seed/opencommerce-feature-product-listing-2/900/900",
      className: "lg:col-span-3",
    },
    {
      title: "Marketplace-safe white background set",
      description: "",
      image: "https://picsum.photos/seed/opencommerce-feature-product-listing-3/900/900",
      className: "lg:col-span-3",
    },
  ],
  paid_ads: [
    {
      title: "Build your spring launch campaign in one click",
      description: "From hero banners to paid social creatives",
      image: "https://picsum.photos/seed/opencommerce-feature-paid-ads-1/1400/900",
      className: "lg:col-span-6",
    },
    {
      title: "AI model of the week: Lifestyle Studio",
      description: "Perfect for skincare, supplements, and beauty",
      image: "https://picsum.photos/seed/opencommerce-feature-paid-ads-2/900/900",
      className: "lg:col-span-3",
    },
    {
      title: "Unlimited product shots in 4K",
      description: "Zero photoshoot logistics",
      image: "https://picsum.photos/seed/opencommerce-feature-paid-ads-3/900/900",
      className: "lg:col-span-3",
    },
  ],
  instagram: [
    {
      title: "Create cohesive IG carousel drops instantly",
      description: "Generate branded posts and story assets in matching visual style",
      image: "https://picsum.photos/seed/opencommerce-feature-instagram-1/1400/900",
      className: "lg:col-span-6",
    },
    {
      title: "Lifestyle influencer scene presets",
      description: "Fashion, beauty, and home decor-ready aesthetics",
      image: "https://picsum.photos/seed/opencommerce-feature-instagram-2/900/900",
      className: "lg:col-span-3",
    },
    {
      title: "Story-first crop and text-safe framing",
      description: "No more manual resizing between feed and story",
      image: "https://picsum.photos/seed/opencommerce-feature-instagram-3/900/900",
      className: "lg:col-span-3",
    },
  ],
  tiktok: [
    {
      title: "Turn a product image into TikTok ad creatives",
      description: "Generate hook-first scenes and short-form concepts quickly",
      image: "https://picsum.photos/seed/opencommerce-feature-tiktok-1/1400/900",
      className: "lg:col-span-6",
    },
    {
      title: "UGC-style product presenter concepts",
      description: "Fast variations for testing top-performing hooks",
      image: "https://picsum.photos/seed/opencommerce-feature-tiktok-2/900/900",
      className: "lg:col-span-3",
    },
    {
      title: "9:16 motion-ready ad layouts",
      description: "Designed for mobile-first attention",
      image: "https://picsum.photos/seed/opencommerce-feature-tiktok-3/900/900",
      className: "lg:col-span-3",
    },
  ],
  email_marketing: [
    {
      title: "Email banner packs for every campaign",
      description: "Generate hero, offer, and product spotlight visuals together",
      image: "https://picsum.photos/seed/opencommerce-feature-email-1/1400/900",
      className: "lg:col-span-6",
    },
    {
      title: "Brand-safe seasonal template variations",
      description: "Holiday, launch, and retention flows in one visual system",
      image: "https://picsum.photos/seed/opencommerce-feature-email-2/900/900",
      className: "lg:col-span-3",
    },
    {
      title: "Optimized layouts for desktop and mobile",
      description: "Consistent creative quality across inbox clients",
      image: "https://picsum.photos/seed/opencommerce-feature-email-3/900/900",
      className: "lg:col-span-3",
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
  { title: "Skincare Hero Shot", image: "https://picsum.photos/seed/opencommerce-inspo-1/900/1200", size: "h-60" },
  { title: "Shoes UGC Frame", image: "https://picsum.photos/seed/opencommerce-inspo-2/900/1100", size: "h-72" },
  { title: "Kitchen Product Story", image: "https://picsum.photos/seed/opencommerce-inspo-3/900/1000", size: "h-52" },
  { title: "Perfume Cinematic", image: "https://picsum.photos/seed/opencommerce-inspo-4/900/1300", size: "h-80" },
  { title: "Fashion Drop Poster", image: "https://picsum.photos/seed/opencommerce-inspo-5/900/1200", size: "h-64" },
  { title: "DTC Ad Concept", image: "https://picsum.photos/seed/opencommerce-inspo-6/900/1100", size: "h-56" },
  { title: "Cosmetic Flat Lay", image: "https://picsum.photos/seed/opencommerce-inspo-7/900/1000", size: "h-48" },
  { title: "Home Decor Carousel", image: "https://picsum.photos/seed/opencommerce-inspo-8/900/1300", size: "h-80" },
  { title: "Bag Lifestyle Video", image: "https://picsum.photos/seed/opencommerce-inspo-9/900/1200", size: "h-60" },
  { title: "Snack Brand Packshot", image: "https://picsum.photos/seed/opencommerce-inspo-10/900/900", size: "h-44" },
  { title: "Dropshipping Hero", image: "https://picsum.photos/seed/opencommerce-inspo-11/900/1000", size: "h-52" },
  { title: "Organic Product Launch", image: "https://picsum.photos/seed/opencommerce-inspo-12/900/1300", size: "h-72" },
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
            Built for ecommerce creative teams
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] text-white md:text-6xl">
            What would you like to{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-300 bg-clip-text text-transparent">
              launch
            </span>{" "}
            today?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-zinc-300 md:text-base">
            Generate product photos, ecommerce videos, paid social creatives, and storefront scenes from one prompt.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/workspace"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-400 px-5 text-sm font-semibold text-black transition hover:bg-emerald-300"
            >
              <Sparkles className="size-4" />
              Create with AI
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
              const Icon = mode.icon;
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
                  <Icon className={cn("size-4", isActive ? "text-emerald-200" : "text-emerald-300")} />
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
                <p className="text-xs tracking-[0.18em] text-zinc-400 uppercase">OpenCommerce Suite</p>
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
                  Explore ideas before you generate
                </h2>
              </div>
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 p-1 text-xs">
                <span className="rounded-full bg-white px-3 py-1 font-medium text-black">Image</span>
                <span className="px-3 py-1 text-zinc-300">Video</span>
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
              <p>(c) {new Date().getFullYear()} OpenCommerce</p>
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
