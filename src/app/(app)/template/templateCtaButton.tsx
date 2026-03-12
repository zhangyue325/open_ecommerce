"use client";

import { useRouter } from "next/navigation";
import { DraftPayload } from "../generation/types";

const DRAFT_KEY = "generate:draft";

export default function TemplateCtaButton({ draft }: { draft: DraftPayload }) {
  const router = useRouter();

  const onClick = () => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    router.push("/generation");
  };

  return (
    <button
      onClick={onClick}
      className="mt-1 inline-flex items-center justify-center rounded-xl bg-black px-3 py-2 text-xs font-medium text-white hover:opacity-90"
      type="button"
    >
      Design from this template
    </button>
  );
}
