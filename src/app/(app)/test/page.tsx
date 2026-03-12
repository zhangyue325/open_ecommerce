"use client";

import { useState } from "react";

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setImageUrl("");

    const res = await fetch("/api/generate_image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed");
      setLoading(false);
      return;
    }

    setImageUrl(`data:image/png;base64,${data.imageBase64}`);
    setLoading(false);
  }

  return (
    <div style={{ padding: 40 }}>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt"
      />

      <br />

      <button onClick={handleGenerate} disabled={loading || !prompt.trim()}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {error ? <pre>{error}</pre> : null}
      {imageUrl ? <img src={imageUrl} alt="Generated" style={{ marginTop: 16, maxWidth: "100%" }} /> : null}
    </div>
  );
}
