import dotenv from "dotenv";
import { createClient } from "@sanity/client";
import { generateRouteMapForActivity } from "./generate-route-map";

dotenv.config({ path: ".env.local" });

type SanityImageField = {
  asset?: {
    _ref?: string;
    _id?: string;
  } | null;
} | null;

type JournalPostWithRouteMap = {
  _id: string;
  title?: string;
  slug?: {
    current?: string;
  };
  stravaUrl?: string;
  stravaActivityUrl?: string;
  stravaActivityId?: string;
  routeMapImage?: SanityImageField;
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-05-11";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Bitte NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET und SANITY_API_WRITE_TOKEN setzen.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

function getStravaActivityIdFromUrl(url?: string | null) {
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

function getTargetActivityId(post: JournalPostWithRouteMap) {
  return (
    getStravaActivityIdFromUrl(post.stravaActivityUrl) ||
    getStravaActivityIdFromUrl(post.stravaUrl) ||
    normalizeActivityId(post.stravaActivityId)
  );
}

function hasImageAsset(image?: SanityImageField) {
  return Boolean(image?.asset?._ref || image?.asset?._id);
}

async function fetchJournalPostsWithStrava() {
  return client.fetch<JournalPostWithRouteMap[]>(`
    *[
      _type == "journalPost" &&
      !(_id in path("drafts.**")) &&
      (
        defined(stravaActivityUrl) ||
        defined(stravaUrl) ||
        defined(stravaActivityId)
      )
    ] | order(publishedAt desc) {
      _id,
      title,
      slug,
      stravaUrl,
      stravaActivityUrl,
      stravaActivityId,
      routeMapImage
    }
  `);
}

async function regeneratePostRouteMap(post: JournalPostWithRouteMap) {
  const activityId = getTargetActivityId(post);

  if (!activityId) {
    return {
      status: "skipped" as const,
      reason: "Keine gültige Strava Activity ID gefunden.",
    };
  }

  const previousAssetRef = post.routeMapImage?.asset?._ref;

  await client
    .patch(post._id)
    .set({
      stravaActivityId: activityId,
      routeMapStatus: "generating",
    })
    .unset(["routeMapError"])
    .commit({ tag: "strava.route-map.regenerate.generating" });

  const generatedMap = await generateRouteMapForActivity(activityId);
  const timestamp = generatedMap.generatedAt.replace(/[:.]/g, "-");
  const asset = await client.assets.upload("image", generatedMap.pngBuffer, {
    filename: `strava-route-${activityId}-${timestamp}.png`,
    contentType: "image/png",
    title: `Strava Route ${activityId}`,
    source: {
      id: `${activityId}-${timestamp}`,
      name: "strava",
      url: `https://www.strava.com/activities/${activityId}`,
    },
  });

  await client
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
    .commit({ tag: "strava.route-map.regenerate.ready" });

  return {
    status: "regenerated" as const,
    activityId,
    previousAssetRef,
    assetId: asset._id,
    hadExistingImage: hasImageAsset(post.routeMapImage),
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
  const limit = limitArg ? Number(limitArg.split("=")[1]) : null;

  if (limit !== null && (!Number.isInteger(limit) || limit <= 0)) {
    console.error("Bitte --limit als positive ganze Zahl angeben.");
    process.exit(1);
  }

  console.log("Suche veröffentlichte Journalposts mit Strava-Aktivität...");

  const posts = await fetchJournalPostsWithStrava();
  const postsToProcess = limit ? posts.slice(0, limit) : posts;

  if (postsToProcess.length === 0) {
    console.log("Keine passenden Journalposts gefunden.");
    return;
  }

  console.log(
    `${postsToProcess.length} von ${posts.length} Beitrag/Beiträgen werden ${
      dryRun ? "geprüft" : "neu generiert"
    }.`,
  );

  let regenerated = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of postsToProcess) {
    const activityId = getTargetActivityId(post);
    const label = `${post.title ?? post._id}${activityId ? ` (${activityId})` : ""}`;

    if (!activityId) {
      skipped += 1;
      console.warn(`Übersprungen: ${label} · keine gültige Strava Activity ID`);
      continue;
    }

    if (dryRun) {
      skipped += 1;
      console.log(
        `Dry run: ${label} · vorhandenes Bild: ${
          hasImageAsset(post.routeMapImage) ? "ja" : "nein"
        }`,
      );
      continue;
    }

    try {
      console.log("");
      console.log(`Regeneriere: ${label}`);
      const result = await regeneratePostRouteMap(post);

      if (result.status === "regenerated") {
        regenerated += 1;
        console.log(
          `Fertig: ${label} · neues Asset ${result.assetId}${
            result.previousAssetRef
              ? ` ersetzt ${result.previousAssetRef}`
              : ""
          }`,
        );
      } else {
        skipped += 1;
        console.warn(`Übersprungen: ${label} · ${result.reason}`);
      }
    } catch (error) {
      failed += 1;
      const message =
        error instanceof Error ? error.message : "Unbekannter Fehler";

      console.error(`Fehlgeschlagen: ${label} · ${message}`);

      await client
        .patch(post._id)
        .set({
          routeMapStatus: "failed",
          routeMapError: message.slice(0, 1800),
          routeMapGeneratedAt: new Date().toISOString(),
        })
        .commit({ tag: "strava.route-map.regenerate.failed" });
    }
  }

  console.log("");
  console.log(
    `Regeneration abgeschlossen: ${regenerated} neu erzeugt, ${skipped} übersprungen, ${failed} fehlgeschlagen.`,
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
