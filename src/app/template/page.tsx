import { createClient } from "../../../lib/supabase/server";
import TemplateList from "./templateList";

export default async function TemplatePage() {
  const supabase = await createClient();

  const [{ data: templates, error }, { data: settingData }] = await Promise.all([
    supabase
      .from("template")
      .select("id,template_name,purpose,prompt,descriptive_image,ratio,model,author,type")
      .or("deleted.is.null,deleted.eq.false")
      .order("id"),
    supabase
      .from("setting")
      .select("purpose_prompt")
      .eq("user_name", "Pazzion")
      .single(),
  ]);

  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const unique = (values: Array<string | null | undefined>) =>
    Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));

  const dbPurposeOptions =
    settingData?.purpose_prompt && typeof settingData.purpose_prompt === "object"
      ? Object.keys(settingData.purpose_prompt as Record<string, unknown>)
      : [];
  const purposeOptions = unique(dbPurposeOptions);
  const typeOptions = ["image", "video"];
  const imageModelOptions = [
    "gemini-3-pro-image-preview",
    "gemini-2.5-flash-image",
    "gemini-3.1-flash-image-preview",
  ];
  const videoModelOptions = [
    "veo-3.1-generate-preview",
    "veo-3.1-fast-generate-preview",
  ];
  const imageRatioOptions = ["1:1", "2:3", "3:2", "4:5", "5:4", "9:16", "16:9", "21:9"];
  const videoRatioOptions = ["16:9", "9:16"];

  return (
    <section className="p-6 grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
      <TemplateList
        templates={templates ?? []}
        purposeOptions={purposeOptions}
        typeOptions={typeOptions}
        imageModelOptions={imageModelOptions}
        videoModelOptions={videoModelOptions}
        imageRatioOptions={imageRatioOptions}
        videoRatioOptions={videoRatioOptions}
      />
    </section>
  );
}
