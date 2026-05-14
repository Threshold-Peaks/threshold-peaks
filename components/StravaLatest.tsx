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
          : "rounded-[2rem] border border-black/10 bg-white/70 p-5 shadow-sm backdrop-blur-xl md:p-6"
      }
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-black/40">
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
          className="inline-flex w-fit items-center rounded-full bg-[#d7d5ce] px-4 py-2 text-xs font-black text-black transition hover:bg-[#c9c6bd] hover:text-orange-600"
        >
          Strava öffnen
        </a>
      </div>

      {loading ? (
        <div className="rounded-[1.25rem] bg-[#f5f3ee] p-4">
          <p className="text-sm font-semibold text-black/60">
            Lade Aktivitäten...
          </p>
        </div>
      ) : visibleActivities.length === 0 ? (
        <div className="rounded-[1.25rem] bg-[#f5f3ee] p-4">
          <p className="text-sm font-semibold leading-7 text-black/60">
            Aktuell konnten keine Strava-Aktivitäten geladen werden.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {visibleActivities.map((activity) => (
            <a
              key={activity.id}
              href={activity.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-[1.25rem] border border-black/10 bg-[#f5f3ee] p-4 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-black/40">
                    {translateType(activity.type)}
                  </p>

                  <h3 className="line-clamp-2 text-base font-black leading-tight tracking-[-0.03em] text-black transition group-hover:text-orange-600">
                    {activity.name}
                  </h3>
                </div>

                <span className="text-sm font-black text-black transition group-hover:translate-x-1 group-hover:text-orange-600">
                  →
                </span>
              </div>

              <div className="space-y-2 border-t border-black/10 pt-3">
                <ActivityStat label="Distanz" value={`${activity.distanceKm} km`} />
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