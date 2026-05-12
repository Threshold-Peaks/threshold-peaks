import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const revalidate = 60;

type EventPageItem = {
  _id: string;
  title: string;
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
};

const eventsPageQuery = `*[_type in ["event", "termin"] && defined(coalesce(startDate, date, eventDate))] | order(coalesce(startDate, date, eventDate) asc) {
  _id,
  "title": coalesce(title, name),
  slug,
  "startDate": coalesce(startDate, date, eventDate),
  endDate,
  time,
  location,
  "eventType": coalesce(eventType, category, type),
  "teaser": coalesce(teaser, excerpt, description, shortDescription),
  "status": coalesce(status, registrationStatus),
  externalUrl
}`;

function getTodayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
  }).format(new Date());
}

function getDateKey(date?: string) {
  return date?.slice(0, 10) ?? "";
}

function isUpcomingEvent(event: EventPageItem) {
  const eventDate = getDateKey(event.endDate ?? event.startDate);

  if (!eventDate) {
    return false;
  }

  return eventDate >= getTodayKey();
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

function formatEventTime(startDate?: string) {
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
    folgt: "Folgt",
    confirmed: "Fix",
    planned: "Geplant",
    open: "Offen",
  };

  return status ? statuses[status] ?? status : "Geplant";
}

function getEventHref(event: EventPageItem) {
  if (event.slug?.current) {
    return `/events/${event.slug.current}`;
  }

  return event.externalUrl;
}

function isExternalEventHref(event: EventPageItem) {
  return !event.slug?.current && Boolean(event.externalUrl);
}

export default async function EventsPage() {
  const events = await client.fetch<EventPageItem[]>(eventsPageQuery);

  const upcomingEvents = events.filter(isUpcomingEvent);
  const pastEvents = events.filter((event) => !isUpcomingEvent(event)).reverse();

  return (
    <main className="min-h-screen bg-[#f5f3ee] text-[#111217]">
      <BackHeader href="/#portal-events" label="Zurück zu den Events" />

      <section className="px-6 pb-14 pt-8 md:px-10 md:pb-16 lg:px-20">
        <div className="mx-auto max-w-[1280px]">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
            Events
          </p>

          <div className="mb-12 max-w-4xl">
            <h1 className="mb-6 text-5xl font-black leading-[0.95] tracking-[-0.06em] md:text-7xl">
              Termine und Highlights.
            </h1>

            <p className="max-w-2xl text-base leading-8 text-black/65 md:text-lg">
              Läufe, Rides, Musikmomente und alles, was rund um Threshold Peaks
              geplant ist. Hier sammelt sich, was bald passiert oder schon
              Spuren hinterlassen hat.
            </p>
          </div>

          <div className="mb-16">
            <div className="mb-8 flex items-end justify-between gap-6">
              <div>
                <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-black/45">
                  Upcoming
                </p>

                <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                  Kommende Termine
                </h2>
              </div>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {upcomingEvents.map((event) => (
                  <EventOverviewCard
                    key={event._id}
                    date={formatEventDate(event.startDate, event.endDate)}
                    time={event.time || formatEventTime(event.startDate)}
                    title={event.title}
                    type={formatEventType(event.eventType)}
                    text={
                      event.teaser ||
                      "Ein kommender Termin im Threshold Peaks Kalender."
                    }
                    status={formatEventStatus(event.status)}
                    location={event.location}
                    href={getEventHref(event)}
                    external={isExternalEventHref(event)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState text="Aktuell sind noch keine kommenden Termine eingetragen." />
            )}
          </div>

          {pastEvents.length > 0 ? (
            <div>
              <div className="mb-8">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.35em] text-black/45">
                  Archive
                </p>

                <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                  Vergangene Termine
                </h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {pastEvents.map((event) => (
                  <EventOverviewCard
                    key={event._id}
                    date={formatEventDate(event.startDate, event.endDate)}
                    time={event.time || formatEventTime(event.startDate)}
                    title={event.title}
                    type={formatEventType(event.eventType)}
                    text={
                      event.teaser ||
                      "Ein vergangener Termin aus dem Threshold Peaks Kalender."
                    }
                    status={formatEventStatus(event.status)}
                    location={event.location}
                    href={getEventHref(event)}
                    external={isExternalEventHref(event)}
                    muted
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function EventOverviewCard({
  date,
  time,
  title,
  type,
  text,
  status,
  location,
  href,
  external = false,
  muted = false,
}: {
  date: string;
  time?: string;
  title: string;
  type: string;
  text: string;
  status: string;
  location?: string;
  href?: string;
  external?: boolean;
  muted?: boolean;
}) {
  const content = (
    <>
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-black/45">
            {type}
          </p>

          <p className="text-sm font-black uppercase tracking-[0.25em] text-black/60">
            {date}
          </p>

          {time ? (
            <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-black/45">
              {time}
            </p>
          ) : null}
        </div>

        <span className="rounded-full border border-black/10 bg-[#d7d5ce] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-black/65">
          {status}
        </span>
      </div>

      <h3 className="mb-4 text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-600">
        {title}
      </h3>

      {location ? (
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-black/45">
          {location}
        </p>
      ) : null}

      <p className="leading-7 text-black/65">{text}</p>

      {href ? (
        <div className="mt-7 flex justify-end">
          <span className="font-black transition group-hover:translate-x-1 group-hover:text-orange-600">
            →
          </span>
        </div>
      ) : null}
    </>
  );

  const className = `group rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl ${
    muted ? "opacity-70" : ""
  }`;

  if (!href) {
    return <article className={className}>{content}</article>;
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/50 p-8 text-black/60">
      {text}
    </div>
  );
}