import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type StravaTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
};

type StravaActivity = {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  start_date: string;
  start_date_local: string;
  total_elevation_gain: number;
  kudos_count?: number;
  average_speed?: number;
};

type StravaKudoer = {
  firstname?: string;
  lastname?: string;
};

function formatDistance(meters: number) {
  return Number((meters / 1000).toFixed(2));
}

function formatTime(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }

  return `${minutes}min`;
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

async function getDetailedActivity(accessToken: string, activityId: number) {
  const activityResponse = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}?include_all_efforts=false`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!activityResponse.ok) {
    return null;
  }

  return (await activityResponse.json()) as StravaActivity;
}

async function getKudoersCount(accessToken: string, activityId: number) {
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

export async function GET() {
  try {
    const accessToken = await getStravaAccessToken();

    const activitiesResponse = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=3&page=1",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      }
    );

    if (!activitiesResponse.ok) {
      const errorText = await activitiesResponse.text();

      return NextResponse.json(
        {
          error: "Could not fetch Strava activities.",
          status: activitiesResponse.status,
          details: errorText,
        },
        { status: activitiesResponse.status }
      );
    }

    const summaryActivities =
      (await activitiesResponse.json()) as StravaActivity[];

    const detailedActivities = await Promise.all(
      summaryActivities.map(async (summaryActivity) => {
        const detailedActivity = await getDetailedActivity(
          accessToken,
          summaryActivity.id
        );

        return detailedActivity ?? summaryActivity;
      })
    );

    const cleanedActivities = await Promise.all(
      detailedActivities.map(async (activity) => {
        const rawKudosCount = activity.kudos_count ?? 0;
        const kudoersCount = await getKudoersCount(accessToken, activity.id);

        return {
          id: activity.id,
          name: activity.name,
          type: activity.sport_type ?? activity.type,
          distanceKm: formatDistance(activity.distance),
          movingTime: formatTime(activity.moving_time),
          elevationGain: Math.round(activity.total_elevation_gain),
          kudosCount: kudoersCount ?? rawKudosCount,
          date: activity.start_date_local,
          url: `https://www.strava.com/activities/${activity.id}`,
        };
      })
    );

    return NextResponse.json(
      {
        activities: cleanedActivities,
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
