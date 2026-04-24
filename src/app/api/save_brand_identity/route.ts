import { buildMainPromptFromIdentity, type BrandIdentity } from "@/lib/brand-identity";
import { createClient } from "../../../../lib/supabase/server";

const LOGO_STORAGE_BUCKET = "template";
const LOGO_STORAGE_FOLDER = "logo";

type SaveBrandIdentityPayload = {
  brandIdentity?: unknown;
  logoUrl?: unknown;
  websiteUrl?: unknown;
};

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: userError?.message ?? "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as SaveBrandIdentityPayload;

  if (!isValidBrandIdentity(body.brandIdentity)) {
    return Response.json({ error: "Invalid brandIdentity" }, { status: 400 });
  }

  const brandIdentity = body.brandIdentity as BrandIdentity;
  const logoUrl = typeof body.logoUrl === "string" ? body.logoUrl : "";
  const websiteUrl = typeof body.websiteUrl === "string" ? body.websiteUrl.trim() : "";

  const savedLogoUrl = await saveLogoToStorageIfNeeded(supabase, user.id, logoUrl || null);
  const mainPrompt = buildMainPromptFromIdentity(brandIdentity);

  const { data: existing } = await supabase
    .from("setting")
    .select("id")
    .eq("user_id", user.id)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("setting")
      .update({ main_prompt: mainPrompt, logo: savedLogoUrl, website_url: websiteUrl })
      .eq("id", existing.id);

    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, settingId: existing.id });
  }

  const { data, error } = await supabase
    .from("setting")
    .insert({
      user_id: user.id,
      main_prompt: mainPrompt,
      logo: savedLogoUrl,
      website_url: websiteUrl,
      purpose_prompt: {},
      sample_image: {},
    })
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true, settingId: data.id });
}

function isValidBrandIdentity(value: unknown): value is BrandIdentity {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.tagline === "string" &&
    Array.isArray(v.brandValues) &&
    Array.isArray(v.brandAesthetic) &&
    Array.isArray(v.toneOfVoice) &&
    typeof v.businessOverview === "string"
  );
}

async function saveLogoToStorageIfNeeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  logoUrl: string | null
) {
  if (!logoUrl) return null;

  try {
    const response = await fetch(logoUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: { "user-agent": "YellowPixelBot/1.0 (+https://yellowpixel.io)" },
    });

    if (!response.ok) return logoUrl;

    const contentType = response.headers.get("content-type") || "image/png";
    if (!contentType.toLowerCase().startsWith("image/")) return logoUrl;

    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength || buffer.byteLength > 5_000_000) return logoUrl;

    const extension = inferImageExtension(contentType, response.url || logoUrl);
    const safeUser = sanitizePathPart(userId);
    const storagePath = `${LOGO_STORAGE_FOLDER}/${safeUser}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(LOGO_STORAGE_BUCKET)
      .upload(storagePath, buffer, { cacheControl: "3600", upsert: false, contentType });

    if (uploadError) {
      console.error("logo upload failed:", uploadError);
      return logoUrl;
    }

    const { data } = supabase.storage.from(LOGO_STORAGE_BUCKET).getPublicUrl(storagePath);
    return data.publicUrl || logoUrl;
  } catch (error) {
    console.error("logo download/upload failed:", error);
    return logoUrl;
  }
}

function inferImageExtension(contentType: string, sourceUrl: string) {
  const lowerType = contentType.toLowerCase();
  if (lowerType.includes("svg")) return "svg";
  if (lowerType.includes("jpeg") || lowerType.includes("jpg")) return "jpg";
  if (lowerType.includes("webp")) return "webp";
  if (lowerType.includes("gif")) return "gif";
  if (lowerType.includes("ico") || lowerType.includes("icon")) return "ico";
  if (lowerType.includes("png")) return "png";

  try {
    const pathname = new URL(sourceUrl).pathname;
    const fromPath = pathname.split(".").pop()?.toLowerCase();
    if (fromPath && /^[a-z0-9]{2,5}$/.test(fromPath)) return fromPath;
  } catch {
    // ignore
  }

  return "png";
}

function sanitizePathPart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}
