/**
 * Semua isi undangan ada di file ini.
 * Teks di dalam [kurung siku] adalah placeholder dan akan tampil ditandai di halaman.
 */

export type Person = {
  nickname: string;
  fullName: string;
  role: string;
  parents: string;
  photo: Photo;
};

export type Photo = { src: string; alt: string };

export type WeddingEvent = {
  name: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM, WIB */
  start: string;
  end: string;
  venue: string;
  address: string;
  mapsUrl: string;
};

export type GiftAccount = { bank: string; number: string; holder: string };

export type GalleryItem = Photo & { caption: string };

export type WeddingConfig = {
  hashtag: string;
  timezoneOffset: string;
  groom: Person;
  bride: Person;
  events: WeddingEvent[];
  rsvpWhatsapp: string;
  gifts: GiftAccount[];
  dressCode: { note: string; colors: string[] };
  verse: { arabic: string; translation: string; source: string };
  cover: Photo;
  countdownPhoto: Photo;
  interlude: Photo & { arabic: string; text: string; source: string };
  closingPhotos: [Photo, Photo];
  gallery: GalleryItem[];
};

export const wedding: WeddingConfig = {
  hashtag: "#AgungIcha2026",
  timezoneOffset: "+07:00",

  groom: {
    nickname: "Agung",
    fullName: "Agung Saputra",
    role: "Mempelai Pria",
    parents: "Putra dari Bapak Alfanny & Ibu Watmawati",
    photo: { src: "/img/groom-drape.jpg", alt: "Potret Agung mengenakan tuksedo hitam" },
  },
  bride: {
    nickname: "Icha",
    fullName: "Annisa Aprilia Nilam Sari",
    role: "Mempelai Wanita",
    parents: "Putri dari Bapak Syahril Guci & Ibu Nining Lesmana",
    photo: { src: "/img/bride-drape.jpg", alt: "Potret Icha mengenakan gaun tulle hitam" },
  },

  events: [
    {
      name: "Akad Nikah",
      date: "2026-10-17",
      start: "08:00",
      end: "10:00",
      venue: "Rumah Kayu Ilir-Ilir",
      address: "Depok, Jawa Barat",
      mapsUrl: "https://maps.app.goo.gl/CLgZV6FXSgtbdSPGA",
    },
    {
      name: "Resepsi",
      date: "2026-10-17",
      start: "11:00",
      end: "14:00",
      venue: "Rumah Kayu Ilir-Ilir",
      address: "Depok, Jawa Barat",
      mapsUrl: "https://maps.app.goo.gl/CLgZV6FXSgtbdSPGA",
    },
  ],

  /** Nomor tujuan RSVP, format internasional tanpa + (contoh 6281234567890) */
  rsvpWhatsapp: "6281234567890",

  gifts: [
    { bank: "BCA", number: "[0000000000]", holder: "Agung Saputra" },
    { bank: "[Bank]", number: "[0000000000]", holder: "Annisa Aprilia Nilam Sari" },
  ],

  dressCode: {
    note: "Hitam, abu-abu, dan putih, senada dengan kami.",
    colors: ["#0E0E0D", "#6E6E69", "#F3F3F0"],
  },

  verse: {
    arabic:
      "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِّقَوْمٍ يَتَفَكَّرُونَ",
    translation:
      "Di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu merasa tenteram kepadanya, dan Dia menjadikan di antara kamu rasa cinta dan kasih sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir.",
    source: "QS. Ar-Rum : 21",
  },
  cover: { src: "/img/couple-drape.jpg", alt: "Agung dan Icha berdiri berdampingan di antara kain hitam menjuntai" },
  countdownPhoto: { src: "/img/silhouette-moon.jpg", alt: "Siluet Agung dan Icha saling berhadapan di depan lingkaran cahaya" },
  interlude: {
    src: "/img/shadow-front.jpg",
    alt: "Agung dan Icha dalam sorot cahaya, bayangan mereka jatuh di dinding",
    arabic: "وَخَلَقْنَاكُمْ أَزْوَاجًا",
    text: "Dan Kami menciptakan kamu berpasang-pasangan.",
    source: "QS. An-Naba : 8",
  },
  closingPhotos: [
    { src: "/img/groom-back.jpg", alt: "Agung berdiri membelakangi kamera" },
    { src: "/img/bride-back.jpg", alt: "Icha berdiri membelakangi kamera memegang buket lili" },
  ],

  gallery: [
    { src: "/img/couple-arm.jpg", caption: "Bergandeng", alt: "Agung dan Icha tersenyum, Icha menggandeng lengan Agung" },
    { src: "/img/cream-close.jpg", caption: "Tatap", alt: "Agung dan Icha saling menatap sambil tersenyum" },
    { src: "/img/back2back.jpg", caption: "Saling bersandar", alt: "Agung dan Icha berdiri saling membelakangi" },
    { src: "/img/cream-kick.jpg", caption: "Langkah", alt: "Agung dan Icha berpose ceria mengangkat kaki" },
    { src: "/img/couple-bouquet.jpg", caption: "Lili putih", alt: "Icha memegang buket lili putih di samping Agung" },
    { src: "/img/cream-seated.jpg", caption: "Duduk", alt: "Agung dan Icha duduk berdampingan" },
    { src: "/img/bride-bouquet.jpg", caption: "Icha", alt: "Icha tersenyum memegang buket bunga" },
    { src: "/img/groom-side.jpg", caption: "Agung", alt: "Agung berdiri menyamping dan menoleh ke kamera" },
    { src: "/img/cream-chair.jpg", caption: "Bersama", alt: "Agung duduk di kursi, Icha berdiri di belakangnya" },
    { src: "/img/back2back-closed.jpg", caption: "Hening", alt: "Agung dan Icha memejamkan mata, saling membelakangi" },
    { src: "/img/cream-hands.jpg", caption: "Genggam", alt: "Agung dan Icha bergandengan tangan" },
    { src: "/img/shadow-away.jpg", caption: "Bayang", alt: "Agung dan Icha dalam sorot cahaya dengan bayangan di dinding" },
  ],
};

export const sections = [
  { id: "mempelai", label: "Mempelai" },
  { id: "acara", label: "Acara" },
  { id: "galeri", label: "Galeri" },
  { id: "rsvp", label: "RSVP" },
  { id: "hadiah", label: "Hadiah" },
] as const;
