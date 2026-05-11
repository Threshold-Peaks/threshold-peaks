import Link from "next/link";

type BackHeaderProps = {
  backHref?: string;
  backLabel?: string;
};

export default function BackHeader({
  backHref = "/",
  backLabel = "Zurück",
}: BackHeaderProps) {
  return (
    <section className="px-6 py-10 md:px-10 lg:px-20">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6">
        <Link
          href={backHref}
          className="rounded-md border border-black/10 bg-[#d7d5ce] px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600"
        >
          ← {backLabel}
        </Link>

        <Link
          href="/"
          className="flex items-center gap-3 transition hover:text-orange-600"
        >
          <ThresholdPeaksIcon />

          <div className="leading-none text-right">
            <div className="text-sm font-black uppercase tracking-[0.22em] md:text-lg">
              Threshold Peaks
            </div>
            <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-black/55 md:text-[10px]">
              Beat the extra mile
            </div>
          </div>
        </Link>
      </div>
    </section>
  );
}

function ThresholdPeaksIcon() {
  return (
    <svg
      viewBox="0 0 80 48"
      fill="none"
      className="h-10 w-14 shrink-0 md:h-12 md:w-16"
      aria-hidden="true"
    >
      <path
        d="M6 36H18L30 14L43 36L55 22L74 36"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30 14L36 25L43 36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}