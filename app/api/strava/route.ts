
import { NextResponse } from "next/server";

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
  average_speed?: number;
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

export async function GET() {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(
      { error: "Missing Strava environment variables." },
      { status: 500 }
    );
  }

  try {
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
      return NextResponse.json(
        { error: "Could not refresh Strava access token." },
        { status: tokenResponse.status }
      );
    }

    const tokenData = (await tokenResponse.json()) as StravaTokenResponse;

    const activitiesResponse = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=3&page=1",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        next: {
          revalidate: 900,
        },
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

    const activities = (await activitiesResponse.json()) as StravaActivity[];

    const cleanedActivities = activities.map((activity) => ({
      id: activity.id,
      name: activity.name,
      type: activity.sport_type ?? activity.type,
      distanceKm: formatDistance(activity.distance),
      movingTime: formatTime(activity.moving_time),
      elevationGain: Math.round(activity.total_elevation_gain),
      date: activity.start_date_local,
      url: `https://www.strava.com/activities/${activity.id}`,
    }));

    return NextResponse.json({
      activities: cleanedActivities,
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected Strava API error." },
      { status: 500 }
    );
  }
}