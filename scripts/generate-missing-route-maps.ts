import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";
import { generateRouteMapFile } from "./generate-route-map";

dotenv.config({ path: ".env.local" });

type JournalPostWithStrava = {
  _id: string;
  title?: string;
  slug?: {
    current?: string;
  };
  stravaUrl?: string;
  stravaActivityUrl?: string;
  stravaActivityId?: string;
};

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-11";

if (!projectId) {
  console.error("NEXT_PUBLIC_SANITY_PROJECT_ID fehlt in .env.local.");
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
});

function getStravaActivityId(stravaUrl?: string) {
  if (!stravaUrl) return null;

  const match = stravaUrl.match(/strava\.com\/activities\/(\d+)/i);
  return match?.[1] ?? null;
}

function getPostStravaActivityId(post: JournalPostWithStrava) {
  if (post.stravaActivityId && /^\d+$/.test(post.stravaActivityId.trim())) {
    return post.stravaActivityId.trim();
  }

  return getStravaActivityId(post.stravaActivityUrl || post.stravaUrl);
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const force = process.argv.includes("--force");

  console.log("Suche Journalposts mit Strava-Link...");

  const posts = await client.fetch<JournalPostWithStrava[]>(`
    *[_type == "journalPost" && (defined(stravaUrl) || defined(stravaActivityUrl) || defined(stravaActivityId))] | order(publishedAt desc) {
      _id,
      title,
      slug,
      stravaUrl,
      stravaActivityUrl,
      stravaActivityId
    }
  `);

  const activityMap = new Map<
    string,
    {
      title?: string;
      slug?: string;
      stravaUrl?: string;
    }
  >();

  for (const post of posts) {
    const activityId = getPostStravaActivityId(post);

    if (!activityId) {
      console.warn(
        `Kein gültiger Strava-Link gefunden: ${post.title ?? post._id}`,
      );
      continue;
    }

    activityMap.set(activityId, {
      title: post.title,
      slug: post.slug?.current,
      stravaUrl: post.stravaActivityUrl || post.stravaUrl,
    });
  }

  const activities = Array.from(activityMap.entries());

  if (activities.length === 0) {
    console.log("Keine Strava-Aktivitäten gefunden.");
    return;
  }

  console.log(`Gefundene Strava-Aktivitäten: ${activities.length}`);

  const missingActivities: string[] = [];
  const existingActivities: string[] = [];

  for (const [activityId, post] of activities) {
    const mapPath = path.join(
      process.cwd(),
      "public",
      "images",
      "runs",
      `${activityId}-map.png`,
    );

    const exists = await fileExists(mapPath);

    if (exists && !force) {
      existingActivities.push(activityId);
      console.log(`Schon vorhanden: ${activityId} · ${post.title ?? ""}`);
      continue;
    }

    missingActivities.push(activityId);
    console.log(
      force
        ? `Wird neu erzeugt: ${activityId} · ${post.title ?? ""}`
        : `Fehlt noch: ${activityId} · ${post.title ?? ""}`,
    );
  }

  if (missingActivities.length === 0) {
    console.log("Alle Karten sind bereits vorhanden.");
    return;
  }

  console.log(`Erzeuge ${missingActivities.length} Karte(n)...`);

  for (const activityId of missingActivities) {
    console.log("");
    console.log(`Starte Kartengenerierung für ${activityId}...`);
    await generateRouteMapFile(activityId);
  }

  console.log("");
  console.log("Fertig. Alle fehlenden Karten wurden erzeugt.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
