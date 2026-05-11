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

type EventDetail = {
  title: string;
  slug?: {
    current?: string;
  };
  startDate?: string;
  endDate?: string;
  time?: string;
  location?: string;
  eventType?: string;
  status?: string;
  description?: string;
  externalUrl?: string;
  image?: SanityImageSource & {
    alt?: string;
  };
};

const query = `*[_type in ["event", "termin"] && slug.current == $slug][0]{
  "title": coalesce(title, name),
  slug,
  "startDate": coalesce(startDate, date, eventDate),
  endDate,
  time,
  location,
  "eventType": coalesce(eventType, category, type),
  "status": coalesce(status, registrationStatus),
  "description": coalesce(description, teaser, excerpt, shortDescription),
  externalUrl,
  "image": coalesce(image, mainImage, coverImage)
}`;

async function getEvent(slug: string) {
  return client.fetch<EventDetail | null>(query, { slug });
}

function getDateKey(date?: string) {
  return date?.slice(0, 10) ?? "";
}

function formatEventDate(startDate?: string, endDate?: string) {
  if (!startDate) return "Termin folgt";

  const formatter = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  if (end && getDateKey(startDate) !== getDateKey(endDate)) {
    return `${formatter.format(start)} bis ${formatter.format(end)}`;
  }

  return formatter.format(start);
}

function formatEventTime(startDate?: string, time?: string) {
  if (time) return time;

  if (!startDate || !startDate.includes("T")) {
    return undefined;
  }

  return `${new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startDate))} Uhr`;
}

function formatEventType(type?: string) {
  const types: Record<string, string> = {
    running: "Running",
    laufen: "Running",
    cycling: "Cycling",
    radfahren: "Cycling",
    music: "Music",
    musik: "Music",
    lifestyle: "Lifestyle",
    event: "Event",
    race: "Running",
    ride: "Cycling",
  };

  return type ? types[type] ?? type : "Event";
}

function formatEventStatus(status?: string) {
  const statuses: Record<string, string> = {
    angemeldet: "Angemeldet",
    geplant: "Geplant",
    offen: "Offen",
    erledigt: "Erledigt",
    rueckblick: "Rückblick",
    rückblick: "Rückblick",
    folgt: "Folgt",
    confirmed: "Fix",
    planned: "Geplant",
    open: "Offen",
  };

  return status ? statuses[status] ?? status : "Geplant";
}

function getMetaDescription(event: EventDetail) {
  const description =
    event.description ||
    "Ein Termin von Threshold Peaks aus den Bereichen Laufen, Radfahren, Musik und aktiver Lifestyle.";

  return description.length > 155
    ? `${description.slice(0, 152).trim()}...`
    : description;
}

function getOgImage(event: EventDetail) {
  if (!event.image) {
    return `${baseUrl}/opengraph-image`;
  }

  return urlFor(event.image).width(1200).height(630).fit("crop").url();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return {
      title: "Termin nicht gefunden",
      description:
        "Dieser Termin wurde nicht gefunden oder ist nicht mehr verfügbar.",
    };
  }

  const title = event.title;
  const socialTitle = `${event.title} | Threshold Peaks`;
  const description = getMetaDescription(event);
  const url = `${baseUrl}/events/${slug}`;
  const image = getOgImage(event);

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
          alt: event.image?.alt || event.title,
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

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  const eventDate = formatEventDate(event.startDate, event.endDate);
  const eventTime = formatEventTime(event.startDate, event.time);
  const eventType = formatEventType(event.eventType);
  const eventStatus = formatEventStatus(event.status);
  const description =
    event.description ||
    "Für diesen Termin wurde noch keine Beschreibung hinterlegt.";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f3ee] text-[#111217]">
      <BackHeader backHref="/events" />

      <section className="px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-20">
        <article className="mx-auto max-w-[1280px]">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-stretch">
            <header className="flex min-h-[520px] flex-col justify-between rounded-[2rem] border border-black/10 bg-white/70 p-7 shadow-sm backdrop-blur-xl md:p-10 lg:p-12">
              <div>
                <div className="mb-8 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-black/10 bg-[#d7d5ce] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black/65">
                    {eventType}
                  </span>

                  <span className="rounded-full bg-[#111217] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-white">
                    {eventStatus}
                  </span>
                </div>

                <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.42em] text-black/45 md:text-sm md:tracking-[0.45em]">
                  Threshold Peaks Event
                </p>

                <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
                  {event.title}
                </h1>

                <p className="mt-8 max-w-3xl text-base leading-8 text-black/65 md:text-xl md:leading-9">
                  {description}
                </p>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                {event.externalUrl ? (
                  <Link
                    href={event.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`${grayButtonClass} min-w-[230px]`}
                  >
                    Zur Veranstalterseite <span>→</span>
                  </Link>
                ) : null}

                <Link
                  href="/events"
                  className={`${grayButtonClass} min-w-[210px] bg-white/80 hover:bg-white`}
                >
                  Alle Termine <span>→</span>
                </Link>
              </div>
            </header>

            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-black/10 bg-[#d7d5ce] shadow-sm">
              {event.image ? (
                <Image
                  src={urlFor(event.image).width(1000).height(1200).fit("crop").url()}
                  alt={event.image.alt || event.title}
                  width={1000}
                  height={1200}
                  priority
                  className="h-full min-h-[420px] w-full object-cover"
                />
              ) : (
                <div className="flex h-full min-h-[420px] flex-col justify-between p-8 md:p-10">
                  <div className="inline-flex w-fit rounded-full bg-white/70 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black/55">
                    Kein Bild hinterlegt
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
                      Beat the extra mile.
                    </p>
                  </div>
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-7 text-white md:p-8">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
                  {eventDate}
                </p>

                <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                  {event.location || eventType}
                </h2>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <InfoCard label="Datum" value={eventDate} />
            <InfoCard label="Uhrzeit" value={eventTime || "Folgt"} />
            <InfoCard label="Ort" value={event.location || "Wird ergänzt"} />
            <InfoCard label="Status" value={eventStatus} />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,2.4fr)] lg:items-start">
            <aside className="space-y-5 lg:sticky lg:top-8">
              <div className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-xl">
                <p className="mb-5 text-xs font-black uppercase tracking-[0.32em] text-black/40">
                  Eventdaten
                </p>

                <div className="space-y-5">
                  <DetailRow label="Kategorie" value={eventType} />
                  <DetailRow label="Datum" value={eventDate} />
                  <DetailRow label="Uhrzeit" value={eventTime || "Folgt"} />
                  <DetailRow label="Ort" value={event.location || "Wird ergänzt"} />
                  <DetailRow label="Status" value={eventStatus} />
                </div>
              </div>

              {event.externalUrl ? (
                <div className="rounded-[2rem] border border-black/10 bg-[#d7d5ce] p-6 shadow-sm">
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-black/40">
                    Anmeldung / Info
                  </p>

                  <Link
                    href={event.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-2xl bg-[#f5f3ee] px-5 py-4 text-sm font-black text-black transition hover:-translate-y-0.5 hover:text-orange-600 hover:shadow-sm"
                  >
                    <span className="flex items-center justify-between gap-4">
                      Extern öffnen
                      <span className="transition group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </div>
              ) : null}

              <Link
                href="/events"
                className="group block rounded-[2rem] border border-black/10 bg-white/70 p-6 text-black shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <p className="mb-2 text-xs font-black uppercase tracking-[0.32em] text-black/40">
                  Zurück
                </p>

                <div className="flex items-center justify-between gap-4 text-sm font-black">
                  <span>Alle Termine ansehen</span>
                  <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
                    →
                  </span>
                </div>
              </Link>
            </aside>

            <div className="rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-sm backdrop-blur-xl md:p-10 lg:p-12">
              <p className="mb-5 text-xs font-black uppercase tracking-[0.32em] text-black/40">
                Details
              </p>

              <h2 className="mb-6 text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                Was steht an?
              </h2>

              <p className="max-w-3xl whitespace-pre-line text-base leading-8 text-black/70 md:text-lg md:leading-9">
                {description}
              </p>

              <div className="mt-10 rounded-[1.5rem] border border-black/10 bg-[#f5f3ee] p-6">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-black/40">
                  Hinweis
                </p>

                <p className="text-sm leading-7 text-black/60 md:text-base md:leading-8">
                  Weitere Informationen können später direkt im CMS ergänzt werden,
                  zum Beispiel Strecke, Distanz, Veranstalter, Anmeldung oder ein
                  persönlicher Rückblick nach dem Event.
                </p>
              </div>
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-black/10 pb-4 last:border-b-0 last:pb-0">
      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold leading-6 text-black/75">{value}</p>
    </div>
  );
}
