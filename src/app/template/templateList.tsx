"use client";

import { useMemo, useState } from "react";
import TemplateCtaButton from "./templateCtaButton";
import DeleteTemplateButton from "./deleteTemplateButton";
import CreateTemplateCard from "./createTemplateCard";
import TemplateFilters from "./templateFilters";

type TemplateItem = {
  id: number;
  template_name: string | null;
  purpose: string | null;
  prompt: string | null;
  descriptive_image: string | null;
  ratio: string | null;
  model: string | null;
  author: string | null;
  type: string | null;
};

type Props = {
  templates: TemplateItem[];
  purposeOptions: string[];
  typeOptions: string[];
  imageModelOptions: string[];
  videoModelOptions: string[];
  imageRatioOptions: string[];
  videoRatioOptions: string[];
};

export default function TemplateList({
  templates,
  purposeOptions,
  typeOptions,
  imageModelOptions,
  videoModelOptions,
  imageRatioOptions,
  videoRatioOptions,
}: Props) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [purposeFilter, setPurposeFilter] = useState<string>("all");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [ratioFilter, setRatioFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const unique = (values: Array<string | null | undefined>) =>
    Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));

  const modelOptions = unique(templates.map((item) => item.model));
  const ratioOptions = unique(templates.map((item) => item.ratio));
  const authorOptions = unique(templates.map((item) => item.author));

  const filteredTemplates = useMemo(() => {
    const q = query.trim().toLowerCase();

    return templates.filter((item) => {
      if (typeFilter !== "all" && (item.type || "image") !== typeFilter) return false;
      if (purposeFilter !== "all" && (item.purpose || "") !== purposeFilter) return false;
      if (modelFilter !== "all" && (item.model || "") !== modelFilter) return false;
      if (ratioFilter !== "all" && (item.ratio || "") !== ratioFilter) return false;
      if (authorFilter !== "all" && (item.author || "") !== authorFilter) return false;

      if (!q) return true;
      const haystack = [
        item.template_name || "",
        item.prompt || "",
        item.purpose || "",
        item.model || "",
        item.author || "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [templates, typeFilter, purposeFilter, modelFilter, ratioFilter, authorFilter, query]);

  const isVideoSource = (src: string) =>
    src.startsWith("data:video/") ||
    /\.(mp4|webm|mov|avi|mkv|m4v)(\?|#|$)/i.test(src);

  return (
    <>
      <TemplateFilters
        typeOptions={typeOptions}
        purposeOptions={purposeOptions}
        modelOptions={modelOptions}
        ratioOptions={ratioOptions}
        authorOptions={authorOptions}
        typeFilter={typeFilter}
        purposeFilter={purposeFilter}
        modelFilter={modelFilter}
        ratioFilter={ratioFilter}
        authorFilter={authorFilter}
        query={query}
        onChangeType={setTypeFilter}
        onChangePurpose={setPurposeFilter}
        onChangeModel={setModelFilter}
        onChangeRatio={setRatioFilter}
        onChangeAuthor={setAuthorFilter}
        onChangeQuery={setQuery}
      />

      <CreateTemplateCard
        purposeOptions={purposeOptions}
        typeOptions={typeOptions}
        imageModelOptions={imageModelOptions}
        videoModelOptions={videoModelOptions}
        imageRatioOptions={imageRatioOptions}
        videoRatioOptions={videoRatioOptions}
      />

      {filteredTemplates.length === 0 ? (
        <div className="col-span-2 rounded-xl border border-dashed border-white/15 bg-[#0a0d12]/90 px-4 py-10 text-center text-sm text-zinc-400 md:col-span-4 lg:col-span-5">
          No templates found for your current filters.
        </div>
      ) : null}

      {filteredTemplates.map((t) => (
        <div key={t.id} className="relative flex flex-col gap-2 rounded-xl border border-white/10 bg-[#0a0d12]/90 p-3">
          <DeleteTemplateButton templateId={t.id} />
          {t.descriptive_image &&
            (isVideoSource(t.descriptive_image) ? (
              <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-lg bg-black/30">
                <video
                  src={t.descriptive_image}
                  className="max-h-full max-w-full object-contain"
                  controls
                  muted
                  playsInline
                />
              </div>
            ) : (
              <div className="flex h-56 w-full items-center justify-center overflow-hidden rounded-lg bg-black/30">
                <img
                  src={t.descriptive_image}
                  className="max-h-full max-w-full object-contain"
                  alt=""
                />
              </div>
            ))}

          <h3 className="text-sm font-medium text-zinc-100">{t.template_name || `Template ${t.id}`}</h3>
          <p className="text-xs text-zinc-400">{t.type || "image"} | {t.purpose || "-"}</p>
          <p className="text-xs text-zinc-400">{t.model || "-"}</p>
          <p className="text-xs text-zinc-400">ratio: {t.ratio || "-"}</p>
          <p className="text-xs text-zinc-400">author: {t.author || "-"}</p>
          <p className="line-clamp-3 text-xs text-zinc-300">{t.prompt}</p>

          <TemplateCtaButton
            draft={{
              templateId: t.id,
              prompt: t.prompt ?? "",
              purpose: t.purpose ?? undefined,
              type: (t.type as "image" | "video") ?? "image",
              model: t.model ?? undefined,
              ratio: t.ratio ?? undefined,
            }}
          />
        </div>
      ))}
    </>
  );
}
