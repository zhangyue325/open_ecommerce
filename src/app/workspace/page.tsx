"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Sparkles, X } from "lucide-react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import WorkspaceComposerControls from "./workspace-composer-controls";
import { getBuiltInPrompt, getPurposeSampleImageUrl } from "./purpose-prompts";
import LoginModalTrigger from "../login/login-modal-trigger";
import { createClient } from "../../../lib/supabase/client";

const PLATFORM_OPTIONS = ["Meta Ads", "Google Ads"];
const PLATFORM_PURPOSE_MAP: Record<string, string[]> = {
  "Google Ads": [
    "Clean Product Shot",
    "Catalog White Background",
    "Luxury Studio Spotlight",
    "Shoes With Model Feet",
    "Performance Max Asset",
    "Poster Style",
    "Bundle Offer Visual",
    "Benefit Callout Ad",
  ],
  "Meta Ads": [
    "Emotional Hook",
    "Scroll Stopper",
    "UGC Testimonial Frame",
    "Promo Countdown Banner",
    "New Arrival Launch",
  ],
};

export default function WorkspacePage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(PLATFORM_OPTIONS[0]);
  const purposeOptions = useMemo(() => {
    return PLATFORM_PURPOSE_MAP[selectedPlatform] ?? [];
  }, [selectedPlatform]);
  const defaultPurpose = PLATFORM_PURPOSE_MAP[PLATFORM_OPTIONS[0]]?.[0] ?? "";
  const [selectedPurpose, setSelectedPurpose] = useState<string>(defaultPurpose);
  const [model, setModel] = useState<string>("gemini-3.1-flash-image-preview");
  const [ratio, setRatio] = useState<string>("1:1");
  const [resolution, setResolution] = useState<string>("1K");
  const [promptEnhance, setPromptEnhance] = useState<boolean>(false);
  const [batchSize, setBatchSize] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [promptText, setPromptText] = useState<string>(getBuiltInPrompt(defaultPurpose));
  const sampleImage = getPurposeSampleImageUrl(selectedPurpose);
  const displayedImages = generatedImages.length > 0 ? generatedImages : sampleImage ? [sampleImage] : [];
  const isShowingSample = generatedImages.length === 0 && Boolean(sampleImage);
  const creationsTitle = isGenerating ? "your images are generating..." : isShowingSample ? "Sample Image" : "Creations";

  const onSelectPurpose = (purpose: string) => {
    setSelectedPurpose(purpose);
    setPromptText(getBuiltInPrompt(purpose));
  };

  const onSelectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
    const nextPurposes = PLATFORM_PURPOSE_MAP[platform] ?? [];
    const nextPurpose = nextPurposes[0] ?? "";
    setSelectedPurpose(nextPurpose);
    setPromptText(getBuiltInPrompt(nextPurpose));
  };
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ id: string; name: string; previewUrl: string; file: File }>
  >([]);
  const uploadedImagesRef = useRef<Array<{ id: string; name: string; previewUrl: string; file: File }>>([]);

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: getUserError,
        } = await supabase.auth.getUser();

        if (active) {
          setIsAuthenticated(!getUserError && Boolean(user));
        }

        const { data } = supabase.auth.onAuthStateChange(
          (_event: AuthChangeEvent, session: Session | null) => {
          if (!active) return;
          setIsAuthenticated(Boolean(session?.user));
          }
        );

        unsubscribe = () => data.subscription.unsubscribe();
      } catch {
        if (active) {
          setIsAuthenticated(false);
        }
      }
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    return () => {
      uploadedImagesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  useEffect(() => {
    if (previewIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPreviewIndex(null);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [previewIndex]);

  const onUploadImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const nextItems = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        file,
      }));

    if (nextItems.length === 0) return;
    setUploadedImages((previous) => [...previous, ...nextItems]);
  };

  const onRemoveImage = (id: string) => {
    setUploadedImages((previous) => {
      const target = previous.find((item) => item.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return previous.filter((item) => item.id !== id);
    });
  };

  const onGenerate = async () => {
    if (!promptText.trim()) {
      setError("Enter a prompt first.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedImages([]);

    try {
      const referenceImages = await Promise.all(
        uploadedImages.map(async (item) => ({
          name: item.name,
          mimeType: item.file.type || "image/png",
          data: await fileToBase64(item.file),
        }))
      );

      const res = await fetch("/api/generate_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptText,
          platform: selectedPlatform,
          purpose: selectedPurpose,
          promptEnhance,
          model,
          ratio,
          resolution,
          numberOfCreatives: batchSize,
          referenceImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed.");
        return;
      }

      const nextImages = Array.isArray(data.imageBase64List)
        ? data.imageBase64List.map((item: string) => `data:image/png;base64,${item}`)
        : data.imageBase64
          ? [`data:image/png;base64,${data.imageBase64}`]
          : [];

      if (nextImages.length === 0) {
        setError("No image generated.");
        return;
      }

      setGeneratedImages(nextImages);
    } catch {
      setError("Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="relative h-full overflow-hidden bg-[#050608] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-500/10 blur-[140px]" />
      </div>

      <div className="relative grid h-full w-full gap-4 px-3 py-3 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-4">
        <aside className="flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-[#0a0d12]/90 p-4">

          <div className="mt-4 grid gap-2">
            {PLATFORM_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onSelectPlatform(option)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  selectedPlatform === option
                    ? "border-emerald-300/45 bg-emerald-400/10 text-white"
                    : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-5 flex min-h-0 flex-1 flex-col border-t border-white/10 pt-4">
            <p className="text-xs tracking-[0.14em] text-zinc-400 uppercase">Purpose</p>
            <div className="mt-3 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
              {purposeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectPurpose(option)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    selectedPurpose === option
                      ? "bg-white text-black"
                      : "text-zinc-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="grid h-full min-h-0 gap-4 lg:grid-rows-[minmax(280px,0.5fr)_minmax(0,0.5fr)]">
          <section className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-[#0a0d12]/90 p-4 md:p-5">
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <h4 className="text-base font-semibold text-white">{creationsTitle}</h4>
              <span className="text-xs text-zinc-400">
                {isGenerating ? "" : isShowingSample ? "Preview" : `${displayedImages.length} items`}
              </span>
            </div>

            {displayedImages.length > 0 ? (
              <div className="flex min-h-0 flex-1 gap-4 overflow-auto">
                {displayedImages.map((imageUrl, index) => (
                  <button
                    key={`${imageUrl.slice(0, 32)}-${index}`}
                    type="button"
                    onClick={() => setPreviewIndex(index)}
                    className="h-full w-1/4 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 text-left transition hover:border-white/25"
                  >
                    <div className="flex h-full w-full items-center justify-center bg-black/30">
                      <img
                        src={imageUrl}
                        alt={`Generated creative ${index + 1}`}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-dashed border-white/15 bg-black/20 px-4 py-12 text-center text-sm text-zinc-400">
                Your generated creatives will appear here.
              </div>
            )}
          </section>

          <div className="min-h-0 overflow-auto rounded-2xl border border-white/10 bg-[#0a0d12]/90 p-4 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-zinc-400">Creating for {selectedPlatform}</p>
                <h3 className="text-lg font-semibold text-white">{selectedPurpose || "Select a purpose"}</h3>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
              <textarea
                value={promptText}
                onChange={(event) => setPromptText(event.target.value)}
                placeholder="Describe your creative idea. Example: premium product hero shot with soft shadows and clean white backdrop."
                className="h-[120px] w-full resize-none border-none bg-transparent text-sm leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-500 md:h-[145px] md:text-base"
              />
            </div>

            {uploadedImages.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-3">
                {uploadedImages.map((item) => (
                  <div
                    key={item.id}
                    className="group relative h-16 w-16 overflow-hidden rounded-lg border border-white/15 bg-black/40"
                    title={item.name}
                  >
                    <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => onRemoveImage(item.id)}
                      className="absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100"
                      aria-label={`Remove ${item.name}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <WorkspaceComposerControls
                model={model}
                ratio={ratio}
                resolution={resolution}
                promptEnhance={promptEnhance}
                batchSize={batchSize}
                onChangeModel={setModel}
                onChangeRatio={setRatio}
                onChangeResolution={setResolution}
                onChangePromptEnhance={setPromptEnhance}
                onChangeBatchSize={setBatchSize}
                onUploadImages={onUploadImages}
              />

              <div className="flex items-center gap-3">
                <ChevronDown className="hidden size-4 text-zinc-500 md:block" />
                {isAuthenticated === null ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-[#181b22]/80 px-5 text-sm font-semibold text-white"
                  >
                    <Sparkles className="size-4" />
                    Checking...
                  </button>
                ) : isAuthenticated ? (
                  <button
                    type="button"
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-semibold text-black transition hover:bg-emerald-300"
                  >
                    <Sparkles className="size-4" />
                    {isGenerating ? "Generating..." : "Generate"}
                  </button>
                ) : (
                  <LoginModalTrigger
                    label={
                      <span className="inline-flex items-center gap-2">
                        <Sparkles className="size-4" />
                        Generate
                      </span>
                    }
                    nextPath="/workspace"
                    className="h-11 rounded-full bg-emerald-400 px-5 text-sm font-semibold text-black transition hover:bg-emerald-300"
                  />
                )}
              </div>
            </div>

            {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}
          </div>
        </div>
      </div>

      {previewIndex !== null ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <div
            className="relative w-full max-w-6xl rounded-2xl border border-white/10 bg-[#0a0d12] p-3"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewIndex(null)}
              className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              aria-label="Close preview"
            >
              <X className="size-4" />
            </button>
            <div className="flex h-[78vh] items-center justify-center rounded-xl bg-black/30 p-3">
              <img
                src={displayedImages[previewIndex]}
                alt={`Preview creative ${previewIndex + 1}`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

async function fileToBase64(file: File) {
  const buffer = await file.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}
