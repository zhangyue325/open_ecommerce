import { GoogleGenAI, VideoGenerationReferenceType } from "@google/genai";
import { createClient } from "../../../../lib/supabase/server";

type ReferenceImage = {
  name?: string;
  mimeType?: string;
  data?: string;
};

type GenerateVideoPayload = {
  prompt?: string;
  purpose?: string;
  model?: string;
  aspectRatio?: string;
  videoLength?: string;
  resolution?: string;
  referenceImages?: ReferenceImage[];
};
const ALLOWED_MODELS = [
  "veo-3.1-generate-preview",
  "veo-3.1-fast-generate-preview",
] as const;
const DEFAULT_MODEL = "veo-3.1-generate-preview";

function getPurposePrompt(
  purposePrompt: unknown,
  purpose: string | undefined
): string {
  if (!purposePrompt || typeof purposePrompt !== "object") return "";
  const value = (purposePrompt as Record<string, unknown>)[purpose || ""];
  return typeof value === "string" ? value : "";
}

export async function POST(req: Request) {
  try {
    const {
      prompt,
      purpose,
      model,
      aspectRatio,
      videoLength,
      resolution,
      referenceImages,
    } = (await req.json()) as GenerateVideoPayload;

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Missing prompt" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const normalizedModel = typeof model === "string" && model.trim() ? model.trim() : DEFAULT_MODEL;
    if (!ALLOWED_MODELS.includes(normalizedModel as (typeof ALLOWED_MODELS)[number])) {
      return Response.json(
        { error: `Unsupported model: ${normalizedModel}` },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: setting, error: settingError } = await supabase
      .from("setting")
      .select("main_prompt,purpose_prompt,logo")
      .eq("user_name", "Pazzion")
      .single();

    if (settingError) {
      return Response.json(
        { error: `Failed to read setting info: ${settingError.message}` },
        { status: 500 }
      );
    }

    const purposePrompt = getPurposePrompt(setting?.purpose_prompt, purpose);
    const referenceNames =
      Array.isArray(referenceImages) && referenceImages.length > 0
        ? referenceImages
            .map((img) => (img.name || "").trim())
            .filter(Boolean)
            .join(", ")
        : "";

    const combinedPrompt = [
      // setting?.main_prompt || "",
      // purposePrompt,
      prompt,
    ]
      .filter(Boolean)
      .join("\n");

    const veoReferenceImages = Array.isArray(referenceImages)
      ? referenceImages
          .filter((image) => Boolean(image?.data))
          .map((image) => ({
            image: {
              imageBytes: image.data as string,
              mimeType: image.mimeType || "image/png",
            },
            referenceType: VideoGenerationReferenceType.ASSET,
          }))
      : [];

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const durationSeconds = Number(videoLength || "8");
    let operation = await ai.models.generateVideos({
      model: normalizedModel,
      prompt: combinedPrompt,
      config: {
        durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : 8,
        resolution: resolution || "720p",
        referenceImages: veoReferenceImages.length > 0 ? veoReferenceImages : undefined,
      },
    });

    for (let i = 0; i < 90 && !operation.done; i += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation });
    }

    const aiText =
      operation.response?.raiMediaFilteredReasons?.join("\n") ||
      "Video generated successfully.";

    if (!operation.done) {
      return Response.json(
        { error: "Video generation timed out", aiText },
        { status: 504 }
      );
    }

    if (operation.error) {
      return Response.json(
        { error: "Veo operation error", details: operation.error, aiText },
        { status: 500 }
      );
    }

    const generatedVideo = operation.response?.generatedVideos?.[0]?.video;
    if (generatedVideo?.videoBytes) {
      return Response.json({
        videoBase64: generatedVideo.videoBytes,
        mimeType: generatedVideo.mimeType || "video/mp4",
        aiText,
      });
    }

    const videoUri = generatedVideo?.uri;

    if (!videoUri) {
      if (operation.response?.raiMediaFilteredReasons?.length) {
        return Response.json({
          aiText,
          details: operation.response,
        });
      }

      return Response.json(
        { error: "No video URI returned", details: operation.response, aiText },
        { status: 500 }
      );
    }

    const videoRes = await fetch(videoUri, {
      headers: { "x-goog-api-key": process.env.GEMINI_API_KEY },
      redirect: "follow",
    });

    if (!videoRes.ok) {
      const detail = await videoRes.text();
      return Response.json(
        { error: "Failed to download video", details: detail },
        { status: 500 }
      );
    }

    const mimeType = videoRes.headers.get("content-type") || "video/mp4";
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
    const videoBase64 = videoBuffer.toString("base64");

    return Response.json({ videoBase64, mimeType, aiText });
  } catch (error) {
    console.error("generate_video failed:", error);
    const err = error as {
      message?: string;
      status?: number;
      code?: number;
      errorDetails?: unknown;
    };
    const errorMessage =
      err.message?.includes("Your use case is currently not supported")
        ? "Image-to-video generation is not enabled for this model/account combination yet."
        : err.message ?? "Video generation failed";
    return Response.json(
      {
        error: errorMessage,
        details: err.errorDetails ?? undefined,
      },
      { status: err.status ?? err.code ?? 500 }
    );
  }
}
