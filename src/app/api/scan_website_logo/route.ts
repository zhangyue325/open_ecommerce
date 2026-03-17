import { normalizeWebsiteUrl } from "@/lib/website-scan";

type ScanWebsiteLogoPayload = {
  websiteUrl?: string;
};

export async function POST(req: Request) {
  try {
    const { websiteUrl } = (await req.json()) as ScanWebsiteLogoPayload;

    if (!websiteUrl || typeof websiteUrl !== "string") {
      return Response.json({ error: "Missing websiteUrl" }, { status: 400 });
    }

    const normalized = normalizeWebsiteUrl(websiteUrl);
    const logoUrl = `https://favicon.is/${normalized.hostname}?larger=true`;

    return Response.json({
      normalizedUrl: normalized.toString(),
      logoUrl,
      provider: "favicon.is",
    });
  } catch (error) {
    console.error("scan_website_logo failed:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch website logo";
    const status = isUserError(message) ? 400 : 502;
    return Response.json({ error: message }, { status });
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
