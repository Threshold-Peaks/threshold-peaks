import Image from "next/image";
import type { ReactNode } from "react";
import StravaLatest from "@/components/StravaLatest";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f7f5] text-[#111217]">
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

            <div className="pointer-events-none absolute inset-0 bg-[#f7f7f5]/55 md:hidden" />

            <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-[520px] bg-gradient-to-r from-[#f7f7f5] via-[#f7f7f5]/55 to-transparent md:block" />

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#f7f7f5] via-[#f7f7f5]/80 to-transparent md:h-56" />
          </div>
        </div>

        {/* HEADER */}
        <header className="relative z-30 flex h-20 items-center justify-between px-6 md:h-24 md:justify-start md:px-10 lg:px-20">
          <a href="#" className="flex items-center gap-3">
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
          <nav className="ml-12 hidden items-center gap-7 text-sm font-semibold md:flex">
            <NavLink href="#">Home</NavLink>
            <NavLink href="#about">About</NavLink>
            <NavLink href="#running">Running</NavLink>
            <NavLink href="#cycling">Cycling</NavLink>
            <NavLink href="#music">Music</NavLink>
            <NavLink href="#journal">Journal</NavLink>
            <NavLink href="#gallery">Gallery</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </nav>

          {/* Mobile Navigation */}
          <details className="group relative md:hidden">
            <summary className="list-none rounded-full border border-black/10 bg-white/70 px-5 py-3 text-xs font-black uppercase tracking-[0.28em] shadow-sm backdrop-blur-md transition active:scale-95 [&::-webkit-details-marker]:hidden">
              Menu
            </summary>

            <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-3xl border border-black/10 bg-white/90 p-3 shadow-xl backdrop-blur-xl">
              <MobileNavLink href="#">Home</MobileNavLink>
              <MobileNavLink href="#about">About</MobileNavLink>
              <MobileNavLink href="#running">Running</MobileNavLink>
              <MobileNavLink href="#cycling">Cycling</MobileNavLink>
              <MobileNavLink href="#music">Music</MobileNavLink>
              <MobileNavLink href="#journal">Journal</MobileNavLink>
              <MobileNavLink href="#gallery">Gallery</MobileNavLink>
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
            className="mt-8 inline-flex min-w-[210px] items-center justify-between rounded-md bg-[#111217] px-7 py-4 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl md:mt-9 md:min-w-[220px]"
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
            href="#running"
            icon={<RunningIcon />}
            title="LAUFEN"
            text="Training, Ausdauer, Disziplin und der Moment, wenn der Kopf frei wird."
          />

          <FeatureCard
            href="#cycling"
            icon={<CyclingIcon />}
            title="RADFAHREN"
            text="Rennrad, Gravelbike und neue Wege als Ausgleich zum Lauftraining."
          />

          <FeatureCard
            href="#music"
            icon={<MusicIcon />}
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
            href="#running"
            className="mt-8 inline-flex min-w-[210px] items-center justify-between rounded-md bg-[#111217] px-7 py-4 text-sm font-bold text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl md:mt-9 md:min-w-[220px]"
          >
            Zu meinen Bereichen <span>→</span>
          </a>
        </div>

        <div className="relative mx-auto h-[400px] w-full max-w-[430px] overflow-hidden rounded-3xl shadow-sm md:h-[470px] md:ml-0">
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
            id="running"
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
            id="cycling"
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
            id="music"
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
            <JournalCard
              category="Running Notes"
              title="Training, Fokus und Fortschritt"
              text="Gedanken rund ums Laufen, Bahntraining, Wettkämpfe und die kleinen Schritte, die am Ende den Unterschied machen."
              tag="Laufen"
            />

            <JournalCard
              category="Gravel Diaries"
              title="Wege, Wälder und Ausgleich"
              text="Rennrad, Gravelbike und Touren draußen. Alles, was Bewegung leichter macht und den Kopf freipustet."
              tag="Radfahren"
            />

            <JournalCard
              category="Sound & Motion"
              title="Beats für lange Strecken"
              text="Elektronische Musik, DJ-Sets, Tracks und die Verbindung zwischen Rhythmus, Energie und Bewegung."
              tag="Musik"
            />
          </div>
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
          </div>
        </div>
      </section>

      {/* MUSIC BAR */}
      <section className="px-6 pb-12 md:px-10 lg:px-20">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-8 rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.45em]">
              Aktuell läuft
            </p>
            <h3 className="text-lg font-black md:text-xl">
              Massano - The Feeling
            </h3>
            <p className="mt-1 text-sm text-black/55">
              Electronic / Melodic Techno
            </p>
          </div>

          <div className="flex h-12 flex-1 items-center justify-start gap-[3px] overflow-hidden md:justify-center">
            {Array.from({ length: 70 }).map((_, index) => (
              <span
                key={index}
                className="w-[2px] shrink-0 rounded-full bg-black/45"
                style={{
                  height: `${8 + Math.abs(Math.sin(index * 0.55)) * 28}px`,
                }}
              />
            ))}
          </div>

          <span className="inline-flex justify-center rounded-md bg-[#111217] px-7 py-4 text-sm font-bold text-white shadow-lg">
            SoundCloud folgt ●
          </span>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="scroll-mt-24 px-6 pb-14 md:px-10 md:pb-16 lg:px-20"
      >
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-black/10 bg-[#111217] text-white shadow-xl">
          <div className="grid gap-10 p-8 md:grid-cols-[0.9fr_1.1fr] md:p-12">
            <div>
              <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-white/55">
                Kontakt
              </p>

              <h2 className="mb-6 text-3xl font-black leading-tight tracking-[-0.04em] md:text-5xl">
                Lass uns in Verbindung bleiben.
              </h2>

              <p className="max-w-md text-base leading-8 text-white/70 md:text-lg">
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

        <p>© 2024 Threshold Peaks. Alle Rechte vorbehalten.</p>

        <div className="flex gap-10">
          <a href="/impressum">Impressum</a>
          <a href="/datenschutz">Datenschutz</a>
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
    <a href={href} className="group relative pb-2">
      <span>{children}</span>
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-black transition-all duration-300 group-hover:w-full" />
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
      className="block rounded-2xl px-4 py-3 text-sm font-bold hover:bg-black/5"
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

        <div className="mt-8 inline-flex w-fit rounded-full border border-black/10 bg-[#f7f7f5] px-5 py-3 text-xs font-black uppercase tracking-[0.25em] text-black/65">
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

function FeatureCard({
  href,
  icon,
  title,
  text,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <article className="flex min-h-[130px] gap-5 rounded-2xl border border-black/10 bg-white/75 p-6 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl md:min-h-[140px] md:p-6">
      <div className="mt-1 h-9 w-9 shrink-0 md:h-10 md:w-10">{icon}</div>

      <div>
        <h3 className="mb-3 text-base font-black tracking-wide">{title}</h3>

        <p className="mb-5 max-w-[260px] text-sm leading-6 text-black/65">
          {text}
        </p>

        <a href={href} className="text-sm font-black">
          Mehr erfahren <span className="ml-4">→</span>
        </a>
      </div>
    </article>
  );
}

function JournalCard({
  category,
  title,
  text,
  tag,
}: {
  category: string;
  title: string;
  text: string;
  tag: string;
}) {
  return (
    <article className="rounded-[2rem] border border-black/10 bg-white/75 p-7 shadow-sm backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-xl">
      <p className="mb-5 text-[10px] font-black uppercase tracking-[0.35em] text-black/45">
        {category}
      </p>

      <h3 className="mb-4 text-2xl font-black leading-tight tracking-[-0.04em]">
        {title}
      </h3>

      <p className="mb-8 leading-7 text-black/65">{text}</p>

      <span className="inline-flex rounded-full border border-black/10 bg-[#f7f7f5] px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-black/55">
        {tag}
      </span>
    </article>
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

          <h3 className="text-2xl font-black tracking-[-0.04em]">{title}</h3>
        </div>
      </div>
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
      className="group rounded-3xl border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-1 hover:bg-white/[0.1]"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-black">{title}</h3>
        <span className="transition group-hover:translate-x-1">→</span>
      </div>

      <p className="leading-7 text-white/60">{text}</p>
    </a>
  );
}

function RunningIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <path
        d="M28 8a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        fill="currentColor"
      />
      <path
        d="M19 16l7-5 6 5 5 1M26 11l-4 12 8 6M22 23l-8 5-4 10M30 29l2 9 8 5"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CyclingIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="h-full w-full">
      <circle cx="18" cy="43" r="11" stroke="currentColor" strokeWidth="4" />
      <circle cx="48" cy="43" r="11" stroke="currentColor" strokeWidth="4" />
      <path
        d="M29 20h10l-8 23H18l11-23Zm10 0 9 23M34 13h8M30 20l-5-7"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="10" r="4" fill="currentColor" />
    </svg>
  );
}

function MusicIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" className="h-full w-full">
      <path
        d="M18 34V12l22-4v22"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="35" r="6" fill="currentColor" />
      <circle cx="35" cy="31" r="6" fill="currentColor" />
    </svg>
  );
}