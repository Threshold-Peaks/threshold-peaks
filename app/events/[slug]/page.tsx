import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 10;

const baseUrl = "https://www.threshold-peaks.de";
const eventOgVersion = "event-square-card-v1";

type EventTag =
  | string
  | {
      title?: string;
      name?: string;
      label?: string;
      value?: string;
      current?: string;
      slug?: { current?: string };
    };

type EventItem = {
  _id: string;
  title?: string;
  slug?: {
    current?: string;
  };
  startDate?: string;
  endDate?: string;
  time?: string;
  location?: string;
  eventType?: string;
  teaser?: string;
  status?: string;
  externalUrl?: string;
  tags?: string | EventTag[];
  image?: SanityImageSource & {
    alt?: string;
  };
  body?: any[];
};

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const eventDetailQuery = `*[
  _type in ["event", "termin"]
  && slug.current == $slug
][0] {
  _id,
  "title": coalesce(title, name),
  slug,
  "startDate": coalesce(startDate, date, eventDate),
  endDate,
  time,
  location,
  eventType,
  "teaser": coalesce(teaser, excerpt, description),
  status,
  externalUrl,
  tags,
  "image": coalesce(image, mainImage, coverImage),
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


function getEventTagLabel(tag: EventTag) {
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

function getEventTags(tags?: string | EventTag[]) {
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
    new Set(tags.map((tag) => getEventTagLabel(tag)).filter(Boolean)),
  );
}

function getEventTagHref(tag: string) {
  return `/?eventTags=${encodeURIComponent(tag)}#portal-events`;
}

function formatDate(date?: string) {
  if (!date) return null;

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const event = await client.fetch<EventItem | null>(
    eventDetailQuery,
    { slug },
    { next: { revalidate: 60 } },
  );

  if (!event) {
    return {
      title: "Events | Threshold Peaks",
    };
  }

  const title = `${event.title ?? "Event"} | Events | Threshold Peaks`;
  const description =
    event.teaser ?? "Ein Event aus dem Threshold Peaks Kalender.";
  const canonicalUrl = `${baseUrl}/events/${encodeURIComponent(slug)}`;
  const ogImageUrl = `${baseUrl}/api/og/events/${encodeURIComponent(
    slug,
  )}?ogv=${eventOgVersion}`;
  const tags = getEventTags(event.tags);

  return {
    title,
    description,
    keywords: [
      "Threshold Peaks",
      "Events",
      event.eventType ?? "Event",
      event.location ?? "",
      ...tags,
    ].filter(Boolean),
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
          alt: event.title ?? "Threshold Peaks Event",
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

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const event = await client.fetch<EventItem | null>(
    eventDetailQuery,
    { slug },
    { next: { revalidate: 60 } }
  );

  if (!event) {
    notFound();
  }

  const imageUrl = event.image ? urlFor(event.image).width(1600).url() : null;
  const formattedDate = formatDate(event.startDate);
  const tags = getEventTags(event.tags);

  return (
    <main className="min-h-screen bg-[#f4efe6] text-neutral-950">
      <BackHeader
  href="/#portal-events"
  label="Zurück zu den Events"
/>

      <article className="mx-auto w-full max-w-5xl px-6 pb-20 pt-10">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.25em] text-neutral-500">
            {event.eventType && <span>{event.eventType}</span>}
            {event.status && <span>• {event.status}</span>}
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-neutral-950 md:text-6xl">
            {event.title}
          </h1>

          {event.teaser && (
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
              {event.teaser}
            </p>
          )}
        </header>

        {tags.length > 0 ? (
          <section className="mb-8 flex flex-wrap gap-x-3 gap-y-1 border-b border-black/10 pb-6">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={getEventTagHref(tag)}
                className="px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
              >
                #{tag}
              </Link>
            ))}
          </section>
        ) : null}

        {imageUrl && (
          <div className="mb-10 overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <img
              src={imageUrl}
              alt={event.image?.alt ?? event.title ?? "Event Bild"}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        <section className="mb-12 grid gap-4 rounded-[2rem] bg-white p-6 shadow-sm md:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Datum
            </p>
            <p className="mt-2 text-base font-medium text-neutral-900">
              {formattedDate ?? "Noch offen"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Zeit
            </p>
            <p className="mt-2 text-base font-medium text-neutral-900">
              {event.time ?? "Noch offen"}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Ort
            </p>
            <p className="mt-2 text-base font-medium text-neutral-900">
              {event.location ?? "Noch offen"}
            </p>
          </div>
        </section>

        {event.body && event.body.length > 0 && (
          <div className="prose prose-neutral max-w-3xl">
            <PortableText
              value={event.body}
              components={portableTextComponents}
            />
          </div>
        )}

        {event.externalUrl && (
          <div className="mt-12">
            <Link
              href={event.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
            >
              Zur Veranstaltungsseite
            </Link>
          </div>
        )}
      </article>
    </main>
  );
}