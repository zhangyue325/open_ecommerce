import { GoogleGenAI } from "@google/genai";
import { createClient } from "../../../../lib/supabase/server";

type ReferenceImage = {
  name?: string;
  mimeType?: string;
  data?: string;
};

const ALLOWED_IMAGE_MODELS = new Set([
  "gemini-3-pro-image-preview",
  "gemini-2.5-flash-image",
  "gemini-3.1-flash-image-preview",
]);

export async function POST(req: Request) {
  try {
    const { prompt, model, ratio, resolution, numberOfCreatives, referenceImages } = (await req.json()) as {
      prompt?: string;
      model?: string;
      ratio?: string;
      resolution?: string;
      numberOfCreatives?: number;
      referenceImages?: ReferenceImage[];
    };

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Missing prompt" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const selectedModel =
      model && ALLOWED_IMAGE_MODELS.has(model)
        ? model
        : "gemini-3.1-flash-image-preview";
    const creativeCount = Math.min(4, Math.max(1, Number(numberOfCreatives) || 1));

    const supabase = await createClient();
    const { data: setting, error: settingError } = await supabase
      .from("setting")
      .select("main_prompt,logo")
      .eq("user_name", "Pazzion")
      .single();

    if (settingError) {
      return Response.json({ error: `Failed to read setting info: ${settingError.message}` }, { status: 500 });
    }

    // prepare prompt
    const contentParts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [
      { text: setting?.main_prompt || "" },
      { text: prompt || "" },
    ];

    // prepare logo image
    if (setting?.logo) {
      const logoRes = await fetch(setting.logo);
      if (!logoRes.ok) {
        return Response.json({ error: "Failed to fetch logo image from setting.logo" }, { status: 500 });
      }
      const mimeType = logoRes.headers.get("content-type") || "image/png";
      const arrayBuffer = await logoRes.arrayBuffer();
      const data = Buffer.from(arrayBuffer).toString("base64");
      contentParts.push({ text: "logo image" });
      contentParts.push({ inlineData: { mimeType, data } });
    }

    // prepare reference image
    if (Array.isArray(referenceImages)) {
      for (const image of referenceImages) {
        if (!image?.data) continue;
        const imageName = (image.name || "reference image").trim();
        contentParts.push({ text: `reference image: ${imageName}` });
        contentParts.push({
          inlineData: { mimeType: image.mimeType || "image/png", data: image.data },
        });
      }
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const tasks = Array.from({ length: creativeCount }).map(async () => {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: [{ role: "user", parts: contentParts }],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: {
            aspectRatio: ratio,
            imageSize: resolution,
          },
        },
      });
      
      console.log(response);

      const parts = response.candidates?.[0]?.content?.parts ?? [];
      const imageBase64 = parts.find((part) => part.inlineData?.data)?.inlineData?.data ?? null;
      const textOutput = parts
        .map((part) => part.text?.trim())
        .filter((value): value is string => Boolean(value))
        .join("\n")
        .trim();

      return {
        imageBase64,
        textOutput: textOutput || null,
      };
    });

    const results = await Promise.all(tasks);
    const imageBase64List = results
      .map((item) => item.imageBase64)
      .filter((item): item is string => Boolean(item));
    const aiTextList = results
      .map((item) => item.textOutput)
      .filter((item): item is string => Boolean(item));

    if (imageBase64List.length === 0) {
      return Response.json({ error: "No image generated" }, { status: 502 });
    }

    return Response.json({
      imageBase64: imageBase64List[0],
      imageBase64List,
      aiText: aiTextList[0] || "",
      aiTextList,
    });
  } catch (error) {
    console.error("generate_image failed:", error);
    const err = error as { message?: string; status?: number };
    return Response.json(
      { error: err.message ?? "Image generation failed" },
      { status: err.status ?? 500 }
    );
  }
}
