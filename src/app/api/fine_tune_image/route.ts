import { GoogleGenAI } from "@google/genai";
import { createClient } from "../../../../lib/supabase/server";

type FineTunePayload = {
  fineTuningPrompt?: string;
  imageBase64?: string;
  imageMimeType?: string;
  model?: string;
  ratio?: string;
  resolution?: string;
  referenceImages?: Array<{
    name?: string;
    mimeType?: string;
    data?: string;
  }>;
};

const ALLOWED_IMAGE_MODELS = new Set([
  "gemini-3-pro-image-preview",
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image-preview",
]);

export async function POST(req: Request) {
  try {
    const { fineTuningPrompt, imageBase64, imageMimeType, model, ratio, resolution, referenceImages } = (await req.json()) as FineTunePayload;

    if (!fineTuningPrompt || typeof fineTuningPrompt !== "string") {
      return Response.json({ error: "Missing fineTuningPrompt" }, { status: 400 });
    }

    if (!imageBase64 || typeof imageBase64 !== "string") {
      return Response.json({ error: "Missing imageBase64" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const selectedModel =
      model && ALLOWED_IMAGE_MODELS.has(model)
        ? model
        : "gemini-3.1-flash-image-preview";

    const supabase = await createClient();
    const { data: setting, error: settingError } = await supabase
      .from("setting")
      .select("main_prompt,logo")
      .eq("user_name", "Pazzion")
      .single();

    if (settingError) {
      return Response.json({ error: `Failed to read setting: ${settingError.message}` }, { status: 500 });
    }


    const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: fineTuningPrompt },
      { text: "the image to be refined"},
      { inlineData: {mimeType: imageMimeType || "image/png",data: imageBase64,}}, 
    ];

    if (setting?.logo) {
      const logoRes = await fetch(setting.logo);
      if (!logoRes.ok) {
        return Response.json({ error: "Failed to fetch logo image from setting.logo" }, { status: 500 });
      }

      const logoMimeType = logoRes.headers.get("content-type") || "image/png";
      const logoBuffer = await logoRes.arrayBuffer();
      const logoBase64 = Buffer.from(logoBuffer).toString("base64");
      contentParts.push({ text: "logo image" });
      contentParts.push({ inlineData: { mimeType: logoMimeType, data: logoBase64 } });
    }

    if (Array.isArray(referenceImages)) {
      for (const image of referenceImages) {
        if (!image?.data) continue;
        const imageName = (image.name || "reference image").trim();
        contentParts.push({ text: `${imageName}` });
        contentParts.push({
          inlineData: { mimeType: image.mimeType || "image/png", data: image.data },
        });
      }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: [{ role: "user", parts: contentParts }],
      config: {
        imageConfig: {
          aspectRatio: ratio,
          imageSize: resolution,
        },
      },
    });

    const resultParts = response.candidates?.[0]?.content?.parts ?? [];
    const fineTunedImageBase64 = resultParts.find((part) => part.inlineData?.data)?.inlineData?.data;

    if (!fineTunedImageBase64) {
      return Response.json({ error: "No image generated" }, { status: 502 });
    }

    return Response.json({ imageBase64: fineTunedImageBase64 });
  } catch (error) {
    console.error("fine_tune_image failed:", error);
    const err = error as { message?: string; status?: number };
    return Response.json(
      { error: err.message ?? "Fine-tuning failed" },
      { status: err.status ?? 500 }
    );
  }
}
