"use client";
import { useEffect, useState } from "react";

export type Countdown = { d: number; h: number; m: number; s: number; done: boolean; ready: boolean };

/** Live countdown to an ISO date. `ready` is false on the server render, so show placeholders until then. */
export function useCountdown(targetIso: string): Countdown {
  const [ms, setMs] = useState<number | null>(null);
  useEffect(() => {
    const t = new Date(targetIso).getTime();
    const tick = () => setMs(t - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  const s = Math.max(0, Math.floor((ms ?? 0) / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60, done: ms !== null && ms <= 0, ready: ms !== null };
}
