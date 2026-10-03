"use client";
import { useMemo, useState } from "react";
import { rsvpMessage, whatsappUrl } from "@/lib/whatsapp";

/** Headless RSVP state: every model renders its own markup on top of this. */
export function useRsvp({ phone, couple, defaultName = "" }: { phone: string; couple: string; defaultName?: string }) {
  const [name, setNameRaw] = useState(defaultName);
  const [attending, setAttending] = useState(true);
  const [guests, setGuests] = useState(2);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const text = useMemo(() => rsvpMessage({ name: name.trim(), attending, guests, message, couple }), [name, attending, guests, message, couple]);
  const ready = name.trim().length > 0;

  return {
    name, attending, guests, message, error, text, ready,
    url: whatsappUrl(phone, text),
    setName: (v: string) => { setNameRaw(v); setError(""); },
    setAttending, setGuests, setMessage,
    /** Call from the send link's onClick; blocks sending without a name. */
    guardSend: (e: { preventDefault(): void }, focusId: string) => {
      if (ready) return;
      e.preventDefault();
      setError("Tulis nama Anda dulu agar keluarga mempelai tahu siapa yang mengirim.");
      document.getElementById(focusId)?.focus();
    },
  };
}
