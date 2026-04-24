import { normalizeWebsiteUrl } from "@/lib/website-scan";

export type SitemapProduct = {
  title: string;
  imageUrl: string;
  url: string;
};

const MAX_PRODUCTS = 12;

export async function fetchSitemapProducts(websiteUrl: string): Promise<SitemapProduct[]> {
  const normalized = normalizeWebsiteUrl(websiteUrl);
  const sitemapUrl = new URL("/sitemap.xml", normalized);
  const sitemapXml = await fetchXml(sitemapUrl.toString());
  if (!sitemapXml) return [];

  const productSitemapUrl = extractLocs(sitemapXml).find((loc) =>
    /sitemap_products/i.test(loc)
  );
  if (!productSitemapUrl) return [];

  const productXml = await fetchXml(productSitemapUrl);
  if (!productXml) return [];

  return extractProducts(productXml).slice(0, MAX_PRODUCTS);
}

async function fetchXml(url: string) {
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        accept: "application/xml,text/xml,*/*",
        "user-agent": "YellowPixelBot/1.0 (+https://yellowpixel.io)",
      },
    });

    if (!response.ok) return "";
    return await response.text();
  } catch {
    return "";
  }
}

function extractLocs(xml: string) {
  return Array.from(xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi))
    .map((match) => decodeXml(match[1] || "").trim())
    .filter(Boolean);
}

function extractProducts(xml: string): SitemapProduct[] {
  const products: SitemapProduct[] = [];

  for (const match of xml.matchAll(/<url>\s*([\s\S]*?)\s*<\/url>/gi)) {
    const block = match[1] || "";
    const url = extractFirst(block, "loc");
    const imageUrl = extractFirst(block, "image:loc");
    const title = extractFirst(block, "image:title");

    if (url && imageUrl && title) {
      products.push({ url, imageUrl, title });
    }
  }

  return products;
}

function extractFirst(xml: string, tag: string) {
  const escapedTag = tag.replace(":", "\\:");
  const pattern = new RegExp(`<${escapedTag}>\\s*([\\s\\S]*?)\\s*<\\/${escapedTag}>`, "i");
  const match = xml.match(pattern);
  return decodeXml(match?.[1] || "").trim();
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
