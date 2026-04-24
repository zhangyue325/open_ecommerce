import type { BrandIdentity } from "@/lib/brand-identity";

export type BrandDraft = BrandIdentity & {
  websiteUrl: string;
  logoUrl: string;
  products?: BrandProduct[];
};

export type BrandProduct = {
  title: string;
  imageUrl: string;
  url: string;
};

const BRAND_DRAFT_KEY = "brand-page-generated-draft";
const BRAND_PENDING_SAVE_KEY = "brand-page-pending-save";

export function normalizeWebsiteInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function hasSavedIdentity(setting: { main_prompt?: string | null; logo?: string | null } | null) {
  return Boolean(setting?.main_prompt?.trim() || setting?.logo?.trim());
}

export function readDraft() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(BRAND_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<BrandDraft>;
    if (
      typeof parsed.websiteUrl !== "string" ||
      typeof parsed.logoUrl !== "string" ||
      typeof parsed.tagline !== "string" ||
      !Array.isArray(parsed.brandValues) ||
      !Array.isArray(parsed.brandAesthetic) ||
      !Array.isArray(parsed.toneOfVoice) ||
      typeof parsed.businessOverview !== "string"
    ) {
      return null;
    }

    return {
      websiteUrl: parsed.websiteUrl,
      logoUrl: parsed.logoUrl,
      tagline: parsed.tagline,
      brandValues: parsed.brandValues.filter((item): item is string => typeof item === "string"),
      brandAesthetic: parsed.brandAesthetic.filter((item): item is string => typeof item === "string"),
      toneOfVoice: parsed.toneOfVoice.filter((item): item is string => typeof item === "string"),
      businessOverview: parsed.businessOverview,
      products: Array.isArray(parsed.products)
        ? parsed.products.filter(isBrandProduct)
        : [],
    } satisfies BrandDraft;
  } catch {
    return null;
  }
}

export function writeDraft(draft: BrandDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRAND_DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BRAND_DRAFT_KEY);
}

export function readPendingSave() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(BRAND_PENDING_SAVE_KEY) === "1";
}

export function writePendingSave() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRAND_PENDING_SAVE_KEY, "1");
}

export function clearPendingSave() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BRAND_PENDING_SAVE_KEY);
}

function isBrandProduct(value: unknown): value is BrandProduct {
  if (!value || typeof value !== "object") return false;

  const product = value as Partial<BrandProduct>;
  return (
    typeof product.title === "string" &&
    typeof product.imageUrl === "string" &&
    typeof product.url === "string"
  );
}
