import { createHash } from "crypto";
import { createClient } from "next-sanity";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LikeTargetType =
  | "journal"
  | "galleryAlbum"
  | "galleryImage"
  | "event"
  | "comment";

const allowedTargetTypes: LikeTargetType[] = [
  "journal",
  "galleryAlbum",
  "galleryImage",
  "event",
  "comment",
];

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  token,
  useCdn: false,
});

function isAllowedTargetType(value: string | null): value is LikeTargetType {
  return Boolean(value && allowedTargetTypes.includes(value as LikeTargetType));
}

function getLikeDocumentId(targetType: LikeTargetType, targetId: string) {
  const hash = createHash("sha256").update(targetId).digest("hex").slice(0, 32);

  return `likeCounter.${targetType}.${hash}`;
}

function createError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (!isAllowedTargetType(targetType)) {
    return createError("Ungültiger targetType.");
  }

  if (!targetId) {
    return createError("targetId fehlt.");
  }

  const documentId = getLikeDocumentId(targetType, targetId);

  const result = await sanityWriteClient.fetch<{ count?: number } | null>(
    `*[_id == $documentId][0]{count}`,
    { documentId }
  );

  return NextResponse.json({
    count: Math.max(0, result?.count ?? 0),
  });
}

export async function POST(request: Request) {
  if (!token) {
    return createError("Sanity Write Token fehlt.", 500);
  }

  const body = await request.json().catch(() => null);

  const targetType = body?.targetType;
  const targetId = body?.targetId;
  const action = body?.action;

  if (!isAllowedTargetType(targetType)) {
    return createError("Ungültiger targetType.");
  }

  if (!targetId || typeof targetId !== "string") {
    return createError("targetId fehlt.");
  }

  if (action !== "like" && action !== "unlike") {
    return createError("Ungültige Aktion.");
  }

  const documentId = getLikeDocumentId(targetType, targetId);
  const delta = action === "like" ? 1 : -1;

  await sanityWriteClient.createIfNotExists({
    _id: documentId,
    _type: "likeCounter",
    targetType,
    targetId,
    count: 0,
  });

  const updated = await sanityWriteClient
    .patch(documentId)
    .setIfMissing({ count: 0 })
    .inc({ count: delta })
    .commit<{ count?: number }>();

  const safeCount = Math.max(0, updated.count ?? 0);

  if ((updated.count ?? 0) < 0) {
    await sanityWriteClient.patch(documentId).set({ count: 0 }).commit();
  }

  return NextResponse.json({
    count: safeCount,
  });
}