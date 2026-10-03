"use client";
import { useEffect, useRef } from "react";
import { onScrollFrame } from "@/lib/scrollLoop";

type Frame = Parameters<Parameters<typeof onScrollFrame>[0]>[0];

/** Runs `fn` on every scroll/resize frame, through the shared rAF loop. */
export function useScrollFrame(fn: (f: Frame) => void, enabled = true) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    if (!enabled) return;
    return onScrollFrame((f) => saved.current(f));
  }, [enabled]);
}
