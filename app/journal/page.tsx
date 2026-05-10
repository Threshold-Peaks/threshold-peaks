const journalItems = [
  {
    category: "Running Notes",
    title: "Training, Fokus und Fortschritt",
    text: "Gedanken rund ums Laufen, Bahntraining, Wettkämpfe und die kleinen Schritte, die am Ende den Unterschied machen.",
    tag: "Laufen",
  },
  {
    category: "Gravel Diaries",
    title: "Wege, Wälder und Ausgleich",
    text: "Rennrad, Gravelbike und Touren draußen. Alles, was Bewegung leichter macht und den Kopf freipustet.",
    tag: "Radfahren",
  },
  {
    category: "Sound & Motion",
    title: "Beats für lange Strecken",
    text: "Elektronische Musik, DJ-Sets, Tracks und die Verbindung zwischen Rhythmus, Energie und Bewegung.",
    tag: "Musik",
  },
];

export default function JournalPage() {
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
          Journal
        </p>

        <div className="mb-12 max-w-3xl">
          <h1 className="mb-6 text-5xl font-black leading-none tracking-[-0.06em] md:text-7xl">
            Geschichten aus Bewegung, Klang und Alltag.
          </h1>

          <p className="max-w-2xl text-base leading-8 text-black/65 md:text-lg">
            Hier entsteht ein persönlicher Bereich für Gedanken, Training,
            Touren, Musik und alles, was Threshold Peaks ausmacht.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {journalItems.map((item) => (
            <article
              key={item.category}
              className="rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="mb-5 text-[10px] font-black uppercase tracking-[0.35em] text-black/45">
                {item.category}
              </p>

              <h2 className="mb-4 text-2xl font-black leading-tight tracking-[-0.04em]">
                {item.title}
              </h2>

              <p className="mb-8 leading-7 text-black/65">{item.text}</p>

              <span className="inline-flex rounded-full border border-black/10 bg-[#f7f7f5] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black/55">
                {item.tag}
              </span>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-[2rem] border border-black/10 bg-[#111217] p-8 text-white shadow-xl md:p-10">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-white/45">
            Bald mehr
          </p>

          <h2 className="mb-4 text-3xl font-black tracking-[-0.04em] md:text-4xl">
            Der Journal-Bereich wächst Stück für Stück.
          </h2>

          <p className="max-w-2xl leading-8 text-white/65">
            Später können hier echte Beiträge erscheinen, zum Beispiel
            Trainingsberichte, Wettkampferfahrungen, Gravel-Touren,
            Musikempfehlungen oder persönliche Gedanken.
          </p>
        </div>
      </section>
    </main>
  );
}