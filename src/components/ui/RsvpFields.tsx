"use client";
import type { ReactNode } from "react";
import { useRsvp } from "@/hooks/useRsvp";

export type RsvpClasses = Partial<Record<
  "form" | "field" | "label" | "input" | "choices" | "choice" | "preview" | "error" | "send", string
>>;

type Props = {
  idPrefix: string;
  phone: string;
  couple: string;
  defaultName?: string;
  maxGuests?: number;
  classes: RsvpClasses;
  sendLabel?: ReactNode;
};

/** RSVP form markup shared by every model; styling comes in through `classes`. */
export function RsvpFields({ idPrefix: p, phone, couple, defaultName, maxGuests = 4, classes: c, sendLabel = "Kirim via WhatsApp" }: Props) {
  const r = useRsvp({ phone, couple, defaultName });
  return (
    <form className={c.form} noValidate onSubmit={(e) => e.preventDefault()}>
      <div className={c.field}>
        <label className={c.label} htmlFor={`${p}name`}>Nama</label>
        <input className={c.input} id={`${p}name`} type="text" autoComplete="name" placeholder="Nama Anda" value={r.name} onChange={(e) => r.setName(e.target.value)} />
      </div>
      <fieldset className={c.field}>
        <legend className={c.label}>Kehadiran</legend>
        <div className={c.choices}>
          {([[true, "Insya Allah hadir"], [false, "Berhalangan"]] as const).map(([v, label]) => (
            <label className={c.choice} key={String(v)}>
              <input type="radio" name={`${p}going`} id={`${p}${v ? "yes" : "no"}`} checked={r.attending === v} onChange={() => r.setAttending(v)} />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {r.attending && (
        <div className={c.field}>
          <label className={c.label} htmlFor={`${p}guests`}>Jumlah tamu</label>
          <select className={c.input} id={`${p}guests`} value={r.guests} onChange={(e) => r.setGuests(Number(e.target.value))}>
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      )}
      <div className={c.field}>
        <label className={c.label} htmlFor={`${p}msg`}>Ucapan &amp; doa</label>
        <textarea className={c.input} id={`${p}msg`} rows={3} placeholder="Barakallahu lakuma…" value={r.message} onChange={(e) => r.setMessage(e.target.value)} />
      </div>
      <div className={c.field}>
        <span className={c.label}>Pratinjau pesan</span>
        <div className={c.preview}>{r.text}</div>
      </div>
      <p className={c.error} role="alert">{r.error}</p>
      <a className={c.send} href={r.url} target="_blank" rel="noopener noreferrer" aria-disabled={!r.ready} onClick={(e) => r.guardSend(e, `${p}name`)}>
        {sendLabel}
      </a>
    </form>
  );
}
