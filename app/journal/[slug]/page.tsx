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

function withOgBackground(imageUrl: string) {
  return `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}bg=f5f3ee`;
}

function getSquareOgImage(post: JournalPost) {
  if (!post.mainImage) {
    return `${baseUrl}/opengraph-image`;
  }

  const imageUrl = urlFor(post.mainImage)
    .width(1200)
    .height(1200)
    .fit("crop")
    .focalPoint(0.5, 0.22)
    .format("jpg")
    .quality(85)
    .url();

  return withOgBackground(imageUrl);
}

function getWideOgImage(post: JournalPost) {
  if (!post.mainImage) {
    return `${baseUrl}/opengraph-image`;
  }

  const imageUrl = urlFor(post.mainImage)
    .width(1200)
    .height(630)
    .fit("fill")
    .format("jpg")
    .quality(85)
    .url();

  return withOgBackground(imageUrl);
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
  const squareImage = getSquareOgImage(post);
  const wideImage = getWideOgImage(post);
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
          url: squareImage,
          width: 1200,
          height: 1200,
          alt: post.mainImage?.alt || post.title,
        },
        {
          url: wideImage,
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
      images: [wideImage],
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

function DetailFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-4 md:px-5 md:first:pl-0">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/30">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold leading-6 text-black/65">{value}</p>
    </div>
  );
}

function DetailLinks({
  stravaUrl,
  soundcloudUrl,
}: {
  stravaUrl?: string;
  soundcloudUrl?: string;
}) {
  if (!stravaUrl && !soundcloudUrl) return null;

  return (
    <div className="py-4 md:px-5 md:first:pl-0">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/30">
        Links
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        {stravaUrl ? (
          <Link
            href={stravaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold leading-6 text-black/65 transition hover:text-orange-600"
          >
            <span>Strava</span>
            <span>→</span>
          </Link>
        ) : null}

        {soundcloudUrl ? (
          <Link
            href={soundcloudUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold leading-6 text-black/65 transition hover:text-orange-600"
          >
            <span>SoundCloud</span>
            <span>→</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
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
        <div className="mx-auto max-w-5xl">
          <article>
            <header className="mb-10 grid gap-8 border-b border-black/10 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-end">
              <div>
                <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-black uppercase tracking-[0.25em] text-black/40">
                  <span>{formatCategory(post.category)}</span>
                  <span className="h-1 w-1 rounded-full bg-black/25" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>

                <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-[-0.045em] text-neutral-950 md:text-6xl">
                  {post.title}
                </h1>

                {post.excerpt ? (
                  <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-neutral-600">
                    {post.excerpt}
                  </p>
                ) : null}
              </div>

              {post.mainImage ? (
                <figure className="w-full lg:justify-self-end">
                  <div className="relative mx-auto aspect-[1.28/1] w-full max-w-[380px] overflow-hidden rounded-[1.7rem] bg-transparent lg:mx-0">
                    <Image
                      src={urlFor(post.mainImage).width(900).fit("max").url()}
                      alt={post.mainImage.alt || post.title || "Journal Bild"}
                      fill
                      priority
                      sizes="(min-width: 1024px) 380px, 100vw"
                      className="object-cover"
                      style={{ objectPosition: "center 24%" }}
                    />
                  </div>

                  {post.mainImage.alt ? (
                    <figcaption className="mx-auto mt-3 max-w-[380px] border-b border-black/10 pb-3 text-sm font-semibold leading-6 text-black/50 lg:mx-0">
                      {post.mainImage.alt}
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
            </header>

            <section className="mb-12 border-b border-black/10">
              <div className="divide-y divide-black/10 md:grid md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:divide-x md:divide-y-0">
                <DetailFact
                  label="Kategorie"
                  value={formatCategory(post.category)}
                />
                <DetailFact
                  label="Datum"
                  value={formatDate(post.publishedAt)}
                />
                <DetailFact label="Bereich" value="Journal" />
                <DetailLinks
                  stravaUrl={post.stravaUrl}
                  soundcloudUrl={post.soundcloudUrl}
                />
              </div>
            </section>

            <div className="max-w-3xl">
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

              {tags.length > 0 ? (
                <section className="mt-12 border-t border-black/10 pt-6">
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
          </article>
        </div>
      </section>
    </main>
  );
}
