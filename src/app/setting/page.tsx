"use client";

import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";

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
import { cn } from "@/lib/utils";
import { Globe, Sparkles } from "lucide-react";
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

type ScanStep = "input" | "confirmPrompt" | "confirmLogo";

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

export default function SettingPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [setting, setSetting] = useState<SettingRecord | null>(null);
  const [prompt, setPrompt] = useState("");
  const [sampleImages, setSampleImages] = useState<SampleImageItem[]>([]);
  const [sampleApi, setSampleApi] = useState<CarouselApi | null>(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingSamples, setUploadingSamples] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [scanStep, setScanStep] = useState<ScanStep>("input");
  const [websiteInput, setWebsiteInput] = useState("");
  const [normalizedWebsiteUrl, setNormalizedWebsiteUrl] = useState("");
  const [scanPrompt, setScanPrompt] = useState("");
  const [scanLogoUrl, setScanLogoUrl] = useState<string | null>(null);
  const [scanError, setScanError] = useState("");
  const [isGeneratingScanPrompt, setIsGeneratingScanPrompt] = useState(false);
  const [isLoadingScanLogo, setIsLoadingScanLogo] = useState(false);
  const [isImportingScan, setIsImportingScan] = useState(false);

  const getSupabaseClient = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !key) {
      return null;
    }

    return createClient();
  };

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setConfigError(
          "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      const user = data.user;

      if (error) {
        const isMissingSession =
          error.message.toLowerCase().includes("auth session missing") ||
          error.message.toLowerCase().includes("session");

        if (!isMissingSession) {
          setConfigError(error.message);
          setLoading(false);
          return;
        }
      }

      setAuthUser(user ?? null);

      if (!user) {
        setPrompt("");
        setSampleImages([]);
        setLoading(false);

        const { data: authData } = supabase.auth.onAuthStateChange(
          (_event: AuthChangeEvent, session: Session | null) => {
            setAuthUser(session?.user ?? null);
          }
        );

        return () => authData.subscription.unsubscribe();
      }

      const { data: settingData, error: settingError } = await supabase
        .from("setting")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (settingError) {
        setConfigError(settingError.message);
        setLoading(false);
        return;
      }

      let nextSetting = settingData as SettingRecord | null;

      if (!nextSetting) {
        const { data: insertedSetting, error: insertError } = await supabase
          .from("setting")
          .insert({
            user_id: user.id,
            logo: null,
            main_prompt: "",
            purpose_prompt: {},
            sample_image: {},
          })
          .select("*")
          .single();

        if (insertError || !insertedSetting) {
          setConfigError(insertError?.message ?? "Unable to create default setting.");
          setLoading(false);
          return;
        }

        nextSetting = insertedSetting as SettingRecord;
      }

      setSetting(nextSetting);
      setPrompt(nextSetting.main_prompt || "");
      setSampleImages(toSampleImages(nextSetting.sample_image));
      setLoading(false);

      const { data: authData } = supabase.auth.onAuthStateChange(
        (_event: AuthChangeEvent, session: Session | null) => {
          setAuthUser(session?.user ?? null);
        }
      );

      return () => authData.subscription.unsubscribe();
    }

    let unsubscribe: (() => void) | undefined;

    load().then((cleanup) => {
      unsubscribe = cleanup;
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

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

  async function persistSampleImages(nextItems: SampleImageItem[]) {
    if (!setting) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      alert("Missing Supabase env vars.");
      return;
    }

    const payload = toSampleImagePayload(nextItems);
    const { error } = await supabase
      .from("setting")
      .update({ sample_image: payload })
      .eq("id", setting.id);

    if (error) {
      alert(error.message);
      return;
    }

    setSetting((prev) =>
      prev
        ? {
            ...prev,
            sample_image: payload,
          }
        : prev
    );
  }

  async function persistLogo(nextLogoUrl: string | null) {
    if (!setting) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      alert("Missing Supabase env vars.");
      return;
    }

    const { error } = await supabase
      .from("setting")
      .update({ logo: nextLogoUrl })
      .eq("id", setting.id);

    if (error) {
      alert(error.message);
      return;
    }

    setSetting((prev) =>
      prev
        ? {
            ...prev,
            logo: nextLogoUrl,
          }
        : prev
    );
  }

  async function persistScanResult(nextMainPrompt: string, nextLogoUrl: string | null) {
    if (!setting || !authUser) {
      setPrompt(nextMainPrompt);
      setScanLogoUrl(nextLogoUrl);
      return true;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      alert("Missing Supabase env vars.");
      return false;
    }

    const { error } = await supabase
      .from("setting")
      .update({
        main_prompt: nextMainPrompt,
        logo: nextLogoUrl,
      })
      .eq("id", setting.id);

    if (error) {
      alert(error.message);
      return false;
    }

    setSetting((prev) =>
      prev
        ? {
            ...prev,
            main_prompt: nextMainPrompt,
            logo: nextLogoUrl,
          }
        : prev
    );
    setPrompt(nextMainPrompt);
    setScanLogoUrl(nextLogoUrl);

    return true;
  }

  async function onChangeLogo(files: FileList | null) {
    if (!files || files.length === 0 || !setting) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      alert("Missing Supabase env vars.");
      return;
    }

    const file = files[0];
    setUploadingLogo(true);

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
      alert(uploadError.message);
      setUploadingLogo(false);
      return;
    }

    const { data } = supabase.storage.from(LOGO_STORAGE_BUCKET).getPublicUrl(storagePath);
    const publicUrl = data.publicUrl || null;
    await persistLogo(publicUrl);
    setUploadingLogo(false);
  }

  async function onRemoveLogo() {
    await persistLogo(null);
  }

  async function onAddSampleImages(files: FileList | null) {
    if (!files || files.length === 0 || !setting) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      alert("Missing Supabase env vars.");
      return;
    }

    setUploadingSamples(true);

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
        alert(uploadError.message);
        setUploadingSamples(false);
        return;
      }

      const { data } = supabase.storage.from(SAMPLE_STORAGE_BUCKET).getPublicUrl(storagePath);
      if (data.publicUrl) {
        const nextIndex = sampleImages.length + uploadedItems.length + 1;
        uploadedItems.push({
          id: `sample-new-${Date.now()}-${Math.random()}`,
          url: data.publicUrl,
          label: `Sample ${nextIndex}`,
        });
      }
    }

    const nextItems = [...sampleImages, ...uploadedItems].map((item, index) => ({
      ...item,
      label: `Sample ${index + 1}`,
    }));
    setSampleImages(nextItems);
    await persistSampleImages(nextItems);
    setUploadingSamples(false);
  }

  async function onDeleteCurrentSample() {
    if (sampleImages.length === 0) return;

    const nextItems = sampleImages
      .filter((_, index) => index !== sampleIndex)
      .map((item, index) => ({
        ...item,
        label: `Sample ${index + 1}`,
      }));

    setSampleImages(nextItems);
    setSampleIndex((prev) => Math.max(0, Math.min(prev, nextItems.length - 1)));
    await persistSampleImages(nextItems);
  }

  async function save() {
    if (!setting) return;

    const supabase = getSupabaseClient();
    if (!supabase) {
      alert("Missing Supabase env vars.");
      return;
    }

    setSaving(true);
    const sampleImagePayload = toSampleImagePayload(sampleImages);
    const { error } = await supabase
      .from("setting")
      .update({
        logo: setting.logo,
        main_prompt: prompt,
        purpose_prompt: setting.purpose_prompt ?? {},
        sample_image: sampleImagePayload,
      })
      .eq("id", setting.id);
    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Saved");
  }
  const needsInitialScan = !prompt.trim();

  async function onGenerateScanPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const preparedWebsiteUrl = normalizeWebsiteInput(websiteInput);
    if (!preparedWebsiteUrl) {
      setScanError("Please enter a website URL.");
      return;
    }

    setScanError("");
    setIsGeneratingScanPrompt(true);
    setWebsiteInput(preparedWebsiteUrl);

    try {
      const response = await fetch("/api/scan_website_prompt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ websiteUrl: preparedWebsiteUrl }),
      });

      const data = (await response.json()) as ScanPromptResponse;
      if (!response.ok) {
        throw new Error(data.error || "Unable to generate prompt.");
      }

      setNormalizedWebsiteUrl(data.normalizedUrl);
      setScanPrompt(data.mainPrompt || "");
      setScanLogoUrl(null);
      setScanStep("confirmPrompt");
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "Unable to generate prompt.");
    } finally {
      setIsGeneratingScanPrompt(false);
    }
  }

  async function onContinueScanToLogo() {
    if (!scanPrompt.trim()) {
      setScanError("Main prompt cannot be empty.");
      return;
    }

    setScanError("");
    setIsLoadingScanLogo(true);

    try {
      const websiteUrlForLogo = normalizedWebsiteUrl || normalizeWebsiteInput(websiteInput);
      const response = await fetch("/api/scan_website_logo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ websiteUrl: websiteUrlForLogo }),
      });

      const data = (await response.json()) as ScanLogoResponse;
      if (!response.ok) {
        throw new Error(data.error || "Unable to load website logo.");
      }

      setScanLogoUrl(data.logoUrl || null);
      setScanStep("confirmLogo");
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "Unable to load website logo.");
    } finally {
      setIsLoadingScanLogo(false);
    }
  }

  async function onImportScanSettings() {
    if (!scanPrompt.trim()) {
      setScanError("Main prompt cannot be empty.");
      return;
    }

    setIsImportingScan(true);
    const imported = await persistScanResult(scanPrompt.trim(), scanLogoUrl);
    setIsImportingScan(false);

    if (!imported) {
      return;
    }

    setScanError("");
  }

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

  if (needsInitialScan) {
    return (
      <div className="min-h-screen bg-[#050608] text-white">
        <SiteNavBar mode="fluid" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px]" />
        </div>
        <section className="relative mx-auto flex w-full max-w-4xl flex-col gap-6 p-6 md:p-8">
        <Card className="border-white/10 bg-[#0a0d12]/90 text-white">
          <CardHeader>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
              <Sparkles className="size-3.5" />
              My Brand
            </div>
            <CardTitle className="mt-4 text-white">Set up your brand</CardTitle>
            <CardDescription className="text-zinc-400">
              No main prompt found yet. Scan your website to generate your settings first.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <SettingStepTag active={scanStep === "input"}>1. Scan URL</SettingStepTag>
              <SettingStepTag active={scanStep === "confirmPrompt"}>2. Confirm Prompt</SettingStepTag>
              <SettingStepTag active={scanStep === "confirmLogo"}>3. Confirm Logo</SettingStepTag>
            </div>

            {scanStep === "input" ? (
              <Card className="rounded-xl border border-white/10 bg-black/20 py-0 text-white shadow-none">
                <CardContent className="p-4 md:p-5">
                  <form onSubmit={onGenerateScanPrompt} className="flex flex-col gap-3 md:flex-row">
                    <Input
                      type="text"
                      inputMode="url"
                      value={websiteInput}
                      onChange={(e) => setWebsiteInput(e.target.value)}
                      placeholder="www.yourdomain.com"
                      className="h-11 border-white/10 bg-white/5 px-4 text-white placeholder:text-zinc-500"
                      required
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isGeneratingScanPrompt}
                      className="bg-emerald-400 text-black hover:bg-emerald-300 md:min-w-56"
                    >
                      {isGeneratingScanPrompt ? "Scanning website..." : "Scan website"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : null}

            {scanStep === "confirmPrompt" ? (
              <Card className="rounded-xl border border-white/10 bg-black/20 py-0 text-white shadow-none">
                <CardContent className="space-y-3 p-4 md:p-5">
                  <p className="text-sm text-zinc-400">
                    Review and confirm your generated main prompt.
                  </p>
                  <Textarea
                    value={scanPrompt}
                    onChange={(e) => setScanPrompt(e.target.value)}
                    className="min-h-[180px] border-white/10 bg-white/5 p-3 text-white placeholder:text-zinc-500"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="lg" onClick={() => setScanStep("input")} className="border-white/15 bg-white/0 text-white hover:bg-white/10">
                      Back
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      onClick={onContinueScanToLogo}
                      disabled={isLoadingScanLogo}
                      className="bg-emerald-400 text-black hover:bg-emerald-300"
                    >
                      {isLoadingScanLogo ? "Fetching logo..." : "Confirm prompt and continue"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {scanStep === "confirmLogo" ? (
              <Card className="rounded-xl border border-white/10 bg-black/20 py-0 text-white shadow-none">
                <CardContent className="space-y-3 p-4 md:p-5">
                  <p className="text-sm text-zinc-400">
                    We found your website logo from favicon. Confirm and continue.
                  </p>

                  <div className="flex min-h-[96px] w-fit items-center justify-center rounded-lg border border-white/10 bg-white p-3">
                    {scanLogoUrl ? (
                      <img
                        src={scanLogoUrl}
                        alt="Website logo from favicon"
                        className="h-16 w-16 object-contain"
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground">No logo found</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="lg" onClick={() => setScanStep("confirmPrompt")} className="border-white/15 bg-white/0 text-white hover:bg-white/10">
                      Back
                    </Button>
                    {authUser ? (
                      <Button
                        type="button"
                        size="lg"
                        onClick={onImportScanSettings}
                        disabled={isImportingScan}
                        className="bg-emerald-400 text-black hover:bg-emerald-300"
                      >
                        {isImportingScan ? "Saving settings..." : "Use these settings"}
                      </Button>
                    ) : (
                      <LoginModalTrigger
                        label="Log in to Save"
                        nextPath="/setting"
                        className="bg-emerald-400 text-black hover:bg-emerald-300"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {scanError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {scanError}
              </p>
            ) : null}
          </CardContent>
        </Card>
        </section>
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
          <CardTitle className="mt-4 text-white">Brand Logo</CardTitle>
          <CardDescription className="text-zinc-400">
            Keep your brand mark ready for website scan results and future creative settings.
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
              disabled={!setting?.logo || uploadingLogo || !authUser}
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
              onChange={(e) => {
                const files = e.target.files;
                onChangeLogo(files);
                e.currentTarget.value = "";
              }}
            />
          </div>
          {setting?.logo || scanLogoUrl ? (
            <img
              src={setting?.logo ?? scanLogoUrl ?? ""}
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
            Upload reference examples to anchor your brand look. Saving sample images requires login.
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
              disabled={sampleImages.length === 0 || uploadingSamples || !authUser}
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
              onChange={(e) => {
                const files = e.target.files;
                onAddSampleImages(files);
                e.currentTarget.value = "";
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
            onChange={(e) => setPrompt(e.target.value)}
          />
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" disabled title="Coming soon" className="border-white/15 bg-white/0 text-white hover:bg-white/10">
          Test Main Prompt
        </Button>
        {authUser ? (
          <Button type="button" onClick={save} disabled={saving} className="bg-emerald-400 text-black hover:bg-emerald-300">
            {saving ? "Saving..." : "Save"}
          </Button>
        ) : (
          <LoginModalTrigger
            label="Log in to Save"
            nextPath="/setting"
            className="bg-emerald-400 text-black hover:bg-emerald-300"
          />
        )}
      </div>
    </section>
    </div>
  );
}

function SettingStepTag({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1",
        active
          ? "border-white/20 bg-white/10 text-white"
          : "border-white/10 bg-white/5 text-zinc-400"
      )}
    >
      {children}
    </span>
  );
}

function normalizeWebsiteInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
