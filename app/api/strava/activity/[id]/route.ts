import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StravaTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
};

type DetailedStravaActivity = {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  distance: number;
  moving_time: number;
  elapsed_time?: number;
  start_date: string;
  start_date_local: string;
  total_elevation_gain: number;
  kudos_count?: number;
  map?: {
    id?: string;
    polyline?: string | null;
    summary_polyline?: string | null;
  };
};

type StravaKudoer = {
  firstname?: string;
  lastname?: string;
};

function formatDistanceLabel(meters: number) {
  return `${new Intl.NumberFormat("de-DE", {
    maximumFractionDigits: 1,
    minimumFractionDigits: meters < 10000 ? 1 : 0,
  }).format(meters / 1000)} km`;
}

function formatTimeLabel(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} Std. ${minutes} Min.`;
  }

  return `${minutes} Min.`;
}

function formatDateLabel(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

async function getStravaAccessToken() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing Strava environment variables.");
  }

  const tokenResponse = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    throw new Error("Could not refresh Strava access token.");
  }

  const tokenData = (await tokenResponse.json()) as StravaTokenResponse;
  return tokenData.access_token;
}

async function getKudoersCount(accessToken: string, activityId: string) {
  const response = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}/kudos?per_page=200&page=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const kudoers = (await response.json()) as StravaKudoer[];
  return Array.isArray(kudoers) ? kudoers.length : null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: "Invalid Strava activity id." },
      { status: 400 }
    );
  }

  try {
    const accessToken = await getStravaAccessToken();

    const activityResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${id}?include_all_efforts=false`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!activityResponse.ok) {
      const errorText = await activityResponse.text();

      return NextResponse.json(
        {
          error: "Could not fetch Strava activity.",
          status: activityResponse.status,
          details: errorText,
        },
        { status: activityResponse.status }
      );
    }

    const activity = (await activityResponse.json()) as DetailedStravaActivity;
    const summaryPolyline =
      activity.map?.summary_polyline ?? activity.map?.polyline ?? null;

    const rawKudosCount = activity.kudos_count ?? 0;
    const kudoersCount = await getKudoersCount(accessToken, id);
    const finalKudosCount = kudoersCount ?? rawKudosCount;

    return NextResponse.json(
      {
        activity: {
          id: activity.id,
          name: activity.name,
          type: activity.sport_type ?? activity.type,
          sportType: activity.sport_type ?? activity.type,
          distanceKm: Number((activity.distance / 1000).toFixed(2)),
          distanceLabel: formatDistanceLabel(activity.distance),
          movingTime: activity.moving_time,
          movingTimeLabel: formatTimeLabel(activity.moving_time),
          elevationGain: Math.round(activity.total_elevation_gain),
          elevationLabel: `${Math.round(activity.total_elevation_gain)} m`,
          startDate: activity.start_date,
          startDateLocal: activity.start_date_local,
          dateLabel: formatDateLabel(activity.start_date_local),
          kudosCount: finalKudosCount,
          rawKudosCount,
          kudoersCount,
          summaryPolyline,
          url: `https://www.strava.com/activities/${activity.id}`,
        },
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unexpected Strava API error.",
      },
      { status: 500 }
    );
  }
}
