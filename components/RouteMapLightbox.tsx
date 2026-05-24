"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type RouteMapLightboxProps = {
  src: string;
  alt: string;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
  imageClassName?: string;
};

export default function RouteMapLightbox({
  src,
  alt,
  title = "Karte",
  width = 1600,
  height = 820,
  className = "",
  imageClassName = "",
}: RouteMapLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const previousScrollYRef = useRef(0);

  function openLightbox() {
    previousScrollYRef.current = window.scrollY;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    window.setTimeout(() => {
      setIsOpen(true);
    }, 180);
  }

  function closeLightbox() {
    setIsOpen(false);

    window.setTimeout(() => {
      window.scrollTo({
        top: previousScrollYRef.current,
        left: 0,
        behavior: "auto",
      });
    }, 40);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeLightbox();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={openLightbox}
        className={`group block w-full text-left ${className}`}
        aria-label={`${title} vergrößert öffnen`}
      >
        <div className="relative w-full overflow-hidden rounded-[1.15rem] border border-black/10 bg-[#f5f3ee] shadow-sm">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={`h-auto w-full object-contain transition-transform duration-700 ease-out group-hover:scale-[1.24] group-focus-visible:scale-[1.24] ${imageClassName}`}
            priority={false}
          />

          <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-black/10 bg-[#f5f3ee]/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-black/45 opacity-0 shadow-sm transition group-hover:opacity-100">
            Karte öffnen
          </span>
        </div>
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/80 px-4 pb-8 pt-24 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={closeLightbox}
        >
          <button
  type="button"
  onClick={closeLightbox}
  className="absolute right-4 top-4 z-10 inline-flex items-center justify-center border border-white/25 bg-[#f5f3ee]/95 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-black/55 shadow-lg transition hover:border-orange-500 hover:text-orange-600"
  aria-label="Karte schließen"
>
  Schließen <span className="ml-2">×</span>
</button>

          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-2xl border border-white/15 bg-[#f5f3ee] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              className="h-auto max-h-[calc(100vh-8rem)] w-full object-contain"
              priority={false}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}