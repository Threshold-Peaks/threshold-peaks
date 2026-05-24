"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type StravaStoryActivityManual = {
  title?: string;
  sportType?: string;
  dateLabel?: string;
  distance?: string;
  elevation?: string;
  duration?: string;
  kudos?: number;
  kudosCount?: number;
  mapImage?: unknown;
};

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
  url: string;
  summaryPolyline?: string | null;
};

type LoadState = "idle" | "loading" | "success" | "error";

export default function StravaStoryActivity({
  stravaUrl,
  fallbackActivity,
}: {
  stravaUrl?: string;
  fallbackActivity?: StravaStoryActivityManual;
}) {
  const activityId = useMemo(() => getStravaActivityId(stravaUrl), [stravaUrl]);
  const [activity, setActivity] = useState<ApiStravaActivity | null>(null);
  const [loadState, setLoadState] = useState<LoadState>(activityId ? "loading" : "idle");

  useEffect(() => {
    if (!activityId) {
      return;
    }

    let isActive = true;

    async function loadActivity() {
      setLoadState("loading");

      try {
        const response = await fetch(`/api/strava/activity/${activityId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Strava-Aktivität konnte nicht geladen werden.");
        }

        if (isActive) {
          setActivity(data.activity);
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

  const visibleActivity =
    activityId && activity?.id.toString() === activityId ? activity : null;
  const visibleLoadState = activityId ? loadState : "idle";
  const title =
    visibleActivity?.name || fallbackActivity?.title || "Aktivität auf Strava";
  const sportType =
    visibleActivity?.sportType ||
    visibleActivity?.type ||
    fallbackActivity?.sportType;
  const dateLabel = visibleActivity?.dateLabel || fallbackActivity?.dateLabel;
  const distance = visibleActivity?.distanceLabel || fallbackActivity?.distance;
  const elevation = visibleActivity?.elevationLabel || fallbackActivity?.elevation;
  const duration = visibleActivity?.movingTimeLabel || fallbackActivity?.duration;
  const kudos =
    typeof visibleActivity?.kudosCount === "number"
      ? visibleActivity.kudosCount
      : fallbackActivity?.kudos ?? fallbackActivity?.kudosCount;
  const url = visibleActivity?.url || stravaUrl;
  const hasAnyData = Boolean(title || distance || elevation || duration || activityId);

  return (
    <aside className="border-t border-black/10 pt-5">
      <div className="mb-5 border-b border-black/10 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/35">
          Strava
        </p>
        <h3 className="mt-2 text-lg font-black leading-tight tracking-[-0.04em] text-black md:text-xl">
          Aktivität zur Story
        </h3>
      </div>

      <div className="max-w-[430px] border-y border-black/10 bg-transparent py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-black uppercase tracking-[0.2em] text-black/35">
              <span>{formatSportType(sportType)}</span>
              {dateLabel ? (
                <>
                  <span className="h-1 w-1 rounded-full bg-black/25" />
                  <span>{dateLabel}</span>
                </>
              ) : null}
            </div>

            <h4 className="text-2xl font-black leading-tight tracking-[-0.045em] text-black md:text-3xl">
              {title}
            </h4>
          </div>


        </div>

        {visibleLoadState === "loading" ? (
          <div className="mt-6 border-y border-black/10 py-4">
            <p className="text-sm font-semibold leading-7 text-black/45">
              Strava-Daten werden geladen …
            </p>
          </div>
        ) : null}

        {hasAnyData ? (
          <div className="mt-6 grid grid-cols-3 gap-4 border-y border-black/10 py-4">
            <StravaMetric label="Distanz" value={distance} />
            <StravaMetric label="Höhenmeter" value={elevation} />
            <StravaMetric label="Zeit" value={duration} />
          </div>
        ) : null}

        {visibleActivity?.summaryPolyline ? (
          <StravaRouteSketch polyline={visibleActivity.summaryPolyline} />
        ) : (
          <div className="mt-5 flex min-h-[190px] items-center justify-center border-y border-dashed border-black/15 bg-transparent px-6 py-10 text-center">
            <p className="max-w-sm text-sm font-semibold leading-7 text-black/45">
              {visibleLoadState === "error"
                ? "Die Strava-Daten konnten gerade nicht geladen werden. Die manuell gepflegten Werte bleiben als Fallback sichtbar."
                : activityId
                  ? "Für diese Aktivität wurde keine Route von Strava geliefert."
                  : "Hinterlege einen Strava-Link, damit die Aktivitätsdaten automatisch geladen werden."}
            </p>
          </div>
        )}

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm font-black text-orange-600">
            {typeof kudos === "number" ? `${kudos} ${kudos === 1 ? "Kudo" : "Kudos"}` : "Threshold Peaks"}
          </p>

          {url ? (
            <Link
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center border border-black/10 bg-transparent px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-black/55 transition hover:-translate-y-0.5 hover:border-orange-500 hover:text-orange-600"
            >
              Auf Strava ansehen →
            </Link>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function StravaMetric({ label, value }: { label: string; value?: string }) {
  return (
    <div className="border-l border-black/10 pl-4 first:border-l-0 first:pl-0">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/30">
        {label}
      </p>
      <p className="mt-1 text-xl font-black leading-tight tracking-[-0.04em] text-black md:text-2xl">
        {value || "–"}
      </p>
    </div>
  );
}

function StravaRouteSketch({ polyline }: { polyline: string }) {
  const pathData = useMemo(() => createSvgPathFromPolyline(polyline), [polyline]);

  if (!pathData) {
    return (
      <div className="mt-5 flex min-h-[190px] items-center justify-center border-y border-dashed border-black/15 bg-transparent px-6 py-10 text-center">
        <p className="max-w-sm text-sm font-semibold leading-7 text-black/45">
          Die Route konnte nicht gezeichnet werden.
        </p>
      </div>
    );
  }

  return (
    <figure className="mt-5 overflow-hidden border-y border-black/10 bg-transparent">
      <svg
        viewBox="0 0 100 64"
        role="img"
        aria-label="Minimalistische Routenskizze der Strava-Aktivität"
        className="h-auto w-full"
      >
        <rect width="100" height="64" fill="transparent" />
        <path
          d={pathData}
          fill="none"
          stroke="rgba(17,18,23,0.12)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={pathData}
          fill="none"
          stroke="#f97316"
          strokeWidth="1.15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </figure>
  );
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

  return type ? (sportTypes[type] ?? type) : "Aktivität";
}

function decodePolyline(encoded: string) {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: Array<[number, number]> = [];

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    result = 0;
    shift = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
}

function createSvgPathFromPolyline(polyline: string) {
  const points = decodePolyline(polyline);
  if (points.length < 2) return null;

  const lats = points.map(([lat]) => lat);
  const lngs = points.map(([, lng]) => lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latSpan = maxLat - minLat || 1;
  const lngSpan = maxLng - minLng || 1;
  const padding = 8;
  const width = 100 - padding * 2;
  const height = 64 - padding * 2;

  return points
    .map(([lat, lng], index) => {
      const x = padding + ((lng - minLng) / lngSpan) * width;
      const y = padding + (1 - (lat - minLat) / latSpan) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}
