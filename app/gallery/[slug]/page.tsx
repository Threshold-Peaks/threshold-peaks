import BackHeader from "@/components/BackHeader";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 60;

type GalleryItem = {
  _id: string;
  title?: string;
  slug?: {
    current?: string;
  };
  image?: SanityImageSource & {
    alt?: string;
  };
  caption?: string;
  category?: string;
  location?: string;
  date?: string;
  body?: any[];
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const galleryDetailQuery = `*[
  _type in ["galleryItem", "galleryImage", "galleryPhoto", "galerieItem", "galerieBild", "photo"]
  && slug.current == $slug
][0] {
  _id,
  "title": coalesce(title, name, "Galerie"),
  slug,
  "image": coalesce(image, mainImage, photo),
  "caption": coalesce(caption, description, excerpt),
  "date": coalesce(date, publishedAt, takenAt),
  category,
  location,
  body
}`;

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-5 leading-8 text-neutral-700">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="mb-4 mt-10 text-2xl font-semibold text-neutral-950">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 text-xl font-semibold text-neutral-950">
        {children}
      </h3>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href || "#";

      return (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="font-medium underline decoration-neutral-400 underline-offset-4 hover:text-neutral-600"
        >
          {children}
        </a>
      );
    },
  },
};

function formatDate(date?: string) {
  if (!date) return null;

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const item = await client.fetch<GalleryItem | null>(
    galleryDetailQuery,
    { slug },
    { next: { revalidate: 60 } }
  );

  if (!item) {
    return {
      title: "Galerie | Threshold Peaks",
    };
  }

  return {
    title: `${item.title ?? "Galerie"} | Threshold Peaks`,
    description:
      item.caption ??
      "Ein Moment aus der Galerie von Threshold Peaks.",
  };
}

export default async function GalleryDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const item = await client.fetch<GalleryItem | null>(
    galleryDetailQuery,
    { slug },
    { next: { revalidate: 60 } }
  );

  if (!item) {
    notFound();
  }

  const imageUrl = item.image ? urlFor(item.image).width(1600).url() : null;
  const formattedDate = formatDate(item.date);

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-neutral-950">
      <BackHeader
  href="/#portal-gallery"
  backHref="/#portal-gallery"
  label="Zurück zur Galerie"
/>

      <article className="mx-auto w-full max-w-5xl px-6 pb-20 pt-10">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.25em] text-neutral-500">
            {item.category && <span>{item.category}</span>}
            {item.location && <span>• {item.location}</span>}
            {formattedDate && <span>• {formattedDate}</span>}
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-neutral-950 md:text-6xl">
            {item.title}
          </h1>

          {item.caption && (
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
              {item.caption}
            </p>
          )}
        </header>

        {imageUrl && (
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <img
              src={imageUrl}
              alt={item.image?.alt ?? item.title ?? "Galerie Bild"}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        {item.body && item.body.length > 0 && (
          <div className="prose prose-neutral mt-12 max-w-3xl">
            <PortableText
              value={item.body}
              components={portableTextComponents}
            />
          </div>
        )}
      </article>
    </main>
  );
}