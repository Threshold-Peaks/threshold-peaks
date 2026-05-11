import BackHeader from "@/components/BackHeader";
import { notFound } from "next/navigation";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

type GalleryImage = SanityImageSource & {
  _key?: string;
  alt?: string;
  caption?: string;
};

type GalleryAlbum = {
  title: string;
  date?: string;
  location?: string;
  category?: string;
  description?: string;
  coverImage?: GalleryImage;
  images?: GalleryImage[];
};

const query = `*[_type == "galleryAlbum" && slug.current == $slug][0]{
  title,
  date,
  location,
  category,
  description,
  coverImage,
  images
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

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await client.fetch<GalleryAlbum | null>(query, { slug });

  if (!album) {
    notFound();
  }

  const images = album.images || [];

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <BackHeader backHref="/gallery" />

      <section className="px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <div className="max-w-3xl">
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#ded9cf] px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-neutral-700">
                {formatCategory(album.category)}
              </span>

              <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
                {formatDate(album.date)}
              </span>

              {album.location && (
                <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
                  {album.location}
                </span>
              )}
            </div>

            <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
              {album.title}
            </h1>

            {album.description && (
              <p className="mt-8 text-xl leading-9 text-neutral-600">
                {album.description}
              </p>
            )}
          </div>

          {album.coverImage && (
            <div className="mt-12 overflow-hidden rounded-3xl bg-[#ded9cf] shadow-sm ring-1 ring-black/10">
              <Image
                src={urlFor(album.coverImage).width(1400).height(800).url()}
                alt={album.coverImage.alt || album.title}
                width={1400}
                height={800}
                priority
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          )}

          {images.length === 0 ? (
            <div className="mt-12 max-w-3xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/10">
              <h2 className="text-2xl font-black tracking-tight">
                Noch keine Bilder im Album.
              </h2>

              <p className="mt-4 text-base leading-8 text-neutral-600">
                Sobald du im Sanity Studio Bilder hinzufügst und
                veröffentlichst, erscheinen sie hier.
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {images.map((image, index) => (
                <figure
                  key={image._key || index}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/10"
                >
                  <Image
                    src={urlFor(image).width(1000).height(750).url()}
                    alt={image.alt || `${album.title} Bild ${index + 1}`}
                    width={1000}
                    height={750}
                    className="aspect-[4/3] w-full object-cover"
                  />

                  {image.caption && (
                    <figcaption className="p-5 text-base leading-7 text-neutral-700">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}