import { GoogleGenAI } from "@google/genai";

import {
  buildFallbackBrandIdentity,
  buildMainPromptFromIdentity,
  normalizeBrandIdentity,
  type BrandIdentity,
} from "@/lib/brand-identity";
import {
  fetchWebsiteMetadata,
  type WebsiteMetadata,
} from "@/lib/website-scan";

type ScanWebsitePromptPayload = {
  websiteUrl?: string;
};

export async function POST(req: Request) {
  try {
    const { websiteUrl } = (await req.json()) as ScanWebsitePromptPayload;

    if (!websiteUrl || typeof websiteUrl !== "string") {
      return Response.json({ error: "Missing websiteUrl" }, { status: 400 });
    }

    const metadata = await fetchWebsiteMetadata(websiteUrl);
    const brandIdentity = await generateBrandIdentity(metadata);
    const mainPrompt = buildMainPromptFromIdentity(brandIdentity);

    return Response.json({
      normalizedUrl: metadata.normalizedUrl,
      hostname: metadata.hostname,
      title: metadata.title,
      description: metadata.description,
      brandIdentity,
      mainPrompt,
    });
  } catch (error) {
    console.error("scan_website_prompt failed:", error);
    const message = error instanceof Error ? error.message : "Failed to scan website";
    const status = isUserError(message) ? 400 : 502;
    return Response.json({ error: message }, { status });
  }
}

async function generateBrandIdentity(metadata: WebsiteMetadata): Promise<BrandIdentity> {
  const fallbackIdentity = buildFallbackBrandIdentity(metadata);

  if (!process.env.GEMINI_API_KEY) {
    return fallbackIdentity;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const websiteContext = {
    url: metadata.normalizedUrl,
    hostname: metadata.hostname,
    title: metadata.title,
    description: metadata.description,
    ogTitle: metadata.ogTitle,
    ogDescription: metadata.ogDescription,
    ogSiteName: metadata.ogSiteName,
    headings: metadata.headings,
    keywords: metadata.keywords,
  };

  const userText = [
    "Extract a concise ecommerce brand identity from this website context.",
    "Return JSON only.",
    'Use this exact schema: {"tagline":"string","brandValues":["a","b","c","d"],"brandAesthetic":["a","b","c","d"],"toneOfVoice":["a","b","c","d"],"businessOverview":"string"}',
    "Requirements: tagline is a short marketing line. brandValues must contain exactly 4 keywords or short phrases. brandAesthetic must contain exactly 4 keywords or short phrases. toneOfVoice must contain exactly 4 keywords or short phrases. businessOverview must be one paragraph and commercially useful.",
    `Website data: ${JSON.stringify(websiteContext)}`,
  ].join("\n");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: userText }] }],
  });

  const generatedText =
    response.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("\n")
      .trim() || "";

  return normalizeGeneratedIdentity(generatedText, fallbackIdentity);
}

function normalizeGeneratedIdentity(raw: string, fallback: BrandIdentity): BrandIdentity {
  const trimmed = raw.trim();
  if (!trimmed) return fallback;

  const withoutFences = trimmed
    .replace(/^```(?:text|json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(withoutFences) as Partial<BrandIdentity>;
    return normalizeBrandIdentity(parsed, fallback);
  } catch {
    return fallback;
  }
}

function isUserError(message: string): boolean {
  const lowered = message.toLowerCase();
  return (
    lowered.includes("invalid") ||
    lowered.includes("required") ||
    lowered.includes("supported") ||
    lowered.includes("unable to load website")
  );
}
