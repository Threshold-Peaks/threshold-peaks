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
  embedded?: boolean;
};

const tabs: Array<{
  id: PortalTab;
  title: string;
  text: string;
}> = [
  {
    id: "about",
    title: "Über mich",
    text: "Wer hinter Threshold Peaks steckt.",
  },
  {
    id: "journal",
    title: "Journal",
    text: "Beiträge aus Bewegung, Klang und Alltag.",
  },
  {
    id: "gallery",
    title: "Galerie",
    text: "Alben und kleine Momente unterwegs.",
  },
  {
    id: "events",
    title: "Events",
    text: "Termine, Läufe, Rides und Highlights.",
  },
  {
    id: "contact",
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
    laufen: "Running",
    radfahren: "Cycling",
    musik: "Music",
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
  embedded = false,
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
      const rawHash = window.location.hash
        .replace(/^#/, "")
        .replace(/^portal-/, "");

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

      const topElement = document.getElementById("top");

      if (!topElement) return;

      window.setTimeout(() => {
        topElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
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
    <section
      className={
        embedded ? "relative pb-0" : "relative px-6 pb-16 md:px-10 lg:px-20"
      }
    >
      <span
        id="portal-about"
        className="absolute -top-28 h-px w-px overflow-hidden"
        aria-hidden="true"
      />
      <span
        id="portal-journal"
        className="absolute -top-28 h-px w-px overflow-hidden"
        aria-hidden="true"
      />
      <span
        id="portal-gallery"
        className="absolute -top-28 h-px w-px overflow-hidden"
        aria-hidden="true"
      />
      <span
        id="portal-events"
        className="absolute -top-28 h-px w-px overflow-hidden"
        aria-hidden="true"
      />
      <span
        id="portal-contact"
        className="absolute -top-28 h-px w-px overflow-hidden"
        aria-hidden="true"
      />

      <div className={embedded ? "w-full" : "mx-auto max-w-[1280px]"}>
        <div className="portal-card-in overflow-hidden rounded-[2rem] border border-black/10 bg-white/60 shadow-sm backdrop-blur-xl">
          <div
            className={
              embedded
                ? "flex min-h-[460px] flex-col p-6 md:p-8 lg:min-h-[500px] lg:p-10"
                : "flex min-h-[720px] flex-col p-7 md:min-h-[760px] md:p-10 lg:min-h-[780px] lg:p-12"
            }
          >
            <div className="mb-9 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
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

            <div className="flex-1">
              {activeTab === "about" ? <AboutPanel /> : null}

              {activeTab === "journal" ? (
                selectedPost ? (
                  <JournalPortalDetail
                    post={selectedPost}
                    onBack={() => setSelectedPost(null)}
                  />
                ) : (
                  <JournalPanel
                    posts={visiblePosts}
                    onOpenPost={setSelectedPost}
                  />
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

  if (activeTab === "about" || activeTab === "contact") {
    return null;
  }

  const key = activeTab as PortalContentTab;

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
          className="group flex min-h-[300px] flex-col rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] p-6 text-left text-[#111217] shadow-sm transition hover:-translate-y-1 hover:bg-[#c9c6bd] hover:shadow-xl"
        >
          <p className="mb-5 text-[10px] font-black uppercase tracking-[0.35em] text-black/40">
            {formatHomeDate(post.publishedAt)}
          </p>

          <h4 className="mb-4 text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-600">
            {post.title}
          </h4>

          <p className="leading-7 text-black/65">
            {post.excerpt ||
              "Ein neuer Beitrag aus dem Threshold Peaks Journal."}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-black/10 pt-5">
            <span className="rounded-full bg-white/60 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-black/55">
              {formatJournalCategory(post.category)}
            </span>

            <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
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

  const ratioClasses = [
    "aspect-[4/5]",
    "aspect-[3/4]",
    "aspect-[5/4]",
    "aspect-[4/3]",
    "aspect-[2/3]",
  ];

  return (
    <div className="columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-4">
      {albums.map((album, index) => {
        const image = album.coverImage || album.images?.[0];
        const imageCount = album.images?.length ?? 0;
        const imageRatioClass = ratioClasses[index % ratioClasses.length];

        return (
          <button
            key={album._id}
            type="button"
            onClick={() => onOpenAlbum(album)}
            className="group mb-5 block w-full break-inside-avoid overflow-hidden rounded-[1.75rem] border border-black/10 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              className={`relative overflow-hidden bg-[#d7d5ce] ${imageRatioClass}`}
            >
              {image ? (
                <SanityImage
                  src={urlFor(image).width(900).height(1200).fit("crop").url()}
                  alt={image.alt || album.title}
                  width={900}
                  height={1200}
                  priority={index === 0}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center p-6 text-center text-sm font-black uppercase tracking-[0.28em] text-black/45">
                  Kein Bild hinterlegt
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-black shadow-sm backdrop-blur-md">
                  {formatGalleryCategory(album.category)}
                </span>

                {imageCount > 0 ? (
                  <span className="rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-white shadow-sm backdrop-blur-md">
                    {imageCount === 1 ? "1 Bild" : `${imageCount} Bilder`}
                  </span>
                ) : null}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h4 className="text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-400">
                  {album.title}
                </h4>

                {album.description ? (
                  <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-white/75">
                    {album.description}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-black/10 bg-[#f5f3ee] px-5 py-4 text-sm font-black text-black">
              <span>Album öffnen</span>
              <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
                →
              </span>
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
  const galleryImages = images.length > 0 ? images : coverImage ? [coverImage] : [];

  const ratioClasses = [
    "aspect-[4/5]",
    "aspect-[3/4]",
    "aspect-[5/4]",
    "aspect-[4/3]",
    "aspect-[2/3]",
  ];

  return (
    <article className="text-neutral-950">
      <button
        type="button"
        onClick={onBack}
        className="mb-10 inline-flex items-center rounded-md border border-black/10 bg-[#d7d5ce] px-5 py-3 text-sm font-bold text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md"
      >
        ← Zurück zur Galerie
      </button>

      <header className="grid gap-8 lg:grid-cols-[1fr_0.38fr] lg:items-end">
        <div>
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#ded9cf] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-neutral-700">
              {formatGalleryCategory(album.category)}
            </span>

            <span className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500">
              {galleryImages.length === 1
                ? "1 Bild"
                : `${galleryImages.length} Bilder`}
            </span>
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-none tracking-tight md:text-7xl">
            {album.title}
          </h1>

          {album.description ? (
            <p className="mt-8 max-w-3xl text-xl leading-9 text-neutral-600">
              {album.description}
            </p>
          ) : null}
        </div>

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
                {galleryImages.length === 1
                  ? "1 Bild"
                  : `${galleryImages.length} Bilder`}
              </p>
            </div>
          </div>
        </div>
      </header>

      {coverImage ? (
        <div className="mt-12 overflow-hidden rounded-[2rem] bg-white p-3 shadow-sm ring-1 ring-black/10">
          <div className="relative overflow-hidden rounded-[1.5rem] bg-[#ded9cf]">
            <SanityImage
              src={urlFor(coverImage)
                .width(1600)
                .height(1000)
                .fit("crop")
                .url()}
              alt={coverImage.alt || album.title}
              width={1600}
              height={1000}
              priority
              className="aspect-[16/10] w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="inline-flex rounded-full bg-black/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-white backdrop-blur-md">
                  Galerie-Cover
                </span>

                {coverImage.caption ? (
                  <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white">
                    {coverImage.caption}
                  </p>
                ) : null}
              </div>

              <span className="rounded-full bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-black backdrop-blur-md">
                Threshold Peaks
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-10 rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-black/10 md:p-6">
        {galleryImages.length === 0 ? (
          <div className="rounded-[1.5rem] bg-[#f5f3ee] p-7">
            <p className="leading-8 text-black/65">
              In diesem Album sind noch keine Bilder hinterlegt.
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-5 space-y-5 sm:columns-2 lg:columns-3">
            {galleryImages.map((image, index) => {
              const imageRatioClass = ratioClasses[index % ratioClasses.length];

              return (
                <figure
                  key={`${album._id}-${index}`}
                  className="mb-5 break-inside-avoid overflow-hidden rounded-[1.5rem] bg-[#f5f3ee] shadow-sm ring-1 ring-black/10 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
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
                      className="h-full w-full object-cover transition duration-700 hover:scale-[1.03]"
                    />
                  </div>

                  {(image.caption || image.alt) ? (
                    <figcaption className="border-t border-black/10 bg-white px-5 py-4">
                      <p className="text-sm font-semibold leading-6 text-black/70">
                        {image.caption || image.alt}
                      </p>
                    </figcaption>
                  ) : null}
                </figure>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="mt-8 inline-flex items-center rounded-md border border-black/10 bg-[#d7d5ce] px-5 py-3 text-sm font-bold text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md"
      >
        ← Zurück zur Galerie
      </button>
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
  const links: Array<{
    title: string;
    kicker: string;
    text: string;
    href?: string;
    label: string;
  }> = [
    {
      title: "Instagram",
      kicker: "Momente",
      text: "Training, Ausdauer, Alltag und kleine Eindrücke unterwegs.",
      href: "https://www.instagram.com/threshold.peaks/",
      label: "Instagram öffnen",
    },
    {
      title: "Strava",
      kicker: "Aktivitäten",
      text: "Läufe, Rides und sportliche Aktivitäten im Überblick.",
      href: "https://www.strava.com/athletes/47713057",
      label: "Strava öffnen",
    },
    {
      title: "SoundCloud",
      kicker: "Musik",
      text: "DJ-Sets und elektronische Sounds folgen demnächst.",
      label: "Folgt bald",
    },
  ];

  const cardClass =
    "group rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] p-5 shadow-sm transition hover:-translate-y-1 hover:bg-[#c9c6bd] hover:shadow-xl";

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1.4fr]">
      <div className="rounded-[2rem] border border-black/10 bg-white p-7 text-[#111217] shadow-sm md:p-8">
        <p className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-black/40">
          Direktkontakt
        </p>

        <h4 className="max-w-xl text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
          Schreib mir, wenn du Fragen, Ideen oder Feedback hast.
        </h4>

        <p className="mt-5 max-w-xl leading-8 text-black/65">
          Ob Training, Events, Website, Musik oder einfach ein kurzer Austausch:
          Threshold Peaks lebt von Bewegung, Klang und guten Gedanken dazwischen.
        </p>

        <a
          href="mailto:info@threshold-peaks.de"
          className="mt-8 inline-flex w-full items-center justify-between rounded-md border border-black/10 bg-[#d7d5ce] px-6 py-4 text-sm font-black text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md sm:w-auto sm:min-w-[260px]"
        >
          info@threshold-peaks.de
          <span>→</span>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {links.map((item) => {
          const isExternal = item.href?.startsWith("http");

          const cardContent = (
            <>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-black/40">
                    {item.kicker}
                  </p>

                  <h4 className="text-xl font-black leading-tight tracking-[-0.03em] transition group-hover:text-orange-600">
                    {item.title}
                  </h4>
                </div>

                <span className="rounded-full bg-white/60 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-black/50 transition group-hover:text-orange-600">
                  {item.href ? "↗" : "bald"}
                </span>
              </div>

              <p className="text-sm font-semibold leading-7 text-black/65">
                {item.text}
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-sm font-black text-black">
                <span>{item.label}</span>

                {item.href ? (
                  <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
                    →
                  </span>
                ) : (
                  <span className="text-black/35">•</span>
                )}
              </div>
            </>
          );

          if (!item.href) {
            return (
              <div key={item.title} className={`${cardClass} cursor-default`}>
                {cardContent}
              </div>
            );
          }

          return (
            <a
              key={item.title}
              href={item.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className={cardClass}
            >
              {cardContent}
            </a>
          );
        })}
      </div>
    </div>
  );
}
