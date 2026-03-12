"use client";

import { FormEvent, useEffect, useState } from "react";

const AUTH_KEY = "simple-auth-ok";
const USERNAME = "pazzion";
const PASSWORD = "pazzion123";

export default function SimpleLoginGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const isAuthed = localStorage.getItem(AUTH_KEY) === "1";
    setAuthenticated(isAuthed);
    setReady(true);
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (username === USERNAME && password === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      setAuthenticated(true);
      setError("");
      return;
    }

    setError("Invalid username or password.");
  };

  if (!ready) return null;

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="fixed inset-0 bg-black/35 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-(--ring) bg-white p-6 shadow-2xl">
        <h2 className="text-lg font-semibold">Login Required</h2>
        <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
          Enter username and password to continue.
        </p>

        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="rounded-xl border border-(--ring) px-3 py-2 text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-xl border border-(--ring) px-3 py-2 text-sm"
          />

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

