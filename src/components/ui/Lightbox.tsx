"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { pad2 } from "@/lib/date";
import type { GalleryItem } from "@/config/wedding";
import styles from "./Lightbox.module.css";

type Props = { items: GalleryItem[]; index: number; onChange: (i: number) => void; onClose: () => void };

/** Full-screen photo viewer: arrows, swipe, Esc to close. */
export function Lightbox({ items, index, onChange, onClose }: Props) {
  const close = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const go = (d: number) => onChange((index + d + items.length) % items.length);
  const item = items[index];

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    close.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      prevFocus?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onChange((index + 1) % items.length);
      if (e.key === "ArrowLeft") onChange((index - 1 + items.length) % items.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onChange, onClose]);

  return (
    <div
      className={styles.lb}
      role="dialog"
      aria-modal="true"
      aria-label="Foto galeri"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className={styles.bar}>
        <span className={styles.srOnly}>
          {pad2(index + 1)} / {pad2(items.length)} · {item.caption}
        </span>
        <button ref={close} className={styles.icon} onClick={onClose} aria-label="Tutup">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      <div className={styles.stage} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={styles.frame}>
          <Image key={item.src} src={item.src} alt={item.alt} fill sizes="100vw" style={{ objectFit: "contain" }} />
        </div>
      </div>
      <div className={styles.nav}>
        <button className={styles.icon} onClick={() => go(-1)} aria-label="Foto sebelumnya">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <button className={styles.icon} onClick={() => go(1)} aria-label="Foto berikutnya">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
