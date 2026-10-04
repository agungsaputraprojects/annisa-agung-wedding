import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { ThemeBody } from "@/components/motion/ThemeBody";
import { CopyButton } from "@/components/ui/CopyButton";
import { Placeholder } from "@/components/ui/Placeholder";
import { RsvpFields } from "@/components/ui/RsvpFields";
import { wedding as W } from "@/config/wedding";
import { formatLongDate, formatTime, googleCalendarUrl, toDate } from "@/lib/date";
import { StoryCountdown, StoryGallery } from "./StoryBits";
import { ReplayButton, StoryPlayer, type Slide } from "./StoryPlayer";
import { fontVars } from "./fonts";
import s from "./stories.module.css";

/** Element that enters in sequence when its slide becomes active. */
const A = ({ i = 0, as: Tag = "div", className = "", style, children, ...rest }: { i?: number; as?: "div" | "p" | "span" | "h1" | "h2"; className?: string; style?: CSSProperties; children: ReactNode; lang?: string }) => (
  <Tag className={`${s.a} ${className}`} style={{ "--a": i, ...style } as CSSProperties} {...rest}>{children}</Tag>
);

const Photo = ({ src, alt, priority }: { src: string; alt: string; priority?: boolean }) => (
  <>
    <Image className={`${s.photo} ${s.kb}`} src={src} alt={alt} fill sizes="(min-width:640px) 460px, 100vw" priority={priority} style={{ objectFit: "cover" }} />
    <div className={s.shade} />
  </>
);

/** Model 02 · Stories — one screen per part of the invitation, tap or swipe to move on. */
export function StoriesInvitation({ guest }: { guest?: string }) {
  const ev0 = W.events[0];
  const couple = `${W.groom.nickname} & ${W.bride.nickname}`;
  const [weekday, dayMonth] = [
    new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "Asia/Jakarta" }).format(toDate(ev0.date)),
    new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", timeZone: "Asia/Jakarta" }).format(toDate(ev0.date)),
  ];
  const next = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;

  const slides: Slide[] = [
    {
      key: "opening", bg: "/img/couple-arm.jpg", duration: 7000,
      content: (
        <>
          <Photo src="/img/couple-arm.jpg" alt="Agung dan Icha tersenyum berdampingan" priority />
          <div className={s.body}>
            <A as="span" className={s.sticker}>Undangan Pernikahan</A>
            <A as="h2" i={1} className={s.big} style={{ marginTop: 16 }}>{W.groom.nickname}<br /><i>&amp; {W.bride.nickname}</i></A>
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
          <A as="p" className={s.arab} lang="ar" style={{ fontSize: 34 }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</A>
          <A as="p" i={1} className={s.cap} style={{ marginTop: 10 }}>Assalamu’alaikum Wr. Wb.</A>
          <A as="p" i={2} className={s.arab} lang="ar" style={{ fontSize: 21, marginTop: 26, color: "var(--txt-2)" }}>{W.verse.arabic}</A>
          <A as="p" i={3} className={s.verseTr}>“{W.verse.translation}”</A>
          <A as="p" i={4} className={s.cap} style={{ marginTop: 12 }}>{W.verse.source}</A>
        </div>
      ),
    },
    ...[W.groom, W.bride].map((p, i): Slide => ({
      key: i ? "bride" : "groom", bg: p.photo.src, duration: 7000,
      content: (
        <>
          <Photo src={p.photo.src} alt={p.photo.alt} />
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
          <Photo src={W.countdownPhoto.src} alt={W.countdownPhoto.alt} />
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
          <A as="p" i={5} className={s.cap} style={{ marginTop: 16 }}>Dress code · {W.dressCode.note}</A>
        </div>
      ),
    },
    ...W.gallery.filter((g) => ["Langkah", "Saling bersandar", "Tatap"].includes(g.caption)).map((g): Slide => ({
      key: `photo-${g.caption}`, bg: g.src, duration: 5000,
      content: (
        <>
          <Photo src={g.src} alt={g.alt} />
          <div className={s.body}><A as="span" className={s.sticker}>{g.caption}</A></div>
        </>
      ),
    })),
    {
      key: "gallery", bg: "/img/cream-seated.jpg", duration: 0, tone: "dark",
      content: (
        <div className={s.scroll}>
          <A as="span" className={s.cap}>Galeri</A>
          <A as="h2" i={1} className={s.h} style={{ marginTop: 10 }}>Semua <i>momen</i></A>
          <StoryGallery items={W.gallery} />
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
      content: (
        <div className={s.scroll}>
          <A as="span" className={s.cap}>Konfirmasi kehadiran</A>
          <A as="h2" i={1} className={s.h} style={{ marginTop: 10 }}>Akan <i>hadir?</i></A>
          <A as="p" i={2} className={s.sub}>Pesan dikirim lewat WhatsApp ke keluarga mempelai. Anda bisa melihatnya dulu sebelum mengirim.</A>
          <A i={3}>
            <RsvpFields idPrefix="story-" phone={W.rsvpWhatsapp} couple={couple} defaultName={guest}
              classes={{ form: s.fForm, field: s.fField, label: s.fLabel, input: s.fInput, choices: s.fChoices, choice: s.fChoice, preview: s.fPreview, error: s.fErr, send: s.fSend }} />
          </A>
        </div>
      ),
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
              <div><b><Placeholder text={a.bank} /></b><p className={s.acctNo} id={`story-acct-${i}`}><Placeholder text={a.number} /></p><small>a.n. <Placeholder text={a.holder} /></small></div>
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
            {W.closingPhotos.map((p) => <div key={p.src}><Image src={p.src} alt={p.alt} fill sizes="230px" style={{ objectFit: "cover" }} /></div>)}
          </div>
          <div className={s.shade} />
          <div className={s.body} style={{ textAlign: "center" }}>
            <A as="h2" className={s.big}>Terima <i>kasih</i></A>
            <A as="p" i={1} className={s.sub}>Atas doa dan kehadiran Bapak/Ibu/Saudara/i.</A>
            <A as="p" i={2} className={s.cap} style={{ marginTop: 12 }}>Wassalamu’alaikum Wr. Wb. · {W.hashtag}</A>
            <A i={3} style={{ marginTop: 18 }}><ReplayButton className={s.pill} /></A>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className={`${fontVars} ${s.root}`}>
      <ThemeBody background="#111012" scheme="dark" />
      <StoryPlayer
        slides={slides}
        title={couple}
        monogram={`${W.groom.nickname[0]}&${W.bride.nickname[0]}`}
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
            [String(W.gallery.length), "Foto"],
          ],
          guest,
        }}
      />
    </div>
  );
}
