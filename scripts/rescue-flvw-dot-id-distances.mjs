import { createClient } from "@sanity/client";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const DRY_RUN = process.argv.includes("--dry-run");

function createSanityClient() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-18";
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId) {
    throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID fehlt in .env.local oder in Vercel.");
  }

  if (!token) {
    throw new Error("SANITY_API_WRITE_TOKEN fehlt in .env.local oder in Vercel.");
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn: false,
  });
}

function cleanText(value) {
  return String(value || "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatGermanNumber(value, maxDecimals = 2) {
  const rounded = Number(value.toFixed(maxDecimals));
  return String(rounded).replace(".", ",");
}

function formatDistanceFromMeters(meters) {
  if (!Number.isFinite(meters) || meters <= 0) return "";

  const roundedMeters = Math.round(meters);

  if (roundedMeters < 1000) {
    return `${roundedMeters} m`;
  }

  const km = roundedMeters / 1000;
  const decimals = km < 10 ? 2 : 1;

  return `${formatGermanNumber(km, decimals)} km`;
}

function distanceToMeters(rawDistance) {
  const raw = cleanText(rawDistance)
    .toLowerCase()
    .replace(",", ".");

  const match = raw.match(/(\d+(?:\.\d+)?)\s*(km|m)\b/i);

  if (!match) return null;

  const value = Number(match[1]);
  const unit = match[2];

  if (!Number.isFinite(value) || value <= 0) return null;

  if (unit === "m") {
    return value;
  }

  // FLVW-Datenfehler: Werte wie 7250 km, 4950 km, 850 km usw. sind fast immer Meter.
  if (value >= 400) {
    return value;
  }

  return value * 1000;
}

function normalizeDistanceList(distances) {
  const byMeterKey = new Map();

  (distances || []).forEach((distance) => {
    const meters = distanceToMeters(distance);

    if (meters === null) return;

    const key = Math.round(meters);
    const label = formatDistanceFromMeters(meters);

    if (!label || byMeterKey.has(key)) return;

    byMeterKey.set(key, {
      meters: key,
      label,
    });
  });

  return Array.from(byMeterKey.values())
    .sort((first, second) => second.meters - first.meters)
    .map((distance) => distance.label);
}

function arraysEqual(first, second) {
  if (first.length !== second.length) return false;

  return first.every((value, index) => value === second[index]);
}

async function main() {
  const client = createSanityClient();

  const oldDocs = await client.fetch(`*[
    _type == "importedFlvwEvent" &&
    _id in path("importedFlvwEvent.flvw.*")
  ]{
    _id,
    title,
    sourceId,
    distances
  }`);

  console.log(`${oldDocs.length} alte Punkt-ID-Dokumente gefunden.`);

  let changed = 0;
  let unchanged = 0;
  let missingNewDoc = 0;

  for (const oldDoc of oldDocs) {
    if (!oldDoc.sourceId) {
      console.log(`[SKIP] ${oldDoc._id} hat keine sourceId.`);
      continue;
    }

    const newId = `importedFlvwEvent-flvw-${oldDoc.sourceId}`;

    const newDoc = await client.fetch(
      `*[_id == $newId][0]{
        _id,
        title,
        sourceId,
        distances
      }`,
      { newId }
    );

    if (!newDoc?._id) {
      missingNewDoc += 1;
      console.log(`[FEHLT] ${newId} existiert nicht. Quelle alt: ${oldDoc.title}`);
      continue;
    }

    const currentDistances = normalizeDistanceList(newDoc.distances || []);
    const rescuedDistances = normalizeDistanceList([
      ...(newDoc.distances || []),
      ...(oldDoc.distances || []),
    ]);

    if (rescuedDistances.length === 0 || arraysEqual(currentDistances, rescuedDistances)) {
      unchanged += 1;
      continue;
    }

    changed += 1;

    console.log(
      `[${DRY_RUN ? "DRY" : "OK"}] ${newDoc.title || oldDoc.title} · ${newId}`
    );
    console.log(`  vorher: ${currentDistances.length ? currentDistances.join(" · ") : "leer"}`);
    console.log(`  nachher: ${rescuedDistances.join(" · ")}`);

    if (!DRY_RUN) {
      await client
        .patch(newId)
        .set({
          distances: rescuedDistances,
          lastSyncedAt: new Date().toISOString(),
        })
        .commit();
    }
  }

  console.log("");
  console.log(`${changed} neue Dokumente ${DRY_RUN ? "würden aktualisiert" : "wurden aktualisiert"}.`);
  console.log(`${unchanged} neue Dokumente bleiben unverändert.`);
  console.log(`${missingNewDoc} neue Dokumente fehlen.`);
  console.log("");

  if (DRY_RUN) {
    console.log("Dry Run fertig. Wenn alles gut aussieht, ausführen ohne --dry-run:");
    console.log("node scripts/rescue-flvw-dot-id-distances.mjs");
  } else {
    console.log("Rettung fertig. Bitte in Sanity Vision prüfen, danach erst alte Punkt-IDs löschen.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
