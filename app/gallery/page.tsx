import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 60;

type GalleryImage = SanityImageSource & {
  alt?: string;
  caption?: string;
};

type GalleryAlbum = {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  date?: string;
  location?: string;
  category?: string;
  description?: string;
  coverImage?: GalleryImage;
  previewImages?: GalleryImage[];
  imageCount?: number;
  featured?: boolean;
};

type GaleriePageProps = {
  searchParams?: Promise<{
    category?: string;
  }>;
};

const categoryFilters = [
  { label: "Alle", value: "all" },
  { label: "Running", value: "running" },
  { label: "Cycling", value: "cycling" },
  { label: "Music", value: "music" },
  { label: "Lifestyle", value: "lifestyle" },
  { label: "Event", value: "event" },
];

const query = `*[_type == "galleryAlbum"] | order(date desc) {
  _id,
  title,
  slug,
  date,
  location,
  category,
  description,
  coverImage,
  "previewImages": images[0...4],
  "imageCount": count(images[]),
  featured
}`;

function formatDate(date?: string) {
  if (!date) return "Ohne Datum";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatCategory(category?: string) {
  const categories: Record<string, string> = {
    running: "Running",
    cycling: "Cycling",
    music: "Music",
    lifestyle: "Lifestyle",
    event: "Event",
  };

  return category ? categories[category] ?? category : "Galerie";
}

function formatImageCount(count?: number) {
  if (!count) return "Keine Bilder";
  if (count === 1) return "1 Bild";

  return `${count} Bilder`;
}

function getFilterHref(category: string) {
  if (category === "all") {
    return "/gallery";
  }

  return `/gallery?category=${category}`;
}

export default async function GaleriePage({ searchParams }: GaleriePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedCategory = resolvedSearchParams.category || "all";

  const albums = await client.fetch<GalleryAlbum[]>(query);

  const filteredAlbums =
    selectedCategory === "all"
      ? albums
      : albums.filter((album) => album.category === selectedCategory);

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <BackHeader />

      <section className="px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="mb-10 max-w-3xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.55em] text-neutral-500">
              Threshold Peaks
            </p>

            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
              Galerie
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-neutral-600">
              Eine kleine Sammlung aus Bewegung, Ausdauer, Musik und Momenten,
              die den Puls der Seite sichtbar machen.
            </p>
          </div>

          <div className="mb-10 flex flex-wrap gap-3">
            {categoryFilters.map((filter) => {
              const isActive = selectedCategory === filter.value;

              return (
                <Link
                  key={filter.value}
                  href={getFilterHref(filter.value)}
                  className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.24em] shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:text-orange-600 ${
                    isActive
                      ? "bg-black text-white hover:text-white"
                      : "bg-[#ded9cf] text-black/65"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>

          {filteredAlbums.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/10">
              <h2 className="text-2xl font-black tracking-tight">
                Keine Alben in dieser Kategorie.
              </h2>

              <p className="mt-4 text-base leading-8 text-neutral-600">
                Sobald du im Sanity Studio passende Galerie-Alben
                veröffentlichst, erscheinen sie hier.
              </p>

              <Link
                href="/gallery"
                className="mt-6 inline-flex rounded-full bg-[#ded9cf] px-5 py-3 text-xs font-black uppercase tracking-[0.24em] text-black/65 transition hover:text-orange-600"
              >
                Alle Alben anzeigen
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {filteredAlbums.map((album) => {
                const previewImages = album.previewImages || [];
                const coverImage = album.coverImage || previewImages[0];
                const href = album.slug?.current
                  ? `/gallery/${album.slug.current}`
                  : "/gallery";

                return (
                  <Link
                    key={album._id}
                    href={href}
                    className="group block overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/10 transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <article>
                      {coverImage && (
                        <div className="overflow-hidden bg-[#ded9cf]">
                          <Image
                            src={urlFor(coverImage)
                              .width(1000)
                              .height(650)
                              .url()}
                            alt={coverImage.alt || album.title}
                            width={1000}
                            height={650}
                            className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="p-7">
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                          <div className="inline-flex rounded-full bg-[#ded9cf] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-neutral-700">
                            {formatCategory(album.category)}
                          </div>

                          {album.featured && (
                            <div className="inline-flex rounded-full bg-black px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                              Featured
                            </div>
                          )}
                        </div>

                        <h2 className="text-2xl font-bold text-black">
                          {album.title}
                        </h2>

                        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                          <span>{formatDate(album.date)}</span>
                          {album.location && <span>{album.location}</span>}
                          <span>{formatImageCount(album.imageCount)}</span>
                        </div>

                        {album.description && (
                          <p className="mt-4 leading-7 text-neutral-700">
                            {album.description}
                          </p>
                        )}

                        {previewImages.length > 0 && (
                          <div className="mt-7 grid grid-cols-2 gap-3">
                            {previewImages.map((image, index) => (
                              <figure
                                key={`${album._id}-${index}`}
                                className="overflow-hidden rounded-2xl bg-[#f5f3ee]"
                              >
                                <Image
                                  src={urlFor(image)
                                    .width(800)
                                    .height(600)
                                    .url()}
                                  alt={image.alt || album.title}
                                  width={800}
                                  height={600}
                                  className="aspect-[4/3] w-full object-cover"
                                />

                                {image.caption && (
                                  <figcaption className="min-h-[92px] border-t border-black/10 bg-[#f5f3ee]/85 px-4 py-4">
                                    <div className="flex items-start gap-3">
                                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />

                                      <div>
                                        <p className="mb-1 text-[9px] font-black uppercase tracking-[0.28em] text-black/35">
                                          Moment
                                        </p>

                                        <p className="text-sm font-semibold leading-6 text-black/70">
                                          {image.caption}
                                        </p>
                                      </div>
                                    </div>
                                  </figcaption>
                                )}
                              </figure>
                            ))}
                          </div>
                        )}

                        <div className="mt-8 border-t border-neutral-200 pt-5">
                          <div className="flex items-center justify-between text-sm font-black text-black">
                            <span>Album ansehen</span>
                            <span className="transition group-hover:translate-x-1">
                              →
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}