import { createClient } from "../../../lib/supabase/server";
import TemplateList from "./templateList";

export default async function TemplatePage() {
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

  let templates: Array<{
    id: number;
    template_name: string | null;
    purpose: string | null;
    prompt: string | null;
    descriptive_image: string | null;
    ratio: string | null;
    model: string | null;
    author: string | null;
    type: string | null;
  }> = [];
  let purposeOptions: string[] = [];
  let loadError = "";

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (!userError && user) {
      const [{ data, error }, { data: settingData }] = await Promise.all([
        supabase
          .from("template")
          .select("id,template_name,purpose,prompt,descriptive_image,ratio,model,author,type")
          .eq("user_id", user.id)
          .or("deleted.is.null,deleted.eq.false")
          .order("id"),
        supabase
          .from("setting")
          .select("purpose_prompt")
          .eq("user_id", user.id)
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (error) {
        loadError = error.message;
      } else {
        templates = data ?? [];
      }

      const unique = (values: Array<string | null | undefined>) =>
        Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
      const dbPurposeOptions =
        settingData?.purpose_prompt && typeof settingData.purpose_prompt === "object"
          ? Object.keys(settingData.purpose_prompt as Record<string, unknown>)
          : [];
      purposeOptions = unique(dbPurposeOptions);
    }
  } catch {
    // Keep this page publicly accessible even if auth/session fetch fails.
  }

  return (
    <section className="h-full overflow-auto px-3 py-3 text-white">
      {loadError ? (
        <div className="mb-3 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-xs text-rose-200">
          {loadError}
        </div>
      ) : null}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        <TemplateList
          templates={templates}
          purposeOptions={purposeOptions}
          typeOptions={typeOptions}
          imageModelOptions={imageModelOptions}
          videoModelOptions={videoModelOptions}
          imageRatioOptions={imageRatioOptions}
          videoRatioOptions={videoRatioOptions}
        />
      </div>
    </section>
  );
}
