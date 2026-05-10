"use client";

type IconType = "running" | "cycling" | "music";

export default function FeatureCard({
  href,
  iconType,
  title,
  text,
}: {
  href: string;
  iconType: IconType;
  title: string;
  text: string;
}) {
  function scrollToSection() {
    const target = document.querySelector(href);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search
    );

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  return (
    <article className="flex min-h-[130px] gap-5 rounded-2xl border border-black/10 bg-white/75 p-6 text-black shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:min-h-[180px]">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center text-4xl text-black md:h-10 md:w-10">
        {iconType === "running" && "♟"}
        {iconType === "cycling" && "♙"}
        {iconType === "music" && "♫"}
      </div>

      <div>
        <h3 className="mb-3 text-base font-black tracking-wide text-black">
          {title}
        </h3>

        <p className="mb-5 max-w-[260px] text-sm leading-6 text-black/65">
          {text}
        </p>

        <button
          type="button"
          onClick={scrollToSection}
          className="cursor-pointer rounded-sm text-sm font-black text-black transition hover:text-orange-600 focus:outline-none focus-visible:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f7f7f5] active:scale-95"
        >
          Mehr erfahren <span className="ml-4">→</span>
        </button>
      </div>
    </article>
  );
}