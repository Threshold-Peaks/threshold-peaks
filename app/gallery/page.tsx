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

const query = `*[_type == "galleryAlbum"] | order(coalesce(date, _createdAt) desc) {
  _id,
  title,
  slug,
  date,
  location,
  category,
  description,
  "coverImage": coalesce(coverImage, images[0]),
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

function getValidCategory(category?: string) {
  const values = categoryFilters.map((filter) => filter.value);

  if (category && values.includes(category)) {
    return category;
  }

  return "all";
}

function getAlbumHref(album: GalleryAlbum) {
  return album.slug?.current ? `/gallery/${album.slug.current}` : "/gallery";
}

export default async function GaleriePage({ searchParams }: GaleriePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedCategory = getValidCategory(resolvedSearchParams.category);

  const albums = await client.fetch<GalleryAlbum[]>(query);

  const filteredAlbums =
    selectedCategory === "all"
      ? albums
      : albums.filter((album) => album.category === selectedCategory);

  const featuredAlbum = filteredAlbums.find((album) => album.featured);
  const regularAlbums = featuredAlbum
    ? filteredAlbums.filter((album) => album._id !== featuredAlbum._id)
    : filteredAlbums;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f3ee] text-[#111217]">
      <BackHeader />

      <section className="px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <header className="mb-10 overflow-hidden rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-sm backdrop-blur-xl md:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.7fr)] lg:items-end">
              <div>
                <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.45em] text-black/45 md:text-sm">
                  Threshold Peaks
                </p>

                <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
                  Galerie
                </h1>

                <p className="mt-8 max-w-2xl text-base leading-8 text-black/65 md:text-lg md:leading-9">
                  Eine Sammlung aus Bewegung, Ausdauer, Musik und Momenten, die
                  den Puls der Seite sichtbar machen. Alben, Bilder und kleine
                  Bildtexte aus dem Threshold Peaks Kosmos.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] p-6 shadow-sm">
                <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-black/40">
                  Übersicht
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <GalleryStat label="Alben" value={String(albums.length)} />
                  <GalleryStat
                    label="Auswahl"
                    value={formatCategory(selectedCategory === "all" ? undefined : selectedCategory)}
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="mb-10 flex flex-wrap gap-3">
            {categoryFilters.map((filter) => {
              const isActive = selectedCategory === filter.value;

              return (
                <Link
                  key={filter.value}
                  href={getFilterHref(filter.value)}
                  className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.24em] shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:text-orange-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee] ${
                    isActive
                      ? "bg-[#111217] text-white hover:text-white"
                      : "bg-[#d7d5ce] text-black/65 hover:bg-[#c9c6bd]"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>

          {filteredAlbums.length === 0 ? (
            <div className="rounded-[2rem] border border-black/10 bg-white/75 p-8 shadow-sm backdrop-blur-xl md:p-10">
              <h2 className="text-2xl font-black tracking-[-0.04em] md:text-3xl">
                Keine Alben in dieser Kategorie.
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-8 text-black/65">
                Sobald du im Sanity Studio passende Galerie-Alben
                veröffentlichst, erscheinen sie hier.
              </p>

              <Link
                href="/gallery"
                className="mt-7 inline-flex rounded-md border border-black/10 bg-[#d7d5ce] px-6 py-4 text-sm font-black text-black shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600"
              >
                Alle Alben anzeigen
              </Link>
            </div>
          ) : (
            <>
              {featuredAlbum ? <FeaturedAlbumCard album={featuredAlbum} /> : null}

              <div className="mt-8 grid gap-8 md:grid-cols-2">
                {regularAlbums.map((album) => (
                  <AlbumCard key={album._id} album={album} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function GalleryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
        {label}
      </p>

      <p className="text-lg font-black leading-tight text-black">{value}</p>
    </div>
  );
}

function FeaturedAlbumCard({ album }: { album: GalleryAlbum }) {
  const previewImages = album.previewImages || [];
  const coverImage = album.coverImage || previewImages[0];
  const href = getAlbumHref(album);

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee]"
    >
      <article className="grid lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="relative min-h-[360px] overflow-hidden bg-[#d7d5ce] lg:min-h-[520px]">
          {coverImage ? (
            <Image
              src={urlFor(coverImage).width(1200).height(900).fit("crop").url()}
              alt={coverImage.alt || album.title}
              width={1200}
              height={900}
              className="h-full min-h-[360px] w-full object-cover transition duration-500 group-hover:scale-105 lg:min-h-[520px]"
            />
          ) : (
            <GalleryFallback title={album.title} />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-7 text-white md:p-8">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
              Featured Album
            </p>

            <h2 className="max-w-2xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
              {album.title}
            </h2>
          </div>
        </div>

        <div className="flex flex-col p-7 md:p-8 lg:p-10">
          <AlbumMeta album={album} featured />

          {album.description ? (
            <p className="mt-6 text-base leading-8 text-black/70 md:text-lg md:leading-9">
              {album.description}
            </p>
          ) : (
            <p className="mt-6 text-base leading-8 text-black/60">
              Ein ausgewähltes Album aus der Threshold Peaks Galerie.
            </p>
          )}

          {previewImages.length > 0 ? (
            <PreviewGrid album={album} images={previewImages} compact />
          ) : null}

          <div className="mt-auto border-t border-black/10 pt-6">
            <div className="flex items-center justify-between gap-4 text-sm font-black text-black">
              <span>Album ansehen</span>
              <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
                →
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function AlbumCard({ album }: { album: GalleryAlbum }) {
  const previewImages = album.previewImages || [];
  const coverImage = album.coverImage || previewImages[0];
  const href = getAlbumHref(album);

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee]"
    >
      <article className="flex h-full flex-col">
        <div className="relative min-h-[320px] overflow-hidden bg-[#d7d5ce]">
          {coverImage ? (
            <Image
              src={urlFor(coverImage).width(1000).height(650).fit("crop").url()}
              alt={coverImage.alt || album.title}
              width={1000}
              height={650}
              className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <GalleryFallback title={album.title} />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
              {formatCategory(album.category)}
            </p>

            <h2 className="text-3xl font-black leading-tight tracking-[-0.04em]">
              {album.title}
            </h2>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-7">
          <AlbumMeta album={album} />

          {album.description ? (
            <p className="mt-5 leading-7 text-black/65">{album.description}</p>
          ) : null}

          {previewImages.length > 0 ? (
            <PreviewGrid album={album} images={previewImages} />
          ) : (
            <div className="mt-7 rounded-2xl border border-black/10 bg-[#f5f3ee] p-5 text-sm font-bold leading-7 text-black/50">
              In diesem Album sind noch keine Bilder hinterlegt.
            </div>
          )}

          <div className="mt-auto border-t border-black/10 pt-5">
            <div className="flex items-center justify-between text-sm font-black text-black">
              <span>Album ansehen</span>
              <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
                →
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

function AlbumMeta({
  album,
  featured = false,
}: {
  album: GalleryAlbum;
  featured?: boolean;
}) {
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="inline-flex rounded-full border border-black/10 bg-[#d7d5ce] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-black/65">
          {formatCategory(album.category)}
        </span>

        {(album.featured || featured) && (
          <span className="inline-flex rounded-full bg-[#111217] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-black uppercase tracking-[0.2em] text-black/45">
        <span>{formatDate(album.date)}</span>
        {album.location ? <span>{album.location}</span> : null}
        <span>{formatImageCount(album.imageCount)}</span>
      </div>
    </div>
  );
}

function PreviewGrid({
  album,
  images,
  compact = false,
}: {
  album: GalleryAlbum;
  images: GalleryImage[];
  compact?: boolean;
}) {
  return (
    <div className={`mt-7 grid grid-cols-2 gap-3 ${compact ? "mb-7" : "mb-7"}`}>
      {images.map((image, index) => (
        <figure
          key={`${album._id}-${index}`}
          className="overflow-hidden rounded-2xl border border-black/10 bg-[#f5f3ee]"
        >
          <Image
            src={urlFor(image).width(800).height(600).fit("crop").url()}
            alt={image.alt || album.title}
            width={800}
            height={600}
            className="aspect-[4/3] w-full object-cover"
          />

          {image.caption ? (
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
          ) : null}
        </figure>
      ))}
    </div>
  );
}

function GalleryFallback({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[320px] flex-col justify-between p-7">
      <div className="inline-flex w-fit rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black/55">
        Galerie
      </div>

      <div>
        <div className="mb-7 flex h-24 items-end gap-[5px] overflow-hidden opacity-55">
          {Array.from({ length: 50 }).map((_, index) => (
            <span
              key={index}
              className="w-[4px] shrink-0 rounded-full bg-black/45"
              style={{
                height: `${Math.round(
                  14 + Math.abs(Math.sin(index * 0.43)) * 70
                )}px`,
              }}
            />
          ))}
        </div>

        <p className="max-w-sm text-3xl font-black leading-none tracking-[-0.05em] text-black/75 md:text-4xl">
          {title}
        </p>
      </div>
    </div>
  );
}
