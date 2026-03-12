"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function DeleteTemplateButton({ templateId }: { templateId: number }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    const confirmed = window.confirm("Delete this template?");
    if (!confirmed) return;

    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("template")
      .update({ deleted: true })
      .eq("id", templateId);

    setDeleting(false);

    if (error) {
      window.alert(error.message);
      return;
    }

    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={deleting}
      aria-label="Delete template"
      title="Delete template"
      className="absolute right-2 top-2 rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-4 w-4"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}
