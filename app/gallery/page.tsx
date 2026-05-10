import Image from "next/image";

const galleryItems = [
  {
    title: "Checkpoint Run",
    category: "Running",
    image: "/images/running-checkpoint.webp",
    alt: "Matthias beim Lauf am Checkpoint Charlie",
  },
  {
    title: "Gravel Woods",
    category: "Cycling",
    image: "/images/cycling-gravel.webp",
    alt: "Gravelbike im Wald",
  },
  {
    title: "Sound & Motion",
    category: "Music",
    image: "/images/music-dj.webp",
    alt: "DJ-Setup mit Controller",
  },
  {
    title: "About Matthias",
    category: "Life",
    image: "/images/about-matthias.webp",
    alt: "Portrait von Matthias",
  },
];

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-12 text-[#111217] md:px-10 lg:px-20">
      <a
        href="/"
        className="mb-12 inline-flex rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5"
      >
        ← Zurück zur Startseite
      </a>

      <section className="mx-auto max-w-[1280px]">
        <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
          Galerie
        </p>

        <div className="mb-12 max-w-3xl">
          <h1 className="mb-6 text-5xl font-black leading-none tracking-[-0.06em] md:text-7xl">
            Momente aus Bewegung, Klang und Freiheit.
          </h1>

          <p className="max-w-2xl text-base leading-8 text-black/65 md:text-lg">
            Eine kleine Sammlung aus Läufen, Touren, Musikmomenten und allem,
            was Threshold Peaks sichtbar macht.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {galleryItems.map((item) => (
            <article
              key={item.title}
              className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-[320px] overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/65">
                    {item.category}
                  </p>

                  <h2 className="text-2xl font-black tracking-[-0.04em]">
                    {item.title}
                  </h2>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-sm backdrop-blur-xl md:p-10">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/45">
            Bald mehr
          </p>

          <h2 className="mb-4 text-3xl font-black tracking-[-0.04em] md:text-4xl">
            Die Galerie wächst mit neuen Momenten.
          </h2>

          <p className="max-w-2xl leading-8 text-black/65">
            Später können hier weitere Bilder aus Wettkämpfen, Trainings,
            Gravelrunden, DJ-Sets und Momenten mit Sikari und Snow erscheinen.
          </p>
        </div>
      </section>
    </main>
  );
}