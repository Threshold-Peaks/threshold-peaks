"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

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

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const lightbox =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/82 px-4 py-5 backdrop-blur-sm sm:px-6"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={closeLightbox}
          >
            <div
              className="relative flex max-h-[94vh] w-full max-w-[1500px] flex-col"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between gap-4 text-white">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
                    Strava
                  </p>
                  <p className="mt-1 text-sm font-black text-white/80">
                    {title}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeLightbox}
                  className="border-b border-white/25 pb-2 text-xs font-black uppercase tracking-[0.22em] text-white/70 transition hover:border-orange-400 hover:text-orange-300"
                  aria-label="Karte schließen"
                >
                  SCHLIESSEN
                </button>
              </div>

              <div className="relative flex min-h-[56vh] items-center justify-center overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10 sm:min-h-[72vh]">
                <Image
                  src={src}
                  alt={alt}
                  width={width}
                  height={height}
                  className="max-h-[76vh] w-auto max-w-full object-contain"
                  unoptimized={src.startsWith("http")}
                  priority={false}
                />
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

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
            unoptimized={src.startsWith("http")}
            priority={false}
          />

          <span className="pointer-events-none absolute right-3 top-3 rounded-full border border-black/10 bg-[#f5f3ee]/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-black/45 opacity-0 shadow-sm transition group-hover:opacity-100">
            Karte öffnen
          </span>
        </div>
      </button>

      {lightbox}
    </>
  );
}
