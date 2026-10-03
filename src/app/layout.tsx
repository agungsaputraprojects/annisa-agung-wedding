import type { Metadata, Viewport } from "next";
import { wedding } from "@/config/wedding";
import { formatLongDate } from "@/lib/date";
import "./globals.css";

const couple = `${wedding.groom.nickname} & ${wedding.bride.nickname}`;
const description = `Undangan pernikahan ${wedding.groom.fullName} & ${wedding.bride.fullName}, ${formatLongDate(wedding.events[0].date)}.`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: `Undangan ${couple}`,
  description,
  openGraph: {
    title: `The Wedding of ${couple}`,
    description,
    images: [{ url: wedding.cover.src, width: 1000, height: 1500, alt: wedding.cover.alt }],
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#111012", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
