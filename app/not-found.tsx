import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] px-6 py-12 text-[#111217]">
      <section className="mx-auto max-w-3xl text-center">
        <div className="mb-8 inline-flex rounded-full border border-black/10 bg-white/70 px-5 py-3 text-xs font-black uppercase tracking-[0.35em] shadow-sm">
          Threshold Peaks
        </div>

        <h1 className="mb-6 text-[72px] font-black leading-none tracking-[-0.08em] md:text-[120px]">
          404
        </h1>

        <h2 className="mb-6 text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
          Diese Route führt ins Leere.
        </h2>

        <p className="mx-auto mb-10 max-w-xl text-base leading-8 text-black/65 md:text-lg">
          Die gesuchte Seite wurde nicht gefunden. Vielleicht ist der Link
          falsch, die Strecke gesperrt oder der Pfad noch nicht markiert.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-w-[220px] items-center justify-between rounded-md bg-[#111217] px-7 py-4 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Zur Startseite <span>→</span>
          </Link>

          <Link
            href="/#contact"
            className="inline-flex min-w-[220px] items-center justify-between rounded-md border border-black/10 bg-white/70 px-7 py-4 text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            Kontakt aufnehmen <span>→</span>
          </Link>
        </div>

        <div className="mt-14 flex justify-center">
          <svg
            viewBox="0 0 160 80"
            fill="none"
            className="h-16 w-32 text-black/20"
            aria-hidden="true"
          >
            <path
              d="M8 58H35L58 20L82 58L105 36L152 58"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>
    </main>
  );
}
