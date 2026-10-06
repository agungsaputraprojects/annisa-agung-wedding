# Undangan Agung & Icha · Stories

Pemutar ala Instagram Stories: satu layar per bagian, bar progres, ketuk kanan/kiri atau geser untuk pindah, tahan untuk jeda, tombol panah & scroll di desktop.

Next.js 16 (App Router) + TypeScript, tanpa library UI tambahan. Animasi memakai CSS dan satu `requestAnimationFrame` / `IntersectionObserver` bersama, dan otomatis mati bila pengunjung mengaktifkan *reduce motion*.

## Alur

1. **Cover profil.** Lingkaran foto dengan cincin seperti story yang belum dilihat, nama, tagar, angka ringkas (tanggal · jumlah acara · jumlah foto), dan nama tamu. Hanya lingkaran foto yang bisa diketuk.
2. **Loading.** Cincin berubah jadi putus-putus dan berputar (minimal ±1,3 detik) sambil foto story pertama dimuat.
3. **Membuka.** Story muncul dari lingkaran yang membesar sampai layar penuh, lalu mulai berputar.
4. **Hanya ketuk.** Tidak ada scroll, roda mouse, atau geser. Ketuk sisi kanan untuk lanjut, sisi kiri untuk kembali, tahan untuk jeda; di desktop juga tombol panah dan tombol keyboard ← →. Semua layar (termasuk Galeri dan RSVP) dirancang muat tanpa digulir, sampai layar 360×640.
5. **Tutup (✕ atau Esc).** Kembali ke cover. Cincin menjadi abu-abu, tanda sudah dilihat.

Cover ada di `src/invitation/StoryCover.tsx`; alurnya diatur `StoryPlayer` (state `cover → loading → opening → story`).

## Ucapan & doa (Supabase)

Slide konfirmasi kehadiran berupa kolom komentar: tamu menulis nama, memilih Hadir/Berhalangan (+ jumlah tamu), lalu ucapannya tampil untuk semua tamu dan muncul langsung (realtime) di HP tamu lain. Jumlah tamu disimpan terpisah dan hanya bisa dilihat dari dashboard Supabase.

**Setup sekali (±5 menit):**

1. Buat akun & project gratis di [supabase.com](https://supabase.com).
2. Dashboard → **SQL Editor** → New query → tempel isi `supabase/schema.sql` → **Run**.
3. Dashboard → **Project Settings → API**: salin *Project URL* dan *Publishable key* (atau *anon public key*).
4. Salin `.env.example` menjadi `.env.local`, isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Di Vercel, isi variabel yang sama di *Settings → Environment Variables*.

Tanpa key, slide tetap tampil dengan pesan "Ucapan belum bisa dimuat". Untuk sekadar melihat tampilannya, jalankan dengan `NEXT_PUBLIC_WISHES_DEMO=1` (contoh ucapan, tidak tersimpan).

**Mengelola ucapan:** Table Editor → `wishes` untuk melihat/menghapus ucapan. Rekap kehadiran & total tamu: lihat query di bagian bawah `supabase/schema.sql`.

**Pengaman:** panjang nama ≤ 60 dan ucapan ≤ 300 karakter, kiriman ganda ditolak, jeda 30 detik antar kiriman per HP, dan rem 30 ucapan/menit untuk seluruh undangan. Tamu tidak bisa mengubah atau menghapus ucapan.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Saat deploy (mis. Vercel), set `NEXT_PUBLIC_SITE_URL` ke domain undangan supaya gambar preview link (Open Graph) muncul di WhatsApp.

## Mengubah isi

Semua data ada di **`src/config/wedding.ts`**: nama, orang tua, jadwal, lokasi, nomor WhatsApp RSVP, rekening, foto.
Bagian **Our Stories** (3 bab: Pertemuan, Perkenalan, Memutuskan Menikah) ada di `story` dalam file yang sama: isi `when` (mis. "2019 · Bogor") dan `text` (±2–4 kalimat, maks. ±320 karakter agar kartu muat tanpa digulir; teks lebih panjang dipotong dengan "…"). Foto tiap bab bisa diganti di `photo`.

Teks dalam `[kurung siku]` dianggap placeholder dan tampil ditandai di halaman.

Rekening amplop digital ada di `gifts`. Untuk satu bab Our Stories, `fit: "top"` + `fill` menampilkan foto utuh dari atas dan mengisi sisa bawahnya dengan warna lantai foto.

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
