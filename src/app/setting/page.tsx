"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

type PurposePromptItem = {
  id: string;
  name: string;
  prompt: string;
};

export default function SettingPage() {
  const supabase = createClient();

  const [setting, setSetting] = useState<any>(null);
  const [prompt, setPrompt] = useState("");
  const [purposeItems, setPurposeItems] = useState<PurposePromptItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("setting")
        .select("id,user_name,main_prompt,logo,purpose_prompt")
        .eq("user_name", "Pazzion")
        .single();

      if (!error && data) {
        setSetting(data);
        setPrompt(data.main_prompt || "");

        const rawPurposePrompt =
          data.purpose_prompt && typeof data.purpose_prompt === "object"
            ? data.purpose_prompt
            : {};

        const items = Object.entries(rawPurposePrompt).map(([name, value]) => ({
          id: `${Date.now()}-${Math.random()}-${name}`,
          name,
          prompt: String(value ?? ""),
        }));

        setPurposeItems(items);
      }

      setLoading(false);
    }

    load();
  }, []);

  async function save() {
    if (!setting) return;

    const purposePrompt: Record<string, string> = {};

    for (const item of purposeItems) {
      const key = item.name.trim();
      if (!key) continue;

      if (Object.prototype.hasOwnProperty.call(purposePrompt, key)) {
        alert(`Duplicate purpose: ${key}`);
        return;
      }

      purposePrompt[key] = item.prompt;
    }

    await supabase
      .from("setting")
      .update({ main_prompt: prompt, purpose_prompt: purposePrompt })
      .eq("id", setting.id);

    alert("Saved");
  }

  function addPurpose() {
    setPurposeItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        name: "",
        prompt: "",
      },
    ]);
  }

  function updatePurposeName(id: string, nextName: string) {
    setPurposeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name: nextName } : item))
    );
  }

  function updatePurposePrompt(id: string, nextPrompt: string) {
    setPurposeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, prompt: nextPrompt } : item))
    );
  }

  function removePurpose(id: string) {
    setPurposeItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <section className="surface-card p-6 md:p-8 flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold">Main Prompt</label>
        <p className="text-xs text-[color:var(--ink-muted)]">
          Applied across all generations before specific prompts.
        </p>
        <textarea
          className="min-h-[220px] rounded-2xl border border-(--ring) bg-white p-3 text-sm"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col">
            <label className="text-sm font-semibold">Purpose Prompts</label>
            <span className="text-xs text-[color:var(--ink-muted)]">
              Create, edit, or remove purpose-specific prompts.
            </span>
          </div>
          <button
            type="button"
            onClick={addPurpose}
            className="rounded-xl border border-(--ring) bg-white px-3 py-2 text-xs font-medium"
          >
            Add purpose
          </button>
        </div>

        {purposeItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--ring) p-4 text-sm text-[color:var(--ink-muted)]">
            No purpose yet. Click <strong>Add purpose</strong> to create one.
          </div>
        ) : (
          <div className="grid gap-4">
            {purposeItems.map((item, index) => (
              <div
                key={item.id}
                className="rounded-2xl border border-(--ring) bg-[color:var(--surface-2)] p-4 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-muted)]">
                    Purpose {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removePurpose(item.id)}
                    className="rounded-xl border border-(--ring) bg-white px-3 py-1.5 text-xs"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[color:var(--ink-muted)]">
                    Purpose name
                  </label>
                  <input
                    value={item.name}
                    onChange={(e) => updatePurposeName(item.id, e.target.value)}
                    placeholder="Example: ads creative"
                    className="rounded-xl border border-(--ring) bg-white px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-[color:var(--ink-muted)]">
                    Prompt text
                  </label>
                  <textarea
                    className="min-h-[150px] rounded-2xl border border-(--ring) bg-white p-3 text-sm"
                    value={item.prompt}
                    onChange={(e) => updatePurposePrompt(item.id, e.target.value)}
                    placeholder="Purpose prompt..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold">Logo</label>
        {setting.logo ? (
          <img
            src={setting.logo}
            alt="logo"
            className="w-[200px] rounded-xl border border-(--ring) bg-white p-2"
          />
        ) : (
          <p className="text-sm text-[color:var(--ink-muted)]">No logo found.</p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          title="Coming soon"
          disabled
          className="rounded-xl border border-(--ring) bg-white px-5 py-2 text-sm font-medium text-[color:var(--ink-muted)] disabled:opacity-80 disabled:cursor-not-allowed"
        >
          Test Main Prompt
        </button>
        <button
          type="button"
          onClick={save}
          className="rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white"
        >
          Save
        </button>
      </div>
    </section>
  );
}
