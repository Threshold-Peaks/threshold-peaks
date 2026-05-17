"use client";

import Link from "next/link";
import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Image as SanityImage } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";
import Comments from "@/components/Comments";
import LikeButton from "@/components/LikeButton";
import StravaStoryActivityCard, { type StravaStoryActivityManual } from "@/components/StravaStoryActivity";

type PortableTextBlock = any[];

type HomeJournalImage = SanityImageSource & {
  alt?: string;
  caption?: string;
};

type HomeJournalTag =
  | string
  | {
      title?: string;
      name?: string;
      label?: string;
      value?: string;
      current?: string;
      slug?: { current?: string };
    };

type StravaActivity = StravaStoryActivityManual;

type HomeGalleryTag = HomeJournalTag;
type HomeEventTag = HomeJournalTag;

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
  stravaActivity?: StravaActivity;
  soundcloudUrl?: string;
  location?: string;
  tags?: string | HomeJournalTag[];
  mainImage?: HomeJournalImage;
  linkedGalleryAlbums?: HomeGalleryAlbum[];
};

type HomeGalleryImage = SanityImageSource & {
  alt?: string;
  caption?: string;
  displayFormat?: ImageDisplayFormat | string;
};

type HomeGalleryAlbum = {
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  category?: string;
  date?: string;
  location?: string;
  description?: string;
  tags?: string | HomeGalleryTag[];
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
  tags?: string | HomeEventTag[];
  image?: HomeGalleryImage;
  body?: PortableTextBlock;
};

type PortalTab =
  | "about"
  | "journal"
  | "gallery"
  | "events"
  | "live"
  | "contact";
type PortalContentTab = Exclude<PortalTab, "about" | "live" | "contact">;

type ImageDisplayFormat =
  | "auto"
  | "portrait"
  | "tall"
  | "square"
  | "landscape"
  | "wide";

type HomePortalProps = {
  latestPosts: HomeJournalPost[];
  allPosts: HomeJournalPost[];
  latestAlbums: HomeGalleryAlbum[];
  allAlbums: HomeGalleryAlbum[];
  latestEvents: HomeEvent[];
  allEvents: HomeEvent[];
  liveSetsIsOnline?: boolean;
  embedded?: boolean;
};

const lineButtonClass =
  "inline-flex items-center gap-2 whitespace-nowrap border-b border-black/20 pb-2 text-sm font-black text-black/55 transition hover:border-orange-500 hover:text-orange-600";

const detailActionButtonClass = `${lineButtonClass} text-xs sm:text-sm`;


function LiveStatusDot({
  isOnline,
  className = "",
}: {
  isOnline: boolean;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex h-2 w-2 shrink-0 rounded-full ring-1 ring-black/10",
        isOnline
          ? "bg-emerald-500/85 shadow-[0_0_8px_rgba(16,185,129,0.42)]"
          : "bg-red-500/75 shadow-[0_0_8px_rgba(239,68,68,0.32)]",
        className,
      ].join(" ")}
      aria-label={isOnline ? "Live Sets online" : "Live Sets offline"}
      title={isOnline ? "Online" : "Offline"}
    />
  );
}

const lineButtonWideClass =
  "inline-flex min-w-[220px] items-center justify-between gap-4 border-b border-black/20 pb-2 text-sm font-black text-black/55 transition hover:border-orange-500 hover:text-orange-600";

const tabs: Array<{
  id: PortalTab;
  title: string;
  text: string;
}> = [
  {
  id: "about",
  title: "Threshold Peaks",
  text: "Ausdauer, elektronische Musik und aktiver Lifestyle.",
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
    id: "live",
    title: "Live Sets",
    text: "Elektronische Musik live aus dem Studio.",
  },
  {
    id: "contact",
    title: "Kontakt",
    text: "Kanäle und Verbindungspunkte.",
  },
];

const imageDisplayFormatConfigs = {
  portrait: { className: "aspect-[4/5]", width: 1000, height: 1250 },
  tall: { className: "aspect-[2/3]", width: 900, height: 1350 },
  square: { className: "aspect-square", width: 1000, height: 1000 },
  landscape: { className: "aspect-[5/4]", width: 1250, height: 1000 },
  wide: { className: "aspect-[4/3]", width: 1200, height: 900 },
} as const;

const galleryAutoRatioConfigs = [
  imageDisplayFormatConfigs.portrait,
  { className: "aspect-[3/4]", width: 900, height: 1200 },
  imageDisplayFormatConfigs.landscape,
  imageDisplayFormatConfigs.wide,
  imageDisplayFormatConfigs.tall,
] as const;

const galleryDefaultCoverRatioConfig = {
  className: "aspect-[4/5]",
  width: 900,
  height: 1125,
} as const;

const albumCoverRatioConfig = {
  className: "aspect-[4/5]",
  width: 1000,
  height: 1250,
} as const;

function getDisplayFormatRatioConfig(displayFormat?: string | null) {
  if (!displayFormat || displayFormat === "auto") return null;

  return (
    imageDisplayFormatConfigs[
      displayFormat as keyof typeof imageDisplayFormatConfigs
    ] ?? null
  );
}

function getGalleryAutoRatioConfig(index: number) {
  return galleryAutoRatioConfigs[index % galleryAutoRatioConfigs.length];
}

function getGalleryCoverRatioConfig(displayFormat?: string | null) {
  return (
    getDisplayFormatRatioConfig(displayFormat) ?? galleryDefaultCoverRatioConfig
  );
}

function getGalleryDetailImageRatioConfig(
  index: number,
  displayFormat?: string | null,
) {
  const selectedRatioConfig = getDisplayFormatRatioConfig(displayFormat);

  if (selectedRatioConfig) return selectedRatioConfig;

  if (index === 1 || index === 2) {
    return imageDisplayFormatConfigs.portrait;
  }

  return getGalleryAutoRatioConfig(index);
}

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
      <blockquote className="mt-8 rounded-sm border-l-4 border-orange-500 bg-[#efe8dc] px-6 py-5 text-lg font-semibold leading-8 text-black/75">
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
          rel={isExternal ? "noopener noreferrer" : undefined}
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
          rel="noopener noreferrer"
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
    story: "Story",
    lifestyle: "Lifestyle",
    gear: "Gear",
    event: "Event Recap",
    laufen: "Running",
    radfahren: "Cycling",
    musik: "Music",
  };

  return category ? (categories[category] ?? category) : "Journal";
}

function getJournalTagLabel(tag: HomeJournalTag) {
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

function getJournalTags(tags?: string | HomeJournalTag[]) {
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
    new Set(tags.map((tag) => getJournalTagLabel(tag)).filter(Boolean)),
  );
}

function getGalleryTags(tags?: string | HomeGalleryTag[]) {
  return getJournalTags(tags);
}

function getEventTags(tags?: string | HomeEventTag[]) {
  return getJournalTags(tags);
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

function createTagsParam(tags: string[]) {
  return tags
    .map((tag) => tag.replace(/^#/, "").trim())
    .filter(Boolean)
    .join(",");
}

function isSameTag(firstTag: string, secondTag: string) {
  return firstTag.toLowerCase() === secondTag.toLowerCase();
}

function isTagSelected(selectedTags: string[], tag: string) {
  return selectedTags.some((selectedTag) => isSameTag(selectedTag, tag));
}

function toggleTagValue(selectedTags: string[], tag: string) {
  if (isTagSelected(selectedTags, tag)) {
    return selectedTags.filter((selectedTag) => !isSameTag(selectedTag, tag));
  }

  return [...selectedTags, tag];
}

function hasAnySelectedTag(itemTags: string[], selectedTags: string[]) {
  if (selectedTags.length === 0) return true;

  return selectedTags.some((selectedTag) =>
    itemTags.some((itemTag) => isSameTag(itemTag, selectedTag)),
  );
}

function getAllJournalTags(posts: HomeJournalPost[]) {
  return Array.from(
    new Set(posts.flatMap((post) => getJournalTags(post.tags))),
  ).sort((firstTag, secondTag) => firstTag.localeCompare(secondTag, "de"));
}

function getAllGalleryTags(albums: HomeGalleryAlbum[]) {
  return Array.from(
    new Set(albums.flatMap((album) => getGalleryTags(album.tags))),
  ).sort((firstTag, secondTag) => firstTag.localeCompare(secondTag, "de"));
}

function getAllEventTags(events: HomeEvent[]) {
  return Array.from(
    new Set(events.flatMap((event) => getEventTags(event.tags))),
  ).sort((firstTag, secondTag) => firstTag.localeCompare(secondTag, "de"));
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

function formatGalleryDate(date?: string) {
  if (!date) return null;

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
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
  liveSetsIsOnline = false,
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
  const [selectedJournalTags, setSelectedJournalTags] = useState<string[]>([]);
  const [selectedGalleryTags, setSelectedGalleryTags] = useState<string[]>([]);
  const [selectedEventTags, setSelectedEventTags] = useState<string[]>([]);
  const [showAllContent, setShowAllContent] = useState<
    Record<PortalContentTab, boolean>
  >({
    journal: false,
    gallery: false,
    events: false,
  });
  const [isPortalSwitching, setIsPortalSwitching] = useState(false);
  const portalNavigationDelayRef = useRef<number | null>(null);
  const portalTransitionRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const links = document.querySelectorAll<HTMLElement>("[data-portal-nav-link]");

    links.forEach((link) => {
      const linkTab = link.dataset.portalNavLink;
      const isActive = linkTab === activeTab;

      if (isActive) {
        link.dataset.active = "true";
        link.setAttribute("aria-current", "page");
      } else {
        link.dataset.active = "false";
        link.removeAttribute("aria-current");
      }
    });
  }, [activeTab]);

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

  function clearPortalTransitionTimers() {
    if (typeof window === "undefined") return;

    if (portalNavigationDelayRef.current) {
      window.clearTimeout(portalNavigationDelayRef.current);
      portalNavigationDelayRef.current = null;
    }

    if (portalTransitionRef.current) {
      window.clearTimeout(portalTransitionRef.current);
      portalTransitionRef.current = null;
    }
  }

  function scrollToPageTop() {
    if (typeof window === "undefined") return;

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }

  function replacePortalHash(tab: PortalContentTab) {
    if (typeof window === "undefined") return;

    const query = window.location.search;
    window.history.replaceState(null, "", `${query || "/"}#portal-${tab}`);
  }

  function runPortalFadeTransition(
    action: () => void,
    options: { scrollTop?: boolean } = {},
  ) {
    const { scrollTop = true } = options;

    if (typeof window === "undefined") {
      action();
      return;
    }

    clearPortalTransitionTimers();

    if (scrollTop) {
      scrollToPageTop();
    }

    setIsPortalSwitching(true);

    portalNavigationDelayRef.current = window.setTimeout(() => {
      action();

      portalTransitionRef.current = window.setTimeout(() => {
        setIsPortalSwitching(false);
      }, 40);
    }, 110);
  }

  function toggleShowAllContent(tab: PortalContentTab) {
    runPortalFadeTransition(() => {
      clearPortalDetails();

      setShowAllContent((current) => ({
        ...current,
        [tab]: !current[tab],
      }));
    });
  }

  function openJournalPost(post: HomeJournalPost) {
    runPortalFadeTransition(() => {
      setSelectedPost(post);
    });
  }

  function closeJournalPost() {
    runPortalFadeTransition(() => {
      setSelectedPost(null);
      replacePortalHash("journal");
    });
  }

  function openGalleryAlbum(album: HomeGalleryAlbum) {
    runPortalFadeTransition(() => {
      setSelectedAlbum(album);
    });
  }

  function closeGalleryAlbum() {
    runPortalFadeTransition(() => {
      setSelectedAlbum(null);
      replacePortalHash("gallery");
    });
  }

  function openEvent(event: HomeEvent) {
    runPortalFadeTransition(() => {
      setSelectedEvent(event);
    });
  }

  function closeEvent() {
    runPortalFadeTransition(() => {
      setSelectedEvent(null);
      replacePortalHash("events");
    });
  }

  function openLinkedGalleryAlbum(album: HomeGalleryAlbum) {
    runPortalFadeTransition(() => {
      setActiveTab("gallery");
      setSelectedPost(null);
      setSelectedEvent(null);
      setSelectedAlbum(album);
      setShowAllContent((current) => ({ ...current, gallery: true }));

      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "/#portal-gallery");
      }
    });
  }

  function syncPortalTagsToUrl(
    tab: "journal" | "gallery" | "events",
    tags: string[],
  ) {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tagKey =
      tab === "gallery"
        ? "galleryTags"
        : tab === "events"
          ? "eventTags"
          : "tags";
    const legacyTagKey =
      tab === "gallery" ? "galleryTag" : tab === "events" ? "eventTag" : "tag";
    const nextTags = createTagsParam(tags);

    params.delete(legacyTagKey);

    if (nextTags) {
      params.set(tagKey, nextTags);
    } else {
      params.delete(tagKey);
    }

    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${query ? `/?${query}` : "/"}#portal-${tab}`,
    );
  }

  function toggleJournalTagFilter(tag: string) {
    clearPortalDetails();
    setActiveTab("journal");
    setShowAllContent((current) => ({ ...current, journal: true }));

    const nextTags = toggleTagValue(selectedJournalTags, tag);
    setSelectedJournalTags(nextTags);
    syncPortalTagsToUrl("journal", nextTags);
  }

  function resetJournalTagFilter() {
    setSelectedJournalTags([]);
    syncPortalTagsToUrl("journal", []);
  }

  function toggleGalleryTagFilter(tag: string) {
    clearPortalDetails();
    setActiveTab("gallery");
    setShowAllContent((current) => ({ ...current, gallery: true }));

    const nextTags = toggleTagValue(selectedGalleryTags, tag);
    setSelectedGalleryTags(nextTags);
    syncPortalTagsToUrl("gallery", nextTags);
  }

  function resetGalleryTagFilter() {
    setSelectedGalleryTags([]);
    syncPortalTagsToUrl("gallery", []);
  }

  function toggleEventTagFilter(tag: string) {
    clearPortalDetails();
    setActiveTab("events");
    setShowAllContent((current) => ({ ...current, events: true }));

    const nextTags = toggleTagValue(selectedEventTags, tag);
    setSelectedEventTags(nextTags);
    syncPortalTagsToUrl("events", nextTags);
  }

  function resetEventTagFilter() {
    setSelectedEventTags([]);
    syncPortalTagsToUrl("events", []);
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
        live: "live",
        twitch: "live",
        "live-sets": "live",
        livesets: "live",
        kontakt: "contact",
        contact: "contact",
      };

      return hashMap[rawHash];
    }

    function applyPortalTabFromHash() {
      const nextTab = getTabIdFromHash();

      if (!nextTab) return;

      const params = new URLSearchParams(window.location.search);

      setActiveTab(nextTab);
      clearPortalDetails();
      resetShowAllContent();

      if (nextTab === "journal") {
        setSelectedJournalTags(
          getTagsFromSearchParam(params.get("tags") || params.get("tag")),
        );
      }

      if (nextTab === "gallery") {
        setSelectedGalleryTags(
          getTagsFromSearchParam(
            params.get("galleryTags") || params.get("galleryTag"),
          ),
        );
      }

      if (nextTab === "events") {
        setSelectedEventTags(
          getTagsFromSearchParam(
            params.get("eventTags") || params.get("eventTag"),
          ),
        );
      }
    }

    function updateFromHash() {
      const nextTab = getTabIdFromHash();

      if (!nextTab) return;

      runPortalFadeTransition(() => {
        applyPortalTabFromHash();
      });
    }

    function handlePortalNavigationClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest(
        'a[href="#top"], a[href^="#portal-"], a[href^="/#portal-"]',
      ) as HTMLAnchorElement | null;

      if (!link) return;

      const url = new URL(link.href, window.location.href);

      if (url.hash === "#top") {
        event.preventDefault();
        window.history.pushState(null, "", "#top");
        scrollToPageTop();
        return;
      }

      if (!url.hash.startsWith("#portal-")) return;

      event.preventDefault();
      window.history.pushState(
        null,
        "",
        `${url.pathname}${url.search}${url.hash}`,
      );
      updateFromHash();
    }

    updateFromHash();

    document.addEventListener("click", handlePortalNavigationClick);
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      clearPortalTransitionTimers();

      document.removeEventListener("click", handlePortalNavigationClick);
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, []);

  const activeTabMeta = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  const journalTagSource = allPosts.length > 0 ? allPosts : latestPosts;
  const galleryTagSource = allAlbums.length > 0 ? allAlbums : latestAlbums;
  const eventTagSource = allEvents.length > 0 ? allEvents : latestEvents;

  const allJournalTags = getAllJournalTags(journalTagSource);
  const allGalleryTags = getAllGalleryTags(galleryTagSource);
  const allEventTags = getAllEventTags(eventTagSource);

  const visiblePostSource =
    selectedJournalTags.length > 0 || showAllContent.journal
      ? journalTagSource
      : latestPosts;

  const visiblePosts =
    selectedJournalTags.length > 0
      ? visiblePostSource.filter((post) =>
          hasAnySelectedTag(getJournalTags(post.tags), selectedJournalTags),
        )
      : visiblePostSource;

  const visibleAlbumSource =
    selectedGalleryTags.length > 0 || showAllContent.gallery
      ? galleryTagSource
      : latestAlbums;

  const visibleAlbums =
    selectedGalleryTags.length > 0
      ? visibleAlbumSource.filter((album) =>
          hasAnySelectedTag(getGalleryTags(album.tags), selectedGalleryTags),
        )
      : visibleAlbumSource;

  const visibleEventSource =
    selectedEventTags.length > 0 || showAllContent.events
      ? eventTagSource
      : latestEvents;

  const visibleEvents =
    selectedEventTags.length > 0
      ? visibleEventSource.filter((event) =>
          hasAnySelectedTag(getEventTags(event.tags), selectedEventTags),
        )
      : visibleEventSource;

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
        id="portal-live"
        className="absolute -top-28 h-px w-px overflow-hidden"
        aria-hidden="true"
      />
      <span
        id="portal-contact"
        className="absolute -top-28 h-px w-px overflow-hidden"
        aria-hidden="true"
      />

      <div className={embedded ? "w-full" : "mx-auto max-w-[1280px]"}>
        <div className="portal-card-in overflow-hidden rounded-t-md border-x border-t border-black/15 bg-[#f5f3ee] shadow-none">
          <div
            className={
              embedded
                ? "flex min-h-[460px] flex-col p-5 md:min-h-[clamp(430px,58svh,560px)] md:p-7 lg:min-h-[clamp(460px,60svh,640px)] lg:p-9"
                : "flex min-h-[720px] flex-col p-6 md:min-h-[760px] md:p-8 lg:min-h-[780px] lg:p-10"
            }
          >
            <div
              className={`mb-8 flex flex-col gap-5 border-b border-black/15 pb-7 transition-opacity duration-300 ease-out md:flex-row md:items-end md:justify-between ${
                isPortalSwitching ? "opacity-60" : "opacity-100"
              }`}
            >
              <div className="relative pl-6">
                <span className="absolute left-0 top-1 h-full w-px bg-black/20" />
                <span className="absolute -left-[4px] top-1 h-2.5 w-2.5 border border-black/25 bg-[#f5f3ee]" />

                <h3 className="inline-flex items-center gap-3 text-3xl font-black leading-tight tracking-[-0.045em] md:text-5xl">
                  <span>{activeTabMeta.title}</span>
                  {activeTab === "live" ? (
                    <LiveStatusDot isOnline={liveSetsIsOnline} className="mt-1" />
                  ) : null}
                </h3>

                <p className="mt-3 max-w-xl text-sm font-semibold leading-7 text-black/55">
                  {activeTabMeta.text}
                </p>
              </div>


            </div>

            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-px bg-black/15 lg:block" />

              <div
                className={`min-h-[520px] transition-all duration-300 ease-out [overflow-anchor:none] md:min-h-[clamp(360px,42svh,560px)] lg:min-h-[clamp(380px,44svh,600px)] lg:pl-8 ${
                  isPortalSwitching
                    ? "translate-y-2 opacity-0"
                    : "translate-y-0 opacity-100"
                }`}
              >
                {activeTab === "about" ? <AboutPanel /> : null}

                {activeTab === "journal" ? (
                  selectedPost ? (
                    <JournalPortalDetail
                      post={selectedPost}
                      selectedTags={selectedJournalTags}
                      onToggleTag={toggleJournalTagFilter}
                      onBack={closeJournalPost}
                      onOpenLinkedGalleryAlbum={openLinkedGalleryAlbum}
                    />
                  ) : (
                    <JournalPanel
                      posts={visiblePosts}
                      allTags={allJournalTags}
                      selectedTags={selectedJournalTags}
                      showAll={showAllContent.journal}
                      onToggleShowAll={() => toggleShowAllContent("journal")}
                      onToggleTag={toggleJournalTagFilter}
                      onResetTags={resetJournalTagFilter}
                      onOpenPost={openJournalPost}
                    />
                  )
                ) : null}

                {activeTab === "gallery" ? (
                  selectedAlbum ? (
                    <GalleryAlbumPortalDetail
                      album={selectedAlbum}
                      selectedTags={selectedGalleryTags}
                      onToggleTag={toggleGalleryTagFilter}
                      onBack={closeGalleryAlbum}
                    />
                  ) : (
                    <GalleryPanel
                      albums={visibleAlbums}
                      allTags={allGalleryTags}
                      selectedTags={selectedGalleryTags}
                      showAll={showAllContent.gallery}
                      onToggleShowAll={() => toggleShowAllContent("gallery")}
                      onToggleTag={toggleGalleryTagFilter}
                      onResetTags={resetGalleryTagFilter}
                      onOpenAlbum={openGalleryAlbum}
                    />
                  )
                ) : null}

                {activeTab === "events" ? (
                  selectedEvent ? (
                    <EventPortalDetail
                      event={selectedEvent}
                      selectedTags={selectedEventTags}
                      onToggleTag={toggleEventTagFilter}
                      onBack={closeEvent}
                    />
                  ) : (
                    <EventsPanel
                      events={visibleEvents}
                      allTags={allEventTags}
                      selectedTags={selectedEventTags}
                      showAll={showAllContent.events}
                      onToggleShowAll={() => toggleShowAllContent("events")}
                      onToggleTag={toggleEventTagFilter}
                      onResetTags={resetEventTagFilter}
                      onOpenEvent={openEvent}
                    />
                  )
                ) : null}

                {activeTab === "live" ? (
                  <LiveSetsPanel isOnline={liveSetsIsOnline} />
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
  if (
    activeTab === "about" ||
    activeTab === "live" ||
    activeTab === "contact"
  ) {
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


function PortalBottomAction({
  showAll,
  showAllLabel,
  showLessLabel,
  onToggle,
}: {
  showAll: boolean;
  showAllLabel: string;
  showLessLabel: string;
  onToggle: () => void;
}) {
  return (
    <div className="mt-7 flex justify-start border-t border-black/10 pt-5">
      <button
        type="button"
        onClick={onToggle}
        className={lineButtonWideClass}
      >
        {showAll ? showLessLabel : showAllLabel}
        <span>{showAll ? "↑" : "→"}</span>
      </button>
    </div>
  );
}

function AboutPanel() {
  const items = [
    {
      label: "Endurance",
      title: "Ausdauer im Fokus",
      text: "Laufen, Radfahren, Training und Wettkämpfe.",
    },
    {
      label: "Sound",
      title: "Beats und Energie",
      text: "Elektronische Musik, Sets, Tracks und Energie.",
    },
    {
      label: "Lifestyle",
      title: "Draußen unterwegs",
      text: "Draußen sein, den Alltag bewegen und neue Orte entdecken.",
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="pl-6">
        <p className="mb-4 text-[10px] font-black uppercase tracking-[0.34em] text-black/35">
          About
        </p>

        <div className="max-w-xl space-y-6 text-base leading-8 text-black/65 md:text-lg md:leading-9">
          <p>
            Threshold Peaks verbindet Ausdauer, elektronische Musik und einen
            aktiven Lifestyle.
          </p>

          <p>
            Hier geht es um Läufe, Rides, Wettkämpfe, Musik, Trainingstage,
            Momente draußen und alles, was zwischen Puls, Bass, Alltag und frei
            bewegten Gedanken passiert.
          </p>

          <p>
            Es muss nicht alles perfekt sein. Es geht um echte Momente, gute
            Bewegung, Musik im Kopf und das Gefühl, noch ein bisschen
            weiterzukommen.
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

function PortalTagFilter({
  label,
  tags,
  selectedTags,
  onToggleTag,
  onResetTags,
}: {
  label: string;
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onResetTags: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (tags.length === 0) return null;

  const hasActiveTags = selectedTags.length > 0;
  const activeTags = tags.filter((tag) => isTagSelected(selectedTags, tag));

  return (
    <section className="mt-8 border-t border-black/10 pt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="group flex items-center gap-3 text-left"
          aria-expanded={isOpen}
        >
          <span className="h-px w-7 bg-black/20 transition group-hover:bg-orange-500" />

          <span>
            <span className="block text-[10px] font-black uppercase tracking-[0.32em] text-black/35 transition group-hover:text-orange-600">
              {label}-Hashtags
            </span>
            <span className="mt-1 block text-[11px] font-bold text-black/40">
              {hasActiveTags
                ? `${selectedTags.length} aktiv · ${isOpen ? "Auswahl schließen" : "Alle Hashtags anzeigen"}`
                : isOpen
                  ? "Auswahl schließen"
                  : "Alle Hashtags anzeigen"}
            </span>
          </span>
        </button>

        {hasActiveTags ? (
          <button
            type="button"
            onClick={onResetTags}
            className="border-b border-transparent pb-1 text-left text-[10px] font-black uppercase tracking-[0.24em] text-black/35 transition hover:border-orange-500/50 hover:text-orange-600 sm:text-right"
          >
            Zurücksetzen
          </button>
        ) : null}
      </div>

      {hasActiveTags ? (
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
          {activeTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className="border-b border-orange-500/60 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 transition hover:border-orange-600 hover:text-orange-700"
              title="Tag entfernen"
            >
              #{tag}
            </button>
          ))}
        </div>
      ) : null}

      {isOpen ? (
        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-3 border-t border-black/5 pt-5">
          {tags.map((tag) => {
            const active = isTagSelected(selectedTags, tag);

            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                className={
                  active
                    ? "border-b border-orange-500 pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-600 transition hover:border-orange-600 hover:text-orange-700"
                    : "border-b border-transparent pb-1 text-[10px] font-black uppercase tracking-[0.18em] text-black/35 transition hover:border-orange-500/50 hover:text-orange-600"
                }
              >
                #{tag}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function JournalPanel({
  posts,
  allTags,
  selectedTags,
  showAll,
  onToggleShowAll,
  onToggleTag,
  onResetTags,
  onOpenPost,
}: {
  posts: HomeJournalPost[];
  allTags: string[];
  selectedTags: string[];
  showAll: boolean;
  onToggleShowAll: () => void;
  onToggleTag: (tag: string) => void;
  onResetTags: () => void;
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

  const items =
    posts.length > 0 ? posts : selectedTags.length > 0 ? [] : fallbackPosts;

  return (
    <div>
      {items.length === 0 ? (
        <div className="border-y border-black/10 py-7">
          <h4 className="text-2xl font-black tracking-[-0.04em]">
            Keine Beiträge zu diesem Hashtag.
          </h4>

          <p className="mt-4 max-w-xl leading-8 text-black/65">
            Der Filter ist gerade etwas zu eng geschnürt. Setz ihn zurück oder
            wähle einen anderen Hashtag.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-black/10 border-y border-black/10">
          {items.map((post) => {
            const tags = getJournalTags(post.tags);

            return (
              <article
                key={post._id}
                className="group grid w-full gap-4 py-5 text-left text-[#111217] transition hover:bg-black/[0.025] md:grid-cols-[170px_minmax(0,1fr)_auto] md:items-center md:px-3"
              >
                <button
                  type="button"
                  onClick={() => onOpenPost(post)}
                  className="contents text-left"
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

                {tags.length > 0 ? (
                  <div className="md:col-start-2 md:-mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onToggleTag(tag)}
                        className={
                          isTagSelected(selectedTags, tag)
                            ? "px-1 text-[10px] font-bold tracking-[0.04em] text-orange-600"
                            : "px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
                        }
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <PortalBottomAction
        showAll={showAll}
        showAllLabel="Weitere Beiträge anzeigen"
        showLessLabel="Weniger Beiträge anzeigen"
        onToggle={onToggleShowAll}
      />

      <PortalTagFilter
        label="Journal"
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={onToggleTag}
        onResetTags={onResetTags}
      />
    </div>
  );
}

function JournalPortalDetail({
  post,
  selectedTags,
  onToggleTag,
  onBack,
  onOpenLinkedGalleryAlbum,
}: {
  post: HomeJournalPost;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onBack: () => void;
  onOpenLinkedGalleryAlbum: (album: HomeGalleryAlbum) => void;
}) {
  const hasExternalLinks = Boolean(post.stravaUrl || post.soundcloudUrl);
  const hasTopExternalLinks = Boolean(post.soundcloudUrl);
  const externalLinksValue = hasExternalLinks ? (
    <JournalMetaLinks
      stravaUrl={post.stravaUrl}
      soundcloudUrl={post.soundcloudUrl}
    />
  ) : (
    "Keine externen Links"
  );
  const tags = getJournalTags(post.tags);
  const linkedGalleryAlbums = post.linkedGalleryAlbums ?? [];
  const commentTargetSlug = post.slug?.current || post._id;
  const journalFacts = [
    {
      label: "Kategorie",
      value: formatJournalCategory(post.category),
    },
    {
      label: "Datum",
      value: formatHomeDate(post.publishedAt),
    },
    ...(post.location
      ? [
          {
            label: "Ort / Strecke",
            value: post.location,
          },
        ]
      : []),
    {
      label: "Links",
      value: externalLinksValue,
    },
  ];

  return (
    <article className="text-neutral-950">
      <div className="mb-10 flex flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className={detailActionButtonClass}
        >
          <span className="sm:hidden">← Journal</span>
          <span className="hidden sm:inline">← Zurück zum Journal</span>
        </button>

        {hasTopExternalLinks ? (
          <div className="flex flex-row items-center justify-end gap-4">
            {post.soundcloudUrl ? (
              <Link
                href={post.soundcloudUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={detailActionButtonClass}
              >
                <span className="sm:hidden">Sound</span>
                <span className="hidden sm:inline">SoundCloud öffnen</span>
                <span>→</span>
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-10 grid gap-8 border-b border-black/10 pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)] lg:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-black uppercase tracking-[0.25em] text-black/40">
              <span>{formatJournalCategory(post.category)}</span>
              <span className="h-1 w-1 rounded-full bg-black/25" />
              <span>{formatHomeDate(post.publishedAt)}</span>
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
              <div className="relative mx-auto aspect-[1.28/1] w-full max-w-[380px] overflow-hidden rounded-md bg-transparent ring-1 ring-black/10 lg:mx-0">
                <SanityImage
                  src={urlFor(post.mainImage).width(900).fit("max").url()}
                  alt={post.mainImage.alt || post.title || "Journal Bild"}
                  fill
                  priority
                  sizes="(min-width: 1024px) 380px, 100vw"
                  className="object-cover"
                  style={{ objectPosition: "center 24%" }}
                />
              </div>

              {post.mainImage.caption ? (
                <figcaption className="mx-auto mt-3 max-w-[380px] border-b border-black/10 pb-3 text-sm font-semibold leading-6 text-black/50 lg:mx-0">
                  {post.mainImage.caption}
                </figcaption>
              ) : null}
            </figure>
          ) : null}
        </header>

        <section className="mb-12 border-b border-black/10">
          <div className="divide-y divide-black/10 md:grid md:grid-cols-[repeat(auto-fit,minmax(160px,1fr))] md:divide-x md:divide-y-0">
            {journalFacts.map((fact) => (
              <EventDetailFact
                key={fact.label}
                label={fact.label}
                value={fact.value}
              />
            ))}

            <div className="py-4 md:px-5 md:first:pl-0">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/30">
                Gefällt mir
              </p>

              <div className="mt-2 flex items-center">
                <LikeButton
                  targetType="journal"
                  targetId={commentTargetSlug}
                  className="tracking-[0.18em]"
                />
              </div>
            </div>
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

          <StoryConnectionsSection
            albums={linkedGalleryAlbums}
            stravaUrl={post.stravaUrl}
            stravaActivity={post.stravaActivity}
            onOpenAlbum={onOpenLinkedGalleryAlbum}
          />

          {tags.length > 0 ? (
            <section className="mt-12 border-t border-black/10 pt-6">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
                Hashtags
              </p>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      onToggleTag(tag);
                      onBack();
                    }}
                    className={
                      isTagSelected(selectedTags, tag)
                        ? "px-1 text-[10px] font-bold tracking-[0.04em] text-orange-600"
                        : "px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
                    }
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <Comments
          targetType="journal"
          targetSlug={commentTargetSlug}
          targetTitle={post.title}
          footerAction={
            <button
              type="button"
              onClick={onBack}
              className={detailActionButtonClass}
            >
              <span className="sm:hidden">← Journal</span>
              <span className="hidden sm:inline">← Zurück zum Journal</span>
            </button>
          }
        />
      </div>
    </article>
  );
}

function JournalMetaLinks({
  stravaUrl,
  soundcloudUrl,
}: {
  stravaUrl?: string;
  soundcloudUrl?: string;
}) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      {stravaUrl ? (
        <Link
          href={stravaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-black/75 transition hover:text-orange-600"
        >
          <span>Strava</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}

      {soundcloudUrl ? (
        <Link
          href={soundcloudUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-black/75 transition hover:text-orange-600"
        >
          <span>SoundCloud</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : null}
    </span>
  );
}

function StoryConnectionsSection({
  albums,
  stravaUrl,
  stravaActivity,
  onOpenAlbum,
}: {
  albums?: HomeGalleryAlbum[];
  stravaUrl?: string;
  stravaActivity?: StravaActivity;
  onOpenAlbum: (album: HomeGalleryAlbum) => void;
}) {
  const visibleAlbums = (albums ?? []).filter((album) => album?._id);
  const hasAlbums = visibleAlbums.length > 0;
  const hasStrava = Boolean(
    stravaActivity?.title ||
      stravaActivity?.distance ||
      stravaActivity?.duration ||
      stravaActivity?.elevation ||
      stravaActivity?.mapImage ||
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
          <div className="w-full max-w-[380px]">
            <StravaStoryActivityCard
              stravaUrl={stravaUrl}
              fallbackActivity={stravaActivity}
            />
          </div>
        ) : null}

        {hasAlbums ? (
          <LinkedGalleryAlbumsCard
            albums={visibleAlbums}
            onOpenAlbum={onOpenAlbum}
          />
        ) : null}
      </div>
    </section>
  );
}

function LinkedGalleryAlbumsCard({
  albums,
  onOpenAlbum,
}: {
  albums: HomeGalleryAlbum[];
  onOpenAlbum: (album: HomeGalleryAlbum) => void;
}) {
  return (
    <aside className="border-t border-black/10 pt-5">
      <div className="mb-5 border-b border-black/10 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/35">
          Galerie dazu
        </p>
        <h3 className="mt-2 text-lg font-black leading-tight tracking-[-0.04em] text-black md:text-xl">
          Bilder zur Story
        </h3>
      </div>

      <div className="divide-y divide-black/10 border-y border-black/10">
        {albums.map((album, index) => {
          const image = album.coverImage || album.images?.[0];
          const imageCount = album.images?.length ?? 0;

          return (
            <button
              key={album._id}
              type="button"
              onClick={() => onOpenAlbum(album)}
              className="group grid w-full gap-4 py-4 text-left transition hover:bg-black/[0.025] sm:grid-cols-[86px_minmax(0,1fr)] sm:items-center sm:px-2"
            >
              <div className="relative aspect-square overflow-hidden rounded-md bg-black/5 ring-1 ring-black/10">
                {image ? (
                  <SanityImage
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
                      <span>
                        {imageCount === 1 ? "1 Bild" : `${imageCount} Bilder`}
                      </span>
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

                <p className="mt-3 inline-flex items-center gap-2 border-b border-black/15 pb-1 text-[10px] font-black uppercase tracking-[0.22em] text-black/40 transition group-hover:border-orange-500 group-hover:text-orange-600">
                  Album öffnen <span>→</span>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function GalleryPanel({
  albums,
  allTags,
  selectedTags,
  showAll,
  onToggleShowAll,
  onToggleTag,
  onResetTags,
  onOpenAlbum,
}: {
  albums: HomeGalleryAlbum[];
  allTags: string[];
  selectedTags: string[];
  showAll: boolean;
  onToggleShowAll: () => void;
  onToggleTag: (tag: string) => void;
  onResetTags: () => void;
  onOpenAlbum: (album: HomeGalleryAlbum) => void;
}) {
  return (
    <div>
      {albums.length === 0 ? (
        <div className="border-y border-black/10 py-7">
          <h4 className="text-2xl font-black tracking-[-0.04em]">
            {selectedTags.length > 0
              ? "Keine Alben zu dieser Auswahl."
              : "Noch keine Galerie-Alben vorhanden."}
          </h4>

          <p className="mt-4 max-w-xl leading-8 text-black/65">
            {selectedTags.length > 0
              ? "Der Galerie-Filter ist gerade etwas zu eng geschnürt. Setz ihn zurück oder wähle einen anderen Hashtag."
              : "Sobald passende Galerie-Alben im Sanity Studio veröffentlicht sind, erscheinen sie hier."}
          </p>
        </div>
      ) : (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album, index) => {
            const image = album.coverImage || album.images?.[0];
            const imageCount = album.images?.length ?? 0;
            const imageRatioConfig = albumCoverRatioConfig;
            const tags = getGalleryTags(album.tags);

            return (
              <article
                key={album._id}
                className="group block w-full text-left outline-none"
              >
                <button
                  type="button"
                  onClick={() => onOpenAlbum(album)}
                  className="block w-full text-left"
                >
                  <div
                    className={`relative overflow-hidden rounded-md bg-[#d7d5ce] ring-1 ring-black/10 transition duration-300 group-hover:-translate-y-0.5 group-hover:ring-black/20 ${imageRatioConfig.className}`}
                  >
                    {image ? (
                      <SanityImage
                        src={urlFor(image)
                          .width(imageRatioConfig.width)
                          .height(imageRatioConfig.height)
                          .fit("crop")
                          .url()}
                        alt={image.alt || album.title}
                        width={imageRatioConfig.width}
                        height={imageRatioConfig.height}
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
                            {imageCount === 1
                              ? "1 Bild"
                              : `${imageCount} Bilder`}
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

                {tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onToggleTag(tag)}
                        className={
                          isTagSelected(selectedTags, tag)
                            ? "px-1 text-[10px] font-bold tracking-[0.04em] text-orange-600"
                            : "px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
                        }
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <PortalBottomAction
        showAll={showAll}
        showAllLabel="Weitere Alben anzeigen"
        showLessLabel="Weniger Alben anzeigen"
        onToggle={onToggleShowAll}
      />

      <PortalTagFilter
        label="Galerie"
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={onToggleTag}
        onResetTags={onResetTags}
      />
    </div>
  );
}

function GalleryAlbumPortalDetail({
  album,
  selectedTags,
  onToggleTag,
  onBack,
}: {
  album: HomeGalleryAlbum;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onBack: () => void;
}) {
  const images = album.images || [];
  const coverImage = album.coverImage || images[0];
  const galleryImages =
    images.length > 0 ? images : coverImage ? [coverImage] : [];
  const tags = getGalleryTags(album.tags);
  const categoryLabel = formatGalleryCategory(album.category);
  const formattedDate = formatGalleryDate(album.date);
  const commentTargetSlug = album.slug?.current || album._id;

  return (
    <article className="text-neutral-950">
      <button
        type="button"
        onClick={onBack}
        className={`${detailActionButtonClass} mb-10`}
      >
        <span className="sm:hidden">← Galerie</span>
        <span className="hidden sm:inline">← Zurück zur Galerie</span>
      </button>

      <header className="relative grid grid-cols-1 items-start gap-7 border-b border-black/10 pb-8 sm:grid-cols-[minmax(0,1fr)_170px] sm:gap-x-6 sm:gap-y-7 sm:pb-10 md:grid-cols-[minmax(0,1fr)_220px] lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:items-end lg:gap-8">
        <div className="min-w-0 pr-[112px] sm:pr-0">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[8px] font-black uppercase tracking-[0.22em] text-black/35 sm:mb-4 sm:text-[10px] sm:tracking-[0.28em]">
            <span>{categoryLabel}</span>

            <span className="h-1 w-1 rounded-full bg-black/25" />

            <span>
              {galleryImages.length === 1
                ? "1 Bild"
                : `${galleryImages.length} Bilder`}
            </span>
          </div>

          <h1 className="max-w-full hyphens-none text-[2.35rem] font-black leading-[0.95] tracking-[-0.055em] text-[#111217] [overflow-wrap:normal] [word-break:normal] sm:text-4xl md:text-5xl lg:text-7xl">
            {album.title}
          </h1>

          {album.description ? (
            <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-neutral-600 sm:mt-5 sm:text-base sm:leading-7 md:text-lg md:leading-8 lg:mt-7 lg:text-xl lg:leading-9">
              {album.description}
            </p>
          ) : null}

          <dl className="mt-6 grid w-[calc(100%+112px)] max-w-2xl grid-cols-1 gap-3 border-y border-black/10 py-4 text-xs sm:w-auto sm:grid-cols-4">
            <div>
              <dt className="text-[9px] font-black uppercase tracking-[0.22em] text-black/30">
                Kategorie
              </dt>
              <dd className="mt-1 font-bold text-black/60">{categoryLabel}</dd>
            </div>

            <div>
              <dt className="text-[9px] font-black uppercase tracking-[0.22em] text-black/30">
                Datum
              </dt>
              <dd className="mt-1 font-bold text-black/60">
                {formattedDate ?? "Nicht hinterlegt"}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] font-black uppercase tracking-[0.22em] text-black/30">
                Ort
              </dt>
              <dd className="mt-1 font-bold text-black/60">
                {album.location || "Nicht hinterlegt"}
              </dd>
            </div>
            <div>
              <dt className="text-[9px] font-black uppercase tracking-[0.22em] text-black/30">
                Gefällt mir
              </dt>
              <dd className="mt-1">
                <LikeButton
                  targetType="galleryAlbum"
                  targetId={commentTargetSlug}
                  className="tracking-[0.16em]"
                />
              </dd>
            </div>
          </dl>

          {tags.length > 0 ? (
            <div className="mt-6 flex w-[calc(100%+112px)] flex-wrap gap-x-3 gap-y-1 sm:w-auto">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onToggleTag(tag);
                    onBack();
                  }}
                  className={
                    isTagSelected(selectedTags, tag)
                      ? "px-1 text-[10px] font-bold tracking-[0.04em] text-orange-600"
                      : "px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
                  }
                >
                  #{tag}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {coverImage ? (
          <figure className="absolute right-0 top-0 w-[92px] justify-self-end sm:static sm:w-full sm:max-w-none sm:justify-self-end lg:mx-0 lg:justify-self-end">
            <div className="relative overflow-hidden rounded-md bg-[#ded9cf] ring-1 ring-black/10">
              <SanityImage
                src={urlFor(coverImage)
                  .width(
                    getGalleryCoverRatioConfig(coverImage.displayFormat).width,
                  )
                  .height(
                    getGalleryCoverRatioConfig(coverImage.displayFormat).height,
                  )
                  .fit("crop")
                  .url()}
                alt={coverImage.alt || album.title}
                width={
                  getGalleryCoverRatioConfig(coverImage.displayFormat).width
                }
                height={
                  getGalleryCoverRatioConfig(coverImage.displayFormat).height
                }
                priority
                className={`${getGalleryCoverRatioConfig(coverImage.displayFormat).className} w-full object-cover`}
              />
            </div>

            {coverImage.caption ? (
              <figcaption className="mt-2 hidden border-b border-black/10 pb-2 text-[10px] font-semibold leading-4 text-black/50 sm:block sm:mt-3 sm:pb-3 sm:text-xs sm:leading-5 lg:text-sm lg:leading-6">
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
              const imageRatioConfig = getGalleryDetailImageRatioConfig(
                index,
                image.displayFormat,
              );

              return (
                <figure
                  key={`${album._id}-${index}`}
                  className="mb-6 break-inside-avoid"
                >
                  <div
                    className={`relative overflow-hidden rounded-md bg-black/5 ring-1 ring-black/10 transition duration-300 hover:-translate-y-0.5 hover:ring-black/20 ${imageRatioConfig.className}`}
                  >
                    <SanityImage
                      src={urlFor(image)
                        .width(imageRatioConfig.width)
                        .height(imageRatioConfig.height)
                        .fit("crop")
                        .url()}
                      alt={image.alt || `${album.title} Bild ${index + 1}`}
                      width={imageRatioConfig.width}
                      height={imageRatioConfig.height}
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

      <Comments
        targetType="gallery"
        targetSlug={commentTargetSlug}
        targetTitle={album.title}
        footerAction={
          <button
            type="button"
            onClick={onBack}
            className={detailActionButtonClass}
          >
            <span className="sm:hidden">← Galerie</span>
            <span className="hidden sm:inline">← Zurück zur Galerie</span>
          </button>
        }
      />
    </article>
  );
}

function EventsPanel({
  events,
  allTags,
  selectedTags,
  showAll,
  onToggleShowAll,
  onToggleTag,
  onResetTags,
  onOpenEvent,
}: {
  events: HomeEvent[];
  allTags: string[];
  selectedTags: string[];
  showAll: boolean;
  onToggleShowAll: () => void;
  onToggleTag: (tag: string) => void;
  onResetTags: () => void;
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

  const items =
    events.length > 0 ? events : selectedTags.length > 0 ? [] : fallbackEvents;

  return (
    <div>
      {items.length === 0 ? (
        <div className="border-y border-black/10 py-7">
          <h4 className="text-2xl font-black tracking-[-0.04em]">
            Keine Events zu dieser Auswahl.
          </h4>

          <p className="mt-4 max-w-xl leading-8 text-black/65">
            Der Event-Filter ist gerade etwas zu eng geschnürt. Setz ihn zurück
            oder wähle einen anderen Hashtag.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-black/10 border-y border-black/10">
          {items.map((event) => {
            const date = formatHomeEventDate(event.startDate, event.endDate);
            const time = event.time || formatHomeEventTime(event.startDate);
            const type = formatEventType(event.eventType);
            const status = formatEventStatus(event.status);
            const tags = getEventTags(event.tags);

            return (
              <article
                key={event._id}
                className="group py-5 text-left transition hover:bg-black/[0.025] md:px-3"
              >
                <button
                  type="button"
                  onClick={() => onOpenEvent(event)}
                  className="w-full text-left"
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

                {tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 md:ml-[170px]">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onToggleTag(tag)}
                        className={
                          isTagSelected(selectedTags, tag)
                            ? "px-1 text-[10px] font-bold tracking-[0.04em] text-orange-600"
                            : "px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
                        }
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      <PortalBottomAction
        showAll={showAll}
        showAllLabel="Weitere Termine anzeigen"
        showLessLabel="Weniger Termine anzeigen"
        onToggle={onToggleShowAll}
      />

      <PortalTagFilter
        label="Event"
        tags={allTags}
        selectedTags={selectedTags}
        onToggleTag={onToggleTag}
        onResetTags={onResetTags}
      />
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

function EventDetailFact({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
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
  selectedTags,
  onToggleTag,
  onBack,
}: {
  event: HomeEvent;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onBack: () => void;
}) {
  const formattedDate = formatEventDetailDate(event.startDate);
  const image = event.image;
  const tags = getEventTags(event.tags);
  const commentTargetSlug = event.slug?.current || event._id;

  return (
    <article className="text-neutral-950">
      <div className="mb-10 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className={detailActionButtonClass}
        >
          <span className="sm:hidden">← Events</span>
          <span className="hidden sm:inline">← Zurück zu den Events</span>
        </button>

        {event.externalUrl ? (
          <Link
            href={event.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${detailActionButtonClass} text-right`}
          >
            <span className="sm:hidden">Veranstaltungsseite</span>
            <span className="hidden sm:inline">Zur Veranstaltungsseite</span>
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
            <figure className="w-full overflow-hidden rounded-md border border-black/10 bg-[#efe8dc] p-1 lg:justify-self-end">
              <SanityImage
                src={urlFor(image).width(900).height(900).fit("crop").url()}
                alt={image.alt || event.title || "Event Bild"}
                width={900}
                height={900}
                className="aspect-[4/3] w-full rounded-sm object-cover lg:aspect-[5/4]"
              />
            </figure>
          ) : null}
        </header>

        <section className="mb-12 border-b border-black/10">
          <div className="divide-y divide-black/10 md:grid md:grid-cols-4 md:divide-x md:divide-y-0">
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
            <div className="py-5 md:px-6">
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
                Gefällt mir
              </p>

              <div className="mt-2 flex items-center">
                <LikeButton
                  targetType="event"
                  targetId={commentTargetSlug}
                  className="tracking-[0.18em]"
                />
              </div>
            </div>
          </div>
        </section>

        {tags.length > 0 ? (
          <section className="mb-12 border-b border-black/10 pb-6">
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
              Hashtags
            </p>

            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    onToggleTag(tag);
                    onBack();
                  }}
                  className={
                    isTagSelected(selectedTags, tag)
                      ? "px-1 text-[10px] font-bold tracking-[0.04em] text-orange-600"
                      : "px-1 text-[10px] font-bold tracking-[0.04em] text-black/35 transition hover:text-orange-600"
                  }
                >
                  #{tag}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {event.body && event.body.length > 0 ? (
          <div className="prose prose-neutral max-w-3xl">
            <PortableText
              value={event.body}
              components={eventPortableTextComponents}
            />
          </div>
        ) : null}

        <Comments
          targetType="event"
          targetSlug={commentTargetSlug}
          targetTitle={event.title}
          footerAction={
            <button
              type="button"
              onClick={onBack}
              className={detailActionButtonClass}
            >
              <span className="sm:hidden">← Events</span>
              <span className="hidden sm:inline">← Zurück zu Events</span>
            </button>
          }
        />
      </div>
    </article>
  );
}

function LiveSetsPanel({ isOnline }: { isOnline: boolean }) {
  const twitchUrl = "https://www.twitch.tv/thresholdpeaks";
  const statusLabel = isOnline ? "Online" : "Offline";

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.25fr] lg:items-start">
      <div className="border-l border-black/15 pl-6 text-[#111217]">
        <p className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-black/40">
          Twitch
        </p>

        <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-black/65 md:text-lg md:leading-9">
          Live aus dem Studio: elektronische Musik, spontane Sets und Sessions
          zwischen Peak-Time, Groove und langen Nächten.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href={twitchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={lineButtonWideClass}
          >
            Twitch öffnen
            <span>→</span>
          </a>

          <span className="text-[10px] font-black uppercase tracking-[0.26em] text-black/35">
            @thresholdpeaks
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-black/12 bg-[#efe8dc]/70 shadow-none">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-black/10 bg-black/5">
          <Image
            src="/images/twitch-live-sets.png"
            alt="Threshold Peaks Live Sets auf Twitch"
            fill
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
          />
        </div>

        <div className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-5 border-b border-black/10 pb-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-black/35">
                Streaming via Twitch
              </p>
              <h5 className="mt-3 text-2xl font-black leading-tight tracking-[-0.045em] text-[#111217] md:text-3xl">
                Studio Sessions, wenn der Abend Bass bekommt.
              </h5>
            </div>

            <div className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-black/10 bg-[#f5f3ee]/80 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-black/45">
              <LiveStatusDot isOnline={isOnline} className="h-1.5 w-1.5" />
              {statusLabel}
            </div>
          </div>

          <div className="grid gap-4 pt-6 sm:grid-cols-3">
            {[
              {
                label: "Sound",
                text: "Elektronische Musik und spontane Übergänge.",
              },
              {
                label: "Mood",
                text: "Peak-Time, Groove und lange Nachtlichter.",
              },
              { label: "Kanal", text: "thresholdpeaks direkt auf Twitch." },
            ].map((item) => (
              <div
                key={item.label}
                className="border-t border-black/10 pt-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
                  {item.label}
                </p>
                <p className="mt-3 text-sm font-semibold leading-7 text-black/60">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-7 border-t border-black/10 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-black/35">
              Kein Autoplay, kein schwerer Player. Erstmal leicht, schnell und
              sauber verlinkt.
            </p>
          </div>
        </div>
      </div>
    </div>
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
      title: "Feedback",
      kicker: "Anregungen",
      text: "Anregungen zur Seite, Ideen oder Hinweise.",
      href: "mailto:info@threshold-peaks.de?subject=Feedback%20zu%20Threshold%20Peaks",
      label: "Nachricht schreiben",
    },
    {
      title: "Events",
      kicker: "Tipps",
      text: "Läufe, Rides oder Veranstaltungen, die gut zu Threshold Peaks passen.",
      href: "mailto:info@threshold-peaks.de?subject=Event-Tipp%20f%C3%BCr%20Threshold%20Peaks",
      label: "Event-Tipp senden",
    },
    {
      title: "Music",
      kicker: "Sound",
      text: "Tracks, Sets oder Sound-Ideen für Bewegung und Training.",
      href: "mailto:info@threshold-peaks.de?subject=Musik-Idee%20f%C3%BCr%20Threshold%20Peaks",
      label: "Musik-Idee senden",
    },
    {
      title: "Social",
      kicker: "Austausch",
      text: "Austausch über Strava, Instagram oder SoundCloud.",
      href: "https://www.instagram.com/threshold.peaks/",
      label: "Instagram öffnen",
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[0.95fr_1.25fr] lg:items-start">
      <div className="border-l border-black/15 pl-6 text-[#111217]">
        <p className="mb-5 text-xs font-black uppercase tracking-[0.35em] text-black/40">
          Kontakt
        </p>

        <h4 className="max-w-xl text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
          Du hast Feedback, einen Event-Tipp oder eine Idee für Musik und
          Training?
        </h4>

        <p className="mt-5 max-w-xl leading-8 text-black/65">
          Threshold Peaks lebt von Bewegung, Klang und Momenten draußen. Wenn du
          etwas teilen möchtest, schreib mir gerne.
        </p>

        <a
          href="mailto:info@threshold-peaks.de"
          className={`${lineButtonWideClass} mt-8 w-full sm:w-auto sm:min-w-[260px]`}
        >
          Nachricht schreiben
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
                →
              </span>
            </>
          );

          return (
            <a
              key={item.title}
              href={item.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="group flex flex-col gap-4 py-5 transition hover:bg-black/[0.025] md:flex-row md:items-center md:px-3"
            >
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}
