"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { StoryCover, type CoverData } from "./StoryCover";
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

type Props = { slides: Slide[]; title: string; dateShort: string; monogram: string; rsvpKey: string; giftKey: string; cover: CoverData };
type Phase = "cover" | "loading" | "opening" | "story";

/** Waits for the photos already rendered in the first slides (they are lazy, so force them to load); max `cap` ms. */
function preloadSlides(root: HTMLElement | null, count: number, cap: number) {
  if (!root) return Promise.resolve();
  const imgs = [...root.querySelectorAll("section")].slice(0, count).flatMap((sec) => [...sec.querySelectorAll("img")]);
  imgs.forEach((img) => { img.loading = "eager"; });
  return Promise.race([
    Promise.all(imgs.map((img) => img.decode().catch(() => undefined))),
    new Promise((r) => setTimeout(r, cap)),
  ]);
}

/** Instagram-style story player: progress bars, auto-advance, tap left/right, hold to pause, arrow keys. Nothing scrolls; it is tap-only. */
export function StoryPlayer({ slides, title, dateShort, monogram, rsvpKey, giftKey, cover }: Props) {
  const [phase, setPhase] = useState<Phase>("cover");
  const [seen, setSeen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const avatarRef = useRef<HTMLButtonElement>(null);
  const live = phase === "story" || phase === "opening";
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

  /* cover → spinning ring while the first photos load → circle grows from the avatar to full screen */
  const open = async () => {
    if (phase !== "cover") return;
    curRef.current = 0; setCur(0); setPrev(null);
    setPhase("loading");
    const started = performance.now();
    await preloadSlides(stage.current, 2, 3500);
    const wait = (reduce ? 300 : 1300) - (performance.now() - started);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    const a = avatarRef.current?.getBoundingClientRect(), st = stage.current?.getBoundingClientRect();
    if (a && st && stage.current) {
      stage.current.style.setProperty("--cx", `${a.left + a.width / 2 - st.left}px`);
      stage.current.style.setProperty("--cy", `${a.top + a.height / 2 - st.top}px`);
      stage.current.style.setProperty("--r", `${a.width / 2}px`);
    }
    setExpanded(false);
    setPhase("opening");
    requestAnimationFrame(() => requestAnimationFrame(() => setExpanded(true)));
    setTimeout(() => setPhase("story"), reduce ? 50 : 850);
  };
  const close = () => {
    setSeen(true);
    setPaused(false);
    setPhase("cover");
    setTimeout(() => avatarRef.current?.focus(), 50);
  };

  /* progress + auto-advance */
  useEffect(() => {
    fills.current.forEach((el, i) => { if (el) el.style.transform = `scaleX(${i < cur ? 1 : 0})`; });
    if (phase !== "story") return;
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
  }, [cur, paused, hold, reduce, slides, go, phase]);

  /* tap-only: block every scroll/wheel/drag gesture on the page (a long message inside the textarea may still scroll) */
  useEffect(() => {
    const block = (e: Event) => {
      // the wishes feed (data-scroll) and text boxes may scroll inside themselves
      if ((e.target as Element | null)?.closest?.("textarea,[data-scroll]")) return;
      e.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    return () => { window.removeEventListener("wheel", block); window.removeEventListener("touchmove", block); };
  }, []);

  /* keyboard */
  useEffect(() => {
    if (phase !== "story") return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector('[role="dialog"][aria-modal="true"]')) { close(); return; }
      if ((e.target as Element).closest?.("input,textarea,select") || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(cur + 1); }
      if (e.key === "ArrowLeft") go(cur - 1);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, go, phase]);

  /* tap / hold (no swipe: navigation is by tapping only) */
  const down = useRef<{ x: number; y: number } | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const onDown = (e: React.PointerEvent) => {
    if (phase !== "story") return;
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
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      const r = stage.current!.getBoundingClientRect();
      go(e.clientX - r.left < r.width * 0.3 ? cur - 1 : cur + 1);
    }
  };
  const onCancel = () => { if (holdTimer.current) clearTimeout(holdTimer.current); if (held.current) setHold(false); down.current = null; };

  const slide = slides[cur];
  const light = slide.tone === "paper";
  const layerClass = [s.layer, phase === "opening" && s.clipping, phase === "opening" && expanded && s.clipOpen, !live && s.layerHidden].filter(Boolean).join(" ");

  return (
    <StoryCtx.Provider value={{ go, goTo, setHold }}>
      <div className={s.ambient} style={{ backgroundImage: `url(${live ? slide.bg : cover.avatar.src})` }} aria-hidden="true" />
      <div className={s.shell}>
        <button className={`${s.nav} ${s.prev}`} onClick={() => go(cur - 1)} disabled={!live || cur === 0} aria-label="Sebelumnya">
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
          {phase !== "story" && (
            <StoryCover ref={avatarRef} {...cover} seen={seen} onOpen={open} state={phase === "cover" ? "idle" : phase === "loading" ? "loading" : "leaving"} />
          )}
          <div className={layerClass} aria-hidden={!live} inert={!live}>
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
              <button className={s.ic} onClick={close} aria-label="Tutup undangan">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
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
              <button className={s.box} onClick={() => { goTo(rsvpKey); setTimeout(() => window.dispatchEvent(new Event("wishes:compose")), 450); }}>Kirim ucapan…</button>
              <button className={s.ic} onClick={() => goTo(giftKey)} aria-label="Amplop digital">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z" /></svg>
              </button>
            </div>
          )}
          </div>
        </main>
        <button className={`${s.nav} ${s.next}`} onClick={() => go(cur + 1)} disabled={!live || cur === slides.length - 1} aria-label="Berikutnya">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
      <p className={s.keys}>Ketuk sisi kanan/kiri atau tombol panah · tahan untuk menjeda</p>
    </StoryCtx.Provider>
  );
}

export function ReplayButton({ className }: { className?: string }) {
  const { go } = useStory();
  return <button type="button" className={className} onClick={() => go(0)}>Putar ulang</button>;
}
