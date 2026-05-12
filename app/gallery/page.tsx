import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import type { Metadata } from "next";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Galerie | Threshold Peaks",
  description:
    "Bilder, Momente und Eindrücke aus Laufen, Radfahren, Musik und aktivem Lifestyle bei Threshold Peaks.",
};

type GalleryAlbum = {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  category?: string;
  description?: string;
  coverImage?: SanityImageSource & {
    alt?: string;
    caption?: string;
  };
  imageCount?: number;
};

const galleryAlbumsQuery = `*[_type == "galleryAlbum" && defined(slug.current)] | order(_createdAt desc) {
  _id,
  title,
  slug,
  category,
  "description": coalesce(description, teaser, excerpt),
  "coverImage": coalesce(coverImage, images[0]),
  "imageCount": count(images)
}`;

export default async function GalleryPage() {
  const albums = await client.fetch<GalleryAlbum[]>(galleryAlbumsQuery);

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <BackHeader href="/#portal-gallery" label="Zurück zur Startseite" />

      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="mb-12 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-black/50">
            Galerie
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Momente aus Bewegung, Klang und draußen sein.
          </h1>

          <p className="mt-5 text-base leading-7 text-black/65 sm:text-lg">
            Eine Sammlung aus Trainingsmomenten, Touren, Events und kleinen
            Bildern zwischen Asphalt, Trails, Beats und Alltag.
          </p>
        </div>

        {albums.length === 0 ? (
          <div className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-sm">
            <p className="text-sm text-black/60">
              Noch keine Alben vorhanden. Sobald Bilder im CMS gepflegt sind,
              erscheinen sie hier.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => {
              const href = `/gallery/${album.slug?.current}`;

              return (
                <Link
                  key={album._id}
                  href={href}
                  className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
                    {album.coverImage ? (
                      <Image
                        src={urlFor(album.coverImage)
                          .width(900)
                          .height(675)
                          .fit("crop")
                          .url()}
                        alt={
                          album.coverImage.alt ||
                          album.title ||
                          "Galeriealbum"
                        }
                        width={900}
                        height={675}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-black/40">
                        Kein Bild vorhanden
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {album.category ? (
                        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-black/55">
                          {album.category}
                        </span>
                      ) : null}

                      {typeof album.imageCount === "number" ? (
                        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-black/50">
                          {album.imageCount} Bilder
                        </span>
                      ) : null}
                    </div>

                    <h2 className="text-xl font-semibold tracking-tight">
                      {album.title}
                    </h2>

                    {album.description ? (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/60">
                        {album.description}
                      </p>
                    ) : null}

                    <p className="mt-5 text-sm font-medium text-black transition group-hover:translate-x-1">
                      Album ansehen →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}