import BackHeader from "@/components/BackHeader";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
  title: string;
  category?: string;
  description?: string;
  images?: GalleryImage[];
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const albumQuery = `*[_type == "galleryAlbum" && slug.current == $slug][0] {
  title,
  category,
  "description": coalesce(description, teaser, excerpt),
  images[] {
    ...,
    alt,
    caption
  }
}`;

const slugsQuery = `*[_type == "galleryAlbum" && defined(slug.current)] {
  "slug": slug.current
}`;

export async function generateStaticParams() {
  const slugs = await client.fetch<{ slug: string }[]>(slugsQuery);

  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const album = await client.fetch<GalleryAlbum | null>(albumQuery, {
    slug,
  });

  if (!album) {
    return {
      title: "Galerie | Threshold Peaks",
    };
  }

  return {
    title: `${album.title} | Galerie | Threshold Peaks`,
    description:
      album.description ||
      "Bilder und Momente aus der Threshold Peaks Galerie.",
  };
}

export default async function GalleryAlbumPage({ params }: PageProps) {
  const { slug } = await params;

  const album = await client.fetch<GalleryAlbum | null>(albumQuery, {
    slug,
  });

  if (!album) {
    notFound();
  }

  const images = album.images || [];

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <BackHeader href="/#portal-gallery" label="Zurück zur Galerie" />

      <article className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <header className="mb-12 max-w-3xl">
          {album.category ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-black/50">
              {album.category}
            </p>
          ) : (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-black/50">
              Galerie
            </p>
          )}

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {album.title}
          </h1>

          {album.description ? (
            <p className="mt-5 text-base leading-7 text-black/65 sm:text-lg">
              {album.description}
            </p>
          ) : null}
        </header>

        {images.length === 0 ? (
          <div className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-sm">
            <p className="text-sm text-black/60">
              In diesem Album sind noch keine Bilder hinterlegt.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {images.map((image, index) => (
              <figure
                key={`${album.title}-${index}`}
                className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
                  <Image
                    src={urlFor(image)
                      .width(1400)
                      .height(1050)
                      .fit("crop")
                      .url()}
                    alt={image.alt || `${album.title} Bild ${index + 1}`}
                    width={1400}
                    height={1050}
                    className="h-full w-full object-cover"
                  />
                </div>

                {image.caption ? (
                  <figcaption className="px-5 py-4 text-sm leading-6 text-black/60">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}