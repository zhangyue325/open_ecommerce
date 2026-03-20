"use client";

import { useRef } from "react";
import { ChevronDown, Crop, Gem, ImagePlus, Minus, Plus, Sparkles, WandSparkles } from "lucide-react";

const MODEL_OPTIONS = ["Soul 2.0", "Flux Pro", "GPT Image 1", "Imagen 4"];
const RATIO_OPTIONS = ["1:1", "3:4", "4:5", "16:9", "9:16"];
const RESOLUTION_OPTIONS = [
  { value: "1024x1024", label: "1k" },
  { value: "1536x1024", label: "1.5k" },
  { value: "2048x2048", label: "2k" },
];

type WorkspaceComposerControlsProps = {
  model: string;
  ratio: string;
  resolution: string;
  promptEnhance: boolean;
  batchSize: number;
  onChangeModel: (value: string) => void;
  onChangeRatio: (value: string) => void;
  onChangeResolution: (value: string) => void;
  onChangePromptEnhance: (value: boolean) => void;
  onChangeBatchSize: (value: number) => void;
  onUploadImages: (files: FileList | null) => void;
};

export default function WorkspaceComposerControls({
  model,
  ratio,
  resolution,
  promptEnhance,
  batchSize,
  onChangeModel,
  onChangeRatio,
  onChangeResolution,
  onChangePromptEnhance,
  onChangeBatchSize,
  onUploadImages,
}: WorkspaceComposerControlsProps) {
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const resolutionLabel =
    RESOLUTION_OPTIONS.find((option) => option.value === resolution)?.label ?? RESOLUTION_OPTIONS[0].label;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => {
          onUploadImages(event.target.files);
          event.currentTarget.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => uploadInputRef.current?.click()}
        title="Upload images"
        className="inline-flex size-10 items-center justify-center rounded-xl border border-[#d3d7de] bg-white text-[#687084] transition hover:bg-[#eef1f5]"
      >
        <ImagePlus className="size-4" />
      </button>

      <SelectPill
        icon={<WandSparkles className="size-3.5 text-[#4a596e]" />}
        label={model}
        value={model}
        options={MODEL_OPTIONS}
        onChange={onChangeModel}
      />

      <SelectPill
        icon={<Crop className="size-3.5 text-[#5f6778]" />}
        label={ratio}
        value={ratio}
        options={RATIO_OPTIONS}
        onChange={onChangeRatio}
      />

      <SelectPill
        icon={<Gem className="size-3.5 text-[#5f6778]" />}
        label={resolutionLabel}
        value={resolution}
        options={RESOLUTION_OPTIONS.map((option) => option.value)}
        labels={Object.fromEntries(RESOLUTION_OPTIONS.map((option) => [option.value, option.label]))}
        onChange={onChangeResolution}
      />

      <BatchPill batchSize={batchSize} onChangeBatchSize={onChangeBatchSize} />

      <button
        type="button"
        onClick={() => onChangePromptEnhance(!promptEnhance)}
        className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition ${
          promptEnhance
            ? "border-[#b9d78a] bg-[#f1f9e4] text-[#3f6120]"
            : "border-[#d3d7de] bg-white text-[#596072] hover:bg-[#eef1f5]"
        }`}
      >
        <Sparkles className="size-3.5" />
        Prompt Enhance
      </button>
    </div>
  );
}

function SelectPill({
  icon,
  label,
  value,
  options,
  labels,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  options: string[];
  labels?: Record<string, string>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3d7de] bg-white px-3 text-sm text-[#50596d] transition hover:bg-[#eef1f5]">
      <span className="shrink-0">{icon}</span>
      <span className="max-w-28 truncate">{label}</span>
      <ChevronDown className="size-3.5 text-[#9098a8]" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label={label}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {labels?.[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function BatchPill({
  batchSize,
  onChangeBatchSize,
}: {
  batchSize: number;
  onChangeBatchSize: (value: number) => void;
}) {
  const onDecrease = () => onChangeBatchSize(Math.max(1, batchSize - 1));
  const onIncrease = () => onChangeBatchSize(Math.min(4, batchSize + 1));

  return (
    <div className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#d3d7de] bg-white px-2 text-sm text-[#4f586b]">
      <button
        type="button"
        onClick={onDecrease}
        className="inline-flex size-7 items-center justify-center rounded-md text-[#7f8899] transition hover:bg-[#eef1f5] hover:text-[#2f3542]"
        aria-label="Decrease batch size"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-10 text-center text-sm font-medium">{batchSize}/4</span>
      <button
        type="button"
        onClick={onIncrease}
        className="inline-flex size-7 items-center justify-center rounded-md text-[#7f8899] transition hover:bg-[#eef1f5] hover:text-[#2f3542]"
        aria-label="Increase batch size"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
