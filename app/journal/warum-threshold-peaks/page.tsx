import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warum Threshold Peaks?",
  description:
    "Ein persönlicher Beitrag über Schwellen, kleine Peaks, Bewegung, Ausdauer und das Potenzial, das entsteht, wenn man bewusst weitergeht.",
};
import Link from "next/link";
export default function WarumThresholdPeaksPage() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] px-6 py-12 text-[#111217] md:px-10 lg:px-20">
      <Link
  href="/"
  className="mb-12 inline-flex rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5"
>
  ← Zurück zur Startseite
</Link>

      <article className="mx-auto max-w-3xl">
        <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
          Journal · Story
        </p>

        <h1 className="mb-6 text-5xl font-black leading-none tracking-[-0.06em] md:text-7xl">
          Warum Threshold Peaks?
        </h1>

        <p className="mb-12 text-xl leading-8 text-black/60 md:text-2xl md:leading-9">
          Ein persönlicher Ort für Bewegung, Ausdauer und elektronische Musik.
        </p>

        <div className="space-y-7 text-lg leading-9 text-black/75">
          <p>
            Threshold Peaks ist aus der Idee entstanden, meine Leidenschaften an
            einem Ort zu verbinden: Laufen, Radfahren, elektronische Musik und
            den aktiven Lifestyle dahinter.
          </p>

          <p>
            Für mich geht es nicht nur um Kilometer, Pace oder Trainingsdaten.
            Es geht um den Moment, in dem Bewegung den Kopf frei macht. Um
            Läufe, die schwer beginnen und am Ende genau richtig waren. Um
            Runden mit dem Gravelbike, bei denen neue Wege entstehen. Und um
            elektronische Musik, die diesen Rhythmus begleitet.
          </p>

          <p>
            Der Name Threshold Peaks steht für Schwellen und Gipfel. Für die
            Grenze, an der es anstrengend wird. Für den Punkt, an dem man
            entscheidet, ob man stehen bleibt oder weitergeht. Genau dort
            beginnt Entwicklung: wenn man seine persönliche Schwelle erkennt,
            sie Stück für Stück verschiebt und merkt, dass oft mehr Potenzial in
            einem steckt, als man vorher geglaubt hat.
          </p>

          <p>
            Dabei geht es nicht darum, sich ständig zu überfordern. Es geht
            darum, bewusst zu wachsen. Im Training, im Alltag, im Kopf. Kleine
            Schritte, ehrliche Arbeit und die Bereitschaft, immer wieder ein
            Stück weiterzugehen.
          </p>

          <p>
            Diese Seite ist mein persönlicher Platz für genau diese Dinge. Für
            Training, Gedanken, Bilder, Musik und alles, was mich antreibt. Nicht
            perfekt, nicht fertig, sondern in Bewegung.
          </p>

          <p className="pt-4 text-2xl font-black tracking-[-0.04em] text-black">
            Beat the extra mile.
          </p>
        </div>
      </article>
    </main>
  );
}