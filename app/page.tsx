import FeatureCard from "./FeatureCard";
import Image from "next/image";
import { Image as SanityImage } from "next-sanity/image";
import type { SanityImageSource } from "@sanity/image-url";
import type { ReactNode } from "react";
import StravaLatest from "@/components/StravaLatest";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

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

const latestJournalQuery = `*[_type == "journalPost"] | order(publishedAt desc)[0...3] {
  _id,
  title,
  slug,
  publishedAt,
  category,
  excerpt
}`;

const latestGalleryQuery = `*[_type == "galleryAlbum"] | order(date desc)[0...4] {
  _id,
  title,
  slug,
  category,
  coverImage,
  images
}`;

function formatHomeDate(date?: string) {
  if (!date) return "Journal";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
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
export default async function Home() {
  const [latestPosts, latestAlbums] = await Promise.all([
    client.fetch<HomeJournalPost[]>(latestJournalQuery),
    client.fetch<HomeGalleryAlbum[]>(latestGalleryQuery),
  ]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f3ee] text-[#111217]">
      {/* HERO */}
      <section className="relative overflow-hidden pb-14 md:pb-16">
        {/* HERO BACKGROUND */}
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

        {/* HEADER */}
        <header className="relative z-30 flex h-20 items-center justify-between px-6 md:h-24 md:justify-start md:px-10 lg:px-20">
          <a
            href="#"
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

          {/* Desktop Navigation */}
          <nav className="ml-10 hidden items-center gap-6 text-sm font-semibold md:flex">
            <NavLink href="#">Home</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#section-running">Running</NavLink>
            <NavLink href="#section-cycling">Cycling</NavLink>
            <NavLink href="#section-music">Music</NavLink>
            <NavLink href="#journal">Journal</NavLink>
            <NavLink href="#gallery">Gallery</NavLink>
            <NavLink href="#events">Events</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </nav>

          {/* Mobile Navigation */}
          <details className="group relative md:hidden">
            <summary className="list-none rounded-full border border-black/10 bg-white/70 px-5 py-3 text-xs font-black uppercase tracking-[0.28em] shadow-sm backdrop-blur-md transition hover:text-orange-600 active:scale-95 [&::-webkit-details-marker]:hidden">
              Menu
            </summary>

            <div className="absolute right-0 top-14 w-52 overflow-hidden rounded-3xl border border-black/10 bg-white/95 p-2 shadow-xl backdrop-blur-xl">
              <MobileNavLink href="#">Home</MobileNavLink>
              <MobileNavLink href="#about">About</MobileNavLink>
              <MobileNavLink href="#section-running">Running</MobileNavLink>
              <MobileNavLink href="#section-cycling">Cycling</MobileNavLink>
              <MobileNavLink href="#section-music">Music</MobileNavLink>
              <MobileNavLink href="#journal">Journal</MobileNavLink>
              <MobileNavLink href="#gallery">Gallery</MobileNavLink>
              <MobileNavLink href="#events">Events</MobileNavLink>
              <MobileNavLink href="#contact">Contact</MobileNavLink>
            </div>
          </details>
        </header>

        {/* HERO CONTENT */}
        <div className="relative z-10 px-6 pt-24 md:px-10 md:pt-28 lg:px-20">
          <p className="mb-6 text-xs font-extrabold uppercase tracking-[0.42em] md:mb-7 md:text-sm md:tracking-[0.48em]">
            Laufen • Radfahren • Musik
          </p>

          <h1 className="max-w-[560px] text-[54px] font-black leading-[0.92] tracking-[-0.06em] sm:text-[64px] md:text-[92px]">
            Bewegung <br />
            ist Freiheit.
          </h1>

          <div className="my-8 h-px w-12 bg-black/45 md:my-9" />

          <p className="max-w-[430px] text-base leading-7 text-black/75 md:text-lg md:leading-8">
            Laufen, Radfahren und elektronische Musik sind für mich mehr als nur
            Hobbys. Sie geben mir Energie, Ausgleich und den Rhythmus, immer
            wieder in Bewegung zu bleiben.
          </p>

          <a
            href="#about"
            className={`${grayButtonClass} mt-8 min-w-[210px] md:mt-9 md:min-w-[220px]`}
          >
            Mehr entdecken <span>→</span>
          </a>
        </div>

        {/* STRAVA FLOATING DESKTOP */}
        <div className="absolute left-[52%] top-[88px] z-20 hidden w-[860px] -translate-x-1/2 md:block xl:left-[53%] xl:top-[88px]">
          <StravaLatest />
        </div>

        {/* STRAVA MOBILE */}
        <div className="relative z-10 mt-12 px-6 md:hidden">
          <StravaLatest />
        </div>

        {/* CARDS */}
        <div className="relative z-10 mx-auto mt-16 grid max-w-[1500px] gap-5 px-6 sm:grid-cols-2 md:mt-20 md:grid-cols-3 md:px-10 lg:px-16">
          <FeatureCard
            href="#section-running"
            iconType="running"
            title="LAUFEN"
            text="Training, Ausdauer, Disziplin und der Moment, wenn der Kopf frei wird."
          />

          <FeatureCard
            href="#section-cycling"
            iconType="cycling"
            title="RADFAHREN"
            text="Rennrad, Gravelbike und neue Wege als Ausgleich zum Lauftraining."
          />

          <FeatureCard
            href="#section-music"
            iconType="music"
            title="MUSIK"
            text="Elektronische Musik, DJ-Sets und Beats, die Bewegung antreiben."
          />
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="mx-auto grid max-w-[1280px] gap-10 px-6 py-14 md:grid-cols-[0.9fr_0.8fr] md:items-center md:gap-8 md:px-10 md:py-16 lg:px-20"
      >
        <div>
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.42em] md:text-sm md:tracking-[0.45em]">
            Über mich
          </p>

          <div className="mb-7 h-px w-12 bg-black/30 md:mb-8" />

          <h2 className="mb-6 text-3xl font-black leading-tight tracking-[-0.04em] md:mb-7 md:text-4xl">
            Aus Leidenschaft. <br />
            Immer in Bewegung.
          </h2>

          <p className="max-w-md text-base leading-7 text-black/70 md:text-lg md:leading-8">
            Ich bin Matthias, in Stuttgart geboren und seit vielen Jahren in
            Verl zuhause. Bewegung, Ausdauer und Musik begleiten mich schon
            lange und sind ein fester Teil meines Lebens.
            <br />
            <br />
            In meiner Freizeit trainiere ich regelmäßig in der Leichtathletik,
            laufe auf der Bahn und auf der Straße und finde mit dem Rennrad oder
            Gravelbike den perfekten Ausgleich. Seit 2008 lege ich außerdem
            hobbymäßig als DJ im elektronischen Bereich auf.
            <br />
            <br />
            Mit meinen beiden Huskys Sikari und Snow bin ich oft draußen
            unterwegs. Für mich geht es nicht nur um Training, Kilometer oder
            Tempo, sondern um Freiheit, Rhythmus und die Leidenschaft, immer
            wieder in Bewegung zu bleiben.
          </p>

          <a
            href="#section-running"
            className={`${grayButtonClass} mt-8 min-w-[210px] md:mt-9 md:min-w-[220px]`}
          >
            Zu meinen Bereichen <span>→</span>
          </a>
        </div>

        <div className="relative mx-auto h-[400px] w-full max-w-[430px] overflow-hidden rounded-3xl shadow-sm md:ml-0 md:h-[470px]">
          <Image
            src="/images/about-matthias.webp"
            alt="Portrait von Matthias"
            fill
            sizes="(max-width: 768px) 100vw, 430px"
            className="object-cover object-[center_35%]"
          />
        </div>
      </section>

      {/* FOCUS SECTIONS */}
      <section className="px-6 py-14 md:px-10 md:py-16 lg:px-20">
        <div className="mx-auto grid max-w-[1280px] gap-8">
          <FocusSection
            id="section-running"
            label="Laufen"
            title="Jeder Lauf bringt mich weiter."
            text="Laufen ist für mich mehr als Training. Es ist der Moment, in dem der Kopf frei wird und aus Bewegung Fokus entsteht. Ob Bahntraining, Dauerlauf oder Wettkampf, jeder Lauf bringt mich ein Stück weiter."
            meta="Bahn • Straße • Ausdauer"
            image="/images/running-checkpoint.webp"
            imageAlt="Matthias beim Lauf am Checkpoint Charlie"
            imagePosition="left 18%"
            imageLoading="eager"
          />

          <FocusSection
            id="section-cycling"
            label="Radfahren"
            title="Ausgleich auf zwei Rädern."
            text="Radfahren ist für mich Bewegung mit einem anderen Gefühl. Rennrad und Gravelbike bringen Abwechslung, neue Wege und den perfekten Ausgleich zum Lauftraining."
            meta="Rennrad • Gravel • Abenteuer"
            image="/images/cycling-gravel.webp"
            imageAlt="Gravelbike im Wald"
            imagePosition="center"
            reverse
          />

          <FocusSection
            id="section-music"
            label="Musik"
            title="Beats, die Bewegung antreiben."
            text="Elektronische Musik begleitet mich seit vielen Jahren. Seit 2008 lege ich hobbymäßig als DJ auf. Beats, Energie und Atmosphäre geben vielen Momenten ihren eigenen Rhythmus."
            meta="Electronic • DJ • Rhythmus"
            image="/images/music-dj.webp"
            imageAlt="DJ-Controller für elektronische Musik"
            imagePosition="center"
          />
        </div>
      </section>

      {/* JOURNAL */}
      <section
        id="journal"
        className="scroll-mt-24 px-6 py-14 md:px-10 md:py-16 lg:px-20"
      >
        <div className="mx-auto max-w-[1280px]">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
            Journal
          </p>

          <div className="mb-10 max-w-3xl">
            <h2 className="mb-6 text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
              Geschichten aus Bewegung, Klang und Alltag.
            </h2>

            <p className="max-w-2xl text-base leading-8 text-black/65 md:text-lg">
              Hier entsteht ein persönlicher Bereich für Training, Touren, Musik
              und alles, was Threshold Peaks ausmacht.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
  {latestPosts.length > 0 ? (
    latestPosts.map((post) => {
      const href = post.slug?.current
        ? `/journal/${post.slug.current}`
        : "/journal";

      return (
        <JournalCard
          key={post._id}
          category={formatHomeDate(post.publishedAt)}
          title={post.title}
          text={
            post.excerpt ||
            "Ein neuer Beitrag aus dem Threshold Peaks Journal."
          }
          tag={formatJournalCategory(post.category)}
          href={href}
        />
      );
    })
  ) : (
    <>
      <JournalCard
        category="Journal"
        title="Warum Threshold Peaks?"
        text="Über persönliche Schwellen, kleine Peaks und das Potenzial, das entsteht, wenn man bewusst weitergeht."
        tag="Story"
        href="/journal"
      />

      <JournalCard
        category="Gravel Diaries"
        title="Wege, Wälder und Ausgleich"
        text="Rennrad, Gravelbike und Touren draußen. Alles, was Bewegung leichter macht und den Kopf freipustet."
        tag="Radfahren"
        href="/journal"
      />

      <JournalCard
        category="Sound & Motion"
        title="Beats für lange Strecken"
        text="Elektronische Musik, DJ-Sets, Tracks und die Verbindung zwischen Rhythmus, Energie und Bewegung."
        tag="Musik"
        href="/journal"
      />
    </>
  )}
</div>

          <a
            href="/journal"
            className={`${grayButtonClass} mt-8 min-w-[220px]`}
          >
            Alle Beiträge ansehen <span>→</span>
          </a>
        </div>
      </section>

      {/* GALLERY */}
      <section
        id="gallery"
        className="scroll-mt-24 px-6 pb-14 md:px-10 md:pb-16 lg:px-20"
      >
        <div className="mx-auto max-w-[1280px]">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
            Galerie
          </p>

          <div className="mb-10 max-w-3xl">
            <h2 className="mb-6 text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
              Momente aus Bewegung, Klang und Freiheit.
            </h2>

            <p className="max-w-2xl text-base leading-8 text-black/65 md:text-lg">
              Eine kleine Sammlung aus Läufen, Touren, Musikmomenten und allem,
              was Threshold Peaks sichtbar macht.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
  {latestAlbums.length > 0 ? (
    latestAlbums.map((album) => {
      const image = album.coverImage || album.images?.[0];
      const href = album.slug?.current
        ? `/gallery/${album.slug.current}`
        : "/gallery";

      return (
        <SanityGalleryCard
          key={album._id}
          title={album.title}
          category={formatGalleryCategory(album.category)}
          image={image}
          href={href}
        />
      );
    })
  ) : (
    <>
      <GalleryCard
        title="Checkpoint Run"
        category="Running"
        image="/images/running-checkpoint.webp"
        alt="Matthias beim Lauf am Checkpoint Charlie"
      />

      <GalleryCard
        title="Gravel Woods"
        category="Cycling"
        image="/images/cycling-gravel.webp"
        alt="Gravelbike im Wald"
      />

      <GalleryCard
        title="Sound & Motion"
        category="Music"
        image="/images/music-dj.webp"
        alt="DJ-Setup mit Controller"
      />

      <GalleryCard
        title="About Matthias"
        category="Life"
        image="/images/about-matthias.webp"
        alt="Portrait von Matthias"
      />
    </>
  )}
</div>

          <a
            href="/gallery"
            className={`${grayButtonClass} mt-8 min-w-[220px]`}
          >
            Alle Bilder ansehen <span>→</span>
          </a>
        </div>
      </section>

      {/* EVENTS */}
      <section
        id="events"
        className="scroll-mt-24 px-6 pb-14 md:px-10 md:pb-16 lg:px-20"
      >
        <div className="mx-auto max-w-[1280px]">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
            Events
          </p>

          <div className="mb-10 max-w-3xl">
            <h2 className="mb-6 text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
              Kommende Termine und Highlights.
            </h2>

            <p className="max-w-2xl text-base leading-8 text-black/65 md:text-lg">
              Läufe, Rides, Musikmomente und alles, was bei Threshold Peaks als
              nächstes ansteht.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <EventCard
              date="10. Juni 2026"
              title="AOK-Firmenlauf Wiedenbrück"
              type="Running"
              text="Geplanter Lauftermin am Mittwoch, 10. Juni 2026. Ein sportliches Highlight im Kalender und ein guter Anlass, die Form weiter aufzubauen."
              status="Angemeldet"
            />

            <EventCard
              date="In Planung"
              title="Gravelrunde rund um Verl"
              type="Cycling"
              text="Eine lockere Ausfahrt auf Rennrad oder Gravelbike. Sobald eine konkrete Route und ein Termin stehen, erscheint der Ride hier."
              status="Offen"
            />

            <EventCard
              date="In Vorbereitung"
              title="Threshold Peaks Mix"
              type="Music"
              text="Ein elektronischer Mix für lange Läufe, Rides und späte Abendstunden. Der SoundCloud-Bereich ist vorbereitet."
              status="Folgt"
            />
          </div>
        </div>
      </section>

      {/* MUSIC BAR */}
      <section className="px-6 pb-12 md:px-10 lg:px-20">
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 p-8 shadow-sm backdrop-blur-xl md:p-10">
          <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center">
            <div>
              <div className="mb-5 inline-flex rounded-full bg-[#d7d5ce] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black/65">
                SoundCloud
              </div>

              <h2 className="text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
                Mixsets folgen bald.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-8 text-black/65 md:text-lg">
                Elektronische Sounds für lange Läufe, Rides und späte
                Abendstunden. 
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 bg-[#f5f3ee] p-6 shadow-sm">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.35em] text-black/45">
                In Vorbereitung
              </p>

              <div className="mb-6 flex h-20 items-center gap-[4px] overflow-hidden">
                {Array.from({ length: 58 }).map((_, index) => (
                  <span
                    key={index}
                    className="w-[3px] shrink-0 rounded-full bg-black/40"
                    style={{
                      height: `${Math.round(
                        10 + Math.abs(Math.sin(index * 0.5)) * 46
                      )}px`,
                    }}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-black/10 pt-5">
                <div>
                  <h3 className="text-lg font-black text-black">
                    Threshold Peaks Mix
                  </h3>
                  <p className="mt-1 text-sm text-black/55">
                    Electronic / Melodic / Running Energy
                  </p>
                </div>

                <span className="inline-flex rounded-full bg-[#d7d5ce] px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-black/65">
                  Folgt
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="scroll-mt-24 px-6 pb-14 md:px-10 md:pb-16 lg:px-20"
      >
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 text-[#111217] shadow-sm">
          <div className="grid gap-10 p-8 md:grid-cols-[0.9fr_1.1fr] md:p-12">
            <div>
              <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
                Kontakt
              </p>

              <h2 className="mb-6 text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
                Lass uns in Verbindung bleiben.
              </h2>

              <p className="max-w-md text-base leading-8 text-black/70 md:text-lg">
                Ob Laufen, Radfahren, Musik oder einfach Austausch über Bewegung
                und Leidenschaft. Hier findest du meine wichtigsten Kanäle.
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
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-col gap-6 px-6 pb-10 text-sm text-black/65 md:flex-row md:items-center md:justify-between md:px-10 lg:px-20">
        <div className="flex gap-6 text-xl text-black">
          <span>◎</span>
          <span>↯</span>
          <span>●</span>
          <span>☁</span>
        </div>

        <p>© 2026 Threshold Peaks. Alle Rechte vorbehalten.</p>

        <div className="flex gap-10">
          <a
            href="/impressum"
            className="transition hover:text-orange-600 focus:outline-none focus-visible:text-orange-600"
          >
            Impressum
          </a>
          <a
            href="/datenschutz"
            className="transition hover:text-orange-600 focus:outline-none focus-visible:text-orange-600"
          >
            Datenschutz
          </a>
        </div>
      </footer>
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

function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
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

function FocusSection({
  id,
  label,
  title,
  text,
  meta,
  image,
  imageAlt,
  imagePosition = "center",
  imageLoading = "lazy",
  reverse = false,
}: {
  id: string;
  label: string;
  title: string;
  text: string;
  meta: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  imageLoading?: "lazy" | "eager";
  reverse?: boolean;
}) {
  return (
    <article
      id={id}
      className={`scroll-mt-24 overflow-hidden rounded-[2rem] border border-black/10 bg-white/60 shadow-sm backdrop-blur-xl md:grid md:grid-cols-2 ${
        reverse ? "md:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div className="flex flex-col justify-center p-7 md:p-10">
        <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/60">
          {label}
        </p>

        <h2 className="mb-5 max-w-lg text-3xl font-black leading-tight tracking-[-0.04em] md:text-4xl">
          {title}
        </h2>

        <p className="max-w-xl text-base leading-8 text-black/70 md:text-lg">
          {text}
        </p>

        <div className="mt-8 inline-flex w-fit rounded-full border border-black/10 bg-[#d7d5ce] px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-black/65">
          {meta}
        </div>
      </div>

      <div className="relative min-h-[240px] md:min-h-[340px]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          loading={imageLoading}
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          style={{ objectPosition: imagePosition }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>
    </article>
  );
}

function JournalCard({
  category,
  title,
  text,
  tag,
  href,
}: {
  category: string;
  title: string;
  text: string;
  tag: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="mb-5 text-[10px] font-black uppercase tracking-[0.35em] text-black/45">
        {category}
      </p>

      <h3 className="mb-4 text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-orange-600">
        {title}
      </h3>

      <p className="mb-8 leading-7 text-black/65">{text}</p>

      <div className="flex items-center justify-between gap-4">
        <span className="inline-flex rounded-full border border-black/10 bg-[#d7d5ce] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black/65">
          {tag}
        </span>

        {href ? (
          <span className="font-black transition group-hover:translate-x-1 group-hover:text-orange-600">
            →
          </span>
        ) : null}
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="group rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee]"
      >
        {content}
      </a>
    );
  }

  return (
    <article className="rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
      {content}
    </article>
  );
}
function SanityGalleryCard({
  title,
  category,
  image,
  href,
}: {
  title: string;
  category: string;
  image?: HomeGalleryImage;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 focus-visible:ring-offset-[#f5f3ee]"
    >
      <article>
        <div className="relative h-[300px] overflow-hidden bg-[#d7d5ce]">
          {image ? (
            <SanityImage
              src={urlFor(image).width(700).height(900).url()}
              alt={image.alt || title}
              width={700}
              height={900}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm font-black uppercase tracking-[0.28em] text-black/45">
              Kein Bild hinterlegt
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/65">
              {category}
            </p>

            <h3 className="text-2xl font-black tracking-[-0.04em] transition group-hover:text-orange-500">
              {title}
            </h3>
          </div>
        </div>
      </article>
    </a>
  );
}
function GalleryCard({
  title,
  category,
  image,
  alt,
}: {
  title: string;
  category: string;
  image: string;
  alt: string;
}) {
  return (
    <article className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-[300px] overflow-hidden">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-white/65">
            {category}
          </p>

          <h3 className="text-2xl font-black tracking-[-0.04em] transition group-hover:text-orange-500">
            {title}
          </h3>
        </div>
      </div>
    </article>
  );
}

function EventCard({
  date,
  title,
  type,
  text,
  status,
}: {
  date: string;
  title: string;
  type: string;
  text: string;
  status: string;
}) {
  return (
    <article className="rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-black/45">
            {type}
          </p>

          <p className="text-sm font-black uppercase tracking-[0.25em] text-black/60">
            {date}
          </p>
        </div>

        <span className="rounded-full border border-black/10 bg-[#d7d5ce] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-black/65">
          {status}
        </span>
      </div>

      <h3 className="mb-4 text-2xl font-black leading-tight tracking-[-0.04em] transition hover:text-orange-600">
        {title}
      </h3>

      <p className="leading-7 text-black/65">{text}</p>
    </article>
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
    <a
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
    </a>
  );
}