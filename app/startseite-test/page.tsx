import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { SanityImageSource } from "@sanity/image-url";
import StravaLatest from "@/components/StravaLatest";
import BackToTopButton from "@/components/BackToTopButton";
import HomePortal from "@/components/HomePortal";
import { client } from "@/sanity/lib/client";

export const revalidate = 60;

const grayButtonClass =
  "inline-flex items-center justify-between rounded-md border border-black/10 bg-[#d7d5ce] px-7 py-4 text-sm font-bold text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee]";

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

const latestJournalQuery = `*[_type == "journalPost"] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  publishedAt,
  category,
  excerpt
}`;

const latestGalleryQuery = `*[_type == "galleryAlbum"] | order(coalesce(date, _createdAt) desc)[0...4] {
  _id,
  title,
  slug,
  category,
  "coverImage": coalesce(coverImage, images[0]),
  images
}`;

const latestEventsQuery = `*[_type in ["event", "termin"] && defined(coalesce(startDate, date, eventDate))] | order(coalesce(startDate, date, eventDate) asc) {
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

function isUpcomingHomeEvent(event: HomeEvent) {
  const eventDate = getDateKey(event.endDate ?? event.startDate);

  if (!eventDate) {
    return false;
  }

  return eventDate >= getTodayKey();
}

export default async function StartseiteTest() {
  const [latestPosts, latestAlbums, allEvents] = await Promise.all([
    client.fetch<HomeJournalPost[]>(latestJournalQuery),
    client.fetch<HomeGalleryAlbum[]>(latestGalleryQuery),
    client.fetch<HomeEvent[]>(latestEventsQuery),
  ]);

  const latestEvents = allEvents.filter(isUpcomingHomeEvent).slice(0, 3);

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
              loading="eager"
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
        <header className="relative z-50 flex h-20 items-center justify-between px-6 md:h-24 md:justify-start md:px-10 lg:px-20">
          <a
            href="#top"
            className="flex items-center gap-3 transition hover:text-orange-600"
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

          <nav className="ml-10 hidden items-center gap-6 text-sm font-semibold md:flex">
            <NavLink href="#top">Home</NavLink>
            <NavLink href="#portal-about">About</NavLink>
            <NavLink href="#portal-journal">Journal</NavLink>
            <NavLink href="#portal-gallery">Galerie</NavLink>
            <NavLink href="#portal-events">Events</NavLink>
            <NavLink href="#portal-contact">Kontakt</NavLink>
          </nav>

          <details className="group relative md:hidden">
            <summary className="list-none rounded-full border border-black/10 bg-white/70 px-5 py-3 text-xs font-black uppercase tracking-[0.28em] shadow-sm backdrop-blur-md transition hover:text-orange-600 active:scale-95 [&::-webkit-details-marker]:hidden">
              Menü
            </summary>

            <div className="absolute right-0 top-14 w-52 overflow-hidden rounded-3xl border border-black/10 bg-white/95 p-2 shadow-xl backdrop-blur-xl">
              <MobileNavLink href="#top">Home</MobileNavLink>
              <MobileNavLink href="#portal-about">About</MobileNavLink>
              <MobileNavLink href="#portal-journal">Journal</MobileNavLink>
              <MobileNavLink href="#portal-gallery">Galerie</MobileNavLink>
              <MobileNavLink href="#portal-events">Events</MobileNavLink>
              <MobileNavLink href="#portal-contact">Kontakt</MobileNavLink>
            </div>
          </details>
        </header>

        {/* HERO TEXT */}
        <div className="relative z-10 px-6 pt-16 md:px-10 md:pt-20 lg:px-20 lg:pt-24">
          <p className="mb-6 text-xs font-extrabold uppercase tracking-[0.42em] md:mb-7 md:text-sm md:tracking-[0.48em]">
            Laufen • Radfahren • Musik
          </p>

          <h1 className="max-w-[590px] text-[54px] font-black leading-[0.92] tracking-[-0.06em] sm:text-[64px] md:text-[92px]">
            Bewegung <br />
            ist Freiheit.
          </h1>

          <div className="my-8 h-px w-12 bg-black/45 md:my-9" />

          <p className="max-w-[440px] text-base leading-7 text-black/75 md:text-lg md:leading-8">
            Threshold Peaks verbindet Ausdauer, elektronische Musik und aktiven
            Lifestyle. Hier findest du Storys, Bilder, Events und kleine
            Momente zwischen Training, Rhythmus und Alltag.
          </p>

          <a
            href="#portal"
            className={`${grayButtonClass} mt-8 min-w-[230px] md:mt-9`}
          >
            Portal öffnen <span>→</span>
          </a>
        </div>
      </section>

      {/* PORTAL */}
<div className="relative z-30 -mt-44 md:-mt-72 lg:-mt-[34rem] xl:-mt-[38rem]">
  <HomePortal
    latestPosts={latestPosts}
    latestAlbums={latestAlbums}
    latestEvents={latestEvents}
  />
</div>

      {/* STRAVA DEZENT */}
      <section id="strava" className="px-6 pb-12 md:px-10 lg:px-20">
        <div className="mx-auto max-w-[720px] overflow-hidden rounded-[2rem] border border-black/10 bg-white/55 p-5 shadow-sm backdrop-blur-xl md:p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-black/40">
                Strava
              </p>
              <h2 className="text-xl font-black tracking-[-0.04em] md:text-2xl">
                Letzte Aktivität
              </h2>
            </div>

            <span className="rounded-full border border-black/10 bg-[#d7d5ce] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-black/55">
              Live
            </span>
          </div>

          <StravaLatest />
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

            <div className="flex flex-wrap gap-5 font-bold">
              <Link href="/journal" className="transition hover:text-orange-600">
                Journal
              </Link>
              <Link href="/gallery" className="transition hover:text-orange-600">
                Galerie
              </Link>
              <Link href="/events" className="transition hover:text-orange-600">
                Events
              </Link>
              <Link href="/impressum" className="transition hover:text-orange-600">
                Impressum
              </Link>
              <Link href="/datenschutz" className="transition hover:text-orange-600">
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

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="group relative pb-2 text-black transition hover:text-orange-600 focus:outline-none focus-visible:text-orange-600"
    >
      <span>{children}</span>
      <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-orange-500 transition-all group-hover:w-full" />
    </a>
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
    <a
      href={href}
      className="block rounded-2xl px-4 py-2.5 text-sm font-bold text-black transition hover:bg-black/5 hover:text-orange-600 focus:outline-none focus-visible:text-orange-600"
    >
      {children}
    </a>
  );
}