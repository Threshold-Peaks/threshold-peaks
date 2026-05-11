import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 60;

const baseUrl = "https://www.threshold-peaks.de";

const grayButtonClass =
  "inline-flex items-center justify-between rounded-md border border-black/10 bg-[#d7d5ce] px-6 py-4 text-sm font-bold text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee]";

type GalleryImage = SanityImageSource & {
  _key?: string;
  alt?: string;
  caption?: string;
};

type GalleryAlbum = {
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
  imageCount?: number;
  featured?: boolean;
};

const query = `*[_type == "galleryAlbum" && slug.current == $slug][0]{
  title,
  slug,
  date,
  location,
  category,
  description,
  "coverImage": coalesce(coverImage, images[0]),
  images,
  "imageCount": count(images[]),
  featured
}`;

async function getGalleryAlbum(slug: string) {
  return client.fetch<GalleryAlbum | null>(query, { slug });
}

function getMetaDescription(album: GalleryAlbum) {
  const description =
    album.description ||
    "Ein Galerie-Album von Threshold Peaks mit Momenten aus Bewegung, Ausdauer, Musik und aktivem Lifestyle.";

  return description.length > 155
    ? `${description.slice(0, 152).trim()}...`
    : description;
}

function getOgImage(album: GalleryAlbum) {
  const image = album.coverImage || album.images?.[0];

  if (!image) {
    return `${baseUrl}/opengraph-image`;
  }

  return urlFor(image).width(1200).height(630).fit("crop").url();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getGalleryAlbum(slug);

  if (!album) {
    return {
      title: "Album nicht gefunden",
      description:
        "Dieses Galerie-Album wurde nicht gefunden oder ist nicht mehr verfügbar.",
    };
  }

  const title = album.title;
  const socialTitle = `${album.title} | Threshold Peaks`;
  const description = getMetaDescription(album);
  const url = `${baseUrl}/gallery/${slug}`;
  const image = getOgImage(album);
  const imageAlt = album.coverImage?.alt || album.images?.[0]?.alt || album.title;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: "Threshold Peaks",
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image],
    },
  };
}

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

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await getGalleryAlbum(slug);

  if (!album) {
    notFound();
  }

  const images = album.images || [];
  const imageCount = album.imageCount ?? images.length;
  const category = formatCategory(album.category);
  const date = formatDate(album.date);
  const description =
    album.description ||
    "Für dieses Album wurde noch keine Beschreibung hinterlegt.";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f3ee] text-[#111217]">
      <BackHeader backHref="/gallery" />

      <section className="px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-20">
        <article className="mx-auto max-w-[1280px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-stretch">
            <header className="flex min-h-[500px] flex-col justify-between rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-sm backdrop-blur-xl md:p-10 lg:p-12">
              <div>
                <div className="mb-8 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-black/10 bg-[#d7d5ce] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black/65">
                    {category}
                  </span>

                  {album.featured ? (
                    <span className="rounded-full bg-[#111217] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-white">
                      Featured
                    </span>
                  ) : null}

                  <span className="text-xs font-black uppercase tracking-[0.25em] text-black/45">
                    {date}
                  </span>
                </div>

                <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.42em] text-black/45 md:text-sm md:tracking-[0.45em]">
                  Threshold Peaks Galerie
                </p>

                <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
                  {album.title}
                </h1>

                <p className="mt-8 max-w-3xl whitespace-pre-line text-base leading-8 text-black/65 md:text-xl md:leading-9">
                  {description}
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                <Link href="/gallery" className={`${grayButtonClass} min-w-[210px]`}>
                  Alle Alben <span>→</span>
                </Link>
              </div>
            </header>

            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-black/10 bg-[#d7d5ce] shadow-sm">
              {album.coverImage ? (
                <Image
                  src={urlFor(album.coverImage)
                    .width(1000)
                    .height(1200)
                    .fit("crop")
                    .url()}
                  alt={album.coverImage.alt || album.title}
                  width={1000}
                  height={1200}
                  priority
                  className="h-full min-h-[420px] w-full object-cover"
                />
              ) : (
                <GalleryFallback title={album.title} />
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white md:p-8">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
                  Album-Cover
                </p>

                <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                  {album.location || formatImageCount(imageCount)}
                </h2>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <InfoCard label="Kategorie" value={category} />
            <InfoCard label="Datum" value={date} />
            <InfoCard label="Ort" value={album.location || "Nicht hinterlegt"} />
            <InfoCard label="Umfang" value={formatImageCount(imageCount)} />
          </div>

          <div className="mt-14 flex flex-col gap-5 border-y border-black/10 py-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-black/40">
                Galerie
              </p>

              <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
                Bilder aus dem Album
              </h2>
            </div>

            <p className="max-w-md text-sm font-semibold leading-7 text-black/55 md:text-right">
              Jeder Moment kann einen kurzen Bildtext aus Sanity anzeigen. So
              bleibt die Galerie nicht nur hübsch, sondern erzählt auch kleine
              Splitter der Geschichte.
            </p>
          </div>

          {images.length === 0 ? (
            <div className="mt-8 max-w-3xl rounded-[2rem] border border-black/10 bg-white/75 p-8 shadow-sm backdrop-blur-xl md:p-10">
              <h2 className="text-2xl font-black tracking-[-0.04em]">
                Noch keine Bilder im Album.
              </h2>

              <p className="mt-4 text-base leading-8 text-black/65">
                Sobald du im Sanity Studio Bilder hinzufügst und
                veröffentlichst, erscheinen sie hier.
              </p>
            </div>
          ) : (
            <div className="mt-8 columns-1 gap-8 md:columns-2 xl:columns-3">
              {images.map((image, index) => {
                const isTall = index % 5 === 1 || index % 5 === 4;

                return (
                  <figure
                    key={image._key || index}
                    className="mb-8 break-inside-avoid overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Image
                      src={urlFor(image)
                        .width(1000)
                        .height(isTall ? 1250 : 750)
                        .fit("crop")
                        .url()}
                      alt={image.alt || `${album.title} Bild ${index + 1}`}
                      width={1000}
                      height={isTall ? 1250 : 750}
                      className={`w-full object-cover ${
                        isTall ? "aspect-[4/5]" : "aspect-[4/3]"
                      }`}
                    />

                    <figcaption className="border-t border-black/10 bg-[#f5f3ee]/80 px-5 py-5">
                      <div className="flex items-start gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />

                        <div>
                          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.3em] text-black/35">
                            Moment {index + 1}
                          </p>

                          <p className="text-sm font-semibold leading-7 text-black/70">
                            {image.caption ||
                              image.alt ||
                              "Für dieses Bild ist noch kein kurzer Satz hinterlegt."}
                          </p>
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}

          <div className="mt-12 rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-sm backdrop-blur-xl md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.32em] text-black/40">
                  Zurück
                </p>

                <h2 className="text-2xl font-black tracking-[-0.04em]">
                  Weitere Alben entdecken
                </h2>
              </div>

              <Link href="/gallery" className={`${grayButtonClass} min-w-[210px]`}>
                Zur Galerie <span>→</span>
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-black/35">
        {label}
      </p>

      <p className="text-lg font-black leading-tight text-black md:text-xl">
        {value}
      </p>
    </div>
  );
}

function GalleryFallback({ title }: { title: string }) {
  return (
    <div className="flex h-full min-h-[420px] flex-col justify-between p-8 md:p-10">
      <div className="inline-flex w-fit rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black/55">
        Kein Cover hinterlegt
      </div>

      <div>
        <div className="mb-8 flex h-28 items-end gap-[5px] overflow-hidden opacity-55">
          {Array.from({ length: 62 }).map((_, index) => (
            <span
              key={index}
              className="w-[4px] shrink-0 rounded-full bg-black/45"
              style={{
                height: `${Math.round(
                  16 + Math.abs(Math.sin(index * 0.47)) * 78
                )}px`,
              }}
            />
          ))}
        </div>

        <p className="max-w-sm text-4xl font-black leading-none tracking-[-0.05em] text-black/75 md:text-5xl">
          {title}
        </p>
      </div>
    </div>
  );
}
