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

      {filteredTemplates.map((t) => (
        <div key={t.id} className="relative border rounded-xl p-3 flex flex-col gap-2">
          <DeleteTemplateButton templateId={t.id} />
          {t.descriptive_image &&
            (isVideoSource(t.descriptive_image) ? (
              <div className="w-full h-56 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                <video
                  src={t.descriptive_image}
                  className="max-h-full max-w-full object-contain"
                  controls
                  muted
                  playsInline
                />
              </div>
            ) : (
              <div className="w-full h-56 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
                <img
                  src={t.descriptive_image}
                  className="max-h-full max-w-full object-contain"
                  alt=""
                />
              </div>
            ))}

          <h3 className="font-medium text-sm">{t.template_name || `Template ${t.id}`}</h3>
          <p className="text-xs text-gray-500">{t.type || "image"} | {t.purpose || "-"}</p>
          <p className="text-xs text-gray-500">{t.model || "-"}</p>
          <p className="text-xs text-gray-500">ratio: {t.ratio || "-"}</p>
          <p className="text-xs text-gray-500">author: {t.author || "-"}</p>
          <p className="text-xs text-gray-600 line-clamp-3">{t.prompt}</p>

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
