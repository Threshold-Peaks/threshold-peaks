import { createClient } from "@sanity/client";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-05-18";
const token = process.env.SANITY_API_WRITE_TOKEN;

const SHOULD_DELETE = process.argv.includes("--delete");

if (!projectId) {
  throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID fehlt.");
}

if (!token) {
  throw new Error("SANITY_API_WRITE_TOKEN fehlt.");
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const oldDocs = await client.fetch(`
  *[_type == "importedFlvwEvent" && _id in path("importedFlvwEvent.flvw.*")]
  {
    _id,
    title,
    sourceId,
    distances
  }
`);

console.log(`${oldDocs.length} alte FLVW-Dokumente mit Punkt-ID gefunden.`);

oldDocs.slice(0, 20).forEach((doc) => {
  console.log(`- ${doc._id} · ${doc.title ?? ""} · ${doc.sourceId ?? ""}`);
});

if (!SHOULD_DELETE) {
  console.log("");
  console.log("Trockenlauf: Es wurde nichts gelöscht.");
  console.log("Zum echten Löschen ausführen:");
  console.log("node scripts/delete-flvw-dot-ids-path.mjs --delete");
  process.exit(0);
}

if (oldDocs.length === 0) {
  console.log("Nichts zu löschen.");
  process.exit(0);
}

const transaction = client.transaction();

oldDocs.forEach((doc) => {
  transaction.delete(doc._id);
});

await transaction.commit();

console.log(`${oldDocs.length} alte FLVW-Dokumente gelöscht.`);