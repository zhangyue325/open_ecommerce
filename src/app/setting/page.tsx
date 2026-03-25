"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { Globe, Save, Sparkles } from "lucide-react";

import { createClient } from "../../../lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LoginModalTrigger from "../login/login-modal-trigger";
import SiteNavBar from "../components/site-nav-bar";

type SettingRecord = {
  id: number;
  user_id?: string | null;
  logo: string | null;
  main_prompt: string | null;
  purpose_prompt: unknown;
  sample_image?: unknown;
};

type SampleImageItem = {
  id: string;
  url: string;
  label: string;
};

type DraftState = {
  websiteInput: string;
  logoUrl: string;
  prompt: string;
};

type ScanPromptResponse = {
  normalizedUrl: string;
  mainPrompt: string;
  error?: string;
};

type ScanLogoResponse = {
  logoUrl: string;
  error?: string;
};

const SAMPLE_STORAGE_BUCKET = "template";
const SAMPLE_STORAGE_FOLDER = "sample-image";
const LOGO_STORAGE_BUCKET = "template";
const LOGO_STORAGE_FOLDER = "logo";
const SETTING_DRAFT_KEY = "setting-page-draft";

function toSampleImages(value: unknown): SampleImageItem[] {
  if (!value || typeof value !== "object") return [];

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([, url]) => typeof url === "string" && Boolean(url.trim())
  );

  entries.sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

  return entries.map(([key, url], index) => ({
    id: `sample-${key}-${index}`,
    url: String(url),
    label: `Sample ${key}`,
  }));
}

function toSampleImagePayload(items: SampleImageItem[]) {
  return items.reduce<Record<string, string>>((acc, item, index) => {
    acc[String(index + 1)] = item.url;
    return acc;
  }, {});
}

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function normalizeWebsiteInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function readDraft() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SETTING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DraftState;
  } catch {
    return null;
  }
}

function writeDraft(draft: DraftState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTING_DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SETTING_DRAFT_KEY);
}

export default function SettingPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [setting, setSetting] = useState<SettingRecord | null>(null);
  const [websiteInput, setWebsiteInput] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [sampleImages, setSampleImages] = useState<SampleImageItem[]>([]);
  const [sampleApi, setSampleApi] = useState<CarouselApi | null>(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSamples, setUploadingSamples] = useState(false);
  const [message, setMessage] = useState("");

  const persistDraft = () => {
    writeDraft({ websiteInput, logoUrl, prompt });
  };

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const supabase = createClient();

    const loadForUser = async (user: User | null) => {
      const draft = readDraft();

      if (!active) return;
      setAuthUser(user);

      if (!user) {
        setSetting(null);
        setWebsiteInput(draft?.websiteInput ?? "");
        setLogoUrl(draft?.logoUrl ?? "");
        setPrompt(draft?.prompt ?? "");
        setSampleImages([]);
        setLoading(false);
        return;
      }

      const { data: settingData, error: settingError } = await supabase
        .from("setting")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;

      if (settingError) {
        setConfigError(settingError.message);
        setLoading(false);
        return;
      }

      const nextSetting = (settingData as SettingRecord | null) ?? null;
      setSetting(nextSetting);
      setWebsiteInput(draft?.websiteInput ?? "");
      setLogoUrl(draft?.logoUrl ?? nextSetting?.logo ?? "");
      setPrompt(draft?.prompt ?? (nextSetting?.main_prompt ?? ""));
      setSampleImages(toSampleImages(nextSetting?.sample_image));
      setLoading(false);
    };

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      const isMissingSession =
        error?.message?.toLowerCase().includes("auth session missing") ||
        error?.message?.toLowerCase().includes("session");

      if (error && !isMissingSession) {
        setConfigError(error.message);
        setLoading(false);
        return;
      }

      await loadForUser(data.user ?? null);

      const { data: authData } = supabase.auth.onAuthStateChange(
        async (_event: AuthChangeEvent, session: Session | null) => {
          await loadForUser(session?.user ?? null);
        }
      );

      unsubscribe = () => authData.subscription.unsubscribe();
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      persistDraft();
    }
  }, [loading, websiteInput, logoUrl, prompt]);

  useEffect(() => {
    if (!sampleApi) return;

    const onSelect = () => {
      setSampleIndex(sampleApi.selectedScrollSnap());
    };

    onSelect();
    sampleApi.on("select", onSelect);
    sampleApi.on("reInit", onSelect);

    return () => {
      sampleApi.off("select", onSelect);
      sampleApi.off("reInit", onSelect);
    };
  }, [sampleApi, sampleImages.length]);

  const onScanWebsite = async () => {
    const preparedWebsiteUrl = normalizeWebsiteInput(websiteInput);
    if (!preparedWebsiteUrl) {
      setMessage("Enter a website URL first.");
      return;
    }

    setScanLoading(true);
    setMessage("");
    setWebsiteInput(preparedWebsiteUrl);

    try {
      const promptResponse = await fetch("/api/scan_website_prompt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ websiteUrl: preparedWebsiteUrl }),
      });

      const promptData = (await promptResponse.json()) as ScanPromptResponse;
      if (!promptResponse.ok) {
        throw new Error(promptData.error || "Unable to generate prompt.");
      }

      setPrompt(promptData.mainPrompt || "");

      const logoResponse = await fetch("/api/scan_website_logo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ websiteUrl: promptData.normalizedUrl || preparedWebsiteUrl }),
      });

      const logoData = (await logoResponse.json()) as ScanLogoResponse;
      if (logoResponse.ok && logoData.logoUrl) {
        setLogoUrl(logoData.logoUrl);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to scan website.");
    } finally {
      setScanLoading(false);
    }
  };

  const onChangeLogo = async (files: FileList | null) => {
    if (!files || files.length === 0 || !authUser) return;

    const supabase = createClient();
    const file = files[0];
    setUploadingLogo(true);
    setMessage("");

    const safeFileName = sanitizeFileName(file.name || "logo");
    const storagePath = `${LOGO_STORAGE_FOLDER}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(LOGO_STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) {
      setMessage(uploadError.message);
      setUploadingLogo(false);
      return;
    }

    const { data } = supabase.storage.from(LOGO_STORAGE_BUCKET).getPublicUrl(storagePath);
    setLogoUrl(data.publicUrl || "");
    setUploadingLogo(false);
  };

  const onRemoveLogo = () => {
    setLogoUrl("");
  };

  const onAddSampleImages = async (files: FileList | null) => {
    if (!files || files.length === 0 || !authUser) return;

    const supabase = createClient();
    setUploadingSamples(true);
    setMessage("");

    const uploadedItems: SampleImageItem[] = [];

    for (const file of Array.from(files)) {
      const safeFileName = sanitizeFileName(file.name || "sample");
      const storagePath = `${SAMPLE_STORAGE_FOLDER}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(SAMPLE_STORAGE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        setMessage(uploadError.message);
        setUploadingSamples(false);
        return;
      }

      const { data } = supabase.storage.from(SAMPLE_STORAGE_BUCKET).getPublicUrl(storagePath);
      if (data.publicUrl) {
        uploadedItems.push({
          id: `sample-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: data.publicUrl,
          label: "",
        });
      }
    }

    setSampleImages((previous) =>
      [...previous, ...uploadedItems].map((item, index) => ({
        ...item,
        label: `Sample ${index + 1}`,
      }))
    );
    setUploadingSamples(false);
  };

  const onDeleteCurrentSample = () => {
    setSampleImages((previous) =>
      previous
        .filter((_, index) => index !== sampleIndex)
        .map((item, index) => ({ ...item, label: `Sample ${index + 1}` }))
    );
  };

  const save = async () => {
    if (!authUser) return;

    const supabase = createClient();
    const payload = {
      user_id: authUser.id,
      logo: logoUrl || null,
      main_prompt: prompt,
      purpose_prompt: setting?.purpose_prompt ?? {},
      sample_image: toSampleImagePayload(sampleImages),
    };

    setSaving(true);
    setMessage("");

    try {
      if (setting?.id) {
        const { error } = await supabase.from("setting").update(payload).eq("id", setting.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("setting").insert(payload).select("*").single();
        if (error) throw error;
        setSetting(data as SettingRecord);
      }

      clearDraft();
      setMessage("Saved to your account.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050608] text-white">
        <SiteNavBar mode="fluid" />
        <div className="p-6 text-sm text-zinc-400">Loading My Brand...</div>
      </div>
    );
  }

  if (configError) {
    return (
      <div className="min-h-screen bg-[#050608] text-white">
        <SiteNavBar mode="fluid" />
        <div className="p-6">
          <Alert variant="destructive">
            <AlertTitle>Settings unavailable</AlertTitle>
            <AlertDescription>{configError}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <SiteNavBar mode="fluid" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <section className="relative mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-8">
        <Card className="border-white/10 bg-[#0a0d12]/90 text-white">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
              <Sparkles className="size-3.5" />
              My Brand
            </div>
            <CardTitle className="mt-4 text-white">Website Scan</CardTitle>
            <CardDescription className="text-zinc-400">
              Scan your website to generate a starting brand prompt and pull in a logo preview.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row">
            <Input
              type="text"
              inputMode="url"
              value={websiteInput}
              onChange={(event) => setWebsiteInput(event.target.value)}
              placeholder="www.yourdomain.com"
              className="h-11 border-white/10 bg-white/5 px-4 text-white placeholder:text-zinc-500"
            />
            <Button
              type="button"
              onClick={onScanWebsite}
              disabled={scanLoading}
              className="bg-emerald-400 text-black hover:bg-emerald-300 md:min-w-52"
            >
              {scanLoading ? "Scanning website..." : "Scan website"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0a0d12]/90 text-white">
          <CardHeader>
            <CardTitle className="text-white">Brand Logo</CardTitle>
            <CardDescription className="text-zinc-400">
              Upload a saved logo when logged in, or use the scanned logo preview locally before saving.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploadingLogo || !authUser}
                className="border-white/15 bg-white/0 text-white hover:bg-white/10 disabled:opacity-50"
                onClick={() =>
                  (document.getElementById("brand-logo-upload") as HTMLInputElement | null)?.click()
                }
              >
                {uploadingLogo ? "Uploading..." : "Change logo"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={!logoUrl}
                className="text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
                onClick={onRemoveLogo}
              >
                Remove logo
              </Button>
              <Input
                id="brand-logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  const files = event.target.files;
                  onChangeLogo(files);
                  event.currentTarget.value = "";
                }}
              />
            </div>

            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Brand logo"
                className="h-auto w-[200px] rounded-lg border border-white/10 bg-white p-2"
              />
            ) : (
              <p className="text-sm text-zinc-400">No logo found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0a0d12]/90 text-white">
          <CardHeader>
            <CardTitle className="text-white">Sample Images</CardTitle>
            <CardDescription className="text-zinc-400">
              Upload reference examples to anchor your brand look. Uploading requires login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={uploadingSamples || !authUser}
                className="border-white/15 bg-white/0 text-white hover:bg-white/10 disabled:opacity-50"
                onClick={() =>
                  (document.getElementById("sample-image-upload") as HTMLInputElement | null)?.click()
                }
              >
                {uploadingSamples ? "Uploading..." : "Add image"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={sampleImages.length === 0}
                className="text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
                onClick={onDeleteCurrentSample}
              >
                Delete current image
              </Button>
              <Input
                id="sample-image-upload"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                  const files = event.target.files;
                  onAddSampleImages(files);
                  event.currentTarget.value = "";
                }}
              />
            </div>

            {sampleImages.length > 0 ? (
              <div className="mx-auto w-full max-w-xl px-10">
                <Carousel
                  className="w-full"
                  setApi={setSampleApi}
                  opts={{
                    align: "start",
                    loop: sampleImages.length > 1,
                  }}
                >
                  <CarouselContent>
                    {sampleImages.map((item) => (
                      <CarouselItem key={item.id} className="basis-1/3">
                        <div className="overflow-hidden rounded-xl border border-white/10 bg-white">
                          <img
                            src={item.url}
                            alt={item.label}
                            className="h-[260px] w-full object-contain bg-white"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-2" />
                  <CarouselNext className="-right-2" />
                </Carousel>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">No sample images found.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#0a0d12]/90 text-white">
          <CardHeader>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Globe className="size-4 text-emerald-300" />
              Branding Guidance
            </div>
            <CardTitle className="text-white">Main Prompt</CardTitle>
            <CardDescription className="text-zinc-400">
              Describe your brand tone, visual rules, lighting preferences, styling direction, and generation constraints.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="main-prompt" className="mb-2 block text-zinc-200">
              Prompt
            </Label>
            <Textarea
              id="main-prompt"
              className="min-h-[220px] border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
          </CardContent>
        </Card>

        {message ? (
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
            {message}
          </div>
        ) : null}

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled
            title="Coming soon"
            className="border-white/15 bg-white/0 text-white hover:bg-white/10"
          >
            Test Main Prompt
          </Button>
          {authUser ? (
            <Button
              type="button"
              onClick={save}
              disabled={saving}
              className="bg-emerald-400 text-black hover:bg-emerald-300"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          ) : (
            <LoginModalTrigger
              label={
                <span className="inline-flex items-center gap-2">
                  <Save className="size-4" />
                  Log in to Save
                </span>
              }
              nextPath="/setting"
              className="bg-emerald-400 text-black hover:bg-emerald-300"
              onOpen={persistDraft}
            />
          )}
        </div>
      </section>
    </div>
  );
}
