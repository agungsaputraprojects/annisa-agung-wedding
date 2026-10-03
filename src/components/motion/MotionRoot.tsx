"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollFrame } from "@/hooks/useScrollFrame";
import styles from "./MotionRoot.module.css";

/**
 * Turns scroll animations on (html.anim), keeps the scroll direction in --dir
 * so reveals enter from below when scrolling down and from above when scrolling up,
 * and draws the reading-progress bar.
 */
export function MotionRoot({ progress = true }: { progress?: boolean }) {
  const reduce = useReducedMotion();
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("anim", !reduce);
    return () => root.classList.remove("anim");
  }, [reduce]);

  useScrollFrame(({ y, vh, dir }) => {
    document.documentElement.style.setProperty("--dir", String(dir));
    const max = document.documentElement.scrollHeight - vh;
    if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  });

  return progress ? <div ref={bar} className={styles.progress} aria-hidden="true" /> : null;
}
