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

export default function StravaLatest() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section className="p-0">
  <div className="rounded-3xl border border-black/10 bg-white/75 p-4 shadow-sm backdrop-blur-xl md:p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.45em] text-black/55">
              Strava
            </p>

            <h2 className="text-2xl font-black leading-tight tracking-[-0.04em] md:text-3xl">
  Zuletzt auf Strava.
</h2>
          </div>

          <a
            href="https://www.strava.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-black text-black/70 transition hover:text-black"
          >
            Auf Strava ansehen →
          </a>
        </div>

        {loading ? (
          <p className="text-black/60">Lade Aktivitäten...</p>
        ) : activities.length === 0 ? (
          <p className="text-black/60">
            Aktuell konnten keine Strava-Aktivitäten geladen werden.
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {activities.map((activity) => (
              <a
                key={activity.id}
                href={activity.url}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-black/10 bg-[#f7f7f5] p-4 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.35em] text-black/45">
                      {translateType(activity.type)}
                    </p>

                    <h3 className="text-lg font-black leading-tight">
                      {activity.name}
                    </h3>
                  </div>

                  <span className="transition group-hover:translate-x-1">→</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-black/45">Distanz</p>
                    <p className="font-black">{activity.distanceKm} km</p>
                  </div>

                  <div>
                    <p className="text-black/45">Zeit</p>
                    <p className="font-black">{activity.movingTime}</p>
                  </div>

                  <div>
                    <p className="text-black/45">Höhenm.</p>
                    <p className="font-black">{activity.elevationGain} m</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function translateType(type: string) {
  if (type === "Run") return "Laufen";
  if (type === "Ride") return "Radfahren";
  if (type === "Walk") return "Gehen";
  if (type === "Hike") return "Wandern";

  return type;
}