"use client";

import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { useEffect, useState } from "react";
import { Image as SanityImage } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";

type PortableTextBlock = any[];

type HomeJournalImage = SanityImageSource & {
  alt?: string;
};

type HomeJournalPost = {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  publishedAt?: string;
  category?: string;
  excerpt?: string;
  body?: PortableTextBlock;
  stravaUrl?: string;
  soundcloudUrl?: string;
  mainImage?: HomeJournalImage;
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
  description?: string;
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
  image?: HomeGalleryImage;
  body?: PortableTextBlock;
};

type PortalTab = "about" | "journal" | "gallery" | "events" | "contact";
type PortalContentTab = Exclude<PortalTab, "about" | "contact">;

type HomePortalProps = {
  latestPosts: HomeJournalPost[];
  allPosts: HomeJournalPost[];
  latestAlbums: HomeGalleryAlbum[];
  allAlbums: HomeGalleryAlbum[];
  latestEvents: HomeEvent[];
  allEvents: HomeEvent[];
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

const journalPortableTextComponents: PortableTextComponents = {
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

const eventPortableTextComponents: PortableTextComponents = {
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

function formatEventDetailDate(date?: string) {
  if (!date) return null;

  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
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

export default function HomePortal({
  latestPosts,
  allPosts,
  latestAlbums,
  allAlbums,
  latestEvents,
  allEvents,
}: HomePortalProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>("about");
  const [selectedPost, setSelectedPost] = useState<HomeJournalPost | null>(
    null
  );
  const [selectedAlbum, setSelectedAlbum] = useState<HomeGalleryAlbum | null>(
    null
  );
  const [selectedEvent, setSelectedEvent] = useState<HomeEvent | null>(null);
  const [showAllContent, setShowAllContent] = useState<
    Record<PortalContentTab, boolean>
  >({
    journal: false,
    gallery: false,
    events: false,
  });

  function clearPortalDetails() {
    setSelectedPost(null);
    setSelectedAlbum(null);
    setSelectedEvent(null);
  }

  function resetShowAllContent() {
    setShowAllContent({
      journal: false,
      gallery: false,
      events: false,
    });
  }

  function toggleShowAllContent(tab: PortalContentTab) {
    clearPortalDetails();

    setShowAllContent((current) => ({
      ...current,
      [tab]: !current[tab],
    }));
  }

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
      clearPortalDetails();
      resetShowAllContent();

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

  const visiblePosts =
    showAllContent.journal && allPosts.length > 0 ? allPosts : latestPosts;

  const visibleAlbums =
    showAllContent.gallery && allAlbums.length > 0 ? allAlbums : latestAlbums;

  const visibleEvents =
    showAllContent.events && allEvents.length > 0 ? allEvents : latestEvents;

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

              {!selectedPost && !selectedAlbum && !selectedEvent ? (
                <PortalMainLink
                  activeTab={activeTab}
                  showAllContent={showAllContent}
                  onToggleShowAll={toggleShowAllContent}
                />
              ) : null}
            </div>

            {activeTab === "about" ? <AboutPanel /> : null}

            {activeTab === "journal" ? (
              selectedPost ? (
                <JournalPortalDetail
                  post={selectedPost}
                  onBack={() => setSelectedPost(null)}
                />
              ) : (
                <JournalPanel posts={visiblePosts} onOpenPost={setSelectedPost} />
              )
            ) : null}

            {activeTab === "gallery" ? (
              selectedAlbum ? (
                <GalleryAlbumPortalDetail
                  album={selectedAlbum}
                  onBack={() => setSelectedAlbum(null)}
                />
              ) : (
                <GalleryPanel
                  albums={visibleAlbums}
                  onOpenAlbum={setSelectedAlbum}
                />
              )
            ) : null}

            {activeTab === "events" ? (
              selectedEvent ? (
                <EventPortalDetail
                  event={selectedEvent}
                  onBack={() => setSelectedEvent(null)}
                />
              ) : (
                <EventsPanel
                  events={visibleEvents}
                  onOpenEvent={setSelectedEvent}
                />
              )
            ) : null}

            {activeTab === "contact" ? <ContactPanel /> : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function PortalMainLink({
  activeTab,
  showAllContent,
  onToggleShowAll,
}: {
  activeTab: PortalTab;
  showAllContent: Record<PortalContentTab, boolean>;
  onToggleShowAll: (tab: PortalContentTab) => void;
}) {
  const buttonClass =
    "inline-flex min-w-[220px] items-center justify-between rounded-md border border-black/10 bg-[#d7d5ce] px-6 py-4 text-sm font-bold text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md";

  if (activeTab === "about") {
    return null;
  }

  if (activeTab === "contact") {
    return (
      <Link href="mailto:info@threshold-peaks.de" className={buttonClass}>
        E-Mail schreiben <span>→</span>
      </Link>
    );
  }

  const key = activeTab;

  const showAllLabels: Record<PortalContentTab, string> = {
    journal: "Alle Beiträge ansehen",
    gallery: "Alle Alben ansehen",
    events: "Alle Termine ansehen",
  };

  const showLessLabels: Record<PortalContentTab, string> = {
    journal: "Weniger Beiträge anzeigen",
    gallery: "Weniger Alben anzeigen",
    events: "Weniger Termine anzeigen",
  };

  const isShowingAll = showAllContent[key];

  return (
    <button
      type="button"
      onClick={() => onToggleShowAll(key)}
      className={buttonClass}
    >
      {isShowingAll ? showLessLabels[key] : showAllLabels[key]}
      <span>{isShowingAll ? "↑" : "→"}</span>
    </button>
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

function JournalPanel({
  posts,
  onOpenPost,
}: {
  posts: HomeJournalPost[];
  onOpenPost: (post: HomeJournalPost) => void;
}) {
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
      {items.map((post) => (
        <button
          key={post._id}
          type="button"
          onClick={() => onOpenPost(post)}
          className="group flex min-h-[300px] flex-col rounded-[1.5rem] border border-black/10 bg-[#111217] p-6 text-left text-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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
        </button>
      ))}
    </div>
  );
}

function JournalPortalDetail({
  post,
  onBack,
}: {
  post: HomeJournalPost;
  onBack: () => void;
}) {
  return (
    <article>
      <button
        type="button"
        onClick={onBack}
        className="mb-10 inline-flex items-center rounded-md border border-black/10 bg-[#d7d5ce] px-5 py-3 text-sm font-bold text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md"
      >
        ← Zurück zum Journal
      </button>

      <header className="max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#ded9cf] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-neutral-700">
            {formatJournalCategory(post.category)}
          </span>

          <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
            {formatHomeDate(post.publishedAt)}
          </span>
        </div>

        <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
          {post.title}
        </h1>

        {post.excerpt ? (
          <p className="mt-8 max-w-3xl text-xl leading-9 text-neutral-600">
            {post.excerpt}
          </p>
        ) : null}
      </header>

      {post.mainImage ? (
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
              <SanityImage
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
      ) : null}

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
                  {formatJournalCategory(post.category)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
                  Datum
                </p>
                <p className="mt-1 text-black">
                  {formatHomeDate(post.publishedAt)}
                </p>
              </div>
            </div>
          </div>

          {(post.stravaUrl || post.soundcloudUrl) ? (
            <div className="rounded-[2rem] bg-[#d7d5ce] p-6 shadow-sm ring-1 ring-black/10">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-black/40">
                Links
              </p>

              <div className="grid gap-3">
                {post.stravaUrl ? (
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
                ) : null}

                {post.soundcloudUrl ? (
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
                ) : null}
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onBack}
            className="group block w-full rounded-[2rem] bg-[#d7d5ce] p-6 text-left text-black shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="mb-2 text-xs font-black uppercase tracking-[0.32em] text-black/40">
              Zurück
            </p>

            <div className="flex items-center justify-between gap-4 text-sm font-black">
              <span>Zurück zum Journal</span>
              <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
                →
              </span>
            </div>
          </button>
        </aside>

        <div className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-black/10 md:p-10">
          {post.body && post.body.length > 0 ? (
            <PortableText
              value={post.body}
              components={journalPortableTextComponents}
            />
          ) : (
            <p className="text-base leading-8 text-neutral-600">
              Für diesen Beitrag wurde noch kein Text hinterlegt.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function GalleryPanel({
  albums,
  onOpenAlbum,
}: {
  albums: HomeGalleryAlbum[];
  onOpenAlbum: (album: HomeGalleryAlbum) => void;
}) {
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

        return (
          <button
            key={album._id}
            type="button"
            onClick={() => onOpenAlbum(album)}
            className="group relative min-h-[340px] overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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
          </button>
        );
      })}
    </div>
  );
}

function GalleryAlbumPortalDetail({
  album,
  onBack,
}: {
  album: HomeGalleryAlbum;
  onBack: () => void;
}) {
  const images = album.images || [];
  const coverImage = album.coverImage || images[0];

  return (
    <article className="text-neutral-950">
      <button
        type="button"
        onClick={onBack}
        className="mb-10 inline-flex items-center rounded-md border border-black/10 bg-[#d7d5ce] px-5 py-3 text-sm font-bold text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md"
      >
        ← Zurück zur Galerie
      </button>

      <header className="max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-[#ded9cf] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-neutral-700">
            {formatGalleryCategory(album.category)}
          </span>

          <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
            {images.length === 1
              ? "1 Bild"
              : `${images.length} Bilder`}
          </span>
        </div>

        <h1 className="text-5xl font-black leading-none tracking-tight md:text-7xl">
          {album.title}
        </h1>

        {album.description ? (
          <p className="mt-8 max-w-3xl text-xl leading-9 text-neutral-600">
            {album.description}
          </p>
        ) : null}
      </header>

      {coverImage ? (
        <div className="mt-12 max-w-5xl">
          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full bg-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white">
              Galerie-Cover
            </span>

            <span className="text-xs font-black uppercase tracking-[0.25em] text-black/40">
              Album
            </span>
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-black/10">
            <div className="overflow-hidden rounded-[1.5rem] bg-[#ded9cf]">
              <SanityImage
                src={urlFor(coverImage).width(1400).height(900).fit("crop").url()}
                alt={coverImage.alt || album.title}
                width={1400}
                height={900}
                priority
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(240px,0.9fr)_minmax(0,3fr)] lg:items-start">
        <aside className="space-y-5 lg:sticky lg:top-8">
          <div className="rounded-[2rem] bg-[#d7d5ce] p-6 shadow-sm ring-1 ring-black/10">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.32em] text-black/40">
              Album
            </p>

            <div className="space-y-4 text-sm font-bold text-black/65">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
                  Kategorie
                </p>
                <p className="mt-1 text-black">
                  {formatGalleryCategory(album.category)}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
                  Umfang
                </p>
                <p className="mt-1 text-black">
                  {images.length === 1
                    ? "1 Bild"
                    : `${images.length} Bilder`}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="group block w-full rounded-[2rem] bg-[#d7d5ce] p-6 text-left text-black shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="mb-2 text-xs font-black uppercase tracking-[0.32em] text-black/40">
              Zurück
            </p>

            <div className="flex items-center justify-between gap-4 text-sm font-black">
              <span>Zurück zur Galerie</span>
              <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
                →
              </span>
            </div>
          </button>
        </aside>

        <div className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-black/10 md:p-6">
          {images.length === 0 ? (
            <div className="rounded-[1.5rem] bg-[#f5f3ee] p-7">
              <p className="leading-8 text-black/65">
                In diesem Album sind noch keine Bilder hinterlegt.
              </p>
            </div>
          ) : (
            <div className="columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
              {images.map((image, index) => {
                const isLarge = index % 5 === 0;
                const isTall = index % 5 === 2;
                const isWide = index % 5 === 4;

                const imageRatioClass = isLarge
                  ? "aspect-[4/5]"
                  : isTall
                    ? "aspect-[3/4]"
                    : isWide
                      ? "aspect-[5/4]"
                      : "aspect-[4/3]";

                return (
                  <figure
                    key={`${album._id}-${index}`}
                    className="mb-5 break-inside-avoid overflow-hidden rounded-[1.5rem] bg-[#f5f3ee] shadow-sm ring-1 ring-black/10"
                  >
                    <div
                      className={`relative overflow-hidden bg-black/5 ${imageRatioClass}`}
                    >
                      <SanityImage
                        src={urlFor(image)
                          .width(1200)
                          .height(1600)
                          .fit("crop")
                          .url()}
                        alt={image.alt || `${album.title} Bild ${index + 1}`}
                        width={1200}
                        height={1600}
                        className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                      />
                    </div>

                    {(image.caption || image.alt) ? (
                      <figcaption className="px-5 py-4">
                        {image.caption ? (
                          <p className="text-sm font-semibold leading-6 text-black/65">
                            {image.caption}
                          </p>
                        ) : null}

                        {!image.caption && image.alt ? (
                          <p className="text-sm font-semibold leading-6 text-black/55">
                            {image.alt}
                          </p>
                        ) : null}
                      </figcaption>
                    ) : null}
                  </figure>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function EventsPanel({
  events,
  onOpenEvent,
}: {
  events: HomeEvent[];
  onOpenEvent: (event: HomeEvent) => void;
}) {
  const fallbackEvents: HomeEvent[] = [
    {
      _id: "fallback-event-1",
      startDate: "2026-06-10",
      title: "AOK-Firmenlauf Wiedenbrück",
      eventType: "Running",
      status: "Angemeldet",
      teaser: "Geplanter Lauftermin am Mittwoch, 10. Juni 2026.",
    },
    {
      _id: "fallback-event-2",
      title: "Gravelrunde rund um Verl",
      eventType: "Cycling",
      status: "Offen",
      teaser: "Eine lockere Ausfahrt auf Rennrad oder Gravelbike.",
    },
  ];

  const items = events.length > 0 ? events : fallbackEvents;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {items.map((event) => {
        const date = formatHomeEventDate(event.startDate, event.endDate);
        const time = event.time || formatHomeEventTime(event.startDate);
        const type = formatEventType(event.eventType);
        const status = formatEventStatus(event.status);

        return (
          <button
            key={event._id}
            type="button"
            onClick={() => onOpenEvent(event)}
            className="group rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] p-6 text-left shadow-sm transition hover:-translate-y-1 hover:bg-[#c9c6bd] hover:shadow-xl"
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
          </button>
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

function EventPortalDetail({
  event,
  onBack,
}: {
  event: HomeEvent;
  onBack: () => void;
}) {
  const formattedDate = formatEventDetailDate(event.startDate);
  const image = event.image;

  return (
    <article className="text-neutral-950">
      <button
        type="button"
        onClick={onBack}
        className="mb-10 inline-flex items-center rounded-md border border-black/10 bg-[#d7d5ce] px-5 py-3 text-sm font-bold text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md"
      >
        ← Zurück zu den Events
      </button>

      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-8">
          <div className="mb-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.25em] text-neutral-500">
            {event.eventType ? <span>{event.eventType}</span> : null}
            {event.status ? <span>• {event.status}</span> : null}
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-neutral-950 md:text-6xl">
            {event.title}
          </h1>

          {event.teaser ? (
            <p className="mt-5 max-w-2xl text-lg leading-8 text-neutral-600">
              {event.teaser}
            </p>
          ) : null}
        </header>

        {image ? (
          <div className="mb-10 overflow-hidden rounded-[2rem] bg-white shadow-sm">
            <SanityImage
              src={urlFor(image).width(1600).url()}
              alt={image.alt || event.title || "Event Bild"}
              width={1600}
              height={900}
              className="h-auto w-full object-cover"
            />
          </div>
        ) : null}

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
              {event.time || formatHomeEventTime(event.startDate) || "Noch offen"}
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

        {event.body && event.body.length > 0 ? (
          <div className="prose prose-neutral max-w-3xl">
            <PortableText
              value={event.body}
              components={eventPortableTextComponents}
            />
          </div>
        ) : null}

        {event.externalUrl ? (
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
        ) : null}
      </div>
    </article>
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
