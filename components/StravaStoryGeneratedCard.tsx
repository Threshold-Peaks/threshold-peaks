"use client";

import { useEffect, useMemo, useState } from "react";
import RouteMapLightbox from "@/components/RouteMapLightbox";
import type { StravaStoryActivityManual } from "@/components/StravaStoryActivity";

type ApiStravaActivity = {
  id: number;
  name: string;
  type: string;
  sportType?: string;
  distanceKm: number;
  distanceLabel: string;
  movingTime: number;
  movingTimeLabel: string;
  elevationGain: number;
  elevationLabel: string;
  startDateLocal: string;
  dateLabel: string;
  kudosCount: number;
  rawKudosCount?: number;
  kudoersCount?: number | null;
  url: string;
  summaryPolyline?: string | null;
};

type LoadState = "idle" | "loading" | "success" | "error";

type StravaStoryGeneratedCardProps = {
  stravaUrl?: string;
  fallbackActivity?: StravaStoryActivityManual;
};

export default function StravaStoryGeneratedCard({
  stravaUrl,
  fallbackActivity,
}: StravaStoryGeneratedCardProps) {
  const activityId = useMemo(() => getStravaActivityId(stravaUrl), [stravaUrl]);

  const [activity, setActivity] = useState<ApiStravaActivity | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(
    activityId ? "loading" : "idle",
  );

  useEffect(() => {
    if (!activityId) {
      setActivity(null);
      setLoadState("idle");
      return;
    }

    let isActive = true;

    async function loadActivity() {
      setLoadState("loading");

      try {
        const response = await fetch(
          `/api/strava/activity/${activityId}?ts=${Date.now()}`,
          {
            cache: "no-store",
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "Strava-Aktivität konnte nicht geladen werden.",
          );
        }

        if (isActive) {
          setActivity(data.activity ?? null);
          setLoadState("success");
        }
      } catch {
        if (isActive) {
          setActivity(null);
          setLoadState("error");
        }
      }
    }

    loadActivity();

    return () => {
      isActive = false;
    };
  }, [activityId]);

  const title =
    activity?.name || fallbackActivity?.title || "Aktivität auf Strava";

  const sportType = formatSportType(
    activity?.sportType || activity?.type || fallbackActivity?.sportType,
  );

  const dateLabel = activity?.dateLabel || fallbackActivity?.dateLabel || "";
  const distance = activity?.distanceLabel || fallbackActivity?.distance || "–";
  const elevation =
    activity?.elevationLabel || fallbackActivity?.elevation || "–";
  const duration =
    activity?.movingTimeLabel || fallbackActivity?.duration || "–";

  const kudos = getVisibleKudos(activity, fallbackActivity);
  const url = activity?.url || stravaUrl;

  return (
    <aside className="border-y border-black/10 bg-[#f5f3ee] px-4 py-5 sm:px-5">
      <div className="mb-5 border-b border-black/10 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/35">
          Strava
        </p>
        <h3 className="mt-2 text-lg font-black leading-tight tracking-[-0.04em] text-black md:text-xl">
          Aktivität zur Story
        </h3>
      </div>

      <div className="border-y border-black/10 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-black uppercase tracking-[0.25em] text-black/35">
          <span>{sportType}</span>

          {dateLabel ? (
            <>
              <span className="h-1 w-1 rounded-full bg-black/20" />
              <span>{dateLabel}</span>
            </>
          ) : null}
        </div>

        <h4 className="text-3xl font-black leading-tight tracking-[-0.05em] text-black md:text-4xl">
          {title}
        </h4>

        <div className="mt-7 grid grid-cols-1 divide-y divide-black/10 border-y border-black/10 sm:grid-cols-[0.9fr_0.95fr_1.35fr] sm:divide-x sm:divide-y-0">
          <div className="py-4 sm:pr-4">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-black/30">
              Distanz
            </p>
            <p className="mt-2 whitespace-nowrap text-xl font-black leading-none tracking-[-0.04em] text-black md:text-2xl">
              {distance}
            </p>
          </div>

          <div className="py-4 sm:px-4">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-black/30">
              Höhenmeter
            </p>
            <p className="mt-2 whitespace-nowrap text-xl font-black leading-none tracking-[-0.04em] text-black md:text-2xl">
              {elevation}
            </p>
          </div>

          <div className="py-4 sm:pl-4">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-black/30">
              Zeit
            </p>
            <p className="mt-2 whitespace-nowrap text-xl font-black leading-none tracking-[-0.04em] text-black md:text-2xl">
              {duration}
            </p>
          </div>
        </div>

        <GeneratedRouteMap activityId={activityId} title={title} />

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold text-red-600">
              DEBUG: activityId={activityId ?? "keine ID"} | loadState=
              {loadState} | API={activity?.kudosCount ?? "kein API-Wert"} |
              fallback=
              {fallbackActivity?.kudos ??
                fallbackActivity?.kudosCount ??
                "kein Fallback"}
            </p>

            <p className="text-sm font-black text-orange-600">
              {loadState === "loading" && activityId
                ? "Kudos laden …"
                : typeof kudos === "number"
                  ? `${kudos} ${kudos === 1 ? "Kudo" : "Kudos"}`
                  : "Threshold Peaks"}
            </p>
          </div>

          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center border border-black/10 px-5 py-3 text-[10px] font-black uppercase tracking-[0.24em] text-black/45 transition hover:border-orange-500 hover:text-orange-600"
            >
              Auf Strava ansehen <span className="ml-2">→</span>
            </a>
          ) : null}
        </div>

        {loadState === "error" && activityId ? (
          <p className="mt-3 text-xs font-semibold leading-6 text-black/35">
            Strava-Daten konnten gerade nicht live geladen werden. Es werden die
            hinterlegten Fallback-Daten angezeigt.
          </p>
        ) : null}
      </div>
    </aside>
  );
}

function GeneratedRouteMap({
  activityId,
  title,
}: {
  activityId?: string | null;
  title: string;
}) {
  if (!activityId) return null;

  return (
    <figure className="-mx-4 mt-7 border-y border-black/10 py-5 sm:-mx-5">
      <RouteMapLightbox
        src={`/images/runs/${activityId}-map.png`}
        alt={`Karte der Laufroute ${title}`}
        title={`Karte der Laufroute ${title}`}
        imageClassName="scale-[1.18]"
      />
    </figure>
  );
}

function getVisibleKudos(
  activity: ApiStravaActivity | null,
  fallbackActivity?: StravaStoryActivityManual,
) {
  if (typeof activity?.kudosCount === "number") {
    return activity.kudosCount;
  }

  if (typeof fallbackActivity?.kudos === "number") {
    return fallbackActivity.kudos;
  }

  if (typeof fallbackActivity?.kudosCount === "number") {
    return fallbackActivity.kudosCount;
  }

  return null;
}

function getStravaActivityId(url?: string) {
  if (!url) return null;

  const directMatch = url.match(/strava\.com\/activities\/(\d+)/i);
  if (directMatch?.[1]) return directMatch[1];

  try {
    const parsedUrl = new URL(url);
    const pathMatch = parsedUrl.pathname.match(/\/activities\/(\d+)/i);
    return pathMatch?.[1] ?? null;
  } catch {
    return null;
  }
}

function formatSportType(type?: string) {
  const sportTypes: Record<string, string> = {
    Run: "Running",
    VirtualRun: "Running",
    TrailRun: "Trail",
    Ride: "Cycling",
    VirtualRide: "Cycling",
    GravelRide: "Gravel",
    MountainBikeRide: "MTB",
    Walk: "Walk",
    Hike: "Hike",
    Workout: "Workout",
    running: "Running",
    cycling: "Cycling",
    gravel: "Gravel",
    workout: "Workout",
    other: "Aktivität",
  };

  return type ? (sportTypes[type] ?? type) : "Running";
}