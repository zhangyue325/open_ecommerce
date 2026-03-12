"use client";

import { useEffect, useState } from "react";
import GeneratedImagePanel from "./generated-image-panel";
import ReferenceImageList from "./reference-image-list";
import { fileNameWithoutExt, fileToBase64 } from "./utils";
import { UploadItem, DraftPayload, ReferenceImagePayload, VideoHandoffPayload } from "./types";

type Props = {
  onMakeVideoFromImage: (payload: VideoHandoffPayload) => void;
};

export default function ImageGenerationForm({ onMakeVideoFromImage }: Props) {
  const DRAFT_KEY = "generate:draft";

  const RATIO_OPTIONS = ["1:1", "2:3", "3:2", "4:5", "5:4", "9:16", "16:9", "21:9"] as const;
  const RESOLUTION_OPTIONS = ["1K", "2K", "4K"] as const;
  const IMAGE_MODEL_OPTIONS = [
    { value: "gemini-3-pro-image-preview", label: "Gemini 3 Pro Image Preview" },
    { value: "gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image" },
    { value: "gemini-3.1-flash-image-preview", label: "Gemini 3.1 Flash Image Preview" },
  ] as const;

  const [prompt, setPrompt] = useState("");
  const [purpose, setPurpose] = useState<string>("");
  const [purposeOptions, setPurposeOptions] = useState<string[]>([]);
  const [model, setModel] = useState<string>(IMAGE_MODEL_OPTIONS[2].value);
  const [numberOfCreatives, setNumberOfCreatives] = useState<string>("1");
  const [ratio, setRatio] = useState<string>("9:16");
  const [resolution, setResolution] = useState<string>("1K");
  const [images, setImages] = useState<UploadItem[]>([]);
  const [resultImageUrls, setResultImageUrls] = useState<string[]>([]);
  const [fineTuningPrompts, setFineTuningPrompts] = useState<string[]>([]);
  const [resultAiText, setResultAiText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [refinePromptLoading, setRefinePromptLoading] = useState(false);
  const [fineTuningLoadingIndex, setFineTuningLoadingIndex] = useState<number | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return;

    try {
      const draft = JSON.parse(raw) as DraftPayload;
      setPrompt(draft.prompt ?? "");
      setPurpose(draft.purpose ?? "");
      setModel(draft.model ?? IMAGE_MODEL_OPTIONS[2].value);
      setRatio(draft.ratio ?? "9:16");
      setResolution(draft.size ?? "1K");
    } catch {
      // ignore invalid draft
    }
  }, []);

  useEffect(() => {
    async function loadPurposeOptions() {
      try {
        const res = await fetch("/api/purpose_options");
        const data = await res.json();
        if (!res.ok) return;

        const options = Array.isArray(data.purposeOptions)
          ? data.purposeOptions.map((item: unknown) => String(item))
          : [];
        setPurposeOptions(options);
        setPurpose((prev) => prev || options[0] || "");
      } catch {
        // ignore purpose option loading errors
      }
    }

    loadPurposeOptions();
  }, []);

  const onUploadImages = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const nextItems: UploadItem[] = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      name: fileNameWithoutExt(file.name),
    }));

    setImages((prev) => [...prev, ...nextItems]);
  };

  const onChangeImageName = (id: string, nextName: string) => {
    setImages((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: nextName } : item))
    );
  };

  const onRemoveImage = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  const buildReferenceImages = async (): Promise<ReferenceImagePayload[]> => {
    return Promise.all(
      images.map(async (item) => ({
        name: item.name,
        mimeType: item.file.type || "image/png",
        data: await fileToBase64(item.file),
      }))
    );
  };

  const onRefinePrompt = async () => {
    if (!prompt.trim()) return;

    setRefinePromptLoading(true);
    setError("");

    try {
      const referenceImageNames = images.map((item) => item.name).filter(Boolean);

      const res = await fetch("/api/refine_prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          purpose,
          ratio,
          resolution,
          referenceImageNames,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Prompt refinement failed");
        return;
      }

      setPrompt(data.refinedPrompt ?? prompt);
    } catch {
      setError("Prompt refinement failed");
    } finally {
      setRefinePromptLoading(false);
    }
  };

  const onGenerate = async () => {
    setLoading(true);
    setError("");
    setResultImageUrls([]);
    setFineTuningPrompts([]);
    setResultAiText("");

    try {
      const referenceImages = await buildReferenceImages();

      const res = await fetch("/api/generate_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          purpose,
          model,
          numberOfCreatives: Number(numberOfCreatives),
          ratio,
          resolution,
          referenceImages,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Generation failed");
        return;
      }

      const urls = Array.isArray(data.imageBase64List)
        ? data.imageBase64List.map((item: string) => `data:image/png;base64,${item}`)
        : data.imageBase64
          ? [`data:image/png;base64,${data.imageBase64}`]
          : [];

      if (urls.length === 0) {
        setError("No image generated");
        return;
      }

      setResultImageUrls(urls);
      setFineTuningPrompts(Array.from({ length: urls.length }, () => ""));
      setResultAiText(
        typeof data.aiText === "string"
          ? data.aiText
          : Array.isArray(data.aiTextList)
            ? String(data.aiTextList[0] || "")
            : ""
      );
    } catch {
      setError("Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const onDownload = (index: number) => {
    const imageUrl = resultImageUrls[index];
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `generated-image-${index + 1}.png`;
    link.click();
  };

  const onChangeFineTuningPrompt = (index: number, next: string) => {
    setFineTuningPrompts((prev) => {
      const nextPrompts = [...prev];
      nextPrompts[index] = next;
      return nextPrompts;
    });
  };

  const onFineTune = async (index: number) => {
    const selectedImageUrl = resultImageUrls[index];
    const fineTuningPrompt = fineTuningPrompts[index] ?? "";
    if (!selectedImageUrl || !fineTuningPrompt.trim()) return;

    const [header, data = ""] = selectedImageUrl.split(",");
    const mimeMatch = header.match(/data:(.*?);base64/);
    const imageMimeType = mimeMatch?.[1] || "image/png";

    setFineTuningLoadingIndex(index);
    setError("");

    try {
      const referenceImages = await buildReferenceImages();

      const res = await fetch("/api/fine_tune_image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fineTuningPrompt,
          imageBase64: data,
          imageMimeType,
          purpose,
          model,
          ratio,
          resolution,
          referenceImages,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Fine-tuning failed");
        return;
      }

      setResultImageUrls((prev) =>
        prev.map((item, i) => (i === index ? `data:image/png;base64,${result.imageBase64}` : item))
      );
      setFineTuningPrompts((prev) => {
        const nextPrompts = [...prev];
        nextPrompts[index] = "";
        return nextPrompts;
      });
    } catch {
      setError("Fine-tuning failed");
    } finally {
      setFineTuningLoadingIndex(null);
    }
  };

  const onMakeVideo = (index: number) => {
    const selectedImageUrl = resultImageUrls[index];
    if (!selectedImageUrl) return;

    const selectedFineTuningPrompt = fineTuningPrompts[index] ?? "";
    const nextPrompt = selectedFineTuningPrompt.trim() || prompt.trim();

    if (!nextPrompt) {
      setError("Missing prompt to send to video generation");
      return;
    }

    onMakeVideoFromImage({
      prompt: nextPrompt,
      purpose,
      referenceImageDataUrl: selectedImageUrl,
      referenceImageName: `generated-image-${index + 1}.png`,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what to generate..."
          className="min-h-[150px] rounded-xl border p-3 text-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >
            {IMAGE_MODEL_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Purpose</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >
            {purposeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Ratio</label>
          <select
            value={ratio}
            onChange={(e) => setRatio(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >
            {RATIO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Resolution</label>
          <select
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >
            {RESOLUTION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Number of creatives</label>
          <select
            value={numberOfCreatives}
            onChange={(e) => setNumberOfCreatives(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 text-sm"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">Upload reference images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => onUploadImages(e.target.files)}
          className="rounded-xl border bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-3">
        <ReferenceImageList
          images={images}
          onChangeImageName={onChangeImageName}
          onRemoveImage={onRemoveImage}
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onRefinePrompt}
          disabled={refinePromptLoading || !prompt.trim()}
          className="rounded-xl border border-(--ring) bg-white px-5 py-2 text-sm font-semibold text-[color:var(--ink-muted)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {refinePromptLoading ? "Refining..." : "Refine prompt"}
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading || !prompt.trim()}
          className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white"
        >
          {loading ? "Vibing..." : "Vibe It"}
        </button>
      </div>

      {error ? <pre className="text-sm text-red-600">{error}</pre> : null}
      {resultAiText ? (
        <div className="rounded-xl border bg-white p-3">
          <h3 className="text-sm font-medium">AI text output</h3>
          <pre className="mt-2 whitespace-pre-wrap text-sm">{resultAiText}</pre>
        </div>
      ) : null}
      <GeneratedImagePanel
        resultImageUrls={resultImageUrls}
        fineTuningPrompts={fineTuningPrompts}
        fineTuningLoadingIndex={fineTuningLoadingIndex}
        onDownload={onDownload}
        onFineTune={onFineTune}
        onMakeVideo={onMakeVideo}
        onChangeFineTuningPrompt={onChangeFineTuningPrompt}
      />
    </>
  );
}
