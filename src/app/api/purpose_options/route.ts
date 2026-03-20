import { createClient } from "../../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: userError?.message ?? "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("setting")
      .select("purpose_prompt")
      .eq("user_id", user.id)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

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


