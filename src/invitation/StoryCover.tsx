"use client";
import Image from "next/image";
import { forwardRef } from "react";
import s from "./stories.module.css";

export type CoverData = {
  avatar: { src: string; alt: string };
  name: string;
  handle: string;
  date: string;
  /** small profile-style counters, e.g. [["17", "Oktober"], ["2", "Acara"]] */
  stats: [string, string][];
  guest?: string;
};

type Props = CoverData & { state: "idle" | "loading" | "leaving"; seen: boolean; onOpen: () => void };

/**
 * Profile-style cover. Only the ringed photo opens the invitation, like tapping someone's story.
 * While loading, the ring turns into spinning dashes.
 */
export const StoryCover = forwardRef<HTMLButtonElement, Props>(function StoryCover(
  { avatar, name, handle, date, stats, guest, state, seen, onOpen },
  ref,
) {
  const loading = state === "loading";
  return (
    <div className={`${s.cover} ${state === "leaving" ? s.coverLeaving : ""}`}>
      <div className={s.coverIn}>
        <p className={`${s.cap} ${s.coverEyebrow}`}>Undangan Pernikahan</p>

        <button
          ref={ref}
          type="button"
          className={`${s.avatarBtn} ${loading ? s.isLoading : ""} ${seen ? s.isSeen : ""}`}
          onClick={onOpen}
          disabled={state !== "idle"}
          aria-label={loading ? "Membuka undangan…" : `Buka undangan ${name}`}
          aria-busy={loading}
        >
          <svg className={s.ring} viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <linearGradient id="ringGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#c9a46a" />
                <stop offset=".45" stopColor="#f3e4c8" />
                <stop offset=".75" stopColor="#d9c3b0" />
                <stop offset="1" stopColor="#9fa3ad" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" pathLength="100" />
          </svg>
          <span className={s.avatarImg}>
            <Image src={avatar.src} alt={avatar.alt} fill sizes="180px" priority style={{ objectFit: "cover", objectPosition: "50% 22%" }} />
          </span>
        </button>

        <p className={s.coverHint} aria-live="polite">
          {loading ? "Membuka undangan…" : seen ? "Ketuk foto untuk melihat lagi" : "Ketuk foto untuk membuka undangan"}
        </p>

        <h1 className={s.coverName}>{name}</h1>
        <p className={s.coverHandle}>{handle}</p>

        <dl className={s.stats}>
          {stats.map(([v, l]) => (
            <div key={l}>
              <dt>{l}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <div className={s.guestCard}>
          <span className={s.cap}>Kepada Yth. Bapak/Ibu/Saudara/i</span>
          <b>{guest || "Tamu Undangan"}</b>
          <span className={s.coverDate}>{date}</span>
        </div>
      </div>
    </div>
  );
});
