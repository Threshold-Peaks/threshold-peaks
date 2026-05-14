import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import StravaLatest from "@/components/StravaLatest";
import BackToTopButton from "@/components/BackToTopButton";
import HomePortal from "@/components/HomePortal";
import { client } from "@/sanity/lib/client";

export const revalidate = 60;

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
  mainImage
}`;

const allGalleryQuery = `*[_type == "galleryAlbum"] | order(coalesce(date, _createdAt) desc) {
  _id,
  title,
  slug,
  category,
  "description": coalesce(description, teaser, excerpt),
  "coverImage": coalesce(coverImage, images[0]),
  images
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
      <section className="relative overflow-hidden pb-8 md:pb-10">
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

        {/* HEADER */}
        <header className="relative z-50 px-6 pt-6 md:px-10 md:pt-8 lg:px-20">
          <a
            href="#top"
            className="absolute left-6 top-6 inline-flex items-center gap-3 transition hover:text-orange-600 md:left-10 md:top-8"
            aria-label="Zur Startseite"
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

          <div className="mx-auto max-w-[1280px]">
            <div
              aria-hidden="true"
              className="invisible inline-flex items-center gap-3"
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
            </div>

            <HeroTopNav />

            <details className="group relative mt-5 inline-block md:hidden">
              <summary className="list-none rounded-full border border-black/10 bg-white/75 px-5 py-3 text-xs font-black uppercase tracking-[0.28em] shadow-sm backdrop-blur-md transition hover:text-orange-600 active:scale-95 [&::-webkit-details-marker]:hidden">
                Menü
              </summary>

              <div className="absolute left-0 top-14 z-50 w-52 overflow-hidden rounded-3xl border border-black/10 bg-white/95 p-2 shadow-xl backdrop-blur-xl">
                <MobileNavLink href="/">Home</MobileNavLink>
                <MobileNavLink href="/#about">About</MobileNavLink>
                <MobileNavLink href="/#journal">Journal</MobileNavLink>
                <MobileNavLink href="/#gallery">Galerie</MobileNavLink>
                <MobileNavLink href="/#events">Events</MobileNavLink>
                <MobileNavLink href="/#contact">Kontakt</MobileNavLink>
              </div>
            </details>
          </div>
        </header>

        {/* HERO CONTENT */}
        <div className="relative z-10 px-6 pb-4 pt-8 md:px-10 md:pt-10 lg:px-20 lg:pt-12">
          <div className="mx-auto max-w-[1280px]">
            <HomePortal
              latestPosts={latestPosts}
              allPosts={allPosts}
              latestAlbums={latestAlbums}
              allAlbums={allAlbums}
              latestEvents={latestEvents}
              allEvents={upcomingEvents}
              embedded
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 pb-10 pt-4 md:px-10 lg:px-20">
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-black/10 bg-white/60 p-7 text-sm text-black/65 shadow-sm backdrop-blur-xl md:p-8">
          <div className="mb-8 border-b border-black/10 pb-7">
            <StravaLatest variant="footer" />
          </div>

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

            <div className="flex flex-wrap gap-5 font-bold">
              <Link
                href="/impressum"
                className="transition hover:text-orange-600"
              >
                Impressum
              </Link>

              <Link
                href="/datenschutz"
                className="transition hover:text-orange-600"
              >
                Datenschutz
              </Link>

              <Link href="/studio" className="transition hover:text-orange-600">
                CMS Login
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
  return (
    <nav
      aria-label="Hauptnavigation"
      className="mt-6 hidden w-fit flex-wrap items-center gap-2 rounded-[1.5rem] border border-black/10 bg-white/60 p-2 shadow-sm backdrop-blur-xl md:flex"
    >
      <HeroTopNavLink href="/">Home</HeroTopNavLink>
      <HeroTopNavLink href="/#about">About</HeroTopNavLink>
      <HeroTopNavLink href="/#journal">Journal</HeroTopNavLink>
      <HeroTopNavLink href="/#gallery">Galerie</HeroTopNavLink>
      <HeroTopNavLink href="/#events">Events</HeroTopNavLink>
      <HeroTopNavLink href="/#contact">Kontakt</HeroTopNavLink>
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
    <Link
      href={href}
      className="group inline-flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-black text-black/70 transition hover:bg-[#d7d5ce] hover:text-orange-600"
    >
      <span>{children}</span>
      <span className="text-black/25 transition group-hover:translate-x-1 group-hover:text-orange-600">
        →
      </span>
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl px-4 py-2.5 text-sm font-bold text-black transition hover:bg-black/5 hover:text-orange-600 focus:outline-none focus-visible:text-orange-600"
    >
      {children}
    </Link>
  );
}