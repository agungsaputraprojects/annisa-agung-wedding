/**
 * One shared requestAnimationFrame loop for every scroll-linked effect.
 * Components subscribe a callback; it runs at most once per frame while scrolling or resizing.
 */
type Frame = { y: number; vh: number; dir: 1 | -1 };
type Listener = (f: Frame) => void;

const listeners = new Set<Listener>();
let lastY = 0;
let dir: 1 | -1 = 1;
let queued = false;
let bound = false;

function run() {
  queued = false;
  const y = window.scrollY;
  if (y !== lastY) dir = y > lastY ? 1 : -1;
  lastY = y;
  const frame = { y, vh: window.innerHeight, dir };
  listeners.forEach((fn) => fn(frame));
}

function schedule() {
  if (!queued) {
    queued = true;
    requestAnimationFrame(run);
  }
}

export function onScrollFrame(fn: Listener) {
  if (!bound) {
    bound = true;
    lastY = window.scrollY;
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
  }
  listeners.add(fn);
  schedule();
  return () => {
    listeners.delete(fn);
  };
}

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
