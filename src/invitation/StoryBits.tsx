"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Lightbox } from "@/components/ui/Lightbox";
import { useCountdown } from "@/hooks/useCountdown";
import { pad2 } from "@/lib/date";
import type { GalleryItem, GallerySection, StoryChapter } from "@/config/wedding";
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

/** Expandable Our Stories chapter card: shows preview, tap to expand with height animation. */
export function ChapterCard({ ch, index, total }: { ch: StoryChapter; index: number; total: number }) {
  const [open, setOpen] = useState(false);
  const { setHold } = useStory();
  const cardRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    setHold(next);
  };

  useEffect(() => {
    if (!open) return;
    const section = cardRef.current?.closest("section");
    if (!section) return;
    const obs = new MutationObserver(() => {
      if (section.getAttribute("aria-hidden") === "true") {
        setOpen(false);
        setHold(false);
      }
    });
    obs.observe(section, { attributes: true, attributeFilter: ["aria-hidden"] });
    return () => obs.disconnect();
  }, [open, setHold]);

  const paras = ch.text.split("\n\n");

  return (
    <div ref={cardRef} className={s.chapter} data-no-tap={open ? "" : undefined}>
      <div className={s.chapterHead}>
        <span className={s.chapterTag}>Our Stories</span>
        <span className={s.chapterNo} aria-label={`Bab ${index + 1} dari ${total}`}>
          {String(index + 1).padStart(2, "0")}<small> / {String(total).padStart(2, "0")}</small>
        </span>
      </div>
      <div className={s.chapterSteps} aria-hidden="true">
        {Array.from({ length: total }, (_, k) => <i key={k} className={k <= index ? s.stepOn : undefined} />)}
      </div>
      <p className={s.chapterWhen}>{ch.when}</p>
      <h2 className={s.chapterTitle}>{ch.title}</h2>
      <div
        ref={textRef}
        className={`${s.chapterText} ${open ? s.chapterOpen : ""}`}
        data-scroll={open ? "" : undefined}
      >
        {paras.map((p, i) => <p key={i} className={i > 0 ? s.chapterPara : undefined}>{p}</p>)}
      </div>
      <button type="button" className={s.chapterMore} onClick={toggle} data-no-tap="">
        {open ? "Tutup" : "Selengkapnya"}
      </button>
    </div>
  );
}

/** Tabbed photo gallery: sections as tabs, each with its own grid. */
export function StoryGallery({ sections }: { sections: GallerySection[] }) {
  const visible = sections.filter((sec) => sec.items.length > 0);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState<number | null>(null);
  const { setHold } = useStory();
  const show = (i: number | null) => { setOpen(i); setHold(i !== null); };

  const items = visible[tab]?.items ?? [];
  const allItems = visible.flatMap((sec) => sec.items);
  const offset = visible.slice(0, tab).reduce((n, sec) => n + sec.items.length, 0);

  return (
    <>
      {visible.length > 1 && (
        <div className={`${s.tabs} ${s.a}`} style={{ "--a": 2 } as React.CSSProperties} role="tablist" data-no-tap="">
          {visible.map((sec, i) => (
            <button
              key={sec.label}
              role="tab"
              aria-selected={i === tab}
              className={i === tab ? s.tabOn : s.tab}
              onClick={() => { setTab(i); setOpen(null); }}
            >
              {sec.label}
            </button>
          ))}
        </div>
      )}
      <div className={`${s.grid} ${s.a}`} style={{ "--a": 3 } as React.CSSProperties} key={tab}>
        {items.map((it, i) => (
          <button key={it.src} type="button" onClick={() => show(offset + i)} aria-label={`Lihat foto ${i + 1}: ${it.caption}`}>
            <Image src={it.src} alt={it.alt} fill sizes="150px" style={{ objectFit: "cover" }} />
          </button>
        ))}
      </div>
      {open !== null && <Lightbox items={allItems} index={open} onChange={show} onClose={() => show(null)} />}
    </>
  );
}
