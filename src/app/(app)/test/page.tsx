import { createClient } from "../../../../lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div>Not logged in</div>;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">User info</h1>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Auth user</h2>
        <pre className="rounded border p-4 overflow-auto text-xs">
          {JSON.stringify(user, null, 2)}
        </pre>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Profile row</h2>
        <pre className="rounded border p-4 overflow-auto text-xs">
          {JSON.stringify(profile ?? null, null, 2)}
        </pre>
      </section>

      {profileError && (
        <section className="space-y-2">
          <h2 className="text-lg font-medium">Profile query error</h2>
          <pre className="rounded border p-4 overflow-auto text-xs">
            {JSON.stringify(profileError, null, 2)}
          </pre>
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Quick fields</h2>
        <ul className="list-disc pl-5 text-sm">
          <li>ID: {user.id}</li>
          <li>Email: {user.email ?? "-"}</li>
          <li>Phone: {user.phone ?? "-"}</li>
          <li>Role: {user.role ?? "-"}</li>
          <li>Provider: {user.app_metadata?.provider ?? "-"}</li>
          <li>Created at: {user.created_at ?? "-"}</li>
          <li>Last sign-in: {user.last_sign_in_at ?? "-"}</li>
        </ul>
      </section>
    </div>
  );
}
