const posts = [
  {
    category: "Story",
    title: "Warum Threshold Peaks?",
    text: "Über persönliche Schwellen, kleine Peaks und das Potenzial, das entsteht, wenn man bewusst weitergeht.",
    date: "10. Mai 2026",
    tag: "Live",
    href: "/journal/warum-threshold-peaks",
    available: true,
  },
  {
    category: "Running",
    title: "Meine Trainingswoche",
    text: "Ein Blick auf Training, Belastung, Fortschritt und die kleinen Momente zwischen Bahn, Straße und Alltag.",
    date: "Demnächst",
    tag: "Geplant",
    href: "#",
    available: false,
  },
  {
    category: "Music",
    title: "Warum Laufen und Musik zusammengehören",
    text: "Über Beats, Rhythmus, Fokus und die Verbindung zwischen elektronischer Musik und Bewegung.",
    date: "Demnächst",
    tag: "Idee",
    href: "#",
    available: false,
  },
  {
    category: "Running",
    title: "AOK-Firmenlauf Wiedenbrück 2026",
    text: "Gedanken, Vorbereitung und später vielleicht ein Rückblick auf den Firmenlauf in Wiedenbrück.",
    date: "10. Juni 2026",
    tag: "Event",
    href: "#",
    available: false,
  },
  {
    category: "Cycling",
    title: "Gravelrunde rund um Verl",
    text: "Eine geplante Ausfahrt über Wege, Wälder und kleine Abenteuer direkt vor der Haustür.",
    date: "In Planung",
    tag: "Ride",
    href: "#",
    available: false,
  },
  {
    category: "Music",
    title: "Threshold Peaks Mix",
    text: "Ein elektronischer Mix für lange Läufe, Rides und späte Abendstunden. SoundCloud folgt.",
    date: "In Vorbereitung",
    tag: "Sound",
    href: "#",
    available: false,
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
            Gedanken aus Bewegung, Klang und Alltag.
          </h1>

          <p className="max-w-2xl text-base leading-8 text-black/65 md:text-lg">
            Training, Wettkämpfe, Gravelrunden, Musik und persönliche
            Entwicklung. Hier sammle ich Beiträge, Ideen und Geschichten rund um
            Threshold Peaks.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap gap-3">
          {["Alle", "Running", "Cycling", "Music", "Story"].map((filter) => (
            <span
              key={filter}
              className="rounded-full border border-black/10 bg-white/70 px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-black/60 shadow-sm"
            >
              {filter}
            </span>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <JournalOverviewCard key={post.title} {...post} />
          ))}
        </div>
      </section>
    </main>
  );
}

function JournalOverviewCard({
  category,
  title,
  text,
  date,
  tag,
  href,
  available,
}: {
  category: string;
  title: string;
  text: string;
  date: string;
  tag: string;
  href: string;
  available: boolean;
}) {
  const content = (
    <>
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-black/45">
            {category}
          </p>

          <p className="text-sm font-black uppercase tracking-[0.22em] text-black/50">
            {date}
          </p>
        </div>

        <span className="rounded-full border border-black/10 bg-[#f7f7f5] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
          {tag}
        </span>
      </div>

      <h2 className="mb-4 text-2xl font-black leading-tight tracking-[-0.04em]">
        {title}
      </h2>

      <p className="mb-8 leading-7 text-black/65">{text}</p>

      <div className="mt-auto flex items-center justify-between border-t border-black/10 pt-5">
        <span className="text-sm font-black">
          {available ? "Lesen" : "Demnächst"}
        </span>

        <span className="transition group-hover:translate-x-1">→</span>
      </div>
    </>
  );

  if (available) {
    return (
      <a
        href={href}
        className="group flex min-h-[330px] flex-col rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
      >
        {content}
      </a>
    );
  }

  return (
    <article className="flex min-h-[330px] flex-col rounded-[2rem] border border-black/10 bg-white/45 p-7 opacity-80 shadow-sm backdrop-blur-xl">
      {content}
    </article>
  );
}