import Link from "next/link";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

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
  images?: GalleryImage[];
  featured?: boolean;
};

const query = `*[_type == "galleryAlbum"] | order(date desc) {
  _id,
  title,
  slug,
  date,
  location,
  category,
  description,
  coverImage,
  images,
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

export default async function GaleriePage() {
  const albums = await client.fetch<GalleryAlbum[]>(query);

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex rounded-full bg-[#ded9cf] px-5 py-3 text-sm font-bold text-black shadow-sm transition hover:bg-[#d1ccc3]"
          >
            ← Zurück zur Startseite
          </Link>
        </div>

        <div className="mb-12">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Threshold Peaks
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Galerie
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-700">
            Eine kleine Sammlung aus Bewegung, Ausdauer, Musik und Momenten,
            die den Puls der Seite sichtbar machen.
          </p>
        </div>

        {albums.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/10">
            <h2 className="text-2xl font-black tracking-tight">
              Noch keine Galerie-Alben veröffentlicht.
            </h2>

            <p className="mt-4 text-base leading-8 text-neutral-600">
              Sobald du im Sanity Studio ein Galerie-Album veröffentlichst,
              erscheint es hier automatisch.
            </p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {albums.map((album) => {
              const coverImage = album.coverImage || album.images?.[0];
              const previewImages = album.images?.slice(0, 4) || [];
              const href = album.slug?.current
                ? `/gallery/${album.slug.current}`
                : "#";

              return (
                <article
                  key={album._id}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/10 transition hover:-translate-y-1 hover:shadow-md"
                >
                  {coverImage && (
                    <div className="overflow-hidden bg-[#ded9cf]">
                      <Image
                        src={urlFor(coverImage).width(1000).height(650).url()}
                        alt={coverImage.alt || album.title}
                        width={1000}
                        height={650}
                        className="h-72 w-full object-cover"
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
                              src={urlFor(image).width(600).height(450).url()}
                              alt={image.alt || album.title}
                              width={600}
                              height={450}
                              className="h-40 w-full object-cover"
                            />

                            {image.caption && (
                              <figcaption className="p-3 text-sm leading-6 text-neutral-700">
                                {image.caption}
                              </figcaption>
                            )}
                          </figure>
                        ))}
                      </div>
                    )}

                    <div className="mt-8 border-t border-neutral-200 pt-5">
                      <Link
                        href={href}
                        className="group flex items-center justify-between text-sm font-black text-black"
                      >
                        <span>Album ansehen</span>
                        <span className="transition group-hover:translate-x-1">
                          →
                        </span>
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}