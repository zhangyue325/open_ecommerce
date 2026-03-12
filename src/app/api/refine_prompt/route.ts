import { GoogleGenAI } from "@google/genai";
import { createClient } from "../../../../lib/supabase/server";

type RefinePromptPayload = {
  prompt?: string;
  ratio?: string;
  resolution?: string;
  referenceImageNames?: string[];
};

export async function POST(req: Request) {
  try {
    const { prompt, ratio, resolution, referenceImageNames } =
      (await req.json()) as RefinePromptPayload;

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Missing prompt" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    let mainPrompt = "";
    const supabase = await createClient();
    const { data: setting } = await supabase
      .from("setting")
      .select("main_prompt")
      .eq("user_name", "Pazzion")
      .single();
    mainPrompt = setting?.main_prompt || "";

    const referencesText =
      Array.isArray(referenceImageNames) && referenceImageNames.length > 0
        ? `Reference images: ${referenceImageNames.join(", ")}`
        : "Reference images: none";

    const userText = [
      "Refine this image-generation prompt.",
      "Keep the original intent and product meaning.",
      "Make it clearer and more specific for high-quality creative output.",
      "Return only the refined prompt text.",
      mainPrompt ? `Brand context: ${mainPrompt}` : "",
      referencesText,
      `Original prompt: ${prompt}`,
    ]
      .filter(Boolean)
      .join("\n");

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: userText }] }],
    });

    const refinedPrompt =
      response.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || "")
        .join("\n")
        .trim() || "";

    if (!refinedPrompt) {
      return Response.json({ error: "No refined prompt returned" }, { status: 502 });
    }

    return Response.json({ refinedPrompt });
  } catch (error) {
    console.error("refine_prompt failed:", error);
    const err = error as { message?: string; status?: number };
    return Response.json(
      { error: err.message ?? "Prompt refinement failed" },
      { status: err.status ?? 500 }
    );
  }
}
