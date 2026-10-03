"use client";
import { createElement, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

type Props = {
  as?: ElementType;
  /** seconds */
  delay?: number;
  /** "fade" rises and fades; "line" draws a rule from the left */
  variant?: "fade" | "line";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
} & Record<string, unknown>;

/** Fades content in when it enters the viewport, and out when it leaves. */
export function Reveal({ as = "div", delay = 0, variant = "fade", className, style, children, ...rest }: Props) {
  const ref = useReveal<HTMLElement>();
  return createElement(
    as,
    {
      ...rest,
      ref,
      className,
      [variant === "line" ? "data-line" : "data-reveal"]: "",
      style: delay ? ({ ...style, "--d": `${delay}s` } as CSSProperties) : style,
    },
    children,
  );
}
