"use client";

import { useEffect, useState } from "react";

type StravaActivity = {
  id: number;
  name: string;
  type: string;
  distanceKm: number;
  movingTime: string;
  elevationGain: number;
  kudosCount?: number;
  date: string;
  url: string;
};

type StravaLatestProps = {
  variant?: "default" | "footer";
};

const subtleLinkClass =
  "group inline-flex w-fit items-center gap-2 border-b border-black/20 pb-2 text-[10px] font-black uppercase tracking-[0.26em] text-black/45 transition hover:border-orange-500 hover:text-orange-600 focus:outline-none focus-visible:border-orange-500 focus-visible:text-orange-600";

export default function StravaLatest({ variant = "default" }: StravaLatestProps) {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const isFooter = variant === "footer";

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await fetch(`/api/strava?ts=${Date.now()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Could not load Strava activities.");
        }

        const data = await response.json();

        if (data.activities) {
          setActivities(data.activities);
        }
      } catch {
        setActivities([]);
      } finally {
        setLoading(false);
      }
    }

    loadActivities();
  }, []);

  const visibleActivities = activities.slice(0, 3);

  return (
    <section
      className={
        isFooter
          ? ""
          : "rounded-[2rem] border border-black/10 bg-white/50 p-5 shadow-[0_1px_2px_rgba(17,18,23,0.06)] ring-1 ring-white/70 backdrop-blur-2xl md:p-6"
      }
    >
      <div className="mb-5 flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="relative pl-6">
          <span className="absolute left-0 top-1 h-full w-px bg-black/15" />
          <span className="absolute -left-[4px] top-1 h-2.5 w-2.5 rounded-full border border-black/20 bg-[#f5f3ee]" />

          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-black/35">
            Strava
          </p>

          <h2
            className={
              isFooter
                ? "text-xl font-black leading-tight tracking-[-0.04em] text-black md:text-2xl"
                : "text-2xl font-black leading-tight tracking-[-0.04em] text-black md:text-3xl"
            }
          >
            Aktuelle Aktivitäten
          </h2>
        </div>

        <a
          href="https://www.strava.com/athletes/47713057"
          target="_blank"
          rel="noreferrer"
          className={subtleLinkClass}
        >
          Strava öffnen
          <span className="text-black/30 transition group-hover:translate-x-1 group-hover:text-orange-600">
            →
          </span>
        </a>
      </div>

      {loading ? (
        <StravaNotice text="Lade Aktivitäten..." />
      ) : visibleActivities.length === 0 ? (
        <StravaNotice text="Aktuell konnten keine Strava-Aktivitäten geladen werden." />
      ) : (
        <div className="divide-y divide-black/10 border-y border-black/10">
          {visibleActivities.map((activity) => (
            <a
              key={activity.id}
              href={activity.url}
              target="_blank"
              rel="noreferrer"
              className="group grid gap-4 py-5 text-left transition hover:bg-white/40 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-3"
            >
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black uppercase tracking-[0.24em] text-black/35">
                  <span>{translateType(activity.type)}</span>
                  <span className="h-1 w-1 rounded-full bg-black/25" />
                  <span>{formatStravaDate(activity.date)}</span>
                </div>

                <h3 className="line-clamp-2 text-xl font-black leading-tight tracking-[-0.04em] text-black transition group-hover:text-orange-600">
                  {activity.name}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-3 md:justify-end">
                <ActivityStat
                  label="Distanz"
                  value={`${formatDistance(activity.distanceKm)} km`}
                />
                <ActivityStat label="Zeit" value={activity.movingTime} />
                <ActivityStat
                  label="Höhenm."
                  value={`${Math.round(activity.elevationGain)} m`}
                />
                <ActivityStat
                  label="Kudos"
                  value={formatKudos(activity.kudosCount)}
                />

                <span className="hidden text-black/30 transition group-hover:translate-x-1 group-hover:text-orange-600 md:block">
                  →
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

function StravaNotice({ text }: { text: string }) {
  return (
    <div className="border-y border-black/10 py-5">
      <p className="text-sm font-semibold leading-7 text-black/60">{text}</p>
    </div>
  );
}

function ActivityStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[72px] border-l border-black/10 pl-3">
      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-black/30">
        {label}
      </p>
      <p className="mt-1 text-sm font-black leading-5 text-black/75">
        {value}
      </p>
    </div>
  );
}

function formatDistance(distanceKm: number) {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 1,
    minimumFractionDigits: distanceKm < 10 ? 1 : 0,
  }).format(distanceKm);
}

function formatKudos(kudosCount?: number) {
  return new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 0,
  }).format(kudosCount ?? 0);
}

function formatStravaDate(date: string) {
  if (!date) return "Aktivität";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function translateType(type: string) {
  if (type === "Run") return "Laufen";
  if (type === "Ride") return "Radfahren";
  if (type === "Walk") return "Gehen";
  if (type === "Hike") return "Wandern";

  return type;
}
