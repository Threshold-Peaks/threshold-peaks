import Link from "next/link";

type BackHeaderProps = {
  href?: string;
  backHref?: string;
  label?: string;
  className?: string;
};

const lineButtonClass =
  "inline-flex items-center gap-2 border-b border-black/20 pb-2 text-sm font-black text-black/55 transition hover:border-orange-500 hover:text-orange-600 focus:outline-none focus-visible:border-orange-500 focus-visible:text-orange-600";

export default function BackHeader({
  href,
  backHref,
  label = "Zurück zur Startseite",
  className = "",
}: BackHeaderProps) {
  const targetHref = href ?? backHref ?? "/";

  return (
    <header className={`px-6 pt-6 md:px-10 md:pt-8 lg:px-20 ${className}`}>
      <div className="mx-auto flex max-w-[1280px] items-center justify-between border-b border-black/10 pb-5">
        <Link href={targetHref} className={lineButtonClass}>
          <span aria-hidden="true">←</span>
          <span>{label}</span>
        </Link>

        <Link
          href="/"
          aria-label="Zur Startseite von Threshold Peaks"
          className="hidden border-b border-transparent pb-2 text-[10px] font-black uppercase tracking-[0.3em] text-black/35 transition hover:border-orange-500 hover:text-orange-600 focus:outline-none focus-visible:border-orange-500 focus-visible:text-orange-600 sm:inline-flex"
        >
          Threshold Peaks
        </Link>
      </div>
    </header>
  );
}
