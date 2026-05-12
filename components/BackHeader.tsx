import Link from "next/link";

type BackHeaderProps = {
  href?: string;
  backHref?: string;
  label?: string;
};

export default function BackHeader({
  href,
  backHref,
  label = "Zurück",
}: BackHeaderProps) {
  const targetHref = href ?? backHref ?? "/";

  return (
    <header className="mx-auto flex w-full max-w-6xl px-6 pt-6">
      <Link
        href={targetHref}
        className="inline-flex items-center rounded-full border border-neutral-300 bg-white/80 px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm backdrop-blur transition hover:bg-neutral-100"
      >
        ← {label}
      </Link>
    </header>
  );
}