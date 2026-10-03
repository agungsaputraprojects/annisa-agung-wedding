export type RsvpInput = {
  name: string;
  attending: boolean;
  guests: number;
  message: string;
  couple: string;
};

export function rsvpMessage({ name, attending, guests, message, couple }: RsvpInput) {
  const lines = [
    `Assalamu'alaikum, saya ${name || "[nama]"} ingin mengonfirmasi kehadiran di pernikahan ${couple}.`,
    "",
    `Kehadiran: ${attending ? "Insya Allah hadir" : "Berhalangan hadir"}`,
  ];
  if (attending) lines.push(`Jumlah tamu: ${guests} orang`);
  if (message.trim()) lines.push("", `Ucapan: ${message.trim()}`);
  return lines.join("\n");
}

export const whatsappUrl = (phone: string, text: string) =>
  `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
