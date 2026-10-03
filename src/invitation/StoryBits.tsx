"use client";
import Image from "next/image";
import { useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";
import { useCountdown } from "@/hooks/useCountdown";
import { pad2 } from "@/lib/date";
import type { GalleryItem } from "@/config/wedding";
import { useStory } from "./StoryPlayer";
import s from "./stories.module.css";

export function StoryCountdown({ target }: { target: string }) {
  const t = useCountdown(target);
  const cells = [[t.d, "Hari"], [t.h, "Jam"], [t.m, "Menit"], [t.s, "Detik"]] as const;
  return (
    <div className={`${s.count} ${s.card} ${s.a}`} style={{ "--a": 2 } as React.CSSProperties} role="timer">
      {cells.map(([n, u]) => <div key={u}><b>{t.ready ? pad2(n) : "--"}</b><span className={s.cap}>{u}</span></div>)}
    </div>
  );
}

/** Photo grid inside a slide; opens the shared lightbox and holds the story while it is open. */
export function StoryGallery({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const { setHold } = useStory();
  const show = (i: number | null) => { setOpen(i); setHold(i !== null); };
  return (
    <>
      <div className={`${s.grid} ${s.a}`} style={{ "--a": 2 } as React.CSSProperties}>
        {items.map((it, i) => (
          <button key={it.src} type="button" onClick={() => show(i)} aria-label={`Lihat foto ${i + 1}: ${it.caption}`}>
            <Image src={it.src} alt={it.alt} fill sizes="150px" style={{ objectFit: "cover" }} />
          </button>
        ))}
      </div>
      {open !== null && <Lightbox items={items} index={open} onChange={show} onClose={() => show(null)} />}
    </>
  );
}
