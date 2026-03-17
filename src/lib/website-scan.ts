export type WebsiteMetadata = {
  normalizedUrl: string;
  hostname: string;
  title: string;
  description: string;
  headings: string[];
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogSiteName: string;
  faviconCandidates: string[];
};

const DEFAULT_TIMEOUT_MS = 12000;
const MAX_HTML_LENGTH = 300_000;

export function normalizeWebsiteUrl(rawInput: string): URL {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    throw new Error("Website URL is required.");
  }

  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const candidate = hasProtocol ? trimmed : `https://${trimmed}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("Invalid website URL.");
  }

  if (!parsed.hostname) {
    throw new Error("Invalid website URL.");
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Only http and https URLs are supported.");
  }

  parsed.hash = "";
  return parsed;
}

export async function fetchWebsiteMetadata(rawInput: string): Promise<WebsiteMetadata> {
  const normalized = normalizeWebsiteUrl(rawInput);
  const response = await fetchWithTimeout(normalized.toString(), {
    method: "GET",
    redirect: "follow",
    cache: "no-store",
    headers: {
      accept: "text/html,application/xhtml+xml",
      "user-agent": "YellowPixelBot/1.0 (+https://yellowpixel.io)",
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to load website (status ${response.status}).`);
  }

  const html = (await response.text()).slice(0, MAX_HTML_LENGTH);
  const finalUrl = normalizeWebsiteUrl(response.url || normalized.toString());

  const title = extractTitle(html);
  const description =
    extractMetaContent(html, "description", "name") ||
    extractMetaContent(html, "og:description", "property");

  const headings = extractHeadings(html).slice(0, 6);
  const keywords = extractKeywords(
    extractMetaContent(html, "keywords", "name")
  );

  const ogTitle = extractMetaContent(html, "og:title", "property");
  const ogDescription = extractMetaContent(html, "og:description", "property");
  const ogSiteName = extractMetaContent(html, "og:site_name", "property");

  return {
    normalizedUrl: finalUrl.toString(),
    hostname: finalUrl.hostname,
    title,
    description,
    headings,
    keywords,
    ogTitle,
    ogDescription,
    ogSiteName,
    faviconCandidates: extractFaviconCandidates(html, finalUrl),
  };
}

export async function findReachableImageUrl(urls: string[]): Promise<string | null> {
  for (const url of urls) {
    const headResponse = await tryFetch(url, { method: "HEAD", redirect: "follow", cache: "no-store" });
    if (headResponse && headResponse.ok && isImageContentType(headResponse.headers.get("content-type"))) {
      return headResponse.url || url;
    }

    const getResponse = await tryFetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: { range: "bytes=0-0" },
    });

    if (getResponse && getResponse.ok) {
      const contentType = getResponse.headers.get("content-type");
      if (isImageContentType(contentType) || isLikelyImagePath(getResponse.url || url)) {
        return getResponse.url || url;
      }
    }
  }

  return null;
}

async function tryFetch(input: string, init: RequestInit): Promise<Response | null> {
  try {
    return await fetchWithTimeout(input, {
      ...init,
      headers: {
        "user-agent": "YellowPixelBot/1.0 (+https://yellowpixel.io)",
        ...(init.headers ?? {}),
      },
    }, 7000);
  } catch {
    return null;
  }
}

export function buildFallbackMainPrompt(metadata: WebsiteMetadata): string {
  const brand = metadata.ogSiteName || metadata.title || metadata.hostname;
  const focus = metadata.description || metadata.ogDescription || "";
  const headingContext = metadata.headings.slice(0, 3).join("; ");

  return [
    `You are generating branded ecommerce creatives for ${brand}.`,
    `Website context: ${metadata.normalizedUrl}.`,
    focus ? `Brand positioning: ${focus}` : "",
    headingContext ? `Primary website themes: ${headingContext}.` : "",
    "Visual guidance: keep brand-consistent product storytelling, premium composition, realistic lighting, clear hierarchy, and conversion-focused framing.",
    "Output style: concise, specific, campaign-ready instructions for image generation.",
  ]
    .filter(Boolean)
    .join("\n");
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? sanitizeText(match[1]) : "";
}

function extractMetaContent(
  html: string,
  key: string,
  attribute: "name" | "property"
): string {
  const regex = /<meta\b[^>]*>/gi;

  for (const tag of html.match(regex) ?? []) {
    const attrs = parseTagAttributes(tag);
    const attrValue = attrs[attribute]?.toLowerCase();
    if (attrValue === key.toLowerCase()) {
      return sanitizeText(attrs.content || "");
    }
  }

  return "";
}

function extractHeadings(html: string): string[] {
  const results: string[] = [];
  const regex = /<h[12][^>]*>([\s\S]*?)<\/h[12]>/gi;

  for (const match of html.matchAll(regex)) {
    const text = sanitizeText(match[1]);
    if (text) {
      results.push(text);
    }
  }

  return Array.from(new Set(results));
}

function extractKeywords(metaKeywords: string): string[] {
  if (!metaKeywords) return [];

  return Array.from(
    new Set(
      metaKeywords
        .split(",")
        .map((item) => sanitizeText(item))
        .filter(Boolean)
    )
  ).slice(0, 12);
}

function extractFaviconCandidates(html: string, baseUrl: URL): string[] {
  const candidates: string[] = [];

  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const attrs = parseTagAttributes(tag);
    const rel = (attrs.rel || "").toLowerCase();
    const href = attrs.href || "";

    if (!href) continue;
    if (!rel.includes("icon")) continue;

    try {
      candidates.push(new URL(href, baseUrl).toString());
    } catch {
      // Skip invalid href values.
    }
  }

  candidates.push(new URL("/favicon.ico", baseUrl).toString());

  return Array.from(new Set(candidates));
}

function parseTagAttributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const attrRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

  for (const match of tag.matchAll(attrRegex)) {
    const key = match[1]?.toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if (key) {
      attrs[key] = value;
    }
  }

  return attrs;
}

function sanitizeText(input: string): string {
  const withoutTags = input.replace(/<[^>]+>/g, " ");
  return decodeHtmlEntities(withoutTags).replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function isImageContentType(contentType: string | null): boolean {
  return Boolean(contentType && contentType.toLowerCase().startsWith("image/"));
}

function isLikelyImagePath(url: string): boolean {
  return /\.(?:png|jpg|jpeg|svg|webp|ico)(?:$|\?)/i.test(url);
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}
