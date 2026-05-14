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

type JournalTag =
  | string
  | {
      title?: string;
      name?: string;
      label?: string;
      value?: string;
      current?: string;
    };

type JournalPost = {
  title: string;
  publishedAt?: string;
  category?: string;
  excerpt?: string;
  body?: any[];
  stravaUrl?: string;
  soundcloudUrl?: string;
  tags?: JournalTag[];
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
  tags,
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

  return urlFor(post.mainImage).width(1200).fit("max").url();
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
  const tags = Array.from(
    new Set(
      (post.tags ?? [])
        .map((tag) => getTagLabel(tag))
        .filter((tag): tag is string => Boolean(tag)),
    ),
  );
  const keywords = [
    "Threshold Peaks",
    "Beat the extra mile",
    "Journal",
    formatCategory(post.category),
    ...tags,
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Threshold Peaks",
      type: "article",
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      authors: ["Threshold Peaks"],
      ...(tags.length > 0 ? { tags } : {}),
      images: [
        {
          url: image,
          width: 1200,
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

  return category ? (categories[category] ?? category) : "Journal";
}

function getTagLabel(tag: JournalTag) {
  if (typeof tag === "string") {
    return tag.replace(/^#/, "").trim();
  }

  return (tag.title || tag.name || tag.label || tag.value || tag.current || "")
    .replace(/^#/, "")
    .trim();
}

function getPortalTagHref(tag: string) {
  return `/?tags=${encodeURIComponent(tag)}#portal-journal`;
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

  const tags = Array.from(
    new Set(
      (post.tags ?? [])
        .map((tag) => getTagLabel(tag))
        .filter((tag): tag is string => Boolean(tag)),
    ),
  );

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-black">
      <BackHeader href="/#portal-journal" label="Zurück zum Journal" />

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
                <div className="mb-4 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
                  <span>Journal-Cover</span>
                  <span className="h-px w-8 bg-black/10" />
                  <span>Aufmacher</span>
                </div>

                <div className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white/35 p-2">
                  <div className="overflow-hidden rounded-[1.25rem] bg-[#ded9cf]">
                    <Image
                      src={urlFor(post.mainImage).width(1200).fit("max").url()}
                      alt={post.mainImage.alt || post.title}
                      width={1200}
                      height={800}
                      priority
                      className="h-auto w-full object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,3fr)] lg:items-start">
              <aside className="space-y-4 lg:sticky lg:top-8">
                <div className="rounded-[1.75rem] border border-black/10 bg-white/30 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
                    Beitrag
                  </p>

                  <div className="mt-4 divide-y divide-black/10 text-xs font-bold text-black/60">
                    <div className="flex items-baseline justify-between gap-4 py-3 first:pt-0">
                      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-black/30">
                        Kategorie
                      </span>
                      <span className="text-right text-black/65">
                        {formatCategory(post.category)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-4 py-3 last:pb-0">
                      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-black/30">
                        Datum
                      </span>
                      <span className="text-right text-black/65">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {(post.stravaUrl || post.soundcloudUrl) && (
                  <div className="rounded-[1.75rem] border border-black/10 bg-white/20 p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
                      Links
                    </p>

                    <div className="mt-4 divide-y divide-black/10">
                      {post.stravaUrl && (
                        <Link
                          href={post.stravaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center justify-between gap-4 py-3 text-xs font-black text-black/55 transition hover:text-orange-600"
                        >
                          <span>Strava öffnen</span>
                          <span className="transition group-hover:translate-x-1">→</span>
                        </Link>
                      )}

                      {post.soundcloudUrl && (
                        <Link
                          href={post.soundcloudUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-center justify-between gap-4 py-3 text-xs font-black text-black/55 transition hover:text-orange-600"
                        >
                          <span>SoundCloud öffnen</span>
                          <span className="transition group-hover:translate-x-1">→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                )}

                <Link
                  href="/#portal-journal"
                  className="group flex items-center justify-between gap-4 rounded-[1.75rem] border border-black/10 bg-transparent px-5 py-4 text-xs font-black text-black/55 transition hover:border-orange-500/30 hover:text-orange-600"
                >
                  <span>Zurück zum Journal</span>
                  <span className="transition group-hover:translate-x-1">→</span>
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

                {tags && tags.length > 0 ? (
                  <section className="mt-12 border-t border-black/10 pt-7">
                    <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
                      Hashtags
                    </p>

                    <div className="flex flex-wrap gap-x-3 gap-y-2">
                      {tags.map((tag) => (
                        <Link
                          key={tag}
                          href={getPortalTagHref(tag)}
                          className="px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
