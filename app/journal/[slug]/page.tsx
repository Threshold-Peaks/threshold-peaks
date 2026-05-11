import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 60;

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
    running: "Running",
    cycling: "Cycling",
    music: "Music",
    lifestyle: "Lifestyle",
    event: "Event",

    laufen: "Running",
    radfahren: "Cycling",
    musik: "Music",
  };

  return category ? categories[category] ?? category : "Journal";
}

const portableTextComponents: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mt-12 text-3xl font-black leading-tight tracking-[-0.04em] text-black">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 text-2xl font-black leading-tight tracking-[-0.03em] text-black">
        {children}
      </h3>
    ),
    normal: ({ children }) => (
      <p className="mt-6 text-base leading-8 text-neutral-700 md:text-lg md:leading-9">
        {children}
      </p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mt-8 rounded-3xl border-l-4 border-orange-500 bg-[#f5f3ee] px-6 py-5 text-lg font-semibold leading-8 text-black/75">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-6 list-disc space-y-3 pl-6 text-base leading-8 text-neutral-700 md:text-lg">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-6 list-decimal space-y-3 pl-6 text-base leading-8 text-neutral-700 md:text-lg">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li>{children}</li>,
    number: ({ children }) => <li>{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-black text-black">{children}</strong>
    ),
    em: ({ children }) => <em className="text-black">{children}</em>,
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const isExternal = href.startsWith("http");

      return (
        <a
          href={href}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noreferrer" : undefined}
          className="font-black text-orange-600 underline decoration-orange-500/30 underline-offset-4 transition hover:text-orange-700"
        >
          {children}
        </a>
      );
    },
  },
};

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
            <header className="max-w-4xl">
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[#ded9cf] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-neutral-700">
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
                <p className="mt-8 max-w-3xl text-xl leading-9 text-neutral-600">
                  {post.excerpt}
                </p>
              )}
            </header>

            {post.mainImage && (
              <div className="mt-12 max-w-4xl">
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white">
                    Journal-Cover
                  </span>

                  <span className="text-xs font-black uppercase tracking-[0.25em] text-black/40">
                    Aufmacher
                  </span>
                </div>

                <div className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-black/10">
                  <div className="overflow-hidden rounded-[1.5rem] bg-[#ded9cf]">
                    <Image
                      src={urlFor(post.mainImage).width(1000).height(625).url()}
                      alt={post.mainImage.alt || post.title}
                      width={1000}
                      height={625}
                      priority
                      className="aspect-[16/10] w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,3fr)] lg:items-start">
              <aside className="space-y-5 lg:sticky lg:top-8">
                <div className="rounded-[2rem] bg-[#d7d5ce] p-6 shadow-sm ring-1 ring-black/10">
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-black/40">
                    Beitrag
                  </p>

                  <div className="space-y-4 text-sm font-bold text-black/65">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
                        Kategorie
                      </p>
                      <p className="mt-1 text-black">
                        {formatCategory(post.category)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
                        Datum
                      </p>
                      <p className="mt-1 text-black">
                        {formatDate(post.publishedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {(post.stravaUrl || post.soundcloudUrl) && (
                  <div className="rounded-[2rem] bg-[#d7d5ce] p-6 shadow-sm ring-1 ring-black/10">
                    <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-black/40">
                      Links
                    </p>

                    <div className="grid gap-3">
                      {post.stravaUrl && (
                        <Link
                          href={post.stravaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group rounded-2xl bg-[#f5f3ee] px-5 py-4 text-sm font-black text-black transition hover:-translate-y-0.5 hover:text-orange-600 hover:shadow-sm"
                        >
                          <span className="flex items-center justify-between gap-4">
                            Strava öffnen
                            <span className="transition group-hover:translate-x-1">
                              →
                            </span>
                          </span>
                        </Link>
                      )}

                      {post.soundcloudUrl && (
                        <Link
                          href={post.soundcloudUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group rounded-2xl bg-[#f5f3ee] px-5 py-4 text-sm font-black text-black transition hover:-translate-y-0.5 hover:text-orange-600 hover:shadow-sm"
                        >
                          <span className="flex items-center justify-between gap-4">
                            SoundCloud öffnen
                            <span className="transition group-hover:translate-x-1">
                              →
                            </span>
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <Link
                  href="/journal"
                  className="group block rounded-[2rem] bg-[#d7d5ce] p-6 text-black shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.32em] text-black/40">
                    Zurück
                  </p>

                  <div className="flex items-center justify-between gap-4 text-sm font-black">
                    <span>Alle Beiträge ansehen</span>
                    <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
                      →
                    </span>
                  </div>
                </Link>
              </aside>

              <div className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-black/10 md:p-10">
                {post.body && post.body.length > 0 ? (
                  <PortableText
                    value={post.body}
                    components={portableTextComponents}
                  />
                ) : (
                  <p className="text-base leading-8 text-neutral-600">
                    Für diesen Beitrag wurde noch kein Text hinterlegt.
                  </p>
                )}
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}