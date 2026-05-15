import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import StravaLatest from "@/components/StravaLatest";
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
  location?: string;
  tags?: string | HomeJournalTag[];
  mainImage?: HomeJournalImage;
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
  soundcloudUrl,
  location,
  "tags": coalesce(tags, tag, hashtags, hashtag, keywords, ""),
  mainImage
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
    <div className="relative z-50 mb-8 min-[1900px]:absolute min-[1900px]:left-[-300px] min-[1900px]:top-0 min-[1900px]:w-[220px]">
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

    {/* RIGHT: PORTAL + STRAVA */}
    <div className="w-full space-y-6 min-[1900px]:pt-[74px]">
      <HomePortal
        latestPosts={latestPosts}
        allPosts={allPosts}
        latestAlbums={latestAlbums}
        allAlbums={allAlbums}
        latestEvents={latestEvents}
        allEvents={upcomingEvents}
        embedded
      />

      <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white/55 p-6 shadow-[0_1px_2px_rgba(17,18,23,0.06)] ring-1 ring-white/70 backdrop-blur-2xl md:p-7">
  <StravaLatest variant="footer" />
</div>
    </div>
  </div>
</div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 pb-10 pt-4 md:px-10 lg:px-20">
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-black/10 bg-white/60 p-7 text-sm text-black/65 shadow-sm backdrop-blur-xl md:p-8">
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

          <div className="mt-8 border-t border-black/10 pt-6 text-xs text-black/50">
            © 2026 Threshold Peaks. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>

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

function HeroTopNav() {
  const navItems = [
    { href: "#top", label: "Home" },
    { href: "#portal-about", label: "About" },
    { href: "#portal-journal", label: "Journal" },
    { href: "#portal-gallery", label: "Galerie" },
    { href: "#portal-events", label: "Events" },
    { href: "#portal-contact", label: "Kontakt" },
  ];

  return (
    <nav
      aria-label="Hauptnavigation"
      className="relative z-50 mt-6 w-full max-w-[560px] md:mt-7 min-[1900px]:mt-8 min-[1900px]:max-w-none"
    >
      <div className="mb-3 text-left min-[1900px]:mb-5">
        <div className="text-[8px] font-black uppercase tracking-[0.34em] text-black/30 md:text-[10px] md:text-black/35">
          Navigation
        </div>
      </div>

      <div className="grid grid-cols-3 gap-x-5 gap-y-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2 min-[1900px]:block min-[1900px]:space-y-1 min-[1900px]:border-l min-[1900px]:border-black/15 min-[1900px]:pl-5">
        {navItems.map((item) => (
          <HeroTopNavLink key={item.href} href={item.href}>
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
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className="group relative inline-flex justify-center py-1 text-center text-[10px] font-black uppercase tracking-[0.2em] text-black/50 transition hover:text-orange-600 focus:outline-none focus-visible:text-orange-600 min-[1900px]:flex min-[1900px]:items-center min-[1900px]:justify-between min-[1900px]:py-2.5 min-[1900px]:text-left min-[1900px]:text-sm min-[1900px]:normal-case min-[1900px]:tracking-normal min-[1900px]:text-black/55"
    >
      <span className="hidden min-[1900px]:absolute min-[1900px]:-left-[25px] min-[1900px]:block min-[1900px]:h-2.5 min-[1900px]:w-2.5 min-[1900px]:rounded-full min-[1900px]:border min-[1900px]:border-black/20 min-[1900px]:bg-[#f5f3ee] min-[1900px]:transition min-[1900px]:group-hover:border-orange-600 min-[1900px]:group-hover:bg-orange-600" />

      <span className="relative inline-flex pb-1 transition min-[1900px]:pb-0 min-[1900px]:group-hover:translate-x-1">
        {children}
        <span className="absolute bottom-0 left-1/2 h-px w-5 -translate-x-1/2 bg-black/20 transition group-hover:w-full group-hover:bg-orange-500 min-[1900px]:hidden" />
      </span>

      <span className="hidden text-xs text-black/25 opacity-0 transition group-hover:translate-x-1 group-hover:text-orange-600 group-hover:opacity-100 min-[1900px]:block">
        →
      </span>
    </a>
  );
}
