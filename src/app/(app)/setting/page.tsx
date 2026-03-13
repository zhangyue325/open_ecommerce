"use client";

import { useEffect, useState } from "react";

import { createClient } from "../../../../lib/supabase/client";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDownIcon } from "lucide-react";

type PurposePromptItem = {
  id: string;
  name: string;
  prompt: string;
};

type SettingRecord = {
  id: number;
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

const SAMPLE_STORAGE_BUCKET = "template";
const SAMPLE_STORAGE_FOLDER = "sample-image";
const LOGO_STORAGE_BUCKET = "template";
const LOGO_STORAGE_FOLDER = "logo";

function toPurposeItems(value: unknown): PurposePromptItem[] {
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};

  return Object.entries(source).map(([name, prompt]) => ({
    id: `${Date.now()}-${Math.random()}-${name}`,
    name,
    prompt: String(prompt ?? ""),
  }));
}

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
  const [setting, setSetting] = useState<SettingRecord | null>(null);
  const [prompt, setPrompt] = useState("");
  const [purposeItems, setPurposeItems] = useState<PurposePromptItem[]>([]);
  const [sampleImages, setSampleImages] = useState<SampleImageItem[]>([]);
  const [openPurposeId, setOpenPurposeId] = useState("");
  const [sampleApi, setSampleApi] = useState<CarouselApi | null>(null);
  const [sampleIndex, setSampleIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingSamples, setUploadingSamples] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

      const { data, error } = await supabase
        .from("setting")
        .select("*")
        .eq("user_name", "Pazzion")
        .single();

      if (error || !data) {
        setConfigError(error?.message ?? "Unable to load settings.");
        setLoading(false);
        return;
      }

      const nextSetting = data as SettingRecord;
      const loadedPurposeItems = toPurposeItems(nextSetting.purpose_prompt);
      setSetting(nextSetting);
      setPrompt(nextSetting.main_prompt || "");
      setPurposeItems(loadedPurposeItems);
      setSampleImages(toSampleImages(nextSetting.sample_image));
      setOpenPurposeId("");
      setLoading(false);
    }

    load();
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

    const purposePrompt: Record<string, string> = {};

    for (const item of purposeItems) {
      const key = item.name.trim();
      if (!key) continue;

      if (Object.prototype.hasOwnProperty.call(purposePrompt, key)) {
        alert(`Duplicate purpose: ${key}`);
        return;
      }

      purposePrompt[key] = item.prompt;
    }

    setSaving(true);
    const sampleImagePayload = toSampleImagePayload(sampleImages);
    const { error } = await supabase
      .from("setting")
      .update({
        logo: setting.logo,
        main_prompt: prompt,
        purpose_prompt: purposePrompt,
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

  function addPurpose() {
    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      name: "",
      prompt: "",
    };
    setPurposeItems((prev) => [...prev, newItem]);
    setOpenPurposeId(newItem.id);
  }

  function updatePurposeName(id: string, nextName: string) {
    setPurposeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: nextName } : item))
    );
  }

  function updatePurposePrompt(id: string, nextPrompt: string) {
    setPurposeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, prompt: nextPrompt } : item))
    );
  }

  function removePurpose(id: string) {
    setPurposeItems((prev) => {
      const nextItems = prev.filter((item) => item.id !== id);
      if (openPurposeId === id) {
        setOpenPurposeId(nextItems[0]?.id ?? "");
      }
      return nextItems;
    });
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading settings...</div>;
  }

  if (configError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Settings unavailable</AlertTitle>
          <AlertDescription>{configError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Brand Logo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={uploadingLogo}
              onClick={() =>
                (document.getElementById("brand-logo-upload") as HTMLInputElement | null)?.click()
              }
            >
              {uploadingLogo ? "Uploading..." : "Change logo"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={!setting?.logo || uploadingLogo}
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
          {setting?.logo ? (
            <img
              src={setting.logo}
              alt="Brand logo"
              className="h-auto w-[200px] rounded-lg border border-border bg-white p-2"
            />
          ) : (
            <p className="text-sm text-muted-foreground">No logo found.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={uploadingSamples}
              onClick={() =>
                (document.getElementById("sample-image-upload") as HTMLInputElement | null)?.click()
              }
            >
              {uploadingSamples ? "Uploading..." : "Add image"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={sampleImages.length === 0 || uploadingSamples}
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
                      <div className="overflow-hidden rounded-xl border border-border bg-white">
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
            <p className="text-sm text-muted-foreground">No sample images found.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding Guidance</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="main-prompt" className="mb-2 block">
            Prompt
          </Label>
          <Textarea
            id="main-prompt"
            className="min-h-[220px]"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Purpose</CardTitle>
          </div>
          <Button type="button" variant="outline" onClick={addPurpose}>
            Add purpose
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {purposeItems.length === 0 ? (
            <Alert>
              <AlertTitle>No purpose yet</AlertTitle>
              <AlertDescription>Click Add purpose to create one.</AlertDescription>
            </Alert>
          ) : (
            purposeItems.map((item, index) => {
              const isOpen = openPurposeId === item.id;
              const displayName = item.name.trim() || `Purpose ${index + 1}`;

              return (
                <Collapsible
                  key={item.id}
                  open={isOpen}
                  onOpenChange={(open) => setOpenPurposeId(open ? item.id : "")}
                >
                  <Card className="bg-muted/40">
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                      <CollapsibleTrigger className="flex flex-1 items-center justify-between rounded-md px-2 py-1 text-left hover:bg-muted">
                        <span className="text-sm font-medium">{displayName}</span>
                        <ChevronDownIcon
                          className={`size-4 text-muted-foreground transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </CollapsibleTrigger>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removePurpose(item.id)}>
                        Delete
                      </Button>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent className="grid gap-3 pt-0">
                        <div className="grid gap-2">
                          <Label htmlFor={`purpose-name-${item.id}`}>Purpose name</Label>
                          <Input
                            id={`purpose-name-${item.id}`}
                            value={item.name}
                            onChange={(e) => updatePurposeName(item.id, e.target.value)}
                            placeholder="Example: ads creative"
                          />
                        </div>

                        <div className="grid gap-2">
                          <Label htmlFor={`purpose-prompt-${item.id}`}>Prompt text</Label>
                          <Textarea
                            id={`purpose-prompt-${item.id}`}
                            className="min-h-[150px]"
                            value={item.prompt}
                            onChange={(e) => updatePurposePrompt(item.id, e.target.value)}
                            placeholder="Purpose prompt..."
                          />
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" disabled title="Coming soon">
          Test Main Prompt
        </Button>
        <Button type="button" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </section>
  );
}
