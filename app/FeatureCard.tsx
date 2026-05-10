"use client";

import { IconActivity, IconBike, IconHeadphones } from "@tabler/icons-react";

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
      <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center text-black">
        <FeatureIcon type={iconType} />
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
          className="cursor-pointer rounded-sm text-sm font-black text-black transition hover:text-orange-600 focus:outline-none focus-visible:text-orange-600 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee] active:scale-95"
        >
          Mehr erfahren <span className="ml-4">→</span>
        </button>
      </div>
    </article>
  );
}

function FeatureIcon({ type }: { type: IconType }) {
  if (type === "cycling") {
    return <IconBike className="h-10 w-10" stroke={2.4} />;
  }

  if (type === "music") {
    return <IconHeadphones className="h-10 w-10" stroke={2.4} />;
  }

  return <IconActivity className="h-10 w-10" stroke={2.4} />;
}