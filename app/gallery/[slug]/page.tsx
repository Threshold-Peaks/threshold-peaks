import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 10;

const baseUrl = "https://www.threshold-peaks.de";
const galleryOgVersion = "gallery-square-card-v1";

type GalleryTag =
  | string
  | {
      title?: string;
      name?: string;
      label?: string;
      value?: string;
      current?: string;
      slug?: { current?: string };
    };

type GalleryImage = SanityImageSource & {
  alt?: string;
  caption?: string;
};

type GalleryAlbum = {
  title: string;
  date?: string;
  location?: string;
  category?: string;
  description?: string;
  tags?: string | GalleryTag[];
  images?: GalleryImage[];
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const albumQuery = `*[_type == "galleryAlbum" && slug.current == $slug][0] {
  title,
  date,
  location,
  category,
  tags,
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

  const title = `${album.title} | Galerie | Threshold Peaks`;
  const description =
    album.description || "Bilder und Momente aus der Threshold Peaks Galerie.";
  const canonicalUrl = `${baseUrl}/gallery/${encodeURIComponent(slug)}`;
  const ogImageUrl = `${baseUrl}/api/og/gallery/${encodeURIComponent(
    slug,
  )}?ogv=${galleryOgVersion}`;
  const tags = getGalleryTags(album.tags);

  return {
    title,
    description,
    keywords: [
      "Threshold Peaks",
      "Galerie",
      formatCategory(album.category),
      ...tags,
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "Threshold Peaks",
      locale: "de_DE",
      type: "article",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 1200,
          alt: album.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

function formatCategory(category?: string) {
  const categories: Record<string, string> = {
    running: "Running",
    cycling: "Cycling",
    music: "Music",
    lifestyle: "Lifestyle",
    event: "Event",
    laufen: "Running",
    radfahren: "Cycling",
    musik: "Music",
  };

  return category ? (categories[category] ?? category) : "Galerie";
}

function formatDate(date?: string) {
  if (!date) return null;

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getTagLabel(tag: GalleryTag) {
  const raw =
    typeof tag === "string"
      ? tag
      : tag.title ||
        tag.name ||
        tag.label ||
        tag.value ||
        tag.current ||
        tag.slug?.current ||
        "";

  return raw.replace(/^#/, "").trim();
}

function getGalleryTags(tags?: string | GalleryTag[]) {
  if (!tags) return [];

  if (typeof tags === "string") {
    return Array.from(
      new Set(
        tags
          .split(/[\s,]+/)
          .map((tag) => tag.replace(/^#/, "").trim())
          .filter(Boolean),
      ),
    );
  }

  return Array.from(
    new Set(tags.map((tag) => getTagLabel(tag)).filter(Boolean)),
  );
}

function getPortalGalleryTagHref(tag: string) {
  const params = new URLSearchParams();
  params.set("galleryTags", tag);

  return `/?${params.toString()}#portal-gallery`;
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
  const tags = getGalleryTags(album.tags);
  const formattedDate = formatDate(album.date);
  const categoryLabel = formatCategory(album.category);

  return (
    <main className="min-h-screen bg-[#f4efe6] text-black">
      <BackHeader href="/#portal-gallery" label="Zurück zur Galerie" />

      <article className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <header className="mb-12 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-black/50">
            {categoryLabel}
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {album.title}
          </h1>

          {album.description ? (
            <p className="mt-5 text-base leading-7 text-black/65 sm:text-lg">
              {album.description}
            </p>
          ) : null}

          <section className="mt-8 grid gap-3 rounded-[1.75rem] border border-black/10 bg-white/55 p-5 shadow-sm sm:grid-cols-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
                Kategorie
              </p>
              <p className="mt-2 text-sm font-semibold text-black/70">
                {categoryLabel}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
                Datum
              </p>
              <p className="mt-2 text-sm font-semibold text-black/70">
                {formattedDate ?? "Nicht hinterlegt"}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
                Ort
              </p>
              <p className="mt-2 text-sm font-semibold text-black/70">
                {album.location ?? "Nicht hinterlegt"}
              </p>
            </div>
          </section>

          {tags.length > 0 ? (
            <div className="mt-7 border-t border-black/10 pt-5">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
                Hashtags
              </p>

              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={getPortalGalleryTagHref(tag)}
                    className="px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </header>

        {images.length === 0 ? (
          <div className="rounded-[2rem] border border-black/10 bg-white/70 p-8 shadow-sm">
            <p className="text-sm text-black/60">
              In diesem Album sind noch keine Bilder hinterlegt.
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
            {images.map((image, index) => {
              const isLarge = index % 5 === 0;
              const isTall = index % 5 === 2;
              const isWide = index % 5 === 4;

              const imageRatioClass = isLarge
                ? "aspect-[4/5]"
                : isTall
                  ? "aspect-[3/4]"
                  : isWide
                    ? "aspect-[5/4]"
                    : "aspect-[4/3]";

              return (
                <figure
                  key={`${album.title}-${index}`}
                  className="mb-6 break-inside-avoid overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-sm"
                >
                  <div
                    className={`relative overflow-hidden bg-black/5 ${imageRatioClass}`}
                  >
                    <Image
                      src={urlFor(image)
                        .width(1200)
                        .height(1600)
                        .fit("crop")
                        .url()}
                      alt={image.alt || `${album.title} Bild ${index + 1}`}
                      width={1200}
                      height={1600}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {image.caption ? (
                    <figcaption className="px-5 py-4 text-sm leading-6 text-black/60">
                      {image.caption}
                    </figcaption>
                  ) : null}
                </figure>
              );
            })}
          </div>
        )}
      </article>
    </main>
  );
}
