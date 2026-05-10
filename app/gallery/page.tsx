import Image from "next/image";
import Link from "next/link";

const galleryItems = [
  {
    title: "Running",
    text: "Momente von der Strecke, vom Training und von Wettkämpfen.",
    image: "/images/running-checkpoint-1.webp",
  },
  {
    title: "Radfahren",
    text: "Touren, Räder, Straßen und kleine Abenteuer auf zwei Rädern.",
    image: "/images/running-checkpoint-1.webp",
  },
  {
    title: "Musik",
    text: "Sounds, Setups und elektronische Stimmung rund um Threshold Peaks.",
    image: "/images/running-checkpoint-1.webp",
  },
  {
    title: "Story",
    text: "Bilder, die kleine Geschichten erzählen.",
    image: "/images/running-checkpoint-1.webp",
  },
];

export default function GaleriePage() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
  <Link
    href="/"
    className="inline-flex rounded-full bg-[#ded9cf] px-5 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-[#d1ccc3]"
  >
    ← Zurück zur Startseite
  </Link>
</div>
        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Threshold Peaks
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Galerie
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
            Eine kleine Sammlung aus Bewegung, Ausdauer, Musik und Momenten,
            die den Puls der Seite sichtbar machen.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {galleryItems.map((item) => (
            <article
              key={item.title}
              className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="relative h-72 w-full overflow-hidden bg-neutral-200">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="p-7">
                <div className="mb-5 inline-flex rounded-full bg-[#ded9cf] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-700">
                  Galerie
                </div>

                <h2 className="text-2xl font-bold text-black">
                  {item.title}
                </h2>

                <p className="mt-4 leading-7 text-neutral-700">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}