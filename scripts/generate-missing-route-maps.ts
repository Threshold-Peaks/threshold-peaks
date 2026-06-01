import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";
import {
  createStravaActivityMetadata,
  generateRouteMapFile,
} from "./generate-route-map";

dotenv.config({ path: ".env.local" });

type SanityImageReference = {
  asset?: {
    _ref?: string;
    _id?: string;
    url?: string;
  } | null;
  alt?: string;
};

type JournalPostWithStrava = {
  _id: string;
  title?: string;
  slug?: {
    current?: string;
  };
  stravaUrl?: string;
  stravaActivityUrl?: string;
  stravaActivityId?: string;
  routeMapImage?: SanityImageReference | null;
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-11";
const sanityToken =
  process.env.SANITY_API_TOKEN ||
  process.env.SANITY_WRITE_TOKEN ||
  process.env.SANITY_TOKEN;

if (!projectId) {
  console.error("NEXT_PUBLIC_SANITY_PROJECT_ID fehlt in .env.local.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token: sanityToken,
  useCdn: false,
});

function getStravaActivityId(stravaUrl?: string) {
  if (!stravaUrl) return null;

  const directMatch = stravaUrl.match(/strava\.com\/activities\/(\d+)/i);
  if (directMatch?.[1]) return directMatch[1];

  try {
    const parsedUrl = new URL(stravaUrl);
    const pathMatch = parsedUrl.pathname.match(/\/activities\/(\d+)/i);
    return pathMatch?.[1] ?? null;
  } catch {
    return null;
  }
}

function getPostStravaActivityId(post: JournalPostWithStrava) {
  if (post.stravaActivityId && /^\d+$/.test(post.stravaActivityId.trim())) {
    return post.stravaActivityId.trim();
  }

  return getStravaActivityId(post.stravaActivityUrl || post.stravaUrl);
}

function hasSanityRouteMapImage(post: JournalPostWithStrava) {
  const asset = post.routeMapImage?.asset;
  return Boolean(asset?._ref || asset?._id || asset?.url);
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function getRouteMapPath(activityId: string) {
  return path.join(
    process.cwd(),
    "public",
    "images",
    "runs",
    `${activityId}-map.png`,
  );
}

async function uploadGeneratedRouteMapToSanity(
  post: JournalPostWithStrava,
  activityId: string,
  generated: Awaited<ReturnType<typeof generateRouteMapFile>>,
) {
  if (!sanityToken) {
    throw new Error(
      "SANITY_API_TOKEN fehlt in .env.local. Ohne Schreib-Token kann die Karte nicht nach Sanity hochgeladen werden.",
    );
  }

  const metadata = createStravaActivityMetadata(
    activityId,
    generated.activity,
    generated.generatedAt,
  );

  const routeMapImage = {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: "",
    },
    alt: `Karte der Laufroute ${metadata.title}`,
  };

  const asset = await client.assets.upload("image", generated.pngBuffer, {
    filename: `${activityId}-map.png`,
    contentType: "image/png",
    title: `Route Map ${activityId} · ${metadata.title}`,
  });

  routeMapImage.asset._ref = asset._id;

  await client
    .patch(post._id)
    .set({
      stravaActivityId: activityId,
      routeMapImage,
      routeMapStatus: "generated",
      routeMapGeneratedAt: generated.generatedAt,
      stravaActivity: {
        title: metadata.title,
        sportType: metadata.sportType,
        dateLabel: metadata.dateLabel,
        distance: metadata.distance,
        elevation: metadata.elevation,
        duration: metadata.duration,
        kudos: metadata.kudos ?? 0,
        mapImage: routeMapImage,
      },
    })
    .commit();

  return asset._id;
}

async function main() {
  const force = process.argv.includes("--force");
  const dryRun = process.argv.includes("--dry-run");

  if (!sanityToken && !dryRun) {
    console.warn(
      "SANITY_API_TOKEN fehlt. Die Karten können lokal erzeugt werden, aber Sanity wird nicht aktualisiert.",
    );
  }

  console.log("Suche Journalposts mit Strava-Link oder Strava Activity ID...");

  const posts = await client.fetch<JournalPostWithStrava[]>(`
    *[_type == "journalPost" && (defined(stravaUrl) || defined(stravaActivityUrl) || defined(stravaActivityId))] | order(publishedAt desc) {
      _id,
      title,
      slug,
      stravaUrl,
      stravaActivityUrl,
      stravaActivityId,
      routeMapImage{
        ...,
        alt,
        asset->{
          _id,
          url
        }
      }
    }
  `);

  if (posts.length === 0) {
    console.log("Keine Strava-Aktivitäten gefunden.");
    return;
  }

  console.log(`Gefundene Journalposts mit Strava-Bezug: ${posts.length}`);

  let skipped = 0;
  let generatedCount = 0;
  let uploadedCount = 0;

  for (const post of posts) {
    const activityId = getPostStravaActivityId(post);

    if (!activityId) {
      console.warn(
        `Kein gültiger Strava-Link gefunden: ${post.title ?? post._id}`,
      );
      skipped += 1;
      continue;
    }

    const localMapPath = getRouteMapPath(activityId);
    const hasLocalMap = await fileExists(localMapPath);
    const hasSanityMap = hasSanityRouteMapImage(post);
    const needsWork = force || !hasSanityMap || !hasLocalMap;

    if (!needsWork) {
      console.log(
        `OK: ${activityId} · ${post.title ?? ""} · lokale Datei und Sanity-Bild vorhanden`,
      );
      skipped += 1;
      continue;
    }

    console.log("");
    console.log(
      `${force ? "Erzeuge neu" : "Erzeuge/aktualisiere"}: ${activityId} · ${post.title ?? ""}`,
    );

    if (dryRun) {
      console.log(
        `Dry Run: lokal=${hasLocalMap ? "ja" : "nein"}, Sanity=${hasSanityMap ? "ja" : "nein"}`,
      );
      continue;
    }

    const generated = await generateRouteMapFile(activityId);
    generatedCount += 1;

    try {
      const assetId = await uploadGeneratedRouteMapToSanity(
        post,
        activityId,
        generated,
      );
      uploadedCount += 1;
      console.log(`Sanity aktualisiert: ${assetId}`);
    } catch (error) {
      console.warn(
        `Sanity-Upload/Patch fehlgeschlagen für ${activityId}: ${String(error)}`,
      );
    }
  }

  console.log("");
  console.log("Fertig.");
  console.log(`Erzeugt: ${generatedCount}`);
  console.log(`Nach Sanity hochgeladen: ${uploadedCount}`);
  console.log(`Übersprungen: ${skipped}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
