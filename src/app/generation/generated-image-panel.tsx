"use client";

import { useEffect, useState } from "react";

type Props = {
  resultImageUrls: string[];
  fineTuningPrompts: string[];
  fineTuningLoadingIndex: number | null;
  onDownload: (index: number) => void;
  onFineTune: (index: number) => void;
  onMakeVideo: (index: number) => void;
  onChangeFineTuningPrompt: (index: number, next: string) => void;
};

export default function GeneratedImagePanel({
  resultImageUrls,
  fineTuningPrompts,
  fineTuningLoadingIndex,
  onDownload,
  onFineTune,
  onMakeVideo,
  onChangeFineTuningPrompt,
}: Props) {
  const [fullscreenImageUrl, setFullscreenImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fullscreenImageUrl) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFullscreenImageUrl(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fullscreenImageUrl]);

  if (resultImageUrls.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-medium">Generated images</h3>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {resultImageUrls.map((url, index) => {
          const prompt = fineTuningPrompts[index] ?? "";
          const loading = fineTuningLoadingIndex === index;

          return (
            <div
              key={`${index}-${url.slice(0, 16)}`}
              className="flex h-full flex-col gap-2 rounded-xl border p-3"
            >
              <div className="h-56 w-full overflow-hidden rounded-xl border bg-white">
                <img
                  src={url}
                  alt={`Generated result ${index + 1}`}
                  className="h-full w-full cursor-zoom-in object-contain"
                  onClick={() => setFullscreenImageUrl(url)}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDownload(index)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium"
                >
                  Download
                </button>
                <button
                  type="button"
                  onClick={() => onMakeVideo(index)}
                  className="rounded-xl border px-4 py-2 text-sm font-medium"
                >
                  Make a video
                </button>
                <button
                  type="button"
                  onClick={() => onFineTune(index)}
                  disabled={loading || !prompt.trim()}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  {loading ? "Fine-tuning..." : "Fine-tune"}
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => onChangeFineTuningPrompt(index, e.target.value)}
                placeholder="Describe how to fine-tune this image..."
                className="rounded-xl border p-3 text-sm"
              />
            </div>
          );
        })}
      </div>

      {fullscreenImageUrl ? (
        <div
          className="fixed inset-0 z-50 bg-black/85 p-4 flex items-center justify-center"
          onClick={() => setFullscreenImageUrl(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-lg border border-white/40 bg-black/40 px-3 py-1 text-sm text-white"
            onClick={() => setFullscreenImageUrl(null)}
          >
            Close
          </button>
          <img
            src={fullscreenImageUrl}
            alt="Fullscreen generated result"
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
