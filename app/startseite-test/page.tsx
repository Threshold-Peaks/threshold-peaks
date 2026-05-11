import FeatureCard from "../FeatureCard";
import Image from "next/image";
import Link from "next/link";
import { Image as SanityImage } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import type { ReactNode } from "react";
import StravaLatest from "@/components/StravaLatest";
import BackToTopButton from "@/components/BackToTopButton";
import ScrollReveal from "@/components/ScrollReveal";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

export const revalidate = 60;

const grayButtonClass =
  "inline-flex items-center justify-between rounded-md border border-black/10 bg-[#d7d5ce] px-7 py-4 text-sm font-bold text-[#111217] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#c9c6bd] hover:text-orange-600 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee]";

const sectionShellClass =
  "overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-sm backdrop-blur-xl";

const tagClass =
  "inline-flex rounded-full border border-black/10 bg-[#d7d5ce] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black/65";

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

const aboutCards = [
  {
    title: "Running",
    text: "Bahn, Straße, Ausdauer und der Moment, in dem der Kopf frei wird.",
    href: "#section-running",
  },
  {
    title: "Cycling",
    text: "Rennrad, Gravelbike und neue Wege als Ausgleich zum Lauftraining.",
    href: "#section-cycling",
  },
  {
    title: "Music",
    text: "Elektronische Musik, DJ-Sets und Beats, die Bewegung antreiben.",
    href: "#section-music",
  },
];

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

function formatHomeDate(date?: string) {
  if (!date) return "Journal";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

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
  return event.slug?.current
    ? `/events/${event.slug.current}`
    : event.externalUrl;
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
      <section className="relative overflow-hidden pb-14 md:pb-16">
        <div className="absolute inset-x-0 top-0 z-0 h-[650px] overflow-hidden md:h-[760px]">
          <div className="absolute inset-0 h-full overflow-hidden md:left-auto md:right-0 md:w-[64vw] md:min-w-[780px]">
            <Image
              src="/images/runner-hero.webp"
              alt="Runner im Stadion"
              fill
              loading="eager"
              sizes="(max-width: 768px) 100vw, 64vw"
              className="object-cover object-[72%_top] opacity-35 contrast-105 saturate-105 brightness-105 md:object-[82%_top] md:opacity-100 md:contrast-110 md:saturate-110"
            />

            <div className="pointer-events-none absolute inset-0 bg-[#f5f3ee]/55 md:hidden" />
            <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-[520px] bg-gradient-to-r from-[#f5f3ee] via-[#f5f3ee]/55 to-transparent md:block" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#f5f3ee] via-[#f5f3ee]/80 to-transparent md:h-56" />
          </div>
        </div>

        <header className="relative z-30 flex h-20 items-center justify-between px-6 md:h-24 md:justify-start md:px-10 lg:px-20">
          <a
            href="#top"
            className="flex items-center gap-3 transition hover:text-orange-600"
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
            <NavLink href="#about">About</NavLink>
            <NavLink href="#journal-preview">Journal</NavLink>
            <NavLink href="#gallery-preview">Gallery</NavLink>
            <NavLink href="#events-preview">Events</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </nav>

          <details className="group relative md:hidden">
            <summary className="list-none rounded-full border border-black/10 bg-white/70 px-5 py-3 text-xs font-black uppercase tracking-[0.28em] shadow-sm backdrop-blur-md transition hover:text-orange-600 active:scale-95 [&::-webkit-details-marker]:hidden">
              Menu
            </summary>

            <div className="absolute right-0 top-14 w-52 overflow-hidden rounded-3xl border border-black/10 bg-white/95 p-2 shadow-xl backdrop-blur-xl">
              <MobileNavLink href="#top">Home</MobileNavLink>
              <MobileNavLink href="#about">About</MobileNavLink>
              <MobileNavLink href="#journal-preview">Journal</MobileNavLink>
              <MobileNavLink href="#gallery-preview">Gallery</MobileNavLink>
              <MobileNavLink href="#events-preview">Events</MobileNavLink>
              <MobileNavLink href="#contact">Contact</MobileNavLink>
            </div>
          </details>
        </header>

        <div className="relative z-10 px-6 pt-24 md:px-10 md:pt-28 lg:px-20">
          <p className="mb-6 text-xs font-extrabold uppercase tracking-[0.42em] md:mb-7 md:text-sm md:tracking-[0.48em]">
            Laufen • Radfahren • Musik
          </p>

          <h1 className="max-w-[590px] text-[54px] font-black leading-[0.92] tracking-[-0.06em] sm:text-[64px] md:text-[92px]">
            Bewegung <br />
            ist Freiheit.
          </h1>

          <div className="my-8 h-px w-12 bg-black/45 md:my-9" />

          <p className="max-w-[440px] text-base leading-7 text-black/75 md:text-lg md:leading-8">
            Eine Portal-Testversion: Unter dem Hero fahren Journal, Galerie,
            Events und About beim Scrollen smooth in die Seite hinein.
          </p>

          <a
            href="#about"
            className={`${grayButtonClass} mt-8 min-w-[230px] md:mt-9`}
          >
            Test ansehen <span>→</span>
          </a>
        </div>

        <div className="absolute left-[52%] top-[88px] z-20 hidden w-[860px] -translate-x-1/2 md:block xl:left-[53%] xl:top-[88px]">
          <StravaLatest />
        </div>

        <div className="relative z-10 mt-12 px-6 md:hidden">
          <StravaLatest />
        </div>

        <div className="relative z-10 mx-auto mt-16 grid max-w-[1500px] gap-5 px-6 sm:grid-cols-2 md:mt-20 md:grid-cols-3 md:px-10 lg:px-16">
          <FeatureCard
            href="#about"
            iconType="running"
            title="ABOUT"
            text="Über mich, meine Bereiche und was Threshold Peaks antreibt."
          />

          <FeatureCard
            href="#gallery-preview"
            iconType="cycling"
            title="GALERIE"
            text="Alben und Momente aus Bewegung, Alltag und Freiheit."
          />

          <FeatureCard
            href="#events-preview"
            iconType="music"
            title="EVENTS"
            text="Kommende Termine, Highlights und kleine Ziele am Horizont."
          />
        </div>
      </section>

      <div className="px-6 pb-20 md:px-10 lg:px-20">
        <div className="mx-auto grid max-w-[1280px] gap-12 md:gap-16">
          <ScrollReveal direction="up">
            <section id="about" className={`${sectionShellClass} scroll-mt-24 p-7 md:p-10 lg:p-12`}>
              <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                  <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/50">
                    Über mich
                  </p>

                  <h2 className="max-w-xl text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
                    Aus Leidenschaft. Immer in Bewegung.
                  </h2>

                  <p className="mt-6 max-w-xl text-base leading-8 text-black/70 md:text-lg md:leading-9">
                    Ich bin Matthias, in Stuttgart geboren und seit vielen Jahren
                    in Verl zuhause. Bewegung, Ausdauer und Musik begleiten mich
                    schon lange und sind ein fester Teil meines Lebens.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {aboutCards.map((card) => (
                    <Link
                      key={card.title}
                      href={card.href}
                      className="group rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] p-6 shadow-sm transition hover:-translate-y-1 hover:bg-[#c9c6bd] hover:shadow-md"
                    >
                      <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-black/40">
                        {card.title}
                      </p>
                      <p className="text-sm font-bold leading-7 text-black/65">
                        {card.text}
                      </p>
                      <span className="mt-5 inline-flex font-black transition group-hover:translate-x-1 group-hover:text-orange-600">
                        →
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={80}>
            <section
              id="journal-preview"
              className={`${sectionShellClass} scroll-mt-24 bg-[#111217] p-7 text-white md:p-10 lg:p-12`}
            >
              <div className="grid gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                <SectionIntro
                  label="Journal"
                  title="Geschichten aus Bewegung, Klang und Alltag."
                  text="Die neuesten Beiträge erscheinen direkt auf der Startseite als Vorschau und führen dann auf die einzelnen Journal-Seiten."
                  dark
                />

                <div className="grid gap-4 md:grid-cols-3">
                  {latestPosts.length > 0 ? (
                    latestPosts.map((post) => {
                      const href = post.slug?.current
                        ? `/journal/${post.slug.current}`
                        : "/journal";

                      return (
                        <JournalPreviewCard
                          key={post._id}
                          href={href}
                          date={formatHomeDate(post.publishedAt)}
                          title={post.title}
                          tag={formatJournalCategory(post.category)}
                          text={
                            post.excerpt ||
                            "Ein neuer Beitrag aus dem Threshold Peaks Journal."
                          }
                        />
                      );
                    })
                  ) : (
                    <>
                      <JournalPreviewCard
                        href="/journal"
                        date="Journal"
                        title="Warum Threshold Peaks?"
                        tag="Story"
                        text="Über persönliche Schwellen, kleine Peaks und bewusstes Weitergehen."
                      />
                      <JournalPreviewCard
                        href="/journal"
                        date="Gravel Diaries"
                        title="Wege und Ausgleich"
                        tag="Cycling"
                        text="Rennrad, Gravelbike und Touren draußen."
                      />
                      <JournalPreviewCard
                        href="/journal"
                        date="Sound & Motion"
                        title="Beats für lange Strecken"
                        tag="Music"
                        text="Elektronische Musik und Bewegung im gleichen Puls."
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="mt-9 flex justify-end">
                <Link href="/journal" className={`${grayButtonClass} bg-white text-black`}>
                  Alle Beiträge ansehen <span>→</span>
                </Link>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={120}>
            <section
              id="gallery-preview"
              className={`${sectionShellClass} scroll-mt-24 p-7 md:p-10 lg:p-12`}
            >
              <div className="grid gap-9 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                <SectionIntro
                  label="Galerie"
                  title="Alben und Momente, die in die Seite gleiten."
                  text="Die Galerie kommt von rechts in den Blick und zeigt deine neuesten Alben direkt aus Sanity."
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  {latestAlbums.length > 0 ? (
                    latestAlbums.map((album, index) => {
                      const image = album.coverImage || album.images?.[0];
                      const href = album.slug?.current
                        ? `/gallery/${album.slug.current}`
                        : "/gallery";

                      return (
                        <GalleryPreviewCard
                          key={album._id}
                          title={album.title}
                          category={formatGalleryCategory(album.category)}
                          href={href}
                          image={image}
                          priority={index === 0}
                        />
                      );
                    })
                  ) : (
                    <>
                      <StaticGalleryPreviewCard
                        title="Checkpoint Run"
                        category="Running"
                        image="/images/running-checkpoint.webp"
                      />
                      <StaticGalleryPreviewCard
                        title="Gravel Woods"
                        category="Cycling"
                        image="/images/cycling-gravel.webp"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="mt-9 flex justify-end">
                <Link href="/gallery" className={grayButtonClass}>
                  Alle Bilder ansehen <span>→</span>
                </Link>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal direction="left" delay={120}>
            <section
              id="events-preview"
              className={`${sectionShellClass} scroll-mt-24 bg-[#d7d5ce] p-7 md:p-10 lg:p-12`}
            >
              <div className="grid gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                <SectionIntro
                  label="Events"
                  title="Kommende Termine direkt unter dem Hero."
                  text="Events bleiben eigene Seiten, erscheinen aber als dynamische Vorschau auf der Startseite."
                />

                <div className="grid gap-4">
                  {latestEvents.length > 0 ? (
                    latestEvents.map((event) => (
                      <EventPreviewCard
                        key={event._id}
                        href={getHomeEventHref(event)}
                        date={formatHomeEventDate(event.startDate, event.endDate)}
                        time={event.time || formatHomeEventTime(event.startDate)}
                        title={event.title}
                        type={formatEventType(event.eventType)}
                        text={
                          event.teaser ||
                          "Ein kommender Termin im Threshold Peaks Kalender."
                        }
                        status={formatEventStatus(event.status)}
                        location={event.location}
                      />
                    ))
                  ) : (
                    <>
                      <EventPreviewCard
                        date="10. Juni 2026"
                        title="AOK-Firmenlauf Wiedenbrück"
                        type="Running"
                        text="Geplanter Lauftermin am Mittwoch, 10. Juni 2026."
                        status="Angemeldet"
                      />
                      <EventPreviewCard
                        date="In Planung"
                        title="Gravelrunde rund um Verl"
                        type="Cycling"
                        text="Eine lockere Ausfahrt auf Rennrad oder Gravelbike."
                        status="Offen"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="mt-9 flex justify-end">
                <Link href="/events" className={`${grayButtonClass} bg-white/80 hover:bg-white`}>
                  Alle Termine ansehen <span>→</span>
                </Link>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={80}>
            <section id="contact" className={`${sectionShellClass} scroll-mt-24 p-8 md:p-12`}>
              <div className="grid gap-10 md:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
                    Kontakt
                  </p>

                  <h2 className="mb-6 text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
                    Lass uns in Verbindung bleiben.
                  </h2>

                  <p className="max-w-md text-base leading-8 text-black/70 md:text-lg">
                    Ob Laufen, Radfahren, Musik oder Austausch über Bewegung und
                    Leidenschaft. Hier findest du meine wichtigsten Kanäle.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <ContactCard
                    title="Instagram"
                    text="Training, Ausdauer, Alltag und kleine Momente unterwegs."
                    href="https://www.instagram.com/threshold.peaks/"
                  />
                  <ContactCard
                    title="Strava"
                    text="Läufe, Rides und sportliche Aktivitäten."
                    href="https://www.strava.com/athletes/47713057"
                  />
                  <ContactCard
                    title="SoundCloud"
                    text="DJ-Sets und elektronische Sounds folgen demnächst."
                    href="#"
                  />
                  <ContactCard
                    title="E-Mail"
                    text="Schreib mir direkt an info@threshold-peaks.de"
                    href="mailto:info@threshold-peaks.de"
                  />
                </div>
              </div>
            </section>
          </ScrollReveal>
        </div>
      </div>

      <footer className="px-6 pb-10 pt-4 md:px-10 lg:px-20">
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-black/10 bg-white/60 p-7 text-sm text-black/65 shadow-sm backdrop-blur-xl md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <a
              href="#top"
              className="inline-flex items-center gap-3 text-black transition hover:text-orange-600"
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

function SectionIntro({
  label,
  title,
  text,
  dark = false,
}: {
  label: string;
  title: string;
  text: string;
  dark?: boolean;
}) {
  return (
    <div>
      <p
        className={`mb-4 text-xs font-extrabold uppercase tracking-[0.45em] ${
          dark ? "text-white/45" : "text-black/45"
        }`}
      >
        {label}
      </p>

      <h2 className="text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
        {title}
      </h2>

      <p
        className={`mt-6 max-w-xl text-base leading-8 md:text-lg md:leading-9 ${
          dark ? "text-white/65" : "text-black/65"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function JournalPreviewCard({
  href,
  date,
  title,
  tag,
  text,
}: {
  href: string;
  date: string;
  title: string;
  tag: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[260px] flex-col rounded-[1.5rem] border border-white/10 bg-white/10 p-6 text-white shadow-sm transition hover:-translate-y-1 hover:bg-white/15"
    >
      <p className="mb-4 text-[10px] font-black uppercase tracking-[0.32em] text-white/40">
        {date}
      </p>

      <h3 className="mb-4 text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-400">
        {title}
      </h3>

      <p className="leading-7 text-white/65">{text}</p>

      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-5">
        <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white/60">
          {tag}
        </span>
        <span className="transition group-hover:translate-x-1 group-hover:text-orange-400">
          →
        </span>
      </div>
    </Link>
  );
}

function GalleryPreviewCard({
  title,
  category,
  href,
  image,
  priority = false,
}: {
  title: string;
  category: string;
  href: string;
  image?: HomeGalleryImage;
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative min-h-[320px] overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      {image ? (
        <SanityImage
          src={urlFor(image).width(800).height(900).fit("crop").url()}
          alt={image.alt || title}
          width={800}
          height={900}
          priority={priority}
          className="h-full min-h-[320px] w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex min-h-[320px] items-center justify-center p-6 text-center text-sm font-black uppercase tracking-[0.28em] text-black/45">
          Kein Bild hinterlegt
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
          {category}
        </p>
        <h3 className="text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-400">
          {title}
        </h3>
      </div>
    </Link>
  );
}

function StaticGalleryPreviewCard({
  title,
  category,
  image,
}: {
  title: string;
  category: string;
  image: string;
}) {
  return (
    <Link
      href="/gallery"
      className="group relative min-h-[320px] overflow-hidden rounded-[1.5rem] border border-black/10 bg-[#d7d5ce] shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <Image
        src={image}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/70">
          {category}
        </p>
        <h3 className="text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-400">
          {title}
        </h3>
      </div>
    </Link>
  );
}

function EventPreviewCard({
  href,
  date,
  time,
  title,
  type,
  text,
  status,
  location,
}: {
  href?: string;
  date: string;
  time?: string;
  title: string;
  type: string;
  text: string;
  status: string;
  location?: string;
}) {
  const content = (
    <>
      <div>
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className={tagClass}>{type}</span>
          <span className="rounded-full bg-[#111217] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-white">
            {status}
          </span>
        </div>

        <h3 className="text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-600">
          {title}
        </h3>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-black uppercase tracking-[0.2em] text-black/45">
          <span>{date}</span>
          {time ? <span>{time}</span> : null}
          {location ? <span>{location}</span> : null}
        </div>

        <p className="mt-4 leading-7 text-black/65">{text}</p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5 text-sm font-black">
        <span>Details ansehen</span>
        {href ? <span className="transition group-hover:translate-x-1">→</span> : <span />}
      </div>
    </>
  );

  if (!href) {
    return (
      <article className="group rounded-[1.5rem] border border-black/10 bg-white/65 p-6 shadow-sm">
        {content}
      </article>
    );
  }

  const isExternal = href.startsWith("http");

  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noreferrer" : undefined}
      className="group rounded-[1.5rem] border border-black/10 bg-white/65 p-6 shadow-sm transition hover:-translate-y-1 hover:bg-white/85 hover:shadow-md"
    >
      {content}
    </Link>
  );
}

function ContactCard({
  title,
  text,
  href,
}: {
  title: string;
  text: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="group rounded-3xl border border-black/10 bg-[#d7d5ce] p-6 text-[#111217] shadow-sm transition hover:-translate-y-1 hover:bg-[#c9c6bd] hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee]"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-black transition group-hover:text-orange-600">
          {title}
        </h3>
        <span className="transition group-hover:translate-x-1 group-hover:text-orange-600">
          →
        </span>
      </div>
      <p className="leading-7 text-black/65">{text}</p>
    </Link>
  );
}
