"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

  const onGeneratePrompt = async (event: FormEvent<HTMLFormElement>) => {
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
        <StepTag active={step === "login"}>4. Login and Save</StepTag>
      </div>

      {step === "input" ? (
        <Card className="rounded-xl border border-border/80 bg-background/70 py-0 shadow-none">
          <CardContent className="p-4 md:p-5">
            <form onSubmit={onGeneratePrompt} className="flex flex-col gap-3 md:flex-row">
              <Input
                type="text"
                inputMode="url"
                value={websiteInput}
                onChange={(e) => setWebsiteInput(e.target.value)}
                placeholder="www.yourdomain.com"
                className="h-11 px-4"
                required
              />
              <Button type="submit" size="lg" disabled={isGeneratingPrompt} className="md:min-w-56">
                {isGeneratingPrompt ? "Scanning website..." : "Generate your creatives now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {step === "confirmPrompt" ? (
        <Card className="rounded-xl border border-border/80 bg-background/70 py-0 shadow-none">
          <CardContent className="space-y-3 p-4 md:p-5">
            <p className="text-sm text-muted-foreground">Review and confirm your generated main prompt.</p>
            <Textarea
              value={mainPrompt}
              onChange={(e) => setMainPrompt(e.target.value)}
              className="min-h-[180px] p-3"
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="lg" onClick={() => setStep("input")}>
                Back
              </Button>
              <Button type="button" size="lg" onClick={onContinueToLogo} disabled={isLoadingLogo}>
                {isLoadingLogo ? "Fetching logo..." : "Confirm prompt and continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "confirmLogo" ? (
        <Card className="rounded-xl border border-border/80 bg-background/70 py-0 shadow-none">
          <CardContent className="space-y-3 p-4 md:p-5">
            <p className="text-sm text-muted-foreground">
              We found your website logo from favicon. Confirm and continue.
            </p>

            <div className="flex min-h-[96px] w-fit items-center justify-center rounded-lg border border-border bg-background p-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Website logo from favicon" className="h-16 w-16 object-contain" />
              ) : (
                <span className="text-sm text-muted-foreground">No logo found</span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="lg" onClick={() => setStep("confirmPrompt")}>
                Back
              </Button>
              <Button type="button" size="lg" onClick={() => setStep("login")}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {step === "login" ? (
        <Card className="rounded-xl border border-border/80 bg-background/70 py-0 shadow-none">
          <CardContent className="space-y-3 p-4 md:p-5">
            <p className="text-sm text-muted-foreground">
              Login with Google to store this website prompt and logo in your account settings.
            </p>
            <Link href={loginHref} className={cn(buttonVariants({ size: "lg" }), "w-fit px-5")}>
              Continue with Google to save
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {errorMessage ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function StepTag({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-full border px-3 py-1",
        active
          ? "border-foreground/20 bg-foreground/5 text-foreground"
          : "border-border bg-background text-muted-foreground"
      )}
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
