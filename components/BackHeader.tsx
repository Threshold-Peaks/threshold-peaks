import Link from "next/link";

type BackHeaderProps = {
  href?: string;
  label?: string;

  /**
   * Sicherheits-Alias für ältere Aufrufe.
   * href hat Vorrang.
   */
  backHref?: string;
  backLabel?: string;
};

function ThresholdPeaksIcon() {
  return (
    <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-[#f5f3ee] shadow-sm">
      <span className="absolute h-6 w-6 rounded-full border-2 border-orange-500" />
      <span className="absolute h-3 w-3 rounded-full bg-black" />
      <span className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-orange-500" />
    </span>
  );
}

export default function BackHeader({
  href,
  label,
  backHref,
  backLabel,
}: BackHeaderProps) {
  const targetHref = href ?? backHref ?? "/";
  const buttonLabel = label ?? backLabel ?? "Zurück";

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f5f3ee]/90 px-5 py-4 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="Zur Startseite von Threshold Peaks"
        >
          <ThresholdPeaksIcon />

          <div className="leading-none">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-black">
              Threshold Peaks
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black/45">
              Beat the extra mile
            </p>
          </div>
        </Link>

        <Link
          href={targetHref}
          className="rounded-md border border-black/10 bg-[#d7d5ce] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600"
        >
          {buttonLabel}
        </Link>
      </div>
    </header>
  );
}