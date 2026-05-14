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

const lineButtonClass =
  "inline-flex items-center gap-2 border-b border-black/20 pb-2 text-sm font-black text-black/55 transition hover:border-orange-500 hover:text-orange-600";

const lineButtonWideClass =
  "inline-flex min-w-[220px] items-center justify-between gap-4 border-b border-black/20 pb-2 text-sm font-black text-black/55 transition hover:border-orange-500 hover:text-orange-600";

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

  return category ? (categories[category] ?? category) : "Journal";
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

  return type ? (types[type] ?? type) : "Event";
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

  return status ? (statuses[status] ?? status) : "Geplant";
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
    null,
  );
  const [selectedAlbum, setSelectedAlbum] = useState<HomeGalleryAlbum | null>(
    null,
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
        <div className="portal-card-in overflow-hidden rounded-[2rem] border border-black/10 bg-white/55 shadow-[0_1px_2px_rgba(17,18,23,0.06)] ring-1 ring-white/70 backdrop-blur-2xl">
          <div
            className={
              embedded
                ? "flex min-h-[460px] flex-col p-5 md:p-7 lg:min-h-[500px] lg:p-8"
                : "flex min-h-[720px] flex-col p-6 md:min-h-[760px] md:p-8 lg:min-h-[780px] lg:p-10"
            }
          >
            <div className="mb-8 flex flex-col gap-5 border-b border-black/10 pb-7 md:flex-row md:items-end md:justify-between">
              <div className="relative pl-6">
                <span className="absolute left-0 top-1 h-full w-px bg-black/15" />
                <span className="absolute -left-[4px] top-1 h-2.5 w-2.5 rounded-full border border-black/20 bg-[#f5f3ee]" />

                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.34em] text-black/35">
                  Threshold Peaks Portal
                </p>

                <h3 className="text-3xl font-black leading-tight tracking-[-0.045em] md:text-5xl">
                  {activeTabMeta.title}
                </h3>

                <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-black/55">
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

            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-px bg-black/10 lg:block" />

              <div className="lg:pl-8">
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
      className={lineButtonWideClass}
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
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="border-l border-black/15 pl-6">
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.34em] text-black/35">
          About
        </p>

        <div className="max-w-xl space-y-6 text-base leading-8 text-black/65 md:text-lg md:leading-9">
          <p>
            Ich bin Matthias, in Stuttgart geboren und seit vielen Jahren in
            Verl zuhause. Bewegung, Ausdauer und Musik begleiten mich schon
            lange und sind ein fester Teil meines Lebens.
          </p>

          <p>
            Threshold Peaks verbindet Laufen, Radfahren, elektronische Musik und
            aktiven Lifestyle zu einem persönlichen Projekt.
          </p>
        </div>
      </div>

      <div className="divide-y divide-black/10 border-y border-black/10">
        {items.map((item) => (
          <article
            key={item.label}
            className="group grid gap-4 py-5 md:grid-cols-[150px_minmax(0,1fr)] md:items-start"
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-black/20 transition group-hover:bg-orange-500" />

              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/40">
                {item.label}
              </p>
            </div>

            <div>
              <h4 className="text-xl font-black leading-tight tracking-[-0.035em] transition group-hover:text-orange-600">
                {item.title}
              </h4>

              <p className="mt-2 text-sm font-semibold leading-7 text-black/55">
                {item.text}
              </p>
            </div>
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
    <div className="divide-y divide-black/10 border-y border-black/10">
      {items.map((post) => (
        <button
          key={post._id}
          type="button"
          onClick={() => onOpenPost(post)}
          className="group grid w-full gap-4 py-5 text-left text-[#111217] transition hover:bg-white/50 md:grid-cols-[170px_minmax(0,1fr)_auto] md:items-center md:px-3"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
              {formatHomeDate(post.publishedAt)}
            </p>

            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.22em] text-black/40">
              {formatJournalCategory(post.category)}
            </p>
          </div>

          <div>
            <h4 className="text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-600">
              {post.title}
            </h4>

            <p className="mt-2 max-w-3xl leading-7 text-black/55">
              {post.excerpt ||
                "Ein neuer Beitrag aus dem Threshold Peaks Journal."}
            </p>
          </div>

          <span className="hidden text-black/30 transition group-hover:translate-x-1 group-hover:text-orange-600 md:block">
            →
          </span>
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
  const hasExternalLinks = Boolean(post.stravaUrl || post.soundcloudUrl);
  const externalLinkLabel =
    [post.stravaUrl ? "Strava" : null, post.soundcloudUrl ? "SoundCloud" : null]
      .filter(Boolean)
      .join(" / ") || "Keine externen Links";

  return (
    <article className="text-neutral-950">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className={lineButtonClass}>
          ← Zurück zum Journal
        </button>

        {hasExternalLinks ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {post.stravaUrl ? (
              <Link
                href={post.stravaUrl}
                target="_blank"
                rel="noreferrer"
                className={lineButtonClass}
              >
                Strava öffnen
                <span>→</span>
              </Link>
            ) : null}

            {post.soundcloudUrl ? (
              <Link
                href={post.soundcloudUrl}
                target="_blank"
                rel="noreferrer"
                className={lineButtonClass}
              >
                SoundCloud öffnen
                <span>→</span>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10 grid gap-8 border-b border-black/10 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-end">
          <div>
            <div className="mb-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.25em] text-neutral-500">
              <span>{formatJournalCategory(post.category)}</span>
              <span>• {formatHomeDate(post.publishedAt)}</span>
            </div>

            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-neutral-950 md:text-6xl">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600">
                {post.excerpt}
              </p>
            ) : null}
          </div>

          {post.mainImage ? (
            <figure className="w-full overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/35 p-1 lg:justify-self-end">
              <SanityImage
                src={urlFor(post.mainImage)
                  .width(900)
                  .height(900)
                  .fit("crop")
                  .url()}
                alt={post.mainImage.alt || post.title || "Journal Bild"}
                width={900}
                height={900}
                priority
                className="aspect-[4/3] w-full rounded-[1.2rem] object-cover lg:aspect-[5/4]"
              />
            </figure>
          ) : null}
        </header>

        <section className="mb-12 border-b border-black/10">
          <div className="divide-y divide-black/10 md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
            <EventDetailFact
              label="Kategorie"
              value={formatJournalCategory(post.category)}
            />
            <EventDetailFact
              label="Datum"
              value={formatHomeDate(post.publishedAt)}
            />
            <EventDetailFact label="Links" value={externalLinkLabel} />
          </div>
        </section>

        <div className="max-w-3xl">
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
      <div className="border-y border-black/10 py-7">
        <h4 className="text-2xl font-black tracking-[-0.04em]">
          Noch keine Alben vorhanden.
        </h4>

        <p className="mt-4 max-w-xl leading-8 text-black/65">
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
    <div className="columns-1 gap-6 space-y-7 sm:columns-2 lg:columns-4">
      {albums.map((album, index) => {
        const image = album.coverImage || album.images?.[0];
        const imageCount = album.images?.length ?? 0;
        const imageRatioClass = ratioClasses[index % ratioClasses.length];

        return (
          <button
            key={album._id}
            type="button"
            onClick={() => onOpenAlbum(album)}
            className="group mb-7 block w-full break-inside-avoid text-left outline-none"
          >
            <div
              className={`relative overflow-hidden rounded-[1.45rem] bg-[#d7d5ce] ring-1 ring-black/10 transition duration-300 group-hover:-translate-y-0.5 group-hover:ring-black/20 ${imageRatioClass}`}
            >
              {image ? (
                <SanityImage
                  src={urlFor(image).width(900).height(1200).fit("crop").url()}
                  alt={image.alt || album.title}
                  width={900}
                  height={1200}
                  priority={index === 0}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                />
              ) : (
                <div className="flex h-full min-h-[320px] items-center justify-center p-6 text-center text-[10px] font-black uppercase tracking-[0.28em] text-black/45">
                  Kein Bild hinterlegt
                </div>
              )}
            </div>

            <div className="mt-3 border-b border-black/10 pb-4">
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
                <span>{formatGalleryCategory(album.category)}</span>

                {imageCount > 0 ? (
                  <>
                    <span className="h-1 w-1 rounded-full bg-black/25" />
                    <span>
                      {imageCount === 1 ? "1 Bild" : `${imageCount} Bilder`}
                    </span>
                  </>
                ) : null}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xl font-black leading-tight tracking-[-0.04em] text-black transition group-hover:text-orange-600">
                    {album.title}
                  </h4>

                  {album.description ? (
                    <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-black/55">
                      {album.description}
                    </p>
                  ) : null}
                </div>

                <span className="mt-1 text-lg leading-none text-black/30 transition group-hover:translate-x-1 group-hover:text-orange-600">
                  →
                </span>
              </div>
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
  const galleryImages =
    images.length > 0 ? images : coverImage ? [coverImage] : [];

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
        className={`${lineButtonClass} mb-10`}
      >
        ← Zurück zur Galerie
      </button>

      <header className="grid grid-cols-[minmax(0,1fr)_128px] items-start gap-x-4 gap-y-6 border-b border-black/10 pb-8 sm:grid-cols-[minmax(0,1fr)_160px] sm:gap-x-6 sm:gap-y-7 sm:pb-10 md:grid-cols-[minmax(0,1fr)_210px] lg:grid-cols-[minmax(0,1fr)_minmax(260px,380px)] lg:items-end lg:gap-8">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[8px] font-black uppercase tracking-[0.22em] text-black/35 sm:mb-4 sm:text-[10px] sm:tracking-[0.28em]">
            <span>{formatGalleryCategory(album.category)}</span>

            <span className="h-1 w-1 rounded-full bg-black/25" />

            <span>
              {galleryImages.length === 1
                ? "1 Bild"
                : `${galleryImages.length} Bilder`}
            </span>
          </div>

          <h1 className="max-w-4xl text-[2rem] font-black leading-[0.96] tracking-tight sm:text-4xl md:text-5xl lg:text-7xl">
            {album.title}
          </h1>

          {album.description ? (
            <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-neutral-600 sm:mt-5 sm:text-base sm:leading-7 md:text-lg md:leading-8 lg:mt-7 lg:text-xl lg:leading-9">
              {album.description}
            </p>
          ) : null}
        </div>

        {coverImage ? (
          <figure className="w-full justify-self-end lg:mx-0 lg:max-w-none lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[1.2rem] bg-[#ded9cf] ring-1 ring-black/10 sm:rounded-[1.5rem]">
              <SanityImage
                src={urlFor(coverImage)
                  .width(900)
                  .height(900)
                  .fit("crop")
                  .url()}
                alt={coverImage.alt || album.title}
                width={900}
                height={900}
                priority
                className="aspect-square w-full object-cover sm:aspect-[4/3] lg:aspect-[5/4]"
              />
            </div>

            {coverImage.caption ? (
              <figcaption className="mt-2 border-b border-black/10 pb-2 text-[10px] font-semibold leading-4 text-black/50 sm:mt-3 sm:pb-3 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
                {coverImage.caption}
              </figcaption>
            ) : null}
          </figure>
        ) : null}
      </header>

      <div className="mt-10">
        {galleryImages.length === 0 ? (
          <div className="border-y border-black/10 py-7">
            <p className="leading-8 text-black/65">
              In diesem Album sind noch keine Bilder hinterlegt.
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-5 space-y-6 sm:columns-2 lg:columns-3">
            {galleryImages.map((image, index) => {
              const imageRatioClass = ratioClasses[index % ratioClasses.length];

              return (
                <figure
                  key={`${album._id}-${index}`}
                  className="mb-6 break-inside-avoid"
                >
                  <div
                    className={`relative overflow-hidden rounded-[1.35rem] bg-black/5 ring-1 ring-black/10 transition duration-300 hover:-translate-y-0.5 hover:ring-black/20 ${imageRatioClass}`}
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
                      className="h-full w-full object-cover transition duration-700 hover:scale-[1.025]"
                    />
                  </div>

                  {image.caption || image.alt ? (
                    <figcaption className="mt-3 border-b border-black/10 pb-4">
                      <p className="text-sm font-semibold leading-6 text-black/60">
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
        className={`${lineButtonClass} mt-8`}
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
    <div className="divide-y divide-black/10 border-y border-black/10">
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
            className="group w-full py-5 text-left transition hover:bg-white/50 md:px-3"
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
    <div className="grid gap-4 md:grid-cols-[170px_minmax(0,1fr)_auto] md:items-center">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2 md:block md:space-y-2">
          <span className="inline-flex text-[10px] font-black uppercase tracking-[0.24em] text-black/40">
            {type}
          </span>

          <span className="inline-flex text-[10px] font-black uppercase tracking-[0.24em] text-black/40 md:block">
            {status}
          </span>
        </div>
      </div>

      <div>
        <h4 className="text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-600">
          {title}
        </h4>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em] text-black/40">
          <span>{date}</span>
          {time ? <span>{time}</span> : null}
          {location ? <span>{location}</span> : null}
        </div>

        <p className="mt-3 max-w-3xl leading-7 text-black/60">{text}</p>
      </div>

      {linked ? (
        <span className="hidden text-black/30 transition group-hover:translate-x-1 group-hover:text-orange-600 md:block">
          →
        </span>
      ) : null}
    </div>
  );
}

function EventDetailFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-5 md:px-6">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
        {label}
      </p>
      <p className="mt-2 text-sm font-black leading-6 text-black/75 md:text-base">
        {value}
      </p>
    </div>
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
      <div className="mb-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className={`${lineButtonClass} text-xs sm:text-sm`}
        >
          ← Zurück zu den Events
        </button>

        {event.externalUrl ? (
          <Link
            href={event.externalUrl}
            target="_blank"
            rel="noreferrer"
            className={`${lineButtonClass} text-right text-xs sm:text-sm`}
          >
            Zur Veranstaltungsseite
            <span>→</span>
          </Link>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10 grid gap-8 border-b border-black/10 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-end">
          <div>
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
          </div>

          {image ? (
            <figure className="w-full overflow-hidden rounded-[1.5rem] border border-black/10 bg-white/35 p-1 lg:justify-self-end">
              <SanityImage
                src={urlFor(image)
                  .width(900)
                  .height(900)
                  .fit("crop")
                  .url()}
                alt={image.alt || event.title || "Event Bild"}
                width={900}
                height={900}
                className="aspect-[4/3] w-full rounded-[1.2rem] object-cover lg:aspect-[5/4]"
              />
            </figure>
          ) : null}
        </header>

        <section className="mb-12 border-b border-black/10">
          <div className="divide-y divide-black/10 md:grid md:grid-cols-3 md:divide-x md:divide-y-0">
            <EventDetailFact
              label="Datum"
              value={formattedDate ?? "Noch offen"}
            />
            <EventDetailFact
              label="Zeit"
              value={
                event.time ||
                formatHomeEventTime(event.startDate) ||
                "Noch offen"
              }
            />
            <EventDetailFact
              label="Ort"
              value={event.location ?? "Noch offen"}
            />
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

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.25fr] lg:items-start">
      <div className="border-l border-black/15 pl-6 text-[#111217]">
        <p className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-black/40">
          Direktkontakt
        </p>

        <h4 className="max-w-xl text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
          Schreib mir, wenn du Fragen, Ideen oder Feedback hast.
        </h4>

        <p className="mt-5 max-w-xl leading-8 text-black/65">
          Ob Training, Events, Website, Musik oder einfach ein kurzer Austausch:
          Threshold Peaks lebt von Bewegung, Klang und guten Gedanken
          dazwischen.
        </p>

        <a
          href="mailto:info@threshold-peaks.de"
          className={`${lineButtonWideClass} mt-8 w-full sm:w-auto sm:min-w-[260px]`}
        >
          info@threshold-peaks.de
          <span>→</span>
        </a>
      </div>

      <div className="divide-y divide-black/10 border-y border-black/10">
        {links.map((item) => {
          const isExternal = item.href?.startsWith("http");

          const content = (
            <>
              <div className="md:w-[150px]">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/40">
                  {item.kicker}
                </p>
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-xl font-black leading-tight tracking-[-0.03em] transition group-hover:text-orange-600">
                  {item.title}
                </h4>

                <p className="mt-2 text-sm font-semibold leading-7 text-black/60">
                  {item.text}
                </p>

                <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-black/40 transition group-hover:text-orange-600">
                  {item.label}
                </p>
              </div>

              <span className="hidden text-black/30 transition group-hover:translate-x-1 group-hover:text-orange-600 md:block">
                {item.href ? "→" : "•"}
              </span>
            </>
          );

          if (!item.href) {
            return (
              <div
                key={item.title}
                className="group flex flex-col gap-4 py-5 md:flex-row md:items-center md:px-3"
              >
                {content}
              </div>
            );
          }

          return (
            <a
              key={item.title}
              href={item.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noreferrer" : undefined}
              className="group flex flex-col gap-4 py-5 transition hover:bg-white/50 md:flex-row md:items-center md:px-3"
            >
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}
