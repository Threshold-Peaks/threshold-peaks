"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Image as SanityImage } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";

type HomeJournalPost = {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  publishedAt?: string;
  category?: string;
  excerpt?: string;
};

type HomeGalleryImage = SanityImageSource & {
  alt?: string;
  caption?: string;
};

type HomeGalleryAlbum = {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  category?: string;
  coverImage?: HomeGalleryImage;
  images?: HomeGalleryImage[];
};

type HomeEvent = {
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

type PortalTab = "about" | "journal" | "gallery" | "events" | "contact";

type HomePortalProps = {
  latestPosts: HomeJournalPost[];
  latestAlbums: HomeGalleryAlbum[];
  latestEvents: HomeEvent[];
};

const tabs: Array<{
  id: PortalTab;
  label: string;
  title: string;
  text: string;
}> = [
  {
    id: "about",
    label: "About",
    title: "Über mich",
    text: "Wer hinter Threshold Peaks steckt.",
  },
  {
    id: "journal",
    label: "Journal",
    title: "Journal",
    text: "Beiträge aus Bewegung, Klang und Alltag.",
  },
  {
    id: "gallery",
    label: "Galerie",
    title: "Galerie",
    text: "Alben und kleine Momente unterwegs.",
  },
  {
    id: "events",
    label: "Events",
    title: "Events",
    text: "Termine, Läufe, Rides und Highlights.",
  },
  {
    id: "contact",
    label: "Kontakt",
    title: "Kontakt",
    text: "Kanäle und Verbindungspunkte.",
  },
];

function formatHomeDate(date?: string) {
  if (!date) return "Journal";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function getDateKey(date?: string) {
  return date?.slice(0, 10) ?? "";
}

function formatHomeEventDate(startDate?: string, endDate?: string) {
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

function formatHomeEventTime(startDate?: string) {
  if (!startDate || !startDate.includes("T")) {
    return undefined;
  }

  return `${new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(startDate))} Uhr`;
}

function formatJournalCategory(category?: string) {
  const categories: Record<string, string> = {
    laufen: "Running",
    radfahren: "Cycling",
    musik: "Music",
    lifestyle: "Story",
    event: "Event",
  };

  return category ? categories[category] ?? category : "Story";
}

function formatGalleryCategory(category?: string) {
  const categories: Record<string, string> = {
    running: "Running",
    cycling: "Cycling",
    music: "Music",
    lifestyle: "Life",
    event: "Event",
  };

  return category ? categories[category] ?? category : "Galerie";
}

function formatEventType(type?: string) {
  const types: Record<string, string> = {
    running: "Running",
    laufen: "Running",
    cycling: "Cycling",
    radfahren: "Cycling",
    music: "Music",
    musik: "Music",
    lifestyle: "Life",
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
    folgt: "Folgt",
    confirmed: "Fix",
    planned: "Geplant",
    open: "Offen",
  };

  return status ? statuses[status] ?? status : "Geplant";
}

function getHomeEventHref(event: HomeEvent) {
  if (event.slug?.current) {
    return `/events/${event.slug.current}`;
  }

  return event.externalUrl;
}

export default function HomePortal({
  latestPosts,
  latestAlbums,
  latestEvents,
}: HomePortalProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>("about");

  useEffect(() => {
    function getTabIdFromHash(): PortalTab | undefined {
      const rawHash = window.location.hash.replace("#portal-", "");

      const hashMap: Record<string, PortalTab> = {
        about: "about",
        journal: "journal",
        galerie: "gallery",
        gallery: "gallery",
        events: "events",
        kontakt: "contact",
        contact: "contact",
      };

      return hashMap[rawHash];
    }

    function updateFromHash() {
      const nextTab = getTabIdFromHash();

      if (!nextTab) return;

      setActiveTab(nextTab);

      const portalElement = document.getElementById("portal");

      if (!portalElement) return;

      const portalRect = portalElement.getBoundingClientRect();

      const isAlreadyInPortal =
        portalRect.top < 140 && portalRect.bottom > window.innerHeight * 0.35;

      if (!isAlreadyInPortal) {
        window.setTimeout(() => {
          portalElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 50);
      }
    }

    updateFromHash();

    window.addEventListener("hashchange", updateFromHash);

    return () => {
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, []);

  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <section id="portal" className="px-6 pb-16 md:px-10 lg:px-20">
      <div className="mx-auto max-w-[1280px]">
        <div
          key={activeTab}
          className="portal-card-in overflow-hidden rounded-[2rem] border border-black/10 bg-white/65 shadow-sm backdrop-blur-xl"
        >
          <div className="min-h-[520px] p-7 md:p-10 lg:p-12">
            <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/45">
                  {activeTabMeta.label}
                </p>

                <h3 className="text-4xl font-black leading-tight tracking-[-0.05em] md:text-6xl">
                  {activeTabMeta.title}
                </h3>

                <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-black/55">
                  {activeTabMeta.text}
                </p>
              </div>

              <PortalMainLink activeTab={activeTab} />
            </div>

            {activeTab === "about" ? <AboutPanel /> : null}

            {activeTab === "journal" ? (
              <JournalPanel posts={latestPosts} />
            ) : null}

            {activeTab === "gallery" ? (
              <GalleryPanel albums={latestAlbums} />
            ) : null}

            {activeTab === "events" ? (
              <EventsPanel events={latestEvents} />
            ) : null}

            {activeTab === "contact" ? <ContactPanel /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortalMainLink({ activeTab }: { activeTab: PortalTab }) {
  if (activeTab === "about") {
    return null;
  }

  const hrefs: Record<Exclude<PortalTab, "about">, string> = {
    journal: "/journal",
    gallery: "/gallery",
    events: "/events",
    contact: "mailto:info@threshold-peaks.de",
  };

  const labels: Record<Exclude<PortalTab, "about">, string> = {
    journal: "Alle Beiträge ansehen",
    gallery: "Alle Alben ansehen",
    events: "Alle Termine ansehen",
    contact: "E-Mail schreiben",
  };

  const key = activeTab as Exclude<PortalTab, "about">;
  const href = hrefs[key];

  return (
    <Link
      href={href}
      className="inline-flex min-w-[220px] items-center justify-between rounded-md border border-black/10 bg-[#d7d5ce] px-6 py-4 text-sm font-bold text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md"
    >
      {labels[key]} <span>→</span>
    </Link>
  );
}

function AboutPanel() {
  const items = [
    {
      label: "Running",
      title: "Bahn, Straße, Fokus",
      text: "Laufen ist für mich mehr als Training. Es ist der Moment, in dem der Kopf frei wird und aus Bewegung Fokus entsteht.",
    },
    {
      label: "Cycling",
      title: "Ausgleich auf zwei Rädern",
      text: "Rennrad und Gravelbike bringen Abwechslung, neue Wege und den perfekten Ausgleich zum Lauftraining.",
    },
    {
      label: "Music",
      title: "Beats, die bewegen",
      text: "Elektronische Musik, DJ-Sets und Rhythmus geben vielen Momenten ihre Energie.",
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
      <div>
        <p className="max-w-xl text-base leading-8 text-black/70 md:text-lg md:leading-9">
          Ich bin Matthias, in Stuttgart geboren und seit vielen Jahren in Verl
          zuhause. Bewegung, Ausdauer und Musik begleiten mich schon lange und
          sind ein fester Teil meines Lebens.
        </p>

        <p className="mt-6 max-w-xl text-base leading-8 text-black/70 md:text-lg md:leading-9">
          Threshold Peaks verbindet Laufen, Radfahren, elektronische Musik und
          aktiven Lifestyle zu einem persönlichen Projekt.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.label}
            className="rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] p-6 shadow-sm"
          >
            <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-black/40">
              {item.label}
            </p>

            <h4 className="mb-4 text-xl font-black leading-tight tracking-[-0.03em]">
              {item.title}
            </h4>

            <p className="text-sm font-semibold leading-7 text-black/65">
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}

function JournalPanel({ posts }: { posts: HomeJournalPost[] }) {
  const fallbackPosts: HomeJournalPost[] = [
    {
      _id: "fallback-journal-1",
      title: "Warum Threshold Peaks?",
      excerpt:
        "Über persönliche Schwellen, kleine Peaks und das Potenzial, das entsteht, wenn man bewusst weitergeht.",
      category: "Story",
    },
    {
      _id: "fallback-journal-2",
      title: "Wege, Wälder und Ausgleich",
      excerpt:
        "Rennrad, Gravelbike und Touren draußen. Alles, was Bewegung leichter macht.",
      category: "Cycling",
    },
    {
      _id: "fallback-journal-3",
      title: "Beats für lange Strecken",
      excerpt:
        "Elektronische Musik und die Verbindung zwischen Rhythmus, Energie und Bewegung.",
      category: "Music",
    },
  ];

  const items = posts.length > 0 ? posts : fallbackPosts;

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {items.map((post) => {
        const href = post.slug?.current
          ? `/journal/${post.slug.current}`
          : "/journal";

        return (
          <Link
            key={post._id}
            href={href}
            className="group flex min-h-[300px] flex-col rounded-[1.5rem] border border-black/10 bg-[#111217] p-6 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <p className="mb-5 text-[10px] font-black uppercase tracking-[0.35em] text-white/40">
              {formatHomeDate(post.publishedAt)}
            </p>

            <h4 className="mb-4 text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-400">
              {post.title}
            </h4>

            <p className="leading-7 text-white/65">
              {post.excerpt ||
                "Ein neuer Beitrag aus dem Threshold Peaks Journal."}
            </p>

            <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/60">
                {formatJournalCategory(post.category)}
              </span>

              <span className="transition group-hover:translate-x-1 group-hover:text-orange-400">
                →
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function GalleryPanel({ albums }: { albums: HomeGalleryAlbum[] }) {
  if (albums.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-black/10 bg-[#f5f3ee] p-7">
        <h4 className="text-2xl font-black tracking-[-0.04em]">
          Noch keine Alben vorhanden.
        </h4>

        <p className="mt-4 leading-8 text-black/65">
          Sobald du im Sanity Studio Alben veröffentlichst, erscheinen sie hier.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {albums.map((album, index) => {
        const image = album.coverImage || album.images?.[0];
        const href = album.slug?.current
          ? `/gallery/${album.slug.current}`
          : "/gallery";

        return (
          <Link
            key={album._id}
            href={href}
            className="group relative min-h-[340px] overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            {image ? (
              <SanityImage
                src={urlFor(image).width(800).height(1000).fit("crop").url()}
                alt={image.alt || album.title}
                width={800}
                height={1000}
                priority={index === 0}
                className="h-full min-h-[340px] w-full object-cover transition duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex min-h-[340px] items-center justify-center p-6 text-center text-sm font-black uppercase tracking-[0.28em] text-black/45">
                Kein Bild hinterlegt
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
                {formatGalleryCategory(album.category)}
              </p>

              <h4 className="text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-400">
                {album.title}
              </h4>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function EventsPanel({ events }: { events: HomeEvent[] }) {
  const fallbackEvents = [
    {
      _id: "fallback-event-1",
      date: "10. Juni 2026",
      title: "AOK-Firmenlauf Wiedenbrück",
      type: "Running",
      status: "Angemeldet",
      text: "Geplanter Lauftermin am Mittwoch, 10. Juni 2026.",
    },
    {
      _id: "fallback-event-2",
      date: "In Planung",
      title: "Gravelrunde rund um Verl",
      type: "Cycling",
      status: "Offen",
      text: "Eine lockere Ausfahrt auf Rennrad oder Gravelbike.",
    },
  ];

  if (events.length === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {fallbackEvents.map((event) => (
          <article
            key={event._id}
            className="rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] p-6 shadow-sm"
          >
            <EventCardContent
              date={event.date}
              title={event.title}
              type={event.type}
              status={event.status}
              text={event.text}
            />
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {events.map((event) => {
        const href = getHomeEventHref(event);
        const date = formatHomeEventDate(event.startDate, event.endDate);
        const time = event.time || formatHomeEventTime(event.startDate);
        const type = formatEventType(event.eventType);
        const status = formatEventStatus(event.status);

        if (!href) {
          return (
            <article
              key={event._id}
              className="rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] p-6 shadow-sm"
            >
              <EventCardContent
                date={date}
                time={time}
                title={event.title}
                type={type}
                status={status}
                text={
                  event.teaser ||
                  "Ein kommender Termin im Threshold Peaks Kalender."
                }
                location={event.location}
              />
            </article>
          );
        }

        const isExternal = href.startsWith("http");

        return (
          <Link
            key={event._id}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="group rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] p-6 shadow-sm transition hover:-translate-y-1 hover:bg-[#c9c6bd] hover:shadow-xl"
          >
            <EventCardContent
              date={date}
              time={time}
              title={event.title}
              type={type}
              status={status}
              text={
                event.teaser ||
                "Ein kommender Termin im Threshold Peaks Kalender."
              }
              location={event.location}
              linked
            />
          </Link>
        );
      })}
    </div>
  );
}

function EventCardContent({
  date,
  time,
  title,
  type,
  status,
  text,
  location,
  linked = false,
}: {
  date: string;
  time?: string;
  title: string;
  type: string;
  status: string;
  text: string;
  location?: string;
  linked?: boolean;
}) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="inline-flex rounded-full border border-black/10 bg-white/60 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-black/65">
          {type}
        </span>

        <span className="rounded-full bg-[#111217] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white">
          {status}
        </span>
      </div>

      <h4 className="text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-600">
        {title}
      </h4>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-black uppercase tracking-[0.2em] text-black/45">
        <span>{date}</span>
        {time ? <span>{time}</span> : null}
        {location ? <span>{location}</span> : null}
      </div>

      <p className="mt-4 leading-7 text-black/65">{text}</p>

      <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5 text-sm font-black">
        <span>{linked ? "Details ansehen" : "Termin"}</span>

        {linked ? (
          <span className="transition group-hover:translate-x-1">→</span>
        ) : null}
      </div>
    </>
  );
}

function ContactPanel() {
  const links = [
    {
      title: "Instagram",
      text: "Training, Ausdauer, Alltag und kleine Momente unterwegs.",
      href: "https://www.instagram.com/threshold.peaks/",
    },
    {
      title: "Strava",
      text: "Läufe, Rides und sportliche Aktivitäten.",
      href: "https://www.strava.com/athletes/47713057",
    },
    {
      title: "SoundCloud",
      text: "DJ-Sets und elektronische Sounds folgen demnächst.",
      href: "#",
    },
    {
      title: "E-Mail",
      text: "Schreib mir direkt an info@threshold-peaks.de",
      href: "mailto:info@threshold-peaks.de",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {links.map((item) => {
        const isExternal = item.href.startsWith("http");

        return (
          <Link
            key={item.title}
            href={item.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
            className="group rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] p-6 shadow-sm transition hover:-translate-y-1 hover:bg-[#c9c6bd] hover:shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h4 className="text-lg font-black transition group-hover:text-orange-600">
                {item.title}
              </h4>

              <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
                →
              </span>
            </div>

            <p className="leading-7 text-black/65">{item.text}</p>
          </Link>
        );
      })}
    </div>
  );
}