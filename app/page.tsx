import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import BackToTopButton from "@/components/BackToTopButton";
import HomePortal from "@/components/HomePortal";
import { client } from "@/sanity/lib/client";

export const revalidate = 10;

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

type StravaActivity = {
  title?: string;
  sportType?: string;
  dateLabel?: string;
  distance?: string;
  elevation?: string;
  duration?: string;
  kudos?: number;
  mapImage?: SanityImageSource & {
    alt?: string;
  };
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
  displayFormat?: string;
};

type HomeGalleryAlbum = {
  tags?: string[];
  _id: string;
  title: string;
  slug?: {
    current?: string;
  };
  category?: string;
  date?: string;
  location?: string;
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
  tags?: string[];
  image?: HomeGalleryImage;
  body?: PortableTextBlock;
};

const allJournalQuery = `*[_type == "journalPost"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  publishedAt,
  category,
  excerpt,
  body,
  stravaUrl,
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
  location,
  "tags": coalesce(tags, tag, hashtags, hashtag, keywords, ""),
  mainImage,
  linkedGalleryAlbums[]->{
    _id,
    title,
    slug,
    category,
    date,
    location,
    "description": coalesce(description, teaser, excerpt),
    "coverImage": select(
      defined(coverImage) => coverImage{
        ...,
        alt,
        caption,
        displayFormat
      },
      images[0]{
        ...,
        alt,
        caption,
        displayFormat
      }
    ),
    images[]{
      ...,
      alt,
      caption,
      displayFormat
    }
  }
}`;

const allGalleryQuery = `*[_type == "galleryAlbum"] | order(coalesce(date, _createdAt) desc) {
  _id,
  title,
  slug,
  category,
  date,
  location,
  tags,
  "description": coalesce(description, teaser, excerpt),
  "coverImage": select(
    defined(coverImage) => coverImage{
      ...,
      alt,
      caption,
      displayFormat
    },
    images[0]{
      ...,
      alt,
      caption,
      displayFormat
    }
  ),
  images[]{
    ...,
    alt,
    caption,
    displayFormat
  }
}`;

const allEventsQuery = `*[_type in ["event", "termin"] && defined(coalesce(startDate, date, eventDate))] | order(coalesce(startDate, date, eventDate) asc) {
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
  tags,
  "image": coalesce(image, mainImage, coverImage),
  body
}`;

function getTodayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Berlin",
  }).format(new Date());
}

function getDateKey(date?: string) {
  return date?.slice(0, 10) ?? "";
}

function isUpcomingHomeEvent(event: HomeEvent) {
  const eventDate = getDateKey(event.endDate ?? event.startDate);

  if (!eventDate) {
    return false;
  }

  return eventDate >= getTodayKey();
}

export default async function Home() {
  const [allPosts, allAlbums, fetchedEvents] = await Promise.all([
    client.fetch<HomeJournalPost[]>(allJournalQuery),
    client.fetch<HomeGalleryAlbum[]>(allGalleryQuery),
    client.fetch<HomeEvent[]>(allEventsQuery),
  ]);

  const latestPosts = allPosts.slice(0, 3);
  const latestAlbums = allAlbums.slice(0, 4);

  const upcomingEvents = fetchedEvents.filter(isUpcomingHomeEvent);
  const latestEvents = upcomingEvents.slice(0, 3);

  return (
    <main
      id="top"
      className="min-h-screen overflow-x-hidden bg-[#f5f3ee] text-[#111217]"
    >
      {/* HERO */}
      <section className="relative min-h-[620px] overflow-hidden pb-10 md:min-h-[720px] md:pb-14">
        {/* HERO BACKGROUND */}
        <div className="absolute inset-x-0 top-0 z-0 h-[620px] overflow-hidden md:h-[720px]">
          <div className="absolute inset-0 h-full overflow-hidden md:left-auto md:right-0 md:w-[64vw] md:min-w-[780px]">
            <Image
              src="/images/runner-hero.webp"
              alt="Runner im Stadion"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 64vw"
              className="object-cover object-[72%_top] opacity-35 contrast-105 saturate-105 brightness-105 md:object-[82%_top] md:opacity-100 md:contrast-110 md:saturate-110"
            />

            <div className="pointer-events-none absolute inset-0 bg-[#f5f3ee]/55 md:hidden" />

            <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-[520px] bg-gradient-to-r from-[#f5f3ee] via-[#f5f3ee]/55 to-transparent md:block" />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#f5f3ee] via-[#f5f3ee]/80 to-transparent md:h-56" />
          </div>
        </div>

        {/* HERO LAYOUT */}
        <div className="relative z-10 px-6 pb-4 pt-6 md:px-10 md:pt-8 lg:px-20">
          <div className="relative mx-auto w-full max-w-[1280px]">
            {/* LEFT: LOGO + NAV */}
            <div className="relative z-50 mb-8">
              <a
                href="#top"
                className="inline-flex w-max items-center gap-3 transition hover:text-orange-600"
                aria-label="Zur Startseite"
              >
                <ThresholdPeaksIcon />

                <div className="min-w-max whitespace-nowrap leading-none">
                  <div className="text-sm font-black uppercase tracking-[0.22em] md:text-lg">
                    Threshold Peaks
                  </div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-black/55 md:text-[10px]">
                    Beat the extra mile
                  </div>
                </div>
              </a>

              <HeroTopNav />
            </div>

            {/* RIGHT: PORTAL + FOOTER */}
            <div className="w-full overflow-hidden rounded-md shadow-[0_18px_55px_rgba(17,18,23,0.07)]">
              <HomePortal
                latestPosts={latestPosts}
                allPosts={allPosts}
                latestAlbums={latestAlbums}
                allAlbums={allAlbums}
                latestEvents={latestEvents}
                allEvents={upcomingEvents}
                embedded
              />

              <footer className="border-x border-b border-t border-black/15 bg-[#f4efe6]/90 p-7 text-sm text-black/65 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <a
                    href="#top"
                    className="inline-flex items-center gap-3 text-black transition hover:text-orange-600"
                    aria-label="Zurück nach oben"
                  >
                    <ThresholdPeaksIcon />

                    <div className="leading-none">
                      <div className="text-sm font-black uppercase tracking-[0.22em] md:text-lg">
                        Threshold Peaks
                      </div>
                      <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.28em] text-black/55 md:text-[10px]">
                        Beat the extra mile
                      </div>
                    </div>
                  </a>

                  <div className="flex w-full items-center justify-center gap-2 text-center text-[10px] font-bold uppercase tracking-[0.1em] text-black/55 md:w-auto md:justify-end md:gap-3 md:text-sm md:normal-case md:tracking-normal md:text-black/65">
                    <Link
                      href="/impressum"
                      className="whitespace-nowrap transition hover:text-orange-600"
                    >
                      Impressum
                    </Link>

                    <span className="select-none text-black/30" aria-hidden="true">
                      ·
                    </span>

                    <Link
                      href="/datenschutz"
                      className="whitespace-nowrap transition hover:text-orange-600"
                    >
                      Datenschutz
                    </Link>

                    <span className="select-none text-black/30" aria-hidden="true">
                      ·
                    </span>

                    <Link
                      href="/studio"
                      className="whitespace-nowrap transition hover:text-orange-600"
                    >
                      Admin
                    </Link>
                  </div>
                </div>

                <div className="mt-8 border-t border-black/15 pt-6 text-xs text-black/50">
                  © 2026 Threshold Peaks. Alle Rechte vorbehalten.
                </div>
              </footer>
            </div>
          </div>
        </div>
      </section>


      <BackToTopButton />
    </main>
  );
}

function ThresholdPeaksIcon() {
  return (
    <svg
      viewBox="0 0 80 48"
      fill="none"
      className="h-10 w-14 shrink-0 md:h-12 md:w-16"
      aria-hidden="true"
    >
      <path
        d="M6 36H18L30 14L43 36L55 22L74 36"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M30 14L36 25L43 36"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  );
}

const liveSetsIsOnline = false;

function HeroTopNav() {
  const navItems = [
    { href: "#top", label: "Home" },
    { href: "#portal-about", label: "About" },
    { href: "#portal-journal", label: "Journal" },
    { href: "#portal-gallery", label: "Galerie" },
    { href: "#portal-events", label: "Events" },
    { href: "#portal-live", label: "Live Sets" },
    { href: "#portal-contact", label: "Kontakt" },
  ];

  return (
    <nav
      aria-label="Hauptnavigation"
      className="relative z-50 mt-8 w-full md:mt-7"
    >
      <div className="mb-7 text-center md:mb-5 md:text-left">
        <div className="text-[8px] font-black uppercase tracking-[0.38em] text-black/30 md:text-[10px] md:tracking-[0.34em] md:text-black/35">
          Navigation
        </div>
      </div>

      <div className="md:hidden">
        <div className="-mx-6 overflow-x-auto px-6 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-center gap-8">
            {navItems.map((item) => (
              <HeroTopNavLink
                key={item.href}
                href={item.href}
                mobile
                showLiveStatus={item.href === "#portal-live"}
              >
                {item.label}
              </HeroTopNavLink>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:flex md:max-w-none md:flex-wrap md:items-center md:gap-x-7 md:gap-y-3 md:px-0">
        {navItems.map((item) => (
          <HeroTopNavLink
            key={item.href}
            href={item.href}
            showLiveStatus={item.href === "#portal-live"}
          >
            {item.label}
          </HeroTopNavLink>
        ))}
      </div>
    </nav>
  );
}

function HeroTopNavLink({
  href,
  children,
  mobile = false,
  showLiveStatus = false,
}: {
  href: string;
  children: ReactNode;
  mobile?: boolean;
  showLiveStatus?: boolean;
}) {
  const className = mobile
    ? "group relative inline-flex shrink-0 justify-center pb-2 text-center text-[10px] font-black uppercase tracking-[0.28em] text-black/55 transition hover:text-orange-600 focus:outline-none focus-visible:text-orange-600 sm:text-[11px]"
    : "group relative inline-flex w-max justify-start pb-1 text-left text-[10px] font-black uppercase tracking-[0.22em] text-black/50 transition hover:text-orange-600 focus:outline-none focus-visible:text-orange-600";

  return (
    <a href={href} className={className}>
      <span className="inline-flex translate-x-[0.14em] items-center gap-2 md:translate-x-0">
        <span>{children}</span>

        {showLiveStatus ? <LiveSetsStatusDot isOnline={liveSetsIsOnline} /> : null}
      </span>

      <span className="absolute bottom-0 left-1/2 h-px w-9 -translate-x-1/2 bg-black/20 transition group-hover:w-full group-hover:bg-orange-500 md:left-0 md:w-5 md:translate-x-0" />
    </a>
  );
}

function LiveSetsStatusDot({ isOnline }: { isOnline: boolean }) {
  return (
    <span
      className={[
        "h-1.5 w-1.5 rounded-full ring-1",
        isOnline
          ? "bg-emerald-500/80 ring-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.45)]"
          : "bg-red-500/75 ring-red-500/25 shadow-[0_0_8px_rgba(239,68,68,0.35)]",
      ].join(" ")}
      aria-label={isOnline ? "Live Sets online" : "Live Sets offline"}
      title={isOnline ? "Online" : "Offline"}
    />
  );
}
