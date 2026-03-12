import { createClient } from "../../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("setting")
      .select("purpose_prompt")
      .eq("user_name", "Pazzion")
      .single();

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const purposePrompt =
      data?.purpose_prompt && typeof data.purpose_prompt === "object"
        ? (data.purpose_prompt as Record<string, unknown>)
        : {};

    const purposeOptions = Object.keys(purposePrompt);
    return Response.json({ purposeOptions });
  } catch (error) {
    const err = error as { message?: string; status?: number };
    return Response.json(
      { error: err.message ?? "Failed to load purpose options" },
      { status: err.status ?? 500 }
    );
  }
}
