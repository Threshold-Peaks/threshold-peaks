import LikeButton from "@/components/LikeButton";
import Comments from "@/components/Comments";
import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { Image } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import type { StravaStoryActivityManual } from "@/components/StravaStoryActivity";
import StravaStoryGeneratedCard from "@/components/StravaStoryGeneratedCard";
import {
  getGeneratedRouteMapImageUrl,
  resolveRouteMapImageUrl,
} from "@/components/routeMapImageUrl";
import stravaActivities from "@/data/strava-activities.json";

export const revalidate = 10;

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

type LinkedGalleryImage = SanityImageSource & {
  alt?: string;
  caption?: string;
  displayFormat?: string;
};

type LinkedGalleryAlbum = {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  category?: string;
  description?: string;
  coverImage?: LinkedGalleryImage;
  images?: LinkedGalleryImage[];
};

type StravaActivity = StravaStoryActivityManual;

const generatedStravaActivities = stravaActivities as Record<
  string,
  Partial<StravaActivity>
>;


type JournalPost = {
  title: string;
  publishedAt?: string;
  category?: string;
  excerpt?: string;
  body?: Record<string, unknown>[];
  stravaUrl?: string;
  stravaActivityUrl?: string;
  stravaActivityId?: string;
  routeMapImage?: SanityImageSource & {
    alt?: string;
  };
  routeMapStatus?: string;
  routeMapGeneratedAt?: string;
  stravaActivity?: StravaActivity;
  soundcloudUrl?: string;
  tags?: JournalTag[];
  mainImage?: SanityImageSource & {
    alt?: string;
    caption?: string;
    imageFormat?: string;
  };
  linkedGalleryAlbums?: LinkedGalleryAlbum[];
};

type SanityImageWithOptionalAsset = SanityImageSource & {
  asset?: {
    _ref?: string;
    _id?: string;
    url?: string;
  } | null;
};

function hasSanityImageAsset<T extends SanityImageSource>(
  image?: T | null,
): image is T & SanityImageWithOptionalAsset {
  const maybeImage = image as SanityImageWithOptionalAsset | null | undefined;
  const asset = maybeImage?.asset;

  return Boolean(asset?._ref || asset?._id || asset?.url);
}

function getSanityImagesWithAsset<T extends SanityImageSource>(
  images?: T[] | null,
) {
  return (images ?? []).filter((image) => hasSanityImageAsset(image));
}

function getAlbumCoverImage(album: LinkedGalleryAlbum) {
  const validImages = getSanityImagesWithAsset(album.images);
  const coverImage = hasSanityImageAsset(album.coverImage)
    ? album.coverImage
    : validImages[0];

  return {
    coverImage,
    validImages,
  };
}

const query = `*[_type == "journalPost" && slug.current == $slug][0]{
  title,
  publishedAt,
  category,
  excerpt,
  body,
  stravaUrl,
  stravaActivityUrl,
  stravaActivityId,
  routeMapImage{
    ...,
    alt
  },
  routeMapStatus,
  routeMapGeneratedAt,
  stravaActivity{
    title,
    sportType,
    dateLabel,
    distance,
    elevation,
    duration,
    kudos,
    mapImage{
      ...,
      alt
    }
  },
  soundcloudUrl,
  tags,
  mainImage{
    ...,
    alt,
    caption,
    imageFormat
  },
  linkedGalleryAlbums[]->{
    _id,
    title,
    slug,
    category,
    "description": coalesce(description, teaser, excerpt),
    "coverImage": select(
      defined(coverImage.asset) => coverImage{
        ...,
        alt,
        caption,
        displayFormat
      },
      images[defined(asset)][0]{
        ...,
        alt,
        caption,
        displayFormat
      }
    ),
    "images": images[defined(asset)]{
      ...,
      alt,
      caption,
      displayFormat
    }
  }
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

function getJournalOgImageUrl(slug: string) {
  return `${baseUrl}/api/og/journal/${slug}?ogv=journal-square-card-v10`;
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
  const ogImageUrl = getJournalOgImageUrl(slug);
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
      siteName: "Threshold Peaks",
      type: "article",
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      authors: ["Threshold Peaks"],
      ...(tags.length > 0 ? { tags } : {}),
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 1200,
          alt: post.mainImage?.alt || post.title,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [ogImageUrl],
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
    gear: "Gear",

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

function formatGalleryCategory(category?: string) {
  const categories: Record<string, string> = {
    running: "Running",
    cycling: "Cycling",
    music: "Music",
    lifestyle: "Life",
    event: "Event",
    laufen: "Running",
    radfahren: "Cycling",
    musik: "Music",
  };

  return category ? (categories[category] ?? category) : "Galerie";
}


function getStravaActivityId(stravaUrl?: string, stravaActivityId?: string) {
  if (stravaActivityId && /^\d+$/.test(stravaActivityId.trim())) {
    return stravaActivityId.trim();
  }

  if (!stravaUrl) return null;

  const match = stravaUrl.match(/strava\.com\/activities\/(\d+)/i);
  return match?.[1] ?? null;
}


function enrichPostWithGeneratedStravaActivity(post: JournalPost): JournalPost {
  const activityId = getStravaActivityId(
    post.stravaActivityUrl || post.stravaUrl,
    post.stravaActivityId,
  );

  if (!activityId) {
    return post;
  }

  const generatedActivity = generatedStravaActivities[activityId];

  if (!generatedActivity) {
    return post;
  }

  const existingActivity = post.stravaActivity ?? {};

  return {
    ...post,
    stravaActivity: {
      title: existingActivity.title ?? generatedActivity.title ?? post.title,
      sportType: existingActivity.sportType ?? generatedActivity.sportType ?? "Run",
      dateLabel: existingActivity.dateLabel ?? generatedActivity.dateLabel,
      distance: existingActivity.distance ?? generatedActivity.distance,
      elevation: existingActivity.elevation ?? generatedActivity.elevation,
      duration: existingActivity.duration ?? generatedActivity.duration,
      kudos:
        existingActivity.kudos ??
        existingActivity.kudosCount ??
        generatedActivity.kudos ??
        generatedActivity.kudosCount,
      mapImage: existingActivity.mapImage ?? generatedActivity.mapImage,
    },
  };
}

function StoryConnectionsSection({
  title,
  albums,
  stravaUrl,
  stravaActivityId,
  routeMapImage,
  stravaActivity,
}: {
  title: string;
  albums?: LinkedGalleryAlbum[];
  stravaUrl?: string;
  stravaActivityId?: string;
  routeMapImage?: SanityImageSource & {
    alt?: string;
  };
  stravaActivity?: StravaActivity;
}) {
  const visibleAlbums = (albums ?? []).filter((album) => album?._id);
  const hasAlbums = visibleAlbums.length > 0;
  const activityId = getStravaActivityId(stravaUrl, stravaActivityId);
  const routeMapImageAsset = hasSanityImageAsset(routeMapImage)
    ? routeMapImage
    : null;
  const generatedRouteMapUrl = getGeneratedRouteMapImageUrl({
    activityId,
  });
  const sanityRouteMapUrl = routeMapImageAsset
    ? urlFor(routeMapImageAsset).width(1600).height(820).url()
    : undefined;
  const resolvedRouteMapImageUrl = resolveRouteMapImageUrl({
    activityId,
    generatedRouteMapUrl,
    sanityRouteMapUrl,
  });
  const routeMapImageAlt = generatedRouteMapUrl ? undefined : routeMapImageAsset?.alt;

  console.info("[route-map]", {
    journalTitle: title,
    hasSanityRouteMapImage: Boolean(routeMapImageAsset),
    resolvedRouteMapImageUrl,
    lightboxImageUrl: resolvedRouteMapImageUrl,
    fallbackRouteMapUrl: generatedRouteMapUrl,
  });

  const hasStrava = Boolean(
    stravaActivity?.title ||
      stravaActivity?.distance ||
      stravaActivity?.duration ||
      stravaActivity?.mapImage ||
      routeMapImageAsset ||
      activityId ||
      stravaUrl,
  );

  if (!hasAlbums && !hasStrava) return null;

  return (
    <section className="mt-14 border-t border-black/10 pt-7">
      <div className="mb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/35">
          Zur Story
        </p>
        <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.04em] text-black md:text-[1.7rem]">
          Aktivität & Bilder
        </h2>
      </div>

      <div
        className={
          hasAlbums && hasStrava
            ? "grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start"
            : "grid gap-10"
        }
      >
        {hasStrava ? (
          <StravaStoryGeneratedCard
            journalTitle={title}
            stravaUrl={stravaUrl}
            stravaActivityId={activityId ?? undefined}
            fallbackActivity={stravaActivity}
            resolvedRouteMapImageUrl={resolvedRouteMapImageUrl}
            routeMapImageAlt={routeMapImageAlt}
            fallbackRouteMapUrl={generatedRouteMapUrl}
            hasSanityRouteMapImage={Boolean(routeMapImageAsset)}
          />
        ) : null}

        {hasAlbums ? <LinkedGalleryAlbumsCard albums={visibleAlbums} /> : null}
      </div>
    </section>
  );
}

function LinkedGalleryAlbumsCard({ albums }: { albums: LinkedGalleryAlbum[] }) {
  return (
    <aside className="border-y border-black/10 bg-white/55 px-4 py-5 sm:px-5">
      <div className="mb-5 border-b border-black/10 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/35">
          Galerie dazu
        </p>
        <h3 className="mt-2 text-lg font-black leading-tight tracking-[-0.04em] text-black md:text-xl">
          Bilder zur Story
        </h3>
      </div>

      <div className="divide-y divide-black/10">
        {albums.map((album, index) => {
          const { coverImage: image, validImages } = getAlbumCoverImage(album);
          const imageCount = validImages.length;
          const href = album.slug?.current
            ? `/gallery/${album.slug.current}`
            : "/#portal-gallery";

          return (
            <Link
              key={album._id}
              href={href}
              className="group grid gap-4 py-4 transition hover:bg-black/[0.025] sm:grid-cols-[86px_minmax(0,1fr)] sm:items-center sm:px-2"
            >
              <div className="relative aspect-square overflow-hidden rounded-[0.95rem] bg-black/5 ring-1 ring-black/10">
                {image ? (
                  <Image
                    src={urlFor(image).width(600).height(600).fit("crop").url()}
                    alt={image.alt || album.title}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                    priority={index === 0}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center text-[9px] font-black uppercase tracking-[0.22em] text-black/35">
                    Kein Bild
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] font-black uppercase tracking-[0.22em] text-black/35">
                  <span>{formatGalleryCategory(album.category)}</span>
                  {imageCount > 0 ? (
                    <>
                      <span className="h-1 w-1 rounded-full bg-black/20" />
                      <span>{imageCount === 1 ? "1 Bild" : `${imageCount} Bilder`}</span>
                    </>
                  ) : null}
                </div>

                <h4 className="text-lg font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-600 md:text-xl">
                  {album.title}
                </h4>

                {album.description ? (
                  <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-black/50">
                    {album.description}
                  </p>
                ) : null}

                <p className="mt-3 inline-flex items-center gap-2 border-b border-black/15 pb-1 text-[10px] font-black uppercase tracking-[0.22em] text-black/40 transition group-hover:border-orange-500 hover:text-orange-600">
                  Album öffnen <span>→</span>
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

type JournalImageRatioConfig = {
  className: string;
  width: number;
  height: number;
};

const journalImageRatioConfigByFormat = {
  auto: { className: "aspect-[1.28/1]", width: 1024, height: 800 },
  portrait: { className: "aspect-[4/5]", width: 900, height: 1125 },
  tall: { className: "aspect-[2/3]", width: 900, height: 1350 },
  square: { className: "aspect-square", width: 900, height: 900 },
  landscape: { className: "aspect-[5/4]", width: 1000, height: 800 },
  wide: { className: "aspect-[4/3]", width: 1200, height: 900 },
} as const satisfies Record<string, JournalImageRatioConfig>;

function getJournalImageRatioConfig(format?: string) {
  if (
    format &&
    format !== "auto" &&
    Object.prototype.hasOwnProperty.call(journalImageRatioConfigByFormat, format)
  ) {
    return journalImageRatioConfigByFormat[
      format as keyof typeof journalImageRatioConfigByFormat
    ];
  }

  return journalImageRatioConfigByFormat.auto;
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
          <a
            href={stravaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold leading-6 text-black/65 transition hover:text-orange-600"
          >
            <span>Strava</span>
            <span>→</span>
          </a>
        ) : null}

        {soundcloudUrl ? (
          <a
            href={soundcloudUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold leading-6 text-black/65 transition hover:text-orange-600"
          >
            <span>SoundCloud</span>
            <span>→</span>
          </a>
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
  const fetchedPost = await getJournalPost(slug);

  if (!fetchedPost) {
    notFound();
  }

  const post = enrichPostWithGeneratedStravaActivity(fetchedPost);

  const tags = Array.from(
    new Set(
      (post.tags ?? [])
        .map((tag) => getTagLabel(tag))
        .filter((tag): tag is string => Boolean(tag)),
    ),
  );
  const mainImage = hasSanityImageAsset(post.mainImage)
    ? post.mainImage
    : null;
  const journalImageRatioConfig = mainImage
    ? getJournalImageRatioConfig(mainImage.imageFormat)
    : null;

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

              {mainImage && journalImageRatioConfig ? (
                <figure className="w-full lg:justify-self-end">
                  <div
                    className={`relative mx-auto w-full max-w-[380px] overflow-hidden rounded-[1.7rem] bg-transparent lg:mx-0 ${journalImageRatioConfig.className}`}
                  >
                    <Image
                      src={urlFor(mainImage)
                        .width(journalImageRatioConfig.width)
                        .height(journalImageRatioConfig.height)
                        .fit("crop")
                        .url()}
                      alt={mainImage.alt || post.title || "Journal Bild"}
                      width={journalImageRatioConfig.width}
                      height={journalImageRatioConfig.height}
                      priority
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {mainImage.caption || mainImage.alt ? (
                    <figcaption className="mx-auto mt-3 max-w-[380px] border-b border-black/10 pb-3 text-sm font-semibold leading-6 text-black/50 lg:mx-0">
                      {mainImage.caption || mainImage.alt}
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
                <DetailFact label="Datum" value={formatDate(post.publishedAt)} />
                <DetailFact label="Bereich" value="Journal" />
                <DetailLinks
                  stravaUrl={post.stravaActivityUrl || post.stravaUrl}
                  soundcloudUrl={post.soundcloudUrl}
                />
                <div className="py-4 md:px-5 md:first:pl-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/30">
                    Gefällt mir
                  </p>

                  <div className="mt-2 flex items-center">
                    <LikeButton
                      targetType="journal"
                      targetId={slug}
                      className="tracking-[0.18em]"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="max-w-3xl">
              {post.body && post.body.length > 0 ? (
                <PortableText value={post.body} components={portableTextComponents} />
              ) : (
                <p className="text-base leading-8 text-neutral-600">
                  Für diesen Beitrag wurde noch kein Text hinterlegt.
                </p>
              )}
            </div>

            <StoryConnectionsSection
              title={post.title}
              albums={post.linkedGalleryAlbums}
              stravaUrl={post.stravaActivityUrl || post.stravaUrl}
              stravaActivityId={post.stravaActivityId}
              routeMapImage={post.routeMapImage}
              stravaActivity={post.stravaActivity}
            />

            {tags.length > 0 ? (
              <section className="mt-12 max-w-3xl border-t border-black/10 pt-6">
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

            <Comments
              targetType="journal"
              targetSlug={slug}
              targetTitle={post.title}
              footerAction={
                <Link
                  href="/#portal-journal"
                  className="inline-flex items-center gap-2 border-b border-black/20 pb-2 text-sm font-black text-black/55 transition hover:border-orange-500 hover:text-orange-600"
                >
                  <span className="hidden sm:inline">Zurück zum Journal</span>
                  <span className="sm:hidden">← Journal</span>
                </Link>
              }
            />
          </article>
        </div>
      </section>
    </main>
  );
}
