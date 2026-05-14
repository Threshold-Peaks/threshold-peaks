import BackHeader from "@/components/BackHeader";
import Link from "next/link";
import { client } from "@/sanity/lib/client";

export const revalidate = 60;

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
  tags?: string | EventTag[];
};

type EventsPageProps = {
  searchParams?: Promise<{
    tags?: string;
    tag?: string;
  }>;
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
  externalUrl,
  tags
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

function getTagsFromSearchParam(value?: string | null) {
  if (!value) return [];

  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => decodeURIComponent(tag).replace(/^#/, "").trim())
        .filter(Boolean),
    ),
  );
}

function isSameTag(firstTag: string, secondTag: string) {
  return firstTag.toLowerCase() === secondTag.toLowerCase();
}

function isTagSelected(selectedTags: string[], tag: string) {
  return selectedTags.some((selectedTag) => isSameTag(selectedTag, tag));
}

function hasAnySelectedTag(itemTags: string[], selectedTags: string[]) {
  if (selectedTags.length === 0) return true;

  return selectedTags.some((selectedTag) =>
    itemTags.some((itemTag) => isSameTag(itemTag, selectedTag)),
  );
}

function getAllEventTags(events: EventPageItem[]) {
  return Array.from(
    new Set(events.flatMap((event) => getEventTags(event.tags))),
  ).sort((firstTag, secondTag) => firstTag.localeCompare(secondTag, "de"));
}

function createTagsParam(tags: string[]) {
  return tags
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter(Boolean)
    .join(",");
}

function getTagFilterHref(selectedTags: string[], tag: string) {
  const nextTags = isTagSelected(selectedTags, tag)
    ? selectedTags.filter((selectedTag) => !isSameTag(selectedTag, tag))
    : [...selectedTags, tag];

  const tagsParam = createTagsParam(nextTags);

  return tagsParam ? `/events?tags=${encodeURIComponent(tagsParam)}` : "/events";
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedTags = getTagsFromSearchParam(
    resolvedSearchParams.tags || resolvedSearchParams.tag,
  );

  const events = await client.fetch<EventPageItem[]>(eventsPageQuery);
  const allTags = getAllEventTags(events);

  const filteredEvents =
    selectedTags.length > 0
      ? events.filter((event) =>
          hasAnySelectedTag(getEventTags(event.tags), selectedTags),
        )
      : events;

  const upcomingEvents = filteredEvents.filter(isUpcomingEvent);
  const pastEvents = filteredEvents
    .filter((event) => !isUpcomingEvent(event))
    .reverse();

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

          <EventTagFilter
            tags={allTags}
            selectedTags={selectedTags}
            getHref={(tag) => getTagFilterHref(selectedTags, tag)}
          />

          {filteredEvents.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/50 p-8 text-black/60">
              <h2 className="text-2xl font-black tracking-[-0.04em] text-black">
                Keine Events zu dieser Auswahl.
              </h2>

              <p className="mt-4 max-w-xl leading-8">
                Der Event-Filter ist gerade etwas zu eng geschnürt. Setz ihn
                zurück oder wähle einen anderen Hashtag.
              </p>

              <Link
                href="/events"
                className="mt-6 inline-flex rounded-full border border-black/10 bg-white/55 px-5 py-3 text-xs font-black uppercase tracking-[0.22em] text-black/50 transition hover:border-orange-500/40 hover:text-orange-600"
              >
                Filter zurücksetzen
              </Link>
            </div>
          ) : (
            <>
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
                        tags={getEventTags(event.tags)}
                        selectedTags={selectedTags}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState text="Aktuell sind keine kommenden Termine zu dieser Auswahl eingetragen." />
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
                        tags={getEventTags(event.tags)}
                        selectedTags={selectedTags}
                        muted
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function EventTagFilter({
  tags,
  selectedTags,
  getHref,
}: {
  tags: string[];
  selectedTags: string[];
  getHref: (tag: string) => string;
}) {
  if (tags.length === 0) return null;

  const hasActiveTags = selectedTags.length > 0;

  return (
    <section className="mb-10 rounded-[1.5rem] border border-black/10 bg-white/40 p-5 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
          {hasActiveTags ? "Aktive Event-Hashtags" : "Nach Event-Hashtags filtern"}
        </p>

        {hasActiveTags ? (
          <Link
            href="/events"
            className="text-left text-[10px] font-black uppercase tracking-[0.22em] text-black/40 transition hover:text-orange-600"
          >
            Filter zurücksetzen
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-2">
        {tags.map((tag) => {
          const active = isTagSelected(selectedTags, tag);

          return (
            <Link
              key={tag}
              href={getHref(tag)}
              className={
                active
                  ? "rounded-full border border-orange-500 bg-orange-500 px-4 py-2 text-xs font-black text-white shadow-sm shadow-orange-500/20 transition hover:border-orange-600 hover:bg-orange-600"
                  : "rounded-full border border-black/10 bg-white/55 px-4 py-2 text-xs font-black text-black/50 transition hover:border-orange-500/40 hover:text-orange-600"
              }
            >
              #{tag}
            </Link>
          );
        })}
      </div>
    </section>
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
  tags,
  selectedTags,
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
  tags: string[];
  selectedTags: string[];
  muted?: boolean;
}) {
  const className = `group rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl ${
    muted ? "opacity-70" : ""
  }`;

  return (
    <article className={className}>
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

      {tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={getTagFilterHref(selectedTags, tag)}
              className={
                isTagSelected(selectedTags, tag)
                  ? "px-1 text-[10px] font-bold tracking-[0.04em] text-orange-600"
                  : "px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
              }
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}

      {href ? (
        <div className="mt-7 flex justify-end">
          {external ? (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="font-black transition hover:text-orange-600"
            >
              →
            </a>
          ) : (
            <Link
              href={href}
              className="font-black transition hover:text-orange-600"
            >
              →
            </Link>
          )}
        </div>
      ) : null}
    </article>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-black/15 bg-white/50 p-8 text-black/60">
      {text}
    </div>
  );
}
