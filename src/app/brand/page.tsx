"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import {
  BadgeCheck,
  Database,
  Globe2,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";

import {
  buildMainPromptFromIdentity,
  parseStructuredBrandIdentity,
  type BrandIdentity,
} from "@/lib/brand-identity";
import { createClient } from "../../../lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LoginModalTrigger from "../login/login-modal-trigger";

type SettingRecord = {
  id: number;
  user_id?: string | null;
  logo: string | null;
  main_prompt: string | null;
  purpose_prompt: unknown;
  sample_image?: unknown;
};

type GeneratedIdentity = BrandIdentity & {
  websiteUrl: string;
  logoUrl: string;
};

type ScanPromptResponse = {
  normalizedUrl: string;
  brandIdentity?: BrandIdentity;
  error?: string;
};

type ScanLogoResponse = {
  logoUrl: string;
  error?: string;
};

const BRAND_DRAFT_KEY = "brand-page-generated-draft";
const BRAND_PENDING_SAVE_KEY = "brand-page-pending-save";

function normalizeWebsiteInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function hasSavedIdentity(setting: SettingRecord | null) {
  return Boolean(setting?.main_prompt?.trim() || setting?.logo?.trim());
}

function readDraft() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(BRAND_DRAFT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<GeneratedIdentity>;
    if (
      typeof parsed.websiteUrl !== "string" ||
      typeof parsed.logoUrl !== "string" ||
      typeof parsed.tagline !== "string" ||
      !Array.isArray(parsed.brandValues) ||
      !Array.isArray(parsed.brandAesthetic) ||
      !Array.isArray(parsed.toneOfVoice) ||
      typeof parsed.businessOverview !== "string"
    ) {
      return null;
    }

    return {
      websiteUrl: parsed.websiteUrl,
      logoUrl: parsed.logoUrl,
      tagline: parsed.tagline,
      brandValues: parsed.brandValues.filter((item): item is string => typeof item === "string"),
      brandAesthetic: parsed.brandAesthetic.filter((item): item is string => typeof item === "string"),
      toneOfVoice: parsed.toneOfVoice.filter((item): item is string => typeof item === "string"),
      businessOverview: parsed.businessOverview,
    } satisfies GeneratedIdentity;
  } catch {
    return null;
  }
}

function writeDraft(draft: GeneratedIdentity) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRAND_DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BRAND_DRAFT_KEY);
}

function readPendingSave() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(BRAND_PENDING_SAVE_KEY) === "1";
}

function writePendingSave() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRAND_PENDING_SAVE_KEY, "1");
}

function clearPendingSave() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(BRAND_PENDING_SAVE_KEY);
}

function KeywordGroup({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-200"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function IdentitySection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      {children}
    </div>
  );
}

export default function BrandPage() {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [setting, setSetting] = useState<SettingRecord | null>(null);
  const [generatedIdentity, setGeneratedIdentity] = useState<GeneratedIdentity | null>(null);
  const [websiteInput, setWebsiteInput] = useState("");
  const [websiteModalOpen, setWebsiteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaveArmed, setAutoSaveArmed] = useState(false);
  const [message, setMessage] = useState("");

  const savedIdentityExists = useMemo(() => hasSavedIdentity(setting), [setting]);
  const savedStructuredIdentity = useMemo(
    () => parseStructuredBrandIdentity(setting?.main_prompt ?? ""),
    [setting?.main_prompt]
  );
  const displayedIdentity = generatedIdentity ?? savedStructuredIdentity;
  const displayedLogoUrl = generatedIdentity?.logoUrl || setting?.logo || "";

  const saveGeneratedIdentity = useCallback(
    async (identity: GeneratedIdentity) => {
      if (!authUser) return;

      const supabase = createClient();
      const payload = {
        user_id: authUser.id,
        logo: identity.logoUrl || null,
        main_prompt: buildMainPromptFromIdentity(identity),
        purpose_prompt: setting?.purpose_prompt ?? {},
        sample_image: setting?.sample_image ?? {},
      };

      setSaving(true);
      setMessage("");

      try {
        if (setting?.id) {
          const { data, error } = await supabase
            .from("setting")
            .update(payload)
            .eq("id", setting.id)
            .select("*")
            .single();

          if (error) throw error;
          setSetting(data as SettingRecord);
        } else {
          const { data, error } = await supabase.from("setting").insert(payload).select("*").single();

          if (error) throw error;
          setSetting(data as SettingRecord);
        }

        clearDraft();
        clearPendingSave();
        setGeneratedIdentity(null);
        setMessage("Brand identity saved to your account.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to save brand identity.");
      } finally {
        setSaving(false);
      }
    },
    [authUser, setting]
  );

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    const supabase = createClient();

    const loadForUser = async (user: User | null) => {
      const draft = readDraft();
      const pendingSave = readPendingSave();

      if (!active) return;
      setLoading(true);
      setAuthUser(user);
      setGeneratedIdentity(draft);
      setWebsiteInput(draft?.websiteUrl ?? "");
      setAutoSaveArmed(Boolean(draft && pendingSave));

      if (!draft && pendingSave) {
        clearPendingSave();
      }

      if (!user) {
        setSetting(null);
        setLoading(false);
        return;
      }

      const { data: settingData, error: settingError } = await supabase
        .from("setting")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;

      if (settingError) {
        setConfigError(settingError.message);
        setLoading(false);
        return;
      }

      setConfigError(null);
      setSetting((settingData as SettingRecord | null) ?? null);
      setLoading(false);
    };

    (async () => {
      const { data, error } = await supabase.auth.getUser();
      const isMissingSession =
        error?.message?.toLowerCase().includes("auth session missing") ||
        error?.message?.toLowerCase().includes("session");

      if (error && !isMissingSession) {
        setConfigError(error.message);
        setLoading(false);
        return;
      }

      await loadForUser(data.user ?? null);

      const { data: authData } = supabase.auth.onAuthStateChange(
        async (_event: AuthChangeEvent, session: Session | null) => {
          await loadForUser(session?.user ?? null);
        }
      );

      unsubscribe = () => authData.subscription.unsubscribe();
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (generatedIdentity) {
      writeDraft(generatedIdentity);
      return;
    }

    clearDraft();
  }, [generatedIdentity]);

  useEffect(() => {
    if (loading || configError) return;

    if (!savedIdentityExists && !generatedIdentity) {
      setWebsiteModalOpen(true);
    }
  }, [configError, generatedIdentity, loading, savedIdentityExists]);

  useEffect(() => {
    if (!websiteModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [websiteModalOpen]);

  useEffect(() => {
    if (loading || !autoSaveArmed || !authUser || !generatedIdentity || saving) return;

    setAutoSaveArmed(false);
    void saveGeneratedIdentity(generatedIdentity);
  }, [authUser, autoSaveArmed, generatedIdentity, loading, saveGeneratedIdentity, saving]);

  const onGenerateIdentity = async () => {
    const preparedWebsiteUrl = normalizeWebsiteInput(websiteInput);
    if (!preparedWebsiteUrl) {
      setMessage("Enter a website URL first.");
      return;
    }

    setScanLoading(true);
    setMessage("");
    setWebsiteInput(preparedWebsiteUrl);
    setWebsiteModalOpen(false);
    clearPendingSave();
    setAutoSaveArmed(false);

    try {
      const promptResponse = await fetch("/api/scan_website_prompt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ websiteUrl: preparedWebsiteUrl }),
      });

      const promptData = (await promptResponse.json()) as ScanPromptResponse;
      if (!promptResponse.ok) {
        throw new Error(promptData.error || "Unable to generate brand identity.");
      }

      const nextWebsiteUrl = promptData.normalizedUrl || preparedWebsiteUrl;
      let nextLogoUrl = "";

      const logoResponse = await fetch("/api/scan_website_logo", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ websiteUrl: nextWebsiteUrl }),
      });

      const logoData = (await logoResponse.json()) as ScanLogoResponse;
      if (logoResponse.ok && logoData.logoUrl) {
        nextLogoUrl = logoData.logoUrl;
      }

      if (!promptData.brandIdentity) {
        throw new Error("Unable to generate structured brand identity.");
      }

      setGeneratedIdentity({
        websiteUrl: nextWebsiteUrl,
        logoUrl: nextLogoUrl,
        tagline: promptData.brandIdentity.tagline,
        brandValues: promptData.brandIdentity.brandValues,
        brandAesthetic: promptData.brandIdentity.brandAesthetic,
        toneOfVoice: promptData.brandIdentity.toneOfVoice,
        businessOverview: promptData.brandIdentity.businessOverview,
      });
      setWebsiteInput(nextWebsiteUrl);
      setMessage("Brand identity generated. Review it before saving.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to generate brand identity.");
    } finally {
      setScanLoading(false);
    }
  };

  const onAskToSaveAfterLogin = () => {
    if (!generatedIdentity) return;

    writeDraft(generatedIdentity);
    writePendingSave();
    setAutoSaveArmed(true);
  };

  if (loading) {
    return <div className="h-full overflow-y-auto p-6 text-sm text-zinc-400">Loading brand identity...</div>;
  }

  if (configError) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <Alert variant="destructive">
          <AlertTitle>Brand settings unavailable</AlertTitle>
          <AlertDescription>{configError}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <>
      <div className="relative h-full overflow-y-auto bg-[#050608] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-500/15 blur-[140px]" />
          <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-[160px]" />
        </div>

        <section className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                <Sparkles className="size-3.5" />
                Brand identity
              </div>
              <p className="max-w-2xl text-sm text-zinc-400">
                Generate your brand identity from the website and review the logo, tagline, brand values,
                brand aesthetic, tone of voice, and business overview here.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              className="border-white/15 bg-white/0 text-white hover:bg-white/10"
              onClick={() => {
                setMessage("");
                setWebsiteModalOpen(true);
              }}
            >
              <RefreshCw className="size-4" />
              {savedIdentityExists ? "Regenerate from website" : "Start brand setup"}
            </Button>
          </div>

          {message ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200">
              {message}
            </div>
          ) : null}

          {scanLoading ? (
            <Card className="border-cyan-400/20 bg-[#081018]/90 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
              <CardContent className="flex flex-col items-center gap-4 px-6 py-12 text-center">
                <LoaderCircle className="size-8 animate-spin text-cyan-300" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">Generating brand identity</h2>
                  <p className="max-w-xl text-sm text-zinc-400">
                    The website is being scanned now. Once the logo, tagline, keywords, and overview are
                    ready, the page will move to review and confirmation.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {displayedIdentity || savedIdentityExists ? (
            <Card className="border-white/10 bg-[#0b0f15]/90 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
              <CardHeader className="gap-2">
                <div
                  className={
                    generatedIdentity
                      ? "inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-100"
                      : "inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-200"
                  }
                >
                  {generatedIdentity ? <WandSparkles className="size-3.5" /> : <Database className="size-3.5" />}
                  {generatedIdentity ? "Generated brand identity" : "Saved brand identity"}
                </div>
                <CardTitle className="text-white">
                  {generatedIdentity ? "Step 3: Confirm the brand identity" : "Current brand identity"}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  {generatedIdentity
                    ? "The generated result is shown below. If it looks right, save it to the database."
                    : "The brand page reflects the logo, tagline, values, aesthetic, tone of voice, and business overview currently saved for this account."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="space-y-4">
                  <div className="rounded-3xl border border-white/10 bg-white/95 p-6">
                    {displayedLogoUrl ? (
                      <img
                        src={displayedLogoUrl}
                        alt="Brand logo preview"
                        className="mx-auto max-h-28 w-full object-contain"
                      />
                    ) : (
                      <div className="flex min-h-28 items-center justify-center text-center text-sm text-zinc-500">
                        No logo preview found
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                    <div className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Website</div>
                    <div className="break-all">{generatedIdentity?.websiteUrl || websiteInput || "No website captured"}</div>
                  </div>
                </div>

                {displayedIdentity ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <IdentitySection label="Tagline">
                      <p className="text-sm text-zinc-100">{displayedIdentity.tagline}</p>
                    </IdentitySection>

                    <IdentitySection label="Brand values">
                      <KeywordGroup items={displayedIdentity.brandValues} />
                    </IdentitySection>

                    <IdentitySection label="Brand aesthetic">
                      <KeywordGroup items={displayedIdentity.brandAesthetic} />
                    </IdentitySection>

                    <IdentitySection label="Tone of voice">
                      <KeywordGroup items={displayedIdentity.toneOfVoice} />
                    </IdentitySection>

                    <div className="md:col-span-2">
                      <IdentitySection label="Business overview">
                        <p className="text-sm leading-6 text-zinc-300">{displayedIdentity.businessOverview}</p>
                      </IdentitySection>
                    </div>

                    {generatedIdentity ? (
                      <div className="flex flex-wrap gap-2 md:col-span-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-white/15 bg-white/0 text-white hover:bg-white/10"
                          onClick={() => {
                            setMessage("");
                            setWebsiteModalOpen(true);
                          }}
                        >
                          <RefreshCw className="size-4" />
                          Not good enough
                        </Button>

                        {authUser ? (
                          <Button
                            type="button"
                            disabled={saving || !generatedIdentity.businessOverview.trim() || !generatedIdentity.tagline.trim()}
                            className="bg-emerald-400 text-black hover:bg-emerald-300"
                            onClick={() => {
                              clearPendingSave();
                              setAutoSaveArmed(false);
                              void saveGeneratedIdentity(generatedIdentity);
                            }}
                          >
                            {saving ? (
                              <>
                                <LoaderCircle className="size-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <BadgeCheck className="size-4" />
                                Looks good, save
                              </>
                            )}
                          </Button>
                        ) : (
                          <LoginModalTrigger
                            label={
                              <span className="inline-flex items-center gap-2">
                                <BadgeCheck className="size-4" />
                                Looks good, log in to save
                              </span>
                            }
                            nextPath="/brand"
                            className="bg-emerald-400 text-black hover:bg-emerald-300"
                            onOpen={onAskToSaveAfterLogin}
                          />
                        )}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                      This brand was saved before structured identity fields were added. Regenerate from the
                      website to populate logo, tagline, brand values, brand aesthetic, tone of voice, and
                      business overview.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}

          {!savedIdentityExists && !generatedIdentity && !scanLoading ? (
            <Card className="border-dashed border-white/10 bg-[#0b0f15]/80 text-white shadow-[0_18px_60px_rgba(0,0,0,0.25)]">
              <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
                <Globe2 className="size-8 text-zinc-500" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">No brand identity yet</h2>
                  <p className="max-w-xl text-sm text-zinc-400">
                    Start with the website, generate the brand identity from that source, then confirm before
                    anything gets saved.
                  </p>
                </div>
                <Button
                  type="button"
                  className="bg-emerald-400 text-black hover:bg-emerald-300"
                  onClick={() => setWebsiteModalOpen(true)}
                >
                  <Globe2 className="size-4" />
                  Enter website
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </section>
      </div>

      {websiteModalOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (savedIdentityExists || generatedIdentity) {
              setWebsiteModalOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0c1016] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                  <Globe2 className="size-3.5" />
                  Step 1
                </div>
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                  Enter the brand website
                </h2>
                <p className="text-sm text-zinc-400">
                  If the user has not set up the brand identity yet, this is the first thing we ask for.
                </p>
              </div>

              {savedIdentityExists || generatedIdentity ? (
                <button
                  type="button"
                  className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                  onClick={() => setWebsiteModalOpen(false)}
                  aria-label="Close website modal"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            <div className="mt-6 space-y-4">
              <Input
                type="text"
                inputMode="url"
                autoFocus
                value={websiteInput}
                onChange={(event) => setWebsiteInput(event.target.value)}
                placeholder="https://www.yourstore.com"
                className="h-11 border-white/10 bg-white/5 px-4 text-white placeholder:text-zinc-500"
              />

              <div className="flex flex-wrap justify-end gap-2">
                {(savedIdentityExists || generatedIdentity) && !scanLoading ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="border-white/15 bg-white/0 text-white hover:bg-white/10"
                    onClick={() => setWebsiteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                ) : null}

                <Button
                  type="button"
                  disabled={scanLoading}
                  className="bg-emerald-400 text-black hover:bg-emerald-300"
                  onClick={onGenerateIdentity}
                >
                  {scanLoading ? (
                    <>
                      <LoaderCircle className="size-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Generate brand identity
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
