import BackHeader from "@/components/BackHeader";

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#111217]">
      <BackHeader />

      <section className="mx-auto max-w-6xl px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
            Rechtliches
          </p>

          <h1 className="mb-10 text-4xl font-black tracking-[-0.04em] text-black md:text-6xl">
            Impressum
          </h1>

          <div className="space-y-8 text-base leading-8 text-black/75">
            <section>
              <h2 className="mb-3 text-xl font-black text-black">
                Anbieterkennzeichnung
              </h2>

              <p>
                Matthias Klenk
                <br />
                Libellenstraße 47
                <br />
                33415 Verl
                <br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-black">Kontakt</h2>

              <p>
                E-Mail:{" "}
                <a
                  href="mailto:info@threshold-peaks.de"
                  className="font-bold text-black underline underline-offset-4 transition hover:text-orange-600"
                >
                  info@threshold-peaks.de
                </a>
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-black">
                Verantwortlich für den Inhalt
              </h2>

              <p>
                Matthias Klenk
                <br />
                Libellenstraße 47
                <br />
                33415 Verl
                <br />
                Deutschland
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-black">
                Haftung für Inhalte
              </h2>

              <p>
                Die Inhalte dieser Webseite wurden mit größtmöglicher Sorgfalt
                erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der
                Inhalte kann jedoch keine Gewähr übernommen werden.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-black text-black">
                Haftung für Links
              </h2>

              <p>
                Diese Webseite enthält Links zu externen Webseiten Dritter, auf
                deren Inhalte kein Einfluss besteht. Für diese fremden Inhalte
                wird keine Gewähr übernommen. Für die Inhalte der verlinkten
                Seiten ist stets der jeweilige Anbieter oder Betreiber
                verantwortlich.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}