"use client";
import { useEffect } from "react";

/** Gives <body> a model's background (seen on overscroll) and color-scheme while that model is mounted. */
export function ThemeBody({ background, scheme = "light" }: { background: string; scheme?: "light" | "dark" }) {
  useEffect(() => {
    const b = document.body, r = document.documentElement;
    const prev = [b.style.background, r.style.colorScheme];
    b.style.background = background;
    r.style.colorScheme = scheme;
    return () => {
      b.style.background = prev[0];
      r.style.colorScheme = prev[1];
    };
  }, [background, scheme]);
  return null;
}
