"use client";

import { Globe2, LoaderCircle, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WebsiteModalProps = {
  open: boolean;
  canClose: boolean;
  loading: boolean;
  websiteInput: string;
  onClose: () => void;
  onGenerate: () => void;
  onWebsiteInputChange: (value: string) => void;
};

export default function WebsiteModal({
  open,
  canClose,
  loading,
  websiteInput,
  onClose,
  onGenerate,
  onWebsiteInputChange,
}: WebsiteModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => {
        if (canClose) onClose();
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
              Website
            </div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">Enter your store URL</h2>
            <p className="text-sm text-zinc-400">
              We will scan it to find the logo, tagline, brand values, visual style, voice, and overview.
            </p>
          </div>

          {canClose ? (
            <button
              type="button"
              className="rounded-full p-2 text-zinc-400 transition hover:bg-white/10 hover:text-white"
              onClick={onClose}
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
            onChange={(event) => onWebsiteInputChange(event.target.value)}
            placeholder="yourstore.com"
            className="h-11 border-white/10 bg-white/5 px-4 text-white placeholder:text-zinc-500"
          />

          <div className="flex flex-wrap justify-end gap-2">
            {canClose && !loading ? (
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-white/0 text-white hover:bg-white/10"
                onClick={onClose}
              >
                Cancel
              </Button>
            ) : null}

            <Button
              type="button"
              disabled={loading}
              className="bg-emerald-400 text-black hover:bg-emerald-300"
              onClick={onGenerate}
            >
              {loading ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
