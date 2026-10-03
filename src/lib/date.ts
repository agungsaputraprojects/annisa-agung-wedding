import { wedding, type WeddingEvent } from "@/config/wedding";

export const toDate = (date: string, time = "12:00") =>
  new Date(`${date}T${time}:00${wedding.timezoneOffset}`);

const longDate = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

export const formatLongDate = (date: string) => longDate.format(toDate(date));

/** "08:00" -> "08.00", Indonesian time notation */
export const formatTime = (time: string) => time.replace(":", ".");

const toGcal = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function googleCalendarUrl(ev: WeddingEvent, title: string) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toGcal(toDate(ev.date, ev.start))}/${toGcal(toDate(ev.date, ev.end))}`,
    location: `${ev.venue}, ${ev.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export const pad2 = (n: number) => String(n).padStart(2, "0");
