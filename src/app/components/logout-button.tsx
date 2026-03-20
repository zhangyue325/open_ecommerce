"use client";

import { useRouter } from "next/navigation";

import { createClient } from "../../../lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={onLogout}
      className="rounded-full border border-(--ring) px-3 py-1 text-xs font-semibold"
    >
      Logout
    </button>
  );
}
