"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { Globe2, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";

import {
  buildMainPromptFromIdentity,
  parseStructuredBrandIdentity,
  type BrandIdentity,
} from "@/lib/brand-identity";
import { createClient } from "../../../lib/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import BrandIdentityCard from "./brand-identity-card";
import {
  clearDraft,
  clearPendingSave,
  type BrandDraft,
  type BrandProduct,
  hasSavedIdentity,
  normalizeWebsiteInput,
  readDraft,
  readPendingSave,
  writeDraft,
  writePendingSave,
} from "./brand-draft-storage";
import WebsiteModal from "./website-modal";

type SettingRecord = {
  id: number;
  user_id?: string | null;
  logo: string | null;
  main_prompt: string | null;
  products?: unknown;
  purpose_prompt: unknown;
  sample_image?: unknown;
};

type GeneratedIdentity = BrandDraft;

type ScanPromptResponse = {
  normalizedUrl: string;
  brandIdentity?: BrandIdentity;
  products?: BrandProduct[];
  error?: string;
};

type ScanLogoResponse = {
  logoUrl: string;
  error?: string;
};

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
  const savedProducts = useMemo(() => normalizeProducts(setting?.products), [setting?.products]);
  const displayedIdentity = generatedIdentity ?? savedStructuredIdentity;
  const displayedLogoUrl = generatedIdentity?.logoUrl || setting?.logo || "";
  const displayedProducts = generatedIdentity?.products ?? savedProducts;

  const saveGeneratedIdentity = useCallback(
    async (identity: GeneratedIdentity) => {
      if (!authUser) return;

      const supabase = createClient();
      const payload = {
        user_id: authUser.id,
        logo: identity.logoUrl || null,
        main_prompt: buildMainPromptFromIdentity(identity),
        products: identity.products ?? [],
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
    if (loading) return;

    if (generatedIdentity) {
      writeDraft(generatedIdentity);
      return;
    }

    clearDraft();
  }, [generatedIdentity, loading]);

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
        products: promptData.products ?? [],
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

  const updateIdentityDraft = (patch: Partial<GeneratedIdentity>) => {
    if (!displayedIdentity) return;

    setGeneratedIdentity((current) => ({
      websiteUrl: patch.websiteUrl ?? current?.websiteUrl ?? websiteInput,
      logoUrl: patch.logoUrl ?? current?.logoUrl ?? displayedLogoUrl,
      tagline: patch.tagline ?? current?.tagline ?? displayedIdentity.tagline,
      brandValues: patch.brandValues ?? current?.brandValues ?? displayedIdentity.brandValues,
      brandAesthetic: patch.brandAesthetic ?? current?.brandAesthetic ?? displayedIdentity.brandAesthetic,
      toneOfVoice: patch.toneOfVoice ?? current?.toneOfVoice ?? displayedIdentity.toneOfVoice,
      businessOverview:
        patch.businessOverview ?? current?.businessOverview ?? displayedIdentity.businessOverview,
      products: patch.products ?? current?.products ?? displayedProducts,
    }));

    setMessage("Brand identity edited. Save changes when ready.");
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

          <BrandIdentityCard
            authUserExists={Boolean(authUser)}
            displayedIdentity={displayedIdentity}
            displayedLogoUrl={displayedLogoUrl}
            displayedProducts={displayedProducts}
            generatedIdentity={generatedIdentity}
            savedIdentityExists={savedIdentityExists}
            saving={saving}
            websiteInput={websiteInput}
            onChangeIdentity={updateIdentityDraft}
            onRegenerate={() => {
              setMessage("");
              setWebsiteModalOpen(true);
            }}
            onSave={() => {
              if (!generatedIdentity) return;
              clearPendingSave();
              setAutoSaveArmed(false);
              void saveGeneratedIdentity(generatedIdentity);
            }}
            onAskToSaveAfterLogin={onAskToSaveAfterLogin}
          />

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

      <WebsiteModal
        open={websiteModalOpen}
        canClose={savedIdentityExists || Boolean(generatedIdentity)}
        loading={scanLoading}
        websiteInput={websiteInput}
        onClose={() => setWebsiteModalOpen(false)}
        onGenerate={onGenerateIdentity}
        onWebsiteInputChange={setWebsiteInput}
      />
    </>
  );
}

function normalizeProducts(value: unknown): BrandProduct[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is BrandProduct => {
    if (!item || typeof item !== "object") return false;

    const product = item as Partial<BrandProduct>;
    return (
      typeof product.title === "string" &&
      typeof product.imageUrl === "string" &&
      typeof product.url === "string"
    );
  });
}
