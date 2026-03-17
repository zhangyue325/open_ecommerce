"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type FlowStep = "input" | "confirmPrompt" | "confirmLogo" | "login";

type ScanPromptResponse = {
  normalizedUrl: string;
  mainPrompt: string;
  error?: string;
};

type ScanLogoResponse = {
  logoUrl: string;
  error?: string;
};

export default function WebsiteScanWizard() {
  const [step, setStep] = useState<FlowStep>("input");
  const [websiteInput, setWebsiteInput] = useState("");
  const [normalizedUrl, setNormalizedUrl] = useState("");
  const [mainPrompt, setMainPrompt] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isLoadingLogo, setIsLoadingLogo] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loginHref = useMemo(() => {
    if (!normalizedUrl || !mainPrompt.trim()) {
      return "/login";
    }

    const token = encodeScanToken({
      websiteUrl: normalizedUrl,
      mainPrompt: mainPrompt.trim(),
      logoUrl,
      createdAt: Date.now(),
    });

    const nextPath = `/scan/complete?token=${token}`;
    return `/login?next=${encodeURIComponent(nextPath)}`;
  }, [logoUrl, mainPrompt, normalizedUrl]);

  const onGeneratePrompt = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const preparedWebsiteUrl = normalizeWebsiteInput(websiteInput);
    if (!preparedWebsiteUrl) {
      setErrorMessage("Please enter a website URL.");
      return;
    }

    setErrorMessage("");
    setIsGeneratingPrompt(true);
    setWebsiteInput(preparedWebsiteUrl);

    try {
      const response = await fetch("/api/scan_website_prompt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ websiteUrl: preparedWebsiteUrl }),
      });

      const data = (await response.json()) as ScanPromptResponse;
      if (!response.ok) {
        throw new Error(data.error || "Unable to generate prompt.");
      }

      setNormalizedUrl(data.normalizedUrl);
      setMainPrompt(data.mainPrompt || "");
      setLogoUrl(null);
      setStep("confirmPrompt");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to generate prompt.");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const onContinueToLogo = async () => {
    if (!mainPrompt.trim()) {
      setErrorMessage("Main prompt cannot be empty.");
      return;
    }

    setErrorMessage("");
    setIsLoadingLogo(true);

    try {
      const websiteUrlForLogo = normalizedUrl || normalizeWebsiteInput(websiteInput);
      const response = await fetch("/api/scan_website_logo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ websiteUrl: websiteUrlForLogo }),
      });

      const data = (await response.json()) as ScanLogoResponse;
      if (!response.ok) {
        throw new Error(data.error || "Unable to load website logo.");
      }

      setLogoUrl(data.logoUrl || null);
      setStep("confirmLogo");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load website logo.");
    } finally {
      setIsLoadingLogo(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
        <StepTag active={step === "input"}>1. Scan URL</StepTag>
        <StepTag active={step === "confirmPrompt"}>2. Confirm Prompt</StepTag>
        <StepTag active={step === "confirmLogo"}>3. Confirm Logo</StepTag>
        <StepTag active={step === "login"}>4. Login & Save</StepTag>
      </div>

      {step === "input" ? (
        <form onSubmit={onGeneratePrompt} className="flex flex-col gap-3 md:flex-row">
          <input
            type="text"
            inputMode="url"
            value={websiteInput}
            onChange={(e) => setWebsiteInput(e.target.value)}
            placeholder="www.yourdomain.com"
            className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none ring-0 placeholder:text-muted-foreground/70 focus:border-foreground/40"
            required
          />
          <button
            type="submit"
            disabled={isGeneratingPrompt}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {isGeneratingPrompt ? "Scanning website..." : "generate your creatives now"}
          </button>
        </form>
      ) : null}

      {step === "confirmPrompt" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Review and confirm your generated main prompt.</p>
          <textarea
            value={mainPrompt}
            onChange={(e) => setMainPrompt(e.target.value)}
            className="min-h-[180px] w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-foreground/40"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep("input")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onContinueToLogo}
              disabled={isLoadingLogo}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {isLoadingLogo ? "Fetching logo..." : "Confirm prompt and continue"}
            </button>
          </div>
        </div>
      ) : null}

      {step === "confirmLogo" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            We found your website logo from favicon. Confirm and continue.
          </p>

          <div className="flex min-h-[96px] w-fit items-center justify-center rounded-lg border border-border bg-background p-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="Website logo from favicon"
                className="h-16 w-16 object-contain"
              />
            ) : (
              <span className="text-sm text-muted-foreground">No logo found</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStep("confirmPrompt")}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium hover:bg-muted"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep("login")}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}

      {step === "login" ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Login with Google to store this website prompt and logo in your account settings.
          </p>
          <Link
            href={loginHref}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Continue with Google to save
          </Link>
        </div>
      ) : null}

      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}

function StepTag({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 ${
        active
          ? "border-foreground/20 bg-foreground/5 text-foreground"
          : "border-border bg-background text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function encodeScanToken(payload: {
  websiteUrl: string;
  mainPrompt: string;
  logoUrl: string | null;
  createdAt: number;
}) {
  const json = JSON.stringify(payload);
  const utf8 = new TextEncoder().encode(json);
  let binary = "";

  utf8.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function normalizeWebsiteInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
