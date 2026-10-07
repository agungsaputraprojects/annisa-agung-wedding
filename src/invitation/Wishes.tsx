"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LIMITS, WishError, getWishStore, type Wish } from "@/lib/wishes";
import s from "./wishes.module.css";

/* ---------- helpers ---------- */
const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
function timeAgo(iso: string, now: number) {
  const sec = Math.round((new Date(iso).getTime() - now) / 1000);
  const abs = Math.abs(sec);
  if (abs < 45) return "baru saja";
  if (abs < 3600) return rtf.format(Math.round(sec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), "hour");
  if (abs < 86400 * 30) return rtf.format(Math.round(sec / 86400), "day");
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}
const initials = (name: string) =>
  name.replace(/^contoh:\s*/i, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
const TONES = ["#c9a46a", "#a98467", "#8c7a6b", "#b08d8d", "#7d8a7a", "#9a8fb0"];
const tone = (name: string) => TONES[[...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % TONES.length];

const COOLDOWN_MS = 30_000;
const COOLDOWN_KEY = "wish-last-sent";
const readCooldown = () => { try { return Number(localStorage.getItem(COOLDOWN_KEY) || 0); } catch { return 0; } };
const writeCooldown = () => { try { localStorage.setItem(COOLDOWN_KEY, String(Date.now())); } catch { /* storage blocked */ } };

const ERRORS: Record<string, string> = {
  too_many_requests: "Sedang banyak yang mengirim ucapan. Coba lagi sebentar ya.",
  duplicate: "Ucapan yang sama baru saja terkirim.",
  invalid: "Nama atau ucapan terlalu panjang.",
  network: "Gagal mengirim. Periksa koneksi lalu coba lagi.",
};

/* ---------- component ---------- */
type Status = "loading" | "ready" | "error" | "off";

/**
 * Guest book shown as a comment feed. Everyone sees every wish (stored in Supabase, live-updated);
 * the number of guests is saved for the couple only. The list scrolls inside its own box; the
 * composer opens as a bottom sheet.
 */
export function Wishes({ defaultName = "" }: { defaultName?: string }) {
  const store = useMemo(() => getWishStore(), []);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [status, setStatus] = useState<Status>(store ? "loading" : "off");
  const [fresh, setFresh] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const listRef = useRef<HTMLOListElement>(null);

  const add = useCallback((w: Wish) => {
    setWishes((prev) => (prev.some((x) => x.id === w.id) ? prev : [w, ...prev]));
  }, []);

  useEffect(() => {
    if (!store) return;
    let alive = true;
    store.list().then((rows) => { if (alive) { setWishes(rows); setStatus("ready"); } }).catch(() => alive && setStatus("error"));
    const off = store.subscribe(add, (id) => setWishes((prev) => prev.filter((w) => w.id !== id)));
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => { alive = false; off(); clearInterval(t); };
  }, [store, add]);

  /* the reply bar on other slides asks to open the composer */
  useEffect(() => {
    const onCompose = () => setOpen(true);
    window.addEventListener("wishes:compose", onCompose);
    return () => window.removeEventListener("wishes:compose", onCompose);
  }, []);

  const onSent = (w: Wish) => {
    add(w);
    setFresh(w.id);
    setOpen(false);
    listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => setFresh(null), 2400);
  };

  const attending = wishes.filter((w) => w.attending).length;

  return (
    <div className={s.wrap}>
      <header className={s.head}>
        <span className={s.cap}>Ucapan &amp; doa</span>
        <h2 className={s.title}>Kirim <i>doa terbaik</i></h2>
        {status === "ready" && wishes.length > 0 && (
          <p className={s.meta}>
            {wishes.length} ucapan · {attending} akan hadir
          </p>
        )}
      </header>

      <div className={s.feed} data-scroll="">
        {status === "loading" && (
          <ul className={s.list} aria-label="Memuat ucapan">
            {[0, 1, 2].map((i) => (
              <li key={i} className={`${s.item} ${s.skeleton}`}><span className={s.avatar} /><div><i /><i /></div></li>
            ))}
          </ul>
        )}
        {status === "off" && <p className={s.empty}>Ucapan belum bisa dimuat. Penyimpanan ucapan belum diatur.</p>}
        {status === "error" && <p className={s.empty}>Ucapan gagal dimuat. Periksa koneksi lalu buka lagi slide ini.</p>}
        {status === "ready" && wishes.length === 0 && (
          <p className={s.empty}>Belum ada ucapan.<br />Jadilah yang pertama mendoakan kami.</p>
        )}
        {status === "ready" && wishes.length > 0 && (
          <ol ref={listRef} className={s.list} aria-live="polite">
            {wishes.map((w) => (
              <li key={w.id} className={`${s.item} ${fresh === w.id ? s.fresh : ""}`}>
                <span className={s.avatar} style={{ background: tone(w.name) }} aria-hidden="true">{initials(w.name)}</span>
                <div className={s.body}>
                  <div className={s.row}>
                    <b className={s.name}>{w.name}</b>
                    <span className={`${s.badge} ${w.attending ? s.yes : s.no}`}>{w.attending ? "Hadir" : "Berhalangan"}</span>
                    <time className={s.time} dateTime={w.created_at}>{timeAgo(w.created_at, now)}</time>
                  </div>
                  <p className={s.msg}>{w.message}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <button type="button" className={s.composeBar} onClick={() => setOpen(true)} disabled={!store}>
        <span>Tulis ucapan &amp; doa…</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 12l16-8-6 16-2-6-8-2z" /></svg>
      </button>

      {open && store && <Composer defaultName={defaultName} onClose={() => setOpen(false)} onSent={onSent} />}
    </div>
  );
}

/* ---------- bottom-sheet composer ---------- */
function Composer({ defaultName, onClose, onSent }: { defaultName: string; onClose: () => void; onSent: (w: Wish) => void }) {
  const store = getWishStore()!;
  const [name, setName] = useState(defaultName);
  const [attending, setAttending] = useState(true);
  const [guests, setGuests] = useState(1);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const msgRef = useRef<HTMLTextAreaElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (defaultName ? msgRef : nameRef).current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); onClose(); } };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [defaultName, onClose]);

  const ready = name.trim().length > 0 && message.trim().length > 0 && !sending;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const wait = COOLDOWN_MS - (Date.now() - readCooldown());
    if (wait > 0) { setError(`Tunggu ${Math.ceil(wait / 1000)} detik sebelum mengirim lagi.`); return; }
    setSending(true);
    setError("");
    try {
      const w = await store.submit({ name: name.trim(), message: message.trim(), attending, guests });
      writeCooldown();
      onSent(w);
    } catch (err) {
      setError(ERRORS[err instanceof WishError ? err.code : "network"]);
      setSending(false);
    }
  };

  return (
    <div className={s.sheetWrap} data-no-tap="" role="dialog" aria-modal="true" aria-labelledby="wish-title">
      <button type="button" className={s.scrim} onClick={onClose} aria-label="Tutup" tabIndex={-1} />
      <form className={s.sheet} onSubmit={submit} noValidate>
        <span className={s.grab} aria-hidden="true" />
        <div className={s.sheetHead}>
          <h3 id="wish-title">Tulis ucapan</h3>
          <button type="button" className={s.x} onClick={onClose} aria-label="Tutup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        <label className={s.label} htmlFor="wish-name">Nama</label>
        <input ref={nameRef} id="wish-name" className={s.input} value={name} maxLength={LIMITS.name} autoComplete="name"
          placeholder="Nama Anda" onChange={(e) => setName(e.target.value)} />

        <div className={s.attRow}>
          <div className={s.segment} role="radiogroup" aria-label="Kehadiran">
            {([[true, "Hadir"], [false, "Berhalangan"]] as const).map(([v, l]) => (
              <button key={l} type="button" role="radio" aria-checked={attending === v} className={attending === v ? s.segOn : undefined} onClick={() => setAttending(v)}>
                {l}
              </button>
            ))}
          </div>
          {attending && (
            <div className={s.stepper} aria-label="Jumlah tamu">
              <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} disabled={guests <= 1} aria-label="Kurangi tamu">−</button>
              <output aria-live="polite">{guests} <small>orang</small></output>
              <button type="button" onClick={() => setGuests((g) => Math.min(LIMITS.guests, g + 1))} disabled={guests >= LIMITS.guests} aria-label="Tambah tamu">+</button>
            </div>
          )}
        </div>

        <label className={s.label} htmlFor="wish-msg">Ucapan &amp; doa</label>
        <div className={s.areaWrap}>
          <textarea ref={msgRef} id="wish-msg" className={`${s.input} ${s.area}`} value={message} maxLength={LIMITS.message} rows={3}
            placeholder="Barakallahu lakuma…" onChange={(e) => setMessage(e.target.value)} />
          <span className={s.counter}>{message.length}/{LIMITS.message}</span>
        </div>

        <p className={s.err} role="alert">{error}</p>
        <button type="submit" className={s.send} disabled={!ready}>{sending ? "Mengirim…" : "Kirim ucapan"}</button>
        <p className={s.note}>Ucapan tampil untuk semua tamu. Jumlah tamu hanya terlihat oleh mempelai.</p>
      </form>
    </div>
  );
}
