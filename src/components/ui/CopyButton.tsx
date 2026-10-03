"use client";
import { accountDigits, copyLabel, useCopy } from "@/hooks/useCopy";

type Props = { value: string; targetId?: string; label?: string; className?: string; digitsOnly?: boolean; unstyled?: boolean };

/** Copy-to-clipboard button; falls back to selecting `targetId` when the clipboard is blocked. Style it with `className`. */
export function CopyButton({ value, targetId, label = "Salin nomor", className, digitsOnly = true }: Props) {
  const { state, copy } = useCopy();
  return (
    <button type="button" className={className} onClick={() => copy(digitsOnly ? accountDigits(value) : value, targetId)} aria-live="polite">
      {copyLabel(state, label)}
    </button>
  );
}
