"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";

export type GalleryLightboxImage = SanityImageSource & {
  alt?: string;
  caption?: string;
};

type GalleryLightboxProps = {
  images: GalleryLightboxImage[];
  currentIndex: number | null;
  albumTitle: string;
  onClose: () => void;
  onChange: (index: number) => void;
};

export default function GalleryLightbox({
  images,
  currentIndex,
  albumTitle,
  onClose,
  onChange,
}: GalleryLightboxProps) {
  const activeIndex = currentIndex;
  const isOpen = activeIndex !== null;
  const image = isOpen ? images[activeIndex] : null;
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (currentIndex === null) return;

      if (event.key === "ArrowLeft" && hasMultipleImages) {
        onChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
      }

      if (event.key === "ArrowRight" && hasMultipleImages) {
        onChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
      }
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, hasMultipleImages, images.length, isOpen, onChange, onClose]);

  if (typeof document === "undefined" || activeIndex === null || !image) {
    return null;
  }

  const imageCaption = image.caption || image.alt;
  const imageAlt = image.alt || `${albumTitle} Bild ${activeIndex + 1}`;

  function showPreviousImage() {
    if (!hasMultipleImages || activeIndex === null) return;

    onChange(activeIndex === 0 ? images.length - 1 : activeIndex - 1);
  }

  function showNextImage() {
    if (!hasMultipleImages || activeIndex === null) return;

    onChange(activeIndex === images.length - 1 ? 0 : activeIndex + 1);
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/82 px-4 py-5 backdrop-blur-sm sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${albumTitle} Bildansicht`}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[94vh] w-full max-w-[1500px] flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-4 text-white">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
              Galerie
            </p>
            <p className="mt-1 text-sm font-black text-white/80">
              {activeIndex + 1} / {images.length}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="border-b border-white/25 pb-2 text-xs font-black uppercase tracking-[0.22em] text-white/70 transition hover:border-orange-400 hover:text-orange-300"
          >
            Schließen
          </button>
        </div>

        <div className="relative flex min-h-[56vh] items-center justify-center overflow-hidden rounded-md bg-white/5 ring-1 ring-white/10 sm:min-h-[72vh]">
          <Image
            src={urlFor(image).width(2400).fit("max").url()}
            alt={imageAlt}
            width={2400}
            height={1600}
            className="max-h-[76vh] w-auto max-w-full object-contain"
            priority
          />

          {hasMultipleImages ? (
            <>
              <button
                type="button"
                onClick={showPreviousImage}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-2xl font-light text-white/80 ring-1 ring-white/15 transition hover:bg-black/55 hover:text-white sm:left-5"
                aria-label="Vorheriges Bild"
              >
                ‹
              </button>

              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-2xl font-light text-white/80 ring-1 ring-white/15 transition hover:bg-black/55 hover:text-white sm:right-5"
                aria-label="Nächstes Bild"
              >
                ›
              </button>
            </>
          ) : null}
        </div>

        {imageCaption ? (
          <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-white/70">
            {imageCaption}
          </p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
