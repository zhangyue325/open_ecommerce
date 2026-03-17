import { fetchWebsiteMetadata, findReachableImageUrl, normalizeWebsiteUrl } from "@/lib/website-scan";

type ScanWebsiteLogoPayload = {
  websiteUrl?: string;
};

export async function POST(req: Request) {
  try {
    const { websiteUrl } = (await req.json()) as ScanWebsiteLogoPayload;

    if (!websiteUrl || typeof websiteUrl !== "string") {
      return Response.json({ error: "Missing websiteUrl" }, { status: 400 });
    }

    const metadata = await fetchWebsiteMetadata(websiteUrl);
    const logoUrl = await findReachableImageUrl(metadata.faviconCandidates);

    return Response.json({
      normalizedUrl: metadata.normalizedUrl,
      logoUrl:
        logoUrl ||
        new URL("/favicon.ico", normalizeWebsiteUrl(metadata.normalizedUrl)).toString(),
      candidates: metadata.faviconCandidates,
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
