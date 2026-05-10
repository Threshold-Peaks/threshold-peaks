export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] px-6 py-12 text-[#111217] md:px-10 lg:px-20">
      <a
        href="/"
        className="mb-10 inline-flex rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-bold shadow-sm transition hover:-translate-y-0.5"
      >
        ← Zurück zur Startseite
      </a>

      <section className="max-w-3xl">
        <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
          Rechtliches
        </p>

        <h1 className="mb-8 text-4xl font-black tracking-[-0.04em] md:text-6xl">
          Impressum
        </h1>

        <div className="space-y-8 text-base leading-8 text-black/75">
          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              Angaben gemäß § 5 TMG
            </h2>

            <p>
              Matthias Klenk
              <br />
              Straße und Hausnummer
              <br />
              PLZ Ort
              <br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">Kontakt</h2>

            <p>
              E-Mail: deine-mail@example.com
              <br />
              Telefon: optional
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              Verantwortlich für den Inhalt
            </h2>

            <p>
              Matthias Klenk
              <br />
              Straße und Hausnummer
              <br />
              PLZ Ort
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">Hinweis</h2>

            <p>
              Dies ist ein Platzhalter-Impressum. Bitte ersetze die Angaben vor
              der Veröffentlichung durch deine korrekten Daten und prüfe, ob
              weitere Angaben erforderlich sind.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}