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

/** `position` = CSS object-position, to keep people in frame when the 9:16 story crops the photo */
export type Photo = { src: string; alt: string; position?: string };

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

export type GallerySection = { label: string; items: GalleryItem[] };

export type StoryChapter = {
  title: string;
  /**
   * Optional framing for this chapter only: "top" shows the photo from the top in a shorter frame
   * (so faces stay above the card) and fills the rest with `fill`, the photo's own floor colour.
   */
  fit?: "cover" | "top";
  fill?: string;
  /** shown above the title, e.g. "2019 · Bogor" */
  when: string;
  /** keep it short: about 2–4 sentences (max ±320 characters) so the card fits without scrolling */
  text: string;
  photo: Photo;
};

export type WeddingConfig = {
  hashtag: string;
  /** how the couple is named everywhere (cover, story header, RSVP message, calendar) */
  coupleName: string;
  /** initials in the round avatar at the top of the story */
  monogram: string;
  /** first slide after the cover */
  opening: Photo;
  timezoneOffset: string;
  groom: Person;
  bride: Person;
  events: WeddingEvent[];
  gifts: GiftAccount[];
  dressCode: { note: string; colors: string[] };
  verse: { arabic: string; translation: string; source: string };
  cover: Photo;
  countdownPhoto: Photo;
  interlude: Photo & { arabic: string; text: string; source: string };
  closingPhotos: [Photo, Photo];
  /** "Our Stories": three chapters shown as cards over a photo */
  story: StoryChapter[];
  gallery: GallerySection[];
};

export const wedding: WeddingConfig = {
  hashtag: "#mengAGUNGkanICHA",
  coupleName: "Annisa & Agung",
  monogram: "A&A",
  opening: { src: "/img/cream-gaze.jpg", alt: "Annisa dan Agung berdiri berdampingan saling menatap" },
  timezoneOffset: "+07:00",

  groom: {
    nickname: "Agung",
    fullName: "Agung Saputra",
    role: "Mempelai Pria",
    parents: "Putra dari Bapak Alfanny & Ibu Watmawati",
    photo: { src: "/img/groom-side.jpg", alt: "Potret Agung berkacamata mengenakan jas hitam", position: "55% 30%" },
  },
  bride: {
    nickname: "Annisa",
    fullName: "Annisa Aprilia Nilam Sari",
    role: "Mempelai Wanita",
    parents: "Putri dari Bapak Syahril Guci & Ibu Nining Lesmana",
    photo: { src: "/img/bride-bouquet.jpg", alt: "Potret Annisa memegang buket lili putih", position: "88% 35%" },
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
      end: "13:00",
      venue: "Rumah Kayu Ilir-Ilir",
      address: "Depok, Jawa Barat",
      mapsUrl: "https://maps.app.goo.gl/CLgZV6FXSgtbdSPGA",
    },
  ],


  gifts: [
    { bank: "BCA", number: "2280150480", holder: "Agung Saputra" },
    { bank: "BRI", number: "034001118142502", holder: "Annisa Aprilia Nilam Sari" },
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
  /** left, right */
  closingPhotos: [
    { src: "/img/bride-back.jpg", alt: "Annisa berdiri membelakangi kamera memegang buket lili", position: "50% 85%" },
    { src: "/img/groom-back.jpg", alt: "Agung berdiri membelakangi kamera", position: "50% 58%" },
  ],

  story: [
    {
      title: "Pertemuan",
      when: "2018 · IPB",
      text: "Semesta mempertemukan kami di bangku perkuliahan pada tahun 2018, melalui BEM Sekolah Vokasi IPB.\n\nSaat itu, Agung merupakan satu tingkat di atas Annisa dan menjabat sebagai Ketua Departemen Kominfo, sementara Annisa adalah staf baru yang baru bergabung. Hampir setiap minggu kami bertemu dalam rapat organisasi. Dari yang awalnya hanya sebatas urusan organisasi, perlahan tumbuh kebersamaan yang sederhana.\n\nKami mulai sering berkumpul, menghabiskan waktu bersama, hingga sesekali mengerjakan tugas hanya berdua. Kala itu, hubungan kami hanyalah seperti kakak dan adik yang senang bercanda, berbagi cerita, dan saling menjadi tempat berkeluh kesah.\n\nTanpa kami sadari, pertemuan sederhana itu kelak menjadi awal dari sebuah cerita yang jauh lebih berarti.",
      photo: { src: "/img/back2back.jpg", alt: "Agung dan Icha berdiri saling membelakangi", position: "75% 50%" },
    },
    {
      title: "Dipertemukan Kembali",
      when: "2024–2026",
      text: "Waktu berlalu. Setelah beberapa tahun menjalani kehidupan masing-masing dan sempat kehilangan komunikasi, kami kembali dipertemukan.\n\nAwalnya terasa canggung, karena masih ada bayang-bayang hubungan kakak dan adik seperti dulu. Namun, kami memilih untuk saling mengenal kembali—kali ini dengan cara yang berbeda.\n\nPerlahan, kami belajar memahami satu sama lain, mengenal sisi-sisi yang sebelumnya belum pernah kami lihat, menerima perbedaan, dan tumbuh bersama sebagai pasangan. Hingga akhirnya kami menyadari bahwa mungkin, setelah sekian lama berjalan di jalan masing-masing, kami memang sedang diarahkan untuk kembali menemukan satu sama lain.",
      photo: { src: "/img/cream-close.jpg", alt: "Agung dan Icha saling menatap sambil tersenyum" },
    },
    {
      title: "Menuju Selamanya",
      when: "7 Juni 2026",
      text: "Dengan penuh keyakinan, pada 7 Juni 2026, Agung menyampaikan keseriusannya untuk meminang Annisa dalam sebuah acara lamaran.\n\nHari itu menjadi langkah penting dalam perjalanan kami—sebuah keputusan untuk tidak lagi sekadar menjadi bagian dari cerita satu sama lain, tetapi untuk menjadikan satu sama lain sebagai bagian dari seluruh perjalanan hidup.\n\nDan kini, setelah perjalanan panjang yang bermula dari sebuah pertemuan sederhana di bangku kuliah, insyaAllah pada 17 Oktober 2026, kami akan mengikat janji dalam sebuah pernikahan.\n\nBukan tentang bagaimana cerita kami dimulai, tetapi tentang bagaimana Allah mempertemukan, memisahkan, lalu mempertemukan kami kembali pada waktu yang tepat.",
      photo: { src: "/img/cream-hands.jpg", alt: "Agung dan Icha bergandengan tangan" },
      fit: "top",
      fill: "#D4C1B4",
    },
  ],

  gallery: [
    {
      label: "Kenangan",
      items: [
        { src: "/img/kenangan-konser.jpg", caption: "Konser", alt: "Agung dan Annisa di depan panggung acara kampus" },
        { src: "/img/kenangan-taman.jpg", caption: "Taman", alt: "Agung dan Annisa membentuk hati dengan tangan di taman" },
        { src: "/img/kenangan-selfie.jpg", caption: "Selfie", alt: "Agung dan Annisa selfie bersama" },
      ],
    },
    {
      label: "Lamaran",
      items: [
        { src: "/img/lamaran-cincin.jpg", caption: "Cincin", alt: "Agung dan Annisa memperlihatkan cincin lamaran di depan dekorasi bunga" },
        { src: "/img/lamaran-buket.jpg", caption: "Buket", alt: "Agung memberikan buket bunga kepada Annisa" },
        { src: "/img/lamaran-berdua.jpg", caption: "Berdua", alt: "Agung dan Annisa berdiri berdampingan di depan dekorasi bunga" },
        { src: "/img/lamaran-lentera.jpg", caption: "Lentera", alt: "Agung dan Annisa saling menatap di bawah lentera rotan" },
      ],
    },
    {
      label: "Prewed",
      items: [
        { src: "/img/couple-arm.jpg", caption: "Bergandeng", alt: "Agung dan Icha tersenyum, Icha menggandeng lengan Agung" },
        { src: "/img/cream-close.jpg", caption: "Tatap", alt: "Agung dan Icha saling menatap sambil tersenyum" },
        { src: "/img/back2back.jpg", caption: "Saling bersandar", alt: "Agung dan Icha berdiri saling membelakangi" },
        { src: "/img/cream-kick.jpg", caption: "Langkah", alt: "Agung dan Icha berpose ceria mengangkat kaki" },
        { src: "/img/couple-bouquet.jpg", caption: "Lili putih", alt: "Icha memegang buket lili putih di samping Agung" },
        { src: "/img/cream-seated.jpg", caption: "Duduk", alt: "Agung dan Icha duduk berdampingan" },
        { src: "/img/bride-bouquet.jpg", caption: "Annisa", alt: "Annisa tersenyum memegang buket bunga" },
        { src: "/img/groom-side.jpg", caption: "Agung", alt: "Agung berdiri menyamping dan menoleh ke kamera" },
        { src: "/img/cream-chair.jpg", caption: "Bersama", alt: "Agung duduk di kursi, Icha berdiri di belakangnya" },
        { src: "/img/back2back-closed.jpg", caption: "Hening", alt: "Agung dan Icha memejamkan mata, saling membelakangi" },
        { src: "/img/cream-hands.jpg", caption: "Genggam", alt: "Agung dan Icha bergandengan tangan" },
        { src: "/img/shadow-away.jpg", caption: "Bayang", alt: "Agung dan Icha dalam sorot cahaya dengan bayangan di dinding" },
      ],
    },
  ],
};

export const sections = [
  { id: "mempelai", label: "Mempelai" },
  { id: "acara", label: "Acara" },
  { id: "galeri", label: "Galeri" },
  { id: "rsvp", label: "RSVP" },
  { id: "hadiah", label: "Hadiah" },
] as const;
