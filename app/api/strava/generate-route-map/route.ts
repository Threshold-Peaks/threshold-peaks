import { createClient } from "@sanity/client";
import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { generateRouteMapForActivity } from "@/scripts/generate-route-map";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 60;

type RouteMapStatus = "generating" | "ready" | "failed";

type SanityImageField = {
  asset?: {
    _ref?: string;
    _id?: string;
  } | null;
} | null;

type JournalPostRouteMapDoc = {
  _id: string;
  _type: "journalPost";
  title?: string;
  stravaUrl?: string;
  stravaActivityUrl?: string;
  stravaActivityId?: string;
  routeMapImage?: SanityImageField;
  routeMapStatus?: RouteMapStatus;
  routeMapError?: string;
};

type WebhookPayload = {
  _id?: string;
  document?: {
    _id?: string;
  };
  ids?: {
    created?: string[];
    updated?: string[];
  };
};

const journalPostRouteMapQuery = `*[_id == $id && _type == "journalPost"][0]{
  _id,
  _type,
  title,
  stravaUrl,
  stravaActivityUrl,
  stravaActivityId,
  routeMapImage,
  routeMapStatus,
  routeMapError
}`;

function getSanityWriteClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion =
    process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-11";
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId || !dataset || !token) {
    throw new Error(
      "Missing Sanity environment variables for route map generation.",
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}

function safeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function isAuthorized(request: Request) {
  const secret = process.env.STRAVA_ROUTE_MAP_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("Missing STRAVA_ROUTE_MAP_WEBHOOK_SECRET.");
  }

  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  const providedSecret =
    request.headers.get("x-strava-route-map-secret") ||
    request.headers.get("x-sanity-webhook-secret") ||
    request.headers.get("sanity-webhook-secret") ||
    bearerToken;

  return Boolean(providedSecret && safeEquals(providedSecret, secret));
}

function getDocumentId(payload: WebhookPayload) {
  return (
    payload._id ||
    payload.document?._id ||
    payload.ids?.updated?.[0] ||
    payload.ids?.created?.[0] ||
    null
  );
}

export function getStravaActivityIdFromUrl(url?: string | null) {
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

function normalizeActivityId(activityId?: string | null) {
  if (!activityId) return null;

  const trimmed = activityId.trim();
  return /^\d+$/.test(trimmed) ? trimmed : null;
}

function getTargetActivityId(post: JournalPostRouteMapDoc) {
  return (
    getStravaActivityIdFromUrl(post.stravaActivityUrl) ||
    getStravaActivityIdFromUrl(post.stravaUrl) ||
    normalizeActivityId(post.stravaActivityId)
  );
}

function hasImageAsset(image?: SanityImageField) {
  return Boolean(image?.asset?._ref || image?.asset?._id);
}

function shouldSkipGeneration(
  post: JournalPostRouteMapDoc,
  activityId: string,
  force: boolean,
) {
  if (force || post.stravaActivityId !== activityId) {
    return null;
  }

  if (post.routeMapStatus === "ready" && hasImageAsset(post.routeMapImage)) {
    return "Route map already exists for this activity.";
  }

  if (post.routeMapStatus === "generating") {
    return "Route map generation is already in progress for this activity.";
  }

  if (post.routeMapStatus === "failed" && post.routeMapError) {
    return "Route map generation already failed for this activity.";
  }

  return null;
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected route map error.";
}

export async function POST(request: Request) {
  let failureDocumentId: string | null = null;

  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const payload = (await request.json()) as WebhookPayload;
    const documentId = getDocumentId(payload);
    failureDocumentId = documentId;
    const force = new URL(request.url).searchParams.get("force") === "1";

    if (!documentId) {
      return NextResponse.json(
        { error: "Missing journalPost document id in webhook payload." },
        { status: 400 },
      );
    }

    if (documentId.startsWith("drafts.")) {
      return NextResponse.json({ skipped: true, reason: "Draft ignored." });
    }

    const sanityClient = getSanityWriteClient();
    const post = await sanityClient.fetch<JournalPostRouteMapDoc | null>(
      journalPostRouteMapQuery,
      { id: documentId },
    );

    if (!post) {
      return NextResponse.json(
        { error: "journalPost not found." },
        { status: 404 },
      );
    }

    const activityId = getTargetActivityId(post);

    if (!activityId) {
      return NextResponse.json({
        skipped: true,
        reason: "No Strava activity URL or ID found.",
      });
    }

    const skipReason = shouldSkipGeneration(post, activityId, force);

    if (skipReason) {
      return NextResponse.json({
        skipped: true,
        activityId,
        reason: skipReason,
      });
    }

    await sanityClient
      .patch(post._id)
      .set({
        stravaActivityId: activityId,
        routeMapStatus: "generating",
      })
      .unset(["routeMapError"])
      .commit({ tag: "strava.route-map.generating" });

    const generatedMap = await generateRouteMapForActivity(activityId);
    const asset = await sanityClient.assets.upload(
      "image",
      generatedMap.pngBuffer,
      {
        filename: `strava-route-${activityId}.png`,
        contentType: "image/png",
        title: `Strava Route ${activityId}`,
        source: {
          id: activityId,
          name: "strava",
          url: `https://www.strava.com/activities/${activityId}`,
        },
      },
    );

    await sanityClient
      .patch(post._id)
      .set({
        stravaActivityId: activityId,
        routeMapImage: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
          alt: `Route map for ${post.title || `Strava activity ${activityId}`}`,
        },
        routeMapStatus: "ready",
        routeMapGeneratedAt: generatedMap.generatedAt,
      })
      .unset(["routeMapError"])
      .commit({ tag: "strava.route-map.ready" });

    return NextResponse.json({
      ok: true,
      activityId,
      assetId: asset._id,
      generatedAt: generatedMap.generatedAt,
    });
  } catch (error) {
    const message = toErrorMessage(error);

    try {
      if (failureDocumentId && !failureDocumentId.startsWith("drafts.")) {
        const sanityClient = getSanityWriteClient();

        await sanityClient
          .patch(failureDocumentId)
          .set({
            routeMapStatus: "failed",
            routeMapError: message.slice(0, 1800),
            routeMapGeneratedAt: new Date().toISOString(),
          })
          .commit({ tag: "strava.route-map.failed" });
      }
    } catch {
      // Keep the original error visible in the API response.
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
