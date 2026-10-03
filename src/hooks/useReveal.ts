"use client";
import { useCallback, useRef } from "react";
import { observeReveal } from "@/lib/revealObserver";

/** Ref callback that registers an element with the shared reveal observer. */
export function useReveal<T extends Element>() {
  const cleanup = useRef<(() => void) | null>(null);
  return useCallback((el: T | null) => {
    cleanup.current?.();
    cleanup.current = el ? observeReveal(el) : null;
  }, []);
}
