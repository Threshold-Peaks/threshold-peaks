export default function DatenschutzPage() {
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
          Datenschutz
        </h1>

        <div className="space-y-8 text-base leading-8 text-black/75">
          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              Datenschutz auf einen Blick
            </h2>

            <p>
              Diese Datenschutzerklärung informiert darüber, welche
              personenbezogenen Daten beim Besuch dieser Webseite verarbeitet
              werden können.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              Verantwortliche Stelle
            </h2>

            <p>
              Matthias Klenk
              <br />
              Straße und Hausnummer
              <br />
              PLZ Ort
              <br />
              E-Mail: deine-mail@example.com
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              Hosting
            </h2>

            <p>
              Diese Webseite wird bei einem externen Hostinganbieter betrieben.
              Beim Besuch der Webseite können technische Zugriffsdaten wie
              IP-Adresse, Datum, Uhrzeit, Browsertyp und aufgerufene Seiten in
              Server-Logfiles verarbeitet werden.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              Kontaktaufnahme
            </h2>

            <p>
              Wenn du per E-Mail Kontakt aufnimmst, werden deine Angaben zur
              Bearbeitung der Anfrage verarbeitet. Diese Daten werden nicht ohne
              deine Einwilligung weitergegeben.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              Externe Links
            </h2>

            <p>
              Diese Webseite kann Links zu externen Plattformen wie Instagram,
              Strava oder SoundCloud enthalten. Beim Anklicken dieser Links
              gelten die Datenschutzbestimmungen der jeweiligen Anbieter.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              Hinweis
            </h2>

            <p>
              Dies ist ein Platzhalter für eine Datenschutzerklärung. Vor der
              Veröffentlichung solltest du die Inhalte an deine tatsächliche
              Webseite, deinen Hoster und verwendete Dienste anpassen.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}