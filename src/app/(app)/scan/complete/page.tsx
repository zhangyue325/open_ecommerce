import { redirect } from "next/navigation";

import { createClient } from "../../../../../lib/supabase/server";
import { normalizeWebsiteUrl } from "@/lib/website-scan";

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
        logo: payload.logoUrl,
      })
      .eq("id", existingSetting.id);

    if (updateError) {
      return <InvalidState message={updateError.message} />;
    }
  } else {
    const { error: insertError } = await supabase.from("setting").insert({
      user_id: user.id,
      main_prompt: payload.mainPrompt,
      logo: payload.logoUrl,
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
