import { createClient } from "@sanity/client";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-18";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID fehlt in .env.local.");
}

if (!token) {
  throw new Error("SANITY_API_WRITE_TOKEN fehlt in .env.local.");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const SHOULD_DELETE = process.argv.includes("--delete");

function chunkArray(values, size) {
  const chunks = [];

  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size));
  }

  return chunks;
}

async function main() {
  const ids = await client.fetch(`*[
    _type == "importedFlvwEvent" &&
    (
      _id match "importedFlvwEvent.flvw.*" ||
      _id match "drafts.importedFlvwEvent.flvw.*"
    )
  ]._id`);

  console.log(`${ids.length} alte FLVW-Dokumente mit Punkt-ID gefunden.`);

  if (ids.length > 0) {
    console.log("Beispiele:");
    ids.slice(0, 10).forEach((id) => console.log(`- ${id}`));
  }

  if (!SHOULD_DELETE) {
    console.log("");
    console.log("Trockenlauf: Es wurde nichts gelöscht.");
    console.log("Zum echten Löschen ausführen:");
    console.log("node scripts/delete-old-flvw-dot-ids.mjs --delete");
    return;
  }

  for (const chunk of chunkArray(ids, 50)) {
    const transaction = client.transaction();

    chunk.forEach((id) => transaction.delete(id));

    await transaction.commit();
    console.log(`${chunk.length} alte Dokumente gelöscht.`);
  }

  console.log("Fertig. Alte Punkt-ID-Dokumente sind gelöscht.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
