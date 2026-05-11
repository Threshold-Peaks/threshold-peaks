import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

const baseUrl = "https://www.threshold-peaks.de";

type JournalPost = {
  title: string;
  publishedAt?: string;
  category?: string;
  excerpt?: string;
  body?: any[];
  stravaUrl?: string;
  soundcloudUrl?: string;
  mainImage?: SanityImageSource & {
    alt?: string;
  };
};

const query = `*[_type == "journalPost" && slug.current == $slug][0]{
  title,
  publishedAt,
  category,
  excerpt,
  body,
  stravaUrl,
  soundcloudUrl,
  mainImage
}`;

async function getJournalPost(slug: string) {
  return client.fetch<JournalPost | null>(query, { slug });
}

function getMetaDescription(post: JournalPost) {
  return (
    post.excerpt ||
    "Ein Beitrag aus dem Threshold Peaks Journal über Ausdauer, Bewegung, elektronische Musik und aktiven Lifestyle."
  );
}

function getOgImage(post: JournalPost) {
  if (!post.mainImage) {
    return `${baseUrl}/opengraph-image`;
  }

  return urlFor(post.mainImage).width(1200).height(630).fit("crop").url();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getJournalPost(slug);

  if (!post) {
    return {
      title: "Beitrag nicht gefunden | Threshold Peaks",
      description:
        "Dieser Journal-Beitrag wurde nicht gefunden oder ist nicht mehr verfügbar.",
    };
  }

  const title = post.title;
  const description = getMetaDescription(post);
  const url = `${baseUrl}/journal/${slug}`;
  const image = getOgImage(post);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Threshold Peaks",
      type: "article",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.mainImage?.alt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
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
    laufen: "Running",
    radfahren: "Cycling",
    musik: "Music",
    lifestyle: "Story",
    event: "Event",
  };

  return category ? categories[category] ?? category : "Story";
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getJournalPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <BackHeader backHref="/journal" />

      <section className="px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <article>
            <div className="max-w-3xl">
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#ded9cf] px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-neutral-700">
                  {formatCategory(post.category)}
                </span>

                <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-8 text-xl leading-9 text-neutral-600">
                  {post.excerpt}
                </p>
              )}
            </div>

            {post.mainImage && (
              <div className="mt-10 max-w-5xl overflow-hidden rounded-3xl bg-[#ded9cf] shadow-sm ring-1 ring-black/10">
                <Image
                  src={urlFor(post.mainImage).width(1200).height(675).url()}
                  alt={post.mainImage.alt || post.title}
                  width={1200}
                  height={675}
                  priority
                  className="aspect-video w-full object-cover"
                />
              </div>
            )}

            <div className="mt-12 max-w-3xl rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/10">
              {post.body && post.body.length > 0 ? (
                <div className="prose prose-neutral max-w-none prose-p:text-base prose-p:leading-8 prose-headings:font-black">
                  <PortableText value={post.body} />
                </div>
              ) : (
                <p className="text-base leading-8 text-neutral-600">
                  Für diesen Beitrag wurde noch kein Text hinterlegt.
                </p>
              )}
            </div>

            {(post.stravaUrl || post.soundcloudUrl) && (
              <div className="mt-8 flex max-w-3xl flex-wrap gap-3">
                {post.stravaUrl && (
                  <Link
                    href={post.stravaUrl}
                    target="_blank"
                    className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
                  >
                    Strava öffnen
                  </Link>
                )}

                {post.soundcloudUrl && (
                  <Link
                    href={post.soundcloudUrl}
                    target="_blank"
                    className="rounded-full bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-neutral-800"
                  >
                    SoundCloud öffnen
                  </Link>
                )}
              </div>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}