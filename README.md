# Undangan Agung & Icha · Stories

Pemutar ala Instagram Stories: satu layar per bagian, bar progres, ketuk kanan/kiri atau geser untuk pindah, tahan untuk jeda, tombol panah & scroll di desktop.

Next.js 16 (App Router) + TypeScript, tanpa library UI tambahan. Animasi memakai CSS dan satu `requestAnimationFrame` / `IntersectionObserver` bersama, dan otomatis mati bila pengunjung mengaktifkan *reduce motion*.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Saat deploy (mis. Vercel), set `NEXT_PUBLIC_SITE_URL` ke domain undangan supaya gambar preview link (Open Graph) muncul di WhatsApp.

## Mengubah isi

Semua data ada di **`src/config/wedding.ts`**: nama, orang tua, jadwal, lokasi, nomor WhatsApp RSVP, rekening, foto.
Teks dalam `[kurung siku]` dianggap placeholder dan tampil ditandai di halaman.

Nama tamu diambil dari link: `https://domain-anda/?to=Bapak+Budi+dan+Keluarga`

## Struktur

```
src/
  app/              layout, page (render undangan), globals.css (reset + animasi reveal dasar)
  config/wedding.ts seluruh isi undangan + tipe datanya
  invitation/       tampilan model ini: StoriesInvitation.tsx, StoryBits.tsx, StoryPlayer.tsx, fonts.ts, stories.module.css
  components/
    motion/         Reveal, MotionRoot (arah scroll + html.anim), ThemeBody
    ui/             RsvpFields, CopyButton, Lightbox, Placeholder
  hooks/            useCountdown, useRsvp, useCopy, useReveal, useScrollFrame, useReducedMotion
  lib/              date, whatsapp, guest, scrollLoop, revealObserver
public/img/         foto prewedding (sudah diperkecil untuk web)
```

Komponen di `components/` dan `hooks/` tidak bergantung pada model, jadi bisa dipindah ke repo lain apa adanya.
`RsvpFields` menerima `classes` sehingga formulir yang sama bisa ditata ulang sepenuhnya.
