"use client";
import { useCallback, useState } from "react";

export type CopyState = "idle" | "done" | "manual";

/** Copy text; if the clipboard is blocked, selects the element with `fallbackId` so the guest can copy by hand. */
export function useCopy(resetMs = 2000) {
  const [state, setState] = useState<CopyState>("idle");
  const copy = useCallback(
    async (text: string, fallbackId?: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setState("done");
      } catch {
        const el = fallbackId ? document.getElementById(fallbackId) : null;
        if (el) {
          const r = document.createRange();
          r.selectNodeContents(el);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(r);
        }
        setState("manual");
      }
      setTimeout(() => setState("idle"), resetMs);
    },
    [resetMs],
  );
  return { state, copy };
}

export const copyLabel = (state: CopyState, idle: string) =>
  state === "done" ? "Tersalin" : state === "manual" ? "Terpilih, salin manual" : idle;

/** Digits only for account numbers; keeps placeholders like "[0000]" as-is. */
export const accountDigits = (n: string) => n.replace(/\D/g, "") || n;
