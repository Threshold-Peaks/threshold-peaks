import BackHeader from "@/components/BackHeader";

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-[#f4efe6] text-[#111217]">
      <BackHeader />

      <section className="mx-auto max-w-3xl px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-20">
        <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
          Rechtliches
        </p>

        <h1 className="mb-10 text-4xl font-black tracking-[-0.04em] text-black md:text-6xl">
          Datenschutz
        </h1>

        <div className="space-y-8 text-base leading-8 text-black/75">
          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              1. Datenschutz auf einen Blick
            </h2>

            <p>
              Diese Datenschutzerklärung informiert darüber, welche
              personenbezogenen Daten beim Besuch dieser Webseite verarbeitet
              werden, zu welchen Zwecken dies geschieht und welche Rechte
              betroffene Personen haben.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              2. Verantwortlicher
            </h2>

            <p>
              Verantwortlich für die Datenverarbeitung auf dieser Webseite ist:
            </p>

            <p className="mt-4">
              Matthias Klenk
              <br />
              Libellenstraße 47
              <br />
              33415 Verl
              <br />
              Deutschland
              <br />
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
            <h2 className="mb-3 text-xl font-black text-black">3. Hosting</h2>

            <p>
              Diese Webseite wird über Vercel Inc. bereitgestellt. Beim Besuch
              der Webseite können durch den Hostinganbieter technische
              Zugriffsdaten verarbeitet werden. Dazu können insbesondere
              IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene Seiten,
              Browsertyp, Betriebssystem und Referrer URL gehören.
            </p>

            <p className="mt-4">
              Die Verarbeitung erfolgt, um die Webseite technisch
              bereitzustellen, die Stabilität und Sicherheit zu gewährleisten
              und Missbrauch zu verhindern. Rechtsgrundlage ist Art. 6 Abs. 1
              lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              4. Server-Logfiles
            </h2>

            <p>
              Beim Aufruf dieser Webseite werden automatisch technische Daten
              verarbeitet, die für den Betrieb der Webseite erforderlich sind.
              Diese Daten dienen der technischen Auslieferung, Fehleranalyse und
              Sicherheit der Webseite.
            </p>

            <p className="mt-4">
              Eine Zusammenführung dieser Daten mit anderen Datenquellen erfolgt
              nicht durch den Betreiber dieser Webseite.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              5. Kontaktaufnahme per E-Mail
            </h2>

            <p>
              Wenn du per E-Mail Kontakt aufnimmst, werden die von dir
              übermittelten Daten verarbeitet, um deine Anfrage zu beantworten.
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, sofern die
              Anfrage mit einem vorvertraglichen oder vertraglichen Anliegen
              zusammenhängt. In allen anderen Fällen erfolgt die Verarbeitung auf
              Grundlage von Art. 6 Abs. 1 lit. f DSGVO.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              6. Strava API
            </h2>

            <p>
              Auf dieser Webseite werden über eine serverseitige Schnittstelle
              aktuelle sportliche Aktivitäten aus Strava angezeigt. Dabei werden
              öffentlich bzw. autorisiert bereitgestellte Aktivitätsdaten wie
              Aktivitätsname, Sportart, Distanz, Dauer, Höhenmeter, Datum und
              ein Link zur jeweiligen Aktivität verarbeitet und auf der Webseite
              dargestellt.
            </p>

            <p className="mt-4">
              Die Abfrage erfolgt serverseitig über die Strava API.
              Strava-Zugangsdaten werden nicht im Browser veröffentlicht. Die
              Verarbeitung dient der Darstellung aktueller sportlicher
              Aktivitäten auf dieser Webseite. Rechtsgrundlage ist Art. 6 Abs. 1
              lit. f DSGVO.
            </p>

            <p className="mt-4">
              Beim Anklicken eines Strava-Links wirst du zu Strava
              weitergeleitet. Für die dortige Datenverarbeitung ist Strava
              verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              7. Externe Links
            </h2>

            <p>
              Diese Webseite kann Links zu externen Plattformen wie Instagram,
              SoundCloud oder Strava enthalten. Beim Anklicken eines externen
              Links verlässt du diese Webseite. Für die Datenverarbeitung auf
              den verlinkten Seiten sind die jeweiligen Anbieter verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              8. Cookies und Tracking
            </h2>

            <p>
              Diese Webseite verwendet derzeit keine eigenen Tracking-Cookies
              und keine Analysewerkzeuge wie Google Analytics. Sollten später
              entsprechende Dienste eingebunden werden, wird diese
              Datenschutzerklärung angepasst.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              9. Speicherdauer
            </h2>

            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie dies
              für die jeweiligen Zwecke erforderlich ist oder gesetzliche
              Aufbewahrungspflichten bestehen. E-Mail-Anfragen werden gelöscht,
              sobald sie nicht mehr erforderlich sind, sofern keine gesetzlichen
              Aufbewahrungspflichten entgegenstehen.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              10. Rechte betroffener Personen
            </h2>

            <p>
              Betroffene Personen haben nach Maßgabe der gesetzlichen
              Bestimmungen das Recht auf Auskunft, Berichtigung, Löschung,
              Einschränkung der Verarbeitung, Datenübertragbarkeit sowie das
              Recht auf Widerspruch gegen bestimmte Verarbeitungen.
            </p>

            <p className="mt-4">
              Außerdem besteht das Recht, sich bei einer zuständigen
              Datenschutzaufsichtsbehörde zu beschweren.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-black text-black">
              11. Aktualität dieser Datenschutzerklärung
            </h2>

            <p>
              Diese Datenschutzerklärung kann angepasst werden, wenn sich die
              Webseite oder die verwendeten Dienste ändern.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}