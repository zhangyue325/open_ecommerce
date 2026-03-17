import { GoogleGenAI } from "@google/genai";

import {
  buildFallbackMainPrompt,
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
    const mainPrompt = await generateMainPrompt(metadata);

    return Response.json({
      normalizedUrl: metadata.normalizedUrl,
      hostname: metadata.hostname,
      title: metadata.title,
      description: metadata.description,
      mainPrompt,
    });
  } catch (error) {
    console.error("scan_website_prompt failed:", error);
    const message = error instanceof Error ? error.message : "Failed to scan website";
    const status = isUserError(message) ? 400 : 502;
    return Response.json({ error: message }, { status });
  }
}

async function generateMainPrompt(metadata: WebsiteMetadata): Promise<string> {
  const fallbackPrompt = buildFallbackMainPrompt(metadata);

  if (!process.env.GEMINI_API_KEY) {
    return fallbackPrompt;
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
    "Generate one brand-level main prompt for AI creative generation.",
    "The prompt should be specific, commercially useful, and reusable for product campaign imagery.",
    "Include brand identity, brand tone, and generation rules.",
    "Keep it under 220 words.",
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

  return normalizeGeneratedPrompt(generatedText) || fallbackPrompt;
}

function normalizeGeneratedPrompt(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const withoutFences = trimmed
    .replace(/^```(?:text|json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  if (withoutFences.startsWith("{")) {
    try {
      const parsed = JSON.parse(withoutFences) as { mainPrompt?: unknown; prompt?: unknown };
      const candidate =
        typeof parsed.mainPrompt === "string"
          ? parsed.mainPrompt
          : typeof parsed.prompt === "string"
            ? parsed.prompt
            : "";
      return candidate.trim();
    } catch {
      // Treat as plain text if json parsing fails.
    }
  }

  return withoutFences;
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
