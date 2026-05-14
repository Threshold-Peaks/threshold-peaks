"use client";

import { useEffect, useState } from "react";

type StravaActivity = {
  id: number;
  name: string;
  type: string;
  distanceKm: number;
  movingTime: string;
  elevationGain: number;
  date: string;
  url: string;
};

type StravaLatestProps = {
  variant?: "default" | "footer";
};

const subtleLinkClass =
  "group inline-flex w-fit items-center gap-2 text-[10px] font-black uppercase tracking-[0.26em] text-black/45 transition hover:text-orange-600 focus:outline-none focus-visible:text-orange-600";

export default function StravaLatest({ variant = "default" }: StravaLatestProps) {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const isFooter = variant === "footer";

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await fetch("/api/strava");
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
          : "rounded-[2rem] border border-black/10 bg-white/75 p-5 shadow-sm ring-1 ring-white/60 backdrop-blur-xl md:p-6"
      }
    >
      <div className="mb-6 flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
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
          <span className="h-px w-6 bg-black/20 transition group-hover:bg-orange-600" />
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
        <div className="grid gap-4 md:grid-cols-3">
          {visibleActivities.map((activity) => (
            <a
              key={activity.id}
              href={activity.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[1.5rem] border border-black/10 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:bg-[#f5f3ee] hover:shadow-md"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-black/35">
                    {translateType(activity.type)}
                  </p>

                  <h3 className="line-clamp-2 text-base font-black leading-tight tracking-[-0.03em] text-black transition group-hover:text-orange-600">
                    {activity.name}
                  </h3>
                </div>

                <span className="text-sm font-black text-black/30 transition group-hover:translate-x-1 group-hover:text-orange-600">
                  →
                </span>
              </div>

              <div className="space-y-2.5 border-t border-black/10 pt-4">
                <ActivityStat
                  label="Distanz"
                  value={`${activity.distanceKm} km`}
                />
                <ActivityStat label="Zeit" value={activity.movingTime} />
                <ActivityStat
                  label="Höhenm."
                  value={`${activity.elevationGain} m`}
                />
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
    <div className="rounded-[1.5rem] border border-black/10 bg-white/70 p-5 shadow-sm">
      <p className="text-sm font-semibold leading-7 text-black/60">{text}</p>
    </div>
  );
}

function ActivityStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-xs md:text-sm">
      <span className="font-semibold text-black/45">{label}</span>
      <span className="text-right font-black text-black">{value}</span>
    </div>
  );
}

function translateType(type: string) {
  if (type === "Run") return "Laufen";
  if (type === "Ride") return "Radfahren";
  if (type === "Walk") return "Gehen";
  if (type === "Hike") return "Wandern";

  return type;
}
