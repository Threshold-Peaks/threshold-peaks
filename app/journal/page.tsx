import Link from "next/link";

const filters = ["Alle", "Running", "Cycling", "Music", "Story"];

const posts = [
  {
    category: "Story",
    date: "10. Mai 2026",
    status: "Live",
    title: "Warum Threshold Peaks?",
    text: "Über persönliche Schwellen, kleine Peaks und das Potenzial, das entsteht, wenn man bewusst weitergeht.",
    action: "Lesen",
    href: "#",
  },
  {
    category: "Running",
    date: "Demnächst",
    status: "Geplant",
    title: "Meine Trainingswoche",
    text: "Ein Blick auf Training, Belastung, Fortschritt und die kleinen Momente zwischen Bahn, Straße und Alltag.",
    action: "Demnächst",
    href: "#",
  },
  {
    category: "Music",
    date: "Demnächst",
    status: "Idee",
    title: "Warum Laufen und Musik zusammengehören",
    text: "Über Beats, Rhythmus, Fokus und die Verbindung zwischen elektronischer Musik und Bewegung.",
    action: "Demnächst",
    href: "#",
  },
  {
    category: "Running",
    date: "10. Juni 2026",
    status: "Event",
    title: "AOK-Firmenlauf Wiedenbrück 2026",
    text: "Gedanken, Vorbereitung und später vielleicht ein Rückblick auf den Firmenlauf in Wiedenbrück.",
    action: "Demnächst",
    href: "#",
  },
  {
    category: "Cycling",
    date: "In Planung",
    status: "Ride",
    title: "Gravelrunde rund um Verl",
    text: "Eine geplante Ausfahrt über Wege, Wälder und kleine Abenteuer direkt vor der Haustür.",
    action: "Demnächst",
    href: "#",
  },
  {
    category: "Music",
    date: "In Vorbereitung",
    status: "Sound",
    title: "Threshold Peaks Mix",
    text: "Ein elektronischer Mix für lange Läufe, Rides und späte Abendstunden. SoundCloud folgt.",
    action: "Demnächst",
    href: "#",
  },
];

export default function JournalPage() {
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
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.55em] text-neutral-500">
            Journal
          </p>

          <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
            Gedanken aus Bewegung, Klang und Alltag.
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-600">
            Training, Wettkämpfe, Gravelrunden, Musik und persönliche
            Entwicklung. Hier sammle ich Beiträge, Ideen und Geschichten rund
            um Threshold Peaks.
          </p>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className="rounded-full bg-[#ded9cf] px-5 py-3 text-xs font-bold uppercase tracking-[0.25em] text-neutral-700 shadow-sm transition hover:bg-[#d1ccc3]"
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article
              key={post.title}
              className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-black/10 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.45em] text-neutral-400">
                    {post.category}
                  </p>
                  <p className="mt-3 text-sm font-black uppercase tracking-[0.25em] text-neutral-500">
                    {post.date}
                  </p>
                </div>

                <div className="rounded-full bg-[#ded9cf] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-700 shadow-sm">
                  {post.status}
                </div>
              </div>

              <h2 className="text-2xl font-black leading-tight tracking-tight text-black">
                {post.title}
              </h2>

              <p className="mt-5 min-h-24 text-base leading-8 text-neutral-600">
                {post.text}
              </p>

              <div className="mt-8 border-t border-neutral-200 pt-5">
                <Link
                  href={post.href}
                  className="group flex items-center justify-between text-sm font-black text-black"
                >
                  <span>{post.action}</span>
                  <span className="transition group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}