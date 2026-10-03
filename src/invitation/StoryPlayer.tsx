"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import s from "./stories.module.css";

export type Slide = {
  key: string;
  /** photo behind the frame on desktop */
  bg: string;
  /** ms before moving on; 0 waits for the guest (forms, buttons, long text) */
  duration: number;
  tone?: "photo" | "dark" | "paper";
  content: ReactNode;
};

type Ctx = { go: (n: number) => void; goTo: (key: string) => void; setHold: (v: boolean) => void };
const StoryCtx = createContext<Ctx | null>(null);
/** Lets slide content control the player (e.g. a "Putar ulang" button, or pausing while a lightbox is open). */
export const useStory = () => useContext(StoryCtx)!;

const INTERACTIVE = "a,button,input,textarea,select,label,form,[role=dialog],[data-no-tap]";

type Props = { slides: Slide[]; title: string; dateShort: string; monogram: string; rsvpKey: string; giftKey: string };

/** Instagram-style story player: progress bars, auto-advance, tap thirds, swipe, hold to pause, arrow keys, wheel. */
export function StoryPlayer({ slides, title, dateShort, monogram, rsvpKey, giftKey }: Props) {
  const [cur, setCur] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [back, setBack] = useState(false);
  const [paused, setPaused] = useState(false);
  const [hold, setHold] = useState(false);
  const fills = useRef<(HTMLElement | null)[]>([]);
  const reduce = useReducedMotion();
  const stage = useRef<HTMLElement>(null);

  const curRef = useRef(0);
  const go = useCallback((n: number) => {
    const c = curRef.current;
    const next = Math.max(0, Math.min(slides.length - 1, n));
    if (next === c) return;
    curRef.current = next;
    setPrev(c);
    setBack(next < c);
    setCur(next);
  }, [slides.length]);
  const goTo = useCallback((key: string) => go(slides.findIndex((x) => x.key === key)), [go, slides]);

  /* progress + auto-advance */
  useEffect(() => {
    fills.current.forEach((el, i) => { if (el) el.style.transform = `scaleX(${i < cur ? 1 : 0})`; });
    const d = slides[cur].duration;
    const fill = fills.current[cur];
    if (!d || reduce) { if (fill) fill.style.transform = "scaleX(1)"; return; }
    let raf = 0, last = performance.now(), elapsed = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = t - last; last = t;
      if (paused || hold || document.hidden) return;
      elapsed += dt;
      const p = Math.min(1, elapsed / d);
      if (fill) fill.style.transform = `scaleX(${p})`;
      if (p >= 1) { cancelAnimationFrame(raf); go(cur + 1); }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cur, paused, hold, reduce, slides, go]);

  /* keyboard + wheel */
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.target as Element).closest?.("input,textarea,select") || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowLeft") go(cur - 1);
    };
    let lock = 0;
    const wheel = (e: WheelEvent) => {
      if ((e.target as Element).closest?.(`.${s.scroll}`)) return;
      const now = performance.now();
      if (now < lock || Math.abs(e.deltaY) < 20) return;
      lock = now + 700;
      go(cur + (e.deltaY > 0 ? 1 : -1));
    };
    window.addEventListener("keydown", key);
    window.addEventListener("wheel", wheel, { passive: true });
    return () => { window.removeEventListener("keydown", key); window.removeEventListener("wheel", wheel); };
  }, [cur, go]);

  /* tap / swipe / hold */
  const down = useRef<{ x: number; y: number } | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const onDown = (e: React.PointerEvent) => {
    if ((e.target as Element).closest(INTERACTIVE)) return;
    down.current = { x: e.clientX, y: e.clientY };
    held.current = false;
    holdTimer.current = setTimeout(() => { held.current = true; setHold(true); }, 260);
  };
  const onUp = (e: React.PointerEvent) => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    const d = down.current;
    down.current = null;
    if (!d) return;
    if (held.current) { setHold(false); return; }
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(cur + (dx < 0 ? 1 : -1));
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      const r = stage.current!.getBoundingClientRect();
      go(e.clientX - r.left < r.width * 0.3 ? cur - 1 : cur + 1);
    }
  };
  const onCancel = () => { if (holdTimer.current) clearTimeout(holdTimer.current); if (held.current) setHold(false); down.current = null; };

  const slide = slides[cur];
  const light = slide.tone === "paper";

  return (
    <StoryCtx.Provider value={{ go, goTo, setHold }}>
      <div className={s.ambient} style={{ backgroundImage: `url(${slide.bg})` }} aria-hidden="true" />
      <div className={s.shell}>
        <button className={`${s.nav} ${s.prev}`} onClick={() => go(cur - 1)} disabled={cur === 0} aria-label="Sebelumnya">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <main
          ref={stage}
          className={s.stage}
          aria-roledescription="carousel"
          aria-label={title}
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={onCancel}
        >
          <div className={s.chrome}>
            <div className={s.bars}>
              {slides.map((x, i) => <div key={x.key} className={s.bar}><i ref={(el) => { fills.current[i] = el; }} /></div>)}
            </div>
            <div className={s.who}>
              <div className={s.avatar}><span>{monogram}</span></div>
              <div><b>{title}</b><small>{dateShort}</small></div>
              <div className={s.sp} />
              <button className={s.ic} onClick={() => setPaused((p) => !p)} aria-label={paused ? "Lanjutkan" : "Jeda"}>
                {paused
                  ? <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7z" /></svg>
                  : <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>}
              </button>
            </div>
          </div>

          {slides.map((x, i) => (
            <section
              key={x.key}
              className={[s.slide, x.tone === "dark" && s.dark, x.tone === "paper" && s.paper, i === cur && s.on, i === prev && back && s.back].filter(Boolean).join(" ")}
              aria-roledescription="slide"
              aria-label={`${i + 1} dari ${slides.length}`}
              aria-hidden={i !== cur}
              inert={i !== cur}
            >
              {x.content}
            </section>
          ))}

          {slide.key !== rsvpKey && (
            <div className={`${s.reply} ${light ? s.replyLight : ""}`}>
              <button className={s.box} onClick={() => goTo(rsvpKey)}>Kirim ucapan…</button>
              <button className={s.ic} onClick={() => goTo(giftKey)} aria-label="Amplop digital">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z" /></svg>
              </button>
            </div>
          )}
        </main>
        <button className={`${s.nav} ${s.next}`} onClick={() => go(cur + 1)} disabled={cur === slides.length - 1} aria-label="Berikutnya">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
      <p className={s.keys}>Ketuk sisi kanan/kiri, geser, atau pakai tombol panah · tahan untuk menjeda</p>
    </StoryCtx.Provider>
  );
}

export function ReplayButton({ className }: { className?: string }) {
  const { go } = useStory();
  return <button type="button" className={className} onClick={() => go(0)}>Putar ulang</button>;
}
