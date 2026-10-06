"use client";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ThemeBody } from "@/components/motion/ThemeBody";
import { CopyButton } from "@/components/ui/CopyButton";
import { Placeholder } from "@/components/ui/Placeholder";
import { wedding as W } from "@/config/wedding";
import { formatLongDate, formatTime, googleCalendarUrl, toDate } from "@/lib/date";
import { ChapterCard, StoryCountdown, StoryGallery } from "./StoryBits";
import { Wishes } from "./Wishes";
import { ReplayButton, StoryPlayer, type Slide } from "./StoryPlayer";
import s from "./stories.module.css";

/** "034001118142502" → "0340 0111 8142 502" for reading; copying still takes the plain digits. */
const groupDigits = (n: string) => (/^\d+$/.test(n) ? n.replace(/(\d{4})(?=\d)/g, "$1 ") : n);

/** Element that enters in sequence when its slide becomes active. */
const A = ({ i = 0, as: Tag = "div", className = "", style, children, ...rest }: { i?: number; as?: "div" | "p" | "span" | "h1" | "h2"; className?: string; style?: CSSProperties; children: ReactNode; lang?: string }) => (
  <Tag className={`${s.a} ${className}`} style={{ "--a": i, ...style } as CSSProperties} {...rest}>{children}</Tag>
);

type PhotoProps = { src: string; alt: string; priority?: boolean; position?: string; warm?: boolean; fill?: string };

/**
 * Full-bleed slide photo. With `fill`, the photo is shown whole-width from the top in its own 2:3 frame
 * and the space below is painted in `fill` (the photo's own floor/background colour), with a soft fade
 * between them — used when the 9:16 crop would cut people or the subject off-centre.
 */
const Photo = ({ src, alt, priority, position = "50% 50%", warm, fill }: PhotoProps) => (
  <>
    {fill ? (
      <div className={s.fillStage} style={{ background: fill, "--fill": fill } as CSSProperties}>
        <div className={s.fillBox}>
          <Image className={`${s.photo} ${s.kbSoft}`} src={src} alt={alt} fill sizes="(min-width:640px) 460px, 100vw" priority={priority} style={{ objectFit: "cover", objectPosition: "50% 0%" }} />
        </div>
      </div>
    ) : (
      <Image className={`${s.photo} ${s.kb}`} src={src} alt={alt} fill sizes="(min-width:640px) 460px, 100vw" priority={priority} style={{ objectFit: "cover", objectPosition: position }} />
    )}
    <div className={warm ? s.shadeWarm : s.shade} />
  </>
);

/**
 * Model 02 · Stories — one screen per part of the invitation, tap to move on.
 * A Client Component on purpose: the slides live inside the (client) StoryPlayer, and keeping them
 * client-side avoids React DevTools' "children should not have changed" error with Server Component children.
 */
export function StoriesInvitation({ guest }: { guest?: string }) {
  const ev0 = W.events[0];
  const couple = W.coupleName;
  const [weekday, dayMonth] = [
    new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "Asia/Jakarta" }).format(toDate(ev0.date)),
    new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", timeZone: "Asia/Jakarta" }).format(toDate(ev0.date)),
  ];
  const next = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

  const slides: Slide[] = [
    {
      key: "opening", bg: W.opening.src, duration: 7000,
      content: (
        <>
          <Photo src={W.opening.src} alt={W.opening.alt} position={W.opening.position} warm priority />
          <div className={s.body}>
            <A as="span" className={s.sticker}>Undangan Pernikahan</A>
            <A as="h2" i={1} className={s.big} style={{ marginTop: 16 }}>{W.bride.nickname}<br /><i>&amp; {W.groom.nickname}</i></A>
            <A as="p" i={2} className={s.sub}>{formatLongDate(ev0.date)}</A>
            <A as="p" i={3} className={s.hint}>Ketuk kanan untuk lanjut {next}</A>
          </div>
        </>
      ),
    },
    {
      key: "salam", bg: "/img/back2back.jpg", duration: 12000, tone: "dark",
      content: (
        <div className={`${s.body} ${s.mid}`} style={{ textAlign: "center" }}>
          <A as="p" className={`${s.arab} ${s.basm}`} lang="ar">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</A>
          <A as="p" i={1} className={s.cap} style={{ marginTop: 10 }}>Assalamu’alaikum Wr. Wb.</A>
          <A as="p" i={2} className={`${s.arab} ${s.verseAr}`} lang="ar">{W.verse.arabic}</A>
          <A as="p" i={3} className={s.verseTr}>“{W.verse.translation}”</A>
          <A as="p" i={4} className={s.cap} style={{ marginTop: 12 }}>{W.verse.source}</A>
        </div>
      ),
    },
    ...[W.groom, W.bride].map((p, i): Slide => ({
      key: i ? "bride" : "groom", bg: p.photo.src, duration: 7000,
      content: (
        <>
          <Photo src={p.photo.src} alt={p.photo.alt} position={p.photo.position} />
          <div className={s.body}>
            <A as="span" className={s.sticker}>{p.role}</A>
            <A as="h2" i={1} className={s.big} style={{ marginTop: 14 }}>{i ? <i>{p.nickname}</i> : p.nickname}</A>
            <A as="p" i={2} style={{ marginTop: 10, fontWeight: 700 }}><Placeholder text={p.fullName} /></A>
            <A as="p" i={3} className={s.sub} style={{ marginTop: 4 }}><Placeholder text={p.parents} /></A>
          </div>
        </>
      ),
    })),
    {
      key: "date", bg: W.countdownPhoto.src, duration: 8000,
      content: (
        <>
          <Photo src={W.countdownPhoto.src} alt={W.countdownPhoto.alt} fill="#101010" />
          <div className={s.body}>
            <A as="span" className={s.sticker}>Save the date</A>
            <A as="h2" i={1} className={s.h} style={{ marginTop: 14 }}>{weekday}, <i>{dayMonth}</i></A>
            <StoryCountdown target={toDate(ev0.date, ev0.start).toISOString()} />
          </div>
        </>
      ),
    },
    {
      key: "events", bg: "/img/cream-gaze.jpg", duration: 0, tone: "paper",
      content: (
        <div className={`${s.body} ${s.mid}`}>
          <A as="span" className={s.cap}>Rangkaian acara</A>
          <A as="h2" i={1} className={s.h} style={{ margin: "10px 0 18px" }}>Hari <i>bahagia</i></A>
          {W.events.map((e, i) => (
            <A key={e.name} i={2 + i} className={`${s.card} ${s.ev}`}>
              <div className={s.evRow}><h3>{e.name}</h3><span className={s.evTime}>{formatTime(e.start)}–{formatTime(e.end)}</span></div>
              <p className={s.evVenue}>{formatLongDate(e.date)} · <Placeholder text={e.venue} />, <Placeholder text={e.address} /></p>
            </A>
          ))}
          <A i={4} className={s.acts}>
            <a className={`${s.pill} ${s.pillDark}`} href={ev0.mapsUrl} target="_blank" rel="noopener noreferrer">Buka peta</a>
            <a className={`${s.pill} ${s.pillLine}`} href={googleCalendarUrl(ev0, `${ev0.name} ${couple}`)} target="_blank" rel="noopener noreferrer">Simpan ke kalender</a>
          </A>
        </div>
      ),
    },
    ...W.story.map((ch, i): Slide => ({
      key: `story-${i + 1}`, bg: ch.photo.src, duration: 10000,
      content: (
        <>
          <Photo src={ch.photo.src} alt={ch.photo.alt} position={ch.photo.position}
            fill={ch.fit === "top" ? ch.fill : undefined} warm={ch.fit === "top"} />
          <div className={s.body}>
            <A><ChapterCard ch={ch} index={i} total={W.story.length} /></A>
          </div>
        </>
      ),
    })),
    {
      key: "gallery", bg: "/img/cream-seated.jpg", duration: 0, tone: "dark",
      content: (
        <div className={s.panel}>
          <A as="span" className={s.cap}>Galeri</A>
          <A as="h2" i={1} className={s.h} style={{ marginTop: 10 }}>Semua <i>momen</i></A>
          <StoryGallery sections={W.gallery} />
        </div>
      ),
    },
    {
      key: "quote", bg: W.interlude.src, duration: 8000,
      content: (
        <>
          <Photo src={W.interlude.src} alt={W.interlude.alt} />
          <div className={s.body}>
            <A as="p" className={s.arab} lang="ar" style={{ fontSize: 30, textAlign: "left" }}>{W.interlude.arabic}</A>
            <A as="p" i={1} className={s.h} style={{ marginTop: 8, fontSize: 34, lineHeight: 1.1 }}>{W.interlude.text}</A>
            <A as="p" i={2} className={s.cap} style={{ marginTop: 12 }}>{W.interlude.source}</A>
          </div>
        </>
      ),
    },
    {
      key: "rsvp", bg: "/img/cream-hands.jpg", duration: 0, tone: "paper",
      content: <Wishes defaultName={guest} />,
    },
    {
      key: "gift", bg: "/img/couple-bouquet.jpg", duration: 0, tone: "paper",
      content: (
        <div className={`${s.body} ${s.mid}`}>
          <A as="span" className={s.cap}>Amplop digital</A>
          <A as="h2" i={1} className={s.h} style={{ margin: "10px 0 12px" }}>Doa <i>&amp; restu</i></A>
          <A as="p" i={2} className={s.sub} style={{ marginBottom: 18 }}>Kehadiran dan doa Anda adalah hadiah terindah. Bila ingin memberi tanda kasih:</A>
          {W.gifts.map((a, i) => (
            <A key={i} i={3 + i} className={`${s.card} ${s.acct}`}>
              <div><b><Placeholder text={a.bank} /></b><p className={s.acctNo} id={`story-acct-${i}`}><Placeholder text={groupDigits(a.number)} /></p><small>a.n. <Placeholder text={a.holder} /></small></div>
              <CopyButton value={a.number} targetId={`story-acct-${i}`} label="Salin" unstyled className={`${s.pill} ${s.pillDark}`} />
            </A>
          ))}
        </div>
      ),
    },
    {
      key: "thanks", bg: W.closingPhotos[0].src, duration: 0,
      content: (
        <>
          <div className={s.duo}>
            <div><Image src={W.closingPhotos[0].src} alt={W.closingPhotos[0].alt} fill sizes="230px" style={{ objectFit: "cover", objectPosition: W.closingPhotos[0].position }} /></div>
            <div style={{ background: "#d0c4b4" }}><Image src={W.closingPhotos[1].src} alt={W.closingPhotos[1].alt} fill sizes="230px" style={{ objectFit: "cover", objectPosition: W.closingPhotos[1].position, top: -25 }} /></div>
          </div>
          <div className={s.shade} />
          <div className={s.body} style={{ textAlign: "center" }}>
            <A as="h2" className={s.big}>Terima <i>kasih</i></A>
            <A as="p" i={1} className={s.sub}>Atas doa dan kehadiran Bapak/Ibu/Saudara/i.</A>
            <A as="p" i={2} className={s.cap} style={{ marginTop: 12, textTransform: "none" }}>{W.hashtag}</A>
            <A i={3} style={{ marginTop: 18 }}><ReplayButton className={s.pill} /></A>
            <A as="p" i={4} className={s.credit}>created by <a href="https://www.instagram.com/agunggsputra_" target="_blank" rel="noopener noreferrer">Agung Saputra</a></A>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className={s.root}>
      <ThemeBody background="#111012" scheme="dark" />
      <StoryPlayer
        slides={slides}
        title={couple}
        monogram={W.monogram}
        dateShort={new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(toDate(ev0.date))}
        rsvpKey="rsvp"
        giftKey="gift"
        cover={{
          avatar: { src: "/img/cream-close.jpg", alt: "Agung dan Icha saling menatap sambil tersenyum" },
          name: couple,
          handle: W.hashtag,
          date: formatLongDate(ev0.date),
          stats: [
            [new Intl.DateTimeFormat("id-ID", { day: "numeric", timeZone: "Asia/Jakarta" }).format(toDate(ev0.date)), new Intl.DateTimeFormat("id-ID", { month: "long", timeZone: "Asia/Jakarta" }).format(toDate(ev0.date))],
            [String(W.events.length), "Acara"],
            [String(W.gallery.reduce((n, sec) => n + sec.items.length, 0)), "Foto"],
          ],
          guest,
        }}
      />
    </div>
  );
}
