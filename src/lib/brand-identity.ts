import type { WebsiteMetadata } from "@/lib/website-scan";

export type BrandIdentity = {
  tagline: string;
  brandValues: string[];
  brandAesthetic: string[];
  toneOfVoice: string[];
  businessOverview: string;
};

const DEFAULT_VALUES = ["quality", "trust", "clarity", "consistency"];
const DEFAULT_AESTHETIC = ["clean", "premium", "modern", "product-first"];
const DEFAULT_TONE = ["clear", "confident", "aspirational", "concise"];

export function buildMainPromptFromIdentity(identity: BrandIdentity): string {
  const tagline = normalizeInlineText(identity.tagline);
  const brandValues = normalizeKeywordList(identity.brandValues, DEFAULT_VALUES);
  const brandAesthetic = normalizeKeywordList(identity.brandAesthetic, DEFAULT_AESTHETIC);
  const toneOfVoice = normalizeKeywordList(identity.toneOfVoice, DEFAULT_TONE);
  const businessOverview = normalizeParagraph(identity.businessOverview);

  return [
    tagline ? `Brand tagline: ${tagline}` : "",
    `Brand values: ${brandValues.join(", ")}`,
    `Brand aesthetic: ${brandAesthetic.join(", ")}`,
    `Tone of voice: ${toneOfVoice.join(", ")}`,
    `Business overview: ${businessOverview}`,
    "Creative guidance: keep product storytelling brand-consistent, visually premium, realistic, conversion-focused, and cleanly composed.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function parseStructuredBrandIdentity(mainPrompt: string): BrandIdentity | null {
  const source = typeof mainPrompt === "string" ? mainPrompt.trim() : "";
  if (!source) return null;

  const tagline = extractLabelValue(source, "Brand tagline");
  const brandValues = parseKeywordLine(extractLabelValue(source, "Brand values"));
  const brandAesthetic = parseKeywordLine(extractLabelValue(source, "Brand aesthetic"));
  const toneOfVoice = parseKeywordLine(extractLabelValue(source, "Tone of voice"));
  const businessOverview = extractLabelValue(source, "Business overview");

  if (!tagline || !brandValues.length || !brandAesthetic.length || !toneOfVoice.length || !businessOverview) {
    return null;
  }

  return {
    tagline,
    brandValues: normalizeKeywordList(brandValues, DEFAULT_VALUES),
    brandAesthetic: normalizeKeywordList(brandAesthetic, DEFAULT_AESTHETIC),
    toneOfVoice: normalizeKeywordList(toneOfVoice, DEFAULT_TONE),
    businessOverview: normalizeParagraph(businessOverview),
  };
}

export function buildFallbackBrandIdentity(metadata: WebsiteMetadata): BrandIdentity {
  const brandName = metadata.ogSiteName || metadata.title || metadata.hostname;
  const description = normalizeParagraph(metadata.description || metadata.ogDescription || "");
  const headingContext = metadata.headings.find(Boolean) || "";

  const tagline =
    description.split(/[.!?]/)[0]?.trim() ||
    metadata.ogTitle ||
    headingContext ||
    `${brandName} for modern ecommerce.`;

  const businessOverview = description
    ? `${brandName} is an ecommerce brand focused on ${description.charAt(0).toLowerCase()}${description.slice(1)}`
    : headingContext
      ? `${brandName} is an ecommerce brand built around ${headingContext.toLowerCase()}.`
      : `${brandName} is an ecommerce brand focused on clear product positioning, consistent presentation, and conversion-ready creative assets.`;

  return {
    tagline: normalizeInlineText(tagline),
    brandValues: DEFAULT_VALUES,
    brandAesthetic: DEFAULT_AESTHETIC,
    toneOfVoice: DEFAULT_TONE,
    businessOverview: normalizeParagraph(businessOverview),
  };
}

export function normalizeBrandIdentity(
  value: Partial<BrandIdentity> | null | undefined,
  fallback: BrandIdentity
): BrandIdentity {
  return {
    tagline: normalizeInlineText(value?.tagline || fallback.tagline),
    brandValues: normalizeKeywordList(value?.brandValues, fallback.brandValues),
    brandAesthetic: normalizeKeywordList(value?.brandAesthetic, fallback.brandAesthetic),
    toneOfVoice: normalizeKeywordList(value?.toneOfVoice, fallback.toneOfVoice),
    businessOverview: normalizeParagraph(value?.businessOverview || fallback.businessOverview),
  };
}

function extractLabelValue(source: string, label: string) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:\\s*(.+)$`, "im");
  const match = source.match(pattern);
  return normalizeInlineText(match?.[1] || "");
}

function parseKeywordLine(value: string) {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => normalizeInlineText(item))
    .filter(Boolean);
}

function normalizeKeywordList(value: unknown, fallback: string[]) {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];

  const cleaned = Array.from(
    new Map(
      source
        .map((item) => normalizeInlineText(String(item || "")))
        .filter(Boolean)
        .map((item) => [item.toLowerCase(), item] as const)
    ).values()
  );

  const filled = [...cleaned];
  for (const item of fallback) {
    if (filled.length >= 4) break;
    if (!filled.some((entry) => entry.toLowerCase() === item.toLowerCase())) {
      filled.push(item);
    }
  }

  return filled.slice(0, 4);
}

function normalizeInlineText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeParagraph(value: string) {
  const normalized = normalizeInlineText(value);
  if (!normalized) return "";
  return normalized.endsWith(".") ? normalized : `${normalized}.`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
