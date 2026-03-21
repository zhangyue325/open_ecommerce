"use client";

import { useEffect, useState } from "react";

const rotatingTerms = ["product photo", "paid ads photo", "email marketing photo"];
const longestTerm = rotatingTerms.reduce((longest, term) =>
  term.length > longest.length ? term : longest
);

const TYPING_MS = 75;
const DELETING_MS = 45;
const HOLD_MS = 1200;
const SWITCH_MS = 180;

export default function AnimatedHeroHeadline() {
  const [termIndex, setTermIndex] = useState(0);
  const [displayText, setDisplayText] = useState(rotatingTerms[0]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fullTerm = rotatingTerms[termIndex];
    let timer: number;

    if (!isDeleting && displayText === fullTerm) {
      timer = window.setTimeout(() => setIsDeleting(true), HOLD_MS);
      return () => window.clearTimeout(timer);
    }

    if (isDeleting && displayText.length === 0) {
      timer = window.setTimeout(() => {
        setIsDeleting(false);
        setTermIndex((index) => (index + 1) % rotatingTerms.length);
      }, SWITCH_MS);
      return () => window.clearTimeout(timer);
    }

    timer = window.setTimeout(() => {
      if (isDeleting) {
        setDisplayText((text) => text.slice(0, -1));
        return;
      }

      setDisplayText(fullTerm.slice(0, displayText.length + 1));
    }, isDeleting ? DELETING_MS : TYPING_MS);

    return () => window.clearTimeout(timer);
  }, [displayText, isDeleting, termIndex]);

  return (
    <h1 className="flex flex-col items-center gap-2 text-center text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-6xl">
      <span>Generate your</span>
      <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="relative inline-grid whitespace-nowrap align-middle">
          <span aria-hidden className="invisible col-start-1 row-start-1 text-yellow-500">
            {longestTerm}
          </span>
          <span className="col-start-1 row-start-1 inline-flex items-center justify-center">
            <span className="text-yellow-500">{displayText}</span>
            <span
              aria-hidden
              className="ml-1 inline-block h-[0.9em] w-px animate-pulse bg-yellow-500"
            />
          </span>
        </span>
        <span>within 5 secs!</span>
      </span>
    </h1>
  );
}
