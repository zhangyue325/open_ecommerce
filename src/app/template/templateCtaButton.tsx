"use client";

import { useRouter } from "next/navigation";

type DraftPayload = {
  templateId?: number;
  prompt: string;
  purpose?: string;
  type: "image" | "video";
  model?: string;
  ratio?: string;
};

const DRAFT_KEY = "generate:draft";

export default function TemplateCtaButton({ draft }: { draft: DraftPayload }) {
  const router = useRouter();

  const onClick = () => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    router.push("/workspace");
  };

  return (
    <button
      onClick={onClick}
      className="mt-1 inline-flex items-center justify-center rounded-xl bg-emerald-400 px-3 py-2 text-xs font-semibold text-black transition hover:bg-emerald-300"
      type="button"
    >
      Design from this template
    </button>
  );
}
