import { redirect } from "next/navigation";

import { createClient } from "../../../../../lib/supabase/server";
import { normalizeWebsiteUrl } from "@/lib/website-scan";

const LOGO_STORAGE_BUCKET = "template";
const LOGO_STORAGE_FOLDER = "logo";

type ScanCompletePageProps = {
  searchParams: Promise<{ token?: string | string[] }>;
};

type ScanTokenPayload = {
  websiteUrl: string;
  mainPrompt: string;
  logoUrl: string | null;
};

export default async function ScanCompletePage({ searchParams }: ScanCompletePageProps) {
  const resolvedSearchParams = await searchParams;
  const rawToken = Array.isArray(resolvedSearchParams.token)
    ? resolvedSearchParams.token[0]
    : resolvedSearchParams.token;

  if (!rawToken) {
    return <InvalidState message="Missing scan token." />;
  }

  const payload = decodeScanToken(rawToken);
  if (!payload) {
    return <InvalidState message="Invalid scan token." />;
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return <InvalidState message={userError?.message ?? "Unauthorized"} />;
  }

  const savedLogoUrl = await saveLogoToStorageIfNeeded(supabase, user.id, payload.logoUrl);

  const { data: existingSetting, error: selectError } = await supabase
    .from("setting")
    .select("id")
    .eq("user_id", user.id)
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selectError) {
    return <InvalidState message={selectError.message} />;
  }

  if (existingSetting?.id) {
    const { error: updateError } = await supabase
      .from("setting")
      .update({
        main_prompt: payload.mainPrompt,
        logo: savedLogoUrl,
      })
      .eq("id", existingSetting.id);

    if (updateError) {
      return <InvalidState message={updateError.message} />;
    }
  } else {
    const { error: insertError } = await supabase.from("setting").insert({
      user_id: user.id,
      main_prompt: payload.mainPrompt,
      logo: savedLogoUrl,
      purpose_prompt: {},
      sample_image: {},
    });

    if (insertError) {
      return <InvalidState message={insertError.message} />;
    }
  }

  redirect(`/setting?imported_from_scan=1&website=${encodeURIComponent(payload.websiteUrl)}`);
}

function decodeScanToken(rawToken: string): ScanTokenPayload | null {
  try {
    const base64 = rawToken.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(paddedBase64, "base64").toString("utf8");
    const parsed = JSON.parse(decoded) as {
      websiteUrl?: unknown;
      mainPrompt?: unknown;
      logoUrl?: unknown;
    };

    if (typeof parsed.websiteUrl !== "string" || typeof parsed.mainPrompt !== "string") {
      return null;
    }

    const websiteUrl = normalizeWebsiteUrl(parsed.websiteUrl).toString();
    const mainPrompt = parsed.mainPrompt.trim().slice(0, 6000);
    const logoUrl = normalizeLogoUrl(parsed.logoUrl);

    if (!mainPrompt) {
      return null;
    }

    return {
      websiteUrl,
      mainPrompt,
      logoUrl,
    };
  } catch {
    return null;
  }
}

function normalizeLogoUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    // Ignore invalid logo values.
  }

  return null;
}

function InvalidState({ message }: { message: string }) {
  return (
    <main className="p-6">
      <p className="text-sm text-red-600">Unable to complete website scan import: {message}</p>
    </main>
  );
}

async function saveLogoToStorageIfNeeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  logoUrl: string | null
) {
  if (!logoUrl) {
    return null;
  }

  try {
    const response = await fetch(logoUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      headers: {
        "user-agent": "YellowPixelBot/1.0 (+https://yellowpixel.io)",
      },
    });

    if (!response.ok) {
      return logoUrl;
    }

    const contentType = response.headers.get("content-type") || "image/png";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return logoUrl;
    }

    const buffer = await response.arrayBuffer();
    if (!buffer.byteLength || buffer.byteLength > 5_000_000) {
      return logoUrl;
    }

    const extension = inferImageExtension(contentType, response.url || logoUrl);
    const safeUser = sanitizePathPart(userId);
    const storagePath = `${LOGO_STORAGE_FOLDER}/${safeUser}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(LOGO_STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType,
      });

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

  const pathname = new URL(sourceUrl).pathname;
  const fromPath = pathname.split(".").pop()?.toLowerCase();
  if (fromPath && /^[a-z0-9]{2,5}$/.test(fromPath)) {
    return fromPath;
  }

  return "png";
}

function sanitizePathPart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "_");
}
