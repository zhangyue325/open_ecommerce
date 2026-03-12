"use client";

import type { UploadItem } from "./types";

type Props = {
  images: UploadItem[];
  onChangeImageName: (id: string, nextName: string) => void;
  onRemoveImage: (id: string) => void;
};

export default function ReferenceImageList({ images, onChangeImageName, onRemoveImage }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-medium">Reference Image list</h3>
      {images.length === 0 ? (
        <div className="rounded-xl border border-dashed p-4 text-sm">
          No images uploaded yet.
        </div>
      ) : (
        <div className="grid gap-3">
          {images.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border bg-white p-3 grid gap-3 md:grid-cols-[1fr_220px_100px]"
            >
              <div className="text-sm">
                <div className="font-medium">{item.file.name}</div>
                <div className="text-xs">{item.file.type || "image"}</div>
              </div>

              <input
                value={item.name}
                onChange={(e) => onChangeImageName(item.id, e.target.value)}
                placeholder="Image name"
                className="rounded-lg border px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={() => onRemoveImage(item.id)}
                className="rounded-lg border px-3 py-2 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
