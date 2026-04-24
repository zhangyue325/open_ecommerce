"use client";

import type { ReactNode } from "react";
import { BadgeCheck, Database, LoaderCircle, RefreshCw, WandSparkles } from "lucide-react";

import type { BrandIdentity } from "@/lib/brand-identity";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import LoginModalTrigger from "../login/login-modal-trigger";

type BrandProduct = {
  title: string;
  imageUrl: string;
  url: string;
};

type GeneratedIdentity = BrandIdentity & {
  websiteUrl: string;
  logoUrl: string;
  products?: BrandProduct[];
};

function IdentitySection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.22em] text-zinc-500">{label}</div>
      {children}
    </div>
  );
}

type BrandIdentityCardProps = {
  authUserExists: boolean;
  displayedIdentity: BrandIdentity | null;
  displayedLogoUrl: string;
  displayedProducts: BrandProduct[];
  generatedIdentity: GeneratedIdentity | null;
  savedIdentityExists: boolean;
  saving: boolean;
  websiteInput: string;
  onChangeIdentity: (patch: Partial<GeneratedIdentity>) => void;
  onRegenerate: () => void;
  onSave: () => void;
  onAskToSaveAfterLogin: () => void;
};

export default function BrandIdentityCard({
  authUserExists,
  displayedIdentity,
  displayedLogoUrl,
  displayedProducts,
  generatedIdentity,
  savedIdentityExists,
  saving,
  websiteInput,
  onChangeIdentity,
  onRegenerate,
  onSave,
  onAskToSaveAfterLogin,
}: BrandIdentityCardProps) {
  if (!displayedIdentity && !savedIdentityExists) return null;

  return (
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
          {generatedIdentity ? "Review before saving" : "Current brand identity"}
        </CardTitle>
        <CardDescription className="text-zinc-400">
          {generatedIdentity
            ? "Check the generated brand profile, then save it to your account."
            : "This is the logo, voice, style, and overview currently saved for your account."}
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
            <Input
              type="text"
              value={generatedIdentity?.websiteUrl || websiteInput}
              onChange={(event) => onChangeIdentity({ websiteUrl: event.target.value })}
              placeholder="https://yourstore.com"
              className="h-10 border-white/10 bg-black/20 text-white placeholder:text-zinc-500"
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-zinc-500">Logo URL</div>
            <Input
              type="text"
              value={displayedLogoUrl}
              onChange={(event) => onChangeIdentity({ logoUrl: event.target.value })}
              placeholder="https://..."
              className="h-10 border-white/10 bg-black/20 text-white placeholder:text-zinc-500"
            />
          </div>
        </div>

        {displayedIdentity ? (
          <div className="grid gap-4 md:grid-cols-2">
            <IdentitySection label="Tagline">
              <Input
                type="text"
                value={displayedIdentity.tagline}
                onChange={(event) => onChangeIdentity({ tagline: event.target.value })}
                className="h-10 border-white/10 bg-black/20 text-white placeholder:text-zinc-500"
              />
            </IdentitySection>

            <IdentitySection label="Brand values">
              <Input
                type="text"
                value={displayedIdentity.brandValues.join(", ")}
                onChange={(event) => onChangeIdentity({ brandValues: splitKeywords(event.target.value) })}
                className="h-10 border-white/10 bg-black/20 text-white placeholder:text-zinc-500"
              />
            </IdentitySection>

            <IdentitySection label="Brand aesthetic">
              <Input
                type="text"
                value={displayedIdentity.brandAesthetic.join(", ")}
                onChange={(event) => onChangeIdentity({ brandAesthetic: splitKeywords(event.target.value) })}
                className="h-10 border-white/10 bg-black/20 text-white placeholder:text-zinc-500"
              />
            </IdentitySection>

            <IdentitySection label="Tone of voice">
              <Input
                type="text"
                value={displayedIdentity.toneOfVoice.join(", ")}
                onChange={(event) => onChangeIdentity({ toneOfVoice: splitKeywords(event.target.value) })}
                className="h-10 border-white/10 bg-black/20 text-white placeholder:text-zinc-500"
              />
            </IdentitySection>

            <div className="md:col-span-2">
              <IdentitySection label="Business overview">
                <Textarea
                  value={displayedIdentity.businessOverview}
                  onChange={(event) => onChangeIdentity({ businessOverview: event.target.value })}
                  className="min-h-28 border-white/10 bg-black/20 text-white placeholder:text-zinc-500"
                />
              </IdentitySection>
            </div>

            {displayedProducts.length ? (
              <div className="md:col-span-2">
                <IdentitySection label="Products found">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {displayedProducts.map((product) => (
                      <a
                        key={`${product.url}-${product.imageUrl}`}
                        href={product.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group grid grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl border border-white/10 bg-black/20 p-2 transition hover:border-white/25"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="aspect-square w-16 rounded-lg bg-white object-cover"
                        />
                        <div className="min-w-0 self-center text-sm leading-5 text-zinc-200 group-hover:text-white">
                          <span className="line-clamp-2">{product.title}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </IdentitySection>
              </div>
            ) : null}

            {generatedIdentity ? (
              <div className="space-y-4 md:col-span-2">
                <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/15 bg-white/0 text-white hover:bg-white/10"
                  onClick={onRegenerate}
                >
                  <RefreshCw className="size-4" />
                  Try another scan
                </Button>

                {authUserExists ? (
                  <Button
                    type="button"
                    disabled={saving || !generatedIdentity.businessOverview.trim() || !generatedIdentity.tagline.trim()}
                    className="bg-emerald-400 text-black hover:bg-emerald-300"
                    onClick={onSave}
                  >
                    {saving ? (
                      <>
                        <LoaderCircle className="size-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="size-4" />
                        Save brand
                      </>
                    )}
                  </Button>
                ) : (
                  <LoginModalTrigger
                    label={
                      <span className="inline-flex items-center gap-2">
                        <BadgeCheck className="size-4" />
                        Log in to save
                      </span>
                    }
                    nextPath="/brand"
                    className="bg-emerald-400 text-black hover:bg-emerald-300"
                    onOpen={onAskToSaveAfterLogin}
                  />
                )}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              This brand was saved before structured identity fields were added. Regenerate from the website to
              fill in the logo, tagline, values, style, voice, and overview.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function splitKeywords(value: string) {
  return value
    .split(",")
    .map((item) => item.trim());
}
