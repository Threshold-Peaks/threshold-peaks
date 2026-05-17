"use client";

import { useState } from "react";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";
import GalleryLightbox from "@/components/GalleryLightbox";

type GalleryImage = SanityImageSource & {
  alt?: string;
  caption?: string;
};

type GalleryImageLoadMoreProps = {
  images: GalleryImage[];
  albumTitle: string;
};

const initialImageCount = 10;
const imageBatchSize = 10;

const lineButtonWideClass =
  "inline-flex min-w-[220px] items-center justify-between gap-4 border-b border-black/20 pb-2 text-sm font-black text-black/55 transition hover:border-orange-500 hover:text-orange-600";

function getGalleryImageRatioClass(index: number) {
  const isLarge = index % 5 === 0;
  const isTall = index % 5 === 2;
  const isWide = index % 5 === 4;

  if (isLarge) return "aspect-[4/5]";
  if (isTall) return "aspect-[3/4]";
  if (isWide) return "aspect-[5/4]";

  return "aspect-[4/3]";
}

export default function GalleryImageLoadMore({
  images,
  albumTitle,
}: GalleryImageLoadMoreProps) {
  const [visibleImageCount, setVisibleImageCount] =
    useState(initialImageCount);
  const [animationRun, setAnimationRun] = useState(0);
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(
    null,
  );

  function showMoreImages() {
    setVisibleImageCount((currentCount) =>
      Math.min(currentCount + imageBatchSize, images.length),
    );
    setAnimationRun((currentRun) => currentRun + 1);
  }

  const visibleImages = images.slice(0, visibleImageCount);
  const remainingImageCount = Math.max(
    images.length - visibleImages.length,
    0,
  );
  const hasMoreImages = remainingImageCount > 0;

  return (
    <>
      <style>{`
        @keyframes threshold-gallery-fade-in {
          from {
            opacity: 0;
            transform: translateY(5px);
            filter: blur(1px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .gallery-image-fade-in {
          animation: threshold-gallery-fade-in 1700ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (prefers-reduced-motion: reduce) {
          .gallery-image-fade-in {
            animation: none;
          }
        }
      `}</style>

      <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
        {visibleImages.map((image, index) => {
          const imageRatioClass = getGalleryImageRatioClass(index);

          return (
            <figure
              key={`${albumTitle}-${animationRun}-${index}`}
              className="gallery-image-fade-in mb-6 break-inside-avoid overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm"
              style={{
                animationDelay: `${Math.min(
                  index,
                  18,
                ) * 165}ms`,
              }}
            >
              <button
                type="button"
                onClick={() => setLightboxImageIndex(index)}
                className={`group/image relative block w-full overflow-hidden bg-black/5 text-left ${imageRatioClass}`}
                aria-label={`${albumTitle} Bild ${index + 1} groß öffnen`}
              >
                <Image
                  src={urlFor(image).width(1200).height(1600).fit("crop").url()}
                  alt={image.alt || `${albumTitle} Bild ${index + 1}`}
                  width={1200}
                  height={1600}
                  className="h-full w-full object-cover transition duration-700 group-hover/image:scale-[1.025]"
                />

                <span className="pointer-events-none absolute right-4 top-4 hidden translate-y-2 border-b border-white/35 pb-1 text-[9px] font-black uppercase tracking-[0.24em] text-white/80 opacity-0 transition duration-300 group-hover/image:translate-y-0 group-hover/image:opacity-100 md:block">
                  Bild öffnen
                </span>
              </button>

              {image.caption ? (
                <figcaption className="px-5 py-4 text-sm leading-6 text-black/60">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>

      <GalleryLightbox
        images={images}
        currentIndex={lightboxImageIndex}
        albumTitle={albumTitle}
        onClose={() => setLightboxImageIndex(null)}
        onChange={setLightboxImageIndex}
      />

      {hasMoreImages ? (
        <div className="mt-8 flex justify-start border-t border-black/10 pt-5">
          <button
            type="button"
            onClick={showMoreImages}
            className={lineButtonWideClass}
          >
            Weitere Bilder anzeigen
            <span>+{Math.min(remainingImageCount, imageBatchSize)}</span>
          </button>
        </div>
      ) : null}
    </>
  );
}
