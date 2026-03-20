"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Send, X } from "lucide-react";
import WorkspaceComposerControls from "./workspace-composer-controls";

const PLATFORM_OPTIONS = ["Google Ads", "Meta Ads", "Shopee", "Lazada", "Shopify"];
const PLATFORM_PURPOSE_MAP: Record<string, string[]> = {
  "Google Ads": [
    "Search Campaign Visual",
    "Display Banner",
    "Performance Max Asset",
    "YouTube Thumbnail",
    "Retargeting Creative",
  ],
  "Meta Ads": [
    "Feed Ad Creative",
    "Story Placement",
    "Reels Promo",
    "Carousel Set",
    "Lead Generation Ad",
  ],
  Shopee: [
    "Main Product Image",
    "Shopee Campaign Banner",
    "Voucher Promotion Visual",
    "Flash Sale Creative",
    "Bundle Deal Image",
  ],
  Lazada: [
    "Lazada Product Cover",
    "Mega Campaign Banner",
    "Store Decoration Visual",
    "Voucher Callout",
    "Collection Highlight",
  ],
  Shopify: [
    "Homepage Hero",
    "Collection Banner",
    "Product Detail Visual",
    "Email Campaign Graphic",
    "Social Proof Creative",
  ],
};

export default function WorkspacePage() {
  const [selectedPlatform, setSelectedPlatform] = useState<string>(PLATFORM_OPTIONS[0]);
  const purposeOptions = useMemo(() => {
    return PLATFORM_PURPOSE_MAP[selectedPlatform] ?? [];
  }, [selectedPlatform]);
  const [selectedPurpose, setSelectedPurpose] = useState<string>(
    PLATFORM_PURPOSE_MAP[PLATFORM_OPTIONS[0]]?.[0] ?? ""
  );
  const [model, setModel] = useState<string>("Soul 2.0");
  const [ratio, setRatio] = useState<string>("1:1");
  const [resolution, setResolution] = useState<string>("1024x1024");
  const [promptEnhance, setPromptEnhance] = useState<boolean>(false);
  const [batchSize, setBatchSize] = useState<number>(1);

  const onSelectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
    const nextPurposes = PLATFORM_PURPOSE_MAP[platform] ?? [];
    setSelectedPurpose((previous) => (nextPurposes.includes(previous) ? previous : nextPurposes[0] ?? ""));
  };

  const generatedPrompt = useMemo(() => {
    return `Create ${selectedPurpose.toLowerCase()} visuals optimized for ${selectedPlatform}. Keep messaging conversion-focused, product-forward, and suitable for e-commerce paid campaigns.`;
  }, [selectedPlatform, selectedPurpose]);
  const [promptText, setPromptText] = useState<string>(generatedPrompt);
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; name: string; previewUrl: string }>>([]);
  const uploadedImagesRef = useRef<Array<{ id: string; name: string; previewUrl: string }>>([]);

  useEffect(() => {
    setPromptText(generatedPrompt);
  }, [generatedPrompt]);

  useEffect(() => {
    uploadedImagesRef.current = uploadedImages;
  }, [uploadedImages]);

  useEffect(() => {
    return () => {
      uploadedImagesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const onUploadImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const nextItems = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        previewUrl: URL.createObjectURL(file),
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

  return (
    <section className="relative overflow-hidden rounded-3xl border border-[#d8dbe1] bg-[#eceef2] px-5 pb-10 pt-8 md:px-10 md:pb-14 md:pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(255,255,255,0.55),rgba(255,255,255,0))]" />

      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center">
        <div className="w-full max-w-4xl rounded-2xl border border-[#d3d7de] bg-white/80 p-4 shadow-[0_8px_20px_rgba(17,22,32,0.06)] backdrop-blur md:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <SelectionGroup title="Platform">
              {PLATFORM_OPTIONS.map((option) => (
                <ChoiceChip
                  key={option}
                  active={selectedPlatform === option}
                  onClick={() => onSelectPlatform(option)}
                >
                  {option}
                </ChoiceChip>
              ))}
            </SelectionGroup>

            <SelectionGroup title="Purpose">
              {purposeOptions.map((option) => (
                <ChoiceChip
                  key={option}
                  active={selectedPurpose === option}
                  onClick={() => setSelectedPurpose(option)}
                >
                  {option}
                </ChoiceChip>
              ))}
            </SelectionGroup>
          </div>
        </div>

        <div className="relative mt-4 w-full rounded-[26px] border border-[#d3d7de] bg-[#f6f7f8] p-4 shadow-[0_8px_20px_rgba(17,22,32,0.08)] md:p-6">
          <div className="flex items-start gap-4">
            <div className="flex min-h-[94px] flex-1 items-start">
              <textarea
                value={promptText}
                onChange={(event) => setPromptText(event.target.value)}
                placeholder="Create any design with AI - product photos, posters, and more..."
                className="h-[140px] w-full resize-none border-none bg-transparent text-base leading-relaxed text-[#616571] outline-none placeholder:text-[#8b909c] md:h-[160px] md:text-[22px] md:leading-[1.35]"
              />
            </div>
          </div>

          {uploadedImages.length > 0 ? (
            <div className="mb-2 mt-2 flex flex-wrap gap-3">
              {uploadedImages.map((item) => (
                <div
                  key={item.id}
                  className="group relative h-16 w-16 overflow-hidden rounded-lg border border-[#d3d7de] bg-white"
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

          <div className="mt-4 flex items-end justify-between gap-3">
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
              <ChevronDown className="hidden size-4 text-[#c0c5cd] md:block" />
              <button
                type="button"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#181b22] px-5 text-sm font-semibold text-white transition hover:bg-[#232734]"
              >
                <Send className="size-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectionGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[#e2e5ea] bg-[#f6f7f9] p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#737985]">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function ChoiceChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-sm transition ${
        active
          ? "border-[#2b2f38] bg-[#2b2f38] text-white"
          : "border-[#d4d8df] bg-white text-[#3d4250] hover:bg-[#eff1f4]"
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
